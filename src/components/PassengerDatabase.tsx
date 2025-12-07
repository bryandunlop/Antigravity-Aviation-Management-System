import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { toast } from 'sonner@2.0.3';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  Star,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  Coffee,
  Utensils,
  AlertTriangle,
  ShieldAlert,
  AlertCircle,
  Clock,
  User,
  Cake,
  Wine,
  Save,
  X
} from 'lucide-react';

interface Passenger {
  id: string;
  name: string;
  info: {
    email?: string;
    phone?: string;
    address?: string;
    vipLevel: 'Standard' | 'VIP' | 'VVIP';
  };
  classification: {
    category: 'BOD' | 'C-Suite' | 'Authorized User' | 'Standard';
    role?: string; // For C-Suite and Role category
    notes?: string; // For Standard category or additional notes
  };
  allergies: Array<{
    allergen: string;
    severity: 'Critical' | 'Moderate' | 'Mild';
    reaction?: string;
    medication?: string;
  }>;
  birthday: string;
  beverage: string[];
  food: string[];
  passengerComfort: {
    temperature?: string;
    seating?: string;
    tvPreference?: string;
    lighting?: string;
    specialRequests?: string;
  };
  additionalNotes: string;
}

export default function PassengerDatabase() {
  const [searchTerm, setSearchTerm] = useState('');
  const [vipFilter, setVipFilter] = useState('all');
  const [allergyFilter, setAllergyFilter] = useState('all');
  const [classificationFilter, setClassificationFilter] = useState('all');
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null);
  const [isAddingPassenger, setIsAddingPassenger] = useState(false);
  const [isEditingPassenger, setIsEditingPassenger] = useState(false);
  const [isPassengerDetailOpen, setIsPassengerDetailOpen] = useState(false);

  // Mock passengers data with new structure
  const [passengers, setPassengers] = useState<Passenger[]>([
    {
      id: 'PAX001',
      name: 'Robert Johnson',
      info: {
        email: 'robert.johnson@email.com',
        phone: '+1 (555) 123-4567',
        address: '123 Park Avenue, New York, NY 10021',
        vipLevel: 'VVIP'
      },
      classification: {
        category: 'BOD',
        notes: 'Board Chairman - highest priority passenger'
      },
      allergies: [
        { 
          allergen: 'Shellfish', 
          severity: 'Critical', 
          reaction: 'Anaphylaxis', 
          medication: 'EpiPen - seat pocket' 
        },
        { 
          allergen: 'Tree nuts', 
          severity: 'Moderate', 
          reaction: 'Hives, swelling', 
          medication: 'Benadryl' 
        }
      ],
      birthday: '1975-03-15',
      beverage: ['Dom Pérignon', 'Macallan 18', 'Perrier', 'Espresso'],
      food: ['Wagyu Beef', 'Lobster Thermidor', 'Truffle Pasta', 'Aged Ribeye', 'French cuisine', 'Italian cuisine'],
      passengerComfort: {
        temperature: '72°F',
        seating: 'Forward-facing window seat with extra legroom',
        tvPreference: 'Action movies',
        lighting: 'Dimmed lighting preferred',
        specialRequests: 'Fresh orchids for cabin, Evian water only, prefers to board last for privacy'
      },
      additionalNotes: 'High-profile business executive. Values privacy and premium service. Always travels with personal security. Enjoys discussing business and golf. Prefers traditional preparations and formal service style.'
    },
    {
      id: 'PAX002',
      name: 'Sarah Chen',
      info: {
        email: 'sarah.chen@techcorp.com',
        phone: '+1 (555) 987-6543',
        vipLevel: 'VIP'
      },
      classification: {
        category: 'C-Suite',
        role: 'CEO',
        notes: 'Chief Executive Officer of TechCorp'
      },
      allergies: [],
      birthday: '1985-08-22',
      beverage: ['Green tea', 'Kombucha', 'Sparkling water', 'Oat milk latte'],
      food: ['Vegetarian meals', 'Quinoa bowls', 'Mediterranean salads', 'Fresh fruit', 'Japanese cuisine', 'Plant-based options'],
      passengerComfort: {
        temperature: '70°F',
        seating: 'Aisle seat near power outlet',
        tvPreference: 'Documentaries',
        lighting: 'Bright lighting for work',
        specialRequests: 'Extra power outlets, noise-canceling headphones, minimal conversation during flight'
      },
      additionalNotes: 'Tech executive who frequently works during flights. Very punctual and prefers quiet environment. Focus on healthy, fresh food options. Environmentally conscious - prefers eco-friendly options when available.'
    },
    {
      id: 'PAX003',
      name: 'Michael Rodriguez',
      info: {
        email: 'mrodriguez@email.com',
        phone: '+1 (555) 456-7890',
        vipLevel: 'Standard'
      },
      classification: {
        category: 'Authorized User',
        notes: 'Authorized by company for business travel'
      },
      allergies: [
        { 
          allergen: 'Peanuts', 
          severity: 'Critical', 
          reaction: 'Severe breathing difficulty', 
          medication: 'EpiPen required immediately' 
        }
      ],
      birthday: '1990-12-03',
      beverage: ['Coffee (black)', 'Whiskey neat', 'Craft beer', 'Energy drinks'],
      food: ['Grilled meats', 'BBQ', 'Mexican cuisine', 'Cheese platters', 'Keto-friendly options', 'High-protein meals'],
      passengerComfort: {
        temperature: '68°F',
        seating: 'Window seat',
        tvPreference: 'Comedy shows',
        lighting: 'Standard lighting',
        specialRequests: 'Tour of cockpit if possible, interested in flight operations'
      },
      additionalNotes: 'Young entrepreneur, first-time private jet passenger. Very interested in the aircraft and flight operations. Strict keto diet adherence. Enjoys bold flavors and spicy food. Appreciates quality meat preparations.'
    },
    {
      id: 'PAX004',
      name: 'Emily Watson',
      info: {
        email: 'emily.watson@email.com',
        phone: '+1 (555) 234-5678',
        vipLevel: 'VIP'
      },
      classification: {
        category: 'Standard',
        notes: 'Frequent business traveler - lactose intolerant'
      },
      allergies: [
        { 
          allergen: 'Bee stings', 
          severity: 'Moderate', 
          reaction: 'Localized swelling', 
          medication: 'Antihistamine' 
        },
        { 
          allergen: 'Latex', 
          severity: 'Mild', 
          reaction: 'Skin irritation', 
          medication: 'Avoid latex gloves' 
        }
      ],
      birthday: '1978-06-10',
      beverage: ['Oat milk latte', 'Sparkling water', 'Champagne', 'Herbal tea'],
      food: ['Seafood', 'Nordic cuisine', 'Dairy-free options', 'Modern European', 'Artisanal breads', 'Root vegetables'],
      passengerComfort: {
        temperature: '71°F',
        seating: 'Aisle seat',
        tvPreference: 'Drama series',
        lighting: 'Soft lighting',
        specialRequests: 'No latex materials anywhere, all dairy-free meal options, minimal conversation'
      },
      additionalNotes: 'Frequent business traveler with lactose intolerance. Prefers minimal conversation during flights. Appreciates innovative and artistic food presentation. Ensure all items are completely dairy-free.'
    }
  ]);

  // Filter passengers based on search and filters
  const filteredPassengers = passengers.filter(passenger => {
    const matchesSearch = 
      passenger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      passenger.info.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      passenger.food.some(item => item.toLowerCase().includes(searchTerm.toLowerCase())) ||
      passenger.beverage.some(item => item.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesVip = vipFilter === 'all' || passenger.info.vipLevel === vipFilter;
    
    const matchesAllergy = allergyFilter === 'all' || 
      (allergyFilter === 'any' && passenger.allergies.length > 0) ||
      (allergyFilter === 'none' && passenger.allergies.length === 0);

    const matchesClassification = classificationFilter === 'all' || passenger.classification.category === classificationFilter;
    
    return matchesSearch && matchesVip && matchesAllergy && matchesClassification;
  });

  // Helper functions
  const getVipColor = (level: string) => {
    switch (level) {
      case 'VVIP': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'VIP': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Standard': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getClassificationColor = (category: string) => {
    switch (category) {
      case 'BOD': return 'bg-red-100 text-red-800 border-red-200';
      case 'C-Suite': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Authorized User': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Standard': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAllergySeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-500 text-white border-red-600';
      case 'Moderate': return 'bg-orange-500 text-white border-orange-600';
      case 'Mild': return 'bg-yellow-500 text-white border-yellow-600';
      default: return 'bg-gray-500 text-white border-gray-600';
    }
  };

  const getAllergySeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical': return <ShieldAlert className="w-3 h-3" />;
      case 'Moderate': return <AlertTriangle className="w-3 h-3" />;
      case 'Mild': return <AlertCircle className="w-3 h-3" />;
      default: return <AlertCircle className="w-3 h-3" />;
    }
  };

  const hasAllergies = (passenger: Passenger) => passenger.allergies.length > 0;

  // New passenger form state
  const [newPassengerForm, setNewPassengerForm] = useState<Partial<Passenger>>({
    name: '',
    info: {
      email: '',
      phone: '',
      address: '',
      vipLevel: 'Standard'
    },
    classification: {
      category: 'Standard',
      role: '',
      notes: ''
    },
    allergies: [],
    birthday: '',
    beverage: [],
    food: [],
    passengerComfort: {
      temperature: '70°F',
      seating: '',
      tvPreference: '',
      lighting: '',
      specialRequests: ''
    },
    additionalNotes: ''
  });

  const handleAddPassenger = () => {
    if (!newPassengerForm.name?.trim()) {
      toast.error('Please enter passenger name');
      return;
    }

    const newPassenger: Passenger = {
      id: `PAX${String(passengers.length + 1).padStart(3, '0')}`,
      name: newPassengerForm.name!,
      info: newPassengerForm.info!,
      allergies: newPassengerForm.allergies || [],
      birthday: newPassengerForm.birthday || '',
      beverage: newPassengerForm.beverage || [],
      food: newPassengerForm.food || [],
      passengerComfort: newPassengerForm.passengerComfort!,
      additionalNotes: newPassengerForm.additionalNotes || ''
    };

    setPassengers([...passengers, newPassenger]);
    setNewPassengerForm({
      name: '',
      info: { email: '', phone: '', address: '', vipLevel: 'Standard' },
      classification: { category: 'Standard', role: '', notes: '' },
      allergies: [],
      birthday: '',
      beverage: [],
      food: [],
      passengerComfort: { temperature: '70°F', seating: '', tvPreference: '', lighting: '', specialRequests: '' },
      additionalNotes: ''
    });
    setIsAddingPassenger(false);
    
    toast.success('Passenger Added', {
      description: `${newPassenger.name} has been added to the database.`
    });
  };

  const PassengerForm = ({ passenger, onClose, isEditing = false }: { 
    passenger?: Passenger; 
    onClose: () => void; 
    isEditing?: boolean;
  }) => {
    const [formData, setFormData] = useState<Partial<Passenger>>(
      passenger || newPassengerForm
    );

    const handleSave = () => {
      if (isEditing && passenger) {
        // Update existing passenger
        const updatedPassengers = passengers.map(p => 
          p.id === passenger.id ? { ...formData as Passenger, id: passenger.id } : p
        );
        setPassengers(updatedPassengers);
        toast.success('Passenger Updated');
        setIsEditingPassenger(false);
      } else {
        // Add new passenger
        setNewPassengerForm(formData);
        handleAddPassenger();
      }
      onClose();
    };

    const updateArrayField = (field: 'beverage' | 'food', value: string) => {
      const items = value.split(',').map(s => s.trim()).filter(s => s);
      setFormData({
        ...formData,
        [field]: items
      });
    };

    const updateAllergyField = (value: string) => {
      const allergies = value.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [allergen, severity, reaction, medication] = line.split('|');
          return {
            allergen: allergen?.trim() || '',
            severity: (severity?.trim() as 'Critical' | 'Moderate' | 'Mild') || 'Mild',
            reaction: reaction?.trim(),
            medication: medication?.trim()
          };
        });
      setFormData({ ...formData, allergies });
    };

    return (
      <div className="space-y-6 max-h-[80vh] overflow-y-auto">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">Name & Info</TabsTrigger>
            <TabsTrigger value="allergies">Allergies</TabsTrigger>
            <TabsTrigger value="birthday">Birthday</TabsTrigger>
            <TabsTrigger value="beverage">Beverage</TabsTrigger>
            <TabsTrigger value="food">Food</TabsTrigger>
            <TabsTrigger value="comfort">Comfort</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter passenger full name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="passenger@email.com"
                    value={formData.info?.email || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      info: {...formData.info, email: e.target.value}
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 000-0000"
                    value={formData.info?.phone || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      info: {...formData.info, phone: e.target.value}
                    })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Full address"
                  value={formData.info?.address || ''}
                  onChange={(e) => setFormData({
                    ...formData, 
                    info: {...formData.info, address: e.target.value}
                  })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vipLevel">VIP Level</Label>
                  <Select 
                    value={formData.info?.vipLevel || 'Standard'} 
                    onValueChange={(value: 'Standard' | 'VIP' | 'VVIP') => setFormData({
                      ...formData, 
                      info: {...formData.info, vipLevel: value}
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="VIP">VIP</SelectItem>
                      <SelectItem value="VVIP">VVIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="classification">Passenger Classification</Label>
                  <Select 
                    value={formData.classification?.category || 'Standard'} 
                    onValueChange={(value: 'BOD' | 'C-Suite' | 'Authorized User' | 'Standard') => setFormData({
                      ...formData, 
                      classification: {...formData.classification, category: value}
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BOD">BOD</SelectItem>
                      <SelectItem value="C-Suite">C-Suite</SelectItem>
                      <SelectItem value="Authorized User">Authorized User</SelectItem>
                      <SelectItem value="Standard">Standard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.classification?.category === 'C-Suite' && (
                <div>
                  <Label htmlFor="role">Role/Title</Label>
                  <Input
                    id="role"
                    placeholder="e.g., CEO, CFO, CTO"
                    value={formData.classification?.role || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      classification: {...formData.classification, role: e.target.value}
                    })}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="classificationNotes">Classification Notes</Label>
                <Input
                  id="classificationNotes"
                  placeholder="Additional classification details or notes"
                  value={formData.classification?.notes || ''}
                  onChange={(e) => setFormData({
                    ...formData, 
                    classification: {...formData.classification, notes: e.target.value}
                  })}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="allergies" className="space-y-4">
            <div>
              <Label className="text-red-600 font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Allergies (Critical Safety Information)
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                List all known allergies with severity levels. This information is critical for flight safety.
              </p>
              <Textarea
                placeholder="Format: Allergen|Severity|Reaction|Medication (one per line)&#10;Example: Peanuts|Critical|Anaphylaxis|EpiPen required"
                rows={6}
                value={formData.allergies?.map(a => `${a.allergen}|${a.severity}|${a.reaction || ''}|${a.medication || ''}`).join('\n') || ''}
                onChange={(e) => updateAllergyField(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="birthday" className="space-y-4">
            <div>
              <Label htmlFor="birthday" className="flex items-center gap-2">
                <Cake className="w-4 h-4" />
                Birthday
              </Label>
              <Input
                id="birthday"
                type="date"
                value={formData.birthday || ''}
                onChange={(e) => setFormData({...formData, birthday: e.target.value})}
              />
              <p className="text-sm text-muted-foreground">
                Used for special celebrations and personalized service during flights.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="beverage" className="space-y-4">
            <div>
              <Label htmlFor="beverage" className="flex items-center gap-2">
                <Wine className="w-4 h-4" />
                Beverage Preferences
              </Label>
              <Textarea
                id="beverage"
                placeholder="Enter beverages separated by commas&#10;Example: Dom Pérignon, Macallan 18, Perrier, Espresso"
                rows={4}
                value={formData.beverage?.join(', ') || ''}
                onChange={(e) => updateArrayField('beverage', e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="food" className="space-y-4">
            <div>
              <Label htmlFor="food" className="flex items-center gap-2">
                <Utensils className="w-4 h-4" />
                Food Preferences
              </Label>
              <Textarea
                id="food"
                placeholder="Enter food preferences separated by commas&#10;Example: Wagyu Beef, Lobster Thermidor, French cuisine, Italian cuisine"
                rows={4}
                value={formData.food?.join(', ') || ''}
                onChange={(e) => updateArrayField('food', e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="comfort" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="notes" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Additional Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Personal preferences, behavioral notes, special instructions..."
                  rows={4}
                  value={formData.additionalNotes || ''}
                  onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Temperature Preference</Label>
                  <Input
                    placeholder="e.g., 72°F"
                    value={formData.passengerComfort?.temperature || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      passengerComfort: {...formData.passengerComfort, temperature: e.target.value}
                    })}
                  />
                </div>
                <div>
                  <Label>Seating Preference</Label>
                  <Input
                    placeholder="e.g., Window seat, aisle seat"
                    value={formData.passengerComfort?.seating || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      passengerComfort: {...formData.passengerComfort, seating: e.target.value}
                    })}
                  />
                </div>
                <div>
                  <Label>TV Preference</Label>
                  <Input
                    placeholder="e.g., Action movies, Comedy shows, Drama series"
                    value={formData.passengerComfort?.tvPreference || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      passengerComfort: {...formData.passengerComfort, tvPreference: e.target.value}
                    })}
                  />
                </div>
                <div>
                  <Label>Lighting Preference</Label>
                  <Input
                    placeholder="e.g., Dimmed, Bright, Natural"
                    value={formData.passengerComfort?.lighting || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      passengerComfort: {...formData.passengerComfort, lighting: e.target.value}
                    })}
                  />
                </div>
              </div>

              <div>
                <Label>Special Requests</Label>
                <Textarea
                  placeholder="Any special requests or accommodations..."
                  rows={3}
                  value={formData.passengerComfort?.specialRequests || ''}
                  onChange={(e) => setFormData({
                    ...formData, 
                    passengerComfort: {...formData.passengerComfort, specialRequests: e.target.value}
                  })}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={handleSave} className="flex-1 flex items-center gap-2">
            <Save className="w-4 h-4" />
            {isEditing ? 'Update Passenger' : 'Add Passenger'}
          </Button>
          <Button variant="outline" onClick={onClose} className="flex items-center gap-2">
            <X className="w-4 h-4" />
            Cancel
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" />
            Passenger Database
          </h1>
          <p className="text-muted-foreground">
            Search and manage passenger information and preferences
          </p>
        </div>
        <Dialog open={isAddingPassenger} onOpenChange={setIsAddingPassenger}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Passenger
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Passenger</DialogTitle>
              <DialogDescription>
                Enter passenger details and preferences for personalized service
              </DialogDescription>
            </DialogHeader>
            <PassengerForm onClose={() => setIsAddingPassenger(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Passengers</p>
                <p className="text-2xl font-bold">{passengers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-sm text-red-700 font-medium">BOD</p>
                <p className="text-2xl font-bold text-red-700">
                  {passengers.filter(p => p.classification.category === 'BOD').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-sm text-purple-700 font-medium">C-Suite</p>
                <p className="text-2xl font-bold text-purple-700">
                  {passengers.filter(p => p.classification.category === 'C-Suite').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-sm text-orange-700 font-medium">Has Allergies</p>
                <p className="text-2xl font-bold text-orange-700">
                  {passengers.filter(p => hasAllergies(p)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Cake className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-sm text-purple-700 font-medium">This Month Birthdays</p>
                <p className="text-2xl font-bold text-purple-700">
                  {passengers.filter(p => {
                    if (!p.birthday) return false;
                    const birthMonth = new Date(p.birthday).getMonth();
                    const currentMonth = new Date().getMonth();
                    return birthMonth === currentMonth;
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search passengers by name, email, food, or beverage preferences..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={vipFilter} onValueChange={setVipFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="VIP Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="VVIP">VVIP</SelectItem>
              <SelectItem value="VIP">VIP</SelectItem>
              <SelectItem value="Standard">Standard</SelectItem>
            </SelectContent>
          </Select>
          <Select value={classificationFilter} onValueChange={setClassificationFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Classification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classifications</SelectItem>
              <SelectItem value="BOD">BOD</SelectItem>
              <SelectItem value="C-Suite">C-Suite</SelectItem>
              <SelectItem value="Authorized User">Authorized User</SelectItem>
              <SelectItem value="Standard">Standard</SelectItem>
            </SelectContent>
          </Select>
          <Select value={allergyFilter} onValueChange={setAllergyFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Allergies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="any">Has Allergies</SelectItem>
              <SelectItem value="none">No Allergies</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Passengers List */}
      <div className="space-y-4">
        {filteredPassengers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">No passengers found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search criteria.' : 'Start by adding your first passenger.'}
              </p>
              <Button onClick={() => setIsAddingPassenger(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Passenger
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredPassengers.map((passenger) => (
            <Card 
              key={passenger.id}
              className={`${
                hasAllergies(passenger) 
                  ? 'border-orange-300 border-2 bg-orange-50' 
                  : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-lg">{passenger.name}</h3>
                      <Badge className={getVipColor(passenger.info.vipLevel)}>
                        {passenger.info.vipLevel}
                      </Badge>
                      <Badge className={getClassificationColor(passenger.classification.category)}>
                        {passenger.classification.category}
                        {passenger.classification.category === 'C-Suite' && passenger.classification.role && 
                          `: ${passenger.classification.role}`
                        }
                      </Badge>
                      {hasAllergies(passenger) && (
                        <Badge className="bg-orange-100 text-orange-800 border-orange-200 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          ALLERGY
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      {/* Contact Info */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          <span>{passenger.info.email || 'No email'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          <span>{passenger.info.phone || 'No phone'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="font-medium">Classification:</span>
                          <span>{passenger.classification.category}</span>
                        </div>
                      </div>

                      {/* Birthday */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Cake className="w-3 h-3 text-purple-600" />
                          <span className="font-medium text-purple-700">Birthday</span>
                        </div>
                        {passenger.birthday ? (
                          <div className="text-xs text-purple-600">
                            {new Date(passenger.birthday).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not provided</span>
                        )}
                      </div>

                      {/* Allergies */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="w-3 h-3 text-orange-600" />
                          <span className="font-medium text-orange-700">Allergies</span>
                        </div>
                        {passenger.allergies.length > 0 ? (
                          <div className="space-y-1">
                            {passenger.allergies.slice(0, 2).map((allergy, index) => (
                              <div key={index} className="flex items-center gap-1">
                                {getAllergySeverityIcon(allergy.severity)}
                                <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                                  {allergy.allergen} - {allergy.severity}
                                </Badge>
                              </div>
                            ))}
                            {passenger.allergies.length > 2 && (
                              <span className="text-xs text-muted-foreground">
                                +{passenger.allergies.length - 2} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-green-600">No known allergies</span>
                        )}
                      </div>

                      {/* Beverages */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Wine className="w-3 h-3 text-blue-600" />
                          <span className="font-medium">Beverages</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {passenger.beverage.slice(0, 3).join(', ')}
                          {passenger.beverage.length > 3 && `... +${passenger.beverage.length - 3} more`}
                        </div>
                      </div>

                      {/* Food */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Utensils className="w-3 h-3 text-green-600" />
                          <span className="font-medium">Food</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {passenger.food.slice(0, 3).join(', ')}
                          {passenger.food.length > 3 && `... +${passenger.food.length - 3} more`}
                        </div>
                      </div>

                      {/* Comfort */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Heart className="w-3 h-3 text-purple-600" />
                          <span className="font-medium">Comfort</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {passenger.passengerComfort.temperature}, {passenger.passengerComfort.seating}
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-3 h-3 text-gray-600" />
                          <span className="font-medium">Notes</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {passenger.additionalNotes ? 
                            (passenger.additionalNotes.length > 50 ? 
                              passenger.additionalNotes.substring(0, 50) + '...' : 
                              passenger.additionalNotes
                            ) : 
                            'No additional notes'
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedPassenger(passenger);
                        setIsPassengerDetailOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedPassenger(passenger);
                        setIsEditingPassenger(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* View Details Dialog */}
      <Dialog open={isPassengerDetailOpen} onOpenChange={setIsPassengerDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Passenger Details - {selectedPassenger?.name}</DialogTitle>
          </DialogHeader>
          {selectedPassenger && (
            <div className="space-y-4">
              {/* Full passenger details display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>Email: {selectedPassenger.info.email || 'Not provided'}</div>
                    <div>Phone: {selectedPassenger.info.phone || 'Not provided'}</div>
                    <div>Address: {selectedPassenger.info.address || 'Not provided'}</div>
                    <div>VIP Level: {selectedPassenger.info.vipLevel}</div>
                    <div>Classification: {selectedPassenger.classification.category}
                      {selectedPassenger.classification.category === 'C-Suite' && selectedPassenger.classification.role && 
                        ` - ${selectedPassenger.classification.role}`
                      }
                    </div>
                    {selectedPassenger.classification.notes && (
                      <div>Classification Notes: {selectedPassenger.classification.notes}</div>
                    )}
                    <div>Birthday: {selectedPassenger.birthday ? new Date(selectedPassenger.birthday).toLocaleDateString() : 'Not provided'}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Allergies</h4>
                  {selectedPassenger.allergies.length > 0 ? (
                    <div className="space-y-2">
                      {selectedPassenger.allergies.map((allergy, index) => (
                        <Card key={index} className="p-3 border-orange-200 bg-orange-50">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="w-3 h-3 text-orange-600" />
                            <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                              {allergy.severity}
                            </Badge>
                            <span className="font-medium">{allergy.allergen}</span>
                          </div>
                          {allergy.reaction && <div className="text-sm">Reaction: {allergy.reaction}</div>}
                          {allergy.medication && <div className="text-sm">Medication: {allergy.medication}</div>}
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-green-600">No known allergies</p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Beverage Preferences</h4>
                  <div className="text-sm">
                    {selectedPassenger.beverage.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                        {selectedPassenger.beverage.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No preferences specified</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Food Preferences</h4>
                  <div className="text-sm">
                    {selectedPassenger.food.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                        {selectedPassenger.food.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No preferences specified</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Passenger Comfort</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Temperature: {selectedPassenger.passengerComfort.temperature || 'Not specified'}</div>
                  <div>Seating: {selectedPassenger.passengerComfort.seating || 'Not specified'}</div>
                  <div>TV Preference: {selectedPassenger.passengerComfort.tvPreference || 'Not specified'}</div>
                  <div>Lighting: {selectedPassenger.passengerComfort.lighting || 'Not specified'}</div>
                </div>
                {selectedPassenger.passengerComfort.specialRequests && (
                  <div className="mt-2">
                    <div className="font-medium text-sm">Special Requests:</div>
                    <div className="text-sm">{selectedPassenger.passengerComfort.specialRequests}</div>
                  </div>
                )}
              </div>

              {selectedPassenger.additionalNotes && (
                <div>
                  <h4 className="font-medium mb-2">Additional Notes</h4>
                  <p className="text-sm">{selectedPassenger.additionalNotes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Passenger Dialog */}
      <Dialog open={isEditingPassenger} onOpenChange={setIsEditingPassenger}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Passenger - {selectedPassenger?.name}</DialogTitle>
            <DialogDescription>
              Update passenger details and preferences
            </DialogDescription>
          </DialogHeader>
          {selectedPassenger && (
            <PassengerForm 
              passenger={selectedPassenger} 
              onClose={() => setIsEditingPassenger(false)} 
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}