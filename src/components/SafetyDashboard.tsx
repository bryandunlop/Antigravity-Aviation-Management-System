import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  Shield,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  FileText,
  Target,
  Settings,
  CheckCircle,
  UserCheck,
  ClipboardList,
  Sliders,
  Award,
  Plus,
  Calendar,
  User,
  Upload,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Send,
  Clock,
  Star
} from 'lucide-react';

interface SafetyDashboardProps {
  userRole?: string;
}

export default function SafetyDashboard({ userRole = 'pilot' }: SafetyDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data - in real app this would come from backend
  const safetyStats = {
    pendingWaivers: 3,
    openHazards: 7,
    pendingAudits: 2,
    fratReviewsNeeded: 4,
    complianceRate: 94.2,
    myHazardReports: 2,
    myAsapReports: 1,
    cwsRecognitions: 12,
    totalWaivers: 15,
    completedAudits: 8
  };

  const isAdmin = userRole === 'admin' || userRole === 'safety';

  // Recent Activity
  const recentActivity = [
    {
      id: 1,
      type: 'hazard',
      title: 'Runway Surface Contamination',
      submittedBy: 'John Smith',
      date: '2024-02-06',
      status: 'Open',
      priority: 'High'
    },
    {
      id: 2,
      type: 'cws',
      title: 'Excellent Pre-Flight Inspection',
      submittedBy: 'Sarah Wilson',
      recognizedPerson: 'Mike Johnson',
      date: '2024-02-06',
      status: 'Approved'
    },
    {
      id: 3,
      type: 'waiver',
      title: 'Night Operations Waiver - KTEB',
      submittedBy: 'Chris Brown',
      date: '2024-02-05',
      status: 'Pending Review',
      priority: 'Medium'
    },
    {
      id: 4,
      type: 'asap',
      title: 'ASAP Report #2024-045',
      submittedBy: 'Anonymous',
      date: '2024-02-05',
      status: 'Under Review'
    }
  ];

  // CWS Recognitions
  const cwsRecognitions = [
    {
      id: 1,
      recognizedPerson: 'Mike Johnson',
      submittedBy: 'Sarah Wilson',
      behavior: 'Thorough pre-flight inspection in challenging weather conditions',
      date: '2024-02-06',
      status: 'Approved'
    },
    {
      id: 2,
      recognizedPerson: 'Emily Davis',
      submittedBy: 'John Smith',
      behavior: 'Proactive communication during maintenance coordination',
      date: '2024-02-05',
      status: 'Approved'
    },
    {
      id: 3,
      recognizedPerson: 'Robert Martinez',
      submittedBy: 'Chris Brown',
      behavior: 'Excellent adherence to SOP during abnormal situation',
      date: '2024-02-04',
      status: 'Pending'
    }
  ];

  // Waiver Requests
  const waiverRequests = [
    {
      id: 1,
      title: 'Night Operations Waiver - KTEB',
      requestor: 'Chris Brown',
      airport: 'KTEB',
      date: '2024-02-05',
      validUntil: '2024-03-05',
      status: 'Pending Review',
      priority: 'Medium'
    },
    {
      id: 2,
      title: 'Weather Minimum Waiver - KJFK',
      requestor: 'Mike Johnson',
      airport: 'KJFK',
      date: '2024-02-03',
      validUntil: '2024-02-10',
      status: 'Approved',
      priority: 'High'
    },
    {
      id: 3,
      title: 'Crew Rest Waiver',
      requestor: 'Sarah Wilson',
      airport: 'N/A',
      date: '2024-02-01',
      validUntil: '2024-02-08',
      status: 'Denied',
      priority: 'Low'
    }
  ];

  // Audit Schedule
  const audits = [
    {
      id: 1,
      title: 'Monthly Safety Audit - February',
      auditor: 'Safety Team',
      scheduledDate: '2024-02-15',
      area: 'Flight Operations',
      status: 'Scheduled',
      findings: 0
    },
    {
      id: 2,
      title: 'Maintenance Records Audit',
      auditor: 'John Smith',
      scheduledDate: '2024-02-10',
      area: 'Maintenance',
      status: 'In Progress',
      findings: 2
    },
    {
      id: 3,
      title: 'Document Compliance Review',
      auditor: 'Sarah Wilson',
      scheduledDate: '2024-01-28',
      area: 'All Departments',
      status: 'Completed',
      findings: 3
    }
  ];

  // Hazard Reports - Only finalized, deidentified reports visible to all
  const hazardReports = [
    {
      id: 1,
      reportNumber: 'HR-2024-023',
      title: 'Runway Surface Contamination',
      location: 'Major Airport - Runway 24L',
      publishedDate: '2024-02-06',
      severity: 'High',
      status: 'Finalized',
      correctiveActions: 'FBO notified, alternative runway procedures implemented',
      lessonsLearned: 'Enhanced pre-flight briefing to include runway condition assessment'
    },
    {
      id: 2,
      reportNumber: 'HR-2024-021',
      title: 'Ground Equipment Proximity Issue',
      location: 'Northeast Airport - Ramp Area',
      publishedDate: '2024-02-04',
      severity: 'Medium',
      status: 'Finalized',
      correctiveActions: 'Ground crew training conducted, new marshalling procedures',
      lessonsLearned: 'Improved coordination with FBO ground operations'
    },
    {
      id: 3,
      reportNumber: 'HR-2024-018',
      title: 'Inadequate Ramp Lighting',
      location: 'Regional Airport - FBO Ramp',
      publishedDate: '2024-02-01',
      severity: 'Low',
      status: 'Finalized',
      correctiveActions: 'Lighting improvements requested from FBO management',
      lessonsLearned: 'Night operations checklist updated to include lighting assessment'
    }
  ];

  // Pending hazard submissions (Safety Manager only)
  const pendingHazardSubmissions = [
    {
      id: 1,
      submittedBy: 'Anonymous',
      submitDate: '2024-02-07',
      location: 'KLAX Runway 24L',
      description: 'Observed ice contamination on runway surface during taxi',
      severity: 'High',
      needsReview: true
    },
    {
      id: 2,
      submittedBy: 'John Smith',
      submitDate: '2024-02-06',
      location: 'KJFK Ramp A',
      description: 'Ground equipment positioned too close to aircraft during pushback',
      severity: 'Medium',
      needsReview: true
    }
  ];

  // ASAP Reports
  const asapReports = [
    {
      id: 1,
      reportNumber: '2024-045',
      date: '2024-02-05',
      flightPhase: 'Approach',
      status: 'Under Review'
    },
    {
      id: 2,
      reportNumber: '2024-042',
      date: '2024-02-01',
      flightPhase: 'Cruise',
      status: 'Closed'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': case 'pending': case 'pending review': case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'assigned': case 'in progress': case 'under review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved': case 'completed': case 'resolved': case 'closed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'denied': case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Safety Center
          </h1>
          <p className="text-muted-foreground">Comprehensive safety management system</p>
        </div>
        
        <div className="flex gap-2 mt-4 lg:mt-0">
          {isAdmin && (
            <>
              <Link to="/safety/frat-builder">
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Form Builder
                </Button>
              </Link>
              <Link to="/safety/form-fields">
                <Button variant="outline">
                  <Sliders className="w-4 h-4 mr-2" />
                  Field Manager
                </Button>
              </Link>
            </>
          )}
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-auto">
          <TabsTrigger value="overview" className="gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="hazards" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">Hazards</span>
            {safetyStats.openHazards > 0 && (
              <Badge className="ml-1 h-5 px-1.5 text-xs">{safetyStats.openHazards}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="asap" className="gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">ASAP</span>
          </TabsTrigger>
          <TabsTrigger value="cws" className="gap-2">
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">CWS</span>
          </TabsTrigger>
          <TabsTrigger value="waivers" className="gap-2">
            <FileCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Waivers</span>
            {isAdmin && safetyStats.pendingWaivers > 0 && (
              <Badge className="ml-1 h-5 px-1.5 text-xs">{safetyStats.pendingWaivers}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="audits" className="gap-2">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Audits</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="gap-2">
            <UserCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Compliance</span>
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="frat-review" className="gap-2">
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">FRAT</span>
              {safetyStats.fratReviewsNeeded > 0 && (
                <Badge className="ml-1 h-5 px-1.5 text-xs">{safetyStats.fratReviewsNeeded}</Badge>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Open Hazards</p>
                    <p className="text-2xl">{safetyStats.openHazards}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">CWS This Month</p>
                    <p className="text-2xl">{safetyStats.cwsRecognitions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isAdmin && (
              <>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Pending Waivers</p>
                        <p className="text-2xl">{safetyStats.pendingWaivers}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Pending Audits</p>
                        <p className="text-2xl">{safetyStats.pendingAudits}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-indigo-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">FRAT Reviews</p>
                        <p className="text-2xl">{safetyStats.fratReviewsNeeded}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Compliance</p>
                        <p className="text-2xl">{safetyStats.complianceRate}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Report Hazard
                </CardTitle>
                <CardDescription>Submit a safety hazard or incident report</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => setActiveTab('hazards')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Submit Hazard Report
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-900 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Caught Working Safely
                </CardTitle>
                <CardDescription>Recognize safe behavior</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline" onClick={() => setActiveTab('cws')}>
                  <Star className="w-4 h-4 mr-2" />
                  Submit CWS Recognition
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Safety Manager Tools */}
          {isAdmin && (
            <Card className="bg-purple-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-900 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Safety Manager Tools
                </CardTitle>
                <CardDescription>Risk assessment and hazard workflow management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/safety/manager-dashboard">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    <Shield className="w-4 h-4 mr-2" />
                    Hazard Workflow Dashboard
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground">
                  Process hazard reports through the complete approval workflow with GFO Risk Matrix, 5 Why's analysis, and P-A-C-E assignments
                </p>
                <Link to="/safety/risk-profile">
                  <Button className="w-full" variant="outline">
                    <Target className="w-4 h-4 mr-2" />
                    Create Safety Risk Profile
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground">
                  Comprehensive risk assessment with severity/likelihood matrix and mitigation planning
                </p>
              </CardContent>
            </Card>
          )}

          {/* Safety Newsletter */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Safety Newsletter
                  </CardTitle>
                  <CardDescription>Monthly safety updates and communications</CardDescription>
                </div>
                {isAdmin && (
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Newsletter
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Featured Newsletter */}
                <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50/50">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Badge className="bg-blue-600 text-white mb-2">Latest Issue</Badge>
                      <h3 className="text-xl">February 2024 Safety Newsletter</h3>
                      <p className="text-sm text-muted-foreground mt-1">Published: February 1, 2024</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">🎯 This Month's Focus: Winter Operations</h4>
                      <p className="text-sm text-muted-foreground">
                        As we continue through winter operations, we're highlighting best practices for cold weather operations, 
                        de-icing procedures, and winter weather decision-making.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                      <div className="p-3 bg-white rounded border">
                        <Award className="w-5 h-5 text-green-600 mb-2" />
                        <p className="text-sm font-medium">CWS Highlights</p>
                        <p className="text-xs text-muted-foreground mt-1">12 recognitions this month for exceptional safety practices</p>
                      </div>
                      <div className="p-3 bg-white rounded border">
                        <AlertTriangle className="w-5 h-5 text-orange-600 mb-2" />
                        <p className="text-sm font-medium">Safety Trends</p>
                        <p className="text-xs text-muted-foreground mt-1">3 hazard reports addressed with corrective actions</p>
                      </div>
                      <div className="p-3 bg-white rounded border">
                        <Target className="w-5 h-5 text-purple-600 mb-2" />
                        <p className="text-sm font-medium">Training Updates</p>
                        <p className="text-xs text-muted-foreground mt-1">New winter ops module available in training center</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">📋 Key Safety Reminders</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Pre-flight inspections should include thorough checks for ice and snow accumulation</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Review de-icing holdover times before each flight in winter conditions</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Ensure proper cold weather starting procedures are followed</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6 pt-4 border-t">
                    <Button variant="outline" className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      View Full Newsletter
                    </Button>
                  </div>
                </div>

                {/* Previous Newsletters */}
                <div>
                  <h4 className="font-medium mb-3">Previous Issues</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">January 2024 Safety Newsletter</p>
                          <p className="text-xs text-muted-foreground">Year-end safety review and 2024 goals</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">December 2023 Safety Newsletter</p>
                          <p className="text-xs text-muted-foreground">Holiday travel safety and year-end recognition</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hazard Reporting Tab */}
        <TabsContent value="hazards" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hazard Report Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Submit Hazard Report
                </CardTitle>
                <CardDescription>Report safety hazards and incidents anonymously or with attribution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link to="/safety/hazards">
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Open Hazard Report Form
                  </Button>
                </Link>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900 font-medium mb-2">Anonymous Reporting Available</p>
                  <p className="text-sm text-blue-700">
                    You can submit hazard reports anonymously. All submissions are reviewed and deidentified by the Safety Manager before being published.
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Use the comprehensive 12-factor risk assessment form to report safety hazards and incidents.
                </p>
              </CardContent>
            </Card>

            {/* Finalized Hazard Reports */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Published Hazard Reports</CardTitle>
                    <CardDescription>Finalized & deidentified safety bulletins</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {hazardReports.map((report) => (
                    <div key={report.id} className="p-4 border rounded-lg hover:bg-accent/50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {report.reportNumber}
                            </Badge>
                            <Badge className={getPriorityColor(report.severity)} variant="outline">
                              {report.severity}
                            </Badge>
                            <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">
                              Finalized
                            </Badge>
                          </div>
                          <p className="font-medium">{report.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">{report.location}</p>
                          <p className="text-xs text-muted-foreground mt-2">Published: {report.publishedDate}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="mt-3 p-3 bg-accent/30 rounded border">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Corrective Actions:</p>
                        <p className="text-sm">{report.correctiveActions}</p>
                        <p className="text-xs font-medium text-muted-foreground mt-2 mb-1">Lessons Learned:</p>
                        <p className="text-sm">{report.lessonsLearned}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Safety Manager Review Section */}
          {isAdmin && (
            <Card className="mt-6 border-2 border-orange-200 bg-orange-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-900">
                  <Shield className="w-5 h-5" />
                  Pending Hazard Submissions (Safety Manager Only)
                </CardTitle>
                <CardDescription>Review, deidentify, and publish hazard reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingHazardSubmissions.map((submission) => (
                    <div key={submission.id} className="p-4 border-2 border-orange-200 rounded-lg bg-white">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                              Pending Review
                            </Badge>
                            <Badge className={getPriorityColor(submission.severity)} variant="outline">
                              {submission.severity} Severity
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Submitted by:</span>
                              <span className="ml-2 font-medium">{submission.submittedBy}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Date:</span>
                              <span className="ml-2">{submission.submitDate}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Location:</span>
                              <span className="ml-2">{submission.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded border mt-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Description:</p>
                        <p className="text-sm">{submission.description}</p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="w-4 h-4 mr-2" />
                          Review & Deidentify
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Publish
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ASAP Report Tab */}
        <TabsContent value="asap" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ASAP Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-600" />
                  Submit ASAP Report
                </CardTitle>
                <CardDescription>Aviation Safety Action Program - Confidential Reporting</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/asap-report">
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Open ASAP Report Form
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground mt-4">
                  ASAP reports are submitted confidentially and reviewed by the safety team.
                </p>
              </CardContent>
            </Card>

            {/* ASAP Reports List */}
            <Card>
              <CardHeader>
                <CardTitle>My ASAP Reports</CardTitle>
                <CardDescription>Your submitted reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {asapReports.map((report) => (
                    <div key={report.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">Report #{report.reportNumber}</p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{report.date}</span>
                            <span>•</span>
                            <span>{report.flightPhase}</span>
                          </div>
                          <Badge className={getStatusColor(report.status)} variant="outline" className="mt-2">
                            {report.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* CWS Tab */}
        <TabsContent value="cws" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CWS Submission Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-600" />
                  Recognize Safe Behavior
                </CardTitle>
                <CardDescription>Submit a Caught Working Safely recognition</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/user-safety">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Star className="w-4 h-4 mr-2" />
                    Submit CWS Recognition
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground mt-4">
                  Recognize colleagues who demonstrate safe work practices and adherence to procedures.
                </p>
              </CardContent>
            </Card>

            {/* Recent CWS */}
            <Card>
              <CardHeader>
                <CardTitle>Recent CWS Recognitions</CardTitle>
                <CardDescription>{safetyStats.cwsRecognitions} recognitions this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cwsRecognitions.map((cws) => (
                    <div key={cws.id} className="p-3 border rounded-lg bg-green-50/50">
                      <div className="flex items-start gap-3">
                        <Award className="w-5 h-5 text-green-600 mt-1" />
                        <div className="flex-1">
                          <p className="font-medium">{cws.recognizedPerson}</p>
                          <p className="text-sm text-muted-foreground mt-1">{cws.behavior}</p>
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <span>Submitted by {cws.submittedBy}</span>
                            <span>•</span>
                            <span>{cws.date}</span>
                          </div>
                          <Badge className={getStatusColor(cws.status)} variant="outline" className="mt-2">
                            {cws.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Waivers Tab */}
        <TabsContent value="waivers" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg">Waiver Management</h2>
              <p className="text-sm text-muted-foreground">Review and manage waiver requests</p>
            </div>
            <Link to="/user-safety">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Request Waiver
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Waiver Requests</CardTitle>
                <div className="flex gap-2">
                  <Input placeholder="Search waivers..." className="w-64" />
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {waiverRequests.map((waiver) => (
                  <div key={waiver.id} className="p-4 border rounded-lg hover:bg-accent/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{waiver.title}</p>
                        <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Requestor:</span>
                            <span className="ml-2">{waiver.requestor}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Airport:</span>
                            <span className="ml-2">{waiver.airport}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Submitted:</span>
                            <span className="ml-2">{waiver.date}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Valid Until:</span>
                            <span className="ml-2">{waiver.validUntil}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <Badge className={getStatusColor(waiver.status)} variant="outline">
                            {waiver.status}
                          </Badge>
                          <Badge className={getPriorityColor(waiver.priority)} variant="outline">
                            {waiver.priority}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {isAdmin && waiver.status === 'Pending Review' && (
                          <>
                            <Button variant="ghost" size="sm" className="text-green-600">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audits Tab */}
        <TabsContent value="audits" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg">Internal Audits</h2>
              <p className="text-sm text-muted-foreground">Schedule and manage safety audits</p>
            </div>
            {isAdmin && (
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Schedule Audit
              </Button>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Audit Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {audits.map((audit) => (
                  <div key={audit.id} className="p-4 border rounded-lg hover:bg-accent/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{audit.title}</p>
                        <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Auditor:</span>
                            <span className="ml-2">{audit.auditor}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Date:</span>
                            <span className="ml-2">{audit.scheduledDate}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Area:</span>
                            <span className="ml-2">{audit.area}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Findings:</span>
                            <span className="ml-2">{audit.findings}</span>
                          </div>
                        </div>
                        <Badge className={getStatusColor(audit.status)} variant="outline" className="mt-3">
                          {audit.status}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Document Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Document Compliance Tracking
              </CardTitle>
              <CardDescription>Monitor document acknowledgments and compliance rates</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/safety/compliance">
                <Button className="w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  View Full Compliance Dashboard
                </Button>
              </Link>
              <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg text-center">
                <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <p className="text-3xl font-semibold text-green-900">{safetyStats.complianceRate}%</p>
                <p className="text-sm text-green-700 mt-1">Overall Compliance Rate</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FRAT Review Tab (Admin Only) */}
        {isAdmin && (
          <TabsContent value="frat-review" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" />
                  FRAT Outcomes Review
                </CardTitle>
                <CardDescription>Review flight risk assessment submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/frat/review">
                  <Button className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    Open FRAT Review Dashboard
                  </Button>
                </Link>
                <div className="mt-6">
                  <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-900">Pending Reviews</p>
                      <p className="text-sm text-blue-700">FRAT submissions awaiting approval</p>
                    </div>
                    <div className="text-3xl font-semibold text-blue-900">
                      {safetyStats.fratReviewsNeeded}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}