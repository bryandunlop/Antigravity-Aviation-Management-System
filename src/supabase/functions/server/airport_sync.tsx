/**
 * Automated Airport Data Sync System
 * 
 * This module handles weekly automated syncing of airport data from public APIs
 * Only updates records when actual changes are detected
 */

import * as kv from "./kv_store.tsx";

interface RunwayData {
  designation: string;
  length: number;
  width: number;
  surface: string;
  lighting: string;
  ils: boolean;
  pcn?: string; // Pavement Classification Number
  remarks?: string;
}

interface ApproachData {
  runway: string;
  type: string; // ILS, RNAV, VOR, NDB, etc.
  glidepath: number;
  minimums: {
    visibility: string;
    ceiling: string;
  };
  lighting?: string;
  remarks?: string;
}

interface ComprehensiveAirportData {
  icao: string;
  iata?: string;
  name: string;
  city: string;
  state: string;
  country: string;
  elevation: number;
  latitude: number;
  longitude: number;
  timezone: string;
  towerHours: {
    weekdays: string;
    weekends: string;
    notes: string;
  };
  runways: RunwayData[];
  approaches: ApproachData[];
  taxiways: {
    weightLimit: number;
    psiLimit: number;
    notes: string;
  };
  rampInfo: {
    weightLimit: number;
    psiLimit: number;
    spots: number;
    notes: string;
  };
  fuel: {
    jetA: boolean;
    avgas: boolean;
    supplier: string;
    hours: string;
    notes: string;
  };
  services: Array<{
    name: string;
    available: boolean;
    hours: string;
    contact: string;
    notes: string;
  }>;
  lastUpdated: string;
  updatedBy: string;
  dataSource: string;
}

/**
 * Fetch comprehensive airport data from multiple sources
 */
export async function fetchComprehensiveAirportData(icaoCode: string): Promise<ComprehensiveAirportData | null> {
  try {
    console.log(`[SYNC] Fetching comprehensive data for ${icaoCode}`);

    // Fetch from multiple APIs and combine the data
    const basicData = await fetchBasicAirportInfo(icaoCode);
    const runwayData = await fetchRunwayData(icaoCode);
    const approachData = await fetchApproachData(icaoCode);
    const notamData = await fetchNotamData(icaoCode);

    if (!basicData) {
      console.log(`[SYNC] No basic data found for ${icaoCode}`);
      return null;
    }

    // Combine all data sources
    const comprehensiveData: ComprehensiveAirportData = {
      ...basicData,
      runways: runwayData || [],
      approaches: approachData || [],
      lastUpdated: new Date().toISOString(),
      updatedBy: 'Automated Sync',
      dataSource: 'FAA/AirportDB/Aviation APIs'
    };

    return comprehensiveData;
  } catch (error) {
    console.error(`[SYNC] Error fetching comprehensive data for ${icaoCode}:`, error);
    return null;
  }
}

/**
 * Fetch basic airport information
 */
