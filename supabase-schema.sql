-- Aragorn AI Database Schema for AWS Integration
-- Run this in your Supabase SQL Editor

-- Add new columns to zones table for safety tracking
ALTER TABLE zones ADD COLUMN IF NOT EXISTS last_safety_check TIMESTAMPTZ;
ALTER TABLE zones ADD COLUMN IF NOT EXISTS last_safety_score INTEGER DEFAULT 100;

-- Add index for safety queries
CREATE INDEX IF NOT EXISTS idx_zones_last_safety_check ON zones(last_safety_check DESC);

-- Table for storing uploaded site images
CREATE TABLE IF NOT EXISTS site_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  s3_key TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending_analysis' CHECK (status IN ('pending_analysis', 'analyzing', 'analyzed', 'failed')),
  analysis_result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_site_images_site_id ON site_images(site_id);
CREATE INDEX IF NOT EXISTS idx_site_images_zone_id ON site_images(zone_id);
CREATE INDEX IF NOT EXISTS idx_site_images_status ON site_images(status);
CREATE INDEX IF NOT EXISTS idx_site_images_created_at ON site_images(created_at DESC);

-- Enable Row Level Security
ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view images from their sites" ON site_images
  FOR SELECT USING (
    site_id IN (
      SELECT id FROM sites WHERE id = site_id
    )
  );

CREATE POLICY "Users can upload images to their sites" ON site_images
  FOR INSERT WITH CHECK (
    site_id IN (
      SELECT id FROM sites WHERE id = site_id
    )
  );

CREATE POLICY "Users can update their uploaded images" ON site_images
  FOR UPDATE USING (uploaded_by = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_site_images_updated_at
  BEFORE UPDATE ON site_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE site_images IS 'Stores construction site images uploaded for AI analysis';

-- Create view for aggregated site statistics
CREATE OR REPLACE VIEW site_analytics AS
SELECT 
  s.id as site_id,
  s.name as site_name,
  COUNT(DISTINCT si.id) as total_images,
  COUNT(DISTINCT CASE WHEN si.status = 'analyzed' THEN si.id END) as analyzed_images,
  COUNT(DISTINCT d.id) as total_detections,
  COUNT(DISTINCT CASE WHEN d.type = 'ppe_violation' THEN d.id END) as violations,
  COUNT(DISTINCT CASE WHEN d.type = 'ppe_compliant' THEN d.id END) as compliant_checks,
  COUNT(DISTINCT CASE WHEN a.severity = 'high' AND NOT a.is_resolved THEN a.id END) as high_alerts,
  AVG(z.last_safety_score) as avg_safety_score,
  MAX(si.created_at) as last_image_upload
FROM sites s
LEFT JOIN site_images si ON s.id = si.site_id
LEFT JOIN zones z ON s.id = z.site_id
LEFT JOIN detections d ON z.id = d.zone_id
LEFT JOIN alerts a ON s.id = a.site_id
GROUP BY s.id, s.name;

COMMENT ON VIEW site_analytics IS 'Aggregated analytics for all sites including image analysis data';

