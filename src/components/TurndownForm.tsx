import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner@2.0.3';
import { 
  ClipboardList, 
  Plus, 
  X, 
  Camera, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  Save,
  Clock,
  User,
  Wrench,
  Plane,
  Building2,
  MapPin,
  ArrowRight,
  Calendar,
  FileText
} from 'lucide-react';

const aircraftList = [
  'N123AB - Gulfstream G650',
  'N456CD - Gulfstream G650',
  'N789EF - Gulfstream G650',
  'N321GH - Gulfstream G650'
];

const statusOptions = [
  { value: 'operational', label: 'Operational', color: 'bg-green-500' },
  { value: 'maintenance', label: 'In Maintenance', color: 'bg-yellow-500' },
  { value: 'aog', label: 'Aircraft on Ground (AOG)', color: 'bg-red-500' },
  { value: 'inspection', label: 'Scheduled Inspection', color: 'bg-blue-500' }
];

const severityLevels = [
  { value: 'low', label: 'Low', color: 'bg-green-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500' }
];

const hangarAreas = [
  { id: 'hangar-main', name: 'Main Hangar Floor', status: 'clear' },
  { id: 'hangar-north', name: 'North Bay', status: 'occupied' },
  { id: 'hangar-south', name: 'South Bay', status: 'maintenance' },
  { id: 'hangar-workshop', name: 'Workshop Area', status: 'clear' },
  { id: 'hangar-storage', name: 'Parts Storage', status: 'clear' }
];

const hangarStatusOptions = [
  { value: 'clear', label: 'Clear', color: 'bg-green-500' },
  { value: 'occupied', label: 'Aircraft Present', color: 'bg-blue-500' },
  { value: 'maintenance', label: 'Maintenance Activity', color: 'bg-yellow-500' },
  { value: 'blocked', label: 'Blocked/Restricted', color: 'bg-red-500' }
];

const workPriorityLevels = [
  { value: 'low', label: 'Low Priority', color: 'bg-green-500' },
  { value: 'medium', label: 'Medium Priority', color: 'bg-yellow-500' },
  { value: 'high', label: 'High Priority', color: 'bg-orange-500' },
  { value: 'critical', label: 'Critical/AOG', color: 'bg-red-500' }
];

