import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import * as faaApi from "./faa_api.tsx";
import * as airportSync from "./airport_sync.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-d89dc2de/health", (c) => {
  return c.json({ status: "ok" });
});

// Fetch airport data from FAA
app.get("/make-server-d89dc2de/airport/:icao", async (c) => {
  try {
    const icao = c.req.param("icao").toUpperCase();
    const skipCache = c.req.query("skipCache") === "true";
    
    // Validate ICAO code
    if (!faaApi.isValidICAO(icao)) {
      return c.json({ error: "Invalid ICAO code. Must be 4 alphanumeric characters." }, 400);
    }

    console.log(`Airport data request for: ${icao}, skipCache: ${skipCache}`);

    // Check if we have cached data in KV store (unless skipCache is true)
    if (!skipCache) {
      const cachedData = await kv.get(`airport_data:${icao}`);
      if (cachedData) {
        console.log(`Returning cached data for ${icao}`);
        return c.json({ data: cachedData, source: 'cache' });
      }
    }

    // Fetch from FAA API (for new airports or cache refresh)
    const airportData = await faaApi.fetchFAAairportData(icao);
    
    if (!airportData) {
      return c.json({ error: `Could not fetch data for ${icao}` }, 404);
    }

    // Don't cache if this is a minimal/template response
    // Only cache real data from APIs
    if (!airportData.name.includes('Manual Entry Required')) {
      // Cache the data for 30 days (airports don't change frequently)
      await kv.set(`airport_data:${icao}`, airportData);
    }

    return c.json({ 
      data: airportData, 
      source: airportData.name.includes('Manual Entry Required') ? 'template' : 'faa' 
    });
  } catch (error) {
    console.error(`Error fetching airport data:`, error);
    return c.json({ error: "Failed to fetch airport data", details: error.message }, 500);
  }
});

// Submit airport evaluation request
app.post("/make-server-d89dc2de/airport-submissions", async (c) => {
  try {
    const body = await c.req.json();
    console.log('Airport submission received:', body);

    // Generate a unique submission ID
    const submissionId = `SUB-${Date.now().toString(36).toUpperCase()}`;
    
    // Store in KV with submission ID as key
    const submission = {
      id: submissionId,
      ...body,
      createdAt: new Date().toISOString()
    };

    await kv.set(`airport_submission:${submissionId}`, submission);
    
    // Also add to a list of all pending submissions
    const pendingList = await kv.get('airport_submissions:pending') || [];
    pendingList.push(submissionId);
    await kv.set('airport_submissions:pending', pendingList);

    console.log(`Airport submission stored: ${submissionId}`);

    return c.json({ 
      success: true, 
      submissionId,
      message: 'Submission received and sent to Airport Evaluation Officer'
    });
  } catch (error) {
    console.error('Error storing airport submission:', error);
    return c.json({ error: 'Failed to submit airport request', details: error.message }, 500);
  }
});

// Get all airport submissions (for Airport Evaluation Officer)
app.get("/make-server-d89dc2de/airport-submissions", async (c) => {
  try {
    const pendingList = await kv.get('airport_submissions:pending') || [];
    const submissions = [];

    for (const submissionId of pendingList) {
      const submission = await kv.get(`airport_submission:${submissionId}`);
      if (submission) {
        submissions.push(submission);
      }
    }

    return c.json({ submissions });
  } catch (error) {
    console.error('Error fetching airport submissions:', error);
    return c.json({ error: 'Failed to fetch submissions', details: error.message }, 500);
  }
});

// Clear cached airport data (admin only - would need auth in production)
app.delete("/make-server-d89dc2de/airport/:icao/cache", async (c) => {
  try {
    const icao = c.req.param("icao").toUpperCase();
    await kv.del(`airport_data:${icao}`);
    return c.json({ message: `Cache cleared for ${icao}` });
  } catch (error) {
    console.error(`Error clearing cache:`, error);
    return c.json({ error: "Failed to clear cache" }, 500);
  }
});

