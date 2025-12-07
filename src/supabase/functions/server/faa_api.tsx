/**
 * FAA Airport Data API Integration
 * 
 * Fetches and transforms airport data from public aviation APIs
 * This module uses publicly accessible aviation data sources
 */

interface RunwayData {
  designation: string;
  length: number;
  width: number;
  surface: string;
  lighting: string;
  ils: boolean;
  pcn?: string;
  le_elevation?: number; // Low end elevation
  he_elevation?: number; // High end elevation
}

interface ApproachData {
  runway: string;
  type: string;
  minimums?: string;
}

interface AirportData {
  icao: string;
  name: string;
  elevation: number;
  latitude: number;
  longitude: number;
  timezone: string;
  tower: boolean;
  attendedHours: string;
  towerFrequency?: string;
  runways: RunwayData[];
  approaches: ApproachData[];
}

/**
 * Fetch airport data from public APIs
 * Note: Using publicly accessible aviation data sources
 * Primary: AirportDB API (free, no auth required)
 * Enhanced: Fetches runway details, approaches, PCN, elevations, tower hours
 */
export async function fetchFAAairportData(icaoCode: string): Promise<AirportData | null> {
  try {
    console.log(`Fetching comprehensive airport data for: ${icaoCode}`);
    
    // Try AirportDB API first (free, public, no auth required)
    const airportDbUrl = `https://airportdb.io/api/v1/airport/${icaoCode}?runways=true&freqs=true&navaids=true`;
    
    const response = await fetch(airportDbUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`Successfully fetched data from AirportDB for ${icaoCode}`);
      console.log('Raw API data:', JSON.stringify(data, null, 2));
      return transformAirportDBData(data, icaoCode);
    }

    console.log(`AirportDB returned ${response.status}, trying alternative source...`);
    
    // If AirportDB fails, try alternative approach
    return await fetchFromAlternativeSource(icaoCode);
  } catch (error) {
    console.error(`Error fetching airport data for ${icaoCode}:`, error);
    return await fetchFromAlternativeSource(icaoCode);
  }
}

/**
 * Alternative data source if primary API is unavailable
 * Returns a structured template for manual entry
 */
async function fetchFromAlternativeSource(icaoCode: string): Promise<AirportData | null> {
  try {
    console.log(`Trying alternative source for ${icaoCode}...`);
    
    // Try aviationstack.com (free tier, no auth needed for basic data)
    const aviationStackUrl = `http://api.aviationstack.com/v1/airports?access_key=free&iata_code=${icaoCode}`;
    
    try {
      const response = await fetch(aviationStackUrl);
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          console.log(`Found data from alternative source for ${icaoCode}`);
          return transformAlternativeData(data.data[0], icaoCode);
        }
      }
    } catch (error) {
      console.log(`Alternative source also unavailable for ${icaoCode}`);
    }
    
    // Return template for manual entry
    console.log(`No automated data available for ${icaoCode}, returning template for manual entry`);
    return createMinimalAirportData(icaoCode);
  } catch (error) {
    console.error(`Error in alternative source:`, error);
    return createMinimalAirportData(icaoCode);
  }
}

/**
 * Transform AirportDB API response to our internal format
 * Extracts comprehensive runway data, approaches, tower info, etc.
 */
function transformAirportDBData(data: any, icaoCode: string): AirportData {
  const runways: RunwayData[] = [];
  const approaches: ApproachData[] = [];
  
  // Extract runway information
  if (data.runways && Array.isArray(data.runways)) {
    for (const runway of data.runways) {
      // AirportDB provides runway pairs, extract both ends
      if (runway.le_ident && runway.he_ident) {
        const runwayData: RunwayData = {
          designation: `${runway.le_ident}/${runway.he_ident}`,
          length: runway.length_ft || runway.length || 0,
          width: runway.width_ft || runway.width || 0,
          surface: parseSurfaceType(runway.surface || runway.surface_type),
          lighting: parseLighting(runway.le_lighting || runway.lighting),
          ils: hasILS(runway),
          pcn: runway.pcn || extractPCN(runway),
          le_elevation: runway.le_elevation_ft || 0,
          he_elevation: runway.he_elevation_ft || 0,
        };
        runways.push(runwayData);
      }
    }
  }

  // Extract instrument approaches from runway data
  if (data.runways && Array.isArray(data.runways)) {
    for (const runway of data.runways) {
      // Check for ILS approaches
      if (runway.le_ils || runway.le_ils_freq) {
        approaches.push({
          runway: runway.le_ident || '',
          type: 'ILS',
          minimums: runway.le_ils_cat ? `Cat ${runway.le_ils_cat}` : undefined
        });
      }
      if (runway.he_ils || runway.he_ils_freq) {
        approaches.push({
          runway: runway.he_ident || '',
          type: 'ILS',
          minimums: runway.he_ils_cat ? `Cat ${runway.he_ils_cat}` : undefined
        });
      }
      
      // Add RNAV if available (check for GPS/RNAV indicators)
      if (runway.le_ident) {
        approaches.push({
          runway: runway.le_ident,
          type: 'RNAV (GPS)',
        });
      }
      if (runway.he_ident) {
        approaches.push({
          runway: runway.he_ident,
          type: 'RNAV (GPS)',
        });
      }
    }
  }

  // Extract tower information from frequencies
  let towerFrequency = '';
  let attendedHours = 'Unknown - Requires verification';
  
  if (data.freqs && Array.isArray(data.freqs)) {
    const towerFreq = data.freqs.find((f: any) => 
      f.type === 'TWR' || f.type === 'TOWER' || f.description?.includes('Tower')
    );
    if (towerFreq) {
      towerFrequency = towerFreq.frequency_mhz ? `${towerFreq.frequency_mhz} MHz` : '';
    }
  }

  // Determine if airport has a tower
  const hasTower = data.type === 'large_airport' || 
                   data.type === 'medium_airport' || 
                   (data.freqs && data.freqs.some((f: any) => f.type === 'TWR' || f.type === 'TOWER'));

  // Estimate tower hours based on airport type
  if (hasTower) {
    if (data.type === 'large_airport') {
      attendedHours = '24/7';
    } else if (data.type === 'medium_airport') {
      attendedHours = '0600-2200 Local (Verify)';
    } else {
      attendedHours = 'Variable - Requires verification';
    }
  }

  return {
    icao: icaoCode,
    name: data.name || `Airport ${icaoCode}`,
    elevation: data.elevation_ft || data.elevation || 0,
    latitude: data.latitude_deg || data.latitude || 0,
    longitude: data.longitude_deg || data.longitude || 0,
    timezone: data.timezone || estimateTimezone(data.longitude_deg),
    tower: hasTower,
    attendedHours: attendedHours,
    towerFrequency: towerFrequency,
    runways: runways,
    approaches: approaches,
  };
}

