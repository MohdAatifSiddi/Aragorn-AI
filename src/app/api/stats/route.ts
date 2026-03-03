import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

/**
 * Get real-time statistics for a site
 * This endpoint aggregates data from images, detections, and alerts
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');

    if (!siteId) {
      return NextResponse.json({ error: 'Missing siteId' }, { status: 400 });
    }

    // Get total images analyzed
    const { count: totalImages } = await supabase
      .from('site_images')
      .select('*', { count: 'exact', head: true })
      .eq('site_id', siteId)
      .eq('status', 'analyzed');

    // Get total detections
    const { data: detections } = await supabase
      .from('detections')
      .select('*, zones!inner(site_id)')
      .eq('zones.site_id', siteId);

    // Get active alerts
    const { data: activeAlerts } = await supabase
      .from('alerts')
      .select('*')
      .eq('site_id', siteId)
      .eq('is_resolved', false);

    // Calculate statistics
    const totalDetections = detections?.length || 0;
    const violations = detections?.filter(d => d.type === 'ppe_violation').length || 0;
    const compliant = detections?.filter(d => d.type === 'ppe_compliant').length || 0;
    const highAlerts = activeAlerts?.filter(a => a.severity === 'high').length || 0;

    // Calculate overall safety score
    const overallSafetyScore = totalDetections > 0
      ? Math.round((compliant / totalDetections) * 100)
      : 100;

    // Get recent analysis results
    const { data: recentImages } = await supabase
      .from('site_images')
      .select('analysis_result, created_at')
      .eq('site_id', siteId)
      .eq('status', 'analyzed')
      .order('created_at', { ascending: false })
      .limit(10);

    // Aggregate person counts
    let totalPersonsDetected = 0;
    let totalViolations = 0;
    
    recentImages?.forEach(img => {
      if (img.analysis_result) {
        totalPersonsDetected += img.analysis_result.persons_detected || 0;
        totalViolations += img.analysis_result.ppe_violations?.length || 0;
      }
    });

    return NextResponse.json({
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
