import React from 'react';
import { VacationRequestSystem } from './VacationRequestSystem';
import { VacationSchedulingApprovals } from './VacationSchedulingApprovals';
import { VacationManagerReview } from './VacationManagerReview';
import { VacationMasterCalendar } from './VacationMasterCalendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface VacationRequestProps {
  userRole: string;
}

export default function VacationRequest({ userRole }: VacationRequestProps) {
  // For pilots and inflight crew - show the request system
  if (userRole === 'pilot' || userRole === 'inflight') {
    return <VacationRequestSystem />;
  }

  // For scheduling role - show all tabs
  if (userRole === 'scheduling' || userRole === 'admin') {
    return (
      <div className="p-6">
        <Tabs defaultValue="approvals">
          <TabsList className="mb-6">
            <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
            <TabsTrigger value="manager">Manager Review</TabsTrigger>
            <TabsTrigger value="calendar">Master Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="approvals">
            <VacationSchedulingApprovals />
          </TabsContent>

          <TabsContent value="manager">
            <VacationManagerReview />
          </TabsContent>

          <TabsContent value="calendar">
            <VacationMasterCalendar />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // For lead/manager role - show manager review and calendar
  if (userRole === 'lead') {
    return (
      <div className="p-6">
        <Tabs defaultValue="review">
          <TabsList className="mb-6">
            <TabsTrigger value="review">Manager Review</TabsTrigger>
            <TabsTrigger value="calendar">Master Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="review">
            <VacationManagerReview />
          </TabsContent>

          <TabsContent value="calendar">
            <VacationMasterCalendar />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Default view for other roles - just show the calendar
  return <VacationMasterCalendar />;
}
