import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { FileText, Calculator, AlertCircle, CheckCircle, Info, Edit, Plane, ChevronRight, ChevronDown, Plus } from 'lucide-react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import TaxSettings from './TaxSettings';

interface MockPassenger {
    id: string;
    name: string;
    tNumber: string;
    band: string; // "Band 7" | "CEO" | "Standard"
    classification: 'Personal Entertainment' | 'Personal Non-Entertainment' | 'Commuting' | 'Business' | 'Business Entertainment';
    siflAmount: number;
}

interface MockTaxFlight {
    id: string;
    date: string;
    aircraft: string;
    origin: string;
    destination: string;
    taxOrigin?: string; // For fuel stop overrides
    taxDestination?: string; // For fuel stop overrides
    flightTime: string;
    description: string;
    passengers: MockPassenger[];
    status: 'Verified' | 'Pending Review' | 'Action Required';
    miles: number;
}

interface TaxTrip {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    legs: MockTaxFlight[];
    status: 'Open' | 'Closed' | 'Archived';
}

const mockTrips: TaxTrip[] = [
    {
        id: 'trip1',
        name: 'London Board Meeting',
        startDate: '2024-10-12',
        endDate: '2024-10-15',
        status: 'Closed',
        legs: [
            {
                id: '1',
                date: '2024-10-12',
                aircraft: 'N1PG',
                origin: 'JFK',
                destination: 'LHR',
                flightTime: '6.5h',
                description: 'Outbound Leg',
                passengers: [
                    { id: 'p1', name: 'Executive A', tNumber: 'T-8842', band: 'CEO', classification: 'Business', siflAmount: 0 },
                    { id: 'p2', name: 'Executive B', tNumber: 'T-1193', band: 'Band 7', classification: 'Business', siflAmount: 0 },
                    { id: 'p3', name: 'Guest 1', tNumber: 'N/A', band: 'Guest', classification: 'Personal Entertainment', siflAmount: 3540.00 }
                ],
                status: 'Verified',
                miles: 3451
            },
            {
                id: '2',
                date: '2024-10-15',
                aircraft: 'N1PG',
                origin: 'LHR',
                destination: 'JFK',
                flightTime: '7.1h',
                description: 'Return Leg',
                passengers: [
                    { id: 'p1', name: 'Executive A', tNumber: 'T-8842', band: 'CEO', classification: 'Business', siflAmount: 0 },
                ],
                status: 'Verified',
                miles: 3451
            }
        ]
    },
    {
        id: 'trip2',
        name: 'Bahamas Weekend',
        startDate: '2024-10-20',
        endDate: '2024-10-22',
        status: 'Open',
        legs: [
            {
                id: '3',
                date: '2024-10-20',
                aircraft: 'N5PG',
                origin: 'MIA',
                destination: 'NAS',
                flightTime: '0.9h',
                description: 'Outbound',
                passengers: [
                    { id: 'p4', name: 'Executive C', tNumber: 'T-4421', band: 'Band 7', classification: 'Personal Entertainment', siflAmount: 1450.00 }
                ],
                status: 'Pending Review',
                miles: 188
            },
            {
                id: '4',
                date: '2024-10-22',
                aircraft: 'N5PG',
                origin: 'NAS',
                destination: 'MIA',
                flightTime: '0.9h',
                description: 'Return',
                passengers: [
                    { id: 'p4', name: 'Executive C', tNumber: 'T-4421', band: 'Band 7', classification: 'Personal Entertainment', siflAmount: 1450.00 }
                ],
                status: 'Pending Review',
                miles: 188
            }
        ]
    },
    {
        id: 'trip3',
        name: 'West Coast Commute',
        startDate: '2024-10-25',
        endDate: '2024-10-25',
        status: 'Closed',
        legs: [
            {
                id: '5',
                date: '2024-10-25',
                aircraft: 'N2PG',
                origin: 'TEB',
                destination: 'VNY',
                taxOrigin: 'TEB',
                taxDestination: 'VNY',
                flightTime: '5.2h',
                description: 'Commute',
                passengers: [
                    { id: 'p5', name: 'Director D', tNumber: 'T-9932', band: 'Standard', classification: 'Commuting', siflAmount: 450.00 }
                ],
                status: 'Verified',
                miles: 2454
            },
        ]
    }
];

