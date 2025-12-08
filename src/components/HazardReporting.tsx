import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter, 
  User, 
  Calendar, 
  Clock,
  CheckCircle,
  UserCheck,
  MapPin,
  FileText,
  Target,
  AlertCircle,
  ArrowRight,
  CheckCheck,
  Eye,
  XCircle,
  Send,
  TrendingUp,
  Bell,
  Upload,
  Paperclip
} from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from './ui/checkbox';

// Workflow stages
const WORKFLOW_STAGES = {
  SUBMITTED: 'Submitted to Safety',
  SAFETY_REVIEW: 'Safety Review',
  LINE_MANAGER_REVIEW: 'Line Manager Review',
  VP_APPROVAL: 'VP Final Approval',
  SAFETY_FINAL: 'Safety Final Approval',
  CLOSED: 'Closed'
};

export default function HazardReporting() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewHazardDialog, setShowNewHazardDialog] = useState(false);
  const [selectedHazard, setSelectedHazard] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Risk Factors state
  const riskFactors = [
    'Pressure',
    'Lack of Awareness',
    'Complacency',
    'Lack of Communications',
    'Stress',
    'Lack of Teamwork',
    'Distractions',
    'Lack of Knowledge',
    'Fatigue',
    'Lack of Assertiveness',
    'Normalization of Deviance',
    'Lack of Resources'
  ];

  const [selectedRiskFactors, setSelectedRiskFactors] = useState<string[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  // Calculate days until date
  const daysUntil = (dateString: string) => {
    const targetDate = new Date(dateString);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Check if effectiveness review is upcoming (within 7 days)
  const isEffectivenessReviewUpcoming = (reviewDate: string | undefined) => {
    if (!reviewDate) return false;
    const days = daysUntil(reviewDate);
    return days <= 7 && days >= 0;
  };

  // Mock data - in real app this would come from backend
  const hazards = [
    {
      id: 'HZ-001',
      title: 'Runway Surface Contamination - LAX Runway 24L',
      category: 'Airport Infrastructure',
      severity: 'Critical',
      workflowStage: WORKFLOW_STAGES.LINE_MANAGER_REVIEW,
      location: 'LAX - Runway 24L',
      reportedBy: 'John Smith',
      submitterLineManager: 'Sarah Johnson',
      reportedDate: '2024-02-06',
      description: 'Standing water and oil contamination observed on runway 24L during pre-flight inspection',
      immediateActions: 'Runway closed to traffic, maintenance notified',
      potentialConsequences: 'Reduced braking effectiveness, potential aircraft damage or incident',
      assignedTo: 'Mike Johnson',
      dueDate: '2024-02-07',
      effectivenessReviewDate: '2024-02-15',
      workflowHistory: [
        { stage: WORKFLOW_STAGES.SUBMITTED, date: '2024-02-06 09:15', user: 'John Smith', action: 'Submitted' },
        { stage: WORKFLOW_STAGES.SAFETY_REVIEW, date: '2024-02-06 10:30', user: 'Safety Manager', action: 'Reviewed and forwarded' },
        { stage: WORKFLOW_STAGES.LINE_MANAGER_REVIEW, date: '2024-02-06 14:00', user: 'Sarah Johnson', action: 'Under review' }
      ],
      duties: [
        { id: 1, task: 'Coordinate with airport maintenance for cleanup', assignedTo: 'Operations', status: 'In Progress', dueDate: '2024-02-06' },
        { id: 2, task: 'Issue NOTAM for runway closure', assignedTo: 'Dispatch', status: 'Complete', dueDate: '2024-02-06' },
        { id: 3, task: 'Assess alternative runway capacity', assignedTo: 'Operations', status: 'Complete', dueDate: '2024-02-06' }
      ]
    },
    {
      id: 'HZ-002',
      title: 'Bird Strike Risk - Approach Path DEN',
      category: 'Wildlife',
      severity: 'High',
      workflowStage: WORKFLOW_STAGES.VP_APPROVAL,
      location: 'DEN - Approach Path Runway 16R',
      reportedBy: 'Sarah Wilson',
      submitterLineManager: 'Tom Anderson',
      reportedDate: '2024-02-05',
      description: 'Large flock of birds observed consistently in approach path during morning operations',
      immediateActions: 'Crew advised to use alternative approach path, wildlife control notified',
      potentialConsequences: 'Bird strike damage to aircraft, potential engine failure',
      assignedTo: 'David Brown',
      dueDate: '2024-02-08',
      effectivenessReviewDate: '2024-02-12',
      workflowHistory: [
        { stage: WORKFLOW_STAGES.SUBMITTED, date: '2024-02-05 08:00', user: 'Sarah Wilson', action: 'Submitted' },
        { stage: WORKFLOW_STAGES.SAFETY_REVIEW, date: '2024-02-05 09:15', user: 'Safety Manager', action: 'Reviewed and forwarded' },
        { stage: WORKFLOW_STAGES.LINE_MANAGER_REVIEW, date: '2024-02-05 11:30', user: 'Tom Anderson', action: 'Approved and forwarded' },
        { stage: WORKFLOW_STAGES.VP_APPROVAL, date: '2024-02-06 08:00', user: 'VP Operations', action: 'Under final review' }
      ],
      duties: [
        { id: 4, task: 'Contact airport wildlife control', assignedTo: 'Operations', status: 'Complete', dueDate: '2024-02-05' },
        { id: 5, task: 'Monitor bird activity patterns', assignedTo: 'Ground Crew', status: 'In Progress', dueDate: '2024-02-08' },
        { id: 6, task: 'Coordinate with other operators', assignedTo: 'Dispatch', status: 'Pending', dueDate: '2024-02-07' }
      ]
    },
    {
      id: 'HZ-003',
      title: 'Ground Equipment Malfunction - N123AB',
      category: 'Equipment',
      severity: 'Medium',
      workflowStage: WORKFLOW_STAGES.CLOSED,
      location: 'Main Hangar - Bay 3',
      reportedBy: 'Emily Davis',
      submitterLineManager: 'Mike Roberts',
      reportedDate: '2024-02-04',
      description: 'Ground power unit malfunctioned during aircraft servicing, caused brief power interruption',
      immediateActions: 'GPU taken out of service, backup unit deployed',
      potentialConsequences: 'Avionics damage, flight delays',
      assignedTo: 'Tom Wilson',
      dueDate: '2024-02-05',
      effectivenessReviewDate: '2024-03-04',
      workflowHistory: [
        { stage: WORKFLOW_STAGES.SUBMITTED, date: '2024-02-04 07:30', user: 'Emily Davis', action: 'Submitted' },
        { stage: WORKFLOW_STAGES.SAFETY_REVIEW, date: '2024-02-04 08:45', user: 'Safety Manager', action: 'Reviewed and forwarded' },
        { stage: WORKFLOW_STAGES.LINE_MANAGER_REVIEW, date: '2024-02-04 10:00', user: 'Mike Roberts', action: 'Approved and forwarded' },
        { stage: WORKFLOW_STAGES.VP_APPROVAL, date: '2024-02-04 14:30', user: 'VP Operations', action: 'Approved' },
        { stage: WORKFLOW_STAGES.SAFETY_FINAL, date: '2024-02-05 09:00', user: 'Safety Manager', action: 'Final approval and closed' },
        { stage: WORKFLOW_STAGES.CLOSED, date: '2024-02-05 09:00', user: 'Safety Manager', action: 'Closed' }
      ],
      duties: [
        { id: 7, task: 'Inspect GPU for electrical faults', assignedTo: 'Maintenance', status: 'Complete', dueDate: '2024-02-04' },
        { id: 8, task: 'Test aircraft avionics after power interruption', assignedTo: 'Avionics Tech', status: 'Complete', dueDate: '2024-02-04' },
        { id: 9, task: 'Update equipment maintenance log', assignedTo: 'Maintenance', status: 'Complete', dueDate: '2024-02-05' }
      ]
    },
    {
      id: 'HZ-004',
      title: 'Fuel System Leak - Fuel Farm',
      category: 'Fuel System',
      severity: 'High',
      workflowStage: WORKFLOW_STAGES.SAFETY_REVIEW,
      location: 'Fuel Farm - Tank 2',
      reportedBy: 'Mark Anderson',
      submitterLineManager: 'Lisa Martinez',
      reportedDate: '2024-02-06',
      description: 'Small fuel leak detected at base of fuel tank 2 during routine inspection',
      immediateActions: 'Area cordoned off, fuel operations suspended for tank 2',
      potentialConsequences: 'Environmental contamination, fire hazard, fuel shortage',
      assignedTo: 'Lisa Chen',
      dueDate: '2024-02-07',
      effectivenessReviewDate: '2024-02-20',
      workflowHistory: [
        { stage: WORKFLOW_STAGES.SUBMITTED, date: '2024-02-06 11:00', user: 'Mark Anderson', action: 'Submitted' },
        { stage: WORKFLOW_STAGES.SAFETY_REVIEW, date: '2024-02-06 12:15', user: 'Safety Manager', action: 'Under review' }
      ],
      duties: [
        { id: 10, task: 'Environmental assessment and containment', assignedTo: 'Safety', status: 'Pending', dueDate: '2024-02-06' },
        { id: 11, task: 'Schedule emergency tank repair', assignedTo: 'Maintenance', status: 'Pending', dueDate: '2024-02-07' },
        { id: 12, task: 'Assess fuel supply impact', assignedTo: 'Operations', status: 'In Progress', dueDate: '2024-02-06' }
      ]
    }
  ];

  const getWorkflowStageColor = (stage: string) => {
    switch (stage) {
      case WORKFLOW_STAGES.SUBMITTED: return 'bg-blue-100 text-blue-800 border-blue-200';
      case WORKFLOW_STAGES.SAFETY_REVIEW: return 'bg-purple-100 text-purple-800 border-purple-200';
      case WORKFLOW_STAGES.LINE_MANAGER_REVIEW: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case WORKFLOW_STAGES.VP_APPROVAL: return 'bg-orange-100 text-orange-800 border-orange-200';
      case WORKFLOW_STAGES.SAFETY_FINAL: return 'bg-green-100 text-green-800 border-green-200';
      case WORKFLOW_STAGES.CLOSED: return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDutyStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'complete': return 'bg-green-100 text-green-800 border-green-200';
      case 'in progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getWorkflowProgress = (stage: string) => {
    const stages = Object.values(WORKFLOW_STAGES);
    const currentIndex = stages.indexOf(stage);
    return ((currentIndex + 1) / stages.length) * 100;
  };

  const filteredHazards = hazards.filter(hazard => {
    const matchesFilter = filter === 'all' || hazard.workflowStage.toLowerCase().replace(/\s/g, '') === filter;
    const matchesSearch = hazard.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hazard.reportedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hazard.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hazard.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleAssignHazard = (hazardId: string, assignee: string) => {
    toast.success(`Hazard ${hazardId} assigned to ${assignee}`);
  };

  const handleAdvanceWorkflow = (hazardId: string, nextStage: string) => {
    toast.success(`Hazard ${hazardId} advanced to ${nextStage}`);
  };

  const handleViewDetails = (hazard: any) => {
    setSelectedHazard(hazard);
    setShowDetailsDialog(true);
  };

  // Get hazards with upcoming effectiveness reviews
  const upcomingReviews = hazards.filter(h => 
    h.effectivenessReviewDate && isEffectivenessReviewUpcoming(h.effectivenessReviewDate)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h1 className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            Hazard Reporting & Management
          </h1>
          <p className="text-muted-foreground">Track and manage safety hazards through approval workflow</p>
        </div>
        
        <Dialog open={showNewHazardDialog} onOpenChange={setShowNewHazardDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Report New Hazard
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Report New Hazard</DialogTitle>
              <DialogDescription>
                Submit a hazard report. It will be routed through Safety → Line Manager → VP → Safety for final approval.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Date */}
              <div>
                <Label>Date</Label>
                <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>

              {/* Risk Factors */}
              <div>
                <Label>Risk Factors</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2 p-4 border rounded-lg bg-gray-50">
                  {riskFactors.map((factor) => (
                    <div key={factor} className="flex items-center space-x-2">
                      <Checkbox
                        id={factor}
                        checked={selectedRiskFactors.includes(factor)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRiskFactors([...selectedRiskFactors, factor]);
                          } else {
                            setSelectedRiskFactors(selectedRiskFactors.filter(f => f !== factor));
                          }
                        }}
                      />
                      <Label
                        htmlFor={factor}
                        className="text-sm cursor-pointer"
                      >
                        {factor}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Describe the Incident / Hazard */}
              <div>
                <Label>Describe the Incident / Hazard or potential safety issue you observed</Label>
                <Textarea 
                  placeholder="Provide detailed description of what you observed..." 
                  rows={4}
                  className="mt-1"
                />
              </div>

              {/* Suggested Corrective Action */}
              <div>
                <Label>Suggested Corrective Action</Label>
                <Textarea 
                  placeholder="What actions do you recommend to address this hazard?" 
                  rows={3}
                  className="mt-1"
                />
              </div>

              {/* Attachment */}
              <div>
                <Label>Attachment</Label>
                <div className="mt-1">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      id="file-upload"
                      onChange={(e) => {
                        if (e.target.files) {
                          setAttachedFiles(Array.from(e.target.files));
                        }
                      }}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        Drop files here to upload
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        or click to browse
                      </p>
                    </label>
                  </div>
                  {attachedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {attachedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                          <Paperclip className="w-4 h-4 text-gray-600" />
                          <span className="text-sm flex-1">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-4">
                <Button onClick={() => {
                  toast.success('Hazard report submitted to Safety Manager');
                  setShowNewHazardDialog(false);
                  setSelectedRiskFactors([]);
                  setAttachedFiles([]);
                }}>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Report
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowNewHazardDialog(false);
                  setSelectedRiskFactors([]);
                  setAttachedFiles([]);
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Effectiveness Review Alert */}
      {upcomingReviews.length > 0 && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-orange-900">Effectiveness Reviews Due Soon</h3>
                <p className="text-sm text-orange-800 mt-1">
                  {upcomingReviews.length} hazard report{upcomingReviews.length > 1 ? 's' : ''} ha{upcomingReviews.length > 1 ? 've' : 's'} effectiveness review{upcomingReviews.length > 1 ? 's' : ''} scheduled within the next 7 days:
                </p>
                <div className="mt-2 space-y-1">
                  {upcomingReviews.map(h => (
                    <div key={h.id} className="text-sm text-orange-800 flex items-center gap-2">
                      <TrendingUp className="w-3 h-3" />
                      <span className="font-medium">{h.id}</span>
                      <span>- {h.title}</span>
                      <span className="text-orange-600">
                        (Due: {new Date(h.effectivenessReviewDate!).toLocaleDateString()})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">In Safety Review</p>
                <p className="text-2xl">
                  {hazards.filter(h => h.workflowStage === WORKFLOW_STAGES.SAFETY_REVIEW).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Line Manager</p>
                <p className="text-2xl">
                  {hazards.filter(h => h.workflowStage === WORKFLOW_STAGES.LINE_MANAGER_REVIEW).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">VP Approval</p>
                <p className="text-2xl">
                  {hazards.filter(h => h.workflowStage === WORKFLOW_STAGES.VP_APPROVAL).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl">
                  {hazards.filter(h => h.severity === 'Critical').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Closed</p>
                <p className="text-2xl">
                  {hazards.filter(h => h.workflowStage === WORKFLOW_STAGES.CLOSED).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by title, location, reporter, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-56">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by workflow stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="submittedtosafety">Submitted to Safety</SelectItem>
                <SelectItem value="safetyreview">Safety Review</SelectItem>
                <SelectItem value="linemanagerreview">Line Manager Review</SelectItem>
                <SelectItem value="vpfinalapproval">VP Final Approval</SelectItem>
                <SelectItem value="safetyfinalapproval">Safety Final Approval</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Hazards Table */}
      <Card>
        <CardHeader>
          <CardTitle>Hazard Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Workflow Stage</TableHead>
                  <TableHead>Current Reviewer</TableHead>
                  <TableHead>Effectiveness Review</TableHead>
                  <TableHead>Reported</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHazards.map((hazard) => {
                  const reviewUpcoming = hazard.effectivenessReviewDate && 
                    isEffectivenessReviewUpcoming(hazard.effectivenessReviewDate);
                  const daysToReview = hazard.effectivenessReviewDate ? 
                    daysUntil(hazard.effectivenessReviewDate) : null;

                  return (
                    <TableRow key={hazard.id}>
                      <TableCell className="font-medium">{hazard.id}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="flex items-start gap-2">
                          <span className="truncate">{hazard.title}</span>
                          {reviewUpcoming && (
                            <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs shrink-0">
                              <Bell className="w-3 h-3 mr-1" />
                              Review in {daysToReview}d
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{hazard.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(hazard.severity)}>
                          {hazard.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge className={getWorkflowStageColor(hazard.workflowStage)}>
                            {hazard.workflowStage}
                          </Badge>
                          <Progress 
                            value={getWorkflowProgress(hazard.workflowStage)} 
                            className="h-1 w-32"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {hazard.workflowStage === WORKFLOW_STAGES.LINE_MANAGER_REVIEW 
                              ? hazard.submitterLineManager
                              : hazard.workflowStage === WORKFLOW_STAGES.VP_APPROVAL 
                              ? 'VP Operations'
                              : hazard.workflowStage === WORKFLOW_STAGES.SAFETY_REVIEW ||
                                hazard.workflowStage === WORKFLOW_STAGES.SAFETY_FINAL
                              ? 'Safety Manager'
                              : 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {hazard.effectivenessReviewDate ? (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className={`text-sm ${reviewUpcoming ? 'text-orange-600 font-medium' : ''}`}>
                              {new Date(hazard.effectivenessReviewDate).toLocaleDateString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not scheduled</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 text-muted-foreground" />
                            {hazard.reportedBy}
                          </div>
                          <div className="text-muted-foreground">
                            {new Date(hazard.reportedDate).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(hazard)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedHazard && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  {selectedHazard.id}: {selectedHazard.title}
                </DialogTitle>
                <DialogDescription>
                  Reported by {selectedHazard.reportedBy} on {new Date(selectedHazard.reportedDate).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="details" className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="workflow">Workflow Status</TabsTrigger>
                  <TabsTrigger value="duties">Action Items</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Category</Label>
                      <div className="mt-1">
                        <Badge variant="outline">{selectedHazard.category}</Badge>
                      </div>
                    </div>
                    <div>
                      <Label>Severity</Label>
                      <div className="mt-1">
                        <Badge className={getSeverityColor(selectedHazard.severity)}>
                          {selectedHazard.severity}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Location</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedHazard.location}</span>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label>Description</Label>
                    <p className="mt-1 text-sm">{selectedHazard.description}</p>
                  </div>

                  <div>
                    <Label>Immediate Actions Taken</Label>
                    <p className="mt-1 text-sm">{selectedHazard.immediateActions}</p>
                  </div>

                  <div>
                    <Label>Potential Consequences</Label>
                    <p className="mt-1 text-sm text-red-700 bg-red-50 p-3 rounded border border-red-200">
                      {selectedHazard.potentialConsequences}
                    </p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Assigned To</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedHazard.assignedTo}</span>
                      </div>
                    </div>
                    <div>
                      <Label>Due Date</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{new Date(selectedHazard.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {selectedHazard.effectivenessReviewDate && (
                    <div className={`p-4 rounded border ${
                      isEffectivenessReviewUpcoming(selectedHazard.effectivenessReviewDate)
                        ? 'bg-orange-50 border-orange-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        <TrendingUp className={`w-5 h-5 mt-0.5 ${
                          isEffectivenessReviewUpcoming(selectedHazard.effectivenessReviewDate)
                            ? 'text-orange-600'
                            : 'text-blue-600'
                        }`} />
                        <div>
                          <h4 className={`font-medium ${
                            isEffectivenessReviewUpcoming(selectedHazard.effectivenessReviewDate)
                              ? 'text-orange-900'
                              : 'text-blue-900'
                          }`}>
                            Effectiveness Review Scheduled
                          </h4>
                          <p className={`text-sm mt-1 ${
                            isEffectivenessReviewUpcoming(selectedHazard.effectivenessReviewDate)
                              ? 'text-orange-800'
                              : 'text-blue-800'
                          }`}>
                            Review date: {new Date(selectedHazard.effectivenessReviewDate).toLocaleDateString()}
                            {isEffectivenessReviewUpcoming(selectedHazard.effectivenessReviewDate) && (
                              <span className="font-medium ml-2">
                                ({daysUntil(selectedHazard.effectivenessReviewDate)} days remaining)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="workflow" className="space-y-4 mt-4">
                  <div className="space-y-1 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label>Current Stage</Label>
                      <Badge className={getWorkflowStageColor(selectedHazard.workflowStage)}>
                        {selectedHazard.workflowStage}
                      </Badge>
                    </div>
                    <Progress 
                      value={getWorkflowProgress(selectedHazard.workflowStage)} 
                      className="h-2"
                    />
                    <p className="text-sm text-muted-foreground">
                      {Math.round(getWorkflowProgress(selectedHazard.workflowStage))}% complete
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-3">Workflow Path</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 border rounded bg-blue-50">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">
                          1
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Submitted to Safety Manager</p>
                          <p className="text-sm text-muted-foreground">Initial review by safety team</p>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      </div>

                      <div className="flex items-center gap-3 p-3 border rounded bg-yellow-50">
                        <div className="w-8 h-8 rounded-full bg-yellow-600 text-white flex items-center justify-center text-sm">
                          2
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Line Manager Review</p>
                          <p className="text-sm text-muted-foreground">
                            Submitter's line manager: {selectedHazard.submitterLineManager}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      </div>

                      <div className="flex items-center gap-3 p-3 border rounded bg-orange-50">
                        <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center text-sm">
                          3
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">VP Final Approval</p>
                          <p className="text-sm text-muted-foreground">VP Operations approval required</p>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      </div>

                      <div className="flex items-center gap-3 p-3 border rounded bg-green-50">
                        <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm">
                          4
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Safety Final Approval & Record Keeping</p>
                          <p className="text-sm text-muted-foreground">
                            Final review by safety manager and close out
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-3">Workflow History</h4>
                    <div className="space-y-3">
                      {selectedHazard.workflowHistory.map((entry: any, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-3 border rounded">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{entry.stage}</p>
                              <span className="text-xs text-muted-foreground">{entry.date}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {entry.action} by {entry.user}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    {selectedHazard.workflowStage !== WORKFLOW_STAGES.CLOSED && (
                      <Button onClick={() => {
                        const stages = Object.values(WORKFLOW_STAGES);
                        const currentIndex = stages.indexOf(selectedHazard.workflowStage);
                        const nextStage = stages[currentIndex + 1];
                        handleAdvanceWorkflow(selectedHazard.id, nextStage);
                      }}>
                        <Send className="w-4 h-4 mr-2" />
                        Approve & Forward
                      </Button>
                    )}
                    <Button variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      Add Comment
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="duties" className="mt-4">
                  <div className="space-y-3">
                    {selectedHazard.duties.map((duty: any) => (
                      <div key={duty.id} className="border rounded p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium">{duty.task}</h4>
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{duty.assignedTo}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {new Date(duty.dueDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge className={getDutyStatusColor(duty.status)}>
                            {duty.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Action Item
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}