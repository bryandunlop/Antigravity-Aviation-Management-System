import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Link } from 'react-router-dom';
import { 
  Plane, 
  MapPin, 
  Wrench,
  CheckCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronRight,
  Activity,
  Settings,
  XCircle,
  TrendingUp
} from 'lucide-react';

interface AircraftStatus {
  id: string;
  tailNumber: string;
  model: string;
  flightStatus: 'in-flight' | 'on-ground' | 'taxi' | 'parked';
  serviceStatus: 'in-service' | 'out-of-service' | 'in-maintenance' | 'aog';
  cleaningStatus: {
    status: 'clean' | 'needs-cleaning' | 'cleaning-in-progress' | 'verified';
    lastCleaned?: string;
    nextDue?: string;
    cleanedBy?: string;
  };
  location?: string;
  currentFlight?: string;
  nextMaintenance?: string;
  issues?: number;
  hobbsTime?: string;
  utilization?: number;
}

interface FleetStatusWidgetProps {
  compact?: boolean;
  showDetailsLink?: boolean;
}

export default function FleetStatusWidget({ compact = false, showDetailsLink = true }: FleetStatusWidgetProps) {
  const [aircraft, setAircraft] = useState<AircraftStatus[]>([]);

  // Initialize mock data - this would come from Supabase in production
  useEffect(() => {
    const mockAircraft: AircraftStatus[] = [
      {
        id: 'ac1',
        tailNumber: 'N650GX',
        model: 'Gulfstream G650',
        flightStatus: 'in-flight',
        serviceStatus: 'in-service',
        cleaningStatus: {
          status: 'verified',
          lastCleaned: new Date(Date.now() - 3600000).toISOString(),
          cleanedBy: 'Sarah Johnson'
        },
        location: 'En Route TEB-LAX',
        currentFlight: 'FO-1234',
        nextMaintenance: '2025-02-15',
        issues: 0,
        hobbsTime: '4,523.5',
        utilization: 85
      },
      {
        id: 'ac2',
        tailNumber: 'N650ER',
        model: 'Gulfstream G650',
        flightStatus: 'on-ground',
        serviceStatus: 'in-service',
        cleaningStatus: {
          status: 'cleaning-in-progress',
          lastCleaned: new Date(Date.now() - 86400000).toISOString(),
          nextDue: new Date(Date.now() + 3600000).toISOString()
        },
        location: 'VNY - Parking Ramp',
        nextMaintenance: '2025-02-08',
        issues: 1,
        hobbsTime: '3,892.2',
        utilization: 72
      },
      {
        id: 'ac3',
        tailNumber: 'N650EX',
        model: 'Gulfstream G650',
        flightStatus: 'parked',
        serviceStatus: 'in-maintenance',
        cleaningStatus: {
          status: 'needs-cleaning',
          lastCleaned: new Date(Date.now() - 172800000).toISOString()
        },
        location: 'LAX - Hangar 5',
        nextMaintenance: 'In Progress',
        issues: 3,
        hobbsTime: '5,234.8',
        utilization: 45
      }
    ];

    setAircraft(mockAircraft);
  }, []);

  const getFlightStatusColor = (status: string) => {
    switch (status) {
      case 'in-flight': return 'bg-green-100 text-green-700 border-green-200';
      case 'on-ground': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'taxi': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'parked': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getServiceStatusColor = (status: string) => {
    switch (status) {
      case 'in-service': return 'bg-green-100 text-green-700';
      case 'out-of-service': return 'bg-red-100 text-red-700';
      case 'in-maintenance': return 'bg-yellow-100 text-yellow-700';
      case 'aog': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCleaningStatusColor = (status: string) => {
    switch (status) {
      case 'clean':
      case 'verified': return 'bg-green-100 text-green-700';
      case 'needs-cleaning': return 'bg-red-100 text-red-700';
      case 'cleaning-in-progress': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getFlightStatusIcon = (status: string) => {
    switch (status) {
      case 'in-flight': return <Plane className="w-4 h-4" />;
      case 'on-ground': return <MapPin className="w-4 h-4" />;
      case 'taxi': return <Activity className="w-4 h-4" />;
      case 'parked': return <MapPin className="w-4 h-4" />;
      default: return <Plane className="w-4 h-4" />;
    }
  };

  const getServiceStatusIcon = (status: string) => {
    switch (status) {
      case 'in-service': return <CheckCircle className="w-4 h-4" />;
      case 'out-of-service': return <XCircle className="w-4 h-4" />;
      case 'in-maintenance': return <Wrench className="w-4 h-4" />;
      case 'aog': return <AlertTriangle className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getCleaningStatusIcon = (status: string) => {
    switch (status) {
      case 'clean':
      case 'verified': return <Sparkles className="w-4 h-4" />;
      case 'needs-cleaning': return <AlertTriangle className="w-4 h-4" />;
      case 'cleaning-in-progress': return <Clock className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const formatStatusText = (status: string) => {
    return status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getFleetSummary = () => {
    const inFlight = aircraft.filter(a => a.flightStatus === 'in-flight').length;
    const inService = aircraft.filter(a => a.serviceStatus === 'in-service').length;
    const needsCleaning = aircraft.filter(a => 
      a.cleaningStatus.status === 'needs-cleaning' || 
      a.cleaningStatus.status === 'cleaning-in-progress'
    ).length;
    const totalIssues = aircraft.reduce((sum, a) => sum + (a.issues || 0), 0);

    return { inFlight, inService, needsCleaning, totalIssues };
  };

  const summary = getFleetSummary();

  if (compact) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Fleet Status</CardTitle>
            {showDetailsLink && (
              <Link to="/aircraft">
                <Button variant="ghost" size="sm">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Fleet Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
              <Plane className="w-4 h-4 text-green-600" />
              <div>
                <div className="text-xs text-gray-600">In Flight</div>
                <div className="font-semibold text-green-600">{summary.inFlight}/{aircraft.length}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <div>
                <div className="text-xs text-gray-600">In Service</div>
                <div className="font-semibold text-blue-600">{summary.inService}/{aircraft.length}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <div>
                <div className="text-xs text-gray-600">Need Clean</div>
                <div className="font-semibold text-purple-600">{summary.needsCleaning}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <div>
                <div className="text-xs text-gray-600">Issues</div>
                <div className="font-semibold text-orange-600">{summary.totalIssues}</div>
              </div>
            </div>
          </div>

          {/* Quick Aircraft List */}
          <div className="space-y-2 pt-2">
            {aircraft.map(ac => (
              <div key={ac.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2">
                  <Plane className="w-3 h-3 text-gray-400" />
                  <span className="text-sm font-medium">{ac.tailNumber}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className={`text-xs py-0 ${getFlightStatusColor(ac.flightStatus)}`}>
                    {formatStatusText(ac.flightStatus)}
                  </Badge>
                  {ac.cleaningStatus.status !== 'verified' && ac.cleaningStatus.status !== 'clean' && (
                    <Sparkles className="w-3 h-3 text-orange-500" />
                  )}
                  {(ac.issues || 0) > 0 && (
                    <AlertTriangle className="w-3 h-3 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full view
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Plane className="w-5 h-5 text-blue-600" />
              Gulfstream G650 Fleet Status
            </CardTitle>
            <CardDescription>Real-time aircraft status and cleaning tracker</CardDescription>
          </div>
          {showDetailsLink && (
            <Link to="/aircraft">
              <Button variant="outline" size="sm">
                View Details
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Fleet Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Plane className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Active Flights</div>
              <div className="text-xl font-semibold text-green-600">{summary.inFlight}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">In Service</div>
              <div className="text-xl font-semibold text-blue-600">{summary.inService}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Need Cleaning</div>
              <div className="text-xl font-semibold text-purple-600">{summary.needsCleaning}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Issues</div>
              <div className="text-xl font-semibold text-orange-600">{summary.totalIssues}</div>
            </div>
          </div>
        </div>

        {/* Individual Aircraft Cards */}
        <div className="space-y-3">
          {aircraft.map(ac => (
            <Card key={ac.id} className="overflow-hidden border border-gray-200">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Aircraft Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Plane className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold">{ac.tailNumber}</div>
                        <div className="text-sm text-gray-500">{ac.model}</div>
                        {ac.location && (
                          <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {ac.location}
                          </div>
                        )}
                      </div>
                    </div>
                    {ac.currentFlight && (
                      <Badge variant="outline" className="bg-blue-50">
                        {ac.currentFlight}
                      </Badge>
                    )}
                  </div>

                  {/* Status Badges */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Flight Status */}
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">Flight Status</div>
                      <Badge 
                        variant="outline" 
                        className={`w-full justify-start gap-1 ${getFlightStatusColor(ac.flightStatus)}`}
                      >
                        {getFlightStatusIcon(ac.flightStatus)}
                        <span className="text-xs">{formatStatusText(ac.flightStatus)}</span>
                      </Badge>
                    </div>

                    {/* Service Status */}
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">Service Status</div>
                      <Badge 
                        variant="outline" 
                        className={`w-full justify-start gap-1 ${getServiceStatusColor(ac.serviceStatus)}`}
                      >
                        {getServiceStatusIcon(ac.serviceStatus)}
                        <span className="text-xs">{formatStatusText(ac.serviceStatus)}</span>
                      </Badge>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                    <div className="text-xs">
                      <div className="text-gray-500">Utilization</div>
                      <div className="flex items-center gap-1">
                        <div className="font-medium">{ac.utilization}%</div>
                        <TrendingUp className="w-3 h-3 text-green-500" />
                      </div>
                    </div>
                    {ac.issues && ac.issues > 0 && (
                      <div className="text-xs">
                        <div className="text-gray-500">Open Issues</div>
                        <div className="font-medium text-orange-600">{ac.issues}</div>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-2">
                    <Link to={`/tech-log?aircraft=${ac.tailNumber}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Tech Log
                      </Button>
                    </Link>
                    <Link to="/aircraft-cleaning" className="flex-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        disabled={ac.cleaningStatus.status === 'verified'}
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        Cleaning
                      </Button>
                    </Link>
                    <Link to="/maintenance-hub" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Wrench className="w-3 h-3 mr-1" />
                        Maintenance
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Links */}
        <div className="flex gap-2 pt-2">
          <Link to="/aircraft-cleaning" className="flex-1">
            <Button variant="outline" className="w-full">
              <Sparkles className="w-4 h-4 mr-2" />
              Manage Cleaning
            </Button>
          </Link>
          <Link to="/aircraft" className="flex-1">
            <Button variant="outline" className="w-full">
              <Plane className="w-4 h-4 mr-2" />
              Full Status View
            </Button>
          </Link>
          <Link to="/fleet-map" className="flex-1">
            <Button variant="outline" className="w-full">
              <MapPin className="w-4 h-4 mr-2" />
              Live Map
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}