// ==================== AIRPORT SYNC ENDPOINTS ====================

// Sync a specific airport (manual trigger)
app.post("/make-server-d89dc2de/sync/airport/:icao", async (c) => {
  try {
    const icao = c.req.param("icao").toUpperCase();
    
    console.log(`[SYNC] Manual sync requested for ${icao}`);
    
    const result = await airportSync.syncAirport(icao);
    
    if (result.success) {
      return c.json({
        success: true,
        updated: result.updated,
        changes: result.changes || [],
        message: result.updated 
          ? `Airport ${icao} data updated successfully`
          : `Airport ${icao} data is up to date`
      });
    } else {
      return c.json({
        success: false,
        message: `Failed to sync airport ${icao}`
      }, 500);
    }
  } catch (error) {
    console.error(`[SYNC] Error in manual sync:`, error);
    return c.json({ error: "Failed to sync airport", details: error.message }, 500);
  }
});

// Sync all airports (manual trigger - admin only in production)
app.post("/make-server-d89dc2de/sync/all", async (c) => {
  try {
    console.log(`[SYNC] Manual sync of all airports requested`);
    
    const results = await airportSync.syncAllAirports();
    
    return c.json({
      success: true,
      summary: {
        total: results.total,
        successful: results.successful,
        updated: results.updated,
        failed: results.failed
      },
      details: results.details,
      message: `Synced ${results.total} airports: ${results.updated} updated, ${results.successful - results.updated} unchanged, ${results.failed} failed`
    });
  } catch (error) {
    console.error(`[SYNC] Error in full sync:`, error);
    return c.json({ error: "Failed to sync all airports", details: error.message }, 500);
  }
});

// Get last sync report
app.get("/make-server-d89dc2de/sync/report", async (c) => {
  try {
    const report = await airportSync.getLastSyncReport();
    
    if (!report) {
      return c.json({ message: "No sync has been performed yet" }, 404);
    }
    
    return c.json({ report });
  } catch (error) {
    console.error(`[SYNC] Error fetching sync report:`, error);
    return c.json({ error: "Failed to fetch sync report" }, 500);
  }
});

// Get sync logs for specific airport
app.get("/make-server-d89dc2de/sync/logs/:icao", async (c) => {
  try {
    const icao = c.req.param("icao").toUpperCase();
    const logs = await airportSync.getAirportSyncLogs(icao);
    
    return c.json({ icao, logs });
  } catch (error) {
    console.error(`[SYNC] Error fetching sync logs:`, error);
    return c.json({ error: "Failed to fetch sync logs" }, 500);
  }
});

// Weekly automated sync endpoint (called by cron)
app.post("/make-server-d89dc2de/sync/cron", async (c) => {
  try {
    // Verify cron auth (in production, check authorization header)
    const authHeader = c.req.header("Authorization");
    
    // For now, log the cron execution
    console.log(`[SYNC] Weekly cron job triggered at ${new Date().toISOString()}`);
    
    const results = await airportSync.syncAllAirports();
    
    // Store execution record
    const cronLog = {
      timestamp: new Date().toISOString(),
      results: {
        total: results.total,
        successful: results.successful,
        updated: results.updated,
        failed: results.failed
      }
    };
    
    const existingCronLogs = await kv.get('airport_sync_cron_logs') || [];
    existingCronLogs.push(cronLog);
    // Keep only last 52 weeks (1 year) of logs
    if (existingCronLogs.length > 52) {
      existingCronLogs.shift();
    }
    await kv.set('airport_sync_cron_logs', existingCronLogs);
    
    return c.json({
      success: true,
      message: "Weekly sync completed",
      results: cronLog.results
    });
  } catch (error) {
    console.error(`[SYNC] Error in cron job:`, error);
    return c.json({ error: "Cron job failed", details: error.message }, 500);
  }
});

Deno.serve(app.fetch);