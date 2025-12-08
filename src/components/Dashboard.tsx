import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import LiveFleetMap from './LiveFleetMap';
import InflightUpcomingFlights from './InflightUpcomingFlights';
import FleetStatusWidget from './FleetStatusWidget';
import ScheduleCalendar from './ScheduleCalendar';
import NASImpactWidget from './NASImpactWidget';
import { useFlightNASImpact } from './hooks/useFlightNASImpact';
import { useSatcomDirect } from './hooks/useSatcomDirect';
import {
  Plane,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Calendar,
  FileText,
  Wrench,
  BarChart3,
  Shield,
  Target,
  UserCheck,
  Utensils,
  Package,
  ClipboardCheck,
  Fuel,
  Plus,
  Activity,
  BookOpen,
  Send,
  ChefHat,
  Radio,
  Wifi,
  Zap,
  MapPin,
  Bell,
  CloudRain,
  TrendingUp,
  Eye
} from 'lucide-react';

interface DashboardProps {
  userRole: string;
}

interface QuickAction {
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
  external?: boolean;
}

export default function Dashboard({ userRole }: DashboardProps) {
  const { impactData } = useFlightNASImpact();
  const { fleetSummary, getActiveFlights } = useSatcomDirect();

  // Role-based quick actions - simplified to 4 most important
  const getQuickActions = (): QuickAction[] => {
    switch (userRole) {
      case 'pilot':
        return [
          { title: 'ForeFlight Dispatch', description: 'Flight planning & weather', icon: MapPin, href: 'https://dispatch.foreflight.com', color: 'bg-blue-500', external: true },
          { title: 'Create FRAT', description: 'Flight Risk Assessment', icon: FileText, href: '/frat', color: 'bg-green-500' },
          { title: 'Safety Center', description: 'Report hazards & incidents', icon: Shield, href: '/safety', color: 'bg-red-500' },
          { title: 'Aircraft Status', description: 'Monitor fleet status', icon: Plane, href: '/aircraft', color: 'bg-purple-500' }
        ];
      case 'inflight':
        return [
          { title: 'Safety Center', description: 'Report hazards & incidents', icon: Shield, href: '/safety', color: 'bg-red-500' },
          { title: 'Passenger Database', description: 'Safety & preferences', icon: Users, href: '/passenger-database', color: 'bg-green-500' },
          { title: 'Catering Orders', description: 'Flight catering management', icon: Utensils, href: '/catering-orders', color: 'bg-purple-500' },
          { title: 'Calendar View', description: 'Full flight calendar', icon: Calendar, href: '/upcoming-flights', color: 'bg-blue-500' }
        ];
      case 'maintenance':
        return [
          { title: 'Maintenance Board', description: 'Scheduled work', icon: Wrench, href: '/maintenance', color: 'bg-blue-500' },
          { title: 'Safety Center', description: 'Report hazards & incidents', icon: Shield, href: '/safety', color: 'bg-red-500' },
          { title: 'Tech Log', description: 'Aircraft discrepancies', icon: FileText, href: '/tech-log', color: 'bg-green-500' },
          { title: 'Parts Inventory', description: 'Stock levels', icon: Package, href: '/aircraft-inventory', color: 'bg-purple-500' }
        ];
      case 'safety':
        return [
          { title: 'Safety Center', description: 'All safety tools', icon: Shield, href: '/safety', color: 'bg-blue-500' },
          { title: 'FRAT Review', description: 'Pending approvals', icon: FileText, href: '/frat/review', color: 'bg-green-500' },
          { title: 'Hazard Reports', description: 'Safety incidents', icon: AlertTriangle, href: '/safety/hazards', color: 'bg-orange-500' },
          { title: 'Compliance Review', description: 'Document tracking', icon: UserCheck, href: '/safety/compliance', color: 'bg-purple-500' }
        ];
      case 'scheduling':
        return [
          { title: 'ForeFlight Dispatch', description: 'Flight planning & weather', icon: MapPin, href: 'https://dispatch.foreflight.com', color: 'bg-blue-500', external: true },
          { title: 'Scheduling Dashboard', description: 'Flight operations', icon: Calendar, href: '/scheduling-dashboard', color: 'bg-green-500' },
          { title: 'Crew Currency', description: 'Pilot qualifications', icon: UserCheck, href: '/crew-management', color: 'bg-purple-500' },
          { title: 'Aircraft Status', description: 'Fleet availability', icon: Plane, href: '/aircraft', color: 'bg-orange-500' }
        ];
      case 'document-manager':
        return [
          { title: 'Document Management', description: 'Publish & distribute', icon: Plus, href: '/document-management', color: 'bg-blue-500' },
          { title: 'Review Queue', description: 'Pending requests', icon: FileText, href: '/document-management/queue', color: 'bg-green-500' },
          { title: 'Compliance Tracking', description: 'Monitor acknowledgments', icon: CheckCircle, href: '/document-management', color: 'bg-orange-500' },
          { title: 'Document Analytics', description: 'Engagement metrics', icon: BarChart3, href: '/document-management', color: 'bg-purple-500' }
        ];
      case 'admin-assistant':
        return [
          { title: 'Trip Management', description: 'Client trips & itineraries', icon: BookOpen, href: '/booking-profile', color: 'bg-blue-500' },
          { title: 'Passenger Database', description: 'Client profiles', icon: Users, href: '/passenger-database', color: 'bg-green-500' },
          { title: 'Schedule View', description: 'Flight operations', icon: Calendar, href: '/schedule', color: 'bg-purple-500' },
          { title: 'Documents', description: 'Forms & procedures', icon: FileText, href: '/documents', color: 'bg-orange-500' }
        ];
      case 'admin':
      case 'lead':
        return [
          { title: 'Lead Dashboard', description: 'KPIs and analytics', icon: BarChart3, href: '/lead-dashboard', color: 'bg-blue-500' },
          { title: 'Trip Management', description: 'Trip coordination', icon: BookOpen, href: '/booking-profile', color: 'bg-green-500' },
          { title: 'Fleet Status', description: 'Aircraft overview', icon: Plane, href: '/aircraft', color: 'bg-purple-500' },
          { title: 'Safety Center', description: 'All safety tools', icon: Shield, href: '/safety', color: 'bg-orange-500' }
        ];
      default:
        return [
          { title: 'Document Request', description: 'Request document changes', icon: Send, href: '/document-management', color: 'bg-blue-500' },
          { title: 'Safety Center', description: 'Report safety concerns', icon: Shield, href: '/safety', color: 'bg-orange-500' },
          { title: 'Schedule View', description: 'Flight operations', icon: Calendar, href: '/schedule', color: 'bg-green-500' },
          { title: 'Documents', description: 'Manuals & procedures', icon: FileText, href: '/documents', color: 'bg-purple-500' }
        ];
    }
  };

  const quickActions = getQuickActions();

  // Simplified flight data - only current critical flights
  const getCriticalFlights = () => {
    const now = new Date();
    const currentHour = now.getHours();

    // Show only flights that are happening now or soon
    return [
      { id: 'FO001', departure: '08:00', arrival: '11:30', route: 'LAX → JFK', status: 'On Time', aircraft: 'N123AB' },
      { id: 'FO002', departure: '14:15', arrival: '17:45', route: 'JFK → MIA', status: 'Delayed', aircraft: 'N456CD' },
      { id: 'FO003', departure: '19:30', arrival: '22:00', route: 'MIA → LAX', status: 'Boarding', aircraft: 'N789EF' }
    ].filter(flight => {
      const flightHour = parseInt(flight.departure.split(':')[0]);
      return Math.abs(flightHour - currentHour) <= 4; // Show flights within 4 hours
    });
  };

  const criticalFlights = getCriticalFlights();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'on time': return 'bg-green-100 text-green-800';
      case 'delayed': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'boarding': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get active flights from Satcom Direct
  const activeFlights = getActiveFlights();

  // Get current time and greeting
  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto">
      {/* Clean Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{getCurrentGreeting()}</h1>
          <p className="text-muted-foreground">
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Last updated: {new Date().toLocaleTimeString()}
          </Badge>
        </div>
      </div>

      {/* Essential Metrics - Clean and Simple */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="aviation-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Flights</p>
                <p className="text-2xl font-bold text-blue-600">{fleetSummary?.activeFlights || 0}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Plane className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="aviation-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fleet Online</p>
                <p className="text-2xl font-bold text-green-600">{fleetSummary?.onlineAircraft || 0}/{fleetSummary?.totalAircraft || 0}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Wifi className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="aviation-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">System Health</p>
                <p className="text-2xl font-bold text-green-600">
                  {fleetSummary?.systemAlerts === 0 ? 'Normal' : `${fleetSummary?.systemAlerts || 0} Alerts`}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${fleetSummary?.systemAlerts === 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {fleetSummary?.systemAlerts === 0 ?
                  <CheckCircle className="w-5 h-5 text-green-600" /> :
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                }
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="aviation-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Weather Impact</p>
                <p className="text-2xl font-bold text-orange-600">{impactData.totalImpacted}</p>
              </div>
              <div className={`p-2 rounded-lg ${impactData.totalImpacted === 0 ? 'bg-green-100' : 'bg-orange-100'}`}>
                {impactData.totalImpacted === 0 ?
                  <CheckCircle className="w-5 h-5 text-green-600" /> :
                  <CloudRain className="w-5 h-5 text-orange-600" />
                }
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fleet Status Widget - Now visible to all users */}
      <FleetStatusWidget compact={false} showDetailsLink={true} />

      {/* Quick Actions - Streamlined */}
      <Card className="aviation-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent" />
            Quick Actions
          </CardTitle>
          <CardDescription>Essential tools for your role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;

              if (action.external) {
                return (
                  <a
                    key={index}
                    href={action.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="group p-4 border rounded-lg hover:bg-accent/5 hover:border-accent/20 transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 ${action.color} text-white rounded-md group-hover:scale-105 transition-transform`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{action.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              }

              return (
                <Link key={index} to={action.href}>
                  <div className="group p-4 border rounded-lg hover:bg-accent/5 hover:border-accent/20 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${action.color} text-white rounded-md group-hover:scale-105 transition-transform`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{action.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Flights for Inflight Users */}
      {userRole === 'inflight' && (
        <InflightUpcomingFlights compact={true} />
      )}

      {/* NAS Impact Alerts for Pilots */}
      {userRole === 'pilot' && (
        <NASImpactWidget pilotName="Current Pilot" compact={false} maxFlights={3} />
      )}

      {/* Fleet Map - Enhanced with Real Map */}
      <LiveFleetMap />

      {/* Full Schedule Calendar */}
      <ScheduleCalendar />
    </div>
  );
}