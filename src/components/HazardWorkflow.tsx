import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { 
  ArrowLeft,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Send,
  Save,
  User,
  Users,
  Mail,
  Calendar,
  Clock,
  FileText,
  Target,
  PlayCircle,
  PauseCircle,
  Archive,
  Plus,
  Trash2,
  Eye,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';

// Workflow stages
const WORKFLOW_STAGES = {
  SUBMITTED: 'Submitted',
  SM_INITIAL_REVIEW: 'Safety Manager Initial Review',
  ASSIGNED_CORRECTIVE_ACTION: 'Assigned for Corrective Action',
  SM_CA_REVIEW: 'SM Review of Corrective Action',
  LINE_MANAGER_APPROVAL: 'Line Manager Approval',
  EXEC_APPROVAL: 'Accountable Executive Approval',
  IMPLEMENTATION_ASSIGNMENT: 'Implementation Assignment',
  IMPLEMENTATION_IN_PROGRESS: 'Implementation in Progress',
  PUBLISHED: 'Published',
  EFFECTIVENESS_REVIEW: 'Review for Effectiveness',
  CLOSED: 'Closed'
};

export default function HazardWorkflow() {
  const { id } = useParams();
  
  // State for workflow data
  const [currentStage, setCurrentStage] = useState(WORKFLOW_STAGES.SM_INITIAL_REVIEW);
  const [riskSeverity, setRiskSeverity] = useState(3);
  const [riskLikelihood, setRiskLikelihood] = useState(3);
  const [whyAnalysis, setWhyAnalysis] = useState(['', '', '', '', '']);
  const [investigationNotes, setInvestigationNotes] = useState('');
  const [paceAssignments, setPaceAssignments] = useState({
    processOwner: { type: 'user', value: '', customName: '', customEmail: '' },
    approver: { type: 'user', value: '', customName: '', customEmail: '' },
    contributors: [],
    executers: []
  });
  const [correctiveActionComponents, setCorrectiveActionComponents] = useState({
    communications: false,
    training: false,
    policy: false,
    equipment: false
  });
  const [correctiveActionDetails, setCorrectiveActionDetails] = useState('');
  const [smReviewNotes, setSmReviewNotes] = useState('');
  const [nimblNotes, setNimblNotes] = useState('');
  const [implementationNotes, setImplementationNotes] = useState('');
  const [publicationContent, setPublicationContent] = useState('');
  const [effectivenessReviewNotes, setEffectivenessReviewNotes] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState('');

  // Mock users list
  const users = [
    { id: '1', name: 'Mike Johnson', role: 'Chief Pilot', email: 'mike.johnson@gfo.com' },
    { id: '2', name: 'Sarah Wilson', role: 'Director of Maintenance', email: 'sarah.wilson@gfo.com' },
    { id: '3', name: 'Tom Anderson', role: 'Safety Manager', email: 'tom.anderson@gfo.com' },
    { id: '4', name: 'Lisa Chen', role: 'Training Manager', email: 'lisa.chen@gfo.com' },
    { id: '5', name: 'David Brown', role: 'Facilities Manager', email: 'david.brown@gfo.com' },
    { id: '6', name: 'Emily Davis', role: 'Standards Manager', email: 'emily.davis@gfo.com' }
  ];

  // Mock hazard data
  const hazardData = {
    id: id || 'HZ-001',
    title: 'Runway Surface Contamination - LAX Runway 24L',
    submittedBy: 'John Smith',
    submitDate: '2024-02-06',
    severity: 'Critical',
    location: 'LAX - Runway 24L',
    description: 'Standing water and oil contamination observed on runway 24L during pre-flight inspection. Surface conditions presented significant safety risk for takeoff and landing operations.',
    immediateActions: 'Runway closed to traffic, maintenance notified, alternative runway procedures implemented',
    potentialConsequences: 'Reduced braking effectiveness, potential aircraft damage or incident, risk to passenger safety',
    riskFactors: ['Lack of Awareness', 'Lack of Communications', 'Normalization of Deviance']
  };

  // Calculate risk level
  const calculateRiskLevel = (severity: number, likelihood: number) => {
    const score = severity * likelihood;
    if (score >= 20) return { level: 'Extreme', color: 'bg-red-600', textColor: 'text-red-600' };
    if (score >= 12) return { level: 'High', color: 'bg-orange-500', textColor: 'text-orange-500' };
    if (score >= 6) return { level: 'Medium', color: 'bg-yellow-500', textColor: 'text-yellow-500' };
    return { level: 'Low', color: 'bg-green-500', textColor: 'text-green-500' };
  };

  const riskLevel = calculateRiskLevel(riskSeverity, riskLikelihood);
  const riskScore = riskSeverity * riskLikelihood;

  // Handle stage advancement
  const handleAdvanceStage = () => {
    const stages = Object.values(WORKFLOW_STAGES);
    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1];
      setCurrentStage(nextStage);
      toast.success(`Advanced to: ${nextStage}`);
      
      // Simulate email notification
      setShowEmailModal(true);
      setEmailRecipients(getEmailRecipientsForStage(nextStage));
    }
  };

  const getEmailRecipientsForStage = (stage: string) => {
    switch (stage) {
      case WORKFLOW_STAGES.ASSIGNED_CORRECTIVE_ACTION:
        return paceAssignments.processOwner.customEmail || users.find(u => u.id === paceAssignments.processOwner.value)?.email || '';
      case WORKFLOW_STAGES.LINE_MANAGER_APPROVAL:
        return 'linemanager@gfo.com';
      case WORKFLOW_STAGES.EXEC_APPROVAL:
        return 'accountable.executive@gfo.com';
      case WORKFLOW_STAGES.IMPLEMENTATION_ASSIGNMENT:
        return paceAssignments.executers.map((e: any) => e.customEmail || users.find(u => u.id === e.value)?.email).join(', ');
      default:
        return 'safety.team@gfo.com';
    }
  };

  const handleSave = () => {
    toast.success('Progress saved successfully');
  };

  const handlePublish = () => {
    toast.success('Hazard report published to all employees');
    // Can publish at any stage
  };

  const addPaceContributor = () => {
    setPaceAssignments({
      ...paceAssignments,
      contributors: [...paceAssignments.contributors, { type: 'user', value: '', customName: '', customEmail: '' }]
    });
  };

  const addPaceExecuter = () => {
    setPaceAssignments({
      ...paceAssignments,
      executers: [...paceAssignments.executers, { type: 'user', value: '', customName: '', customEmail: '' }]
    });
  };

  const removePaceContributor = (index: number) => {
    setPaceAssignments({
      ...paceAssignments,
      contributors: paceAssignments.contributors.filter((_, i) => i !== index)
    });
  };

  const removePaceExecuter = (index: number) => {
    setPaceAssignments({
      ...paceAssignments,
      executers: paceAssignments.executers.filter((_, i) => i !== index)
    });
  };

  // Get current stage progress
  const stages = Object.values(WORKFLOW_STAGES);
  const currentStageIndex = stages.indexOf(currentStage);
  const progressPercentage = ((currentStageIndex + 1) / stages.length) * 100;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/safety/manager-dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Hazard Workflow: {hazardData.id}
            </h1>
            <Badge className="bg-red-100 text-red-800 border-red-200">
              {hazardData.severity}
            </Badge>
          </div>
          <p className="text-muted-foreground">{hazardData.title}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Progress
          </Button>
          <Button onClick={handlePublish} className="bg-indigo-600 hover:bg-indigo-700">
            <Send className="w-4 h-4 mr-2" />
            Publish Report
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Workflow Progress</span>
              <span className="text-sm text-muted-foreground">
                Stage {currentStageIndex + 1} of {stages.length}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex items-center justify-between">
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                {currentStage}
              </Badge>
              {currentStageIndex < stages.length - 1 && (
                <span className="text-sm text-muted-foreground">
                  Next: {stages[currentStageIndex + 1]}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hazard Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Hazard Report Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Submitted By</Label>
              <p>{hazardData.submittedBy}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Submit Date</Label>
              <p>{hazardData.submitDate}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Location</Label>
              <p>{hazardData.location}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Severity</Label>
              <Badge className="bg-red-100 text-red-800 border-red-200">{hazardData.severity}</Badge>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <Label className="text-muted-foreground">Description</Label>
            <p className="mt-1">{hazardData.description}</p>
          </div>
          
          <div>
            <Label className="text-muted-foreground">Immediate Actions Taken</Label>
            <p className="mt-1">{hazardData.immediateActions}</p>
          </div>
          
          <div>
            <Label className="text-muted-foreground">Potential Consequences</Label>
            <p className="mt-1">{hazardData.potentialConsequences}</p>
          </div>

          <div>
            <Label className="text-muted-foreground">Risk Factors Identified</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {hazardData.riskFactors.map((factor, index) => (
                <Badge key={index} variant="outline">{factor}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: GFO Risk Assessment Matrix */}
      {(currentStage === WORKFLOW_STAGES.SM_INITIAL_REVIEW || currentStageIndex >= stages.indexOf(WORKFLOW_STAGES.SM_INITIAL_REVIEW)) && (
        <Card className={currentStage === WORKFLOW_STAGES.SM_INITIAL_REVIEW ? 'border-2 border-blue-500 shadow-lg' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-red-600" />
              Step 1: GFO Risk Assessment Matrix
            </CardTitle>
            <CardDescription>Conduct brief risk assessment using severity and likelihood</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Severity Selection */}
              <div>
                <Label>Severity</Label>
                <Select value={riskSeverity.toString()} onValueChange={(v) => setRiskSeverity(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Negligible</SelectItem>
                    <SelectItem value="2">2 - Minor</SelectItem>
                    <SelectItem value="3">3 - Moderate</SelectItem>
                    <SelectItem value="4">4 - Major</SelectItem>
                    <SelectItem value="5">5 - Catastrophic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Likelihood Selection */}
              <div>
                <Label>Likelihood</Label>
                <Select value={riskLikelihood.toString()} onValueChange={(v) => setRiskLikelihood(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Rare</SelectItem>
                    <SelectItem value="2">2 - Unlikely</SelectItem>
                    <SelectItem value="3">3 - Possible</SelectItem>
                    <SelectItem value="4">4 - Likely</SelectItem>
                    <SelectItem value="5">5 - Almost Certain</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Risk Matrix Grid */}
            <div className="p-6 bg-gray-50 rounded-lg border-2">
              <h4 className="font-medium mb-4">Risk Assessment Matrix</h4>
              <div className="grid grid-cols-6 gap-1 mb-4">
                <div className="col-span-1"></div>
                {[1, 2, 3, 4, 5].map(l => (
                  <div key={l} className="text-center text-sm font-medium p-2">
                    {l}
                  </div>
                ))}
                {[5, 4, 3, 2, 1].map(s => (
                  <React.Fragment key={s}>
                    <div className="text-center text-sm font-medium p-2 flex items-center justify-center">
                      {s}
                    </div>
                    {[1, 2, 3, 4, 5].map(l => {
                      const score = s * l;
                      const isSelected = s === riskSeverity && l === riskLikelihood;
                      let bgColor = 'bg-green-200';
                      if (score >= 20) bgColor = 'bg-red-600';
                      else if (score >= 12) bgColor = 'bg-orange-500';
                      else if (score >= 6) bgColor = 'bg-yellow-400';
                      
                      return (
                        <div
                          key={`${s}-${l}`}
                          className={`${bgColor} p-4 text-center font-medium rounded ${
                            isSelected ? 'ring-4 ring-blue-600 scale-110' : ''
                          } transition-all cursor-pointer hover:opacity-80`}
                          onClick={() => {
                            setRiskSeverity(s);
                            setRiskLikelihood(l);
                          }}
                        >
                          {score}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>← Severity (Vertical)</span>
                <span>Likelihood (Horizontal) →</span>
              </div>
            </div>

            {/* Risk Result */}
            <div className={`p-6 rounded-lg border-2 ${riskLevel.color} bg-opacity-10`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium mb-1">Risk Assessment Result</h4>
                  <p className="text-sm text-muted-foreground">
                    Severity: {riskSeverity} × Likelihood: {riskLikelihood} = Risk Score: {riskScore}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-bold ${riskLevel.textColor}`}>{riskLevel.level}</p>
                  <p className="text-sm text-muted-foreground">Risk Level</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Root Cause Analysis (5 Why's) */}
      {(currentStage === WORKFLOW_STAGES.SM_INITIAL_REVIEW || currentStageIndex >= stages.indexOf(WORKFLOW_STAGES.SM_INITIAL_REVIEW)) && (
        <Card className={currentStage === WORKFLOW_STAGES.SM_INITIAL_REVIEW ? 'border-2 border-blue-500 shadow-lg' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600" />
              Step 2: Root Cause Analysis (5 Why's)
            </CardTitle>
            <CardDescription>Conduct preliminary root cause analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {whyAnalysis.map((why, index) => (
              <div key={index}>
                <Label>Why #{index + 1}</Label>
                <Textarea
                  placeholder={`Enter why #${index + 1}...`}
                  value={why}
                  onChange={(e) => {
                    const newWhys = [...whyAnalysis];
                    newWhys[index] = e.target.value;
                    setWhyAnalysis(newWhys);
                  }}
                  rows={2}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Investigation Notes */}
      {(currentStage === WORKFLOW_STAGES.SM_INITIAL_REVIEW || currentStageIndex >= stages.indexOf(WORKFLOW_STAGES.SM_INITIAL_REVIEW)) && (
        <Card className={currentStage === WORKFLOW_STAGES.SM_INITIAL_REVIEW ? 'border-2 border-blue-500 shadow-lg' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Step 3: Investigation Notes
            </CardTitle>
            <CardDescription>
              Solicit additional info from submitter, Safety Team, and others at GFO to investigate the issue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Document investigation findings, interviews, additional information gathered..."
              value={investigationNotes}
              onChange={(e) => setInvestigationNotes(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Freeform textbox - Document all relevant investigation details
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step 4: P-A-C-E Assignment */}
      {(currentStage === WORKFLOW_STAGES.ASSIGNED_CORRECTIVE_ACTION || currentStageIndex >= stages.indexOf(WORKFLOW_STAGES.ASSIGNED_CORRECTIVE_ACTION)) && (
        <Card className={currentStage === WORKFLOW_STAGES.ASSIGNED_CORRECTIVE_ACTION ? 'border-2 border-blue-500 shadow-lg' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Step 4: P-A-C-E Model Assignment
            </CardTitle>
            <CardDescription>
              Assign roles using the P-A-C-E model (Process Owner, Approver, Contributor, Executer)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Process Owner (P) */}
            <div className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50/50">
              <Label className="font-medium text-purple-900">Process Owner (P)</Label>
              <p className="text-sm text-purple-700 mb-3">
                Individual most suited to develop appropriate corrective action
              </p>
              <div className="space-y-3">
                <Select
                  value={paceAssignments.processOwner.value}
                  onValueChange={(v) => setPaceAssignments({
                    ...paceAssignments,
                    processOwner: { ...paceAssignments.processOwner, value: v }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user or use custom fields below" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} - {user.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Or Enter Custom Name</Label>
                    <Input
                      placeholder="External contact name"
                      value={paceAssignments.processOwner.customName}
                      onChange={(e) => setPaceAssignments({
                        ...paceAssignments,
                        processOwner: { ...paceAssignments.processOwner, customName: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Custom Email</Label>
                    <Input
                      type="email"
                      placeholder="external@example.com"
                      value={paceAssignments.processOwner.customEmail}
                      onChange={(e) => setPaceAssignments({
                        ...paceAssignments,
                        processOwner: { ...paceAssignments.processOwner, customEmail: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Approver (A) */}
            <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50/50">
              <Label className="font-medium text-blue-900">Approver (A)</Label>
              <p className="text-sm text-blue-700 mb-3">
                Director of Maintenance, Chief Pilot, and/or Safety Manager
              </p>
              <div className="space-y-3">
                <Select
                  value={paceAssignments.approver.value}
                  onValueChange={(v) => setPaceAssignments({
                    ...paceAssignments,
                    approver: { ...paceAssignments.approver, value: v }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select approver" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} - {user.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Or Enter Custom Name</Label>
                    <Input
                      placeholder="External approver name"
                      value={paceAssignments.approver.customName}
                      onChange={(e) => setPaceAssignments({
                        ...paceAssignments,
                        approver: { ...paceAssignments.approver, customName: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Custom Email</Label>
                    <Input
                      type="email"
                      placeholder="external@example.com"
                      value={paceAssignments.approver.customEmail}
                      onChange={(e) => setPaceAssignments({
                        ...paceAssignments,
                        approver: { ...paceAssignments.approver, customEmail: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contributors (C) */}
            <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50/50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Label className="font-medium text-green-900">Contributors (C)</Label>
                  <p className="text-sm text-green-700">
                    Stakeholders: Maintenance, Scheduling, Facilities, Standards, Training, Medical, etc.
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={addPaceContributor}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-3">
                {paceAssignments.contributors.map((contributor: any, index: number) => (
                  <div key={index} className="flex gap-3 items-start bg-white p-3 rounded border">
                    <div className="flex-1 space-y-2">
                      <Select
                        value={contributor.value}
                        onValueChange={(v) => {
                          const newContributors = [...paceAssignments.contributors];
                          newContributors[index] = { ...contributor, value: v };
                          setPaceAssignments({ ...paceAssignments, contributors: newContributors });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select contributor" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} - {user.role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Custom name"
                          value={contributor.customName}
                          onChange={(e) => {
                            const newContributors = [...paceAssignments.contributors];
                            newContributors[index] = { ...contributor, customName: e.target.value };
                            setPaceAssignments({ ...paceAssignments, contributors: newContributors });
                          }}
                        />
                        <Input
                          type="email"
                          placeholder="Custom email"
                          value={contributor.customEmail}
                          onChange={(e) => {
                            const newContributors = [...paceAssignments.contributors];
                            newContributors[index] = { ...contributor, customEmail: e.target.value };
                            setPaceAssignments({ ...paceAssignments, contributors: newContributors });
                          }}
                        />
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removePaceContributor(index)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {paceAssignments.contributors.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No contributors added yet. Click "Add" to include stakeholders.
                  </p>
                )}
              </div>
            </div>

            {/* Executers (E) */}
            <div className="p-4 border-2 border-orange-200 rounded-lg bg-orange-50/50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Label className="font-medium text-orange-900">Executers (E)</Label>
                  <p className="text-sm text-orange-700">
                    Team members who will implement the corrective action
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={addPaceExecuter}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-3">
                {paceAssignments.executers.map((executer: any, index: number) => (
                  <div key={index} className="flex gap-3 items-start bg-white p-3 rounded border">
                    <div className="flex-1 space-y-2">
                      <Select
                        value={executer.value}
                        onValueChange={(v) => {
                          const newExecuters = [...paceAssignments.executers];
                          newExecuters[index] = { ...executer, value: v };
                          setPaceAssignments({ ...paceAssignments, executers: newExecuters });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select executer" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} - {user.role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Custom name"
                          value={executer.customName}
                          onChange={(e) => {
                            const newExecuters = [...paceAssignments.executers];
                            newExecuters[index] = { ...executer, customName: e.target.value };
                            setPaceAssignments({ ...paceAssignments, executers: newExecuters });
                          }}
                        />
                        <Input
                          type="email"
                          placeholder="Custom email"
                          value={executer.customEmail}
                          onChange={(e) => {
                            const newExecuters = [...paceAssignments.executers];
                            newExecuters[index] = { ...executer, customEmail: e.target.value };
                            setPaceAssignments({ ...paceAssignments, executers: newExecuters });
                          }}
                        />
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removePaceExecuter(index)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {paceAssignments.executers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No executers added yet. Click "Add" to assign implementation team.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Corrective Action Development */}
      {(currentStage === WORKFLOW_STAGES.ASSIGNED_CORRECTIVE_ACTION || currentStageIndex >= stages.indexOf(WORKFLOW_STAGES.ASSIGNED_CORRECTIVE_ACTION)) && (
        <Card className={currentStage === WORKFLOW_STAGES.ASSIGNED_CORRECTIVE_ACTION ? 'border-2 border-blue-500 shadow-lg' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Step 5: Corrective Action Development
            </CardTitle>
            <CardDescription>
              Process Owner develops corrective action with input from stakeholders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900 font-medium mb-2">Corrective Action Components</p>
              <p className="text-sm text-blue-700 mb-3">
                Select one or more components that the corrective action should include:
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="communications"
                    checked={correctiveActionComponents.communications}
                    onCheckedChange={(checked) => setCorrectiveActionComponents({
                      ...correctiveActionComponents,
                      communications: checked as boolean
                    })}
                  />
                  <Label htmlFor="communications" className="cursor-pointer">
                    Communications to raise awareness and serve as a "lesson-learned"
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="training"
                    checked={correctiveActionComponents.training}
                    onCheckedChange={(checked) => setCorrectiveActionComponents({
                      ...correctiveActionComponents,
                      training: checked as boolean
                    })}
                  />
                  <Label htmlFor="training" className="cursor-pointer">
                    Training / Standards directly related to the event and/or associated human factor(s)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="policy"
                    checked={correctiveActionComponents.policy}
                    onCheckedChange={(checked) => setCorrectiveActionComponents({
                      ...correctiveActionComponents,
                      policy: checked as boolean
                    })}
                  />
                  <Label htmlFor="policy" className="cursor-pointer">
                    Policy, procedures, manuals, checklists, task cards, etc.
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="equipment"
                    checked={correctiveActionComponents.equipment}
                    onCheckedChange={(checked) => setCorrectiveActionComponents({
                      ...correctiveActionComponents,
                      equipment: checked as boolean
                    })}
                  />
                  <Label htmlFor="equipment" className="cursor-pointer">
                    Equipment, services, software recommended, training
                  </Label>
                </div>
              </div>
            </div>

            <div>
              <Label>Detailed Corrective Action Plan</Label>
              <Textarea
                placeholder="Describe the proposed corrective action in detail, including specific steps, resources needed, timeline, and expected outcomes..."
                value={correctiveActionDetails}
                onChange={(e) => setCorrectiveActionDetails(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Freeform textbox - Assignee submits proposed corrective action back to Safety Manager
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 6: Safety Manager Review of Corrective Action */}
      {(currentStage === WORKFLOW_STAGES.SM_CA_REVIEW || currentStageIndex >= stages.indexOf(WORKFLOW_STAGES.SM_CA_REVIEW)) && (
        <Card className={currentStage === WORKFLOW_STAGES.SM_CA_REVIEW ? 'border-2 border-blue-500 shadow-lg' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              Step 6: Safety Manager Review of Corrective Action
            </CardTitle>
            <CardDescription>
              Determine if corrective action is appropriate and effective, then approve or reject
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-50 border rounded-lg">
              <Label className="text-muted-foreground mb-2 block">Proposed Corrective Action</Label>
              <p className="text-sm whitespace-pre-wrap">{correctiveActionDetails || 'No corrective action submitted yet'}</p>
            </div>

            <div>
              <Label>Safety Manager Review Notes</Label>
              <Textarea
                placeholder="Review the proposed corrective action. Document your assessment of its appropriateness and effectiveness. Approve or provide feedback for revision..."
                value={smReviewNotes}
                onChange={(e) => setSmReviewNotes(e.target.value)}
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Freeform textbox - Safety Manager reviews and approves/rejects
              </p>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve Corrective Action
              </Button>
              <Button variant="outline" className="flex-1 text-red-600 border-red-300">
                <XCircle className="w-4 h-4 mr-2" />
                Reject & Return for Revision
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 7: Line Manager & Executive Approval */}
      {(currentStageIndex >= stages.indexOf(WORKFLOW_STAGES.LINE_MANAGER_APPROVAL)) && (
        <Card className={(currentStage === WORKFLOW_STAGES.LINE_MANAGER_APPROVAL || currentStage === WORKFLOW_STAGES.EXEC_APPROVAL) ? 'border-2 border-blue-500 shadow-lg' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Step 7: Approval Chain
            </CardTitle>
            <CardDescription>
              Line Manager → Accountable Executive (returns to SM if denied)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-4 border rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium">Line Manager Approval</p>
                  <p className="text-sm text-muted-foreground">Review by department line manager</p>
                </div>
                {currentStage === WORKFLOW_STAGES.LINE_MANAGER_APPROVAL ? (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    Pending Approval
                  </Badge>
                ) : currentStageIndex > stages.indexOf(WORKFLOW_STAGES.LINE_MANAGER_APPROVAL) ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Approved
                  </Badge>
                ) : (
                  <Badge variant="outline">Not Started</Badge>
                )}
              </div>

              <div className="p-4 border rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium">Accountable Executive Approval</p>
                  <p className="text-sm text-muted-foreground">Final executive approval</p>
                </div>
                {currentStage === WORKFLOW_STAGES.EXEC_APPROVAL ? (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    Pending Approval
                  </Badge>
                ) : currentStageIndex > stages.indexOf(WORKFLOW_STAGES.EXEC_APPROVAL) ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Approved
                  </Badge>
                ) : (
                  <Badge variant="outline">Not Started</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 8: Implementation */}
      {(currentStageIndex >= stages.indexOf(WORKFLOW_STAGES.IMPLEMENTATION_ASSIGNMENT)) && (
        <Card className={(currentStage === WORKFLOW_STAGES.IMPLEMENTATION_ASSIGNMENT || currentStage === WORKFLOW_STAGES.IMPLEMENTATION_IN_PROGRESS) ? 'border-2 border-blue-500 shadow-lg' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-purple-600" />
              Step 8: Implementation
            </CardTitle>
            <CardDescription>
              Safety Manager assigns implementation or determines correct individual/group. Only advances after full completion.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Implementation Assignment & Progress Notes</Label>
              <Textarea
                placeholder="Document implementation assignment, progress tracking, completion status of all corrective action components..."
                value={implementationNotes}
                onChange={(e) => setImplementationNotes(e.target.value)}
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Freeform textbox - Track implementation until fully completed
              </p>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-900 font-medium mb-2">⚠️ Important</p>
              <p className="text-sm text-purple-700">
                Report can only advance to "Review for Effectiveness" stage after the corrective action has been fully implemented.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 9: Publication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-indigo-600" />
            Step 9: Publication (Can Publish at Any Stage)
          </CardTitle>
          <CardDescription>
            Publish report to all GFO employees to share outcomes and educate personnel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <p className="text-sm text-indigo-900 font-medium mb-2">Publication Flexibility</p>
            <p className="text-sm text-indigo-700">
              Safety may publish the report at any point in the process depending on the nature/severity and the need for timely action.
            </p>
          </div>

          <div>
            <Label>Publication Content</Label>
            <Textarea
              placeholder="Draft the publication content including lessons learned, policy changes, training requirements, new equipment, etc. to be shared with all employees..."
              value={publicationContent}
              onChange={(e) => setPublicationContent(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Freeform textbox - Content to be published to all GFO employees
            </p>
          </div>

          <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handlePublish}>
            <Send className="w-4 h-4 mr-2" />
            Publish to All Employees
          </Button>
        </CardContent>
      </Card>

      {/* Step 10: Effectiveness Review */}
      {(currentStage === WORKFLOW_STAGES.EFFECTIVENESS_REVIEW || currentStageIndex >= stages.indexOf(WORKFLOW_STAGES.EFFECTIVENESS_REVIEW)) && (
        <Card className={currentStage === WORKFLOW_STAGES.EFFECTIVENESS_REVIEW ? 'border-2 border-cyan-500 shadow-lg' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PauseCircle className="w-5 h-5 text-cyan-600" />
              Step 10: Review for Effectiveness (6-Month Period)
            </CardTitle>
            <CardDescription>
              Report sits idle for 6 months to collect data on effectiveness of mitigation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-6 h-6 text-cyan-600" />
                <div>
                  <p className="font-medium text-cyan-900">6-Month Effectiveness Review Period</p>
                  <p className="text-sm text-cyan-700">
                    Report entered effectiveness review on: {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-cyan-900">Time Elapsed</span>
                  <span className="text-sm text-cyan-700">22 days / 180 days</span>
                </div>
                <Progress value={(22 / 180) * 100} className="h-2" />
              </div>
              <p className="text-sm text-cyan-700 mt-3">
                Review due date: {new Date(Date.now() + 160 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900 font-medium mb-2">Purpose of Effectiveness Review</p>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Collect data on the effectiveness of the corrective action</li>
                <li>Monitor for any related incidents during the review period</li>
                <li>Adjust mitigation strategies if necessary</li>
                <li>Conduct final review between Safety Manager and involved parties</li>
              </ul>
            </div>

            <div>
              <Label>Effectiveness Review Notes</Label>
              <Textarea
                placeholder="Document observations during the 6-month review period. After 6 months, conduct final review with Safety Manager and involved parties before closing..."
                value={effectivenessReviewNotes}
                onChange={(e) => setEffectivenessReviewNotes(e.target.value)}
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Freeform textbox - Track effectiveness and final review notes
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <Button
              onClick={handleAdvanceStage}
              disabled={currentStage === WORKFLOW_STAGES.CLOSED}
              className="flex-1"
            >
              <Send className="w-4 h-4 mr-2" />
              {currentStage === WORKFLOW_STAGES.EFFECTIVENESS_REVIEW ? 'Complete Review & Close' : 'Advance to Next Stage'}
            </Button>
            <Button variant="outline" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Progress
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Notification Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Notification Sent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                Email notification has been sent to the following recipients:
              </p>
              <div className="p-3 bg-gray-50 border rounded font-mono text-sm">
                {emailRecipients}
              </div>
              <p className="text-xs text-muted-foreground">
                This is a placeholder notification. In production, emails would be sent via your email system.
              </p>
              <Button onClick={() => setShowEmailModal(false)} className="w-full">
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}