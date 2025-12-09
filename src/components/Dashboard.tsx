import React, { useState, useEffect, useCallback } from 'react';
import { CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LiquidCard } from './LiquidCard';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import LiveFleetMap from './LiveFleetMap';
import InflightUpcomingFlights from './InflightUpcomingFlights';
import FleetStatusWidget from './FleetStatusWidget';
import ScheduleCalendar from './ScheduleCalendar';
import NASImpactWidget from './NASImpactWidget';
import OnShiftWidget from './OnShiftWidget';
import { useFlightNASImpact } from './hooks/useFlightNASImpact';
import { useSatcomDirect } from './hooks/useSatcomDirect';
import {
  Plane,
  Users,
  AlertTriangle,
  CheckCircle,
  Calendar,
  FileText,
  Wrench,
  BarChart3,
  Shield,
  UserCheck,
  Utensils,
  Package,
  Plus,
  Activity,
  BookOpen,
  Send,
  Wifi,
  CloudRain,
  MapPin,
  Settings,
  RotateCcw,
  Save,
  Layout
} from 'lucide-react';
import { ForeFlightLogo } from './ui/ForeFlightLogo';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DraggableWidget } from './dashboard/DraggableWidget';
import { toast } from 'sonner';

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
  const { fleetSummary } = useSatcomDirect();
  const [isCustomizeMode, setIsCustomizeMode] = useState(false);

  // Role-based quick actions
  const getQuickActions = (): QuickAction[] => {
    switch (userRole) {
      case 'pilot':
        return [
          { title: 'ForeFlight Dispatch', description: 'ForeFlight Dispatch', icon: ForeFlightLogo, href: 'https://dispatch.foreflight.com', color: 'text-blue-400 bg-blue-400/10', external: true },
          { title: 'Create FRAT', description: 'Flight Risk Assessment', icon: FileText, href: '/frat', color: 'text-emerald-400 bg-emerald-400/10' },
          { title: 'Safety Center', description: 'Report hazards & incidents', icon: Shield, href: '/safety', color: 'text-amber-400 bg-amber-400/10' },
          { title: 'Aircraft Status', description: 'Monitor fleet status', icon: Plane, href: '/aircraft', color: 'text-purple-400 bg-purple-400/10' }
        ];
      case 'inflight':
        return [
          { title: 'Safety Center', description: 'Report hazards & incidents', icon: Shield, href: '/safety', color: 'text-amber-400 bg-amber-400/10' },
          { title: 'Passenger Database', description: 'Safety & preferences', icon: Users, href: '/passenger-database', color: 'text-emerald-400 bg-emerald-400/10' },
          { title: 'Catering Orders', description: 'Flight catering management', icon: Utensils, href: '/catering-orders', color: 'text-purple-400 bg-purple-400/10' },
          { title: 'Calendar View', description: 'Full flight calendar', icon: Calendar, href: '/upcoming-flights', color: 'text-blue-400 bg-blue-400/10' }
        ];
      case 'maintenance':
        return [
          { title: 'Maintenance Board', description: 'Scheduled work', icon: Wrench, href: '/maintenance', color: 'text-blue-400 bg-blue-400/10' },
          { title: 'Safety Center', description: 'Report hazards & incidents', icon: Shield, href: '/safety', color: 'text-amber-400 bg-amber-400/10' },
          { title: 'Tech Log', description: 'Aircraft discrepancies', icon: FileText, href: '/tech-log', color: 'text-emerald-400 bg-emerald-400/10' },
          { title: 'Parts Inventory', description: 'Stock levels', icon: Package, href: '/aircraft-inventory', color: 'text-purple-400 bg-purple-400/10' }
        ];
      case 'safety':
        return [
          { title: 'Safety Center', description: 'All safety tools', icon: Shield, href: '/safety', color: 'text-blue-400 bg-blue-400/10' },
          { title: 'FRAT Review', description: 'Pending approvals', icon: FileText, href: '/frat/review', color: 'text-emerald-400 bg-emerald-400/10' },
          { title: 'Hazard Reports', description: 'Safety incidents', icon: AlertTriangle, href: '/safety/hazards', color: 'text-amber-400 bg-amber-400/10' },
          { title: 'Compliance Review', description: 'Document tracking', icon: UserCheck, href: '/safety/compliance', color: 'text-purple-400 bg-purple-400/10' }
        ];
      case 'scheduling':
        return [
          { title: 'ForeFlight Dispatch', description: 'ForeFlight Dispatch', icon: ForeFlightLogo, href: 'https://dispatch.foreflight.com', color: 'text-blue-400 bg-blue-400/10', external: true },
          { title: 'Scheduling Dashboard', description: 'Flight operations', icon: Calendar, href: '/scheduling-dashboard', color: 'text-emerald-400 bg-emerald-400/10' },
          { title: 'Crew Currency', description: 'Pilot qualifications', icon: UserCheck, href: '/crew-management', color: 'text-purple-400 bg-purple-400/10' },
          { title: 'Aircraft Status', description: 'Fleet availability', icon: Plane, href: '/aircraft', color: 'text-amber-400 bg-amber-400/10' }
        ];
      case 'document-manager':
        return [
          { title: 'Document Management', description: 'Publish & distribute', icon: Plus, href: '/document-management', color: 'text-blue-400 bg-blue-400/10' },
          { title: 'Review Queue', description: 'Pending requests', icon: FileText, href: '/document-management/queue', color: 'text-emerald-400 bg-emerald-400/10' },
          { title: 'Compliance Tracking', description: 'Monitor acknowledgments', icon: CheckCircle, href: '/document-management', color: 'text-amber-400 bg-amber-400/10' },
          { title: 'Document Analytics', description: 'Engagement metrics', icon: BarChart3, href: '/document-management', color: 'text-purple-400 bg-purple-400/10' }
        ];
      case 'admin-assistant':
        return [
          { title: 'Trip Management', description: 'Client trips & itineraries', icon: BookOpen, href: '/booking-profile', color: 'text-blue-400 bg-blue-400/10' },
          { title: 'Passenger Database', description: 'Client profiles', icon: Users, href: '/passenger-database', color: 'text-emerald-400 bg-emerald-400/10' },
          { title: 'Schedule View', description: 'Flight operations', icon: Calendar, href: '/schedule', color: 'text-purple-400 bg-purple-400/10' },
          { title: 'Documents', description: 'Forms & procedures', icon: FileText, href: '/documents', color: 'text-amber-400 bg-amber-400/10' }
        ];
      case 'admin':
      case 'lead':
        return [
          { title: 'Lead Dashboard', description: 'KPIs and analytics', icon: BarChart3, href: '/lead-dashboard', color: 'text-blue-400 bg-blue-400/10' },
          { title: 'Trip Management', description: 'Trip coordination', icon: BookOpen, href: '/booking-profile', color: 'text-emerald-400 bg-emerald-400/10' },
          { title: 'Fleet Status', description: 'Aircraft overview', icon: Plane, href: '/aircraft', color: 'text-purple-400 bg-purple-400/10' },
          { title: 'Safety Center', description: 'All safety tools', icon: Shield, href: '/safety', color: 'text-amber-400 bg-amber-400/10' }
        ];
      default:
        return [
          { title: 'Document Request', description: 'Request document changes', icon: Send, href: '/document-management', color: 'text-blue-400 bg-blue-400/10' },
          { title: 'Safety Center', description: 'Report safety concerns', icon: Shield, href: '/safety', color: 'text-amber-400 bg-amber-400/10' },
          { title: 'Schedule View', description: 'Flight operations', icon: Calendar, href: '/schedule', color: 'text-emerald-400 bg-emerald-400/10' },
          { title: 'Documents', description: 'Manuals & procedures', icon: FileText, href: '/documents', color: 'text-purple-400 bg-purple-400/10' }
        ];
    }
  };

  const quickActions = getQuickActions();

  // Widget Registry
  const renderWidget = (id: string) => {
    switch (id) {
      case 'stats_grid':
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <LiquidCard delay={100}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400 font-medium tracking-wide uppercase">Active Flights</p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <p className="text-4xl font-mono text-white">{fleetSummary?.activeFlights || 0}</p>
                      <span className="text-xs text-emerald-400">Live</span>
                    </div>
                  </div>
                  <div className="p-3 bg-[var(--color-pg-blue)]/20 rounded-xl border border-[var(--color-pg-blue)]/30">
                    <Plane className="w-6 h-6 text-[var(--color-pg-cyan)]" />
                  </div>
                </div>
              </CardContent>
            </LiquidCard>

            <LiquidCard delay={200}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400 font-medium tracking-wide uppercase">Fleet Online</p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <p className="text-4xl font-mono text-white">{fleetSummary?.onlineAircraft || 0}</p>
                      <span className="text-sm text-slate-500">/ {fleetSummary?.totalAircraft || 0}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <Wifi className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </LiquidCard>

            <LiquidCard delay={300}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400 font-medium tracking-wide uppercase">System Health</p>
                    <p className={`text-2xl font-bold mt-2 ${fleetSummary?.systemAlerts === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {fleetSummary?.systemAlerts === 0 ? 'Normal' : `${fleetSummary?.systemAlerts || 0} Alerts`}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl border ${fleetSummary?.systemAlerts === 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                    {fleetSummary?.systemAlerts === 0 ?
                      <CheckCircle className="w-6 h-6 text-emerald-400" /> :
                      <AlertTriangle className="w-6 h-6 text-amber-400" />
                    }
                  </div>
                </div>
              </CardContent>
            </LiquidCard>

            <LiquidCard delay={400}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400 font-medium tracking-wide uppercase">Weather Impact</p>
                    <p className={`text-2xl font-bold mt-2 ${impactData.totalImpacted === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {impactData.totalImpacted === 0 ? 'Clear' : `${impactData.totalImpacted} Flights`}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl border ${impactData.totalImpacted === 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                    {impactData.totalImpacted === 0 ?
                      <CheckCircle className="w-6 h-6 text-emerald-400" /> :
                      <CloudRain className="w-6 h-6 text-rose-400" />
                    }
                  </div>
                </div>
              </CardContent>
            </LiquidCard>
          </div>
        );
      case 'fleet_status':
        return <FleetStatusWidget compact={false} showDetailsLink={true} />;
      case 'on_shift':
        return <OnShiftWidget />;
      case 'quick_actions':
        return (
          <LiquidCard delay={500}>
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="flex items-center gap-2 text-white">
                <Activity className="w-5 h-5 text-[var(--color-pg-cyan)]" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-slate-400">Essential tools for your role</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  const content = (
                    <div className="group p-4 border border-white/5 bg-white/5 rounded-xl hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] transition-all cursor-pointer h-full">
                      <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-lg ${action.color} group-hover:scale-110 transition-transform shadow-lg shadow-black/20`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-white truncate group-hover:text-[var(--color-pg-cyan)] transition-colors">{action.title}</p>
                          <p className="text-xs text-slate-400 truncate mt-1">{action.description}</p>
                        </div>
                      </div>
                    </div>
                  );

                  if (action.external) {
                    return (
                      <a key={index} href={action.href} target="_blank" rel="noopener noreferrer" className="block h-full">
                        {content}
                      </a>
                    );
                  }
                  return (
                    <Link key={index} to={action.href} className="block h-full">
                      {content}
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </LiquidCard>
        );
      case 'inflight_upcoming':
        return userRole === 'inflight' ? <InflightUpcomingFlights compact={true} /> : null;
      case 'nas_impact':
        return userRole === 'pilot' ? <NASImpactWidget pilotName="Current Pilot" compact={false} maxFlights={3} /> : null;
      case 'live_map':
        return <LiveFleetMap />;
      case 'schedule_calendar':
        return <ScheduleCalendar />;
      default:
        return null;
    }
  };

  // Initial order logic
  const getDefaultOrder = useCallback(() => {
    const baseOrder = [
      'stats_grid',
      'fleet_status',
      'on_shift',
      'quick_actions',
      'live_map',
      'schedule_calendar'
    ];
    if (userRole === 'inflight') baseOrder.splice(4, 0, 'inflight_upcoming');
    if (userRole === 'pilot') baseOrder.splice(4, 0, 'nas_impact');
    return baseOrder;
  }, [userRole]);

  // Load/Save Order
  const [widgetOrder, setWidgetOrder] = useState<string[]>([]);

  useEffect(() => {
    const savedOrder = localStorage.getItem(`dashboard_order_${userRole}`);
    if (savedOrder) {
      setWidgetOrder(JSON.parse(savedOrder));
    } else {
      setWidgetOrder(getDefaultOrder());
    }
  }, [userRole, getDefaultOrder]);

  const moveWidget = (dragIndex: number, hoverIndex: number) => {
    const newOrder = [...widgetOrder];
    const [removed] = newOrder.splice(dragIndex, 1);
    newOrder.splice(hoverIndex, 0, removed);
    setWidgetOrder(newOrder);
  };

  const handleSaveLayout = () => {
    localStorage.setItem(`dashboard_order_${userRole}`, JSON.stringify(widgetOrder));
    setIsCustomizeMode(false);
    toast.success('Dashboard layout saved');
  };

  const handleResetLayout = () => {
    const defaultOrder = getDefaultOrder();
    setWidgetOrder(defaultOrder);
    localStorage.removeItem(`dashboard_order_${userRole}`);
    toast.success('Layout reset to default');
  };

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4 space-y-6 max-w-7xl mx-auto">
        {/* Clean Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{getCurrentGreeting()}</h1>
            <p className="text-slate-400">
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs border-white/10 text-slate-400 bg-white/5 mr-2">
              Last updated: {new Date().toLocaleTimeString()}
            </Badge>

            {isCustomizeMode ? (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleResetLayout} className="gap-2 text-slate-200 hover:text-white hover:bg-white/10">
                  <RotateCcw className="w-4 h-4" /> Reset
                </Button>
                <Button variant="default" size="sm" onClick={handleSaveLayout} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20 border border-emerald-500/50">
                  <Save className="w-4 h-4" /> Save Layout
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setIsCustomizeMode(true)} className="gap-2 border-white/10 hover:bg-white/5">
                <Settings className="w-4 h-4" /> Customize
              </Button>
            )}
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="space-y-6">
          {widgetOrder.map((widgetId, index) => {
            const content = renderWidget(widgetId);
            if (!content) return null;
            return (
              <DraggableWidget
                key={widgetId}
                id={widgetId}
                index={index}
                moveWidget={moveWidget}
                isCustomizeMode={isCustomizeMode}
                className={isCustomizeMode ? "mb-6" : ""}
                totalCount={widgetOrder.length}
              >
                {content}
              </DraggableWidget>
            );
          })}
        </div>
      </div>
    </DndProvider>
  );
}