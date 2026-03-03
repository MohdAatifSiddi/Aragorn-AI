# Real-time Dashboard Updates - Implementation Guide

## Overview

The Aragorn AI dashboard now automatically updates with real-time data from image analysis. When you upload a construction site photo, the system:

1. ✅ Uploads image to AWS S3
2. ✅ Analyzes with AWS Rekognition
3. ✅ Creates detection records
4. ✅ Generates alerts for violations
5. ✅ Updates zone safety scores
6. ✅ Updates site statistics
7. ✅ Refreshes dashboard automatically

---

## What Gets Updated Automatically

### 1. Safety Score
- Calculated from all image analyses
- Updates in real-time after each upload
- Shows trend (EXCELLENT, GOOD, NEEDS ATTENTION)
- Displays total images analyzed

### 2. Detections Log
- New entries appear immediately
- Shows PPE violations and compliant checks
- Includes confidence scores
- Links to specific zones

### 3. Alerts Panel
- High-priority alerts for violations
- Low-priority alerts for compliance
- Real-time notifications via Supabase subscriptions
- Auto-categorized by severity

### 4. Workers Detected
- Counts total persons from all images
- Updates with each new analysis
- Tracks across all zones

### 5. Violations Counter
- Shows total PPE violations detected
- Updates immediately after analysis
- Triggers critical alerts

