import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Minus, Plane, AlertTriangle, 
  Users, Wrench, FileCheck, Clock, DollarSign, 
  CheckCircle, XCircle, Activity, Zap, Target,
  ThermometerSun, Fuel, Calendar, Award, Shield
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Mock data generators - in production, these would come from Supabase
const generateMockData = () => {
  const now = new Date();
  
  return {
    // Fleet Operations
    fleetUtilization: 87.5,
    fleetUtilizationTrend: 'up',
    activeFlights: 4,
    totalFleet: 8,
    flightHoursToday: 28.5,
    flightHoursWeek: 156.3,
    flightHoursTrend: 'up',
    onTimePerformance: 94.2,
    onTimeTrend: 'down',
    avgTurnaroundTime: 2.3,
    turnaroundTrend: 'up',
    dispatchReliability: 97.8,
    dispatchTrend: 'up',
    
    // Safety & Risk
    fratGreen: 145,
    fratYellow: 23,
    fratRed: 3,
    avgFratScore: 22.4,
    activeWeatherAlerts: 2,
    safetyReportsMonth: 5,
    daysSinceIncident: 847,
    complianceRate: 98.5,
    complianceTrend: 'up',
    
    // Aircraft Health
    aircraftOperational: 7,
    aircraftMaintenance: 1,
    aogHours: 0,
    openMaintenanceCritical: 2,
    openMaintenanceRoutine: 8,
    maintenanceCompletionRate: 96.3,
    maintenanceTrend: 'up',
    
    // Crew Readiness
    availablePilots: 12,
    availableInflight: 8,
    avgDutyTimeRemaining: 6.2,
    certsExpiring30Days: 3,
    avgCrewFlightHours: 68.5,
    
    // Passenger Operations
    passengerLoadFactor: 76.3,
    vipFlightsToday: 2,
    avgPassengerRating: 4.8,
    passengerRatingTrend: 'up',
    
    // Resource Management
    fuelEfficiencyVariance: -2.3, // negative is good (under planned)
    avgCostPerFlightHour: 4250,
    costTrend: 'down',
    fuelLoadsPending: 3,
    documentsExpiring: 7,
    
    // Scheduling
    scheduleAdherence: 95.8,
    scheduleAdherenceTrend: 'up',
    avgBookingLeadTime: 14.5,
    activeDelays: 1,
    crewOnDuty: 16
  };
};

const generateFlightHoursChart = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    day,
    hours: Math.floor(Math.random() * 30) + 20,
    planned: Math.floor(Math.random() * 35) + 18
  }));
};

const generateFratTrendChart = () => {
  return Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    score: Math.random() * 10 + 18
  }));
};

const generateUtilizationByAircraft = () => {
  return [
    { tail: 'N650GA', hours: 145.5, utilization: 92 },
    { tail: 'N650GB', hours: 138.2, utilization: 88 },
    { tail: 'N650GC', hours: 142.7, utilization: 90 },
    { tail: 'N650GD', hours: 125.3, utilization: 79 },
    { tail: 'N650GE', hours: 156.8, utilization: 99 },
    { tail: 'N650GF', hours: 148.9, utilization: 94 },
    { tail: 'N650GG', hours: 132.1, utilization: 84 },
    { tail: 'N650GH', hours: 0, utilization: 0, status: 'Maintenance' }
  ];
};

const generateTopRoutes = () => {
  return [
    { route: 'KTEB - KMIA', flights: 28, hours: 56 },
    { route: 'KPBI - KTEB', flights: 24, hours: 48 },
    { route: 'KBOS - KMCO', flights: 18, hours: 36 },
    { route: 'KIAH - KJFK', flights: 16, hours: 32 },
    { route: 'KLAS - KSEA', flights: 14, hours: 35 }
  ];
};

