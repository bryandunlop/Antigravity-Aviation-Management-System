import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner@2.0.3';

// ==================== TYPES ====================

export interface Squawk {
  id: string;
  aircraftId: string;
  aircraftTail: string;
  logbookPage: number;
  reportedBy: string;
  reportedByRole: string;
  reportedAt: Date;
  flightNumber?: string;
  squawkType: 'preflight' | 'inflight' | 'postflight' | 'ground';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in-progress' | 'deferred' | 'closed' | 'duplicate';
  ataChapter: string;
  description: string;
  pilotAction?: string;
  maintenanceActions: MaintenanceAction[];
  deferral?: Deferral;
  closedBy?: string;
  closedAt?: Date;
  requiresInspection: boolean;
  partsUsed: PartUsed[];
  attachments: string[];
  category: 'mechanical' | 'electrical' | 'avionics' | 'cabin' | 'exterior' | 'documentation';
  workOrderId?: string;
  lifecycleStage: LifecycleStage;
  auditTrail: AuditEntry[];
  relatedSquawks?: string[]; // For pattern detection
  patternDetected?: boolean;
  patternInfo?: PatternInfo;
}

export interface MaintenanceAction {
  id: string;
  technicianName: string;
  technicianId: string;
  actionTaken: string;
  workOrderNumber?: string;
  startTime: Date;
  endTime?: Date;
  inspectedBy?: string;
  signedOff: boolean;
  signOffTime?: Date;
  signOffData?: SignatureData;
}

export interface Deferral {
  melReference: string;
  deferralCategory: 'A' | 'B' | 'C' | 'D';
  expiryDate: Date;
  authorizedBy: string;
  conditions: string;
  operationalLimitations: string[];
  daysRemaining?: number;
  alertStatus?: 'ok' | 'warning' | 'critical' | 'expired';
}

export interface PartUsed {
  partNumber: string;
  serialNumber?: string;
  quantity: number;
  description: string;
  location: string;
  reserved?: boolean;
  reservedAt?: Date;
  reservedBy?: string;
}

export interface LifecycleStage {
  current: 'reported' | 'wo-created' | 'assigned' | 'in-progress' | 'inspection-required' | 'inspection-completed' | 'completed' | 'deferred';
  history: LifecycleEvent[];
  estimatedCompletionTime?: Date;
  mttr?: number; // Mean time to repair in hours
}

export interface LifecycleEvent {
  stage: string;
  timestamp: Date;
  performedBy: string;
  notes?: string;
  automated?: boolean;
}

export interface AuditEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  field?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  metadata?: any;
}

export interface SignatureData {
  signature: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  documentHash: string;
  signedBy: string;
  email: string;
  role: string;
}

export interface PatternInfo {
  detectedAt: Date;
  similarSquawks: string[];
  ataChapter: string;
  aircraft?: string;
  frequency: number;
  recommendation: string;
}

export interface WorkOrderExtended {
  id: string;
  title: string;
  description: string;
  aircraft: string;
  tailNumber: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'assigned' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled';
  type: 'scheduled' | 'unscheduled' | 'aog';
  category: 'minor' | 'major' | 'ancillary';
  
  assignedTo: string[];
  assignedShift?: 'AM' | 'PM' | 'Night';
  
  cmpJobCard?: string;
  cmpSyncRequired: boolean;
  cmpLastSync?: string;
  
  estimatedHours: number;
  actualHours: number;
  startDate?: string;
  completedDate?: string;
  dueDate: string;
  
  subTasks: SubTask[];
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  location: string;
  notes?: string;
  
  // New fields
  linkedSquawks: string[];
  lifecycleStage: LifecycleStage;
  auditTrail: AuditEntry[];
  partsReserved: PartUsed[];
  requiredInspections: InspectionCheckpoint[];
  completedInspections: CompletedInspection[];
  documentLinks: DocumentLink[];
  airworthinessRelease?: AirworthinessRelease;
  notificationsSent: Notification[];
}

export interface SubTask {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo?: string;
  estimatedHours: number;
  actualHours: number;
  completedBy?: string;
  completedAt?: string;
  notes?: string;
  signOffRequired?: boolean;
  signOffData?: SignatureData;
}

export interface InspectionCheckpoint {
  id: string;
  type: 'rii' | 'final' | 'conformity' | 'functional' | 'operational';
  description: string;
  required: boolean;
  inspector?: string;
  inspectorRole?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
}

export interface CompletedInspection {
  checkpointId: string;
  inspector: string;
  inspectorRole: string;
  completedAt: Date;
  signOffData: SignatureData;
  findings?: string;
  passed: boolean;
}

export interface DocumentLink {
  id: string;
  documentId: string;
  documentTitle: string;
  documentType: 'manual' | 'ad' | 'sb' | 'procedure' | 'drawing';
  ataChapter?: string;
  linkedAt: Date;
  linkedBy: string;
}

export interface AirworthinessRelease {
  id: string;
  workOrderId: string;
  aircraftTail: string;
  releasedBy: string;
  releasedAt: Date;
  signOffData: SignatureData;
  maintenancePerformed: string;
  certificateNumber: string;
  returnToService: boolean;
  discrepancies?: string[];
  limitations?: string[];
}

export interface Notification {
  id: string;
  type: 'alert' | 'info' | 'warning' | 'critical';
  recipient: string;
  recipientRole: string;
  message: string;
  sentAt: Date;
  read: boolean;
  actionRequired?: string;
  relatedEntity: string;
  relatedEntityId: string;
}

export interface MTTRData {
  byAircraft: { [key: string]: number };
  byCategory: { [key: string]: number };
  byTechnician: { [key: string]: number };
  overall: number;
  lastCalculated: Date;
}

export interface AircraftAvailability {
  aircraftId: string;
  tail: string;
  status: 'available' | 'grounded' | 'limited';
  openSquawks: number;
  criticalSquawks: number;
  deferredSquawks: number;
  estimatedReturnToService?: Date;
  currentLimitations: string[];
  nextScheduledFlight?: {
    flightNumber: string;
    departure: Date;
    destination: string;
    canDepart: boolean;
    blockers: string[];
  };
}

// ==================== CONTEXT ====================

