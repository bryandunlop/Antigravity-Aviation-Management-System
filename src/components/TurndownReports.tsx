import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription } from './ui/alert';
import { 
  FileText, 
  Search, 
  Filter,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Clock,
  User,
  Wrench,
  Eye,
  Download
} from 'lucide-react';

interface BrokenItem {
  description: string;
  location: string;
  severity: string;
}

interface TurndownReport {
  id: string;
  date: string;
  aircraft: string;
  technician: string;
  shiftStart: string;
  shiftEnd: string;
  status: string;
  accomplishments: string[];
  brokenItems: BrokenItem[];
}

interface StatusOption {
  value: string;
  label: string;
  color: string;
}

interface SeverityOption {
  value: string;
  label: string;
  color: string;
}

// Mock data for demonstration
const mockTurndownReports: TurndownReport[] = [
  {
    id: 'TD-2024-001',
    date: '2024-01-15',
    aircraft: 'N123AB - Gulfstream G650',
    technician: 'John Smith',
    shiftStart: '08:00',
    shiftEnd: '16:00',
    status: 'operational',
    accomplishments: ['Completed 100-hour inspection', 'Replaced cabin air filter'],
    brokenItems: [
      { description: 'Cabin door seal worn', location: 'Main cabin door', severity: 'medium' },
      { description: 'Navigation light flickering', location: 'Left wingtip', severity: 'low' }
    ]
  },
  {
    id: 'TD-2024-002',
    date: '2024-01-16',
    aircraft: 'N456CD - Bombardier Global 7500',
    technician: 'Sarah Johnson',
    shiftStart: '16:00',
    shiftEnd: '00:00',
    status: 'maintenance',
    accomplishments: ['Started engine overhaul', 'Inspected landing gear'],
    brokenItems: [
      { description: 'Hydraulic fluid leak', location: 'Engine compartment', severity: 'high' },
    ]
  },
  {
    id: 'TD-2024-003',
    date: '2024-01-17',
    aircraft: 'N789EF - Cessna Citation X',
    technician: 'Mike Davis',
    shiftStart: '00:00',
    shiftEnd: '08:00',
    status: 'aog',
    accomplishments: ['Diagnosed electrical issue', 'Ordered replacement parts'],
    brokenItems: [
      { description: 'Avionics display blank', location: 'Cockpit', severity: 'critical' },
      { description: 'Door handle loose', location: 'Passenger door', severity: 'low' }
    ]
  },
  {
    id: 'TD-2024-004',
    date: '2024-01-18',
    aircraft: 'N123AB - Gulfstream G650',
    technician: 'Lisa Wilson',
    shiftStart: '08:00',
    shiftEnd: '16:00',
    status: 'operational',
    accomplishments: ['Replaced door seal', 'Fixed navigation light'],
    brokenItems: []
  },
  {
    id: 'TD-2024-005',
    date: '2024-01-19',
    aircraft: 'N321GH - Embraer Phenom 300',
    technician: 'Robert Brown',
    shiftStart: '16:00',
    shiftEnd: '00:00',
    status: 'inspection',
    accomplishments: ['Annual inspection started', 'Documented discrepancies'],
    brokenItems: [
      { description: 'Tire wear excessive', location: 'Main landing gear', severity: 'medium' },
      { description: 'Cabin light not working', location: 'Rear cabin', severity: 'low' }
    ]
  }
];

const statusOptions: StatusOption[] = [
  { value: 'all', label: 'All Statuses', color: 'bg-gray-500' },
  { value: 'operational', label: 'Operational', color: 'bg-green-500' },
  { value: 'maintenance', label: 'In Maintenance', color: 'bg-yellow-500' },
  { value: 'aog', label: 'Aircraft on Ground (AOG)', color: 'bg-red-500' },
  { value: 'inspection', label: 'Scheduled Inspection', color: 'bg-blue-500' }
];

const severityOptions: SeverityOption[] = [
  { value: 'all', label: 'All Severities', color: 'bg-gray-500' },
  { value: 'low', label: 'Low', color: 'bg-green-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500' }
];

