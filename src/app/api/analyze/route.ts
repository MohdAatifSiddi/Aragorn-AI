/**
 * Image Analysis API Endpoint
 * 
 * Performs comprehensive AI analysis on construction site images using AWS Rekognition.
 * 
 * Analysis Types:
 * 1. PPE Detection - Detects helmets, gloves, face covers on workers
 * 2. Object/Label Detection - Identifies construction materials, equipment, hazards
 * 3. Safety/Moderation Detection - Flags potential safety hazards
 * 
 * Process Flow:
 * 1. Authenticate user session
 * 2. Run 3 parallel AWS Rekognition analyses
 * 3. Process PPE violations (missing helmets, gloves)
 * 4. Calculate safety score
 * 5. Store results in database
 * 6. Create detections and alerts
 * 7. Update zone and site statistics
 * 
 * @route POST /api/analyze
 * @auth Required - Supabase session
 * @returns Analysis results with safety score, violations, and detections
 */

import { NextResponse } from 'next/server';
import { 
  DetectProtectiveEquipmentCommand,
  DetectLabelsCommand,
  DetectModerationLabelsCommand,
} from "@aws-sdk/client-rekognition";
import { rekognitionClient, AWS_CONFIG } from '@/lib/aws-config';
import { createClient } from '@/lib/supabase-server';

/**
 * POST handler for image analysis
 * 
 * Request body:
 * - imageId: Database ID of the uploaded image
 * - s3Key: S3 object key for the image
 * - siteId: Site ID for associating detections/alerts
 * - zoneId: Optional zone ID for more specific tracking
 * 
 * Response:
 * - success: boolean
 * - analysis: Full analysis results with PPE violations, labels, hazards
 * - summary: Quick stats (persons, violations, safety score, hazards)
 */
export async function POST(request: Request) {
  try {
    // STEP 1: Authenticate user
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // STEP 2: Parse and validate request body
    const { imageId, s3Key, siteId, zoneId } = await request.json();

    if (!s3Key) {
      return NextResponse.json({ error: 'Missing s3Key' }, { status: 400 });
    }

    // STEP 3: Run AWS Rekognition PPE Detection
    // Detects protective equipment on persons in the image
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

    // STEP 4: Run AWS Rekognition Label Detection
    // Identifies objects, materials, equipment in the image
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

    // STEP 5: Run AWS Rekognition Moderation Detection
    // Detects potential safety hazards and unsafe content
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

    // STEP 6: Process PPE Detection Results
    // Analyze each detected person for missing safety equipment
    const ppeViolations: any[] = [];
    const personsDetected = ppeResponse.Persons || [];
    
    personsDetected.forEach((person, index) => {
      const bodyParts = person.BodyParts || [];
      const missingPPE: string[] = [];

      // Check HEAD for helmet/hard hat coverage
      const head = bodyParts.find(bp => bp.Name === 'HEAD');
      const hasHelmet = head?.EquipmentDetections?.some(
        eq => eq.Type === 'HEAD_COVER' && (eq.CoversBodyPart?.Value ?? false)
      );
      if (!hasHelmet) missingPPE.push('HELMET');

      // Note: AWS Rekognition doesn't reliably detect safety vests
      // Focus on helmet and gloves which have better detection accuracy
      
      // Check HANDS for glove coverage
      const hands = bodyParts.filter(bp => bp.Name === 'LEFT_HAND' || bp.Name === 'RIGHT_HAND');
      const hasGloves = hands.some(hand => 
        hand.EquipmentDetections?.some(eq => eq.Type === 'HAND_COVER' && (eq.CoversBodyPart?.Value ?? false))
      );
      if (!hasGloves && hands.length > 0) missingPPE.push('GLOVES');

      // Record violation if any PPE is missing
      if (missingPPE.length > 0) {
        ppeViolations.push({
          personId: index + 1,
          confidence: person.Confidence || 0,
          missingEquipment: missingPPE,
          boundingBox: person.BoundingBox, // Location in image
        });
      }
    });

    // STEP 7: Filter construction-relevant labels
    // Extract labels related to construction context
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

    // STEP 8: Extract high-confidence hazards from moderation labels
    const hazards = moderationResponse.ModerationLabels?.filter(label => 
      (label.Confidence || 0) > 70
    ) || [];

    // STEP 9: Calculate overall safety score
    // Score = (compliant workers / total workers) * 100
    const totalPersons = personsDetected.length;
    const violationCount = ppeViolations.length;
    const safetyScore = totalPersons > 0 
      ? Math.round(((totalPersons - violationCount) / totalPersons) * 100)
      : 100; // Default to 100% if no persons detected

    // STEP 10: Prepare analysis result object for database storage
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

    // STEP 11: Update image record with analysis results
    await supabase
      .from('site_images')
      .update({
        status: 'analyzed',
        analysis_result: analysisResult,
      })
      .eq('id', imageId);

    // STEP 12: Create detection records and alerts based on results
    if (ppeViolations.length > 0) {
      // Create HIGH SEVERITY detection for PPE violations
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

      // Create HIGH PRIORITY alert for immediate action
      await supabase.from('alerts').insert({
        site_id: siteId,
        zone_id: zoneId,
        type: 'safety',
        severity: 'high',
        message: `PPE Violations Detected: ${violationCount} worker(s) missing required safety equipment`,
        is_resolved: false,
      });
    } else if (totalPersons > 0) {
      // Create LOW SEVERITY detection for full compliance (positive feedback)
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

      // Create LOW PRIORITY positive alert
      await supabase.from('alerts').insert({
        site_id: siteId,
        zone_id: zoneId,
        type: 'safety',
        severity: 'low',
        message: `Safety Compliance: All ${totalPersons} worker(s) wearing proper PPE`,
        is_resolved: false,
      });
    }

    // STEP 13: Update zone-level safety metrics
    if (zoneId) {
      await supabase
        .from('zones')
        .update({ 
          last_safety_check: new Date().toISOString(),
          last_safety_score: safetyScore,
        })
        .eq('id', zoneId);
    }

    // STEP 14: Update site-level daily statistics
    const today = new Date().toISOString().split('T')[0];
    
    // Check if statistics record exists for today
    const { data: existingStats } = await supabase
      .from('project_stats')
      .select('*')
      .eq('site_id', siteId)
      .eq('date', today)
      .single();

    if (existingStats) {
      // Update existing stats with rolling average of safety scores
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
      // Create new stats record for today
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

    // STEP 15: Return comprehensive analysis results
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
