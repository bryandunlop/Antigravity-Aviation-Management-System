import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Alert, AlertDescription } from './ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { useFlightNASImpact } from './hooks/useFlightNASImpact';
import {
    AlertTriangle,
    Clock,
    Plane,
    MapPin,
    ChevronDown,
    ChevronUp,
    RefreshCw,
    CheckCircle,
    ExternalLink,
    Bell
} from 'lucide-react';

interface NASImpactWidgetProps {
    pilotName?: string; // If provided, filter to show only this pilot's flights
    compact?: boolean; // Compact mode for smaller displays
    maxFlights?: number; // Maximum number of flights to show before collapsing
}

export default function NASImpactWidget({
    pilotName,
    compact = false,
    maxFlights = 5
}: NASImpactWidgetProps) {
    const { impactData, loading, isRefreshing, error, refetch } = useFlightNASImpact();
    const [showAll, setShowAll] = useState(false);

    // Filter impacted flights by pilot if pilotName is provided
    const filteredFlights = pilotName
        ? impactData.impactedFlights.filter(flight =>
            flight.pilots?.includes(pilotName)
        )
        : impactData.impactedFlights;

    const visibleFlights = showAll ? filteredFlights : filteredFlights.slice(0, maxFlights);
    const hasMoreFlights = filteredFlights.length > maxFlights;

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'High': return 'bg-red-100 text-red-800 border-red-300';
            case 'Medium': return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'Low': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getSeverityBadgeColor = (severity: string) => {
        switch (severity) {
            case 'High': return 'bg-red-500 text-white';
            case 'Medium': return 'bg-orange-500 text-white';
            case 'Low': return 'bg-yellow-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    const getImpactTypeLabel = (type: string) => {
        switch (type) {
            case 'ground_stop': return 'Ground Stop';
            case 'ground_delay': return 'Delay';
            case 'flow_program': return 'Flow Program';
            case 'facility_outage': return 'Facility Issue';
            default: return type;
        }
    };

    if (loading && filteredFlights.length === 0) {
        return (
            <Card className={compact ? '' : 'border-blue-200'}>
                <CardHeader className={compact ? 'pb-3' : ''}>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <AlertTriangle className="w-4 h-4 text-blue-500" />
                        NAS Impact Alerts {pilotName && `- ${pilotName}`}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-4">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Loading NAS data...
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <AlertDescription className="text-red-800 text-sm">
                    Failed to load NAS impact data. <Button variant="link" className="p-0 h-auto text-red-800" onClick={refetch}>Retry</Button>
                </AlertDescription>
            </Alert>
        );
    }

    // No impacts - show "All Clear" message
    if (filteredFlights.length === 0) {
        return (
            <Card className="border-green-200 bg-green-50">
                <CardContent className={compact ? 'p-4' : 'p-6'}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-green-900">All Clear</h3>
                            <p className="text-sm text-green-700">
                                {pilotName
                                    ? 'No NAS impacts on your assigned flights'
                                    : 'No NAS impacts detected for scheduled flights'
                                }
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Determine highest severity across all filtered flights
    const highestSeverity = filteredFlights.reduce((max, flight) => {
        const flightHighest = flight.impacts.reduce((fMax, impact) => {
            const severityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
            const currentSeverity = severityOrder[impact.severity as keyof typeof severityOrder];
            const maxSeverity = severityOrder[fMax as keyof typeof severityOrder];
            return currentSeverity > maxSeverity ? impact.severity : fMax;
        }, 'Low');

        const severityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        const currentSeverity = severityOrder[flightHighest as keyof typeof severityOrder];
        const maxSeverity = severityOrder[max as keyof typeof severityOrder];
        return currentSeverity > maxSeverity ? flightHighest : max;
    }, 'Low');

    const borderColor = highestSeverity === 'High' ? 'border-red-300' :
        highestSeverity === 'Medium' ? 'border-orange-300' :
            'border-yellow-300';

    const bgColor = highestSeverity === 'High' ? 'bg-red-50' :
        highestSeverity === 'Medium' ? 'bg-orange-50' :
            'bg-yellow-50';

    return (
        <Card className={`${borderColor} ${compact ? '' : bgColor}`}>
            <CardHeader className={compact ? 'pb-3' : ''}>
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <AlertTriangle className={`w-5 h-5 ${highestSeverity === 'High' ? 'text-red-600' :
                                highestSeverity === 'Medium' ? 'text-orange-600' :
                                    'text-yellow-600'
                                }`} />
                            NAS Impact Alerts
                            <Badge className={getSeverityBadgeColor(highestSeverity)}>
                                {filteredFlights.length} flight{filteredFlights.length !== 1 ? 's' : ''}
                            </Badge>
                        </CardTitle>
                        {!compact && (
                            <CardDescription className="mt-1">
                                {pilotName
                                    ? `Flights assigned to ${pilotName} affected by NAS delays`
                                    : 'Scheduled flights affected by NAS delays or restrictions'
                                }
                            </CardDescription>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={refetch}
                        disabled={loading || isRefreshing}
                        className="ml-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading || isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className={compact ? 'pt-0' : ''}>
                <div className="space-y-3">
                    {visibleFlights.map((flight) => {
                        // Get highest severity for this flight
                        const flightSeverity = flight.impacts.reduce((max, impact) => {
                            const severityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
                            const currentSeverity = severityOrder[impact.severity as keyof typeof severityOrder];
                            const maxSeverity = severityOrder[max as keyof typeof severityOrder];
                            return currentSeverity > maxSeverity ? impact.severity : max;
                        }, 'Low');

                        // Get primary impact (highest severity)
                        const primaryImpact = flight.impacts.reduce((highest, impact) => {
                            const severityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
                            const currentSeverity = severityOrder[impact.severity as keyof typeof severityOrder];
                            const highestSeverity = severityOrder[highest.severity as keyof typeof severityOrder];
                            return currentSeverity > highestSeverity ? impact : highest;
                        }, flight.impacts[0]);

                        return (
                            <div
                                key={flight.id}
                                className={`p-3 border-l-4 rounded-lg bg-white ${flightSeverity === 'High' ? 'border-l-red-500' :
                                    flightSeverity === 'Medium' ? 'border-l-orange-500' :
                                        'border-l-yellow-500'
                                    } border border-gray-200`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Plane className="w-4 h-4 text-muted-foreground" />
                                            <span className="font-medium">{flight.id}</span>
                                            <Badge variant="outline" className="text-xs">{flight.aircraft}</Badge>
                                            <Badge className={getSeverityColor(flightSeverity)}>
                                                {flightSeverity}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {flight.route}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2 mt-2">
                                    <div className="flex items-start gap-2 text-sm">
                                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <span className="font-medium">{primaryImpact.affectedAirport}:</span>{' '}
                                            <span className="text-muted-foreground">
                                                {getImpactTypeLabel(primaryImpact.impactType)}
                                            </span>
                                            {primaryImpact.estimatedDelay && (
                                                <span className="text-orange-600 font-medium ml-1">
                                                    (~{primaryImpact.estimatedDelay} min delay)
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {flight.impacts.length > 1 && (
                                        <p className="text-xs text-muted-foreground">
                                            +{flight.impacts.length - 1} more impact{flight.impacts.length - 1 !== 1 ? 's' : ''}
                                        </p>
                                    )}

                                    {!compact && primaryImpact.actionRequired && (
                                        <Alert className="mt-2 py-2">
                                            <Bell className="w-3 h-3" />
                                            <AlertDescription className="text-xs">
                                                {primaryImpact.recommendation}
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {hasMoreFlights && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAll(!showAll)}
                        className="w-full mt-3"
                    >
                        {showAll ? (
                            <>
                                <ChevronUp className="w-4 h-4 mr-2" />
                                Show Less
                            </>
                        ) : (
                            <>
                                <ChevronDown className="w-4 h-4 mr-2" />
                                Show {filteredFlights.length - maxFlights} More Flight{filteredFlights.length - maxFlights !== 1 ? 's' : ''}
                            </>
                        )}
                    </Button>
                )}

                {!compact && (
                    <div className="flex items-center justify-between mt-4 pt-3 border-t">
                        <span className="text-xs text-muted-foreground">
                            Last updated: {new Date().toLocaleTimeString()}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={() => window.open('https://nasstatus.faa.gov/', '_blank')}
                        >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Full NAS Status
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