export default function TurndownReports() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedReport, setSelectedReport] = useState<TurndownReport | null>(null);

  const filteredReports = useMemo(() => {
    return mockTurndownReports.filter(report => {
      const matchesSearch = 
        report.aircraft.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.technician.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      
      const matchesDate = !dateFilter || report.date === dateFilter;
      
      const matchesSeverity = severityFilter === 'all' || 
        report.brokenItems.some(item => item.severity === severityFilter);
      
      return matchesSearch && matchesStatus && matchesDate && matchesSeverity;
    });
  }, [searchTerm, statusFilter, severityFilter, dateFilter]);

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find(s => s.value === status);
    return (
      <Badge variant="outline" className="text-xs">
        <div className={`w-2 h-2 rounded-full ${statusConfig?.color} mr-1`}></div>
        {statusConfig?.label}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const severityConfig = severityOptions.find(s => s.value === severity);
    return (
      <Badge variant="outline" className="text-xs">
        <div className={`w-2 h-2 rounded-full ${severityConfig?.color} mr-1`}></div>
        {severityConfig?.label}
      </Badge>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Turndown Reports Dashboard
        </h1>
        <p className="text-muted-foreground">Monitor maintenance turndown reports and track issue trends</p>
      </div>

      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            All Reports
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics & Trends
          </TabsTrigger>
        </TabsList>

        {/* Reports List Tab */}
        <TabsContent value="reports" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Search & Filter Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by aircraft, technician, or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Aircraft Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                            {status.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severity">Issue Severity</Label>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by severity" />
                    </SelectTrigger>
                    <SelectContent>
                      {severityOptions.map((severity) => (
                        <SelectItem key={severity.value} value={severity.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${severity.color}`}></div>
                            {severity.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Summary */}
          <Alert>
            <Search className="h-4 w-4" />
            <AlertDescription>
              Showing {filteredReports.length} of {mockTurndownReports.length} turndown reports
            </AlertDescription>
          </Alert>

          {/* Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>Turndown Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Aircraft</TableHead>
                      <TableHead>Technician</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Issues</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.id}</TableCell>
                        <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                        <TableCell>{report.aircraft}</TableCell>
                        <TableCell>{report.technician}</TableCell>
                        <TableCell>{getStatusBadge(report.status)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {report.brokenItems.length === 0 ? (
                              <Badge variant="secondary" className="text-xs">No Issues</Badge>
                            ) : (
                              report.brokenItems.slice(0, 2).map((item, idx) => (
                                <div key={idx}>{getSeverityBadge(item.severity)}</div>
                              ))
                            )}
                            {report.brokenItems.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{report.brokenItems.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedReport(report)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockTurndownReports.length}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">
                  -3% from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AOG Incidents</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1</div>
                <p className="text-xs text-muted-foreground">
                  Same as last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.4d</div>
                <p className="text-xs text-muted-foreground">
                  -0.3d from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Placeholder for Charts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Issue Trends Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border border-dashed rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Charts will be implemented when recharts integration is complete</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Issues by Location */}
            <Card>
              <CardHeader>
                <CardTitle>Issues by Aircraft Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>Cockpit</span>
                    <Badge variant="secondary">8 issues</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>Cabin</span>
                    <Badge variant="secondary">12 issues</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>Engine</span>
                    <Badge variant="secondary">6 issues</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>Landing Gear</span>
                    <Badge variant="secondary">4 issues</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span>Wings</span>
                    <Badge variant="secondary">3 issues</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Aircraft Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Aircraft Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Operational</span>
                    </div>
                    <Badge variant="secondary">45%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span>Maintenance</span>
                    </div>
                    <Badge variant="secondary">30%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>Inspection</span>
                    </div>
                    <Badge variant="secondary">20%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>AOG</span>
                    </div>
                    <Badge variant="secondary">5%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recurring Issues Alert */}
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Recurring Issue Detected:</strong> Door seal problems have been reported 3 times this month across different aircraft. Consider fleet-wide inspection.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Turndown Report Details - {selectedReport.id}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Aircraft</Label>
                  <p>{selectedReport.aircraft}</p>
                </div>
                <div>
                  <Label>Technician</Label>
                  <p>{selectedReport.technician}</p>
                </div>
                <div>
                  <Label>Date</Label>
                  <p>{new Date(selectedReport.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  {getStatusBadge(selectedReport.status)}
                </div>
              </div>
              
              <div>
                <Label>Accomplishments</Label>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  {selectedReport.accomplishments.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {selectedReport.brokenItems.length > 0 && (
                <div>
                  <Label>Issues Reported</Label>
                  <div className="space-y-2 mt-2">
                    {selectedReport.brokenItems.map((item, idx) => (
                      <div key={idx} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{item.description}</p>
                            <p className="text-sm text-muted-foreground">Location: {item.location}</p>
                          </div>
                          {getSeverityBadge(item.severity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button onClick={() => setSelectedReport(null)}>Close</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}