export default function TurndownForm() {
  const [formData, setFormData] = useState({
    aircraft: '',
    technician: '',
    shiftStart: '',
    shiftEnd: '',
    aircraftStatus: '',
    accomplishments: [''],
    brokenItems: [],
    fleetStatus: {
      'N123AB': 'operational',
      'N456CD': 'operational', 
      'N789EF': 'operational',
      'N321GH': 'operational'
    },
    hangarStatus: hangarAreas.reduce((acc, area) => {
      acc[area.id] = area.status;
      return acc;
    }, {}),
    workRemaining: []
  });

  const [newBrokenItem, setNewBrokenItem] = useState({
    description: '',
    location: '',
    severity: '',
    photos: []
  });

  const [newWorkItem, setNewWorkItem] = useState({
    description: '',
    aircraft: '',
    priority: '',
    estimatedHours: '',
    targetDate: '',
    assignedTo: '',
    pushToMaintenance: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const addAccomplishment = () => {
    setFormData(prev => ({
      ...prev,
      accomplishments: [...prev.accomplishments, '']
    }));
  };

  const removeAccomplishment = (index) => {
    setFormData(prev => ({
      ...prev,
      accomplishments: prev.accomplishments.filter((_, i) => i !== index)
    }));
  };

  const updateAccomplishment = (index, value) => {
    setFormData(prev => ({
      ...prev,
      accomplishments: prev.accomplishments.map((item, i) => i === index ? value : item)
    }));
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    const newPhotos = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    
    setNewBrokenItem(prev => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos]
    }));
  };

  const removePhoto = (index) => {
    setNewBrokenItem(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const addBrokenItem = () => {
    if (newBrokenItem.description && newBrokenItem.location && newBrokenItem.severity) {
      setFormData(prev => ({
        ...prev,
        brokenItems: [...prev.brokenItems, { ...newBrokenItem, id: Date.now() }]
      }));
      
      setNewBrokenItem({
        description: '',
        location: '',
        severity: '',
        photos: []
      });
    }
  };

  const removeBrokenItem = (id) => {
    setFormData(prev => ({
      ...prev,
      brokenItems: prev.brokenItems.filter(item => item.id !== id)
    }));
  };

  const updateFleetStatus = (aircraft, status) => {
    setFormData(prev => ({
      ...prev,
      fleetStatus: {
        ...prev.fleetStatus,
        [aircraft]: status
      }
    }));
  };

  const updateHangarStatus = (areaId, status) => {
    setFormData(prev => ({
      ...prev,
      hangarStatus: {
        ...prev.hangarStatus,
        [areaId]: status
      }
    }));
  };

  const addWorkItem = () => {
    if (newWorkItem.description && newWorkItem.aircraft && newWorkItem.priority) {
      setFormData(prev => ({
        ...prev,
        workRemaining: [...prev.workRemaining, { ...newWorkItem, id: Date.now() }]
      }));
      
      setNewWorkItem({
        description: '',
        aircraft: '',
        priority: '',
        estimatedHours: '',
        targetDate: '',
        assignedTo: '',
        pushToMaintenance: false
      });
    }
  };

  const removeWorkItem = (id) => {
    setFormData(prev => ({
      ...prev,
      workRemaining: prev.workRemaining.filter(item => item.id !== id)
    }));
  };

  const togglePushToMaintenance = (id) => {
    setFormData(prev => ({
      ...prev,
      workRemaining: prev.workRemaining.map(item => 
        item.id === id ? { ...item, pushToMaintenance: !item.pushToMaintenance } : item
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      
      // Handle maintenance board integration
      const maintenanceItems = formData.workRemaining.filter(item => item.pushToMaintenance);
      if (maintenanceItems.length > 0) {
        toast.success(`${maintenanceItems.length} task(s) added to Maintenance Board`, {
          description: 'Work items have been automatically scheduled and assigned.'
        });
      }
      
      // Reset form
      setFormData({
        aircraft: '',
        technician: '',
        shiftStart: '',
        shiftEnd: '',
        aircraftStatus: '',
        accomplishments: [''],
        brokenItems: [],
        fleetStatus: {
          'N123AB': 'operational',
          'N456CD': 'operational', 
          'N789EF': 'operational',
          'N321GH': 'operational'
        },
        hangarStatus: hangarAreas.reduce((acc, area) => {
          acc[area.id] = area.status;
          return acc;
        }, {}),
        workRemaining: []
      });
      
      setTimeout(() => setShowSuccess(false), 5000);
    }, 2000);
  };

  const selectedStatus = statusOptions.find(status => status.value === formData.aircraftStatus);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="flex items-center gap-2">
          <ClipboardList className="w-6 h-6" />
          Maintenance Turndown Form
        </h1>
        <p className="text-muted-foreground">End-of-shift aircraft status and maintenance report</p>
      </div>

      {showSuccess && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Turndown form submitted successfully! Report has been logged and notifications sent to relevant personnel.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Shift Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aircraft">Aircraft *</Label>
                <Select value={formData.aircraft} onValueChange={(value) => setFormData(prev => ({ ...prev, aircraft: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select aircraft" />
                  </SelectTrigger>
                  <SelectContent>
                    {aircraftList.map((aircraft) => (
                      <SelectItem key={aircraft} value={aircraft}>{aircraft}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="technician">Lead Technician *</Label>
                <Input
                  id="technician"
                  value={formData.technician}
                  onChange={(e) => setFormData(prev => ({ ...prev, technician: e.target.value }))}
                  placeholder="Enter technician name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shiftStart">Shift Start Time *</Label>
                <Input
                  id="shiftStart"
                  type="datetime-local"
                  value={formData.shiftStart}
                  onChange={(e) => setFormData(prev => ({ ...prev, shiftStart: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shiftEnd">Shift End Time *</Label>
                <Input
                  id="shiftEnd"
                  type="datetime-local"
                  value={formData.shiftEnd}
                  onChange={(e) => setFormData(prev => ({ ...prev, shiftEnd: e.target.value }))}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aircraft Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Aircraft Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Current Aircraft Status *</Label>
              <Select value={formData.aircraftStatus} onValueChange={(value) => setFormData(prev => ({ ...prev, aircraftStatus: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select aircraft status" />
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

            {selectedStatus && (
              <div className="p-3 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${selectedStatus.color}`}></div>
                  <span className="font-medium">Status: {selectedStatus.label}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fleet Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="w-5 h-5" />
              Fleet Status Overview - All Gulfstream G650s
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aircraftList.map((aircraft) => {
                const aircraftCode = aircraft.split(' ')[0];
                const currentStatus = formData.fleetStatus[aircraftCode];
                const statusOption = statusOptions.find(s => s.value === currentStatus);
                
                return (
                  <div key={aircraftCode} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{aircraftCode}</h4>
                        <p className="text-sm text-muted-foreground">Gulfstream G650</p>
                      </div>
                      <Plane className="w-5 h-5 text-muted-foreground" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Current Status</Label>
                      <Select 
                        value={currentStatus} 
                        onValueChange={(value) => updateFleetStatus(aircraftCode, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
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
                    
                    {statusOption && (
                      <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                        <div className={`w-2 h-2 rounded-full ${statusOption.color}`}></div>
                        <span className="text-sm">{statusOption.label}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Hangar Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Hangar Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hangarAreas.map((area) => {
                const currentStatus = formData.hangarStatus[area.id];
                const statusOption = hangarStatusOptions.find(s => s.value === currentStatus);
                
                return (
                  <div key={area.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{area.name}</h4>
                      </div>
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select 
                        value={currentStatus} 
                        onValueChange={(value) => updateHangarStatus(area.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {hangarStatusOptions.map((status) => (
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
                    
                    {statusOption && (
                      <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                        <div className={`w-2 h-2 rounded-full ${statusOption.color}`}></div>
                        <span className="text-sm">{statusOption.label}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Daily Accomplishments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Daily Accomplishments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.accomplishments.map((accomplishment, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1">
                  <Textarea
                    value={accomplishment}
                    onChange={(e) => updateAccomplishment(index, e.target.value)}
                    placeholder={`Task ${index + 1} - Describe what was accomplished during this shift`}
                    className="min-h-[60px]"
                  />
                </div>
                {formData.accomplishments.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeAccomplishment(index)}
                    className="mt-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addAccomplishment}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Task
            </Button>
          </CardContent>
        </Card>

        {/* Broken Items Reporting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Broken Items / Issues Found
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Existing Broken Items */}
            {formData.brokenItems.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium">Reported Issues:</h4>
                {formData.brokenItems.map((item) => {
                  const severity = severityLevels.find(s => s.value === item.severity);
                  return (
                    <div key={item.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              <div className={`w-2 h-2 rounded-full ${severity?.color} mr-1`}></div>
                              {severity?.label}
                            </Badge>
                          </div>
                          <div>
                            <p className="font-medium">{item.description}</p>
                            <p className="text-sm text-muted-foreground">Location: {item.location}</p>
                          </div>
                          {item.photos.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                              {item.photos.map((photo, idx) => (
                                <div key={idx} className="relative">
                                  <img
                                    src={photo.url}
                                    alt={`Issue photo ${idx + 1}`}
                                    className="w-16 h-16 object-cover rounded border"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeBrokenItem(item.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                <Separator />
              </div>
            )}

            {/* Add New Broken Item */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h4 className="font-medium">Report New Issue:</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="itemDescription">Description</Label>
                  <Textarea
                    id="itemDescription"
                    value={newBrokenItem.description}
                    onChange={(e) => setNewBrokenItem(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the broken item or issue"
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="itemLocation">Location on Aircraft</Label>
                    <Input
                      id="itemLocation"
                      value={newBrokenItem.location}
                      onChange={(e) => setNewBrokenItem(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., Cabin, Cockpit, Engine compartment"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="itemSeverity">Severity Level</Label>
                    <Select value={newBrokenItem.severity} onValueChange={(value) => setNewBrokenItem(prev => ({ ...prev, severity: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        {severityLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${level.color}`}></div>
                              {level.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <Label htmlFor="photos">Photos (Optional)</Label>
                <div className="flex items-center gap-4">
                  <label htmlFor="photoUpload" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg hover:bg-muted/50 transition-colors">
                      <Camera className="w-4 h-4" />
                      <span>Add Photos</span>
                    </div>
                    <input
                      id="photoUpload"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {newBrokenItem.photos.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {newBrokenItem.photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={photo.url}
                          alt={`Upload ${index + 1}`}
                          className="w-20 h-20 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                type="button"
                onClick={addBrokenItem}
                disabled={!newBrokenItem.description || !newBrokenItem.location || !newBrokenItem.severity}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Issue to Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Work Remaining */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Work Remaining / Future Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Existing Work Items */}
            {formData.workRemaining.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium">Scheduled Tasks:</h4>
                {formData.workRemaining.map((item) => {
                  const priority = workPriorityLevels.find(p => p.value === item.priority);
                  return (
                    <div key={item.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              <div className={`w-2 h-2 rounded-full ${priority?.color} mr-1`}></div>
                              {priority?.label}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {item.aircraft}
                            </Badge>
                            {item.pushToMaintenance && (
                              <Badge className="text-xs bg-primary">
                                <ArrowRight className="w-3 h-3 mr-1" />
                                Push to Maintenance
                              </Badge>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{item.description}</p>
                            <div className="text-sm text-muted-foreground space-y-1">
                              {item.estimatedHours && <p>Estimated Hours: {item.estimatedHours}</p>}
                              {item.targetDate && <p>Target Date: {new Date(item.targetDate).toLocaleDateString()}</p>}
                              {item.assignedTo && <p>Assigned To: {item.assignedTo}</p>}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={item.pushToMaintenance ? "default" : "outline"}
                            size="sm"
                            onClick={() => togglePushToMaintenance(item.id)}
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeWorkItem(item.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <Separator />
              </div>
            )}

            {/* Add New Work Item */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h4 className="font-medium">Schedule New Task:</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4 md:col-span-2">
                  <div className="space-y-2">
                    <Label htmlFor="workDescription">Task Description *</Label>
                    <Textarea
                      id="workDescription"
                      value={newWorkItem.description}
                      onChange={(e) => setNewWorkItem(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the work that needs to be completed"
                      className="min-h-[80px]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workAircraft">Aircraft *</Label>
                  <Select value={newWorkItem.aircraft} onValueChange={(value) => setNewWorkItem(prev => ({ ...prev, aircraft: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select aircraft" />
                    </SelectTrigger>
                    <SelectContent>
                      {aircraftList.map((aircraft) => {
                        const aircraftCode = aircraft.split(' ')[0];
                        return (
                          <SelectItem key={aircraftCode} value={aircraftCode}>{aircraft}</SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workPriority">Priority *</Label>
                  <Select value={newWorkItem.priority} onValueChange={(value) => setNewWorkItem(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {workPriorityLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${level.color}`}></div>
                            {level.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workHours">Estimated Hours</Label>
                  <Input
                    id="workHours"
                    type="number"
                    step="0.5"
                    value={newWorkItem.estimatedHours}
                    onChange={(e) => setNewWorkItem(prev => ({ ...prev, estimatedHours: e.target.value }))}
                    placeholder="Hours"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workDate">Target Date</Label>
                  <Input
                    id="workDate"
                    type="date"
                    value={newWorkItem.targetDate}
                    onChange={(e) => setNewWorkItem(prev => ({ ...prev, targetDate: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workAssigned">Assign To</Label>
                  <Input
                    id="workAssigned"
                    value={newWorkItem.assignedTo}
                    onChange={(e) => setNewWorkItem(prev => ({ ...prev, assignedTo: e.target.value }))}
                    placeholder="Technician name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pushToMaintenance">Send to Maintenance Board</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="pushToMaintenance"
                      type="checkbox"
                      checked={newWorkItem.pushToMaintenance}
                      onChange={(e) => setNewWorkItem(prev => ({ ...prev, pushToMaintenance: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-muted-foreground">
                      Automatically create maintenance task
                    </span>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                onClick={addWorkItem}
                disabled={!newWorkItem.description || !newWorkItem.aircraft || !newWorkItem.priority}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Work Item
              </Button>
            </div>
            
            {formData.workRemaining.filter(item => item.pushToMaintenance).length > 0 && (
              <Alert className="border-primary/20 bg-primary/5">
                <ArrowRight className="h-4 w-4 text-primary" />
                <AlertDescription className="text-primary">
                  {formData.workRemaining.filter(item => item.pushToMaintenance).length} task(s) will be automatically added to the Maintenance Board when this form is submitted.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end pt-6">
          <Button
            type="submit"
            disabled={isSubmitting || !formData.aircraft || !formData.technician || !formData.shiftStart || !formData.shiftEnd || !formData.aircraftStatus}
            className="min-w-[200px]"
          >
            {isSubmitting ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Submit Turndown Report
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}