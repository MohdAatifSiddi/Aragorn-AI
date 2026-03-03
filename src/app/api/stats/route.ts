/**
 * Statistics API Endpoint
 * 
 * Provides real-time aggregated statistics for a construction site.
 * 
 * Data Sources:
 * - site_images: Total analyzed images
 * - detections: PPE violations and compliance records
 * - alerts: Active safety alerts
 * - analysis_result: Person counts and violation details
 * 
 * Metrics Returned:
 * - Total images analyzed
 * - Total detections (violations + compliant)
 * - Active high-severity alerts
 * - Overall safety score
 * - Total persons detected across all images
 * - Total PPE violations
 * - Last analysis timestamp
 * 
 * @route GET /api/stats?siteId={siteId}
 * @auth Required - Supabase session
 * @returns Aggregated site statistics
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

/**
 * GET handler for site statistics
 * 
 * Query parameters:
 * - siteId: Required site ID to fetch stats for
 * 
 * Response:
 * - success: boolean
 * - stats: Object containing all aggregated metrics
 */
export async function GET(request: Request) {
  try {
    // STEP 1: Authenticate user
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // STEP 2: Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');

    if (!siteId) {
      return NextResponse.json({ error: 'Missing siteId' }, { status: 400 });
    }

    // STEP 3: Fetch total analyzed images count
    const { count: totalImages } = await supabase
      .from('site_images')
      .select('*', { count: 'exact', head: true })
      .eq('site_id', siteId)
      .eq('status', 'analyzed');

    // STEP 4: Fetch all detections for the site (via zones join)
    const { data: detections } = await supabase
      .from('detections')
      .select('*, zones!inner(site_id)')
      .eq('zones.site_id', siteId);

    // STEP 5: Fetch active (unresolved) alerts
    const { data: activeAlerts } = await supabase
      .from('alerts')
      .select('*')
      .eq('site_id', siteId)
      .eq('is_resolved', false);

    // STEP 6: Calculate detection statistics
    const totalDetections = detections?.length || 0;
    const violations = detections?.filter(d => d.type === 'ppe_violation').length || 0;
    const compliant = detections?.filter(d => d.type === 'ppe_compliant').length || 0;
    const highAlerts = activeAlerts?.filter(a => a.severity === 'high').length || 0;

    // STEP 7: Calculate overall safety score
    // Score = (compliant detections / total detections) * 100
    const overallSafetyScore = totalDetections > 0
      ? Math.round((compliant / totalDetections) * 100)
      : 100; // Default to 100% if no detections yet

    // STEP 8: Fetch recent analysis results for person/violation aggregation
    const { data: recentImages } = await supabase
      .from('site_images')
      .select('analysis_result, created_at')
      .eq('site_id', siteId)
      .eq('status', 'analyzed')
      .order('created_at', { ascending: false })
      .limit(10); // Last 10 analyzed images

    // STEP 9: Aggregate person counts and violations from analysis results
    let totalPersonsDetected = 0;
    let totalViolations = 0;
    
    recentImages?.forEach(img => {
      if (img.analysis_result) {
        totalPersonsDetected += img.analysis_result.persons_detected || 0;
        totalViolations += img.analysis_result.ppe_violations?.length || 0;
      }
    });

    // STEP 10: Return comprehensive statistics
      success: true,
      stats: {
        totalImages: totalImages || 0,
        totalDetections,
        violations,
        compliant,
        highAlerts,
        overallSafetyScore,
        totalPersonsDetected,
        totalViolations,
        lastAnalyzed: recentImages?.[0]?.created_at || null,
      },
    });

  } catch (error: any) {
    console.error('Stats error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch stats' 
    }, { status: 500 });
  }
}