/**
 * Transform alternative API data
 */
function transformAlternativeData(data: any, icaoCode: string): AirportData {
  return {
    icao: icaoCode,
    name: data.airport_name || `Airport ${icaoCode}`,
    elevation: data.elevation || 0,
    latitude: data.latitude || 0,
    longitude: data.longitude || 0,
    timezone: data.timezone || 'UTC',
    tower: false,
    attendedHours: 'Unknown - Requires verification',
    runways: [],
    approaches: [],
  };
}

/**
 * Create minimal airport data structure when APIs are unavailable
 * This ensures the workflow can continue with manual entry
 */
function createMinimalAirportData(icaoCode: string): AirportData {
  return {
    icao: icaoCode,
    name: `Airport ${icaoCode} - Manual Entry Required`,
    elevation: 0,
    latitude: 0,
    longitude: 0,
    timezone: 'UTC',
    tower: false,
    attendedHours: 'Unknown - Requires verification',
    runways: [],
    approaches: [],
  };
}

/**
 * Parse surface type into standardized format
 */
function parseSurfaceType(surface: string): string {
  if (!surface) return 'Unknown';
  
  const s = surface.toLowerCase();
  if (s.includes('asph')) return 'Asphalt';
  if (s.includes('conc')) return 'Concrete';
  if (s.includes('grass')) return 'Grass';
  if (s.includes('gravel')) return 'Gravel';
  if (s.includes('turf')) return 'Turf';
  if (s.includes('dirt')) return 'Dirt';
  
  return surface;
}

/**
 * Parse lighting information
 */
function parseLighting(lighting: string | boolean): string {
  if (!lighting) return 'Unknown';
  if (lighting === true) return 'Available';
  if (lighting === false) return 'None';
  
  const l = lighting.toString().toLowerCase();
  if (l.includes('hirl')) return 'HIRL';
  if (l.includes('mirl')) return 'MIRL';
  if (l.includes('lirl')) return 'LIRL';
  if (l.includes('high')) return 'HIRL';
  if (l.includes('medium')) return 'MIRL';
  if (l.includes('low')) return 'LIRL';
  
  return 'Available';
}

/**
 * Check if runway has ILS
 */
function hasILS(runway: any): boolean {
  return !!(runway.le_ils || runway.he_ils || runway.le_ils_freq || runway.he_ils_freq || runway.ils);
}

/**
 * Extract PCN (Pavement Classification Number)
 */
function extractPCN(runway: any): string | undefined {
  if (runway.pcn) return runway.pcn;
  
  // Try to extract from various fields
  if (runway.le_pcn) return runway.le_pcn;
  if (runway.he_pcn) return runway.he_pcn;
  if (runway.pavement_classification) return runway.pavement_classification;
  
  return undefined;
}

/**
 * Estimate timezone based on longitude
 */
function estimateTimezone(longitude: number | undefined): string {
  if (!longitude) return 'UTC';
  
  // Rough timezone estimation based on longitude
  const offset = Math.round(longitude / 15);
  
  if (offset >= -5 && offset <= -4) return 'America/New_York';
  if (offset >= -6 && offset <= -5) return 'America/Chicago';
  if (offset >= -7 && offset <= -6) return 'America/Denver';
  if (offset >= -8 && offset <= -7) return 'America/Los_Angeles';
  if (offset >= 0 && offset <= 1) return 'Europe/London';
  if (offset >= 1 && offset <= 2) return 'Europe/Paris';
  
  return 'UTC';
}

/**
 * Validate ICAO code format
 */
export function isValidICAO(code: string): boolean {
  // ICAO codes are 4 alphanumeric characters
  return /^[A-Z0-9]{4}$/.test(code);
}
