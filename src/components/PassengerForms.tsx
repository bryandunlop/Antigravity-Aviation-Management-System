import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription } from './ui/alert';
import { Switch } from './ui/switch';
import { 
  FileText, 
  Send, 
  Users, 
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Eye,
  Edit,
  RefreshCw,
  Mail,
  Download,
  ArrowRight
} from 'lucide-react';

interface PassengerForm {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  isActive: boolean;
  autoSend: boolean;
  sendTiming: number; // days before flight
  category: string;
}

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'select' | 'checkbox' | 'textarea';
  required: boolean;
  options?: string[];
}

interface FormSubmission {
  id: string;
  formId: string;
  formTitle: string;
  passengerName: string;
  passengerEmail: string;
  flightId: string;
  flightDate: string; // Store as string to avoid date parsing issues
  sentDate: string; // Store as string to avoid date parsing issues
  submittedDate?: string; // Store as string to avoid date parsing issues
  status: 'sent' | 'opened' | 'completed' | 'expired';
  responses: Record<string, any>;
}

interface Flight {
  id: string;
  date: string; // Store as string to avoid date parsing issues
  route: string;
  passengers: Passenger[];
}

interface Passenger {
  id: string;
  name: string;
  email: string;
  phone?: string;
  preferences?: Record<string, any>;
}

