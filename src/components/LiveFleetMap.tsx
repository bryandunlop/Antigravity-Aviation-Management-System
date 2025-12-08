import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { useSatcomDirect } from './hooks/useSatcomDirect';
import {
  Plane,
  MapPin,
  Navigation,
  Clock,
  Fuel,
  RefreshCw,
  Loader2,
  Zap,
  Wifi,
  WifiOff,
  Radio,
  Maximize2,
  Minimize2,
  Layers,
  Activity,
  AlertTriangle,
  Info
} from 'lucide-react';

// Leaflet types and imports using CDN
declare global {
  interface Window {
    L: any;
  }
}

interface MapLayer {
  id: string;
  name: string;
  url: string;
  attribution: string;
}

const MAP_LAYERS: MapLayer[] = [
  {
    id: 'streets',
    name: 'Streets',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors'
  },
  {
    id: 'satellite',
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles © Esri'
  },
  {
    id: 'topo',
    name: 'Topographic',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenTopoMap contributors'
  },
  {
    id: 'dark',
    name: 'Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '© OpenStreetMap, © CartoDB'
  }
];

export default function LiveFleetMap() {
  const { aircraftPositions, aircraftStatuses, loading, error, refetch } = useSatcomDirect();
  const [selectedAircraft, setSelectedAircraft] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<string>('streets');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);

  // Load Leaflet dynamically
  useEffect(() => {
    if (!window.L) {
      // Add Leaflet CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      // Add Leaflet JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        setMapLoaded(true);
      };
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || mapRef.current) return;

    const L = window.L;

    // Initialize map centered on US
    const map = L.map('fleet-map', {
      center: [39.8283, -98.5795], // Center of US
      zoom: 4,
      zoomControl: true,
      attributionControl: true
    });

    // Add default tile layer
    const currentLayer = MAP_LAYERS.find(l => l.id === activeLayer) || MAP_LAYERS[0];
    L.tileLayer(currentLayer.url, {
      attribution: currentLayer.attribution,
      maxZoom: 18,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapLoaded]);

  // Update map layer
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    const L = window.L;

    // Remove all tile layers
    mapRef.current.eachLayer((layer: any) => {
      if (layer instanceof L.TileLayer) {
        mapRef.current.removeLayer(layer);
      }
    });

    // Add new layer
    const currentLayer = MAP_LAYERS.find(l => l.id === activeLayer) || MAP_LAYERS[0];
    L.tileLayer(currentLayer.url, {
      attribution: currentLayer.attribution,
      maxZoom: 18,
    }).addTo(mapRef.current);
  }, [activeLayer, mapLoaded]);

  // Update aircraft markers
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !window.L) return;

    const L = window.L;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    // Create custom aircraft icon - different styling for parked vs flying
    const createAircraftIcon = (aircraft: any, isSelected: boolean) => {
      const isOnline = aircraftStatuses.find(s => s.tailNumber === aircraft.tailNumber)?.isOnline;
      const isParked = aircraft.flightPhase === 'Parked';

      // Different colors for parked aircraft
      let color;
      if (isSelected) {
        color = '#3b82f6'; // Blue when selected
      } else if (isParked) {
        color = '#9ca3af'; // Gray for parked
      } else if (isOnline) {
        color = '#10b981'; // Green for flying online
      } else {
        color = '#ef4444'; // Red for offline
      }

      const size = isParked ? 24 : 32; // Smaller icon for parked aircraft
      const iconSize = isSelected ? size * 1.3 : size;

      return L.divIcon({
        className: 'custom-aircraft-marker',
        html: `
          <div style="position: relative;">
            <div style="
              width: ${iconSize}px;
              height: ${iconSize}px;
              background: ${color};
              border: 2px solid white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              transform: rotate(${aircraft.heading || 0}deg);
              opacity: ${isParked ? '0.7' : '1'};
            ">
              <svg width="${iconSize * 0.5}" height="${iconSize * 0.5}" viewBox="0 0 24 24" fill="white">
                ${isParked ?
            // Landing icon for parked aircraft
            '<path d="M2.5 19h19v2h-19v-2zm7.18-5.73l4.35 1.16 5.31 1.42c.8.21 1.62-.26 1.84-1.06.21-.8-.26-1.62-1.06-1.84l-5.31-1.42-2.76-9.02L10.12 2v8.28L5.15 8.95l-.93-2.32-1.45-.39v5.17l1.45.39 4.46 1.47z"/>'
            :
            // Flying icon for in-air aircraft  
            '<path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>'
          }
              </svg>
            </div>
            ${isOnline !== undefined ? `
              <div style="
                position: absolute;
                top: -2px;
                right: -2px;
                width: 10px;
                height: 10px;
                background: ${isOnline ? '#10b981' : '#ef4444'};
                border: 2px solid white;
                border-radius: 50%;
              "></div>
            ` : ''}
            ${isParked ? `
              <div style="
                position: absolute;
                bottom: -20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0,0,0,0.7);
                color: white;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 10px;
                white-space: nowrap;
                pointer-events: none;
              ">PARKED</div>
            ` : ''}
          </div>
        `,
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize / 2, iconSize / 2],
        popupAnchor: [0, -iconSize / 2]
      });
    };

    // Add markers for each aircraft (including parked)
    aircraftPositions.forEach(aircraft => {

      const isSelected = selectedAircraft === aircraft.tailNumber;
      const marker = L.marker([aircraft.latitude, aircraft.longitude], {
        icon: createAircraftIcon(aircraft, isSelected),
        zIndexOffset: isSelected ? 1000 : 0
      }).addTo(mapRef.current);

      // Create popup content
      const status = aircraftStatuses.find(s => s.tailNumber === aircraft.tailNumber);
      const popupContent = `
        <div style="min-width: 200px;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px;">
            ${aircraft.tailNumber}
            ${aircraft.callSign ? `<span style="color: #6b7280; font-weight: 400;"> • ${aircraft.callSign}</span>` : ''}
          </div>
          <div style="font-size: 12px; color: #374151; line-height: 1.6;">
            <div><strong>Status:</strong> ${aircraft.flightPhase}</div>
            <div><strong>Altitude:</strong> ${aircraft.altitude.toLocaleString()} ft</div>
            <div><strong>Speed:</strong> ${aircraft.groundSpeed} kts</div>
            <div><strong>Heading:</strong> ${aircraft.heading}°</div>
            ${aircraft.departureAirport && aircraft.arrivalAirport ? `
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                <div><strong>Route:</strong> ${aircraft.departureAirport} → ${aircraft.arrivalAirport}</div>
              </div>
            ` : ''}
            ${status ? `
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                <div style="display: flex; align-items: center; gap: 4px;">
                  <div style="
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: ${status.isOnline ? '#10b981' : '#ef4444'};
                  "></div>
                  <span>${status.satcomStatus}</span>
                </div>
              </div>
            ` : ''}
          </div>
          <button 
            onclick="window.selectAircraft('${aircraft.tailNumber}')" 
            style="
              margin-top: 12px;
              width: 100%;
              padding: 6px 12px;
              background: #3b82f6;
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 12px;
              font-weight: 500;
            "
          >
            View Details
          </button>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'aircraft-popup'
      });

      marker.on('click', () => {
        setSelectedAircraft(aircraft.tailNumber);
      });

      markersRef.current.push(marker);

      // Draw flight path for in-flight aircraft (not parked)
      if (aircraft.flightPhase !== 'Parked' && aircraft.departureAirport && aircraft.arrivalAirport) {
        // Approximate airport locations (in production, use actual coordinates from airport database)
        const airportCoords: { [key: string]: [number, number] } = {
          'LAX': [33.9416, -118.4085],
          'JFK': [40.6413, -73.7781],
          'MIA': [25.7959, -80.2870],
          'ORD': [41.9742, -87.9073],
          'LGA': [40.7769, -73.8740],
          'EWR': [40.6895, -74.1745],
          'ATL': [33.6407, -84.4277]
        };

        const depCoords = airportCoords[aircraft.departureAirport];
        const arrCoords = airportCoords[aircraft.arrivalAirport];

        if (depCoords && arrCoords) {
          // Create flight path from departure through current position to arrival
          const pathCoordinates = [
            depCoords,
            [aircraft.latitude, aircraft.longitude],
            arrCoords
          ];

          const flightPath = L.polyline(pathCoordinates, {
            color: isSelected ? '#3b82f6' : '#10b981',
            weight: isSelected ? 3 : 2,
            opacity: isSelected ? 0.8 : 0.5,
            dashArray: '10, 5'
          }).addTo(mapRef.current);

          markersRef.current.push(flightPath);

          // Add departure and arrival airport markers
          const depMarker = L.circleMarker(depCoords, {
            radius: 5,
            fillColor: '#3b82f6',
            color: 'white',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
          }).addTo(mapRef.current).bindPopup(`Departure: ${aircraft.departureAirport}`);

          const arrMarker = L.circleMarker(arrCoords, {
            radius: 5,
            fillColor: '#ef4444',
            color: 'white',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
          }).addTo(mapRef.current).bindPopup(`Arrival: ${aircraft.arrivalAirport}`);

          markersRef.current.push(depMarker, arrMarker);
        }
      }
    });

    // Fit bounds to show all aircraft
    if (aircraftPositions.length > 0 && !selectedAircraft) {
      const bounds = L.latLngBounds(
        aircraftPositions
          .filter(a => a.flightPhase !== 'Parked')
          .map(a => [a.latitude, a.longitude])
      );
      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }

    // Center on selected aircraft
    if (selectedAircraft) {
      const selected = aircraftPositions.find(a => a.tailNumber === selectedAircraft);
      if (selected) {
        mapRef.current.setView([selected.latitude, selected.longitude], 8, {
          animate: true
        });
      }
    }
  }, [aircraftPositions, aircraftStatuses, selectedAircraft, mapLoaded]);

  // Global function for popup button
  useEffect(() => {
    (window as any).selectAircraft = (tailNumber: string) => {
      setSelectedAircraft(tailNumber);
    };
  }, []);

  const selectedAircraftData = aircraftPositions.find(a => a.tailNumber === selectedAircraft);
  const selectedAircraftStatus = aircraftStatuses.find(s => s.tailNumber === selectedAircraft);

  const getFlightPhaseColor = (phase: string) => {
    switch (phase) {
      case 'Cruise': return 'text-green-500';
      case 'Climb': case 'Takeoff': return 'text-blue-500';
      case 'Descent': case 'Approach': case 'Landing': return 'text-orange-500';
      case 'Parked': return 'text-gray-500';
      case 'Taxiing': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const activeFlights = aircraftPositions.filter(a => a.flightPhase !== 'Parked');

  if (!mapLoaded) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading map...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Map Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">Live Fleet Tracking</h4>
          <Badge variant="outline" className="text-xs">
            {activeFlights.length} active {activeFlights.length === 1 ? 'flight' : 'flights'}
          </Badge>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Layer Selector */}
          <div className="flex items-center gap-1 bg-white border rounded-lg p-1">
            {MAP_LAYERS.map(layer => (
              <Button
                key={layer.id}
                variant={activeLayer === layer.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveLayer(layer.id)}
                className="text-xs h-7"
              >
                {layer.name}
              </Button>
            ))}
          </div>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={loading}
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Map Container */}
      <div className={`grid grid-cols-1 lg:grid-cols-4 gap-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-4' : ''}`}>
        {/* Map Display */}
        <div className={isFullscreen ? 'lg:col-span-3' : 'lg:col-span-3'}>
          <Card className="h-full">
            <CardContent className="p-0 relative">
              <div
                id="fleet-map"
                className={isFullscreen ? 'h-[calc(100vh-8rem)]' : 'h-[600px]'}
                style={{ width: '100%' }}
              />

              {/* Fullscreen Toggle */}
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-4 right-4 z-[1000] shadow-lg"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>

              {/* Fleet Summary Overlay */}
              <div className="absolute bottom-4 left-4 z-[1000]">
                <Card className="bg-white/95 backdrop-blur-sm border shadow-lg">
                  <CardContent className="p-3 space-y-2">
                    <div className="text-xs font-medium">Fleet Summary</div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                        <span>Online: {aircraftStatuses.filter(s => s.isOnline).length}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Plane className="w-3 h-3 text-blue-500" />
                        <span>Active: {activeFlights.length}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                        <span>Offline: {aircraftStatuses.filter(s => !s.isOnline).length}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-gray-500" />
                        <span>Parked: {aircraftPositions.filter(a => a.flightPhase === 'Parked').length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Last Update Timestamp */}
              <div className="absolute top-4 left-4 z-[1000]">
                <Badge variant="secondary" className="text-xs shadow-lg">
                  <Clock className="w-3 h-3 mr-1" />
                  Updated {new Date().toLocaleTimeString()}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Aircraft Details Panel */}
        <div className={isFullscreen ? 'lg:col-span-1' : 'lg:col-span-1'}>
          <Card className={isFullscreen ? 'h-[calc(100vh-8rem)]' : 'h-[600px]'}>
            <CardHeader>
              <CardTitle className="text-sm">Aircraft Details</CardTitle>
              <CardDescription className="text-xs">
                {selectedAircraft ? 'Selected aircraft information' : 'Click aircraft to view details'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedAircraftData && selectedAircraftStatus ? (
                <ScrollArea className="h-[calc(100%-4rem)]">
                  <div className="space-y-4">
                    {/* Basic Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Plane className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">{selectedAircraftData.tailNumber}</span>
                        {selectedAircraftData.callSign && (
                          <Badge variant="outline" className="text-xs">
                            {selectedAircraftData.callSign}
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <div className={`${getFlightPhaseColor(selectedAircraftData.flightPhase)} font-medium`}>
                            {selectedAircraftData.flightPhase}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Connection:</span>
                          <div className={`flex items-center gap-1 ${selectedAircraftStatus.isOnline ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {selectedAircraftStatus.isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                            {selectedAircraftStatus.satcomStatus}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Position */}
                    <div>
                      <h5 className="font-medium text-sm mb-2">Position</h5>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Latitude:</span>
                          <span className="font-mono">{selectedAircraftData.latitude.toFixed(4)}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Longitude:</span>
                          <span className="font-mono">{selectedAircraftData.longitude.toFixed(4)}°</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Flight Data */}
                    <div>
                      <h5 className="font-medium text-sm mb-2">Flight Data</h5>
                      <div className="space-y-2 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-muted-foreground">Altitude:</span>
                            <div className="font-medium">{selectedAircraftData.altitude.toLocaleString()} ft</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Speed:</span>
                            <div className="font-medium">{selectedAircraftData.groundSpeed} kts</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-muted-foreground">Heading:</span>
                            <div className="font-medium">{selectedAircraftData.heading}°</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">V/S:</span>
                            <div className="font-medium">
                              {selectedAircraftData.verticalSpeed > 0 ? '+' : ''}
                              {selectedAircraftData.verticalSpeed} fpm
                            </div>
                          </div>
                        </div>
                        {selectedAircraftData.fuelRemaining && (
                          <div>
                            <span className="text-muted-foreground">Fuel:</span>
                            <div className="font-medium">{selectedAircraftData.fuelRemaining.toLocaleString()} lbs</div>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Route Info */}
                    {selectedAircraftData.departureAirport && selectedAircraftData.arrivalAirport && (
                      <>
                        <div>
                          <h5 className="font-medium text-sm mb-2">Route</h5>
                          <div className="text-xs">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-muted-foreground">From:</span>
                              <span className="font-medium">{selectedAircraftData.departureAirport}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-muted-foreground">To:</span>
                              <span className="font-medium">{selectedAircraftData.arrivalAirport}</span>
                            </div>
                            {selectedAircraftData.estimatedArrival && (
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">ETA:</span>
                                <span className="font-medium">
                                  {new Date(selectedAircraftData.estimatedArrival).toLocaleTimeString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Separator />
                      </>
                    )}

                    {/* System Health */}
                    {selectedAircraftStatus.systemHealth && (
                      <>
                        <div>
                          <h5 className="font-medium text-sm mb-2">System Health</h5>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <Activity className={`w-3 h-3 ${selectedAircraftStatus.systemHealth.engine === 'Normal' ? 'text-green-600' :
                                  selectedAircraftStatus.systemHealth.engine === 'Caution' ? 'text-yellow-600' : 'text-red-600'
                                }`} />
                              <span>Engine: {selectedAircraftStatus.systemHealth.engine}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Activity className={`w-3 h-3 ${selectedAircraftStatus.systemHealth.hydraulics === 'Normal' ? 'text-green-600' :
                                  selectedAircraftStatus.systemHealth.hydraulics === 'Caution' ? 'text-yellow-600' : 'text-red-600'
                                }`} />
                              <span>Hydraulics: {selectedAircraftStatus.systemHealth.hydraulics}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Zap className={`w-3 h-3 ${selectedAircraftStatus.systemHealth.electrical === 'Normal' ? 'text-green-600' :
                                  selectedAircraftStatus.systemHealth.electrical === 'Caution' ? 'text-yellow-600' : 'text-red-600'
                                }`} />
                              <span>Electrical: {selectedAircraftStatus.systemHealth.electrical}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Radio className={`w-3 h-3 ${selectedAircraftStatus.systemHealth.avionics === 'Normal' ? 'text-green-600' :
                                  selectedAircraftStatus.systemHealth.avionics === 'Caution' ? 'text-yellow-600' : 'text-red-600'
                                }`} />
                              <span>Avionics: {selectedAircraftStatus.systemHealth.avionics}</span>
                            </div>
                          </div>
                        </div>
                        <Separator />
                      </>
                    )}

                    {/* Active Alerts */}
                    {selectedAircraftStatus.alerts.length > 0 && (
                      <div>
                        <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          Active Alerts
                        </h5>
                        <div className="space-y-1">
                          {selectedAircraftStatus.alerts.map((alert) => (
                            <div key={alert.id} className={`p-2 rounded text-xs border ${alert.severity === 'Emergency' ? 'bg-red-50 border-red-200 text-red-800' :
                                alert.severity === 'Warning' ? 'bg-orange-50 border-orange-200 text-orange-800' :
                                  alert.severity === 'Caution' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                                    'bg-blue-50 border-blue-200 text-blue-800'
                              }`}>
                              <div className="font-medium">{alert.type} Alert</div>
                              <div>{alert.message}</div>
                              {alert.acknowledged && (
                                <div className="text-xs text-muted-foreground mt-1">✓ Acknowledged</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Clear Selection Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setSelectedAircraft(null)}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Click an aircraft on the map to view detailed information</p>
                  <div className="mt-4 space-y-1 text-xs">
                    <div className="flex items-center justify-center gap-2">
                      <Plane className="w-3 h-3 text-blue-500" />
                      <span>{activeFlights.length} aircraft in flight</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>{aircraftStatuses.filter(s => s.isOnline).length} online</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Info Alert */}
      {activeFlights.length === 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <div className="font-medium">No active flights</div>
              <div className="text-blue-700">All aircraft are currently parked. The map will update automatically when flights become active.</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
