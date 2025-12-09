import React from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import { WORKFLOW_STAGES } from '../../contexts/HazardContext';

interface ProgressTrackerProps {
    currentStage: string;
    onStageClick?: (stage: string) => void;
}

const STAGE_ORDER = [
    { key: 'SUBMITTED', label: 'Submitted', short: 'Submit' },
    { key: 'SM_INITIAL_REVIEW', label: 'Safety Review', short: 'Review' },
    { key: 'ASSIGNED_CORRECTIVE_ACTION', label: 'Corrective Action', short: 'Action' },
    { key: 'SM_CA_REVIEW', label: 'SM Review', short: 'SM Review' },
    { key: 'LINE_MANAGER_APPROVAL', label: 'Line Manager', short: 'LM Approval' },
    { key: 'EXEC_APPROVAL', label: 'Executive', short: 'Exec Approval' },
    { key: 'IMPLEMENTATION_ASSIGNMENT', label: 'Assignment', short: 'Assign' },
    { key: 'IMPLEMENTATION_IN_PROGRESS', label: 'Implementation', short: 'Implement' },
    { key: 'PUBLISHED', label: 'Published', short: 'Publish' },
    { key: 'EFFECTIVENESS_REVIEW', label: 'Effectiveness', short: 'Review' },
    { key: 'CLOSED', label: 'Closed', short: 'Close' }
];

export default function ProgressTracker({ currentStage, onStageClick }: ProgressTrackerProps) {
    const currentIndex = STAGE_ORDER.findIndex(s => WORKFLOW_STAGES[s.key as keyof typeof WORKFLOW_STAGES] === currentStage);

    return (
        <div className="w-full bg-white border rounded-lg p-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Workflow Progress</h3>

            {/* Desktop view */}
            <div className="hidden md:flex items-center justify-between">
                {STAGE_ORDER.map((stage, index) => {
                    const stageValue = WORKFLOW_STAGES[stage.key as keyof typeof WORKFLOW_STAGES];
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    const isClickable = isCompleted || isCurrent;

                    return (
                        <React.Fragment key={stage.key}>
                            <div className="flex flex-col items-center flex-1">
                                <button
                                    onClick={() => isClickable && onStageClick?.(stageValue)}
                                    disabled={!isClickable}
                                    className={`
                    relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                    ${isCompleted ? 'bg-green-500 border-green-500 text-white' : ''}
                    ${isCurrent ? 'bg-blue-500 border-blue-500 text-white animate-pulse' : ''}
                    ${!isCompleted && !isCurrent ? 'bg-gray-100 border-gray-300 text-gray-400' : ''}
                    ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed'}
                  `}
                                >
                                    {isCompleted && <CheckCircle className="w-5 h-5" />}
                                    {isCurrent && <Clock className="w-5 h-5" />}
                                    {!isCompleted && !isCurrent && <Circle className="w-5 h-5" />}
                                </button>
                                <span className={`
                  mt-2 text-xs text-center max-w-[80px]
                  ${isCurrent ? 'font-semibold text-blue-600' : ''}
                  ${isCompleted ? 'text-gray-700' : 'text-gray-400'}
                `}>
                                    {stage.short}
                                </span>
                            </div>

                            {index < STAGE_ORDER.length - 1 && (
                                <div className={`
                  flex-1 h-0.5 mx-2 transition-all
                  ${index < currentIndex ? 'bg-green-500' : 'bg-gray-300'}
                `} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Mobile view */}
            <div className="md:hidden space-y-3">
                {STAGE_ORDER.map((stage, index) => {
                    const stageValue = WORKFLOW_STAGES[stage.key as keyof typeof WORKFLOW_STAGES];
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    const isClickable = isCompleted || isCurrent;

                    return (
                        <button
                            key={stage.key}
                            onClick={() => isClickable && onStageClick?.(stageValue)}
                            disabled={!isClickable}
                            className={`
                w-full flex items-center gap-3 p-3 rounded-lg border transition-all
                ${isCompleted ? 'bg-green-50 border-green-200' : ''}
                ${isCurrent ? 'bg-blue-50 border-blue-500 border-2' : ''}
                ${!isCompleted && !isCurrent ? 'bg-gray-50 border-gray-200' : ''}
                ${isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-not-allowed opacity-60'}
              `}
                        >
                            <div className={`
                flex items-center justify-center w-8 h-8 rounded-full
                ${isCompleted ? 'bg-green-500 text-white' : ''}
                ${isCurrent ? 'bg-blue-500 text-white' : ''}
                ${!isCompleted && !isCurrent ? 'bg-gray-300 text-gray-500' : ''}
              `}>
                                {isCompleted && <CheckCircle className="w-4 h-4" />}
                                {isCurrent && <Clock className="w-4 h-4" />}
                                {!isCompleted && !isCurrent && <Circle className="w-4 h-4" />}
                            </div>
                            <span className={`
                text-sm flex-1 text-left
                ${isCurrent ? 'font-semibold text-blue-600' : ''}
                ${isCompleted ? 'text-gray-700' : 'text-gray-400'}
              `}>
                                {stage.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
