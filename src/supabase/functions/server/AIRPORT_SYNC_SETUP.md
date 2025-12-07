# Airport Data Sync System Setup

## Overview
The Airport Data Sync system automatically fetches and updates airport data from public aviation APIs on a weekly basis. It only updates records when actual changes are detected, maintaining accurate "last updated" timestamps.

## Features

### 1. **Comprehensive Data Collection**
The sync system fetches:
- ✅ Basic airport info (name, location, elevation, coordinates)
- ✅ Runway data (designations, dimensions, surface types, lighting)
- ✅ PCN numbers (Pavement Classification Numbers)
- ✅ ILS availability per runway
- ✅ Tower hours (weekday/weekend)
- ⚠️ Instrument approaches (requires manual entry from FAA charts)
- ⚠️ NOTAMs (requires FAA API authentication)

### 2. **Change Detection**
- Compares old vs new data
- Only updates database if changes detected
- Updates "lastUpdated" timestamp only when data changes
- Logs all changes with before/after values

### 3. **Data Sources**
- **Primary**: AirportDB.io API (free, public)
- **Runways**: OurAirports API (comprehensive runway data)
- **Fallback**: Graceful degradation if APIs unavailable

## API Endpoints

### Manual Sync Endpoints

#### Sync Single Airport
```bash
POST /make-server-d89dc2de/sync/airport/:icao
```
**Example:**
```bash
curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-d89dc2de/sync/airport/KTEB \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Response:**
```json
{
  "success": true,
  "updated": true,
  "changes": ["elevation: 8 → 9", "Runway data updated"],
  "message": "Airport KTEB data updated successfully"
}
```

#### Sync All Airports
```bash
POST /make-server-d89dc2de/sync/all
```
**Example:**
```bash
curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-d89dc2de/sync/all \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "total": 150,
    "successful": 148,
    "updated": 12,
    "failed": 2
  },
  "details": [...],
  "message": "Synced 150 airports: 12 updated, 136 unchanged, 2 failed"
}
```

#### Get Last Sync Report
```bash
GET /make-server-d89dc2de/sync/report
```

#### Get Airport Sync Logs
```bash
GET /make-server-d89dc2de/sync/logs/:icao
```

### Automated Cron Endpoint
```bash
POST /make-server-d89dc2de/sync/cron
```
This endpoint is called weekly by the cron scheduler.

## Setting Up Weekly Cron Job

### Option 1: Supabase Cron (Recommended)
Supabase supports database cron jobs using pg_cron extension.

1. **Enable pg_cron in Supabase Dashboard:**
   - Go to Database → Extensions
   - Enable `pg_cron`

2. **Create the cron job:**
   ```sql
   -- Run every Sunday at 2:00 AM UTC
   SELECT cron.schedule(
     'weekly-airport-sync',
     '0 2 * * 0',
     $$
     SELECT net.http_post(
       url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-d89dc2de/sync/cron',
       headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
     );
     $$
   );
   ```

3. **Verify the cron job:**
   ```sql
   SELECT * FROM cron.job;
   ```

4. **Check cron job run history:**
   ```sql
   SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
   ```

### Option 2: External Cron Service
Use a service like Cron-Job.org, EasyCron, or GitHub Actions:

**GitHub Actions Example (.github/workflows/airport-sync.yml):**
```yaml
name: Weekly Airport Sync

on:
  schedule:
    # Run every Sunday at 2:00 AM UTC
    - cron: '0 2 * * 0'
  workflow_dispatch: # Allow manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Airport Sync
        run: |
          curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-d89dc2de/sync/cron \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json"
