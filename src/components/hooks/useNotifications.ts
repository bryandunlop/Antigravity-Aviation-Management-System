import { useState, useEffect, useCallback } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'task' | 'audit' | 'fuel' | 'maintenance' | 'safety' | 'passenger' | 'schedule' | 'document' | 'system' | 'nas_impact' | 'trip';
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
  module: string;
  relatedId?: string;
  daysUntilDue?: number;
  assignedBy?: string;
}

interface UseNotificationsOptions {
  userRole: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useNotifications = ({ userRole, autoRefresh = true, refreshInterval = 30000 }: UseNotificationsOptions) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate notifications based on user role
  const generateNotifications = useCallback((): Notification[] => {
    // In a real application, this would be an API call
    const baseNotifications: Notification[] = [
      // NAS Impact notifications
      {
        id: 'NAS001',
        title: 'Ground Stop at LGA - Flight FO004 Affected',
        message: 'Flight FO004 (ORD→LGA) impacted by thunderstorm ground stop at LGA',
        type: 'nas_impact',
        priority: 'critical',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        isRead: false,
        actionUrl: '/',
        actionText: 'View Impact Details',
        module: 'NAS Status',
        relatedId: 'FO004'
      },
      {
        id: 'NAS002',
        title: 'Ground Delays at JFK - Flight FO002 Affected',
        message: 'Flight FO002 (JFK→MIA) facing 45-minute average delays due to volume/weather',
        type: 'nas_impact',
        priority: 'high',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        isRead: false,
        actionUrl: '/',
        actionText: 'Update Passengers',
        module: 'NAS Status',
        relatedId: 'FO002'
      },
      {
        id: 'NAS003',
        title: 'East Coast GDP Active - Multiple Flights Affected',
        message: 'Ground Delay Program active affecting flights FO002, FO004, FO005',
        type: 'nas_impact',
        priority: 'high',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        isRead: false,
        actionUrl: '/',
        actionText: 'Review Flight Plans',
        module: 'NAS Status',
        relatedId: 'GDP001'
      },
      // Trip coordination notifications
      {
        id: 'TRIP001',
        title: 'Trip Checklist Item Due Today',
        message: 'TRP-2025-001: File international flight plans due today',
        type: 'trip',
        priority: 'critical',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        isRead: false,
        actionUrl: '/trip-coordination',
        actionText: 'View Trip',
        module: 'Trip Coordination',
        relatedId: 'TRP-2025-001',
        daysUntilDue: 0,
        assignedBy: 'Sarah Chen'
      },
      {
        id: 'TRIP002',
        title: 'Trip Checklist Item Overdue',
        message: 'TRP-2025-001: Confirm passenger dietary requirements is overdue',
        type: 'trip',
        priority: 'high',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        actionUrl: '/trip-coordination',
        actionText: 'Complete Task',
        module: 'Trip Coordination',
        relatedId: 'TRP-2025-001',
        daysUntilDue: -1,
        assignedBy: 'Sarah Chen'
      },
      {
        id: 'TRIP003',
        title: 'VIP Trip Coordination Required',
        message: 'TRP-2025-001: VIP trip requires additional security arrangements',
        type: 'trip',
        priority: 'high',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        actionUrl: '/trip-coordination',
        actionText: 'Review Requirements',
        module: 'Trip Coordination',
        relatedId: 'TRP-2025-001'
      },
      {
        id: 'TRIP004',
        title: 'Medical Equipment Clearance Required',
        message: 'TRP-2025-003: Medical equipment requires customs pre-clearance',
        type: 'trip',
        priority: 'critical',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        actionUrl: '/trip-coordination',
        actionText: 'Handle Clearance',
        module: 'Trip Coordination',
        relatedId: 'TRP-2025-003',
        daysUntilDue: 3,
        assignedBy: 'Lisa Thompson'
      },
      // Existing notifications
      {
        id: 'NOTIF001',
        title: 'Task Due Tomorrow',
        message: 'Complete 100-hour inspection on N123AB is due tomorrow',
        type: 'task',
        priority: 'high',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        actionUrl: '/assigned-tasks',
        actionText: 'View Task',
        module: 'Maintenance',
        relatedId: 'TASK001',
        daysUntilDue: 1,
        assignedBy: 'Chief Maintenance Officer'
      },
      {
        id: 'NOTIF002',
        title: 'Overdue Task',
        message: 'Document compliance review is 2 days overdue',
        type: 'task',
        priority: 'critical',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        actionUrl: '/assigned-tasks',
        actionText: 'Complete Now',
        module: 'Document Center',
        relatedId: 'TASK008',
        daysUntilDue: -2,
        assignedBy: 'Compliance Officer'
      },
      {
        id: 'NOTIF003',
        title: 'Fuel Load Request Response',
        message: 'Flight FLT001 fuel request approved: 2,400 lbs',
        type: 'fuel',
        priority: 'medium',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        isRead: userRole !== 'pilot',
        actionUrl: '/fuel-load-request',
        actionText: 'View Details',
        module: 'Fuel Management',
        relatedId: 'FUEL001'
      },
      {
        id: 'NOTIF004',
        title: 'Fuel Load Request Rejected',
        message: 'Flight FLT003 fuel request requires revision - excess weight',
        type: 'fuel',
        priority: 'high',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        actionUrl: '/fuel-load-request',
        actionText: 'Revise Request',
        module: 'Fuel Management',
        relatedId: 'FUEL003'
      },
      {
        id: 'NOTIF005',
        title: 'Safety Audit Assigned',
        message: 'Ground operations safety audit assigned - due Feb 15',
        type: 'audit',
        priority: 'high',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        actionUrl: '/safety/audits',
        actionText: 'Start Audit',
        module: 'Safety',
        relatedId: 'AUDIT001',
        daysUntilDue: 10,
        assignedBy: 'Safety Manager'
      },
      {
        id: 'NOTIF006',
        title: 'Aircraft AOG Status',
        message: 'N456CD hydraulic system failure - aircraft grounded',
        type: 'maintenance',
        priority: 'critical',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        actionUrl: '/aog-management',
        actionText: 'View AOG',
        module: 'Maintenance',
        relatedId: 'AOG001'
      },
      {
        id: 'NOTIF007',
        title: 'VIP Passenger Alert',
        message: 'Critical allergy information updated for passenger Johnson',
        type: 'passenger',
        priority: 'critical',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        isRead: false,
        actionUrl: '/passenger-database',
        actionText: 'Review Alert',
        module: 'Passenger Services',
        relatedId: 'PASS001'
      },
      {
        id: 'NOTIF008',
        title: 'Schedule Change',
        message: 'Flight FLT002 delayed 2 hours due to weather',
        type: 'schedule',
        priority: 'medium',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        isRead: true,
        actionUrl: '/schedule',
        actionText: 'View Schedule',
        module: 'Scheduling',
        relatedId: 'SCH001'
      },
      {
        id: 'NOTIF009',
        title: 'Crew Assignment',
        message: 'You have been assigned to Flight FLT007 on Feb 8',
        type: 'schedule',
        priority: 'high',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        actionUrl: '/schedule',
        actionText: 'Confirm Assignment',
        module: 'Scheduling',
        relatedId: 'SCH002'
      },
      {
        id: 'NOTIF010',
        title: 'Document Expires Soon',
        message: 'Safety manual revision 3.2 expires in 5 days',
        type: 'document',
        priority: 'medium',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        actionUrl: '/documents',
        actionText: 'Review Document',
        module: 'Document Center',
        relatedId: 'DOC001',
        daysUntilDue: 5
      },
      {
        id: 'NOTIF011',
        title: 'Catering Request Update',
        message: 'Special dietary requirements confirmed for Flight FLT005',
        type: 'passenger',
        priority: 'medium',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        isRead: true,
        actionUrl: '/catering-tracker',
        actionText: 'View Catering',
        module: 'Passenger Services',
        relatedId: 'CAT001'
      },
      {
        id: 'NOTIF012',
        title: 'Maintenance Complete',
        message: 'N789EF annual inspection completed and signed off',
        type: 'maintenance',
        priority: 'low',
        timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        isRead: true,
        actionUrl: '/maintenance',
        actionText: 'View Report',
        module: 'Maintenance',
        relatedId: 'MAINT001'
      }
    ];

    // Filter notifications based on user role
    const roleNotifications = {
      'pilot': ['task', 'fuel', 'schedule', 'document', 'system', 'safety', 'nas_impact'],
      'maintenance': ['task', 'maintenance', 'audit', 'document', 'system', 'nas_impact'],
      'inflight': ['task', 'passenger', 'schedule', 'document', 'system', 'nas_impact'],
      'safety': ['task', 'audit', 'safety', 'document', 'system', 'nas_impact'],
      'scheduling': ['task', 'schedule', 'trip', 'document', 'system', 'nas_impact'],
      'admin': ['task', 'audit', 'fuel', 'maintenance', 'safety', 'passenger', 'schedule', 'trip', 'document', 'system', 'nas_impact'],
      'lead': ['task', 'audit', 'fuel', 'maintenance', 'safety', 'passenger', 'schedule', 'trip', 'document', 'system', 'nas_impact'],
      'admin-assistant': ['task', 'passenger', 'schedule', 'trip', 'document', 'system'],
      'document-manager': ['task', 'document', 'system']
    };

    const allowedTypes = roleNotifications[userRole as keyof typeof roleNotifications] || [];
    return baseNotifications.filter(notif => allowedTypes.includes(notif.type));
  }, [userRole]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newNotifications = generateNotifications();
      setNotifications(newNotifications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [generateNotifications]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
    
    // In a real app, this would also make an API call to persist the change
    console.log('Marked as read:', notificationId);
  }, []);

