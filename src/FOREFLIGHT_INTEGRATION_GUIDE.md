# ForeFlight Integration Guide

## 🚀 Overview

The ForeFlight integration system provides seamless connectivity between ForeFlight's flight planning/tracking platform and your aviation operations management system. This integration automates workflows for pilots, reduces duplicate data entry, and enhances flight safety.

## 📁 File Structure

```
/utils/foreflight/
├── types.ts          # TypeScript type definitions for ForeFlight API
├── client.ts         # API client with mock implementation
└── services.ts       # Integration service functions

/components/
├── hooks/
│   └── useForeFlight.ts    # React hooks for all integrations
└── ForeFlightSettings.tsx  # UI for configuration & monitoring
```

## 🎯 Implemented Integrations

### 1. **Auto-Populate FRAT Forms** ⭐⭐⭐⭐⭐
**Hook**: `useAutoPopulateFRAT()`

Automatically fills FRAT risk assessment forms with:
- Weather data (METARs/TAFs) from flight plan
- Auto-calculated weather risk scores
- Crosswind components
- NOTAMs and TFRs
- Route and airport information
- Fuel planning data

**Usage**:
```tsx
const { populateFRAT, loading } = useAutoPopulateFRAT();
const fratData = await populateFRAT(flightPlanId);
```

### 2. **Sync Flight Times** ⭐⭐⭐⭐⭐
**Hook**: `useSyncFlightTimes()`

Imports actual flight times from ForeFlight logbook:
- Block out/in times
- Hobbs/tach readings
- Fuel burn and remaining
- Actual flight time vs. planned
- Auto-completes post-flight checklist

**Usage**:
```tsx
const { syncTimes, loading } = useSyncFlightTimes();
const postFlightData = await syncTimes(logbookEntryId);
```

### 3. **Import Squawks** ⭐⭐⭐⭐⭐
**Hook**: `useImportSquawks()`

Pulls in-flight squawks from ForeFlight into maintenance tech log:
- Auto-maps to your system's categories
- Includes pilot notes and flight context
- Attaches photos/documents
- Links to specific flight and aircraft

**Usage**:
```tsx
const { importFromForeFlight, loading } = useImportSquawks();
const squawks = await importFromForeFlight('N650GS');
```

### 4. **Auto Fuel Requests** ⭐⭐⭐⭐⭐
**Hook**: `useAutoFuelRequest()`

Generates maintenance fuel requests automatically:
- Reads planned fuel load from ForeFlight
- Calculates total fuel needed (planned + reserve + alternate)
- Auto-submits to maintenance with airport info
- Reduces pilot workload

**Usage**:
```tsx
const { generateRequest, loading } = useAutoFuelRequest();
const fuelRequest = await generateRequest(flightPlanId);
```

### 5. **Airport Evaluation Upload** ⭐⭐⭐⭐⭐
**Hook**: `useAirportEvaluationUpload()`

Automatically attaches airport evaluation PDFs to flights:
- Uploads departure airport evaluation
- Uploads destination airport evaluation
- Links to flight in ForeFlight files
- Categorized as "Airport" documents

**Usage**:
```tsx
const { uploadEvaluations, loading } = useAirportEvaluationUpload();
const result = await uploadEvaluations(
  flightPlanId,
  departureEvalPdf,
  destinationEvalPdf
);
```

### 6. **Real-Time Aircraft Tracking** ⭐⭐⭐⭐
**Hook**: `useAircraftTracking()`

Shows live aircraft positions on fleet map:
- GPS position updates every 30 seconds
- Ground speed, altitude, track
- ETA and distance remaining
- Flight phase detection

**Usage**:
```tsx
const { positions, loading } = useAircraftTracking();
// Auto-refreshes when enabled
```

### 7. **Weight & Balance Sync** ⭐⭐⭐
**Hook**: `useSyncWeightBalance()`

Imports W&B calculations from ForeFlight:
- Passenger names and weights
- Baggage allocation
- CG calculations
- Out-of-limits warnings
- Cross-reference with passenger database

**Usage**:
```tsx
const { syncWB, loading } = useSyncWeightBalance();
const wbData = await syncWB(flightPlanId);
```

### 8-10. Additional Integrations
- **Sync NOTAMs/TFRs**: Pull critical airspace information
- **Logbook Currency Sync**: Auto-update pilot currency tracking
- **Weather Deviation Alerts**: Notify ops team of delays/route changes

## 🔧 Configuration

