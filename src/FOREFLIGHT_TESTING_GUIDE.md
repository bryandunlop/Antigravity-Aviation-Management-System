# ForeFlight Integration - Testing Guide

## 🎯 Quick Start: Test Airport Evaluation Upload

### Step 1: Configure API Credentials

1. Navigate to **ForeFlight Settings** in the app
2. Go to the **Credentials** tab
3. Enter your ForeFlight API credentials:
   - **API Key**: Your Bearer token from ForeFlight
   - **Account UUID**: Your account identifier (e.g., `7cce5146-048f-445e-850c-07a86e9fb9e5`)
4. Click **Test Connection** to verify
5. Click **Save Credentials**

### Step 2: Test PDF Upload

1. Navigate to **Test Upload** in the ForeFlight Integration menu
2. Follow the 3-step process:

#### **Step 1: Select Flight Plan**
- Click **Load Flight Plans** to fetch recent flights from ForeFlight API
- Select a flight from the dropdown, OR
- Enter a custom Flight Object ID manually

#### **Step 2: Select PDF Files**
- Click **Browse** for Departure Airport Evaluation
- Select a PDF file from your computer
- Optionally, select a Destination Airport Evaluation PDF too

#### **Step 3: Upload**
- Click **Upload to ForeFlight API**
- Watch the progress and see results

### Step 3: Verify Upload

Check the **Upload Results** section to see:
- ✓ Success/failure status
- Object ID assigned by ForeFlight
- Display name
- Category (should be "Airport")

## 📊 Monitor Sync Activity

### Sync Diagnostics Page

Navigate to **Sync Diagnostics** to see:
- Configuration status
- Sync service status (Active/Disabled)
- Real-time data counts for:
  - Flight Plans
  - Logbook Entries
  - Squawks
  - Aircraft Positions
  - Files

### View Synced Data

Click **View** on any data type to see the raw JSON from ForeFlight API.

## 🔍 Debugging

### Browser Console

Open browser Developer Tools (F12) and check Console tab for logs:

```
[ForeFlight] Using Real API Client with credentials
[ForeFlight API] Calling: /flights?accountUuid=...
[ForeFlight API] Status: 200
[ForeFlight API] Success: {...}
[Test Upload] Uploading departure evaluation: KTEB_Evaluation.pdf
```

### Common Issues

#### ❌ "Connection failed"
- **Cause**: Invalid API key or Account UUID
- **Fix**: Verify credentials in ForeFlight developer portal
- **Check**: API key should be a Bearer token

#### ❌ "Upload Error: 401"
- **Cause**: Unauthorized - API key lacks file upload permissions
- **Fix**: Check API key permissions in ForeFlight portal
- **Ensure**: File upload/write permissions are enabled

#### ❌ "Upload Error: 404"
- **Cause**: Flight Object ID doesn't exist
- **Fix**: Use a valid flight plan ID from ForeFlight
- **Create**: Create a test flight plan in ForeFlight app first

#### ❌ "Invalid file type"
- **Cause**: Non-PDF file selected
- **Fix**: Only PDF files are accepted for airport evaluations

## 🧪 Test Scenarios

### Scenario 1: Upload Single Evaluation
1. Load flight plans
2. Select recent flight
3. Upload only departure evaluation PDF
4. Verify success

### Scenario 2: Upload Both Evaluations
1. Load flight plans
2. Select flight
3. Upload both departure AND destination PDFs
4. Should see 2 success results

### Scenario 3: Custom Flight ID
1. Don't load flight plans
2. Enter a known Flight Object ID manually
3. Upload evaluation
4. Should work if ID is valid

### Scenario 4: Monitor Sync
1. Enable sync in ForeFlight Settings
2. Toggle on "Auto Airport Evaluation" integration
3. Go to Sync Diagnostics
4. Watch file count update every 60 seconds

## 📝 API Endpoints Used

The test upload uses these ForeFlight API endpoints:

```
POST /files
Headers:
  - Authorization: Bearer {apiKey}
  - X-Account-UUID: {accountUuid}
Body: multipart/form-data
  - file: [PDF binary]
  - flightObjectId: {flightId}
  - category: "Airport"
  - displayName: "Departure Airport Evaluation - {filename}"
```

## 🎓 What Happens Behind the Scenes

1. **File Selection**: PDF stored in browser memory
2. **API Call**: FormData created with file + metadata
3. **Upload**: POST to `/files` endpoint
4. **Response**: ForeFlight returns:
   ```json
   {
     "accountUuid": "...",
     "objectId": "75cd60d3-2483-4a26-8d4e-3a6bb58d6e14",
     "dateCreated": "2025-10-28T...",
     "displayName": "Departure Airport Evaluation - KTEB.pdf",
     "mimeType": "application/pdf",
     "flightObjectId": "50bdd532-af9e-4a04-8732-a393f1bc73cd",
     "category": "Airport"
   }
   ```
5. **Attachment**: File is now linked to flight in ForeFlight
6. **Access**: Pilots can view in ForeFlight app under flight files

## 🔐 Security Notes

- API keys stored in browser localStorage (encrypt for production)
- Never commit real API keys to version control
- API credentials visible only in ForeFlight Settings
- Test page doesn't store uploaded files locally
- All uploads go directly to ForeFlight servers

## 📱 Mobile Testing

The test upload page is responsive and works on mobile:
- Use Files app to select PDFs
- Camera → Scan PDF option works
- Touch-friendly file selection
- Results display adapts to screen size

## ✅ Success Criteria

Upload is successful when you see:
- ✓ Green success alert
- Object ID in results
- "Category: Airport" badge
- Toast notification confirming upload

## 🚀 Next Steps After Testing

Once test uploads work:
1. Enable automatic uploads in ForeFlight Settings → Integrations
2. Toggle on "Airport Evaluation Upload"
3. System will auto-upload when flight plans are created
4. Monitor sync activity in Diagnostics page
5. Train pilots on workflow

## 💡 Pro Tips

1. **Batch Testing**: Upload multiple files to same flight
2. **Name Convention**: Use airport ICAO in PDF filename (e.g., `KTEB_Eval.pdf`)
3. **File Size**: Keep PDFs under 5MB for faster uploads
4. **Metadata**: Display name auto-generated but can be customized
5. **Versioning**: Upload new version with updated date in filename

## 📞 Support

If uploads consistently fail:
1. Check ForeFlight API status page
2. Verify account has active API subscription
3. Review API rate limits (if hitting many uploads)
4. Check file upload quotas in your ForeFlight plan
5. Contact ForeFlight API support with request ID from logs

---

**Last Updated**: October 28, 2025  
**Integration Version**: 1.0  
**ForeFlight API**: v1
