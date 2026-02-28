import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Use service role for server-side ingestion

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Aragorn AI Edge Ingestion Endpoint
 * Handles metadata from edge devices (PPE detection, Progress tracking, Material Verification)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { siteId, zoneId, type, payload } = body;

    console.log(`[EdgeIngest] Received ${type} for site ${siteId} / zone ${zoneId}`);

    if (type === 'PPE') {
      const { violation, severity, details } = payload;
      if (violation) {
        // 1. Log Detection
        await supabase.from('detections').insert({
          zone_id: zoneId,
          type: 'ppe_violation',
          severity: severity || 'high',
          details: { issue: details, timestamp: new Date().toISOString() }
        });

        // 2. Create Alert
        await supabase.from('alerts').insert({
          site_id: siteId,
          type: 'safety',
          message: `PPE Violation in ${zoneId}: ${details}`,
          severity: severity || 'high'
        });
      }
    } else if (type === 'Progress') {
      const { progress } = payload;
      // Update Zone Progress
      await supabase.from('zones')
        .update({ progress_percent: progress })
        .eq('id', zoneId);
        
      // Also potentially update project stats or log progress history
    } else if (type === 'Material') {
      const { name, quantity, status } = payload;
      await supabase.from('material_verifications').insert({
        site_id: siteId,
        material_name: name,
        quantity: quantity,
        status: status || 'pending'
      });

      if (status === 'mismatch') {
        await supabase.from('alerts').insert({
          site_id: siteId,
          type: 'material',
          message: `Material Mismatch: ${name} (${quantity})`,
          severity: 'medium'
        });
      }
    }

    return NextResponse.json({ 
      status: 'success', 
      received_at: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[EdgeIngest] Error:', error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 400 });
  }
}