```

### Option 3: Vercel Cron
If using Vercel for hosting:

**vercel.json:**
```json
{
  "crons": [{
    "path": "/api/airport-sync",
    "schedule": "0 2 * * 0"
  }]
}
```

**pages/api/airport-sync.ts:**
```typescript
export default async function handler(req, res) {
  const response = await fetch(
    'https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-d89dc2de/sync/cron',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  res.status(200).json(data);
}
```

## Data Storage Structure

### KV Store Keys

```
airport_full:ICAO           → Complete airport data
airport_sync_log:ICAO       → Array of sync events for airport
last_airport_sync_report    → Most recent full sync report
airport_sync_cron_logs      → Array of cron execution logs (last 52 weeks)
```

### Airport Data Structure
```typescript
{
  icao: "KTEB",
  iata: "TEB",
  name: "Teterboro Airport",
  city: "Teterboro",
  state: "NJ",
  country: "US",
  elevation: 9,
  latitude: 40.8501,
  longitude: -74.0608,
  timezone: "America/New_York",
  runways: [
    {
      designation: "06/24",
      length: 7000,
      width: 150,
      surface: "Asphalt",
      lighting: "Available",
      ils: true,
      pcn: "80/F/A/W/T",
      remarks: ""
    }
  ],
  approaches: [],
  towerHours: {
    weekdays: "0600-2300 Local",
    weekends: "0700-2200 Local",
    notes: "Verify current hours via NOTAM"
  },
  taxiways: {
    weightLimit: 0,
    psiLimit: 0,
    notes: "Contact airport operations for weight limits"
  },
  rampInfo: {
    weightLimit: 0,
    psiLimit: 0,
    spots: 0,
    notes: "Contact FBO for ramp specifications"
  },
  fuel: {
    jetA: false,
    avgas: false,
    supplier: "Unknown - Contact FBO",
    hours: "Unknown - Contact FBO",
    notes: "Verify fuel availability before departure"
  },
  services: [],
  lastUpdated: "2024-12-06T10:30:00.000Z",
  updatedBy: "Automated Sync",
  dataSource: "FAA/AirportDB/Aviation APIs"
}
```

## Monitoring & Logs

### View Sync History
```typescript
// Frontend code to display sync status
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-d89dc2de/sync/report`,
  {
    headers: { 'Authorization': `Bearer ${publicAnonKey}` }
  }
);
const { report } = await response.json();

console.log(`Last sync: ${report.timestamp}`);
console.log(`Updated: ${report.updated}/${report.total} airports`);
```

### View Airport-Specific Logs
```typescript
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-d89dc2de/sync/logs/KTEB`,
  {
    headers: { 'Authorization': `Bearer ${publicAnonKey}` }
  }
);
const { logs } = await response.json();

logs.forEach(log => {
  console.log(`${log.timestamp}: ${log.changes.join(', ')}`);
});
```

## Important Notes

### Rate Limiting
- 500ms delay between airport syncs to avoid API rate limits
- Fetches data for all airports sequentially
- Typical sync time: ~5 minutes for 150 airports

### Data Quality
- Basic data (elevation, coordinates) comes from APIs
- PCN numbers require manual verification
- Instrument approaches must be entered manually from FAA charts
- Tower hours should be verified against current NOTAMs
- FBO information requires manual entry

### Manual Entry Required
Some data cannot be automated and requires Airport Evaluation Officer input:
- Detailed approach procedures and minimums
- FBO contact information and services
- Ramp weight restrictions (PSI limits)
- Current NOTAMs and operational restrictions
- Company-specific operational notes

## Troubleshooting

### Sync Not Running
1. Check cron job is scheduled: `SELECT * FROM cron.job;`
2. Check recent executions: `SELECT * FROM cron.job_run_details;`
3. Verify endpoint is accessible
4. Check Supabase function logs

### API Failures
- APIs may have rate limits or downtime
- System gracefully handles failures
- Failed syncs are logged and can be retried manually

### No Updates Detected
- This is normal! Airports don't change frequently
- Check sync logs to see comparison details
- If data should have changed, verify API source

## Future Enhancements

1. **FAA CIFP Data Integration**: Parse approach procedures
2. **NOTAM API**: Integrate FAA NOTAM Feed
3. **Weather Integration**: Pull current METARs/TAFs
4. **Email Notifications**: Alert when critical data changes
5. **Conflict Resolution**: Handle manual edits vs automated updates
