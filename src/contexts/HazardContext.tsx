import React, { createContext, useContext, useState, useEffect } from 'react';

// Define types based on existing components
export const WORKFLOW_STAGES = {
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

export interface Hazard {
    id: string;
    title: string;
    category?: string;
    severity: string; // 'Critical' | 'High' | 'Medium' | 'Low'
    workflowStage: string;
    location: string;
    reportedBy: string; // or submittedBy
    submitterLineManager?: string;
    reportedDate: string; // or submitDate
    description: string;
    immediateActions: string;
    potentialConsequences: string;
    assignedTo?: string | null;
    dueDate?: string;
    effectivenessReviewDate?: string;
    priority?: string;
    daysInStage?: number;

    // Workflow specifics
    riskFactors?: string[];
    riskAnalysis?: {
        severity: number;
        likelihood: number;
    };
    whyAnalysis?: string[];
    investigationNotes?: string;
    paceAssignments?: {
        processOwner: { type: string; value: string; customName?: string; customEmail?: string };
        approver: { type: string; value: string; customName?: string; customEmail?: string };
        contributors: Array<{ type: string; value: string; customName?: string; customEmail?: string }>;
        executers: Array<{ type: string; value: string; customName?: string; customEmail?: string }>;
    };
    correctiveActionComponents?: {
        communications: boolean;
        training: boolean;
        policy: boolean;
        equipment: boolean;
    };
    correctiveActionDetails?: string;

    // Audit trail
    workflowHistory?: Array<{ stage: string; date: string; user: string; action: string }>;
    duties?: Array<any>;
}

interface HazardContextType {
    hazards: Hazard[];
    getHazardById: (id: string) => Hazard | undefined;
    submitHazard: (hazard: Omit<Hazard, 'id' | 'workflowStage' | 'reportedDate'>) => void;
    updateHazard: (id: string, updates: Partial<Hazard>) => void;
    deleteHazard: (id: string) => void;
}

const HazardContext = createContext<HazardContextType | undefined>(undefined);

// Initial Mock Data
const INITIAL_HAZARDS: Hazard[] = [
    {
        id: 'HZ-001',
        title: 'Runway Surface Contamination - LAX Runway 24L',
        category: 'Airport Infrastructure',
        severity: 'Critical',
        workflowStage: WORKFLOW_STAGES.LINE_MANAGER_APPROVAL, // Mapped to LINE_MANAGER_REVIEW in one file, normalized here
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
        riskFactors: ['Lack of Awareness'],
        priority: 'High'
    },
    {
        id: 'HZ-002',
        title: 'Bird Strike Risk - Approach Path DEN',
        category: 'Wildlife',
        severity: 'High',
        workflowStage: WORKFLOW_STAGES.EXEC_APPROVAL, // Mapped to VP_APPROVAL
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
        riskFactors: ['Lack of Resources'],
        priority: 'High'
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
        priority: 'Medium'
    },
    {
        id: 'HZ-004',
        title: 'Fuel System Leak - Fuel Farm',
        category: 'Fuel System',
        severity: 'High',
        workflowStage: WORKFLOW_STAGES.SM_INITIAL_REVIEW,
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
        priority: 'High'
    },
    {
        id: 'HZ-005',
        title: 'Inadequate Ramp Lighting',
        category: 'Infrastructure',
        severity: 'Low',
        workflowStage: WORKFLOW_STAGES.EFFECTIVENESS_REVIEW,
        location: 'Regional Airport - FBO Ramp',
        reportedBy: 'Chris Brown',
        reportedDate: '2024-01-15',
        description: 'Lighting on FBO ramp is insufficient for night operations.',
        immediateActions: 'Portable lighting requested.',
        potentialConsequences: 'Trip hazard, vehicle collision.',
        effectivenessReviewDate: '2024-07-15',
        priority: 'Low'
    }
];

export const HazardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [hazards, setHazards] = useState<Hazard[]>([]);

    // Load from local storage on mount
    useEffect(() => {
        const storedHazards = localStorage.getItem('aviation_hazards');
        if (storedHazards) {
            setHazards(JSON.parse(storedHazards));
        } else {
            setHazards(INITIAL_HAZARDS);
            localStorage.setItem('aviation_hazards', JSON.stringify(INITIAL_HAZARDS));
        }
    }, []);

    // Save to local storage whenever hazards change
    useEffect(() => {
        if (hazards.length > 0) {
            localStorage.setItem('aviation_hazards', JSON.stringify(hazards));
        }
    }, [hazards]);

    const getHazardById = (id: string) => {
        return hazards.find(h => h.id === id);
    };

    const submitHazard = (newHazardData: Omit<Hazard, 'id' | 'workflowStage' | 'reportedDate'>) => {
        const newId = `HZ-${String(hazards.length + 1).padStart(3, '0')}`;
        const today = new Date().toISOString().split('T')[0];

        const newHazard: Hazard = {
            ...newHazardData,
            id: newId,
            workflowStage: WORKFLOW_STAGES.SUBMITTED,
            reportedDate: today,
            daysInStage: 0,
            priority: newHazardData.severity // Simple default mapping
        };

        setHazards(prev => [newHazard, ...prev]);
    };

    const updateHazard = (id: string, updates: Partial<Hazard>) => {
        setHazards(prev => prev.map(h => {
            if (h.id === id) {
                return { ...h, ...updates };
            }
            return h;
        }));
    };

    const deleteHazard = (id: string) => {
        setHazards(prev => prev.filter(h => h.id !== id));
    };

    return (
        <HazardContext.Provider value={{ hazards, getHazardById, submitHazard, updateHazard, deleteHazard }}>
            {children}
        </HazardContext.Provider>
    );
};

export const useHazards = () => {
    const context = useContext(HazardContext);
    if (!context) {
        throw new Error('useHazards must be used within a HazardProvider');
    }
    return context;
};