### 1. Get ForeFlight API Credentials
Visit [https://public-api.foreflight.com](https://public-api.foreflight.com) to get:
- API Key
- Account UUID

### 2. Configure in UI
1. Navigate to **ForeFlight Settings** (in Flight Operations menu)
2. Click **Credentials** tab
3. Enter API Key and Account UUID
4. Click **Test Connection**
5. Click **Save Credentials**

### 3. Enable Integrations
1. Go to **Integrations** tab
2. Toggle ON the integrations you want to use
3. Recommended integrations are marked with a badge

### 4. Monitor Sync Status
1. View **Sync Status** tab to see:
   - Last sync time
   - Number of items synced
   - Any errors
   - Integration statistics

## 🎨 UI Components

### ForeFlightSettings Component
Full-featured settings page with three tabs:
- **Credentials**: API key management & connection testing
- **Integrations**: Toggle individual integrations on/off
- **Sync Status**: Monitor sync activity and errors

Features:
- Visual integration cards with icons
- Real-time sync statistics
- Error logging and display
- Badge indicators (Connected/Not Connected)
- Recommended integrations highlighted

## 📊 Data Flow Examples

### Example 1: FRAT Auto-Population Workflow

```
ForeFlight Flight Plan Created
       ↓
Pilot clicks "Auto-Fill from ForeFlight" in FRAT Form
       ↓
System calls ForeFlight API to get flight plan
       ↓
Weather data extracted (METARs, TAFs, winds aloft)
       ↓
Risk scores calculated automatically
       ↓
NOTAMs/TFRs parsed for critical items
       ↓
FRAT form pre-populated with all data
       ↓
Pilot reviews and submits
```

### Example 2: Fuel Request Automation

```
Pilot sets fuel load in ForeFlight flight plan
       ↓
System detects new/updated flight plan
       ↓
Auto-generates fuel request with:
  - Tail number
  - Departure airport
  - Fuel type (Jet-A for G650)
  - Total fuel needed
       ↓
Request automatically sent to maintenance
       ↓
Maintenance receives notification
       ↓
Fuel ordered from FBO
```

### Example 3: Airport Evaluation Upload

```
Pilot completes airport evaluation on iPad
       ↓
Saves as PDF (e.g., "KTEB_Evaluation.pdf")
       ↓
System detects flight plan for KTEB departure
       ↓
Auto-uploads PDF to ForeFlight files
       ↓
File linked to flight object
       ↓
Categorized as "Airport" document
       ↓
Available to all crew on that flight
```

## 🔐 Security & Privacy

- API keys stored in browser localStorage (encrypted in production)
- All API calls use HTTPS
- Mock client available for development/testing
- No PII stored without user consent
- Compliant with aviation data regulations

## 🧪 Development Mode

The system includes a **MockForeFlightClient** for development:
- Returns realistic sample data
- No API credentials required
- Same interface as real client
- Useful for testing UI without hitting API

To use mock mode:
```tsx
// Leave API key empty or set to 'DEMO_MODE'
const client = createForeFlightClient('DEMO_MODE', '');
```

## 📈 Analytics & Monitoring

Track integration performance via Sync Status tab:
- **Flight Plans Synced**: Number of flight plans imported
- **Logbook Entries Synced**: Flight times imported
- **Squawks Imported**: Maintenance items from ForeFlight
- **Position Updates**: Real-time tracking updates
- **Files Synced**: Airport evaluations and documents uploaded

## 🚦 Integration Status Indicators

- 🟢 **Connected**: API credentials configured and working
- 🔴 **Not Connected**: Missing credentials or connection failed
- 🟡 **Syncing**: Integration actively pulling data
- ⚠️ **Error**: Integration encountered an issue

## 🎯 Best Practices

1. **Enable Recommended Integrations First**
   - Auto-Populate FRAT
   - Sync Flight Times
   - Import Squawks
   - Auto Fuel Requests
   - Airport Evaluation Upload

2. **Test with Mock Client**
   - Verify UI behavior before using real API
   - Develop offline

3. **Monitor Sync Status**
   - Check for errors regularly
   - Review sync statistics

4. **Keep API Credentials Secure**
   - Don't share API keys
   - Rotate keys periodically

## 🔄 Future Enhancements

Potential additions:
- Webhook support for real-time updates
- Bi-directional sync (push data to ForeFlight)
- Advanced error retry logic
- Offline mode with queue
- Custom integration rules per tail number
- Integration with other EFB platforms

## 📞 Support

For integration issues:
1. Check Sync Status tab for errors
2. Test connection in Credentials tab
3. Review browser console for API errors
4. Verify API key permissions in ForeFlight portal

## 🎓 Training Resources

Pilot training:
1. How to configure ForeFlight integration
2. Using auto-populated FRAT forms
3. Uploading airport evaluations
4. Understanding fuel request automation

Maintenance training:
1. Receiving squawks from ForeFlight
2. Processing auto-generated fuel requests
3. Understanding imported flight data

## ✅ Checklist for Going Live

- [ ] Obtain ForeFlight API credentials
- [ ] Configure credentials in settings
- [ ] Test connection successfully
- [ ] Enable desired integrations
- [ ] Train pilots on new workflows
- [ ] Train maintenance on receiving data
- [ ] Monitor sync status for 24 hours
- [ ] Verify data accuracy
- [ ] Document any custom procedures
- [ ] Set up error monitoring/alerts

---

**Built for**: Premium Gulfstream G650 operations  
**Integration Type**: RESTful API  
**Update Frequency**: Real-time (30s for tracking, on-demand for others)  
**Supported Platforms**: Web, Mobile-responsive