async function fetchBasicAirportInfo(icaoCode: string): Promise<Partial<ComprehensiveAirportData> | null> {
  try {
    // Try AirportDB API
    const response = await fetch(`https://airportdb.io/api/v1/airport/${icaoCode}`, {
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      const data = await response.json();
      return {
        icao: icaoCode,
        iata: data.iata_code || '',
        name: data.name || `Airport ${icaoCode}`,
        city: data.municipality || '',
        state: data.region || '',
        country: data.country_code || '',
        elevation: data.elevation_ft || 0,
        latitude: data.latitude_deg || 0,
        longitude: data.longitude_deg || 0,
        timezone: data.timezone || 'UTC',
        towerHours: {
          weekdays: data.tower_hours?.weekday || 'Unknown - Verify NOTAMs',
          weekends: data.tower_hours?.weekend || 'Unknown - Verify NOTAMs',
          notes: 'Verify current hours via NOTAM or contact tower'
        },
        taxiways: {
          weightLimit: 0,
          psiLimit: 0,
          notes: 'Contact airport operations for weight limits'
        },
        rampInfo: {
          weightLimit: 0,
          psiLimit: 0,
          spots: 0,
          notes: 'Contact FBO for ramp specifications'
        },
        fuel: {
          jetA: false,
          avgas: false,
          supplier: 'Unknown - Contact FBO',
          hours: 'Unknown - Contact FBO',
          notes: 'Verify fuel availability before departure'
        },
        services: []
      };
    }

    return null;
  } catch (error) {
    console.error(`[SYNC] Error fetching basic info:`, error);
    return null;
  }
}

/**
 * Fetch runway data including PCN numbers
 */
async function fetchRunwayData(icaoCode: string): Promise<RunwayData[] | null> {
  try {
    // Using OurAirports API (free, public, comprehensive runway data)
    const response = await fetch(`https://ourairports.com/airports/${icaoCode}/runways.json`);
    
    if (response.ok) {
      const data = await response.json();
      
      return data.map((rwy: any) => ({
        designation: rwy.le_ident || rwy.he_ident || 'Unknown',
        length: rwy.length_ft || 0,
        width: rwy.width_ft || 0,
        surface: rwy.surface || 'Unknown',
        lighting: rwy.lighted ? 'Available' : 'None',
        ils: rwy.le_ils || rwy.he_ils || false,
        pcn: rwy.pcn || 'Unknown - Contact airport ops',
        remarks: rwy.remarks || ''
      }));
    }

    // Fallback: return empty array so sync continues
    return [];
  } catch (error) {
    console.error(`[SYNC] Error fetching runway data:`, error);
    return [];
  }
}

/**
 * Fetch instrument approach data
 */
async function fetchApproachData(icaoCode: string): Promise<ApproachData[] | null> {
  try {
    // Note: Approach plate data is typically not available via free APIs
    // This would require FAA CIFP data or commercial API
    // For now, return empty array and note that manual entry is required
    
    console.log(`[SYNC] Approach data requires manual entry from FAA charts for ${icaoCode}`);
    
    // Future enhancement: Parse FAA CIFP data or integrate with commercial API
    return [];
  } catch (error) {
    console.error(`[SYNC] Error fetching approach data:`, error);
    return [];
  }
}

/**
 * Fetch NOTAM data for operational updates
 */
async function fetchNotamData(icaoCode: string): Promise<any> {
  try {
    // NOTAMs would come from FAA NOTAM API (requires authentication)
    // For now, log that this requires manual checking
    console.log(`[SYNC] NOTAM data requires manual verification for ${icaoCode}`);
    return null;
  } catch (error) {
    console.error(`[SYNC] Error fetching NOTAM data:`, error);
    return null;
  }
}

/**
 * Compare two airport data objects and detect changes
 */
export function detectChanges(oldData: any, newData: any): { hasChanges: boolean; changes: string[] } {
  const changes: string[] = [];

  if (!oldData || !newData) {
    return { hasChanges: true, changes: ['Initial data fetch'] };
  }

  // Check basic fields
  const fieldsToCheck = [
    'name', 'elevation', 'latitude', 'longitude', 'timezone',
    'iata', 'city', 'state', 'country'
  ];

  for (const field of fieldsToCheck) {
    if (oldData[field] !== newData[field]) {
      changes.push(`${field}: ${oldData[field]} → ${newData[field]}`);
    }
  }

  // Check runways
  if (JSON.stringify(oldData.runways) !== JSON.stringify(newData.runways)) {
    changes.push('Runway data updated');
  }

  // Check approaches
  if (JSON.stringify(oldData.approaches) !== JSON.stringify(newData.approaches)) {
    changes.push('Approach data updated');
  }

  // Check tower hours
  if (JSON.stringify(oldData.towerHours) !== JSON.stringify(newData.towerHours)) {
    changes.push('Tower hours updated');
  }

  return {
    hasChanges: changes.length > 0,
    changes
  };
}

/**
 * Sync a single airport's data
 */
export async function syncAirport(icaoCode: string): Promise<{ success: boolean; updated: boolean; changes?: string[] }> {
  try {
    console.log(`[SYNC] Starting sync for ${icaoCode}`);

    // Fetch current data from KV store
    const currentData = await kv.get(`airport_full:${icaoCode}`);

    // Fetch new data from APIs
    const newData = await fetchComprehensiveAirportData(icaoCode);

    if (!newData) {
      console.log(`[SYNC] No new data available for ${icaoCode}`);
      return { success: false, updated: false };
    }

    // Detect changes
    const { hasChanges, changes } = detectChanges(currentData, newData);

    if (hasChanges) {
      console.log(`[SYNC] Changes detected for ${icaoCode}:`, changes);
      
      // Update the data in KV store
      await kv.set(`airport_full:${icaoCode}`, newData);
      
      // Log the sync activity
      const syncLog = {
        icao: icaoCode,
        timestamp: new Date().toISOString(),
        changes: changes,
        previousUpdate: currentData?.lastUpdated || 'Never',
        newUpdate: newData.lastUpdated
      };
      
      // Store sync log
      const existingLogs = await kv.get(`airport_sync_log:${icaoCode}`) || [];
      existingLogs.push(syncLog);
      await kv.set(`airport_sync_log:${icaoCode}`, existingLogs);

      return { success: true, updated: true, changes };
    } else {
      console.log(`[SYNC] No changes detected for ${icaoCode}`);
      return { success: true, updated: false };
    }
  } catch (error) {
    console.error(`[SYNC] Error syncing ${icaoCode}:`, error);
    return { success: false, updated: false };
  }
}

/**
 * Sync all airports in the database
 */
export async function syncAllAirports(): Promise<{
  total: number;
  successful: number;
  updated: number;
  failed: number;
  details: Array<{ icao: string; status: string; changes?: string[] }>;
}> {
  console.log('[SYNC] Starting weekly sync of all airports');

  try {
    // Get all airport ICAOs from KV store
    const airportKeys = await kv.getByPrefix('airport_full:');
    const icaoCodes = airportKeys.map((item: any) => item.key.replace('airport_full:', ''));

    console.log(`[SYNC] Found ${icaoCodes.length} airports to sync`);

    const results = {
      total: icaoCodes.length,
      successful: 0,
      updated: 0,
      failed: 0,
      details: [] as Array<{ icao: string; status: string; changes?: string[] }>
    };

    // Sync each airport
    for (const icao of icaoCodes) {
      const result = await syncAirport(icao);
      
      if (result.success) {
        results.successful++;
        if (result.updated) {
          results.updated++;
          results.details.push({
            icao,
            status: 'updated',
            changes: result.changes
          });
        } else {
          results.details.push({
            icao,
            status: 'no-changes'
          });
        }
      } else {
        results.failed++;
        results.details.push({
          icao,
          status: 'failed'
        });
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Store overall sync report
    const syncReport = {
      timestamp: new Date().toISOString(),
      ...results
    };
    await kv.set('last_airport_sync_report', syncReport);

    console.log('[SYNC] Weekly sync completed:', results);
    return results;
  } catch (error) {
    console.error('[SYNC] Error during weekly sync:', error);
    throw error;
  }
}

/**
 * Get the last sync report
 */
export async function getLastSyncReport() {
  return await kv.get('last_airport_sync_report');
}

/**
 * Get sync logs for a specific airport
 */
export async function getAirportSyncLogs(icaoCode: string) {
  return await kv.get(`airport_sync_log:${icaoCode}`) || [];
}
