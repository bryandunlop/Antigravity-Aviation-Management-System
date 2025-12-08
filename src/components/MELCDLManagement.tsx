import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  FileText,
  Plus,
  Eye,
  Edit,
  Plane,
  Shield,
  AlertCircle
} from 'lucide-react';
import { useMaintenanceContext } from './contexts/MaintenanceContext';
import { toast } from 'sonner';

export default function MELCDLManagement() {
  const { squawks, updateSquawk } = useMaintenanceContext();
  const [selectedSquawk, setSelectedSquawk] = useState<any>(null);
  const [isDeferralDialogOpen, setIsDeferralDialogOpen] = useState(false);
  const [deferralForm, setDeferralForm] = useState({
    melReference: '',
    deferralCategory: 'C' as 'A' | 'B' | 'C' | 'D',
    expiryDays: '10',
    conditions: '',
    operationalLimitations: '',
    authorizedBy: 'Current User'
  });

  // Get all deferred squawks
  const deferredSquawks = squawks.filter(s => s.status === 'deferred' && s.deferral);

  // Calculate days remaining for each deferral
  const calculateDaysRemaining = (expiryDate: Date) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  // Get alert status based on days remaining
  const getAlertStatus = (daysRemaining: number): 'ok' | 'warning' | 'critical' | 'expired' => {
    if (daysRemaining < 0) return 'expired';
    if (daysRemaining <= 2) return 'critical';
    if (daysRemaining <= 5) return 'warning';
    return 'ok';
  };

  // Categorize deferrals
  const expiredDeferrals = deferredSquawks.filter(s => {
    const days = calculateDaysRemaining(s.deferral!.expiryDate);
    return days < 0;
  });

  const criticalDeferrals = deferredSquawks.filter(s => {
    const days = calculateDaysRemaining(s.deferral!.expiryDate);
    return days >= 0 && days <= 2;
  });

  const warningDeferrals = deferredSquawks.filter(s => {
    const days = calculateDaysRemaining(s.deferral!.expiryDate);
    return days > 2 && days <= 5;
  });

  const okDeferrals = deferredSquawks.filter(s => {
    const days = calculateDaysRemaining(s.deferral!.expiryDate);
    return days > 5;
  });

  const handleCreateDeferral = () => {
    if (!selectedSquawk) return;

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(deferralForm.expiryDays));

    const limitations = deferralForm.operationalLimitations
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    updateSquawk(selectedSquawk.id, {
      status: 'deferred',
      deferral: {
        melReference: deferralForm.melReference,
        deferralCategory: deferralForm.deferralCategory,
        expiryDate,
        authorizedBy: deferralForm.authorizedBy,
        conditions: deferralForm.conditions,
        operationalLimitations: limitations
      }
    });

    toast.success('Deferral Created', {
      description: `Squawk ${selectedSquawk.id} deferred under MEL ${deferralForm.melReference}`
    });

    setIsDeferralDialogOpen(false);
    setDeferralForm({
      melReference: '',
      deferralCategory: 'C',
      expiryDays: '10',
      conditions: '',
      operationalLimitations: '',
      authorizedBy: 'Current User'
    });
  };

  const handleExtendDeferral = (squawk: any) => {
    const newExpiryDate = new Date(squawk.deferral.expiryDate);
    
    // Determine extension based on category
    const extensionDays = {
      'A': 1,
      'B': 3,
      'C': 10,
      'D': 120
    }[squawk.deferral.deferralCategory] || 10;

    newExpiryDate.setDate(newExpiryDate.getDate() + extensionDays);

    updateSquawk(squawk.id, {
      deferral: {
        ...squawk.deferral,
        expiryDate: newExpiryDate
      }
    });

    toast.success('Deferral Extended', {
      description: `Extended by ${extensionDays} days`
    });
  };

  const handleClearDeferral = (squawk: any) => {
    updateSquawk(squawk.id, {
      status: 'closed',
      closedAt: new Date(),
      closedBy: 'Current User',
      deferral: undefined
    });

    toast.success('Deferral Cleared', {
      description: `Squawk ${squawk.id} repaired and returned to service`
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'A': return 'bg-red-100 text-red-800 border-red-200';
      case 'B': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'D': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertBadge = (status: string) => {
    switch (status) {
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">EXPIRED</Badge>;
      case 'critical':
        return <Badge className="bg-orange-100 text-orange-800">CRITICAL</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">WARNING</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-800">OK</Badge>;
    }
  };

  const DeferralCard = ({ squawk }: { squawk: any }) => {
    const daysRemaining = calculateDaysRemaining(squawk.deferral.expiryDate);
    const alertStatus = getAlertStatus(daysRemaining);

    return (
      <Card className={`
        ${alertStatus === 'expired' ? 'border-red-500 bg-red-50' : ''}
        ${alertStatus === 'critical' ? 'border-orange-500 bg-orange-50' : ''}
        ${alertStatus === 'warning' ? 'border-yellow-500 bg-yellow-50' : ''}
      `}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-sm">{squawk.id}</span>
                <Badge className={getCategoryColor(squawk.deferral.deferralCategory)}>
                  Category {squawk.deferral.deferralCategory}
                </Badge>
                {getAlertBadge(alertStatus)}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Plane className="w-3 h-3" />
                <span>{squawk.aircraftTail}</span>
                <span>•</span>
                <span>ATA {squawk.ataChapter}</span>
              </div>
              <p className="text-sm mb-2">{squawk.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
            <div>
              <span className="text-muted-foreground">MEL Reference: </span>
              <span className="font-medium">{squawk.deferral.melReference}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Authorized By: </span>
              <span className="font-medium">{squawk.deferral.authorizedBy}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Expires: </span>
              <span className="font-medium">
                {new Date(squawk.deferral.expiryDate).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Days Remaining: </span>
              <span className={`font-medium ${
                daysRemaining < 0 ? 'text-red-600' :
                daysRemaining <= 2 ? 'text-orange-600' :
                daysRemaining <= 5 ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {daysRemaining < 0 ? `Expired ${Math.abs(daysRemaining)} days ago` : `${daysRemaining} days`}
              </span>
            </div>
          </div>

          {squawk.deferral.operationalLimitations.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium mb-1">Operational Limitations:</p>
              <ul className="text-sm text-muted-foreground list-disc list-inside">
                {squawk.deferral.operationalLimitations.map((limit: string, idx: number) => (
                  <li key={idx}>{limit}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleExtendDeferral(squawk)}
              disabled={daysRemaining < 0}
            >
              <Clock className="w-3 h-3 mr-1" />
              Extend
            </Button>
            <Button 
              size="sm"
              onClick={() => handleClearDeferral(squawk)}
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Clear Deferral
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>MEL/CDL Management</h1>
          <p className="text-muted-foreground">
            Manage Minimum Equipment List and Configuration Deviation List deferrals
          </p>
        </div>
        <Button onClick={() => {
          setSelectedSquawk(null);
          setIsDeferralDialogOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          New Deferral
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-red-700">Expired</p>
                <p className="text-2xl text-red-700">{expiredDeferrals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-orange-700">Critical (≤2 days)</p>
                <p className="text-2xl text-orange-700">{criticalDeferrals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm text-yellow-700">Warning (3-5 days)</p>
                <p className="text-2xl text-yellow-700">{warningDeferrals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-green-700">OK (&gt;5 days)</p>
                <p className="text-2xl text-green-700">{okDeferrals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert for expired deferrals */}
      {expiredDeferrals.length > 0 && (
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Attention Required:</strong> {expiredDeferrals.length} deferral(s) have expired and must be addressed immediately.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="expired" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="expired">
            Expired ({expiredDeferrals.length})
          </TabsTrigger>
          <TabsTrigger value="critical">
            Critical ({criticalDeferrals.length})
          </TabsTrigger>
          <TabsTrigger value="warning">
            Warning ({warningDeferrals.length})
          </TabsTrigger>
          <TabsTrigger value="ok">
            OK ({okDeferrals.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({deferredSquawks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expired" className="space-y-4">
          {expiredDeferrals.map(squawk => (
            <DeferralCard key={squawk.id} squawk={squawk} />
          ))}
          {expiredDeferrals.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No expired deferrals</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="critical" className="space-y-4">
          {criticalDeferrals.map(squawk => (
            <DeferralCard key={squawk.id} squawk={squawk} />
          ))}
          {criticalDeferrals.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No critical deferrals</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="warning" className="space-y-4">
          {warningDeferrals.map(squawk => (
            <DeferralCard key={squawk.id} squawk={squawk} />
          ))}
          {warningDeferrals.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No warning deferrals</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ok" className="space-y-4">
          {okDeferrals.map(squawk => (
            <DeferralCard key={squawk.id} squawk={squawk} />
          ))}
          {okDeferrals.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No deferrals in good standing</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {deferredSquawks.map(squawk => (
            <DeferralCard key={squawk.id} squawk={squawk} />
          ))}
          {deferredSquawks.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No active deferrals</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Deferral Dialog */}
      <Dialog open={isDeferralDialogOpen} onOpenChange={setIsDeferralDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create MEL/CDL Deferral</DialogTitle>
            <DialogDescription>
              Defer a maintenance item under the Minimum Equipment List
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>MEL Reference</Label>
              <Input
                value={deferralForm.melReference}
                onChange={(e) => setDeferralForm({ ...deferralForm, melReference: e.target.value })}
                placeholder="e.g., 21-31-01"
              />
            </div>

            <div className="space-y-2">
              <Label>Deferral Category</Label>
              <Select 
                value={deferralForm.deferralCategory} 
                onValueChange={(value: any) => setDeferralForm({ ...deferralForm, deferralCategory: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Category A (1 day)</SelectItem>
                  <SelectItem value="B">Category B (3 days)</SelectItem>
                  <SelectItem value="C">Category C (10 days)</SelectItem>
                  <SelectItem value="D">Category D (120 days)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Expiry (Days)</Label>
              <Input
                type="number"
                value={deferralForm.expiryDays}
                onChange={(e) => setDeferralForm({ ...deferralForm, expiryDays: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Authorized By</Label>
              <Input
                value={deferralForm.authorizedBy}
                onChange={(e) => setDeferralForm({ ...deferralForm, authorizedBy: e.target.value })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Conditions for Deferral</Label>
              <Textarea
                value={deferralForm.conditions}
                onChange={(e) => setDeferralForm({ ...deferralForm, conditions: e.target.value })}
                placeholder="Describe conditions that must be met for this deferral..."
                rows={3}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Operational Limitations (one per line)</Label>
              <Textarea
                value={deferralForm.operationalLimitations}
                onChange={(e) => setDeferralForm({ ...deferralForm, operationalLimitations: e.target.value })}
                placeholder="Enter operational limitations, one per line..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeferralDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDeferral} disabled={!deferralForm.melReference}>
              Create Deferral
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