export default function PassengerForms() {
  const [activeTab, setActiveTab] = useState('manual-entry');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSendForm, setShowSendForm] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [selectedFormForEntry, setSelectedFormForEntry] = useState<PassengerForm | null>(null);
  const [manualEntryData, setManualEntryData] = useState<Record<string, any>>({});
  const [selectedFlight, setSelectedFlight] = useState<string>('');
  const [selectedPassenger, setSelectedPassenger] = useState(null);

  // Helper function to safely format dates
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Helper function to calculate days before flight
  const getDaysBeforeFlightText = (flightDateString: string, days: number) => {
    try {
      const flightDate = new Date(flightDateString);
      if (isNaN(flightDate.getTime())) {
        return 'Invalid Date';
      }
      const targetDate = new Date(flightDate.getTime() - (days * 24 * 60 * 60 * 1000));
      return targetDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Mock data
  const passengerForms: PassengerForm[] = [
    {
      id: 'PF001',
      title: 'Pre-Flight Information Form',
      description: 'Collect passenger preferences and requirements before flight',
      fields: [
        { id: 'f1', label: 'Dietary Restrictions', type: 'textarea', required: false },
        { id: 'f2', label: 'Seating Preference', type: 'select', required: false, options: ['Window', 'Aisle', 'No Preference'] },
        { id: 'f3', label: 'Special Assistance Needed', type: 'checkbox', required: false },
        { id: 'f4', label: 'Emergency Contact', type: 'text', required: true },
        { id: 'f5', label: 'Emergency Contact Phone', type: 'phone', required: true }
      ],
      isActive: true,
      autoSend: true,
      sendTiming: 3,
      category: 'pre-flight'
    },
    {
      id: 'PF002',
      title: 'Dietary Requirements & Allergies',
      description: 'Detailed food preferences and allergy information',
      fields: [
        { id: 'f1', label: 'Food Allergies', type: 'textarea', required: false },
        { id: 'f2', label: 'Dietary Restrictions', type: 'select', required: false, options: ['None', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Kosher', 'Halal'] },
        { id: 'f3', label: 'Beverage Preferences', type: 'textarea', required: false },
        { id: 'f4', label: 'Medication Allergies', type: 'textarea', required: false }
      ],
      isActive: true,
      autoSend: true,
      sendTiming: 5,
      category: 'catering'
    },
    {
      id: 'PF003',
      title: 'Post-Flight Feedback',
      description: 'Collect feedback after flight completion',
      fields: [
        { id: 'f1', label: 'Overall Experience Rating', type: 'select', required: true, options: ['Excellent', 'Good', 'Average', 'Below Average', 'Poor'] },
        { id: 'f2', label: 'Service Quality', type: 'select', required: true, options: ['Excellent', 'Good', 'Average', 'Below Average', 'Poor'] },
        { id: 'f3', label: 'Comments and Suggestions', type: 'textarea', required: false },
        { id: 'f4', label: 'Would you recommend our service?', type: 'select', required: true, options: ['Yes', 'No', 'Maybe'] }
      ],
      isActive: true,
      autoSend: false,
      sendTiming: 0,
      category: 'feedback'
    }
  ];

  const formSubmissions: FormSubmission[] = [
    {
      id: 'FS001',
      formId: 'PF001',
      formTitle: 'Pre-Flight Information Form',
      passengerName: 'Robert Johnson',
      passengerEmail: 'robert.johnson@email.com',
      flightId: 'FL001',
      flightDate: '2024-01-25',
      sentDate: '2024-01-22',
      submittedDate: '2024-01-23',
      status: 'completed',
      responses: {
        f1: 'No dairy products',
        f2: 'Window',
        f3: false,
        f4: 'Jane Johnson',
        f5: '+1-555-0123'
      }
    },
    {
      id: 'FS002',
      formId: 'PF002',
      formTitle: 'Dietary Requirements & Allergies',
      passengerName: 'Maria Garcia',
      passengerEmail: 'maria.garcia@email.com',
      flightId: 'FL002',
      flightDate: '2024-01-28',
      sentDate: '2024-01-23',
      status: 'sent',
      responses: {}
    },
    {
      id: 'FS003',
      formId: 'PF001',
      formTitle: 'Pre-Flight Information Form',
      passengerName: 'David Chen',
      passengerEmail: 'david.chen@email.com',
      flightId: 'FL003',
      flightDate: '2024-01-30',
      sentDate: '2024-01-25',
      status: 'opened',
      responses: {}
    }
  ];

  const upcomingFlights: Flight[] = [
    {
      id: 'FL001',
      date: '2024-01-25',
      route: 'KTEB → KPBI',
      passengers: [
        { id: 'P001', name: 'Robert Johnson', email: 'robert.johnson@email.com' },
        { id: 'P002', name: 'Sarah Johnson', email: 'sarah.johnson@email.com' }
      ]
    },
    {
      id: 'FL002',
      date: '2024-01-28',
      route: 'KPBI → KIAH',
      passengers: [
        { id: 'P003', name: 'Maria Garcia', email: 'maria.garcia@email.com' }
      ]
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'opened':
        return <Badge className="bg-blue-500">Opened</Badge>;
      case 'sent':
        return <Badge className="bg-yellow-500">Sent</Badge>;
      case 'expired':
        return <Badge className="bg-red-500">Expired</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'opened':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'sent':
        return <Send className="w-4 h-4 text-yellow-500" />;
      case 'expired':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  // Calculate summary statistics
  const summaryStats = {
    totalSent: formSubmissions.length,
    completed: formSubmissions.filter(s => s.status === 'completed').length,
    pending: formSubmissions.filter(s => s.status === 'sent' || s.status === 'opened').length,
    expired: formSubmissions.filter(s => s.status === 'expired').length
  };

  // Handle manual form entry
  const handleFieldChange = (fieldId: string, value: any) => {
    setManualEntryData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleManualSubmit = () => {
    if (!selectedFormForEntry || !selectedFlight || !selectedPassenger) {
      alert('Please select form, flight, and passenger');
      return;
    }

    // In a real app, this would save to the database
    console.log('Manual form entry submitted:', {
      formId: selectedFormForEntry.id,
      flightId: selectedFlight,
      passenger: selectedPassenger,
      responses: manualEntryData
    });

    // Reset form
    setSelectedFormForEntry(null);
    setManualEntryData({});
    setSelectedFlight('');
    setSelectedPassenger(null);
    alert('Form submitted successfully!');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Passenger Forms Management
        </h1>
        <p className="text-muted-foreground">Automated form distribution and response tracking</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="manual-entry">Manual Entry</TabsTrigger>
          <TabsTrigger value="submissions">Form Submissions</TabsTrigger>
          <TabsTrigger value="forms">Form Templates</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Manual Entry Tab */}
        <TabsContent value="manual-entry" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-accent" />
                Manual Form Entry
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Directly enter passenger form information when automated forms aren't completed or for in-person data collection
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {!selectedFormForEntry ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="form-select">Select Form Template</Label>
                    <div className="grid gap-3 mt-2">
                      {passengerForms.filter(form => form.isActive).map((form) => (
                        <Card 
                          key={form.id} 
                          className="cursor-pointer hover:bg-accent/5 transition-colors border-2 hover:border-accent/30"
                          onClick={() => setSelectedFormForEntry(form)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium">{form.title}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{form.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs">{form.category}</Badge>
                                  <Badge variant="secondary" className="text-xs">{form.fields.length} fields</Badge>
                                </div>
                              </div>
                              <ArrowRight className="w-5 h-5 text-muted-foreground" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Form Header */}
                  <div className="flex items-center justify-between p-4 bg-accent/5 rounded-lg">
                    <div>
                      <h3 className="font-medium">{selectedFormForEntry.title}</h3>
                      <p className="text-sm text-muted-foreground">{selectedFormForEntry.description}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSelectedFormForEntry(null);
                        setManualEntryData({});
                        setSelectedFlight('');
                        setSelectedPassenger(null);
                      }}
                    >
                      Change Form
                    </Button>
                  </div>

                  {/* Flight and Passenger Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="flight-select">Select Flight *</Label>
                      <Select value={selectedFlight} onValueChange={setSelectedFlight}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose flight" />
                        </SelectTrigger>
                        <SelectContent>
                          {upcomingFlights.map((flight) => (
                            <SelectItem key={flight.id} value={flight.id}>
                              {flight.id} - {flight.route} ({formatDate(flight.date)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="passenger-select">Select Passenger *</Label>
                      <Select 
                        value={selectedPassenger?.id || ''} 
                        onValueChange={(passengerId) => {
                          const flight = upcomingFlights.find(f => f.id === selectedFlight);
                          const passenger = flight?.passengers.find(p => p.id === passengerId);
                          setSelectedPassenger(passenger || null);
                        }}
                        disabled={!selectedFlight}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={selectedFlight ? "Choose passenger" : "Select flight first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedFlight && upcomingFlights
                            .find(f => f.id === selectedFlight)
                            ?.passengers.map((passenger) => (
                              <SelectItem key={passenger.id} value={passenger.id}>
                                {passenger.name} ({passenger.email})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Form Fields */}
                  {selectedFlight && selectedPassenger && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Form Fields</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Entering form data for: <strong>{selectedPassenger.name}</strong>
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedFormForEntry.fields.map((field) => (
                          <div key={field.id} className="space-y-2">
                            <Label htmlFor={field.id}>
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            
                            {field.type === 'text' && (
                              <Input
                                id={field.id}
                                value={manualEntryData[field.id] || ''}
                                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                                required={field.required}
                              />
                            )}
                            
                            {field.type === 'email' && (
                              <Input
                                id={field.id}
                                type="email"
                                value={manualEntryData[field.id] || ''}
                                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                                required={field.required}
                              />
                            )}
                            
                            {field.type === 'phone' && (
                              <Input
                                id={field.id}
                                type="tel"
                                value={manualEntryData[field.id] || ''}
                                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                                required={field.required}
                              />
                            )}
                            
                            {field.type === 'textarea' && (
                              <Textarea
                                id={field.id}
                                value={manualEntryData[field.id] || ''}
                                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                                required={field.required}
                                rows={3}
                              />
                            )}
                            
                            {field.type === 'select' && (
                              <Select 
                                value={manualEntryData[field.id] || ''} 
                                onValueChange={(value) => handleFieldChange(field.id, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                                <SelectContent>
                                  {field.options?.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                            
                            {field.type === 'checkbox' && (
                              <div className="flex items-center space-x-2">
                                <input
                                  id={field.id}
                                  type="checkbox"
                                  checked={manualEntryData[field.id] || false}
                                  onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                                  className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                                />
                                <Label htmlFor={field.id} className="text-sm font-normal">
                                  Yes, this applies
                                </Label>
                              </div>
                            )}
                          </div>
                        ))}
                        
                        <div className="flex justify-end pt-4 border-t">
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setSelectedFormForEntry(null);
                                setManualEntryData({});
                                setSelectedFlight('');
                                setSelectedPassenger(null);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleManualSubmit}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Submit Form
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Form Submissions Tab */}
        <TabsContent value="submissions" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryStats.totalSent}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{summaryStats.completed}</div>
                <p className="text-xs text-muted-foreground">
                  {summaryStats.totalSent > 0 ? Math.round((summaryStats.completed / summaryStats.totalSent) * 100) : 0}% response rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{summaryStats.pending}</div>
                <p className="text-xs text-muted-foreground">Awaiting response</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expired</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{summaryStats.expired}</div>
                <p className="text-xs text-muted-foreground">No response received</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button onClick={() => setShowSendForm(true)}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Form to Passenger
                </Button>
                <Button variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Send Reminders
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Responses
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Submissions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Form Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Form</TableHead>
                      <TableHead>Passenger</TableHead>
                      <TableHead>Flight</TableHead>
                      <TableHead>Sent Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">{submission.formTitle}</TableCell>
                        <TableCell>
                          <div>
                            <p>{submission.passengerName}</p>
                            <p className="text-xs text-muted-foreground">{submission.passengerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p>{submission.flightId}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(submission.flightDate)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(submission.sentDate)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(submission.status)}
                            {getStatusBadge(submission.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedSubmission(submission)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {submission.status !== 'completed' && (
                              <Button variant="outline" size="sm">
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                            )}
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

        {/* Form Templates Tab */}
        <TabsContent value="forms" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2>Form Templates</h2>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Form
            </Button>
          </div>

          <div className="grid gap-4">
            {passengerForms.map((form) => (
              <Card key={form.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {form.title}
                        <Badge variant={form.isActive ? 'default' : 'secondary'}>
                          {form.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {form.autoSend && (
                          <Badge variant="outline" className="text-xs">
                            Auto-send {form.sendTiming} days before
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{form.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Fields ({form.fields.length})</Label>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {form.fields.slice(0, 3).map((field, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {field.label}
                          </Badge>
                        ))}
                        {form.fields.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{form.fields.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Label>Auto-send:</Label>
                        <Switch checked={form.autoSend} />
                      </div>
                      <div>
                        <Label>Category:</Label>
                        <Badge variant="outline" className="ml-1 text-xs">{form.category}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Automated Form Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Automation is active. Forms are automatically sent to passengers based on configured timing.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <h3 className="font-medium">Upcoming Automated Sends</h3>
                  {upcomingFlights.map((flight) => (
                    <div key={flight.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">Flight {flight.id}</h4>
                          <p className="text-sm text-muted-foreground">
                            {flight.route} • {formatDate(flight.date)}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Passengers: {flight.passengers.map(p => p.name).join(', ')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">Auto-send triggers:</p>
                          <p className="text-xs text-muted-foreground">
                            Pre-flight form: {getDaysBeforeFlightText(flight.date, 3)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Dietary form: {getDaysBeforeFlightText(flight.date, 5)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Form Response Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Detailed analytics and response trends will be displayed here
                </p>
                <Button>View Detailed Analytics</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Form Response - {selectedSubmission.formTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Passenger</Label>
                  <p>{selectedSubmission.passengerName}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p>{selectedSubmission.passengerEmail}</p>
                </div>
                <div>
                  <Label>Flight</Label>
                  <p>{selectedSubmission.flightId}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  {getStatusBadge(selectedSubmission.status)}
                </div>
              </div>

              {selectedSubmission.status === 'completed' && (
                <div>
                  <Label>Responses</Label>
                  <div className="space-y-2 mt-2">
                    {Object.entries(selectedSubmission.responses).map(([fieldId, value]) => (
                      <div key={fieldId} className="p-3 border rounded-lg">
                        <Label className="text-sm font-medium">Field {fieldId}</Label>
                        <p className="text-sm">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button onClick={() => setSelectedSubmission(null)}>Close</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}