### 6. Zone Safety Scores
- Each zone tracks its last safety check
- Updates when images from that zone are analyzed
- Historical tracking enabled

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. USER UPLOADS IMAGE                                       │
│     ImageUpload Component                                    │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  2. IMAGE STORED IN S3                                       │
│     /api/upload → AWS S3                                     │
│     Creates site_images record (status: pending_analysis)   │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  3. AI ANALYSIS                                              │
│     /api/analyze → AWS Rekognition                           │
│     - DetectProtectiveEquipment (PPE)                        │
│     - DetectLabels (Construction items)                      │
│     - DetectModerationLabels (Hazards)                       │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  4. DATABASE UPDATES (Automatic)                             │
│     ✓ site_images.status = 'analyzed'                        │
│     ✓ site_images.analysis_result = {...}                    │
│     ✓ detections table (new records)                         │
│     ✓ alerts table (if violations found)                     │
│     ✓ zones.last_safety_check = NOW()                        │
│     ✓ zones.last_safety_score = calculated                   │
│     ✓ project_stats (daily aggregation)                      │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  5. REAL-TIME DASHBOARD REFRESH                              │
│     - Supabase subscriptions trigger updates                │
│     - fetchSiteDetails() called automatically                │
│     - /api/stats provides aggregated data                    │
│     - UI updates with new KPIs                               │
└─────────────────────────────────────────────────────────────┘
```

---

## New API Endpoint: `/api/stats`

### Purpose
Provides real-time aggregated statistics for a site.

### Usage
```javascript
const response = await fetch(`/api/stats?siteId=${siteId}`);
const data = await response.json();
```

### Response
```json
{
  "success": true,
  "stats": {
    "totalImages": 15,
    "totalDetections": 23,
    "violations": 3,
    "compliant": 20,
    "highAlerts": 2,
    "overallSafetyScore": 87,
    "totalPersonsDetected": 45,
    "totalViolations": 3,
    "lastAnalyzed": "2024-03-03T10:30:00Z"
  }
}
```

---

## Database Schema Updates

### New Columns in `zones` Table
```sql
ALTER TABLE zones ADD COLUMN last_safety_check TIMESTAMPTZ;
ALTER TABLE zones ADD COLUMN last_safety_score INTEGER DEFAULT 100;
```

### New View: `site_analytics`
Aggregates all site data for quick dashboard queries:
```sql
SELECT * FROM site_analytics WHERE site_id = 'xxx';
```

Returns:
- Total images uploaded
- Analyzed images count
- Total detections
- Violations count
- Compliant checks
- High alerts
- Average safety score
- Last image upload time

---

## Real-time Subscriptions

The dashboard listens to these Supabase real-time events:

### 1. New Alerts
```javascript
.on('postgres_changes', { 
  event: 'INSERT', 
  schema: 'public', 
  table: 'alerts' 
}, (payload) => {
  // Show toast notification
  // Update alerts list
})
```

### 2. New Detections
```javascript
.on('postgres_changes', { 
  event: 'INSERT', 
  schema: 'public', 
  table: 'detections' 
}, (payload) => {
  // Update detections log
})
```

### 3. Zone Updates
```javascript
.on('postgres_changes', { 
  event: 'UPDATE', 
  schema: 'public', 
  table: 'zones' 
}, (payload) => {
  // Update zone safety scores
})
```

---

## Automatic Updates After Image Upload

### Immediate Updates (< 1 second)
- Image preview shown
- Upload progress indicator
- S3 upload confirmation

### Analysis Phase (5-10 seconds)
- "Analyzing with Rekognition..." message
- Loading spinner
- AWS Rekognition processing

### Results Display (< 1 second)
- Safety score calculated
- Violations highlighted
- Results cards shown
- Toast notifications

### Dashboard Refresh (2 seconds)
- Automatic data refresh triggered
- KPIs updated
- Alerts panel refreshed
- Detections log updated
- "Dashboard updated" toast shown

---

## What Each Analysis Creates

### For Images WITH Violations:

1. **Detection Record** (type: `ppe_violation`)
   - Severity: HIGH
   - Details: List of violations per person
   - Confidence: 95%

2. **Alert Record** (severity: `high`)
   - Message: "PPE Violations Detected: X worker(s) missing equipment"
   - Status: Unresolved
   - Triggers notification

3. **Zone Update**
   - last_safety_check: Current timestamp
   - last_safety_score: Calculated score

4. **Stats Update**
   - Daily safety compliance percentage
   - Running average calculation

### For Images WITHOUT Violations:

1. **Detection Record** (type: `ppe_compliant`)
   - Severity: LOW
   - Details: "All X worker(s) compliant"
   - Confidence: 95%

2. **Alert Record** (severity: `low`)
   - Message: "Safety Compliance: All workers wearing proper PPE"
   - Status: Unresolved (informational)

3. **Zone Update**
   - last_safety_check: Current timestamp
   - last_safety_score: 100%

4. **Stats Update**
   - Improves daily safety compliance percentage

---

## Dashboard KPI Updates

### Before Image Upload:
```
Safety Score: 96%
Workers Detected: 0
Violations: 0
Alerts: 2
```

### After Uploading Image with 3 Workers (2 violations):
```
Safety Score: 94% ↓
Workers Detected: 3 ↑
Violations: 2 ↑
Alerts: 3 ↑ (1 new high-priority alert)
```

### After Uploading Image with 5 Workers (all compliant):
```
Safety Score: 96% ↑
Workers Detected: 8 ↑
Violations: 2 (unchanged)
Alerts: 4 ↑ (1 new low-priority positive alert)
```

---

## Testing Real-time Updates

### Test 1: Upload Image with Violations
1. Upload construction site photo with workers missing helmets
2. Wait 5-10 seconds for analysis
3. Observe:
   - ✅ Safety score decreases
   - ✅ New alert appears in alerts panel
   - ✅ Detection log shows new entry
   - ✅ Workers detected count increases
   - ✅ Violations count increases
   - ✅ Toast notification shows violation

### Test 2: Upload Image with Full Compliance
1. Upload photo with all workers wearing PPE
2. Wait 5-10 seconds for analysis
3. Observe:
   - ✅ Safety score increases
   - ✅ Positive alert appears
   - ✅ Detection log shows compliant entry
   - ✅ Workers detected count increases
   - ✅ Violations count unchanged
   - ✅ Toast notification shows success

### Test 3: Multiple Rapid Uploads
1. Upload 3-5 images quickly
2. Observe:
   - ✅ Each processes independently
   - ✅ Dashboard updates after each
   - ✅ Stats aggregate correctly
   - ✅ No data loss or conflicts

---

## Troubleshooting

### Dashboard not updating?
1. Check browser console for errors
2. Verify Supabase real-time is enabled
3. Check network tab for API calls
4. Ensure `/api/stats` endpoint is working

### Stats showing incorrect values?
1. Check `site_images` table for analysis_result data
2. Verify detections are being created
3. Run SQL query on `site_analytics` view
4. Check zone safety scores are updating

### Alerts not appearing?
1. Verify alerts table has new records
2. Check alert severity and is_resolved status
3. Ensure real-time subscription is active
4. Check Supabase logs for errors

---

## Performance Optimization

### Caching Strategy
- Stats API caches results for 30 seconds
- Dashboard fetches full data only on mount
- Real-time subscriptions handle incremental updates

### Database Indexes
All critical queries are indexed:
- `site_images.site_id`
- `site_images.created_at`
- `detections.zone_id`
- `alerts.site_id`
- `zones.last_safety_check`

### Query Optimization
- Use `site_analytics` view for aggregated data
- Limit detection logs to 50 most recent
- Paginate alerts if > 100 records

---

## Future Enhancements

### Planned Features:
- [ ] Historical trend charts
- [ ] Comparison between zones
- [ ] Export analysis reports
- [ ] Email notifications for critical alerts
- [ ] SMS alerts for high-priority violations
- [ ] Weekly safety summary reports
- [ ] Predictive analytics based on trends

---

## Summary

Your Aragorn AI dashboard now provides:

✅ **Real-time updates** - No manual refresh needed
✅ **Automatic data aggregation** - Stats calculated on-the-fly
✅ **Instant notifications** - Toast alerts for violations
✅ **Live KPI tracking** - Safety scores update immediately
✅ **Historical tracking** - All data stored for analysis
✅ **Zone-level insights** - Per-zone safety monitoring

**The system is fully automated from upload to dashboard display!** 🚀
