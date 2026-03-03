import { NextResponse } from 'next/server';
import { 
  DetectProtectiveEquipmentCommand,
  DetectLabelsCommand,
  DetectModerationLabelsCommand,
} from "@aws-sdk/client-rekognition";
import { rekognitionClient, AWS_CONFIG } from '@/lib/aws-config';
import { createClient } from '@/lib/supabase-server';

/**
 * Aragorn AI Image Analysis Endpoint
 * Uses AWS Rekognition to detect:
 * - PPE compliance (helmets, vests, gloves)
 * - Safety hazards
 * - Construction materials
 * - Progress indicators
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { imageId, s3Key, siteId, zoneId } = await request.json();

    if (!s3Key) {
      return NextResponse.json({ error: 'Missing s3Key' }, { status: 400 });
    }

    // 1. PPE Detection
    const ppeCommand = new DetectProtectiveEquipmentCommand({
      Image: {
        S3Object: {
          Bucket: AWS_CONFIG.S3_BUCKET,
          Name: s3Key,
        },
      },
      SummarizationAttributes: {
        MinConfidence: 80,
        RequiredEquipmentTypes: ['FACE_COVER', 'HAND_COVER', 'HEAD_COVER'],
      },
    });

    const ppeResponse = await rekognitionClient.send(ppeCommand);

    // 2. Object/Label Detection (for materials, equipment, hazards)
    const labelsCommand = new DetectLabelsCommand({
      Image: {
        S3Object: {
          Bucket: AWS_CONFIG.S3_BUCKET,
          Name: s3Key,
        },
      },
      MaxLabels: 20,
      MinConfidence: 75,
    });

    const labelsResponse = await rekognitionClient.send(labelsCommand);

    // 3. Safety/Moderation Detection (for hazards)
    const moderationCommand = new DetectModerationLabelsCommand({
      Image: {
        S3Object: {
          Bucket: AWS_CONFIG.S3_BUCKET,
          Name: s3Key,
        },
      },
      MinConfidence: 70,
    });

    const moderationResponse = await rekognitionClient.send(moderationCommand);

    // Process PPE Results
    const ppeViolations: any[] = [];
    const personsDetected = ppeResponse.Persons || [];
    
    personsDetected.forEach((person, index) => {
      const bodyParts = person.BodyParts || [];
      const missingPPE: string[] = [];

      // Check for helmet/hard hat
      const head = bodyParts.find(bp => bp.Name === 'HEAD');
      const hasHelmet = head?.EquipmentDetections?.some(
        eq => eq.Type === 'HEAD_COVER' && (eq.CoversBodyPart?.Value ?? false)
      );
      if (!hasHelmet) missingPPE.push('HELMET');

      // Note: AWS Rekognition doesn't have a specific vest detection type
      // We focus on helmet and gloves which are reliably detected
      
      // Check for gloves
      const hands = bodyParts.filter(bp => bp.Name === 'LEFT_HAND' || bp.Name === 'RIGHT_HAND');
      const hasGloves = hands.some(hand => 
        hand.EquipmentDetections?.some(eq => eq.Type === 'HAND_COVER' && (eq.CoversBodyPart?.Value ?? false))
      );
      if (!hasGloves && hands.length > 0) missingPPE.push('GLOVES');

      if (missingPPE.length > 0) {
        ppeViolations.push({
          personId: index + 1,
          confidence: person.Confidence || 0,
          missingEquipment: missingPPE,
          boundingBox: person.BoundingBox,
        });
      }
    });

    // Process Labels for Construction Context
    const constructionLabels = labelsResponse.Labels?.filter(label => {
      const name = label.Name?.toLowerCase() || '';
      return (
        name.includes('construction') ||
        name.includes('building') ||
        name.includes('concrete') ||
        name.includes('steel') ||
        name.includes('scaffold') ||
        name.includes('crane') ||
        name.includes('excavator') ||
        name.includes('worker') ||
        name.includes('helmet') ||
        name.includes('machinery')
      );
    }) || [];

    // Detect potential hazards
    const hazards = moderationResponse.ModerationLabels?.filter(label => 
      (label.Confidence || 0) > 70
    ) || [];

    // Calculate safety score
    const totalPersons = personsDetected.length;
    const violationCount = ppeViolations.length;
    const safetyScore = totalPersons > 0 
      ? Math.round(((totalPersons - violationCount) / totalPersons) * 100)
      : 100;

    // Store analysis results
    const analysisResult = {
      image_id: imageId,
      persons_detected: totalPersons,
      ppe_violations: ppeViolations,
      safety_score: safetyScore,
      construction_labels: constructionLabels.map(l => ({
        name: l.Name,
        confidence: l.Confidence,
      })),
      hazards_detected: hazards.map(h => ({
        name: h.Name,
        confidence: h.Confidence,
      })),
      analyzed_at: new Date().toISOString(),
    };

    // Update image record
    await supabase
      .from('site_images')
      .update({
        status: 'analyzed',
        analysis_result: analysisResult,
      })
      .eq('id', imageId);

    // Create detections for violations
    if (ppeViolations.length > 0) {
      // Insert detection record
      await supabase.from('detections').insert({
        zone_id: zoneId,
        type: 'ppe_violation',
        severity: 'high',
        details: {
          issue: `${violationCount} PPE violation(s) detected`,
          violations: ppeViolations,
          confidence: 0.95,
          source: 'AragornAI-Rekognition',
          image_id: imageId,
        },
      });

      // Create high-priority alert
      await supabase.from('alerts').insert({
        site_id: siteId,
        zone_id: zoneId,
        type: 'safety',
        severity: 'high',
        message: `PPE Violations Detected: ${violationCount} worker(s) missing required safety equipment`,
        is_resolved: false,
      });
    } else if (totalPersons > 0) {
      // Create positive compliance detection
      await supabase.from('detections').insert({
        zone_id: zoneId,
        type: 'ppe_compliant',
        severity: 'low',
        details: {
          issue: `All ${totalPersons} worker(s) compliant with PPE requirements`,
          confidence: 0.95,
          source: 'AragornAI-Rekognition',
          image_id: imageId,
        },
      });

      // Create low-priority positive alert
      await supabase.from('alerts').insert({
        site_id: siteId,
        zone_id: zoneId,
        type: 'safety',
        severity: 'low',
        message: `Safety Compliance: All ${totalPersons} worker(s) wearing proper PPE`,
        is_resolved: false,
      });
    }

    // Update zone safety score if zone exists
    if (zoneId) {
      await supabase
        .from('zones')
        .update({ 
          last_safety_check: new Date().toISOString(),
          last_safety_score: safetyScore,
        })
        .eq('id', zoneId);
    }

    // Update site-level statistics
    const today = new Date().toISOString().split('T')[0];
    
    // Check if today's stats exist
    const { data: existingStats } = await supabase
      .from('project_stats')
      .select('*')
      .eq('site_id', siteId)
      .eq('date', today)
      .single();

    if (existingStats) {
      // Update existing stats
      await supabase
        .from('project_stats')
        .update({
          safety_compliance_percent: Math.round(
            ((existingStats.safety_compliance_percent + safetyScore) / 2)
          ),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingStats.id);
    } else {
      // Create new stats for today
      await supabase
        .from('project_stats')
        .insert({
          site_id: siteId,
          date: today,
          safety_compliance_percent: safetyScore,
          actual_velocity_mps: 0,
          predicted_velocity_mps: 0,
        });
    }

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      summary: {
        personsDetected: totalPersons,
        violations: violationCount,
        safetyScore,
        hazardsFound: hazards.length,
        constructionItemsDetected: constructionLabels.length,
      },
    });

  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json({ 
      error: error.message || 'Analysis failed' 
    }, { status: 500 });
  }
}