const CATEGORIES = [
    { value: 'Business', label: 'Business' },
    { value: 'Business Entertainment', label: 'Business - Entertainment' },
    { value: 'Personal Entertainment', label: 'Personal - Entertainment' },
    { value: 'Personal Non-Entertainment', label: 'Personal - Non-Entertainment' },
    { value: 'Commuting', label: 'Commuting' }
];

export default function TaxComplianceDashboard() {
    const [selectedFlight, setSelectedFlight] = React.useState<MockTaxFlight | null>(null);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [expandedTrips, setExpandedTrips] = useState<Set<string>>(new Set(['trip1', 'trip2']));

    const toggleTrip = (tripId: string) => {
        const newExpanded = new Set(expandedTrips);
        if (newExpanded.has(tripId)) {
            newExpanded.delete(tripId);
        } else {
            newExpanded.add(tripId);
        }
        setExpandedTrips(newExpanded);
    };

    const handleRowClick = (flight: MockTaxFlight) => {
        setSelectedFlight(flight);
        setIsDialogOpen(true);
    };

    const calculateTotalSifl = (flight: MockTaxFlight) => {
        return flight.passengers.reduce((sum, p) => sum + p.siflAmount, 0);
    };

    const handleGenerateReport = () => {
        // Flatten data for CSV
        const headers = ['Trip Name', 'Date', 'Aircraft', 'Origin', 'Destination', 'Flight Time', 'Miles', 'Passenger', 'Classification', 'SIFL Amount'];
        const rows: string[] = [];

        mockTrips.forEach(trip => {
            trip.legs.forEach(leg => {
                leg.passengers.forEach(p => {
                    rows.push([
                        `"${trip.name}"`,
                        leg.date,
                        leg.aircraft,
                        leg.taxOrigin || leg.origin,
                        leg.taxDestination || leg.destination,
                        leg.flightTime,
                        leg.miles,
                        `"${p.name}"`,
                        `"${p.classification}"`,
                        p.siflAmount.toFixed(2)
                    ].join(','));
                });
            });
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'tax_compliance_report_Q4_2024.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Tax Compliance Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Manage IRS SIFL and SEC Incremental Cost reporting.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary"><Plus className="w-4 h-4 mr-2" /> New Trip</Button>
                    <Button variant="outline"><Calculator className="w-4 h-4 mr-2" /> Run SIFL Calculator</Button>
                    <Button onClick={handleGenerateReport}><FileText className="w-4 h-4 mr-2" /> Generate Reports</Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="configuration">Configuration</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="glass-panel">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                                <AlertCircle className="h-4 w-4 text-amber-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">12</div>
                                <p className="text-xs text-muted-foreground">Flights requiring passenger classification</p>
                            </CardContent>
                        </Card>
                        <Card className="glass-panel">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Deadheads Unassigned</CardTitle>
                                <AlertCircle className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">3</div>
                                <p className="text-xs text-muted-foreground">Empty legs needing owner allocation</p>
                            </CardContent>
                        </Card>
                        <Card className="glass-panel">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Processed (Q3)</CardTitle>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">45</div>
                                <p className="text-xs text-muted-foreground">Flights fully classified</p>
                            </CardContent>
                        </Card>
                        <Card className="glass-panel">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Est. Imputed Income</CardTitle>
                                <Calculator className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">$12,450</div>
                                <p className="text-xs text-muted-foreground">Current quarter to date</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="glass-panel">
                        <CardHeader>
                            <CardTitle>Trip & Flight Activity (Q4 2024)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="w-[30px]"></TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Aircraft</TableHead>
                                        <TableHead>Dept</TableHead>
                                        <TableHead>Arr</TableHead>
                                        <TableHead className="text-right">Miles</TableHead>
                                        <TableHead>Passenger Name</TableHead>
                                        <TableHead>Purpose</TableHead>
                                        <TableHead>Multiple</TableHead>
                                        <TableHead className="text-right">SIFL Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockTrips.map((trip) => {
                                        const isExpanded = expandedTrips.has(trip.id);
                                        return (
                                            <React.Fragment key={trip.id}>
                                                {/* Trip Header Row */}
                                                <TableRow className="bg-muted/20 hover:bg-muted/30 cursor-pointer" onClick={() => toggleTrip(trip.id)}>
                                                    <TableCell>
                                                        {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                                                    </TableCell>
                                                    <TableCell colSpan={2} className="font-semibold">
                                                        {trip.name}
                                                    </TableCell>
                                                    <TableCell colSpan={6} className="text-muted-foreground text-sm">
                                                        {trip.legs.length} Legs • {trip.startDate} - {trip.endDate}
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono font-medium">
                                                        ${trip.legs.reduce((acc, leg) => acc + calculateTotalSifl(leg), 0).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-xs">{trip.status}</Badge>
                                                    </TableCell>
                                                </TableRow>

                                                {/* Nested Leg Rows */}
                                                {isExpanded && trip.legs.map((flight) => {
                                                    const isPersonal = flight.passengers.some(p => p.classification.includes('Personal') || p.classification === 'Commuting');
                                                    const totalSifl = calculateTotalSifl(flight);
                                                    const categories = Array.from(new Set(flight.passengers.map(p => p.classification)));

                                                    return (
                                                        <TableRow
                                                            key={flight.id}
                                                            className="hover:bg-muted/5 cursor-pointer border-l-4 border-l-transparent text-sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRowClick(flight);
                                                            }}
                                                        >
                                                            <TableCell></TableCell> {/* Indent */}
                                                            <TableCell className="font-medium whitespace-nowrap pl-4">{flight.date}</TableCell>
                                                            <TableCell>{flight.aircraft}</TableCell>
                                                            <TableCell>{flight.taxOrigin || flight.origin} {flight.taxOrigin && <Info className="inline w-3 h-3 text-blue-500" />}</TableCell>
                                                            <TableCell>{flight.taxDestination || flight.destination}</TableCell>
                                                            <TableCell className="text-right font-mono text-muted-foreground">
                                                                {flight.miles.toLocaleString()}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex flex-col gap-1">
                                                                    {flight.passengers.map((p, i) => (
                                                                        <div key={i} className="text-xs flex items-center gap-2">
                                                                            <span className="font-medium">{p.name}</span>
                                                                            {p.band === 'CEO' && <Badge variant="secondary" className="h-4 px-1 text-[9px]">CEO</Badge>}
                                                                            {p.band === 'Band 7' && <Badge variant="secondary" className="h-4 px-1 text-[9px]">B7</Badge>}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {categories.map(cat => (
                                                                        <Badge key={cat} variant="outline" className={
                                                                            cat.includes('Business') ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                                                cat === 'Commuting' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                                                    cat.includes('Entertainment') ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                                                                                        'bg-slate-500/10 text-slate-500 border-slate-500/20'
                                                                        }>
                                                                            {cat}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className="font-mono text-xs">
                                                                    {flight.passengers.some(p => p.band === 'CEO' && p.classification.includes('Personal')) ? '200%' : 'Standard'}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-right font-mono font-medium">
                                                                {totalSifl > 0 ? (
                                                                    <span className={isPersonal ? "text-foreground" : "text-muted-foreground"}>
                                                                        ${totalSifl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                                    </span>
                                                                ) : '-'}
                                                            </TableCell>
                                                            <TableCell>
                                                                {flight.status === 'Verified' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                                                                {flight.status === 'Pending Review' && <AlertCircle className="w-4 h-4 text-amber-500" />}
                                                                {flight.status === 'Action Required' && <AlertCircle className="w-4 h-4 text-red-500" />}
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                })}
                                            </React.Fragment>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="configuration">
                    <TaxSettings />
                </TabsContent>
            </Tabs>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="w-[95vw] sm:w-full sm:max-w-4xl overflow-y-auto max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Flight Tax Details</DialogTitle>
                        <DialogDescription>
                            Review and modify tax classifications, override routes, and manage passenger details.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedFlight && (
                        <div className="mt-4 space-y-6">
                            {/* Trip Analysis Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/20 p-4 rounded-lg border">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <Plane className="w-4 h-4" /> Flight Operations
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Date</Label>
                                            <div className="font-medium text-sm sm:text-base">{selectedFlight.date}</div>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Aircraft</Label>
                                            <div className="font-medium text-sm sm:text-base">{selectedFlight.aircraft}</div>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Operational Origin</Label>
                                            <div className="font-mono bg-background p-1.5 rounded text-sm">{selectedFlight.origin}</div>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Operational Dest</Label>
                                            <div className="font-mono bg-background p-1.5 rounded text-sm">{selectedFlight.destination}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 md:border-l md:pl-6 border-t md:border-t-0 pt-4 md:pt-0">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-500 flex items-center gap-2">
                                        <Edit className="w-4 h-4" /> Tax Overrides
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="tax-origin" className="text-xs font-medium">Taxable Origin</Label>
                                            <Input
                                                id="tax-origin"
                                                defaultValue={selectedFlight.taxOrigin || selectedFlight.origin}
                                                className="h-9 font-mono border-blue-200 focus-visible:ring-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="tax-dest" className="text-xs font-medium">Taxable Destination</Label>
                                            <Input
                                                id="tax-dest"
                                                defaultValue={selectedFlight.taxDestination || selectedFlight.destination}
                                                className="h-9 font-mono border-blue-200 focus-visible:ring-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2 text-xs text-muted-foreground bg-background p-2 rounded border border-dashed">
                                        <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                        <span className="leading-tight">
                                            Use these fields to merge fuel stops. E.g., if flying A &rarr; B (Fuel) &rarr; C, set Taxable Origin to A and Taxable Dest to C on the first leg (or merge them via trip builder).
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Passenger Manifest Section */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Passenger Manifest</h3>
                                    <Badge variant="outline" className="text-muted-foreground">{selectedFlight.passengers.length} Pax</Badge>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {selectedFlight.passengers.map((p) => (
                                        <div key={p.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-card border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex-1 w-full sm:min-w-[200px]">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-lg truncate">{p.name}</span>
                                                    {p.band === 'CEO' && <Badge className="bg-blue-600 flex-shrink-0">CEO</Badge>}
                                                </div>
                                                <div className="text-sm text-muted-foreground font-mono mt-1">{p.tNumber} • {p.band}</div>
                                            </div>

                                            <div className="flex-1 w-full sm:w-auto">
                                                <Label className="text-xs text-muted-foreground mb-1 block">Classification</Label>
                                                <Select defaultValue={p.classification}>
                                                    <SelectTrigger className="h-9 w-full">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {CATEGORIES.map(cat => (
                                                            <SelectItem key={cat.value} value={cat.value}>
                                                                {cat.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="w-full sm:w-auto sm:min-w-[120px] bg-muted/30 p-2 rounded flex sm:block justify-between items-center sm:text-right">
                                                <div className="text-xs text-muted-foreground uppercase tracking-wide">Est. SIFL</div>
                                                <div className="text-xl font-bold font-mono">
                                                    ${p.siflAmount.toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0 sticky bottom-0 bg-background pt-2 pb-2 -mx-6 px-6 sm:static sm:bg-transparent sm:pt-0 sm:pb-0 sm:mx-0 sm:px-0 border-t sm:border-t-0">
                                <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button onClick={() => setIsDialogOpen(false)} className="px-8 w-full sm:w-auto">Save Changes</Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