const TrendIndicator = ({ trend, value }: { trend: 'up' | 'down' | 'stable', value?: string }) => {
  if (trend === 'up') {
    return (
      <div className="flex items-center gap-1 text-green-600">
        <TrendingUp className="w-4 h-4" />
        {value && <span className="text-xs">{value}</span>}
      </div>
    );
  }
  if (trend === 'down') {
    return (
      <div className="flex items-center gap-1 text-red-600">
        <TrendingDown className="w-4 h-4" />
        {value && <span className="text-xs">{value}</span>}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 text-gray-600">
      <Minus className="w-4 h-4" />
      {value && <span className="text-xs">{value}</span>}
    </div>
  );
};

const MetricCard = ({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  trend, 
  trendValue,
  status,
  subtitle 
}: { 
  title: string;
  value: string | number;
  unit?: string;
  icon: any;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  status?: 'good' | 'warning' | 'critical';
  subtitle?: string;
}) => {
  const getStatusColor = () => {
    if (status === 'good') return 'border-green-500 bg-green-50';
    if (status === 'warning') return 'border-yellow-500 bg-yellow-50';
    if (status === 'critical') return 'border-red-500 bg-red-50';
    return 'border-gray-200 bg-white';
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${getStatusColor()}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-white">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-sm text-gray-600">{title}</div>
            {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
          </div>
        </div>
        {trend && <TrendIndicator trend={trend} value={trendValue} />}
      </div>
      <div className="flex items-baseline gap-1 mt-2">
        <span className="text-3xl">{value}</span>
        {unit && <span className="text-sm text-gray-600">{unit}</span>}
      </div>
    </div>
  );
};

const GaugeCard = ({ 
  title, 
  value, 
  max, 
  unit,
  icon: Icon,
  status 
}: { 
  title: string;
  value: number;
  max: number;
  unit: string;
  icon: any;
  status?: 'good' | 'warning' | 'critical';
}) => {
  const percentage = (value / max) * 100;
  
  const getColor = () => {
    if (status === 'good' || percentage >= 90) return 'bg-green-500';
    if (status === 'warning' || percentage >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="rounded-lg border-2 border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-lg bg-gray-50">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <div className="text-sm text-gray-600">{title}</div>
      </div>
      <div className="text-3xl mb-2">{value}<span className="text-sm text-gray-600 ml-1">/ {max}</span></div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div className={`h-3 rounded-full ${getColor()}`} style={{ width: `${percentage}%` }} />
      </div>
      <div className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% {unit}</div>
    </div>
  );
};

export default function LiveMetricsDashboard() {
  const [data, setData] = useState(generateMockData());
  const [flightHoursData] = useState(generateFlightHoursChart());
  const [fratTrendData] = useState(generateFratTrendChart());
  const [utilizationData] = useState(generateUtilizationByAircraft());
  const [topRoutes] = useState(generateTopRoutes());
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate live updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateMockData());
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fratPieData = [
    { name: 'Green (Low Risk)', value: data.fratGreen, color: '#22c55e' },
    { name: 'Yellow (Medium Risk)', value: data.fratYellow, color: '#eab308' },
    { name: 'Red (High Risk)', value: data.fratRed, color: '#ef4444' }
  ];

  const getOTPStatus = (value: number): 'good' | 'warning' | 'critical' => {
    if (value >= 95) return 'good';
    if (value >= 85) return 'warning';
    return 'critical';
  };

  const getComplianceStatus = (value: number): 'good' | 'warning' | 'critical' => {
    if (value >= 98) return 'good';
    if (value >= 95) return 'warning';
    return 'critical';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl text-gray-900 mb-2">Live Operations Dashboard</h1>
            <p className="text-gray-600">Real-time fleet metrics and performance indicators</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Activity className="w-4 h-4 text-green-500 animate-pulse" />
              <span>Live</span>
            </div>
            <div className="text-xs text-gray-500">Last updated: {lastUpdate.toLocaleTimeString()}</div>
          </div>
        </div>

        {/* Fleet Operations KPIs */}
        <div>
          <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
            <Plane className="w-6 h-6 text-blue-600" />
            Fleet Operations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Fleet Utilization Rate"
              value={data.fleetUtilization}
              unit="%"
              icon={Target}
              trend={data.fleetUtilizationTrend}
              trendValue="+2.3%"
              status={data.fleetUtilization >= 85 ? 'good' : 'warning'}
            />
            <MetricCard
              title="Flight Hours"
              value={data.flightHoursWeek}
              unit="hrs this week"
              icon={Clock}
              trend={data.flightHoursTrend}
              trendValue="+12.5%"
              subtitle={`${data.flightHoursToday} hrs today`}
            />
            <MetricCard
              title="On-Time Performance"
              value={`${data.onTimePerformance}%`}
              icon={CheckCircle}
              trend={data.onTimeTrend}
              trendValue="-1.2%"
              status={getOTPStatus(data.onTimePerformance)}
            />
            <MetricCard
              title="Dispatch Reliability"
              value={`${data.dispatchReliability}%`}
              icon={Zap}
              trend={data.dispatchTrend}
              trendValue="+0.5%"
              status="good"
            />
            <GaugeCard
              title="Active Flights"
              value={data.activeFlights}
              max={data.totalFleet}
              unit="of fleet active"
              icon={Plane}
              status="good"
            />
            <MetricCard
              title="Avg Turnaround Time"
              value={data.avgTurnaroundTime}
              unit="hours"
              icon={Clock}
              trend={data.turnaroundTrend}
              trendValue="+0.2 hrs"
              status={data.avgTurnaroundTime <= 2.5 ? 'good' : 'warning'}
            />
          </div>
        </div>

        {/* Flight Hours Chart */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          <h3 className="text-lg text-gray-900 mb-4">Flight Hours - Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={flightHoursData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="planned" stroke="#94a3b8" fill="#e2e8f0" name="Planned Hours" />
              <Area type="monotone" dataKey="hours" stroke="#3b82f6" fill="#93c5fd" name="Actual Hours" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Safety & Risk Metrics */}
        <div>
          <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Safety & Risk Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Average FRAT Score"
              value={data.avgFratScore}
              unit="/ 100"
              icon={Activity}
              trend="stable"
              status="good"
              subtitle="30-day moving average"
            />
            <MetricCard
              title="Active Weather Alerts"
              value={data.activeWeatherAlerts}
              icon={ThermometerSun}
              status={data.activeWeatherAlerts === 0 ? 'good' : 'warning'}
              subtitle="Affecting scheduled routes"
            />
            <MetricCard
              title="Compliance Rate"
              value={`${data.complianceRate}%`}
              icon={FileCheck}
              trend={data.complianceTrend}
              trendValue="+0.3%"
              status={getComplianceStatus(data.complianceRate)}
            />
            <MetricCard
              title="Safety Reports (Month)"
              value={data.safetyReportsMonth}
              icon={AlertTriangle}
              status={data.safetyReportsMonth <= 5 ? 'good' : 'warning'}
            />
          </div>
        </div>

        {/* FRAT Distribution and Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <h3 className="text-lg text-gray-900 mb-4">FRAT Score Distribution (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={fratPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {fratPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <h3 className="text-lg text-gray-900 mb-4">FRAT Score Trend (30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={fratTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" label={{ value: 'Day', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Avg Score', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} name="Avg FRAT Score" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Aircraft Health */}
        <div>
          <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-blue-600" />
            Aircraft Health & Maintenance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <GaugeCard
              title="Aircraft Availability"
              value={data.aircraftOperational}
              max={data.totalFleet}
              unit="operational"
              icon={Plane}
              status="good"
            />
            <MetricCard
              title="AOG Time"
              value={data.aogHours}
              unit="hours"
              icon={XCircle}
              status={data.aogHours === 0 ? 'good' : 'critical'}
              subtitle="Unscheduled maintenance"
            />
            <MetricCard
              title="Open Maintenance Items"
              value={data.openMaintenanceCritical + data.openMaintenanceRoutine}
              icon={AlertTriangle}
              status={data.openMaintenanceCritical > 0 ? 'warning' : 'good'}
              subtitle={`${data.openMaintenanceCritical} critical, ${data.openMaintenanceRoutine} routine`}
            />
            <MetricCard
              title="Maintenance Completion"
              value={`${data.maintenanceCompletionRate}%`}
              icon={CheckCircle}
              trend={data.maintenanceTrend}
              trendValue="+1.2%"
              status="good"
              subtitle="On-time completion rate"
            />
          </div>
        </div>

        {/* Utilization by Aircraft */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          <h3 className="text-lg text-gray-900 mb-4">Utilization by Aircraft (Month)</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={utilizationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tail" />
              <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" label={{ value: 'Flight Hours', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" label={{ value: 'Utilization %', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="hours" fill="#3b82f6" name="Flight Hours" />
              <Bar yAxisId="right" dataKey="utilization" fill="#10b981" name="Utilization %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Crew Readiness */}
        <div>
          <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Crew Readiness
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Available Crew"
              value={data.availablePilots + data.availableInflight}
              icon={Users}
              status="good"
              subtitle={`${data.availablePilots} pilots, ${data.availableInflight} inflight`}
            />
            <MetricCard
              title="Avg Duty Time Remaining"
              value={data.avgDutyTimeRemaining}
              unit="hours"
              icon={Clock}
              status={data.avgDutyTimeRemaining >= 6 ? 'good' : 'warning'}
            />
            <MetricCard
              title="Certifications Expiring"
              value={data.certsExpiring30Days}
              icon={AlertTriangle}
              status={data.certsExpiring30Days <= 3 ? 'good' : 'warning'}
              subtitle="Within 30 days"
            />
            <MetricCard
              title="Avg Crew Flight Hours"
              value={data.avgCrewFlightHours}
              unit="hrs this month"
              icon={Award}
              status="good"
            />
          </div>
        </div>

        {/* Passenger Operations */}
        <div>
          <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Passenger Operations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Passenger Load Factor"
              value={`${data.passengerLoadFactor}%`}
              icon={Users}
              status="good"
              subtitle="% of available seats filled"
            />
            <MetricCard
              title="VIP Flights Today"
              value={data.vipFlightsToday}
              icon={Award}
              status="good"
              subtitle="BOD/C-Suite passengers"
            />
            <MetricCard
              title="Passenger Feedback"
              value={data.avgPassengerRating}
              unit="/ 5.0"
              icon={CheckCircle}
              trend={data.passengerRatingTrend}
              trendValue="+0.2"
              status="good"
            />
          </div>
        </div>

        {/* Top Routes */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          <h3 className="text-lg text-gray-900 mb-4">Most Requested Routes (Month)</h3>
          <div className="space-y-3">
            {topRoutes.map((route, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl text-blue-600 w-8">{index + 1}</div>
                <div className="flex-1">
                  <div className="text-gray-900">{route.route}</div>
                  <div className="text-sm text-gray-600">{route.flights} flights • {route.hours} flight hours</div>
                </div>
                <div className="w-64 bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-blue-600" 
                    style={{ width: `${(route.flights / topRoutes[0].flights) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resource Management */}
        <div>
          <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-blue-600" />
            Resource Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Fuel Efficiency Variance"
              value={data.fuelEfficiencyVariance}
              unit="%"
              icon={Fuel}
              status={data.fuelEfficiencyVariance < 0 ? 'good' : 'warning'}
              subtitle="vs. ForeFlight planned"
            />
            <MetricCard
              title="Avg Cost Per Flight Hour"
              value={`$${data.avgCostPerFlightHour.toLocaleString()}`}
              icon={DollarSign}
              trend={data.costTrend}
              trendValue="-3.2%"
              status="good"
            />
            <MetricCard
              title="Fuel Loads Pending"
              value={data.fuelLoadsPending}
              icon={Fuel}
              status={data.fuelLoadsPending <= 5 ? 'good' : 'warning'}
              subtitle="Requests to maintenance"
            />
            <MetricCard
              title="Documents Expiring"
              value={data.documentsExpiring}
              icon={FileCheck}
              status={data.documentsExpiring <= 10 ? 'good' : 'warning'}
              subtitle="Within 30 days"
            />
          </div>
        </div>

        {/* Scheduling & Live Status */}
        <div>
          <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Scheduling & Live Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Schedule Adherence"
              value={`${data.scheduleAdherence}%`}
              icon={CheckCircle}
              trend={data.scheduleAdherenceTrend}
              trendValue="+0.8%"
              status="good"
            />
            <MetricCard
              title="Avg Booking Lead Time"
              value={data.avgBookingLeadTime}
              unit="days"
              icon={Calendar}
              status="good"
            />
            <MetricCard
              title="Active Delays"
              value={data.activeDelays}
              icon={AlertTriangle}
              status={data.activeDelays === 0 ? 'good' : 'warning'}
            />
            <MetricCard
              title="Crew on Duty"
              value={data.crewOnDuty}
              icon={Users}
              status="good"
              subtitle="Currently active"
            />
          </div>
        </div>
      </div>
    </div>
  );
}