  // Mark notification as unread
  const markAsUnread = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: false } : n)
    );
    
    // In a real app, this would also make an API call to persist the change
    console.log('Marked as unread:', notificationId);
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    
    // In a real app, this would also make an API call to persist the change
    console.log('Marked all as read');
  }, []);

  // Delete notification
  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    
    // In a real app, this would also make an API call to persist the change
    console.log('Deleted notification:', notificationId);
  }, []);

  // Add new notification (for real-time updates)
  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `NOTIF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setNotifications(prev => [newNotification, ...prev]);
    
    console.log('Added notification:', newNotification.id);
  }, []);

  // Get notification counts
  const getNotificationCounts = useCallback(() => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    const highPriorityCount = notifications.filter(n => 
      (n.priority === 'high' || n.priority === 'critical') && !n.isRead
    ).length;
    const criticalCount = notifications.filter(n => 
      n.priority === 'critical' && !n.isRead
    ).length;
    
    return {
      total: notifications.length,
      unread: unreadCount,
      highPriority: highPriorityCount,
      critical: criticalCount
    };
  }, [notifications]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchNotifications, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchNotifications]);

  return {
    notifications,
    loading,
    error,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    addNotification,
    refetch: fetchNotifications,
    counts: getNotificationCounts()
  };
};