interface MaintenanceContextType {
  squawks: Squawk[];
  workOrders: WorkOrderExtended[];
  mttrData: MTTRData;
  aircraftAvailability: AircraftAvailability[];
  
  addSquawk: (squawk: Omit<Squawk, 'id' | 'lifecycleStage' | 'auditTrail'>) => void;
  updateSquawk: (id: string, updates: Partial<Squawk>) => void;
  deleteSquawk: (id: string) => void;
  
  addWorkOrder: (workOrder: Omit<WorkOrderExtended, 'id' | 'lifecycleStage' | 'auditTrail' | 'notificationsSent'>) => void;
  updateWorkOrder: (id: string, updates: Partial<WorkOrderExtended>) => void;
  deleteWorkOrder: (id: string) => void;
  
  createWorkOrderFromSquawks: (squawkIds: string[], workOrderData: any) => void;
  linkDocumentsToWorkOrder: (workOrderId: string, ataChapter: string) => void;
  reserveParts: (workOrderId: string, parts: PartUsed[]) => void;
  completeInspection: (workOrderId: string, checkpointId: string, inspectionData: any) => void;
  generateAirworthinessRelease: (workOrderId: string, releaseData: any) => void;
  
  detectPatterns: () => void;
  calculateMTTR: () => void;
  updateAircraftAvailability: () => void;
  
  sendNotification: (notification: Omit<Notification, 'id' | 'sentAt' | 'read'>) => void;
  
