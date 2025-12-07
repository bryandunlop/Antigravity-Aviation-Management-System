import React, { useState } from 'react';
import FleetStatusWidget from './FleetStatusWidget';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import { 
  Plane, 
  Wrench, 
  Sparkles,
  FileText,
  Settings
} from 'lucide-react';

export default function AircraftStatus() {
  const [filter, setFilter] = useState('all');
  
  const aircraftData = [
    {
      id: 'N123AB',
      type: 'Boeing 737-800',
      status: 'In Flight',
      location: 'En Route LAX-JFK',
      altitude: '35,000 ft',
      speed: '420 kts',
      eta: '11:30 EST',
      fuel: '85%',
      passengers: '156/180',
      crew: '6',
      issues: [],
      nextMaintenance: '2025-02-15',
      flightNumber: 'FO001'
    },
    {
      id: 'N456CD',
      type: 'Airbus A320',
      status: 'Ground',
      location: 'JFK Gate 12',
      altitude: '0 ft',
      speed: '0 kts',
      eta: 'Boarding',
      fuel: '92%',
      passengers: '0/150',
      crew: '5',
      issues: ['Cabin pressure warning light'],
      nextMaintenance: '2025-02-08',
      flightNumber: 'FO002'
    },
    {
      id: 'N789EF',
      type: 'Boeing 777-300',
      status: 'Maintenance',
      location: 'MIA Hangar 3',
      altitude: '0 ft',
      speed: '0 kts',
      eta: 'TBD',
      fuel: '15%',
      passengers: '0/350',
      crew: '0',
      issues: ['Engine 2 oil pressure low', 'Landing gear actuator replacement'],
      nextMaintenance: '2025-02-05',
      flightNumber: null
    },
    {
      id: 'N321GH',
      type: 'Embraer E175',
      status: 'Available',
      location: 'LAX Ramp A4',
      altitude: '0 ft',
      speed: '0 kts',
      eta: 'Ready',
      fuel: '78%',
      passengers: '0/76',
      crew: '0',
      issues: [],
      nextMaintenance: '2025-02-20',
      flightNumber: null
    }
  ];

  const filteredAircraft = aircraftData.filter(aircraft => {
    if (filter === 'all') return true;
    return aircraft.status.toLowerCase().replace(' ', '') === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in flight': return 'bg-green-100 text-green-800 border-green-200';
      case 'ground': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'available': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in flight': return <Plane className="w-4 h-4" />;
      case 'ground': return <MapPin className="w-4 h-4" />;
      case 'maintenance': return <Settings className="w-4 h-4" />;
      case 'available': return <CheckCircle className="w-4 h-4" />;
      default: return <Plane className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3">
            <Plane className="w-8 h-8 text-blue-600" />
            Aircraft Status
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive fleet monitoring with flight, service, and cleaning status
          </p>
        </div>
      </div>

      {/* Main Fleet Status Widget */}
      <FleetStatusWidget compact={false} showDetailsLink={false} />

      {/* Quick Access Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Cleaning Management
            </CardTitle>
            <CardDescription>Track and manage aircraft cleaning status</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/aircraft-cleaning">
              <Button className="w-full">
                Go to Cleaning Tracker
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wrench className="w-5 h-5 text-blue-600" />
              Maintenance Hub
            </CardTitle>
            <CardDescription>View work orders and maintenance status</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/maintenance-hub">
              <Button className="w-full">
                Go to Maintenance
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="w-5 h-5 text-green-600" />
              Tech Log
            </CardTitle>
            <CardDescription>Report squawks and discrepancies</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/tech-log">
              <Button className="w-full">
                Go to Tech Log
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}