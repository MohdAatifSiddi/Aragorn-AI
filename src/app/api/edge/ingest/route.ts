/**
 * Edge Device Ingestion API Endpoint
 * 
 * Receives real-time data from on-site edge devices (cameras, sensors, IoT nodes).
 * This endpoint is designed for high-frequency updates from edge hardware.
 * 
 * Supported Event Types:
 * 1. PPE/SAFETY - Worker safety violations and hazard detection
 * 2. PROGRESS - Zone completion percentage updates
 * 3. MATERIAL - Material verification and inventory tracking
 * 
 * Security:
 * - Uses Supabase Service Role Key for elevated database access
 * - Should be called from authenticated edge devices only
 * - Consider adding API key authentication for production
 * 
 * @route POST /api/edge/ingest
 * @auth Service Role (edge devices)
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Initialize Supabase client with Service Role Key for elevated privileges
// This bypasses Row Level Security (RLS) policies for edge device operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST handler for edge device data ingestion
 * 
 * Request body:
 * - siteId: Site identifier (required)
 * - zoneId: Zone identifier (optional, for zone-specific events)
 * - type: Event type - 'PPE', 'SAFETY', 'PROGRESS', or 'MATERIAL' (required)
 * - payload: Event-specific data object (required)
 * 
 * Response:
 * - success: boolean
 * - id: Site ID that was processed
 * - timestamp: ISO timestamp of processing
 */
export async function POST(request: Request) {
  try {
    // STEP 1: Parse and validate request body
    const body = await request.json();
    const { siteId, zoneId, type, payload } = body;

    if (!siteId || !type || !payload) {
      return NextResponse.json({ error: 'Missing required fields: siteId, type, payload' }, { status: 400 });
    }

    console.log(`[AragornEdge] Ingesting ${type} for Site:${siteId} Zone:${zoneId || 'Global'}`);

    // STEP 2: Handle PPE Violations / Safety Detections
    if (type === 'PPE' || type === 'SAFETY') {
      const { violation, severity, details, confidence } = payload;
      
      if (violation || type === 'SAFETY') {
        // Create detection record in database
        const { data: detection, error: detError } = await supabase.from('detections').insert({
          zone_id: zoneId,
          type: type === 'PPE' ? 'ppe_violation' : 'hazard',
          severity: severity || 'high',
          details: { 
            issue: details || violation, 
            confidence: confidence || 0.95,
            source: 'AragornEdgeNode' // Identifies source as edge device
          }
        }).select().single();

        if (detError) throw detError;

        // Create high-severity alert for immediate notification
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
    
    // STEP 3: Handle Progress Updates
    else if (type === 'PROGRESS') {
      const { progress_percent, zone_name } = payload;
      
      if (zoneId && progress_percent !== undefined) {
        // Update zone progress percentage
        const { error: progressError } = await supabase.from('zones')
          .update({ progress_percent: progress_percent })
          .eq('id', zoneId);
          
        if (progressError) throw progressError;

        // Create milestone alert when zone reaches 100% completion
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
    
    // STEP 4: Handle Material Verification
    else if (type === 'MATERIAL') {
      const { name, quantity, status, manifest_id } = payload;
      
      // Create material verification record
      const { data: mat, error: matError } = await supabase.from('material_verifications').insert({
        site_id: siteId,
        material_name: name,
        quantity: quantity,
        status: status || 'verified'
      }).select().single();

      if (matError) throw matError;

      // Create alert if material status indicates discrepancy
      if (status === 'mismatch' || status === 'discrepant') {
        await supabase.from('alerts').insert({
          site_id: siteId,
          type: 'material',
          severity: 'medium',
          message: `Material Discrepancy: ${name} (${quantity}) - Manifest mismatch.`
        });
      }
    }

    // STEP 5: Return success response with timestamp
    return NextResponse.json({ 
      success: true, 
      id: siteId,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    // Log and return error
    console.error('[AragornEdge] Ingestion Failed:', error.message);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
