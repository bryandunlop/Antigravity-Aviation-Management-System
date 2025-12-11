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
  Activity,
  Plane,
  Users,
  AlertTriangle,
  Clock,
  Calendar,
  FileText,
  BookOpen,
  Send,
  Wifi,
  CloudRain,
  MapPin,
  Settings,
  RotateCcw,
  Save,
  Layout,
  Shield,
  Utensils,
  Wrench,
  Package,
  UserCheck,
  Plus,
  CheckCircle,
  BarChart3,
  ClipboardCheck,
  Zap,
  Calculator,
  ArrowUpRight
} from 'lucide-react';
import { ForeFlightLogo } from './ui/ForeFlightLogo';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DraggableWidget } from './dashboard/DraggableWidget';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { MetricCard } from './ui/MetricCard';
import MaintenanceBoard from './MaintenanceBoard';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Switch } from "./ui/switch";

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
  const { fleetSummary, aircraftStatuses } = useSatcomDirect();
  const navigate = useNavigate();
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fix: Derive missing variables that were causing crashes
  const aircraft = aircraftStatuses || [];
  const nasAlerts = impactData?.impactedFlights || [];
  const stats = {
    activeAircraft: fleetSummary?.totalAircraft || 0,
    airborne: fleetSummary?.activeFlights || 0
  };
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
      case 'tax':
        return [
          { title: 'Tax Compliance', description: 'SIFL & SEC Reporting', icon: Calculator, href: '/tax-compliance', color: 'text-emerald-400 bg-emerald-400/10' },
          { title: 'Flight Calendar', description: 'View past flights', icon: Calendar, href: '/schedule', color: 'text-blue-400 bg-blue-400/10' },
          { title: 'Passenger DB', description: 'Classify passengers', icon: Users, href: '/passenger-database', color: 'text-purple-400 bg-purple-400/10' },
          { title: 'Documents', description: 'Tax records', icon: FileText, href: '/documents', color: 'text-amber-400 bg-amber-400/10' }
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
          <div className="min-h-screen bg-transparent"> {/* Background handled globally */}

            {/* Sticky Glass Header */}
            <header className="sticky top-0 z-50 glass-premium border-b-0 border-b-slate-200/0 mb-8 mx-6 mt-4 rounded-2xl px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                    Flight Operations
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Welcome back, <span className="text-blue-500 font-medium capitalize">{userRole}</span>
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 rounded-full">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">System Live</span>
                  </div>

                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="glass-premium-hover border-border/50">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Dashboard Configuration</SheetTitle>
                        <SheetDescription>
                          Manage visible widgets and layout preferences.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="py-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="text-sm font-medium">Auto-refresh</div>
                            <div className="text-xs text-muted-foreground">Update data every 30s</div>
                          </div>
                          <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 pb-12 space-y-8">

              {/* Hero Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  icon={Plane}
                  label="Active Aircraft"
                  value={stats.activeAircraft}
                  trend={`${stats.airborne} Airborne`}
                  gradient="from-blue-500 to-indigo-600"
                  shadowColor="shadow-blue-500/20"
                  onClick={() => navigate('/fleet-status')}
                />

                <MetricCard
                  icon={AlertTriangle}
                  label="NAS Impact"
                  value={nasAlerts.length}
                  trend="Active Alerts"
                  gradient="from-orange-500 to-red-600"
                  shadowColor="shadow-orange-500/20"
                  onClick={() => navigate('/nas-impact')}
                />

                <MetricCard
                  icon={Users}
                  label="Crew Active"
                  value={14} // Placeholder: hook up to real Crew context if available
                  trend="4 Duty Limit"
                  gradient="from-emerald-500 to-teal-600"
                  shadowColor="shadow-emerald-500/20"
                />

                <MetricCard
                  icon={Activity}
                  label="Operations"
                  value={98}
                  trend="98% Efficiency"
                  gradient="from-violet-500 to-purple-600"
                  shadowColor="shadow-purple-500/20"
                />
              </div>

              {/* Main Content Layout */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Left Column: Fleet Status (Wide) */}
                <div className="xl:col-span-2 space-y-6">
                  <div className="glass-premium rounded-2xl p-6 relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <Plane className="w-5 h-5 text-blue-500" />
                        </div>
                        <h2 className="text-lg font-semibold text-foreground">Fleet Status</h2>
                      </div>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-blue-500 transition-colors">
                        View All <ArrowUpRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>

                    {/* Embedded Widget */}
                    <FleetStatusWidget />
                  </div>

                  <div className="glass-premium rounded-2xl p-6 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-orange-500" />
                        </div>
                        <h2 className="text-lg font-semibold text-foreground">NAS Impact</h2>
                      </div>
                    </div>
                    <NASImpactWidget />
                  </div>
                </div>

                {/* Right Column: Quick Actions & Feed */}
                <div className="space-y-6">

                  {/* Quick Actions Card */}
                  <div className="glass-premium rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-violet-500/10 rounded-lg">
                        <Zap className="w-5 h-5 text-violet-500" />
                      </div>
                      <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:scale-105 transition-transform duration-300">
                        <FileText className="w-6 h-6 mb-2" />
                        <span className="text-xs font-medium">New FRAT</span>
                      </button>
                      <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-purple-500/25 hover:scale-105 transition-transform duration-300">
                        <Calendar className="w-6 h-6 mb-2" />
                        <span className="text-xs font-medium">Schedule</span>
                      </button>
                      <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-white dark:bg-slate-800 border border-border/50 text-foreground shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">
                        <Users className="w-6 h-6 mb-2 text-muted-foreground" />
                        <span className="text-xs font-medium">Crew</span>
                      </button>
                      <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-white dark:bg-slate-800 border border-border/50 text-foreground shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">
                        <Settings className="w-6 h-6 mb-2 text-muted-foreground" />
                        <span className="text-xs font-medium">Manage</span>
                      </button>
                    </div>
                  </div>

                  {/* Maintenance Status Context */}
                  <div className="glass-premium rounded-2xl p-0 overflow-hidden">
                    <MaintenanceBoard />
                  </div>

                </div>
              </div>
            </main>
          </div>
        );
      case 'fleet_status':
        return <FleetStatusWidget compact={false} showDetailsLink={true} />;
      case 'on_shift':
        return <OnShiftWidget />;
      case 'quick_actions':
        return (
          <LiquidCard delay={500}>
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Activity className="w-5 h-5 text-blue-500" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-muted-foreground">Essential tools for your role</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  const content = (
                    <div className="group p-4 border border-white/5 bg-white/5 rounded-xl hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] transition-all cursor-pointer h-full">
                      <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-lg ${action.color} group-hover:scale-110 transition-transform shadow-sm`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate group-hover:text-blue-500 transition-colors">{action.title}</p>
                          <p className="text-xs text-muted-foreground truncate mt-1">{action.description}</p>
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
            <h1 className="text-3xl font-bold text-foreground tracking-tight">{getCurrentGreeting()}</h1>
            <p className="text-muted-foreground">
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