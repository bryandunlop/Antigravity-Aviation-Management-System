import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Send,
  Save,
  Mail,
  Clock,
  FileText,
  Target,
  PlayCircle,
  PauseCircle,
  Plus,
  Trash2,
  Users,
  Paperclip,
  ChevronRight,
  MapPin,
  Calendar,
  AlertCircle,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { useHazards, WORKFLOW_STAGES } from '../contexts/HazardContext';
import { useNotificationContext } from './contexts/NotificationContext';
import ProgressTracker, { PHASES } from './HazardWorkflow/ProgressTracker';

export default function HazardWorkflow() {
  const { id } = useParams();
  const { getHazardById, updateHazard } = useHazards();
  const hazard = id ? getHazardById(id) : null;

  // -- State --
  const [currentStage, setCurrentStage] = useState(WORKFLOW_STAGES.SM_INITIAL_REVIEW);

  // Wizard Visibility States
  const [showRiskWizard, setShowRiskWizard] = useState(false);
  const [showRCAWizard, setShowRCAWizard] = useState(false);
  const [showPACEWizard, setShowPACEWizard] = useState(false);

  // Data States (Risk, RCA, PACE)
  const [riskSeverity, setRiskSeverity] = useState(3);
  const [riskLikelihood, setRiskLikelihood] = useState(3);
  const [whyAnalysis, setWhyAnalysis] = useState(['', '', '', '', '']);
  const [investigationNotes, setInvestigationNotes] = useState('');
  const [consolidatedPlan, setConsolidatedPlan] = useState('');

  // Updated State Definition to match Hazard Interface
  const [paceAssignments, setPaceAssignments] = useState({
    processOwner: { type: 'user', value: '', customName: '', customEmail: '', customMessage: '', status: 'pending' as 'pending' | 'submitted' },
    approver: { type: 'user', value: '', customName: '', customEmail: '', customMessage: '', status: 'pending' as 'pending' | 'approved' | 'rejected' },
    contributors: [] as Array<{ id: string | number, type: string, value: string, customName: string, customEmail: string, customMessage?: string, status?: string }>,
    executers: [] as Array<{ id: string | number, type: string, value: string, customName: string, customEmail: string, customMessage?: string, status?: string }>
  });

  // Hydrate state
  useEffect(() => {
    if (hazard) {
      setCurrentStage(hazard.workflowStage || WORKFLOW_STAGES.SM_INITIAL_REVIEW);
      if (hazard.riskAnalysis) {
        setRiskSeverity(hazard.riskAnalysis.severity);
        setRiskLikelihood(hazard.riskAnalysis.likelihood);
      }
      if (hazard.whyAnalysis && hazard.whyAnalysis.length > 0) setWhyAnalysis(hazard.whyAnalysis);
      if (hazard.investigationNotes) setInvestigationNotes(hazard.investigationNotes);

      if (hazard.paceAssignments) {
        setPaceAssignments({
          processOwner: {
            type: hazard.paceAssignments.processOwner.type || 'user',
            value: hazard.paceAssignments.processOwner.value || '',
            customName: hazard.paceAssignments.processOwner.customName || '',
            customEmail: hazard.paceAssignments.processOwner.customEmail || '',
            customMessage: hazard.paceAssignments.processOwner.customMessage || '',
            status: hazard.paceAssignments.processOwner.status || 'pending'
          },
          approver: {
            type: hazard.paceAssignments.approver.type || 'user',
            value: hazard.paceAssignments.approver.value || '',
            customName: hazard.paceAssignments.approver.customName || '',
            customEmail: hazard.paceAssignments.approver.customEmail || '',
            customMessage: hazard.paceAssignments.approver.customMessage || '',
            status: hazard.paceAssignments.approver.status || 'pending'
          },
          contributors: hazard.paceAssignments.contributors.map(c => ({
            id: c.id || Date.now(),
            type: c.type || 'user',
            value: c.value || '',
            customName: c.customName || '',
            customEmail: c.customEmail || '',
            customMessage: c.customMessage || '',
            status: c.status || 'pending'
          })),
          executers: hazard.paceAssignments.executers.map(e => ({
            id: e.id || Date.now(),
            type: e.type || 'user',
            value: e.value || '',
            customName: e.customName || '',
            customEmail: e.customEmail || '',
            customMessage: e.customMessage || '',
            status: e.status || 'pending'
          }))
        });
      }
    }
  }, [hazard]);

  // Sample Data Injection for Collection Phase Demo
  useEffect(() => {
    if (currentStage === WORKFLOW_STAGES.SM_CA_REVIEW && !(paceAssignments.processOwner as any).response) {
      // Inject sample content if empty to demonstrate the 'Collection' phase
      setPaceAssignments(prev => ({
        ...prev,
        processOwner: {
          ...prev.processOwner,
          status: 'submitted',
          response: (prev.processOwner as any).response || "We have updated the refueling checklist to require a secondary visual verification of the nozzle locking mechanism. All ground crew have been briefed on this change during the morning stand-up."
        },
        contributors: prev.contributors.length > 0 ? prev.contributors : [{
          id: 'mock-contributor-1',
          type: 'user',
          value: 'mock-c',
          customName: 'Sarah Jenkins (Ops)',
          customEmail: 'sarah.j@example.com',
          status: 'submitted',
          // @ts-ignore
          response: "Ops team confirms the new checklist aligns with standard turn-around times. No delays expected."
        }],
        approver: { ...prev.approver, status: 'pending' },
        executers: prev.executers.map(e => ({ ...e, status: 'completed' }))
      }));
      setConsolidatedPlan("Action Plan: Update standard operating procedure for refueling to include mandatory secondary nozzle check. All staff briefed. \n\nResponse to Feedback: Operational impact is negligible as confirmed by Ops team. New checklist effective immediately.");
    }
  }, [currentStage]);

  if (!hazard) return <div className="p-8 text-center">Hazard not found</div>;

  // -- Helper Functions --
  const saveChanges = () => {
    if (!id) return;
    updateHazard(id, {
      workflowStage: currentStage,
      riskAnalysis: { severity: riskSeverity, likelihood: riskLikelihood },
      whyAnalysis,
      investigationNotes,
      paceAssignments: paceAssignments as any, // Cast to any to bypass strict partial mismatch if needed, or ensure exact match
    });
    toast.success('Progress saved');
  };

  const advanceStage = (nextStage: string) => {
    setCurrentStage(nextStage);
    if (id) updateHazard(id, { workflowStage: nextStage });
    toast.success(`Advanced to ${nextStage}`);
  };

  // -- Wizard Components (Internal for simplicity) --

  const RiskWizard = () => (
    <Dialog open={showRiskWizard} onOpenChange={setShowRiskWizard}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>GFO Risk Assessment Matrix</DialogTitle>
          <DialogDescription>Assess the severity and likelihood of the hazard.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-8 py-4">
          {/* 5x5 Heatmap Visualization - Simplified for Wizard */}
          <div className="col-span-2 md:col-span-1">
            <div className="grid grid-cols-6 gap-1 text-center text-xs">
              <div className="font-bold"></div>
              {[1, 2, 3, 4, 5].map(s => <div key={s} className="font-bold">{s}</div>)}
              {[0, 1, 2, 3, 4].map(l => (
                <React.Fragment key={l}>
                  <div className="font-bold text-right pr-2">{l}</div>
                  {[1, 2, 3, 4, 5].map(s => {
                    const score = l + s;
                    let bg = score <= 3 ? 'bg-green-300' : score <= 6 ? 'bg-yellow-300' : 'bg-red-500 text-white';
                    const isSelected = riskSeverity === s && riskLikelihood === l;
                    return (
                      <div
                        key={`${l}-${s}`}
                        onClick={() => { setRiskSeverity(s); setRiskLikelihood(l); }}
                        className={`p-2 cursor-pointer border ${bg} ${isSelected ? 'ring-4 ring-blue-600' : ''}`}
                      >
                        {l}-{s}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
            <div className="mt-4 text-center">
              <p className="font-bold">Selected Score: {riskSeverity + riskLikelihood}</p>
            </div>
          </div>

          {/* Text Descriptions */}
          <div className="space-y-4 text-sm">
            <div>
              <Label>Severity (1-5)</Label>
              <p className="text-muted-foreground">1: Negligible {'->'} 5: Catastrophic</p>
            </div>
            <div>
              <Label>Likelihood (0-4)</Label>
              <p className="text-muted-foreground">0: Rare {'->'} 4: Frequent</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => setShowRiskWizard(false)}>Save & Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const RCAWizard = () => (
    <Dialog open={showRCAWizard} onOpenChange={setShowRCAWizard}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Root Cause Analysis (5 Whys)</DialogTitle>
          <DialogDescription>Drill down to the root cause by asking "Why?" five times.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {whyAnalysis.map((why, index) => (
            <div key={index}>
              <Label className="font-medium text-blue-800">
                {index === 0 ? "1. Why did this make sense for the person to do what they did?" : `Then why? (${index + 1})`}
              </Label>
              <Textarea
                value={why}
                onChange={(e) => {
                  const newWhys = [...whyAnalysis];
                  newWhys[index] = e.target.value;
                  setWhyAnalysis(newWhys);
                }}
                placeholder={index === 0 ? "Start with the immediate cause..." : "Dig deeper..."}
                className="mt-1"
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={() => setShowRCAWizard(false)}>Save Analysis</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const PACEWizard = () => (
    <Dialog open={showPACEWizard} onOpenChange={setShowPACEWizard}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>PACE Model Assignment</DialogTitle>
          <DialogDescription>Assign roles for corrective action implementation.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">

          {/* Process Owner (P) */}
          <div className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50/50">
            <Label className="font-bold text-lg text-purple-900 flex items-center gap-2">
              <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">P</span>
              Process Owner
            </Label>
            <p className="text-sm text-purple-700 mb-3 ml-8">Who is responsible for developing the fix?</p>
            <div className="ml-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={paceAssignments.processOwner.customName || ''}
                  onChange={(e) => setPaceAssignments({
                    ...paceAssignments,
                    processOwner: { ...paceAssignments.processOwner, customName: e.target.value }
                  })}
                  placeholder="Enter name..."
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={paceAssignments.processOwner.customEmail || ''}
                  onChange={(e) => setPaceAssignments({
                    ...paceAssignments,
                    processOwner: { ...paceAssignments.processOwner, customEmail: e.target.value }
                  })}
                  placeholder="Enter email..."
                />
              </div>
            </div>
            <div className="mt-3 ml-8">
              <Label className="text-xs">Custom Message / Instructions</Label>
              <Textarea
                placeholder="Enter specific instructions for the Process Owner..."
                value={paceAssignments.processOwner.customMessage || ''}
                onChange={(e) => setPaceAssignments({
                  ...paceAssignments,
                  processOwner: { ...paceAssignments.processOwner, customMessage: e.target.value }
                })}
                className="bg-white mt-1 h-20"
              />
            </div>
          </div>

          {/* Approver (A) */}
          <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50/50">
            <Label className="font-bold text-lg text-blue-900 flex items-center gap-2">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">A</span>
              Approver
            </Label>
            <p className="text-sm text-blue-700 mb-3 ml-8">Who must sign off on the proposed fix?</p>
            <div className="ml-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={paceAssignments.approver.customName || ''}
                  onChange={(e) => setPaceAssignments({
                    ...paceAssignments,
                    approver: { ...paceAssignments.approver, customName: e.target.value }
                  })}
                  placeholder="Enter name..."
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={paceAssignments.approver.customEmail || ''}
                  onChange={(e) => setPaceAssignments({
                    ...paceAssignments,
                    approver: { ...paceAssignments.approver, customEmail: e.target.value }
                  })}
                  placeholder="Enter email..."
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contributors (C) */}
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <Label className="font-bold flex items-center gap-2">
                  <span className="bg-gray-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">C</span>
                  Contributors
                </Label>
                <Button size="sm" variant="outline" onClick={() => setPaceAssignments({
                  ...paceAssignments,
                  contributors: [...paceAssignments.contributors, { id: Date.now(), type: 'user', value: '', customName: '', customEmail: '' }]
                })}>
                  <Plus className="w-3 h-3 mr-1" /> Add
                </Button>
              </div>
              <div className="space-y-3">
                {paceAssignments.contributors.map((c, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder="Contributor Name"
                      value={c.customName}
                      onChange={(e) => {
                        const newContribs = [...paceAssignments.contributors];
                        newContribs[i].customName = e.target.value;
                        setPaceAssignments({ ...paceAssignments, contributors: newContribs });
                      }}
                    />
                    <Input
                      placeholder="Message (Optional)"
                      className="text-xs"
                      value={c.customMessage || ''}
                      onChange={(e) => {
                        const newContribs = [...paceAssignments.contributors];
                        newContribs[i].customMessage = e.target.value;
                        setPaceAssignments({ ...paceAssignments, contributors: newContribs });
                      }}
                    />
                    <Button size="icon" variant="ghost" className="text-red-500" onClick={() => {
                      const newContribs = paceAssignments.contributors.filter((_, idx) => idx !== i);
                      setPaceAssignments({ ...paceAssignments, contributors: newContribs });
                    }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {paceAssignments.contributors.length === 0 && <p className="text-sm text-muted-foreground italic">No contributors added.</p>}
              </div>
            </div>

            {/* Executers (E) */}
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <Label className="font-bold flex items-center gap-2">
                  <span className="bg-gray-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">E</span>
                  Executers
                </Label>
                <Button size="sm" variant="outline" onClick={() => setPaceAssignments({
                  ...paceAssignments,
                  executers: [...paceAssignments.executers, { id: Date.now(), type: 'user', value: '', customName: '', customEmail: '' }]
                })}>
                  <Plus className="w-3 h-3 mr-1" /> Add
                </Button>
              </div>
              <div className="space-y-3">
                {paceAssignments.executers.map((e, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder="Executer Name"
                      value={e.customName}
                      onChange={(ev) => {
                        const newExecs = [...paceAssignments.executers];
                        newExecs[i].customName = ev.target.value;
                        setPaceAssignments({ ...paceAssignments, executers: newExecs });
                      }}
                    />
                    <Button size="icon" variant="ghost" className="text-red-500" onClick={() => {
                      const newExecs = paceAssignments.executers.filter((_, idx) => idx !== i);
                      setPaceAssignments({ ...paceAssignments, executers: newExecs });
                    }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {paceAssignments.executers.length === 0 && <p className="text-sm text-muted-foreground italic">No executers added.</p>}
              </div>
            </div>
          </div>

        </div>

        <DialogFooter>
          <Button onClick={() => setShowPACEWizard(false)}>Save Assignments</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // -- Main Layout --
  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">

      {/* 1. Header & Phases */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-600" />
            Hazard #{hazard.id}
          </h1>
          <p className="text-muted-foreground">{hazard.title}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/safety/manager-dashboard">
            <Button variant="outline">Exit</Button>
          </Link>
          <Button onClick={saveChanges}><Save className="w-4 h-4 mr-2" /> Save</Button>
        </div>
      </div>

      <ProgressTracker currentStage={currentStage} onStageClick={setCurrentStage} allowNavigation={true} />

      {/* 2. Split Screen Layout - Dynamic for Collection Phase */}
      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 transition-all duration-500`}>

        {/* LEFT COLUMN: Case File (Context & Read-Only Summaries) 
            - Normally takes 2/3 width.
            - In Collection Phase, shrinks to 1/3 to give Report Builder more room.
        */}
        <div className={`space-y-6 ${currentStage === WORKFLOW_STAGES.SM_CA_REVIEW ? 'lg:col-span-1' : 'lg:col-span-2'}`}>

          {/* Hazard Details Card (Always Visible) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Case Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Reported By:</span> <div className="font-medium">{hazard.reportedBy}</div></div>
                <div><span className="text-muted-foreground">Date:</span> <div className="font-medium">{hazard.reportedDate}</div></div>
                <div><span className="text-muted-foreground">Location:</span> <div className="font-medium">{hazard.location}</div></div>
                <div><span className="text-muted-foreground">Severity:</span> <Badge variant="outline">{hazard.severity}</Badge></div>
              </div>
              <Separator />
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="bg-slate-50 p-3 rounded-md mt-1 text-sm">{hazard.description}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Immediate Actions</Label>
                <p className="bg-slate-50 p-3 rounded-md mt-1 text-sm">{hazard.immediateActions}</p>
              </div>
            </CardContent>
          </Card>

          {/* Smart Summaries - Only show if data exists */}
          {(riskSeverity + riskLikelihood > 0) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex justify-between">
                  Risk Analysis
                  <Badge className={
                    (riskSeverity + riskLikelihood) >= 7 ? 'bg-red-100 text-red-800' :
                      (riskSeverity + riskLikelihood) >= 4 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }>
                    Score: {riskSeverity + riskLikelihood}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Severity: {riskSeverity} • Likelihood: {riskLikelihood}</p>
              </CardContent>
            </Card>
          )}

          {whyAnalysis.some(w => w.length > 0) && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Root Cause Analysis</CardTitle></CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {whyAnalysis.filter(w => w).map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* PACE Summary - Assignment & Response Tracking */}
          {(paceAssignments.processOwner.customName || paceAssignments.approver.customName) && (
            <Card className="border-t-4 border-t-indigo-500">
              <CardHeader className="pb-3 bg-slate-50/50">
                <CardTitle className="text-base flex justify-between items-center">
                  PACE Team Activity
                  <Badge variant="outline" className="bg-white">
                    {Object.values(paceAssignments.processOwner).includes('submitted') ? 'Action Required' : 'Monitoring'}
                  </Badge>
                </CardTitle>
                <CardDescription>Review and edit team responses for the final report.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">

                  {/* Process Owner - The Fixer */}
                  <div className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs ring-2 ring-purple-50">PO</div>
                        <div>
                          <div className="font-semibold text-sm flex items-center gap-2">
                            {paceAssignments.processOwner.customName || 'Unassigned'}
                            <Badge variant="secondary" className="text-[10px] h-4">Process Owner</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">{paceAssignments.processOwner.customEmail}</div>
                        </div>
                      </div>
                      <Badge className={paceAssignments.processOwner.status === 'submitted' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}>
                        {paceAssignments.processOwner.status === 'submitted' ? 'Responded' : 'Pending'}
                      </Badge>
                    </div>

                    {/* Response Section */}
                    <div className="ml-11 mt-2">
                      <Label className="text-xs text-muted-foreground mb-1 block uppercase tracking-wider">Corrective Action Plan</Label>
                      {(paceAssignments.processOwner as any).response || paceAssignments.processOwner.status === 'submitted' ? (
                        <div className="group relative">
                          <Textarea
                            value={(paceAssignments.processOwner as any).response || ''}
                            onChange={(e) => setPaceAssignments({
                              ...paceAssignments,
                              processOwner: { ...paceAssignments.processOwner, response: e.target.value } as any
                            })}
                            className="min-h-[80px] text-sm bg-yellow-50/30 border-yellow-200 focus:border-yellow-400 focus:ring-yellow-200"
                            placeholder="Waiting for response..."
                          />
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Badge variant="outline" className="bg-white text-xs border-yellow-300 text-yellow-700">Editable</Badge>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground italic bg-slate-50 p-3 rounded border border-dashed text-center">
                          Waiting for Process Owner to submit corrective action plan...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Approver - The Sign-off */}
                  <div className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs ring-2 ring-blue-50">AP</div>
                        <div>
                          <div className="font-semibold text-sm flex items-center gap-2">
                            {paceAssignments.approver.customName || 'Unassigned'}
                            <Badge variant="secondary" className="text-[10px] h-4">Approver</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">{paceAssignments.approver.customEmail}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {paceAssignments.approver.status === 'approved' && <CheckCircle className="w-5 h-5 text-green-500" />}
                        <span className={`text-sm font-medium ${paceAssignments.approver.status === 'approved' ? 'text-green-700' : 'text-slate-500'}`}>
                          {paceAssignments.approver.status === 'approved' ? 'Approved' : 'Pending Approval'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Executers - The Doers */}
                  {paceAssignments.executers.length > 0 && (
                    <div className="p-4 bg-slate-50/30">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Implementation Team</Label>
                      <div className="space-y-2">
                        {paceAssignments.executers.map((e, i) => (
                          <div key={i} className="flex justify-between items-center p-2 bg-white rounded border border-slate-200 text-sm shadow-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-600 font-bold">EX</div>
                              <span>{e.customName}</span>
                            </div>
                            <Badge variant={e.status === 'completed' ? 'default' : 'secondary'} className="text-[10px] h-5">
                              {e.status === 'completed' ? 'Maintained' : 'Pending'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </CardContent>
            </Card>
          )}

          {/* Investigation Notes Preview */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Investigation Notes</CardTitle></CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add ongoing notes..."
                value={investigationNotes}
                onChange={(e) => setInvestigationNotes(e.target.value)}
                className="h-24 bg-yellow-50/50"
              />
            </CardContent>
          </Card>

        </div>

        {/* RIGHT COLUMN: Action Center (Active tasks) 
            - Normally takes 1/3 width.
            - In Collection Phase, expands to 2/3 to show full Report Builder.
        */}
        <div className={`space-y-6 ${currentStage === WORKFLOW_STAGES.SM_CA_REVIEW ? 'lg:col-span-2' : ''}`}>
          <div className="sticky top-6">
            <Card className="border-t-4 border-t-blue-600 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Action Center
                </CardTitle>
                <CardDescription>
                  Current Phase: <span className="font-semibold text-foreground">{PHASES.find(p => p.stages.includes(currentStage))?.label}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">

                {/* Dynamic Actions based on Stage */}

                {/* 1. INVESTIGATION PHASE ACTIONS */}
                {(currentStage === WORKFLOW_STAGES.SM_INITIAL_REVIEW) && (
                  <>
                    <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 mb-4">
                      <p className="font-semibold mb-1">Safety Manager Tasks:</p>
                      <ul className="list-disc list-inside">
                        <li>Conduct Risk Assessment</li>
                        <li>Perform Root Cause Analysis (5 Whys)</li>
                        <li>Determine Corrective Actions</li>
                      </ul>
                    </div>

                    <Button
                      className="w-full justify-between"
                      variant="outline"
                      onClick={() => setShowRiskWizard(true)}
                    >
                      <span className="flex items-center gap-2"><Target className="w-4 h-4 text-orange-500" /> Risk Assessment Matrix</span>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </Button>

                    <Button
                      className="w-full justify-between"
                      variant="outline"
                      onClick={() => setShowRCAWizard(true)}
                    >
                      <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-purple-500" /> 5 Whys Analysis</span>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </Button>

                    <div className="pt-2">
                      <Label className="text-xs font-semibold text-slate-700 mb-1 block">Evidence & Attachments</Label>
                      <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="bg-slate-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Paperclip className="w-5 h-5 text-slate-400" />
                        </div>
                        <p className="text-xs text-slate-600 font-medium">Drop files or click</p>
                        <p className="text-[10px] text-slate-400">Photos, PDF Reports, etc.</p>
                      </div>
                    </div>

                    <Separator className="my-2" />

                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => advanceStage(WORKFLOW_STAGES.ASSIGNED_CORRECTIVE_ACTION)}
                    >
                      Complete Investigation <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                    </Button>
                  </>
                )}

                {/* 2. ACTION PLAN PHASE ACTIONS */}
                {(currentStage === WORKFLOW_STAGES.ASSIGNED_CORRECTIVE_ACTION) && (
                  <>
                    <div className="bg-purple-50 p-3 rounded-lg text-sm text-purple-800 mb-4">
                      <p className="font-semibold mb-1">Assign Responsibilities:</p>
                      <p>Use the PACE model to assign Process Owners, Approvers, and Executers.</p>
                    </div>

                    <Button className="w-full justify-between" variant="outline" onClick={() => setShowPACEWizard(true)}>
                      <span className="flex items-center gap-2"><Users className="w-4 h-4 text-indigo-500" /> Assign PACE Team</span>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </Button>

                    <Separator className="my-2" />

                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => advanceStage(WORKFLOW_STAGES.SM_CA_REVIEW)}
                    >
                      Begin Collection Phase <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </>
                )}

                {/* 3. COLLECTION PHASE ACTIONS */}
                {/* 3. COLLECTION PHASE - Report Builder */}
                {(currentStage === WORKFLOW_STAGES.SM_CA_REVIEW) && (
                  <div className="space-y-4">
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                      <h3 className="text-indigo-900 font-semibold flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4" /> Collection Phase Active
                      </h3>
                      <p className="text-sm text-indigo-700 mb-3">
                        Review the gathered investigation data and team responses below. This draft will be generated into the final PDF.
                      </p>

                      {/* Report Preview / Builder */}
                      <Card className="border shadow-sm">
                        <CardHeader className="py-3 bg-slate-50 border-b">
                          <CardTitle className="text-sm uppercase tracking-wider text-slate-500">Draft Report Preview</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4 text-sm">

                          {/* Section 1: Incident Overview */}
                          <div className="pb-4 border-b space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-slate-800 text-lg">Hazard Report #{hazard.id}</h4>
                                <p className="text-muted-foreground text-xs">{hazard.title}</p>
                              </div>
                              <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-700">Draft</Badge>
                            </div>
                            <div className="bg-slate-50 p-3 rounded border border-slate-100 italic text-slate-600 text-xs">
                              "{hazard.description}"
                            </div>
                            <div className="mt-2 text-xs">
                              <span className="font-semibold text-slate-700">Immediate Actions: </span>
                              <span className="text-slate-600">{hazard.immediateActions || "Crew immediately stopped the flow of fuel and deployed the spill containment kit. Operations were halted for 30 minutes for cleanup."}</span>
                            </div>
                          </div>

                          {/* Section 2: Investigation Data */}
                          <div className="pb-4 border-b grid grid-cols-2 gap-4">
                            {/* Risk Analysis Detail */}
                            <div className="space-y-2">
                              <h5 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">Risk Analysis</h5>
                              <div className="bg-white border rounded p-2 text-xs space-y-1">
                                <div className="flex justify-between"><span>Severity:</span> <span className="font-medium">{riskSeverity || 3}</span></div>
                                <div className="flex justify-between"><span>Likelihood:</span> <span className="font-medium">{riskLikelihood || 4}</span></div>
                                <div className="flex justify-between pt-1 border-t mt-1">
                                  <span className="font-bold">Score:</span>
                                  <Badge className={((riskSeverity || 3) + (riskLikelihood || 4)) >= 7 ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}>
                                    {(riskSeverity || 3) + (riskLikelihood || 4)}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* 5 Whys Detail */}
                            <div className="space-y-2">
                              <h5 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">Root Cause (5 Whys)</h5>
                              <div className="bg-white border rounded p-2 text-xs space-y-1">
                                {(whyAnalysis.some(w => w) ? whyAnalysis.filter(w => w) : [
                                  "Valve failed to close.",
                                  "Spring mechanism was fatigued.",
                                  "Maintenance interval was extended.",
                                  "Lack of spare parts inventory.",
                                  "Supply chain delays not communicated."
                                ]).map((w, i) => (
                                  <div key={i} className="flex gap-2">
                                    <span className="text-slate-400 font-mono">{i + 1}.</span>
                                    <span className="text-slate-700">{w}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Investigation Notes - Full Width Row */}
                            <div className="col-span-2 space-y-2 pt-2 border-t mt-2">
                              <h5 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">Investigation Notes</h5>
                              <div className="bg-slate-50 p-2 rounded text-xs text-slate-600 whitespace-pre-wrap">
                                {hazard.investigationNotes || "Interviews with the ground crew confirmed that the pre-check was skipped due to time pressure from the delayed inbound flight. No mechanical defects found on the truck nozzle."}
                              </div>
                            </div>

                            {/* Attachments Section */}
                            <div className="col-span-2 space-y-2 pt-2 border-t mt-2">
                              <h5 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">Evidence / Attachments</h5>
                              <div className="flex gap-2 flex-wrap">
                                {hazard.attachments && hazard.attachments.length > 0 ? hazard.attachments.map((att, i) => (
                                  <Badge key={i} variant="secondary" className="file-attachment text-xs py-1 px-2 border-slate-200 bg-white hover:bg-slate-100 cursor-pointer">
                                    <Paperclip className="w-3 h-3 mr-1 text-slate-400" />
                                    {att.name}
                                  </Badge>
                                )) : (
                                  <>
                                    <Badge variant="secondary" className="file-attachment text-xs py-1 px-2 border-slate-200 bg-white">
                                      <Paperclip className="w-3 h-3 mr-1 text-slate-400" /> spilled_fuel_photo.jpg
                                    </Badge>
                                    <Badge variant="secondary" className="file-attachment text-xs py-1 px-2 border-slate-200 bg-white">
                                      <Paperclip className="w-3 h-3 mr-1 text-slate-400" /> witness_statement_mj.pdf
                                    </Badge>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Section 3: Team Feedback (Reference) */}
                          <div>
                            <h4 className="font-semibold text-slate-900 flex justify-between items-center">
                              2. Team Feedback (Reference)
                              <Badge variant="outline" className="text-[10px]">PACE Inputs</Badge>
                            </h4>
                            <div className="mt-2 space-y-3">

                              {/* Process Owner - Main Action */}
                              <div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Process Owner</span>
                                {(paceAssignments.processOwner as any).response ? (
                                  <div className="p-2 bg-slate-50 border border-slate-100 rounded text-slate-600 text-xs italic opacity-80">
                                    "{(paceAssignments.processOwner as any).response}"
                                  </div>
                                ) : (
                                  <div className="p-2 border border-dashed border-slate-300 rounded text-slate-400 text-xs text-center italic">
                                    Waiting for Process Owner response...
                                  </div>
                                )}
                              </div>

                              {/* Contributors - Supporting Actions */}
                              {paceAssignments.contributors.length > 0 && (
                                <div>
                                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Contributors</span>
                                  <div className="space-y-2">
                                    {paceAssignments.contributors.map((c, idx) => (
                                      <div key={idx} className="flex flex-col gap-1">
                                        <span className="text-xs font-medium text-slate-700">{c.customName}</span>
                                        {(c as any).response ? (
                                          <div className="p-2 bg-slate-50 border border-slate-100 rounded text-slate-600 text-xs italic opacity-80">
                                            "{(c as any).response}"
                                          </div>
                                        ) : (
                                          <div className="p-2 border border-dashed border-slate-200 rounded text-slate-400 text-xs italic">
                                            Pending input...
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Section 4: Final Consolidated Plan (Editable) */}
                          <div className="pt-4 border-t mt-4">
                            <h4 className="font-semibold text-slate-900 flex justify-between items-center mb-2">
                              3. Final Corrective Action Plan
                              <Badge className="bg-blue-600 text-white text-[10px]">Editable Draft</Badge>
                            </h4>
                            <p className="text-xs text-muted-foreground mb-2">Synthesize the team's feedback into the final plan to be implemented.</p>
                            <Textarea
                              value={consolidatedPlan}
                              onChange={(e) => setConsolidatedPlan(e.target.value)}
                              className="min-h-[120px] text-sm bg-white border-blue-200 focus:border-blue-500"
                              placeholder="Write the final consolidated corrective action plan here..."
                            />
                          </div>

                        </CardContent>
                      </Card>
                    </div>

                    <Separator className="my-2" />

                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" className="w-full">
                        <Mail className="w-4 h-4 mr-2" /> Remind Team
                      </Button>
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => advanceStage(WORKFLOW_STAGES.LINE_MANAGER_APPROVAL)}
                      >
                        Finalize Report <Send className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* 4. APPROVALS PHASE ACTIONS */}
                {(currentStage === WORKFLOW_STAGES.LINE_MANAGER_APPROVAL || currentStage === WORKFLOW_STAGES.EXEC_APPROVAL) && (
                  <>
                    <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800 mb-4">
                      <p className="font-semibold mb-1">Pending Approval:</p>
                      <p>Waiting for {currentStage === WORKFLOW_STAGES.LINE_MANAGER_APPROVAL ? "Line Manager" : "Executive"} sign-off.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">Reject</Button>
                      <Button className="bg-green-600 hover:bg-green-700" onClick={() => advanceStage(WORKFLOW_STAGES.IMPLEMENTATION_ASSIGNMENT)}>Approve</Button>
                    </div>
                  </>
                )}

                {/* DEFAULT / GENERIC ADVANCE */}
                {![WORKFLOW_STAGES.SM_INITIAL_REVIEW, WORKFLOW_STAGES.ASSIGNED_CORRECTIVE_ACTION, WORKFLOW_STAGES.SM_CA_REVIEW, WORKFLOW_STAGES.LINE_MANAGER_APPROVAL, WORKFLOW_STAGES.EXEC_APPROVAL].includes(currentStage) && (
                  <div className="text-sm text-center text-muted-foreground p-4">
                    No active tasks for your role in this stage.
                  </div>
                )}

              </CardContent>
            </Card>

            {/* Quick Shortcuts */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="ghost" size="sm" className="h-auto py-2 flex-col gap-1 text-xs">
                <Mail className="w-4 h-4" />
                Email Team
              </Button>
              <Button variant="ghost" size="sm" className="h-auto py-2 flex-col gap-1 text-xs">
                <FileText className="w-4 h-4" />
                Gen Report
              </Button>
            </div>

          </div >
        </div >

      </div >

      {/* Render Wizards */}
      < RiskWizard />
      <RCAWizard />
      <PACEWizard />

    </div >
  );
}