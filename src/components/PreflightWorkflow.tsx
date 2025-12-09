import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
  Plane,
  Calendar,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
  Download,
  ChevronRight,
  ChevronDown,
  Save,
  Edit,
  Eye,
  Send,
  Users,
  ArrowRight,
  Circle,
  CheckCircle2
} from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import EnhancedFRATForm from './EnhancedFRATForm';

interface Leg {
  id: string;
  legNumber: number;
  departure: string;
  departureICAO: string;
  arrival: string;
  arrivalICAO: string;
  departureTime: string;
  arrivalTime: string;
  distance: number;
  duration: number;
  fratStatus: 'not-started' | 'in-progress' | 'completed';
  fratScore?: number;
  airportEvalsViewed: boolean;
  fratData?: any;
}

interface Trip {
  id: string;
  tripNumber: string;
  tailNumber: string;
  passengers: string[];
  crewMembers: string[];
  legs: Leg[];
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'in-progress' | 'completed';
  preflightStatus: 'not-started' | 'in-progress' | 'completed';
}

export default function PreflightWorkflow() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [expandedTrips, setExpandedTrips] = useState<Set<string>>(new Set());
  const [selectedLeg, setSelectedLeg] = useState<{ tripId: string; legId: string } | null>(null);
  const [currentView, setCurrentView] = useState<'trips' | 'frat' | 'airport-evals'>('trips');

  // Load trips from MyAirOps (mock data for now)
  useEffect(() => {
    const mockTrips: Trip[] = [
      {
        id: 'trip-001',
        tripNumber: 'T-2024-156',
        tailNumber: 'N650GS',
        passengers: ['John Smith (BOD)', 'Sarah Johnson (C-Suite, CFO)'],
        crewMembers: ['Capt. Mike Wilson', 'FO Sarah Davis', 'FA Jessica Martinez'],
        startDate: '2025-12-10T08:00:00Z',
        endDate: '2025-12-12T18:00:00Z',
        status: 'upcoming',
        preflightStatus: 'in-progress',
        legs: [
          {
            id: 'leg-001',
            legNumber: 1,
            departure: 'Teterboro',
            departureICAO: 'KTEB',
            arrival: 'Miami Executive',
            arrivalICAO: 'KTMB',
            departureTime: '2025-12-10T08:00:00Z',
            arrivalTime: '2025-12-10T11:30:00Z',
            distance: 1090,
            duration: 210,
            fratStatus: 'completed',
            fratScore: 12,
            airportEvalsViewed: true
          },
          {
            id: 'leg-002',
            legNumber: 2,
            departure: 'Miami Executive',
            departureICAO: 'KTMB',
            arrival: 'San Jose Intl',
            arrivalICAO: 'KSJC',
            departureTime: '2025-12-11T14:00:00Z',
            arrivalTime: '2025-12-11T19:45:00Z',
            distance: 2580,
            duration: 345,
            fratStatus: 'in-progress',
            airportEvalsViewed: false
          },
          {
            id: 'leg-003',
            legNumber: 3,
            departure: 'San Jose Intl',
            departureICAO: 'KSJC',
            arrival: 'Teterboro',
            arrivalICAO: 'KTEB',
            departureTime: '2025-12-12T10:00:00Z',
            arrivalTime: '2025-12-12T18:15:00Z',
            distance: 2565,
            duration: 315,
            fratStatus: 'not-started',
            airportEvalsViewed: false
          }
        ]
      },
      {
        id: 'trip-002',
        tripNumber: 'T-2024-157',
        tailNumber: 'N651GS',
        passengers: ['David Chen (Authorized User)', 'Emily Roberts (Standard)'],
        crewMembers: ['Capt. Tom Anderson', 'FO Lisa Brown'],
        startDate: '2025-12-08T06:00:00Z',
        endDate: '2025-12-08T16:00:00Z',
        status: 'upcoming',
        preflightStatus: 'not-started',
        legs: [
          {
            id: 'leg-004',
            legNumber: 1,
            departure: 'Westchester County',
            departureICAO: 'KHPN',
            arrival: 'Aspen-Pitkin County',
            arrivalICAO: 'KASE',
            departureTime: '2025-12-08T06:00:00Z',
            arrivalTime: '2025-12-08T10:30:00Z',
            distance: 1750,
            duration: 270,
            fratStatus: 'not-started',
            airportEvalsViewed: false
          },
          {
            id: 'leg-005',
            legNumber: 2,
            departure: 'Aspen-Pitkin County',
            departureICAO: 'KASE',
            arrival: 'Westchester County',
            arrivalICAO: 'KHPN',
            departureTime: '2025-12-08T12:00:00Z',
            arrivalTime: '2025-12-08T16:30:00Z',
            distance: 1750,
            duration: 270,
            fratStatus: 'not-started',
            airportEvalsViewed: false
          }
        ]
      },
      {
        id: 'trip-003',
        tripNumber: 'T-2024-158',
        tailNumber: 'N650GS',
        passengers: ['Robert Williams (C-Suite, CEO)'],
        crewMembers: ['Capt. James Taylor', 'FO Maria Garcia', 'FA Robert Lee'],
        startDate: '2025-12-12T09:00:00Z',
        endDate: '2025-12-14T20:00:00Z',
        status: 'upcoming',
        preflightStatus: 'not-started',
        legs: [
          {
            id: 'leg-006',
            legNumber: 1,
            departure: 'Teterboro',
            departureICAO: 'KTEB',
            arrival: 'London Luton',
            arrivalICAO: 'EGGW',
            departureTime: '2025-12-12T21:00:00Z',
            arrivalTime: '2025-12-13T09:30:00Z',
            distance: 3465,
            duration: 450,
            fratStatus: 'not-started',
            airportEvalsViewed: false
          },
          {
            id: 'leg-007',
            legNumber: 2,
            departure: 'London Luton',
            departureICAO: 'EGGW',
            arrival: 'Teterboro',
            arrivalICAO: 'KTEB',
            departureTime: '2025-12-14T11:00:00Z',
            arrivalTime: '2025-12-14T14:15:00Z',
            distance: 3465,
            duration: 435,
            fratStatus: 'not-started',
            airportEvalsViewed: false
          }
        ]
      },
      {
        id: 'trip-004',
        tripNumber: 'T-2024-159',
        tailNumber: 'N652GS',
        passengers: ['Michael Brown (BOD)', 'Jennifer Davis (C-Suite, COO)', 'Amanda White (Authorized User)'],
        crewMembers: ['Capt. Robert Chen', 'FO Kevin Martinez', 'FA Laura Thompson'],
        startDate: '2025-12-07T10:00:00Z',
        endDate: '2025-12-07T22:00:00Z',
        status: 'upcoming',
        preflightStatus: 'completed',
        legs: [
          {
            id: 'leg-008',
            legNumber: 1,
            departure: 'Van Nuys',
            departureICAO: 'KVNY',
            arrival: 'Scottsdale',
            arrivalICAO: 'KSDL',
            departureTime: '2025-12-07T10:00:00Z',
            arrivalTime: '2025-12-07T11:45:00Z',
            distance: 335,
            duration: 105,
            fratStatus: 'completed',
            fratScore: 8,
            airportEvalsViewed: true
          },
          {
            id: 'leg-009',
            legNumber: 2,
            departure: 'Scottsdale',
            departureICAO: 'KSDL',
            arrival: 'Van Nuys',
            arrivalICAO: 'KVNY',
            departureTime: '2025-12-07T20:00:00Z',
            arrivalTime: '2025-12-07T21:50:00Z',
            distance: 335,
            duration: 110,
            fratStatus: 'completed',
            fratScore: 9,
            airportEvalsViewed: true
          }
        ]
      },
      {
        id: 'trip-005',
        tripNumber: 'T-2024-160',
        tailNumber: 'N650GS',
        passengers: ['Patricia Moore (Standard, Notes: VIP Guest)', 'Thomas Anderson (Authorized User)'],
        crewMembers: ['Capt. Daniel Park', 'FO Michelle Lee'],
        startDate: '2025-12-09T14:00:00Z',
        endDate: '2025-12-10T18:00:00Z',
        status: 'upcoming',
        preflightStatus: 'in-progress',
        legs: [
          {
            id: 'leg-010',
            legNumber: 1,
            departure: 'Dallas Love Field',
            departureICAO: 'KDAL',
            arrival: 'Chicago Executive',
            arrivalICAO: 'KPWK',
            departureTime: '2025-12-09T14:00:00Z',
            arrivalTime: '2025-12-09T16:30:00Z',
            distance: 800,
            duration: 150,
            fratStatus: 'completed',
            fratScore: 11,
            airportEvalsViewed: true
          },
          {
            id: 'leg-011',
            legNumber: 2,
            departure: 'Chicago Executive',
            departureICAO: 'KPWK',
            arrival: 'Boston Logan',
            arrivalICAO: 'KBOS',
            departureTime: '2025-12-10T08:00:00Z',
            arrivalTime: '2025-12-10T10:45:00Z',
            distance: 850,
            duration: 165,
            fratStatus: 'in-progress',
            airportEvalsViewed: false
          },
          {
            id: 'leg-012',
            legNumber: 3,
            departure: 'Boston Logan',
            departureICAO: 'KBOS',
            arrival: 'Dallas Love Field',
            arrivalICAO: 'KDAL',
            departureTime: '2025-12-10T15:00:00Z',
            arrivalTime: '2025-12-10T18:15:00Z',
            distance: 1550,
            duration: 195,
            fratStatus: 'not-started',
            airportEvalsViewed: false
          }
        ]
      },
      {
        id: 'trip-006',
        tripNumber: 'T-2024-161',
        tailNumber: 'N651GS',
        passengers: ['Christopher Taylor (BOD)', 'Lisa Martinez (C-Suite, CTO)'],
        crewMembers: ['Capt. Andrew Wilson', 'FO Rebecca Johnson', 'FA Michael Davis'],
        startDate: '2025-12-11T06:00:00Z',
        endDate: '2025-12-13T20:00:00Z',
        status: 'upcoming',
        preflightStatus: 'not-started',
        legs: [
          {
            id: 'leg-013',
            legNumber: 1,
            departure: 'Seattle Boeing Field',
            departureICAO: 'KBFI',
            arrival: 'Jackson Hole',
            arrivalICAO: 'KJAC',
            departureTime: '2025-12-11T06:00:00Z',
            arrivalTime: '2025-12-11T08:15:00Z',
            distance: 625,
            duration: 135,
            fratStatus: 'not-started',
            airportEvalsViewed: false
          },
          {
            id: 'leg-014',
            legNumber: 2,
            departure: 'Jackson Hole',
            departureICAO: 'KJAC',
            arrival: 'Denver Centennial',
            arrivalICAO: 'KAPA',
            departureTime: '2025-12-12T10:00:00Z',
            arrivalTime: '2025-12-12T11:30:00Z',
            distance: 415,
            duration: 90,
            fratStatus: 'not-started',
            airportEvalsViewed: false
          },
          {
            id: 'leg-015',
            legNumber: 3,
            departure: 'Denver Centennial',
            departureICAO: 'KAPA',
            arrival: 'Seattle Boeing Field',
            arrivalICAO: 'KBFI',
            departureTime: '2025-12-13T17:00:00Z',
            arrivalTime: '2025-12-13T19:45:00Z',
            distance: 1025,
            duration: 165,
            fratStatus: 'not-started',
            airportEvalsViewed: false
          }
        ]
      },
      {
        id: 'trip-007',
        tripNumber: 'T-2024-162',
        tailNumber: 'N652GS',
        passengers: ['Elizabeth Clark (Authorized User)', 'James Rodriguez (Standard)'],
        crewMembers: ['Capt. Steven Harris', 'FO Nicole Brown'],
        startDate: '2025-12-06T09:00:00Z',
        endDate: '2025-12-06T17:00:00Z',
        status: 'upcoming',
        preflightStatus: 'not-started',
        legs: [
          {
            id: 'leg-016',
            legNumber: 1,
            departure: 'Atlanta Dekalb-Peachtree',
            departureICAO: 'KPDK',
            arrival: 'Orlando Executive',
            arrivalICAO: 'KORL',
            departureTime: '2025-12-06T09:00:00Z',
            arrivalTime: '2025-12-06T10:45:00Z',
            distance: 410,
            duration: 105,
            fratStatus: 'not-started',
            airportEvalsViewed: false
          },
          {
            id: 'leg-017',
            legNumber: 2,
            departure: 'Orlando Executive',
            departureICAO: 'KORL',
            arrival: 'Atlanta Dekalb-Peachtree',
            arrivalICAO: 'KPDK',
            departureTime: '2025-12-06T15:00:00Z',
            arrivalTime: '2025-12-06T16:50:00Z',
            distance: 410,
            duration: 110,
            fratStatus: 'not-started',
            airportEvalsViewed: false
          }
        ]
      },
      {
        id: 'trip-008',
        tripNumber: 'T-2024-163',
        tailNumber: 'N650GS',
        passengers: ['William Turner (C-Suite, CEO)', 'Mary Wilson (BOD)', 'Jessica Lewis (C-Suite, CFO)'],
        crewMembers: ['Capt. Christopher Moore', 'FO Amanda Taylor', 'FA David Anderson'],
        startDate: '2025-12-11T18:00:00Z',
        endDate: '2025-12-16T14:00:00Z',
        status: 'upcoming',
        preflightStatus: 'not-started',
        legs: [
          {
            id: 'leg-018',
            legNumber: 1,
            departure: 'New York JFK',
            departureICAO: 'KJFK',
            arrival: 'Paris Le Bourget',
            arrivalICAO: 'LFPB',
            departureTime: '2025-12-11T18:00:00Z',
            arrivalTime: '2025-12-12T06:45:00Z',
            distance: 3625,
            duration: 465,
            fratStatus: 'not-started',
            airportEvalsViewed: false
          },
          {
            id: 'leg-019',
            legNumber: 2,
            departure: 'Paris Le Bourget',
            departureICAO: 'LFPB',
            arrival: 'Geneva',
            arrivalICAO: 'LSGG',
            departureTime: '2025-12-14T10:00:00Z',
            arrivalTime: '2025-12-14T11:30:00Z',
            distance: 255,
            duration: 90,
            fratStatus: 'not-started',
            airportEvalsViewed: false
          },
          {
            id: 'leg-020',
            legNumber: 3,
            departure: 'Geneva',
            departureICAO: 'LSGG',
            arrival: 'New York JFK',
            arrivalICAO: 'KJFK',
            departureTime: '2025-12-16T04:00:00Z',
            arrivalTime: '2025-12-16T06:30:00Z',
            distance: 3800,
            duration: 510,
            fratStatus: 'not-started',
            airportEvalsViewed: false
          }
        ]
      },
      {
        id: 'trip-009',
        tripNumber: 'T-2024-164',
        tailNumber: 'N651GS',
        passengers: ['Richard Walker (Authorized User)'],
        crewMembers: ['Capt. Patricia Garcia', 'FO Brian Martinez'],
        startDate: '2025-12-05T12:00:00Z',
        endDate: '2025-12-05T20:00:00Z',
        status: 'upcoming',
        preflightStatus: 'completed',
        legs: [
          {
            id: 'leg-021',
            legNumber: 1,
            departure: 'Las Vegas Henderson',
            departureICAO: 'KHND',
            arrival: 'Santa Monica',
            arrivalICAO: 'KSMO',
            departureTime: '2025-12-05T12:00:00Z',
            arrivalTime: '2025-12-05T13:15:00Z',
            distance: 210,
            duration: 75,
            fratStatus: 'completed',
            fratScore: 7,
            airportEvalsViewed: true
          },
          {
            id: 'leg-022',
            legNumber: 2,
            departure: 'Santa Monica',
            departureICAO: 'KSMO',
            arrival: 'Las Vegas Henderson',
            arrivalICAO: 'KHND',
            departureTime: '2025-12-05T18:00:00Z',
            arrivalTime: '2025-12-05T19:20:00Z',
            distance: 210,
            duration: 80,
            fratStatus: 'completed',
            fratScore: 8,
            airportEvalsViewed: true
          }
        ]
      },
      {
        id: 'trip-010',
        tripNumber: 'T-2024-165',
        tailNumber: 'N652GS',
        passengers: ['Nancy King (Standard, Notes: First time flyer)', 'Kevin Wright (Authorized User)', 'Sandra Lopez (Standard)'],
        crewMembers: ['Capt. Matthew Scott', 'FO Jennifer Young', 'FA Christopher Allen'],
        startDate: '2025-12-09T15:00:00Z',
        endDate: '2025-12-10T22:00:00Z',
        status: 'upcoming',
        preflightStatus: 'in-progress',
        legs: [
          {
            id: 'leg-023',
            legNumber: 1,
            departure: 'Houston Hobby',
            departureICAO: 'KHOU',
            arrival: 'Phoenix Deer Valley',
            arrivalICAO: 'KDVT',
            departureTime: '2025-12-09T15:00:00Z',
            arrivalTime: '2025-12-09T17:45:00Z',
            distance: 970,
            duration: 165,
            fratStatus: 'completed',
            fratScore: 13,
            airportEvalsViewed: true
          },
          {
            id: 'leg-024',
            legNumber: 2,
            departure: 'Phoenix Deer Valley',
            departureICAO: 'KDVT',
            arrival: 'San Diego Montgomery',
            arrivalICAO: 'KMYF',
            departureTime: '2025-12-10T09:00:00Z',
            arrivalTime: '2025-12-10T10:30:00Z',
            distance: 300,
            duration: 90,
            fratStatus: 'in-progress',
            airportEvalsViewed: false
          },
          {
            id: 'leg-025',
            legNumber: 3,
            departure: 'San Diego Montgomery',
            departureICAO: 'KMYF',
            arrival: 'Houston Hobby',
            arrivalICAO: 'KHOU',
            departureTime: '2025-12-10T18:00:00Z',
            arrivalTime: '2025-12-10T22:15:00Z',
            distance: 1230,
            duration: 195,
            fratStatus: 'not-started',
            airportEvalsViewed: false
          }
        ]
      }
    ];

    // Filter trips that are within 7 days of first leg
    const today = new Date();
    const filteredTrips = mockTrips.filter(trip => {
      const firstLegDate = parseISO(trip.startDate);
      const daysUntil = differenceInDays(firstLegDate, today);
      return daysUntil <= 7 && daysUntil >= -1; // Show if within 7 days or started yesterday
    });

    setTrips(filteredTrips);
  }, []);

  const toggleTripExpanded = (tripId: string) => {
    const newExpanded = new Set(expandedTrips);
    if (newExpanded.has(tripId)) {
      newExpanded.delete(tripId);
    } else {
      newExpanded.add(tripId);
    }
    setExpandedTrips(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'not-started': { color: 'bg-gray-100 text-gray-700', icon: Circle },
      'in-progress': { color: 'bg-blue-100 text-blue-700', icon: Clock },
      'completed': { color: 'bg-green-100 text-green-700', icon: CheckCircle2 }
    };
    const config = statusConfig[status] || statusConfig['not-started'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${config.color}`}>
        <Icon className="w-3 h-3" />
        {status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
      </span>
    );
  };

  const getFratScoreColor = (score: number) => {
    if (score <= 10) return 'text-green-600';
    if (score <= 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  const startFratForLeg = (tripId: string, legId: string) => {
    setSelectedLeg({ tripId, legId });
    setCurrentView('frat');
  };

  const viewAirportEvals = (tripId: string, legId: string) => {
    setSelectedLeg({ tripId, legId });
    setCurrentView('airport-evals');
  };

  const exportToPDF = (trip: Trip) => {
    // This would generate a PDF with FRAT data and airport evaluations
    console.log('Exporting trip to PDF:', trip.tripNumber);
    alert(`PDF export for ${trip.tripNumber} would be generated here. This will include:\n• Trip summary\n• All FRAT forms\n• Airport evaluations\n• Crew and passenger information`);
  };

  const pushToForeFlight = (trip: Trip) => {
    // This would use ForeFlight API to push the PDF
    console.log('Pushing to ForeFlight:', trip.tripNumber);
    alert(`Integration with ForeFlight API will push the preflight package for ${trip.tripNumber}. Feature coming soon!`);
  };

  const getDaysUntilTrip = (startDate: string) => {
    const today = new Date();
    const tripDate = parseISO(startDate);
    const days = differenceInDays(tripDate, today);

    if (days < 0) return 'In Progress';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `${days} days`;
  };

  if (currentView === 'frat' && selectedLeg) {
    const trip = trips.find(t => t.id === selectedLeg.tripId);
    const leg = trip?.legs.find(l => l.id === selectedLeg.legId);

    return (
      <div className="space-y-6">
        <EnhancedFRATForm
          initialData={{
            flightNumber: trip?.tripNumber,
            aircraft: trip?.tailNumber,
            departure: leg?.departureICAO,
            destination: leg?.arrivalICAO,
            date: leg?.departureTime.split('T')[0],
            time: leg?.departureTime.split('T')[1].substring(0, 5),
            pic: trip?.crewMembers.find(c => c.includes('Capt'))
          }}
          onClose={() => setCurrentView('trips')}
          onSave={(data) => {
            console.log('FRAT Saved', data);
            // Here we would actually update the trip/leg state
            if (data.status === 'submitted') {
              // Update local state to show completed
              const updatedTrips = trips.map(t => {
                if (t.id === selectedLeg.tripId) {
                  return {
                    ...t,
                    legs: t.legs.map(l => {
                      if (l.id === selectedLeg.legId) {
                        return { ...l, fratStatus: 'completed' as const, fratScore: data.totalScore };
                      }
                      return l;
                    })
                  };
                }
                return t;
              });
              setTrips(updatedTrips);
              setCurrentView('trips');
            }
          }}
        />
      </div>
    );
  }

  if (currentView === 'airport-evals' && selectedLeg) {
    const trip = trips.find(t => t.id === selectedLeg.tripId);
    const leg = trip?.legs.find(l => l.id === selectedLeg.legId);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => setCurrentView('frat')}
              className="mb-2"
            >
              <ChevronRight className="w-4 h-4 rotate-180 mr-2" />
              Back to FRAT
            </Button>
            <h1 className="text-2xl">Airport Evaluations - Leg {leg?.legNumber}</h1>
            <p className="text-muted-foreground">
              {leg?.departure} ({leg?.departureICAO}) & {leg?.arrival} ({leg?.arrivalICAO})
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-semibold">{leg?.departure}</h3>
                <p className="text-sm text-muted-foreground">{leg?.departureICAO}</p>
              </div>
            </div>
            <div className="text-center py-8 text-muted-foreground">
              Airport evaluation data would be displayed here
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-semibold">{leg?.arrival}</h3>
                <p className="text-sm text-muted-foreground">{leg?.arrivalICAO}</p>
              </div>
            </div>
            <div className="text-center py-8 text-muted-foreground">
              Airport evaluation data would be displayed here
            </div>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => setCurrentView('trips')}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Complete & Return to Trips
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl">Preflight Workflow</h1>
          <p className="text-muted-foreground">
            Complete FRAT forms and review airport evaluations for upcoming trips
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Sync MyAirOps
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plane className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Trips</p>
              <p className="text-2xl">{trips.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending FRATs</p>
              <p className="text-2xl">
                {trips.reduce((sum, trip) =>
                  sum + trip.legs.filter(leg => leg.fratStatus !== 'completed').length, 0
                )}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl">
                {trips.reduce((sum, trip) =>
                  sum + trip.legs.filter(leg => leg.fratStatus === 'completed').length, 0
                )}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Legs</p>
              <p className="text-2xl">
                {trips.reduce((sum, trip) => sum + trip.legs.length, 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Trips List */}
      <div className="space-y-4">
        {trips.length === 0 ? (
          <Card className="p-12 text-center">
            <Plane className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg mb-2">No Upcoming Trips</h3>
            <p className="text-muted-foreground">
              Trips will appear here 7 days before departure
            </p>
          </Card>
        ) : (
          trips.map(trip => {
            const isExpanded = expandedTrips.has(trip.id);
            const completedLegs = trip.legs.filter(leg => leg.fratStatus === 'completed').length;
            const totalLegs = trip.legs.length;

            return (
              <Card key={trip.id} className="overflow-hidden">
                {/* Trip Header */}
                <div
                  className="p-6 cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => toggleTripExpanded(trip.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        )}
                        <h3 className="text-lg font-semibold">{trip.tripNumber}</h3>
                        {getStatusBadge(trip.preflightStatus)}
                        <span className="text-sm text-muted-foreground">
                          {getDaysUntilTrip(trip.startDate)}
                        </span>
                      </div>

                      <div className="ml-8 grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Plane className="w-4 h-4 text-muted-foreground" />
                          <span>{trip.tailNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{format(parseISO(trip.startDate), 'MMM d')} - {format(parseISO(trip.endDate), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{trip.legs.length} {trip.legs.length === 1 ? 'leg' : 'legs'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{trip.passengers.length} {trip.passengers.length === 1 ? 'passenger' : 'passengers'}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="ml-8 mt-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">
                            Preflight Progress: {completedLegs}/{totalLegs} legs completed
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 transition-all"
                            style={{ width: `${(completedLegs / totalLegs) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportToPDF(trip)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => pushToForeFlight(trip)}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        ForeFlight
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expanded Legs */}
                {isExpanded && (
                  <div className="border-t bg-accent/20">
                    <div className="p-6 space-y-3">
                      {/* Crew & Passengers */}
                      <div className="grid md:grid-cols-2 gap-4 mb-4 pb-4 border-b">
                        <div>
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Crew Members
                          </h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {trip.crewMembers.map((crew, idx) => (
                              <li key={idx}>• {crew}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Passengers
                          </h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {trip.passengers.map((pax, idx) => (
                              <li key={idx}>• {pax}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Legs */}
                      {trip.legs.map((leg, idx) => (
                        <Card key={leg.id} className="p-4 bg-background">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-sm font-semibold text-muted-foreground">
                                  Leg {leg.legNumber}
                                </span>
                                {getStatusBadge(leg.fratStatus)}
                                {leg.fratScore && (
                                  <span className={`text-sm font-semibold ${getFratScoreColor(leg.fratScore)}`}>
                                    FRAT Score: {leg.fratScore}
                                  </span>
                                )}
                              </div>

                              <div className="grid md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground mb-1">Route</p>
                                  <p className="font-medium">
                                    {leg.departure} ({leg.departureICAO}) → {leg.arrival} ({leg.arrivalICAO})
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground mb-1">Departure</p>
                                  <p className="font-medium">
                                    {format(parseISO(leg.departureTime), 'MMM d, HH:mm')}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground mb-1">Duration</p>
                                  <p className="font-medium">
                                    {Math.floor(leg.duration / 60)}h {leg.duration % 60}m • {leg.distance} nm
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 ml-4">
                              {leg.fratStatus === 'not-started' && (
                                <Button
                                  onClick={() => startFratForLeg(trip.id, leg.id)}
                                >
                                  <FileText className="w-4 h-4 mr-2" />
                                  Start FRAT
                                </Button>
                              )}
                              {leg.fratStatus === 'in-progress' && (
                                <Button
                                  onClick={() => startFratForLeg(trip.id, leg.id)}
                                  variant="outline"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Continue FRAT
                                </Button>
                              )}
                              {leg.fratStatus === 'completed' && (
                                <>
                                  <Button
                                    onClick={() => startFratForLeg(trip.id, leg.id)}
                                    variant="outline"
                                    size="sm"
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View FRAT
                                  </Button>
                                  <Button
                                    onClick={() => viewAirportEvals(trip.id, leg.id)}
                                    variant="outline"
                                    size="sm"
                                  >
                                    <MapPin className="w-4 h-4 mr-2" />
                                    Airport Evals
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}