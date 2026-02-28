import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Initialize Supabase client with Service Role Key for elevated privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Aragorn AI Edge Ingestion Endpoint
 * 
 * This API is used by on-site edge devices to report detections, 
 * progress updates, and material verifications in real-time.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { siteId, zoneId, type, payload } = body;

    if (!siteId || !type || !payload) {
      return NextResponse.json({ error: 'Missing required fields: siteId, type, payload' }, { status: 400 });
    }

    console.log(`[AragornEdge] Ingesting ${type} for Site:${siteId} Zone:${zoneId || 'Global'}`);

    // 1. Handle PPE Violations / Safety Detections
    if (type === 'PPE' || type === 'SAFETY') {
      const { violation, severity, details, confidence } = payload;
      
      if (violation || type === 'SAFETY') {
        // Log to Detections Table
        const { data: detection, error: detError } = await supabase.from('detections').insert({
          zone_id: zoneId,
          type: type === 'PPE' ? 'ppe_violation' : 'hazard',
          severity: severity || 'high',
          details: { 
            issue: details || violation, 
            confidence: confidence || 0.95,
            source: 'AragornEdgeNode' 
          }
        }).select().single();

        if (detError) throw detError;

        // Trigger an Alert if severity is high
        if (severity === 'high' || !severity) {
          await supabase.from('alerts').insert({
            site_id: siteId,
            zone_id: zoneId,
            type: 'safety',
            severity: severity || 'high',
            message: `${type === 'PPE' ? 'PPE Violation' : 'Safety Hazard'} detected: ${details || violation}`
          });
        }
      }
    } 
    
    // 2. Handle Progress Updates
    else if (type === 'PROGRESS') {
      const { progress_percent, zone_name } = payload;
      
      if (zoneId && progress_percent !== undefined) {
        const { error: progressError } = await supabase.from('zones')
          .update({ progress_percent: progress_percent })
          .eq('id', zoneId);
          
        if (progressError) throw progressError;

        // Optional: Create a low-severity alert for progress milestone
        if (progress_percent === 100) {
            await supabase.from('alerts').insert({
                site_id: siteId,
                zone_id: zoneId,
                type: 'progress',
                severity: 'low',
                message: `Zone Milestone: ${zone_name || 'Sector'} has reached 100% completion.`
            });
        }
      }
    } 
    
    // 3. Handle Material Verification
    else if (type === 'MATERIAL') {
      const { name, quantity, status, manifest_id } = payload;
      
      const { data: mat, error: matError } = await supabase.from('material_verifications').insert({
        site_id: siteId,
        material_name: name,
        quantity: quantity,
        status: status || 'verified'
      }).select().single();

      if (matError) throw matError;

      if (status === 'mismatch' || status === 'discrepant') {
        await supabase.from('alerts').insert({
          site_id: siteId,
          type: 'material',
          severity: 'medium',
          message: `Material Discrepancy: ${name} (${quantity}) - Manifest mismatch.`
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      id: siteId,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[AragornEdge] Ingestion Failed:', error.message);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