  currentUser: string;
  setCurrentUser: (user: string) => void;
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

export const useMaintenanceContext = () => {
  const context = useContext(MaintenanceContext);
  if (!context) {
    throw new Error('useMaintenanceContext must be used within MaintenanceProvider');
  }
  return context;
};

// ==================== PROVIDER ====================

interface MaintenanceProviderProps {
  children: ReactNode;
}

export const MaintenanceProvider: React.FC<MaintenanceProviderProps> = ({ children }) => {
  // ==================== SAMPLE DATA ====================
  const generateSampleSquawks = (): Squawk[] => {
    const now = new Date();
    const aircraft = ['N650GS', 'N651GS', 'N652GS'];
    const technicians = ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Lisa Chen', 'Tom Wilson'];
    const pilots = ['Capt. Anderson', 'Capt. Martinez', 'Capt. Taylor', 'FO Williams'];
    
    return [
      {
        id: 'SQ-2025-001',
        aircraftId: 'AC-001',
        aircraftTail: 'N650GS',
        logbookPage: 1247,
        reportedBy: 'Capt. Anderson',
        reportedByRole: 'PIC',
        reportedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        flightNumber: 'FLT-101',
        squawkType: 'postflight',
        priority: 'critical',
        status: 'in-progress',
        ataChapter: '29',
        description: 'Hydraulic system pressure fluctuation observed during landing. Left main gear actuator response delayed by 2-3 seconds.',
        pilotAction: 'Aircraft grounded pending maintenance review',
        maintenanceActions: [{
          id: 'MA-001',
          technicianName: 'John Smith',
          technicianId: 'TECH-001',
          actionTaken: 'Inspecting hydraulic system pressure lines and actuator response time',
          startTime: new Date(now.getTime() - 1.5 * 60 * 60 * 1000),
          signedOff: false
        }],
        requiresInspection: true,
        partsUsed: [],
        attachments: [],
        category: 'mechanical',
        lifecycleStage: {
          current: 'in-progress',
          history: [
            { stage: 'reported', timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), performedBy: 'Capt. Anderson' },
            { stage: 'wo-created', timestamp: new Date(now.getTime() - 1.8 * 60 * 60 * 1000), performedBy: 'System', automated: true },
            { stage: 'assigned', timestamp: new Date(now.getTime() - 1.7 * 60 * 60 * 1000), performedBy: 'Lead Mechanic' },
            { stage: 'in-progress', timestamp: new Date(now.getTime() - 1.5 * 60 * 60 * 1000), performedBy: 'John Smith' }
          ]
        },
        auditTrail: [],
        patternDetected: false
      },
      {
        id: 'SQ-2025-002',
        aircraftId: 'AC-002',
        aircraftTail: 'N651GS',
        logbookPage: 892,
        reportedBy: 'Capt. Martinez',
        reportedByRole: 'PIC',
        reportedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5 hours ago
        squawkType: 'inflight',
        priority: 'medium',
        status: 'deferred',
        ataChapter: '34',
        description: 'Weather radar display intermittent on copilot side. Blanks out for 2-3 seconds then recovers.',
        deferral: {
          melReference: 'MEL 34-11-01',
          deferralCategory: 'B',
          expiryDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days
          authorizedBy: 'Chief Inspector',
          conditions: 'Operate with captain\'s radar only',
          operationalLimitations: ['Avoid IMC conditions when possible', 'Captain must monitor weather radar']
        },
        maintenanceActions: [],
        requiresInspection: false,
        partsUsed: [],
        attachments: [],
        category: 'avionics',
        lifecycleStage: {
          current: 'deferred',
          history: [
            { stage: 'reported', timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000), performedBy: 'Capt. Martinez' },
            { stage: 'deferred', timestamp: new Date(now.getTime() - 4.5 * 60 * 60 * 1000), performedBy: 'Chief Inspector', notes: 'MEL 34-11-01 applied' }
          ]
        },
        auditTrail: [],
        patternDetected: false
      },
      {
        id: 'SQ-2025-003',
        aircraftId: 'AC-001',
        aircraftTail: 'N650GS',
        logbookPage: 1245,
        reportedBy: 'FO Williams',
        reportedByRole: 'SIC',
        reportedAt: new Date(now.getTime() - 8 * 60 * 60 * 1000),
        squawkType: 'preflight',
        priority: 'low',
        status: 'closed',
        ataChapter: '32',
        description: 'Left main landing gear tire showing minor wear pattern on inner tread.',
        maintenanceActions: [{
          id: 'MA-003',
          technicianName: 'Mike Davis',
          technicianId: 'TECH-003',
          actionTaken: 'Inspected tire wear. Within acceptable limits. Recorded measurement: 8/32" tread depth remaining. Recommend replacement at next scheduled maintenance.',
          startTime: new Date(now.getTime() - 7 * 60 * 60 * 1000),
          endTime: new Date(now.getTime() - 6.5 * 60 * 60 * 1000),
          signedOff: true,
          signOffTime: new Date(now.getTime() - 6.5 * 60 * 60 * 1000)
        }],
        closedBy: 'Mike Davis',
        closedAt: new Date(now.getTime() - 6.5 * 60 * 60 * 1000),
        requiresInspection: false,
        partsUsed: [],
        attachments: [],
        category: 'mechanical',
        lifecycleStage: {
          current: 'completed',
          history: [
            { stage: 'reported', timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000), performedBy: 'FO Williams' },
            { stage: 'assigned', timestamp: new Date(now.getTime() - 7.5 * 60 * 60 * 1000), performedBy: 'System' },
            { stage: 'in-progress', timestamp: new Date(now.getTime() - 7 * 60 * 60 * 1000), performedBy: 'Mike Davis' },
            { stage: 'completed', timestamp: new Date(now.getTime() - 6.5 * 60 * 60 * 1000), performedBy: 'Mike Davis' }
          ],
          mttr: 0.5
        },
        auditTrail: []
      },
      {
        id: 'SQ-2025-004',
        aircraftId: 'AC-003',
        aircraftTail: 'N652GS',
        logbookPage: 654,
        reportedBy: 'Capt. Taylor',
        reportedByRole: 'PIC',
        reportedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
        squawkType: 'postflight',
        priority: 'high',
        status: 'open',
        ataChapter: '21',
        description: 'Cabin temperature control erratic. Unable to maintain set temperature, fluctuating ±5°F.',
        maintenanceActions: [],
        requiresInspection: false,
        partsUsed: [],
        attachments: [],
        category: 'cabin',
        lifecycleStage: {
          current: 'reported',
          history: [
            { stage: 'reported', timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000), performedBy: 'Capt. Taylor' }
          ]
        },
        auditTrail: [],
        relatedSquawks: ['SQ-2024-892', 'SQ-2024-901'],
        patternDetected: true,
        patternInfo: {
          detectedAt: new Date(now.getTime() - 11 * 60 * 60 * 1000),
          similarSquawks: ['SQ-2024-892', 'SQ-2024-901'],
          ataChapter: '21',
          aircraft: 'N652GS',
          frequency: 3,
          recommendation: 'Consider full cabin temperature control system diagnostic'
        }
      },
      {
        id: 'SQ-2025-005',
        aircraftId: 'AC-002',
        aircraftTail: 'N651GS',
        logbookPage: 890,
        reportedBy: 'Sarah Johnson',
        reportedByRole: 'Technician',
        reportedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        squawkType: 'ground',
        priority: 'critical',
        status: 'deferred',
        ataChapter: '52',
        description: 'Passenger door emergency exit light illuminated. Emergency evacuation slide indicator shows armed when door locked.',
        deferral: {
          melReference: 'MEL 52-20-01',
          deferralCategory: 'C',
          expiryDate: new Date(now.getTime() - 12 * 60 * 60 * 1000), // EXPIRED!
          authorizedBy: 'DO',
          conditions: 'Passenger door emergency exit must not be used',
          operationalLimitations: ['Use alternative emergency exit only', 'Brief passengers', 'No revenue flights']
        },
        maintenanceActions: [],
        requiresInspection: true,
        partsUsed: [],
        attachments: [],
        category: 'mechanical',
        lifecycleStage: {
          current: 'deferred',
          history: [
            { stage: 'reported', timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), performedBy: 'Sarah Johnson' },
            { stage: 'deferred', timestamp: new Date(now.getTime() - 23 * 60 * 60 * 1000), performedBy: 'DO' }
          ]
        },
        auditTrail: [],
        patternDetected: false
      },
      {
        id: 'SQ-2025-006',
        aircraftId: 'AC-001',
        aircraftTail: 'N650GS',
        logbookPage: 1246,
        reportedBy: 'Tom Wilson',
        reportedByRole: 'Technician',
        reportedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
        squawkType: 'ground',
        priority: 'medium',
        status: 'in-progress',
        ataChapter: '24',
        description: 'APU starter motor slow to engage. Takes 3-4 seconds vs normal 1-2 seconds.',
        maintenanceActions: [{
          id: 'MA-006',
          technicianName: 'Tom Wilson',
          technicianId: 'TECH-005',
          actionTaken: 'Testing APU starter motor response time and battery voltage',
          startTime: new Date(now.getTime() - 2.5 * 60 * 60 * 1000),
          signedOff: false
        }],
        requiresInspection: false,
        partsUsed: [],
        attachments: [],
        category: 'electrical',
        lifecycleStage: {
          current: 'in-progress',
          history: [
            { stage: 'reported', timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000), performedBy: 'Tom Wilson' },
            { stage: 'wo-created', timestamp: new Date(now.getTime() - 2.8 * 60 * 60 * 1000), performedBy: 'System' },
            { stage: 'assigned', timestamp: new Date(now.getTime() - 2.7 * 60 * 60 * 1000), performedBy: 'Lead Mechanic' },
            { stage: 'in-progress', timestamp: new Date(now.getTime() - 2.5 * 60 * 60 * 1000), performedBy: 'Tom Wilson' }
          ]
        },
        auditTrail: []
      }
    ];
  };

  const generateSampleWorkOrders = (): WorkOrderExtended[] => {
    const now = new Date();
    
    return [
      {
        id: 'WO-2025-001',
        title: 'Hydraulic System Pressure Investigation',
        description: 'Investigate and repair hydraulic pressure fluctuation in left main gear system',
        aircraft: 'Gulfstream G650',
        tailNumber: 'N650GS',
        priority: 'critical',
        status: 'in-progress',
        type: 'aog',
        category: 'major',
        assignedTo: ['John Smith', 'Sarah Johnson'],
        assignedShift: 'AM',
        cmpJobCard: 'JC-2025-001',
        cmpSyncRequired: true,
        cmpLastSync: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        estimatedHours: 8,
        actualHours: 1.5,
        startDate: new Date(now.getTime() - 1.5 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(now.getTime() + 6.5 * 60 * 60 * 1000).toISOString(),
        subTasks: [
          {
            id: 'ST-001',
            title: 'Pressure test hydraulic lines',
            status: 'in-progress',
            assignedTo: 'John Smith',
            estimatedHours: 2,
            actualHours: 1,
            signOffRequired: true
          },
          {
            id: 'ST-002',
            title: 'Inspect actuator response',
            status: 'pending',
            estimatedHours: 3,
            actualHours: 0,
            signOffRequired: true
          },
          {
            id: 'ST-003',
            title: 'Replace seals if needed',
            status: 'pending',
            estimatedHours: 3,
            actualHours: 0,
            signOffRequired: true
          }
        ],
        createdBy: 'System',
        createdAt: new Date(now.getTime() - 1.8 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        location: 'Main Hangar',
        notes: 'AOG priority - aircraft grounded',
        linkedSquawks: ['SQ-2025-001'],
        lifecycleStage: {
          current: 'in-progress',
          history: [
            { stage: 'wo-created', timestamp: new Date(now.getTime() - 1.8 * 60 * 60 * 1000), performedBy: 'System', automated: true },
            { stage: 'assigned', timestamp: new Date(now.getTime() - 1.7 * 60 * 60 * 1000), performedBy: 'Lead Mechanic' },
            { stage: 'in-progress', timestamp: new Date(now.getTime() - 1.5 * 60 * 60 * 1000), performedBy: 'John Smith' }
          ]
        },
        auditTrail: [],
        partsReserved: [
          {
            partNumber: 'G650-HYD-SEAL-29',
            quantity: 2,
            description: 'Hydraulic actuator seal kit',
            location: 'Parts Room A',
            reserved: true,
            reservedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
            reservedBy: 'John Smith'
          }
        ],
        requiredInspections: [
          {
            id: 'INSP-001',
            type: 'rii',
            description: 'RII inspection of hydraulic system repair',
            required: true,
            status: 'pending'
          }
        ],
        completedInspections: [],
        documentLinks: [],
        notificationsSent: []
      },
      {
        id: 'WO-2025-002',
        title: 'APU Starter Motor Diagnostics',
        description: 'Diagnose and resolve slow APU starter engagement',
        aircraft: 'Gulfstream G650',
        tailNumber: 'N650GS',
        priority: 'medium',
        status: 'in-progress',
        type: 'unscheduled',
        category: 'minor',
        assignedTo: ['Tom Wilson'],
        assignedShift: 'PM',
        cmpJobCard: 'JC-2025-002',
        cmpSyncRequired: false,
        estimatedHours: 4,
        actualHours: 2.5,
        startDate: new Date(now.getTime() - 2.5 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(now.getTime() + 1.5 * 60 * 60 * 1000).toISOString(),
        subTasks: [
          {
            id: 'ST-004',
            title: 'Test battery voltage',
            status: 'completed',
            assignedTo: 'Tom Wilson',
            estimatedHours: 1,
            actualHours: 0.5,
            completedBy: 'Tom Wilson',
            completedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'ST-005',
            title: 'Inspect starter motor',
            status: 'in-progress',
            assignedTo: 'Tom Wilson',
            estimatedHours: 2,
            actualHours: 2,
            signOffRequired: false
          },
          {
            id: 'ST-006',
            title: 'Clean connections',
            status: 'pending',
            estimatedHours: 1,
            actualHours: 0
          }
        ],
        createdBy: 'System',
        createdAt: new Date(now.getTime() - 2.8 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
        location: 'Ramp',
        linkedSquawks: ['SQ-2025-006'],
        lifecycleStage: {
          current: 'in-progress',
          history: [
            { stage: 'wo-created', timestamp: new Date(now.getTime() - 2.8 * 60 * 60 * 1000), performedBy: 'System' },
            { stage: 'assigned', timestamp: new Date(now.getTime() - 2.7 * 60 * 60 * 1000), performedBy: 'Lead Mechanic' },
            { stage: 'in-progress', timestamp: new Date(now.getTime() - 2.5 * 60 * 60 * 1000), performedBy: 'Tom Wilson' }
          ]
        },
        auditTrail: [],
        partsReserved: [],
        requiredInspections: [],
        completedInspections: [],
        documentLinks: [],
        notificationsSent: []
      },
      {
        id: 'WO-2025-003',
        title: 'Scheduled 100-Hour Inspection',
        description: 'Complete 100-hour inspection per maintenance manual',
        aircraft: 'Gulfstream G650',
        tailNumber: 'N652GS',
        priority: 'medium',
        status: 'assigned',
        type: 'scheduled',
        category: 'major',
        assignedTo: ['Mike Davis', 'Lisa Chen'],
        assignedShift: 'AM',
        cmpJobCard: 'JC-2025-003',
        cmpSyncRequired: true,
        estimatedHours: 16,
        actualHours: 0,
        dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        subTasks: [
          {
            id: 'ST-007',
            title: 'Engine inspection',
            status: 'pending',
            estimatedHours: 6,
            actualHours: 0,
            signOffRequired: true
          },
          {
            id: 'ST-008',
            title: 'Landing gear inspection',
            status: 'pending',
            estimatedHours: 4,
            actualHours: 0,
            signOffRequired: true
          },
          {
            id: 'ST-009',
            title: 'Flight control surfaces',
            status: 'pending',
            estimatedHours: 4,
            actualHours: 0,
            signOffRequired: true
          },
          {
            id: 'ST-010',
            title: 'Systems functional test',
            status: 'pending',
            estimatedHours: 2,
            actualHours: 0,
            signOffRequired: true
          }
        ],
        createdBy: 'Scheduling System',
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Main Hangar',
        linkedSquawks: [],
        lifecycleStage: {
          current: 'assigned',
          history: [
            { stage: 'wo-created', timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), performedBy: 'System' },
            { stage: 'assigned', timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), performedBy: 'Maintenance Manager' }
          ]
        },
        auditTrail: [],
        partsReserved: [],
        requiredInspections: [
          {
            id: 'INSP-003',
            type: 'final',
            description: 'Final inspection and sign-off',
            required: true,
            status: 'pending'
          }
        ],
        completedInspections: [],
        documentLinks: [],
        notificationsSent: []
      },
      {
        id: 'WO-2024-987',
        title: 'Cabin WiFi System Upgrade',
        description: 'Upgrade cabin WiFi system to latest firmware version',
        aircraft: 'Gulfstream G650',
        tailNumber: 'N651GS',
        priority: 'low',
        status: 'completed',
        type: 'scheduled',
        category: 'ancillary',
        assignedTo: ['Lisa Chen'],
        assignedShift: 'PM',
        cmpJobCard: 'JC-2024-987',
        cmpSyncRequired: false,
        estimatedHours: 2,
        actualHours: 1.5,
        startDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        completedDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        subTasks: [
          {
            id: 'ST-011',
            title: 'Download firmware',
            status: 'completed',
            assignedTo: 'Lisa Chen',
            estimatedHours: 0.5,
            actualHours: 0.3,
            completedBy: 'Lisa Chen',
            completedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'ST-012',
            title: 'Install firmware',
            status: 'completed',
            assignedTo: 'Lisa Chen',
            estimatedHours: 1,
            actualHours: 0.8,
            completedBy: 'Lisa Chen',
            completedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'ST-013',
            title: 'Test connectivity',
            status: 'completed',
            assignedTo: 'Lisa Chen',
            estimatedHours: 0.5,
            actualHours: 0.4,
            completedBy: 'Lisa Chen',
            completedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        createdBy: 'Maintenance Manager',
        createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Main Hangar',
        linkedSquawks: [],
        lifecycleStage: {
          current: 'completed',
          history: [
            { stage: 'wo-created', timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), performedBy: 'Maintenance Manager' },
            { stage: 'assigned', timestamp: new Date(now.getTime() - 3.5 * 24 * 60 * 60 * 1000), performedBy: 'Lead Mechanic' },
            { stage: 'in-progress', timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), performedBy: 'Lisa Chen' },
            { stage: 'completed', timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), performedBy: 'Lisa Chen' }
          ],
          mttr: 1.5
        },
        auditTrail: [],
        partsReserved: [],
        requiredInspections: [],
        completedInspections: [],
        documentLinks: [],
        notificationsSent: []
      },
      {
        id: 'WO-2024-988',
        title: 'Engine Oil Change - Engine 1',
        description: 'Scheduled engine oil change for Engine 1',
        aircraft: 'Gulfstream G650',
        tailNumber: 'N650GS',
        priority: 'high',
        status: 'completed',
        type: 'scheduled',
        category: 'minor',
        assignedTo: ['Mike Davis'],
        assignedShift: 'AM',
        cmpJobCard: 'JC-2024-988',
        cmpSyncRequired: true,
        estimatedHours: 3,
        actualHours: 2.5,
        startDate: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
        completedDate: new Date(now.getTime() - 45.5 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(now.getTime() - 45 * 60 * 60 * 1000).toISOString(),
        subTasks: [
          {
            id: 'ST-014',
            title: 'Drain old oil',
            status: 'completed',
            assignedTo: 'Mike Davis',
            estimatedHours: 1,
            actualHours: 0.8,
            completedBy: 'Mike Davis',
            completedAt: new Date(now.getTime() - 47 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'ST-015',
            title: 'Replace oil filter',
            status: 'completed',
            assignedTo: 'Mike Davis',
            estimatedHours: 0.5,
            actualHours: 0.5,
            completedBy: 'Mike Davis',
            completedAt: new Date(now.getTime() - 46.5 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'ST-016',
            title: 'Add new oil',
            status: 'completed',
            assignedTo: 'Mike Davis',
            estimatedHours: 1,
            actualHours: 0.8,
            completedBy: 'Mike Davis',
            completedAt: new Date(now.getTime() - 46 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'ST-017',
            title: 'Run-up test',
            status: 'completed',
            assignedTo: 'Mike Davis',
            estimatedHours: 0.5,
            actualHours: 0.4,
            completedBy: 'Mike Davis',
            completedAt: new Date(now.getTime() - 45.5 * 60 * 60 * 1000).toISOString(),
            signOffRequired: true
          }
        ],
        createdBy: 'Scheduling System',
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 45.5 * 60 * 60 * 1000).toISOString(),
        location: 'Ramp',
        notes: 'Used synthetic oil per maintenance manual specification',
        linkedSquawks: [],
        lifecycleStage: {
          current: 'completed',
          history: [
            { stage: 'wo-created', timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), performedBy: 'System' },
            { stage: 'assigned', timestamp: new Date(now.getTime() - 49 * 60 * 60 * 1000), performedBy: 'Lead Mechanic' },
            { stage: 'in-progress', timestamp: new Date(now.getTime() - 48 * 60 * 60 * 1000), performedBy: 'Mike Davis' },
            { stage: 'completed', timestamp: new Date(now.getTime() - 45.5 * 60 * 60 * 1000), performedBy: 'Mike Davis' }
          ],
          mttr: 2.5
        },
        auditTrail: [],
        partsReserved: [
          {
            partNumber: 'G650-ENG-OIL-FILTER',
            quantity: 1,
            description: 'Engine oil filter',
            location: 'Parts Room B',
            reserved: false
          }
        ],
        requiredInspections: [],
        completedInspections: [],
        documentLinks: [],
        notificationsSent: []
      }
    ];
  };

  const [squawks, setSquawks] = useState<Squawk[]>(generateSampleSquawks());
  const [workOrders, setWorkOrders] = useState<WorkOrderExtended[]>(generateSampleWorkOrders());
  const [mttrData, setMttrData] = useState<MTTRData>({
    byAircraft: {
      'N650GS': 18.5,
      'N651GS': 12.3,
      'N652GS': 24.7
    },
    byCategory: {
      'mechanical': 22.1,
      'electrical': 14.5,
      'avionics': 16.8,
      'cabin': 8.2
    },
    byTechnician: {
      'John Smith': 20.3,
      'Sarah Johnson': 15.7,
      'Mike Davis': 18.9,
      'Lisa Chen': 12.4,
      'Tom Wilson': 19.1
    },
    overall: 17.8,
    lastCalculated: new Date()
  });
  const [aircraftAvailability, setAircraftAvailability] = useState<AircraftAvailability[]>([]);
  const [currentUser, setCurrentUser] = useState('Current User');

  // ==================== AUDIT TRAIL ====================
  
  const createAuditEntry = (
    action: string,
    field?: string,
    oldValue?: any,
    newValue?: any,
    metadata?: any
  ): AuditEntry => ({
    id: `AUDIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    userId: 'USER-001',
    userName: currentUser,
    action,
    field,
    oldValue,
    newValue,
    ipAddress: '192.168.1.100', // In production, get actual IP
    metadata
  });

  // ==================== LIFECYCLE ====================
  
  const createLifecycleStage = (initial: string): LifecycleStage => ({
    current: initial as any,
    history: [{
      stage: initial,
      timestamp: new Date(),
      performedBy: currentUser,
      automated: false
    }]
  });

  const updateLifecycleStage = (
    lifecycle: LifecycleStage,
    newStage: string,
    notes?: string
  ): LifecycleStage => ({
    ...lifecycle,
    current: newStage as any,
    history: [
      ...lifecycle.history,
      {
        stage: newStage,
        timestamp: new Date(),
        performedBy: currentUser,
        notes,
        automated: false
      }
    ]
  });

  // ==================== SQUAWK OPERATIONS ====================
  
  const addSquawk = (squawkData: Omit<Squawk, 'id' | 'lifecycleStage' | 'auditTrail'>) => {
    const newSquawk: Squawk = {
      ...squawkData,
      id: `SQ-${Date.now()}`,
      lifecycleStage: createLifecycleStage('reported'),
      auditTrail: [createAuditEntry('Squawk created')]
    };

    setSquawks(prev => [...prev, newSquawk]);

    // Priority-based routing: Alert DOM and Lead Inspector for major squawks
    if (newSquawk.priority === 'critical' || newSquawk.priority === 'high') {
      sendNotification({
        type: 'critical',
        recipient: 'DOM',
        recipientRole: 'Director of Maintenance',
        message: `${newSquawk.priority.toUpperCase()} Priority Squawk Reported: ${newSquawk.description.substring(0, 100)}`,
        actionRequired: 'Review and assign',
        relatedEntity: 'squawk',
        relatedEntityId: newSquawk.id
      });

      sendNotification({
        type: 'critical',
        recipient: 'Lead Inspector',
        recipientRole: 'Lead Inspector',
        message: `${newSquawk.priority.toUpperCase()} Priority Squawk Reported on ${newSquawk.aircraftTail}: ${newSquawk.description.substring(0, 100)}`,
        actionRequired: 'Inspection may be required',
        relatedEntity: 'squawk',
        relatedEntityId: newSquawk.id
      });

      toast.error(`${newSquawk.priority.toUpperCase()} Priority Squawk`, {
        description: 'DOM and Lead Inspector have been notified'
      });
    }

    // Detect patterns after adding squawk
    setTimeout(() => detectPatterns(), 500);
  };

  const updateSquawk = (id: string, updates: Partial<Squawk>) => {
    setSquawks(prev => prev.map(squawk => {
      if (squawk.id === id) {
        const auditEntries = Object.keys(updates).map(key =>
          createAuditEntry(`Updated ${key}`, key, squawk[key as keyof Squawk], updates[key as keyof Partial<Squawk>])
        );

        return {
          ...squawk,
          ...updates,
          auditTrail: [...squawk.auditTrail, ...auditEntries]
        };
      }
      return squawk;
    }));
  };

  const deleteSquawk = (id: string) => {
    setSquawks(prev => prev.filter(s => s.id !== id));
  };

  // ==================== WORK ORDER OPERATIONS ====================
  
  const addWorkOrder = (woData: Omit<WorkOrderExtended, 'id' | 'lifecycleStage' | 'auditTrail' | 'notificationsSent'>) => {
    const newWO: WorkOrderExtended = {
      ...woData,
      id: `WO-${Date.now()}`,
      lifecycleStage: createLifecycleStage('wo-created'),
      auditTrail: [createAuditEntry('Work Order created')],
      notificationsSent: []
    };

    setWorkOrders(prev => [...prev, newWO]);

    // Update linked squawks
    if (newWO.linkedSquawks.length > 0) {
      newWO.linkedSquawks.forEach(squawkId => {
        updateSquawk(squawkId, {
          workOrderId: newWO.id,
          lifecycleStage: updateLifecycleStage(
            squawks.find(s => s.id === squawkId)?.lifecycleStage || createLifecycleStage('reported'),
            'wo-created',
            `Work Order ${newWO.id} created`
          )
        });
      });
    }
  };

  const updateWorkOrder = (id: string, updates: Partial<WorkOrderExtended>) => {
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === id) {
        const auditEntries = Object.keys(updates).map(key =>
          createAuditEntry(`Updated ${key}`, key, wo[key as keyof WorkOrderExtended], updates[key as keyof Partial<WorkOrderExtended>])
        );

        // Check for completion and notify
        if (updates.status === 'completed' && wo.status !== 'completed') {
          // Check if this was a major issue
          const linkedSquawk = squawks.find(s => s.id === wo.linkedSquawks[0]);
          if (linkedSquawk && (linkedSquawk.priority === 'critical' || linkedSquawk.priority === 'high')) {
            sendNotification({
              type: 'info',
              recipient: 'DOM',
              recipientRole: 'Director of Maintenance',
              message: `Major Work Order ${wo.id} completed on ${wo.tailNumber}`,
              actionRequired: 'Review completion',
              relatedEntity: 'workorder',
              relatedEntityId: wo.id
            });

            sendNotification({
              type: 'info',
              recipient: 'Lead Inspector',
              recipientRole: 'Lead Inspector',
              message: `Major Work Order ${wo.id} completed on ${wo.tailNumber}`,
              actionRequired: 'Final inspection completed',
              relatedEntity: 'workorder',
              relatedEntityId: wo.id
            });
          }
        }

        return {
          ...wo,
          ...updates,
          auditTrail: [...wo.auditTrail, ...auditEntries],
          updatedAt: new Date().toISOString()
        };
      }
      return wo;
    }));
  };

  const deleteWorkOrder = (id: string) => {
    setWorkOrders(prev => prev.filter(wo => wo.id !== id));
  };

  // ==================== MULTI-SQUAWK WORK ORDERS ====================
  
  const createWorkOrderFromSquawks = (squawkIds: string[], workOrderData: any) => {
    const linkedSquawks = squawks.filter(s => squawkIds.includes(s.id));
    
    const combinedDescription = linkedSquawks.map(s => 
      `[${s.id}] ${s.description}`
    ).join('\n\n');

    const highestPriority = linkedSquawks.reduce((highest, squawk) => {
      const priorities = ['low', 'medium', 'high', 'critical'];
      return priorities.indexOf(squawk.priority) > priorities.indexOf(highest) ? squawk.priority : highest;
    }, 'low');

    const newWO: Omit<WorkOrderExtended, 'id' | 'lifecycleStage' | 'auditTrail' | 'notificationsSent'> = {
      title: workOrderData.title || `Combined Work Order - ${linkedSquawks.length} squawks`,
      description: combinedDescription,
      aircraft: linkedSquawks[0].aircraftTail,
      tailNumber: linkedSquawks[0].aircraftTail,
      priority: highestPriority as any,
      status: 'pending',
      type: workOrderData.type || 'unscheduled',
      category: workOrderData.category || 'minor',
      assignedTo: [],
      cmpSyncRequired: false,
      estimatedHours: workOrderData.estimatedHours || linkedSquawks.length * 2,
      actualHours: 0,
      dueDate: workOrderData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      subTasks: [],
      createdBy: currentUser,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      location: workOrderData.location || 'Hangar 1',
      linkedSquawks: squawkIds,
      partsReserved: [],
      requiredInspections: [],
      completedInspections: [],
      documentLinks: [],
      notificationsSent: []
    };

    addWorkOrder(newWO);

    toast.success('Multi-Squawk Work Order Created', {
      description: `Combined ${linkedSquawks.length} squawks into work order`
    });
  };

  // ==================== PARTS INTEGRATION ====================
  
  const reserveParts = (workOrderId: string, parts: PartUsed[]) => {
    const reservedParts = parts.map(part => ({
      ...part,
      reserved: true,
      reservedAt: new Date(),
      reservedBy: currentUser
    }));

    updateWorkOrder(workOrderId, {
      partsReserved: reservedParts
    });

    toast.success('Parts Reserved', {
      description: `${parts.length} parts reserved for work order`
    });
  };

  // ==================== INSPECTION CHECKPOINTS ====================
  
  const completeInspection = (workOrderId: string, checkpointId: string, inspectionData: any) => {
    const wo = workOrders.find(w => w.id === workOrderId);
    if (!wo) return;

    const completedInspection: CompletedInspection = {
      checkpointId,
      inspector: inspectionData.inspector,
      inspectorRole: inspectionData.inspectorRole,
      completedAt: new Date(),
      signOffData: inspectionData.signOffData,
      findings: inspectionData.findings,
      passed: inspectionData.passed
    };

    updateWorkOrder(workOrderId, {
      completedInspections: [...wo.completedInspections, completedInspection]
    });

    toast.success('Inspection Completed', {
      description: `Inspection signed off by ${inspectionData.inspector}`
    });
  };

  // ==================== DOCUMENT CENTER LINKS ====================
  
  const linkDocumentsToWorkOrder = (workOrderId: string, ataChapter: string) => {
    const wo = workOrders.find(w => w.id === workOrderId);
    if (!wo) return;

    // Simulate linking relevant documents based on ATA chapter
    const mockDocuments: DocumentLink[] = [
      {
        id: `DOC-${Date.now()}-1`,
        documentId: `MAN-${ataChapter}`,
        documentTitle: `Maintenance Manual - ATA ${ataChapter}`,
        documentType: 'manual',
        ataChapter,
        linkedAt: new Date(),
        linkedBy: currentUser
      },
      {
        id: `DOC-${Date.now()}-2`,
        documentId: `PROC-${ataChapter}`,
        documentTitle: `Procedures - ATA ${ataChapter}`,
        documentType: 'procedure',
        ataChapter,
        linkedAt: new Date(),
        linkedBy: currentUser
      }
    ];

    updateWorkOrder(workOrderId, {
      documentLinks: [...wo.documentLinks, ...mockDocuments]
    });
  };

  // ==================== AIRWORTHINESS RELEASE ====================
  
  const generateAirworthinessRelease = (workOrderId: string, releaseData: any) => {
    const wo = workOrders.find(w => w.id === workOrderId);
    if (!wo) return;

    // Check all mandatory inspections are complete
    const allInspectionsComplete = wo.requiredInspections.every(req =>
      wo.completedInspections.some(comp => comp.checkpointId === req.id && comp.passed)
    );

    if (!allInspectionsComplete) {
      toast.error('Cannot Release Aircraft', {
        description: 'All mandatory inspections must be completed and passed'
      });
      return;
    }

    const release: AirworthinessRelease = {
      id: `RTS-${Date.now()}`,
      workOrderId,
      aircraftTail: wo.tailNumber,
      releasedBy: currentUser,
      releasedAt: new Date(),
      signOffData: releaseData.signOffData,
      maintenancePerformed: wo.description,
      certificateNumber: `AWR-${Date.now()}`,
      returnToService: true,
      discrepancies: releaseData.discrepancies || [],
      limitations: releaseData.limitations || []
    };

    updateWorkOrder(workOrderId, {
      airworthinessRelease: release,
      status: 'completed',
      completedDate: new Date().toISOString()
    });

    // Update linked squawks to closed
    wo.linkedSquawks.forEach(squawkId => {
      updateSquawk(squawkId, {
        status: 'closed',
        closedBy: currentUser,
        closedAt: new Date()
      });
    });

    toast.success('Airworthiness Release Generated', {
      description: `Aircraft ${wo.tailNumber} returned to service`
    });
  };

  // ==================== PATTERN DETECTION ====================
  
  const detectPatterns = () => {
    const patterns: Map<string, Squawk[]> = new Map();

    // Group squawks by ATA chapter
    squawks.forEach(squawk => {
      if (squawk.status !== 'closed') {
        const key = `${squawk.ataChapter}-${squawk.aircraftTail}`;
        if (!patterns.has(key)) {
          patterns.set(key, []);
        }
        patterns.get(key)!.push(squawk);
      }
    });

    // Detect recurring issues (3+ similar squawks in 30 days)
    patterns.forEach((similarSquawks, key) => {
      if (similarSquawks.length >= 3) {
        const recentSquawks = similarSquawks.filter(s => {
          const daysSince = (new Date().getTime() - s.reportedAt.getTime()) / (1000 * 60 * 60 * 24);
          return daysSince <= 30;
        });

        if (recentSquawks.length >= 3) {
          recentSquawks.forEach(squawk => {
            if (!squawk.patternDetected) {
              const patternInfo: PatternInfo = {
                detectedAt: new Date(),
                similarSquawks: recentSquawks.map(s => s.id),
                ataChapter: squawk.ataChapter,
                aircraft: squawk.aircraftTail,
                frequency: recentSquawks.length,
                recommendation: 'Recommend deeper investigation - recurring issue detected'
              };

              updateSquawk(squawk.id, {
                patternDetected: true,
                patternInfo,
                relatedSquawks: recentSquawks.map(s => s.id).filter(id => id !== squawk.id)
              });
            }
          });

          // Notify maintenance leadership
          sendNotification({
            type: 'warning',
            recipient: 'DOM',
            recipientRole: 'Director of Maintenance',
            message: `Recurring issue pattern detected: ${recentSquawks.length} similar squawks on ATA ${recentSquawks[0].ataChapter}`,
            actionRequired: 'Investigate root cause',
            relatedEntity: 'pattern',
            relatedEntityId: key
          });
        }
      }
    });
  };

  // ==================== MTTR CALCULATION ====================
  
  const calculateMTTR = () => {
    const completedWOs = workOrders.filter(wo => wo.status === 'completed' && wo.startDate && wo.completedDate);

    const byAircraft: { [key: string]: number[] } = {};
    const byCategory: { [key: string]: number[] } = {};
    const byTechnician: { [key: string]: number[] } = {};
    const allMTTRs: number[] = [];

    completedWOs.forEach(wo => {
      if (wo.startDate && wo.completedDate) {
        const mttr = (new Date(wo.completedDate).getTime() - new Date(wo.startDate).getTime()) / (1000 * 60 * 60);
        
        allMTTRs.push(mttr);

        if (!byAircraft[wo.tailNumber]) byAircraft[wo.tailNumber] = [];
        byAircraft[wo.tailNumber].push(mttr);

        if (!byCategory[wo.category]) byCategory[wo.category] = [];
        byCategory[wo.category].push(mttr);

        wo.assignedTo.forEach(tech => {
          if (!byTechnician[tech]) byTechnician[tech] = [];
          byTechnician[tech].push(mttr);
        });
      }
    });

    const calculateAverage = (values: number[]) => 
      values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;

    setMttrData({
      byAircraft: Object.fromEntries(
        Object.entries(byAircraft).map(([k, v]) => [k, calculateAverage(v)])
      ),
      byCategory: Object.fromEntries(
        Object.entries(byCategory).map(([k, v]) => [k, calculateAverage(v)])
      ),
      byTechnician: Object.fromEntries(
        Object.entries(byTechnician).map(([k, v]) => [k, calculateAverage(v)])
      ),
      overall: calculateAverage(allMTTRs),
      lastCalculated: new Date()
    });
  };

  // ==================== AIRCRAFT AVAILABILITY ====================
  
  const updateAircraftAvailability = () => {
    const aircraftMap = new Map<string, Squawk[]>();

    squawks.forEach(squawk => {
      if (squawk.status !== 'closed') {
        if (!aircraftMap.has(squawk.aircraftTail)) {
          aircraftMap.set(squawk.aircraftTail, []);
        }
        aircraftMap.get(squawk.aircraftTail)!.push(squawk);
      }
    });

    const availability: AircraftAvailability[] = [];

    aircraftMap.forEach((squawkList, tail) => {
      const criticalSquawks = squawkList.filter(s => s.priority === 'critical').length;
      const openSquawks = squawkList.filter(s => s.status === 'open').length;
      const deferredSquawks = squawkList.filter(s => s.status === 'deferred').length;

      const hasAOG = squawkList.some(s => s.priority === 'critical' && s.status !== 'deferred');
      const limitations: string[] = [];

      squawkList.forEach(s => {
        if (s.deferral) {
          limitations.push(...s.deferral.operationalLimitations);
        }
      });

      const status = hasAOG ? 'grounded' : limitations.length > 0 ? 'limited' : 'available';

      availability.push({
        aircraftId: squawkList[0].aircraftId,
        tail,
        status,
        openSquawks,
        criticalSquawks,
        deferredSquawks,
        currentLimitations: [...new Set(limitations)],
        estimatedReturnToService: hasAOG ? new Date(Date.now() + 12 * 60 * 60 * 1000) : undefined
      });
    });

    setAircraftAvailability(availability);
  };

  // ==================== NOTIFICATIONS ====================
  
  const sendNotification = (notificationData: Omit<Notification, 'id' | 'sentAt' | 'read'>) => {
    const notification: Notification = {
      ...notificationData,
      id: `NOTIF-${Date.now()}`,
      sentAt: new Date(),
      read: false
    };

    // In production, this would integrate with push notification service
    console.log('Push Notification Sent:', notification);

    // Show toast for critical notifications
    if (notification.type === 'critical') {
      toast.error(notification.message, {
        description: `To: ${notification.recipient}`,
        duration: 10000
      });
    } else if (notification.type === 'warning') {
      toast.warning(notification.message, {
        description: `To: ${notification.recipient}`,
        duration: 7000
      });
    } else {
      toast.info(notification.message, {
        description: `To: ${notification.recipient}`
      });
    }
  };

  // ==================== EFFECTS ====================
  
  useEffect(() => {
    // Recalculate MTTR when work orders change
    calculateMTTR();
  }, [workOrders]);

  useEffect(() => {
    // Update aircraft availability when squawks change
    updateAircraftAvailability();
  }, [squawks]);

  // ==================== CONTEXT VALUE ====================
  
  const value: MaintenanceContextType = {
    squawks,
    workOrders,
    mttrData,
    aircraftAvailability,
    
    addSquawk,
    updateSquawk,
    deleteSquawk,
    
    addWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
    
    createWorkOrderFromSquawks,
    linkDocumentsToWorkOrder,
    reserveParts,
    completeInspection,
    generateAirworthinessRelease,
    
    detectPatterns,
    calculateMTTR,
    updateAircraftAvailability,
    
    sendNotification,
    
    currentUser,
    setCurrentUser
  };

  return (
    <MaintenanceContext.Provider value={value}>
      {children}
    </MaintenanceContext.Provider>
  );
};
