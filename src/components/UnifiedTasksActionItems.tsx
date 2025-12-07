import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Progress } from './ui/progress';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { toast } from 'sonner@2.0.3';
import { 
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  MessageSquare,
  Eye,
  Users,
  Activity,
  Target,
  TrendingUp,
  User,
  Calendar,
  UserPlus,
  Star,
  Share2,
  History,
  Edit,
  Trash2,
  CheckCheck,
  Settings
} from 'lucide-react';

// Import existing types and utilities from ActionItems
import { ActionItemsProps, ActionItem, NewItemForm } from './ActionItems/types';
import { MOCK_ACTION_ITEMS } from './ActionItems/constants';
import { getBorderColor, formatDate, getUserActionItems, getStats } from './ActionItems/utils';

// Import Action Item dialogs
import DetailsDialog from './ActionItems/DetailsDialog';
import UpdateProgressDialog from './ActionItems/UpdateProgressDialog';

interface PersonalTask {
  id: string;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
  dueDate: string;
  createdDate: string;
  progress: number;
  tags: string[];
  collaborators: Array<{
    id: string;
    name: string;
    role: string;
    avatar: string;
  }>;
  sections: Array<{
    name: string;
    status: 'pending' | 'in-progress' | 'completed';
    progress: number;
  }>;
  sectionsComplete: number;
  totalSections: number;
  notes?: string;
  isPersonal: true;
}

interface UnifiedTasksActionItemsProps {
  userRole: string;
}

export default function UnifiedTasksActionItems({ userRole }: UnifiedTasksActionItemsProps) {
  const [activeTab, setActiveTab] = useState('action-items');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  // Action Items states
  const [selectedActionItem, setSelectedActionItem] = useState<ActionItem | null>(null);
  const [isActionItemDialogOpen, setIsActionItemDialogOpen] = useState(false);
  const [isUpdateProgressDialogOpen, setIsUpdateProgressDialogOpen] = useState(false);
  const [updatingActionItem, setUpdatingActionItem] = useState<ActionItem | null>(null);
  
  // UpdateProgressDialog specific states
  const [updatedSections, setUpdatedSections] = useState<Array<{ name: string; status: string }>>([]);
  const [updateComment, setUpdateComment] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Personal Tasks states  
  const [isUpdatePersonalTaskProgressOpen, setIsUpdatePersonalTaskProgressOpen] = useState(false);
  const [updatingPersonalTask, setUpdatingPersonalTask] = useState<PersonalTask | null>(null);
  const [personalTasks, setPersonalTasks] = useState<PersonalTask[]>([
    {
      id: 'PT001',
      title: 'Review updated safety procedures manual',
      description: 'Study the new safety procedures manual and complete online certification',
      priority: 'Medium',
      status: 'In Progress',
      dueDate: '2025-09-25',
      createdDate: '2025-09-10',
      progress: 45,
      tags: ['Training', 'Safety', 'Certification'],
      collaborators: [
        { id: 'me', name: 'You', role: userRole, avatar: 'ME' }
      ],
      sections: [
        { name: 'Chapters 1-3', status: 'completed', progress: 100 },
        { name: 'Chapters 4-6', status: 'in-progress', progress: 60 },
        { name: 'Online Quiz', status: 'pending', progress: 0 },
        { name: 'Certification', status: 'pending', progress: 0 }
      ],
      sectionsComplete: 1,
      totalSections: 4,
      isPersonal: true
    },
    {
      id: 'PT002',
      title: 'Organize cockpit documentation',
      description: 'Review and organize all cockpit reference materials and checklists',
      priority: 'Low',
      status: 'Pending',
      dueDate: '2025-09-30',
      createdDate: '2025-09-12',
      progress: 0,
      tags: ['Organization', 'Documentation'],
      collaborators: [
        { id: 'me', name: 'You', role: userRole, avatar: 'ME' },
        { id: 'pilot2', name: 'Sarah Johnson', role: 'pilot', avatar: 'SJ' }
      ],
      sections: [
        { name: 'Review existing docs', status: 'pending', progress: 0 },
        { name: 'Create organization system', status: 'pending', progress: 0 },
        { name: 'Update checklist locations', status: 'pending', progress: 0 }
      ],
      sectionsComplete: 0,
      totalSections: 3,
      isPersonal: true
    }
  ]);
  
  const [selectedPersonalTask, setSelectedPersonalTask] = useState<PersonalTask | null>(null);
  const [isPersonalTaskDialogOpen, setIsPersonalTaskDialogOpen] = useState(false);
  const [isNewPersonalTaskDialogOpen, setIsNewPersonalTaskDialogOpen] = useState(false);
  const [isEditPersonalTaskDialogOpen, setIsEditPersonalTaskDialogOpen] = useState(false);
  const [editingPersonalTask, setEditingPersonalTask] = useState<PersonalTask | null>(null);
  
  // New Personal Task Form
  const [newPersonalTaskForm, setNewPersonalTaskForm] = useState({
    title: '',
    description: '',
    priority: 'Medium' as const,
    dueDate: '',
    tags: [''],
    sections: [''],
    collaborators: [] as string[]
  });

  // Available users for collaboration
  const availableUsers = [
    { id: 'pilot1', name: 'John Smith', role: 'Pilot' },
    { id: 'pilot2', name: 'Sarah Johnson', role: 'Pilot' },
    { id: 'fa1', name: 'Maria Garcia', role: 'Flight Attendant' },
    { id: 'fa2', name: 'Lisa Chen', role: 'Flight Attendant' },
    { id: 'mech1', name: 'Mike Wilson', role: 'Maintenance' },
    { id: 'sched1', name: 'David Brown', role: 'Scheduling' },
    { id: 'safety1', name: 'Jennifer Park', role: 'Safety' }
  ];

  // Simple Avatar components
  const Avatar = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <div className={`${className} rounded-full bg-gray-200 flex items-center justify-center`}>
      {children}
    </div>
  );
  
  const AvatarFallback = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <span className={className}>{children}</span>
  );

  // Get action items for current user
  const userActionItems = getUserActionItems(MOCK_ACTION_ITEMS, userRole);
  const actionItemsStats = getStats(userActionItems);

  // Get personal task stats
  const getPersonalTaskStats = () => {
    const total = personalTasks.length;
    const active = personalTasks.filter(t => t.status === 'In Progress').length;
    const completed = personalTasks.filter(t => t.status === 'Completed').length;
    const collaborativeCount = personalTasks.filter(t => t.collaborators.length > 1).length;
    
    return { total, active, completed, collaborativeCount };
  };

  const personalTasksStats = getPersonalTaskStats();

  // Filter functions
  const getFilteredActionItems = () => {
    return userActionItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status.toLowerCase().replace(' ', '') === statusFilter;
      const matchesPriority = priorityFilter === 'all' || item.priority.toLowerCase() === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  };

  const getFilteredPersonalTasks = () => {
    return personalTasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || task.status.toLowerCase().replace(' ', '') === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority.toLowerCase() === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  };

  // Event handlers
  const handleCreatePersonalTask = () => {
    if (!newPersonalTaskForm.title.trim() || !newPersonalTaskForm.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newTask: PersonalTask = {
      id: `PT${String(personalTasks.length + 1).padStart(3, '0')}`,
      title: newPersonalTaskForm.title,
      description: newPersonalTaskForm.description,
      priority: newPersonalTaskForm.priority,
      status: 'Pending',
      dueDate: newPersonalTaskForm.dueDate,
      createdDate: new Date().toISOString().split('T')[0],
      progress: 0,
      tags: newPersonalTaskForm.tags.filter(tag => tag.trim() !== ''),
      collaborators: [
        { id: 'me', name: 'You', role: userRole, avatar: 'ME' },
        ...newPersonalTaskForm.collaborators.map(userId => {
          const user = availableUsers.find(u => u.id === userId);
          return user ? {
            id: user.id,
            name: user.name,
            role: user.role,
            avatar: user.name.split(' ').map(n => n[0]).join('')
          } : null;
        }).filter(Boolean) as any[]
      ],
      sections: newPersonalTaskForm.sections.filter(section => section.trim() !== '').map(section => ({
        name: section,
        status: 'pending' as const,
        progress: 0
      })),
      sectionsComplete: 0,
      totalSections: newPersonalTaskForm.sections.filter(section => section.trim() !== '').length,
      isPersonal: true
    };

    setPersonalTasks([...personalTasks, newTask]);
    setNewPersonalTaskForm({
      title: '',
      description: '',
      priority: 'Medium',
      dueDate: '',
      tags: [''],
      sections: [''],
      collaborators: []
    });
    setIsNewPersonalTaskDialogOpen(false);
    
    toast.success('Personal Task Created', {
      description: `"${newTask.title}" has been added to your tasks.`
    });
  };

  const handleDeletePersonalTask = (taskId: string) => {
    setPersonalTasks(personalTasks.filter(task => task.id !== taskId));
    toast.success('Task Deleted', {
      description: 'Personal task has been removed.'
    });
  };

  const handleUpdatePersonalTaskProgress = (taskId: string, newProgress: number, sectionUpdates?: any[]) => {
    setPersonalTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        let updatedSections = task.sections;
        let sectionsComplete = task.sectionsComplete;
        
        if (sectionUpdates) {
          updatedSections = sectionUpdates;
          sectionsComplete = sectionUpdates.filter(section => section.status === 'completed').length;
        }
        
        return {
          ...task,
          progress: newProgress,
          sections: updatedSections,
          sectionsComplete,
          status: newProgress === 100 ? 'Completed' as const : newProgress > 0 ? 'In Progress' as const : 'Pending' as const
        };
      }
      return task;
    }));
    
    setIsUpdatePersonalTaskProgressOpen(false);
    setUpdatingPersonalTask(null);
    toast.success('Progress Updated', {
      description: 'Personal task progress has been updated successfully.'
    });
  };

  const handleOpenActionItemProgressDialog = (actionItem: ActionItem) => {
    setUpdatingActionItem(actionItem);
    // Initialize the sections state for the dialog
    setUpdatedSections(actionItem.sections.map(section => ({
      name: section.name,
      status: section.status
    })));
    setUpdateComment('');
    setNewSectionName('');
    setIsUpdateProgressDialogOpen(true);
  };

  const handleSubmitActionItemProgress = () => {
    if (!updateComment.trim()) {
      toast.error('Please provide a progress comment');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsUpdateProgressDialogOpen(false);
      setUpdatingActionItem(null);
      setUpdatedSections([]);
      setUpdateComment('');
      setNewSectionName('');
      
      toast.success('Action Item Progress Updated', {
        description: 'Progress has been updated successfully.'
      });
    }, 1000);
  };

  const addTagField = () => {
    setNewPersonalTaskForm({
      ...newPersonalTaskForm,
      tags: [...newPersonalTaskForm.tags, '']
    });
  };

  const addSectionField = () => {
    setNewPersonalTaskForm({
      ...newPersonalTaskForm,
      sections: [...newPersonalTaskForm.sections, '']
    });
  };

  const removeTagField = (index: number) => {
    const newTags = newPersonalTaskForm.tags.filter((_, i) => i !== index);
    setNewPersonalTaskForm({
      ...newPersonalTaskForm,
      tags: newTags.length > 0 ? newTags : ['']
    });
  };

  const removeSectionField = (index: number) => {
    const newSections = newPersonalTaskForm.sections.filter((_, i) => i !== index);
    setNewPersonalTaskForm({
      ...newPersonalTaskForm,
      sections: newSections.length > 0 ? newSections : ['']
    });
  };

  const updateTagField = (index: number, value: string) => {
    const newTags = [...newPersonalTaskForm.tags];
    newTags[index] = value;
    setNewPersonalTaskForm({
      ...newPersonalTaskForm,
      tags: newTags
    });
  };

  const updateSectionField = (index: number, value: string) => {
    const newSections = [...newPersonalTaskForm.sections];
    newSections[index] = value;
    setNewPersonalTaskForm({
      ...newPersonalTaskForm,
      sections: newSections
    });
  };

  const TaskCard = ({ task, isActionItem = false }: { task: ActionItem | PersonalTask, isActionItem?: boolean }) => (
    <Card className={`border-l-4 ${getBorderColor(task.priority)}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="font-medium">{task.title}</h3>
              <Badge className={task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                              task.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                              'bg-gray-100 text-gray-800'}>
                {task.status.toUpperCase()}
              </Badge>
              {isActionItem && (
                <Badge variant="outline" className="bg-primary/10 text-primary text-xs">
                  ACTION ITEM
                </Badge>
              )}
              {!isActionItem && (
                <Badge variant="outline" className="bg-purple-100 text-purple-800 text-xs">
                  PERSONAL
                </Badge>
              )}
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Users className="w-3 h-3" />
                {('contributors' in task) ? task.contributors.length : task.collaborators.length}
              </Badge>
            </div>
            <p className="text-muted-foreground mb-3">
              {isActionItem 
                ? `${(task as ActionItem).module} • Assigned by ${(task as ActionItem).assignedBy}`
                : `Personal Task • Created ${formatDate((task as PersonalTask).createdDate)}`
              }
            </p>
            <p className="text-sm mb-4">{task.description}</p>
            
            {/* Contributors/Collaborators */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-medium">
                {isActionItem ? 'Contributors:' : 'Collaborators:'}
              </span>
              <div className="flex -space-x-2">
                {(('contributors' in task) ? task.contributors : task.collaborators).map((person) => (
                  <Avatar key={person.id} className="w-8 h-8 border-2 border-white">
                    <AvatarFallback className="text-xs">{person.avatar}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {!isActionItem && (
                <Button variant="ghost" size="sm" className="text-xs h-8 px-3">
                  <UserPlus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              )}
            </div>
          </div>
          <div className="ml-6 text-right">
            <div className="text-xs text-muted-foreground">
              {isActionItem 
                ? `Started ${formatDate((task as ActionItem).assignedDate)}`
                : `Created ${formatDate((task as PersonalTask).createdDate)}`
              }
            </div>
            <div className="text-xs text-muted-foreground">
              Target: {formatDate(task.dueDate)}
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Progress</h4>
            <Badge variant="outline" className="text-xs">
              {task.sectionsComplete} of {task.totalSections} sections complete
            </Badge>
          </div>
          <Progress value={task.progress} className="mb-3" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {task.sections.map((section, index) => (
              <div key={index} className="flex items-center gap-2">
                {section.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                {section.status === 'in-progress' && <Clock className="w-4 h-4 text-yellow-500" />}
                {section.status === 'pending' && <MessageSquare className="w-4 h-4 text-blue-500" />}
                <span>{section.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tags for personal tasks */}
        {!isActionItem && (task as PersonalTask).tags.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-sm mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {(task as PersonalTask).tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              Due: {formatDate(task.dueDate)}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              On track
            </span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                if (isActionItem) {
                  setSelectedActionItem(task as ActionItem);
                  setIsActionItemDialogOpen(true);
                } else {
                  setSelectedPersonalTask(task as PersonalTask);
                  setIsPersonalTaskDialogOpen(true);
                }
              }}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                if (isActionItem) {
                  handleOpenActionItemProgressDialog(task as ActionItem);
                } else {
                  setUpdatingPersonalTask(task as PersonalTask);
                  setIsUpdatePersonalTaskProgressOpen(true);
                }
              }}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Update Progress
            </Button>
            {!isActionItem && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setEditingPersonalTask(task as PersonalTask);
                  setIsEditPersonalTaskDialogOpen(true);
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1>Tasks & Action Items</h1>
        <p className="text-muted-foreground">
          Manage assigned action items and personal tasks in one unified workspace
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="action-items" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Action Items
            <Badge variant="secondary" className="ml-2">
              {actionItemsStats.active}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="personal-tasks" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            My Tasks
            <Badge variant="secondary" className="ml-2">
              {personalTasksStats.active}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks and action items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inprogress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Items Tab */}
        <TabsContent value="action-items" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="text-center">
              <CardContent className="p-4">
                <Activity className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{actionItemsStats.active}</div>
                <div className="text-sm text-muted-foreground">Active Items</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">{actionItemsStats.completed}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold">{actionItemsStats.totalContributors}</div>
                <div className="text-sm text-muted-foreground">Contributors</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <Target className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold">{actionItemsStats.total}</div>
                <div className="text-sm text-muted-foreground">Total Items</div>
              </CardContent>
            </Card>
          </div>

          {/* Action Items List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2>Assigned Action Items</h2>
              {(userRole === 'lead' || userRole === 'admin') && (
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Action Item
                </Button>
              )}
            </div>
            
            {getFilteredActionItems().length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">No Action Items</h3>
                  <p className="text-muted-foreground">
                    You don't have any action items assigned at the moment.
                  </p>
                </CardContent>
              </Card>
            ) : (
              getFilteredActionItems().map((item) => (
                <TaskCard key={item.id} task={item} isActionItem={true} />
              ))
            )}
          </div>
        </TabsContent>

        {/* Personal Tasks Tab */}
        <TabsContent value="personal-tasks" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="text-center">
              <CardContent className="p-4">
                <User className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{personalTasksStats.active}</div>
                <div className="text-sm text-muted-foreground">Active Tasks</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">{personalTasksStats.completed}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <Share2 className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold">{personalTasksStats.collaborativeCount}</div>
                <div className="text-sm text-muted-foreground">Collaborative</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <Star className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold">{personalTasksStats.total}</div>
                <div className="text-sm text-muted-foreground">Total Tasks</div>
              </CardContent>
            </Card>
          </div>

          {/* Personal Tasks List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2>My Personal Tasks</h2>
              <Button onClick={() => setIsNewPersonalTaskDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Personal Task
              </Button>
            </div>
            
            {getFilteredPersonalTasks().length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">No Personal Tasks</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first personal task to get started with personal goal tracking.
                  </p>
                  <Button onClick={() => setIsNewPersonalTaskDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Personal Task
                  </Button>
                </CardContent>
              </Card>
            ) : (
              getFilteredPersonalTasks().map((task) => (
                <TaskCard key={task.id} task={task} isActionItem={false} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* New Personal Task Dialog */}
      <Dialog open={isNewPersonalTaskDialogOpen} onOpenChange={setIsNewPersonalTaskDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Personal Task</DialogTitle>
            <DialogDescription>
              Create a personal task to track your own goals and collaborate with others.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                placeholder="Enter task title"
                value={newPersonalTaskForm.title}
                onChange={(e) => setNewPersonalTaskForm({
                  ...newPersonalTaskForm,
                  title: e.target.value
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your task"
                value={newPersonalTaskForm.description}
                onChange={(e) => setNewPersonalTaskForm({
                  ...newPersonalTaskForm,
                  description: e.target.value
                })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={newPersonalTaskForm.priority} 
                  onValueChange={(value: 'Critical' | 'High' | 'Medium' | 'Low') => 
                    setNewPersonalTaskForm({
                      ...newPersonalTaskForm,
                      priority: value
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newPersonalTaskForm.dueDate}
                  onChange={(e) => setNewPersonalTaskForm({
                    ...newPersonalTaskForm,
                    dueDate: e.target.value
                  })}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              {newPersonalTaskForm.tags.map((tag, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Enter tag"
                    value={tag}
                    onChange={(e) => updateTagField(index, e.target.value)}
                  />
                  {newPersonalTaskForm.tags.length > 1 && (
                    <Button variant="outline" size="sm" onClick={() => removeTagField(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addTagField}>
                <Plus className="w-4 h-4 mr-2" />
                Add Tag
              </Button>
            </div>

            {/* Sections */}
            <div className="space-y-2">
              <Label>Task Sections</Label>
              {newPersonalTaskForm.sections.map((section, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Enter section name"
                    value={section}
                    onChange={(e) => updateSectionField(index, e.target.value)}
                  />
                  {newPersonalTaskForm.sections.length > 1 && (
                    <Button variant="outline" size="sm" onClick={() => removeSectionField(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addSectionField}>
                <Plus className="w-4 h-4 mr-2" />
                Add Section
              </Button>
            </div>

            {/* Collaborators */}
            <div className="space-y-2">
              <Label>Invite Collaborators (Optional)</Label>
              <Select 
                value="" 
                onValueChange={(userId) => {
                  if (!newPersonalTaskForm.collaborators.includes(userId)) {
                    setNewPersonalTaskForm({
                      ...newPersonalTaskForm,
                      collaborators: [...newPersonalTaskForm.collaborators, userId]
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select users to collaborate" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.filter(user => 
                    !newPersonalTaskForm.collaborators.includes(user.id)
                  ).map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} - {user.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {newPersonalTaskForm.collaborators.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-2">Selected collaborators:</p>
                  <div className="flex flex-wrap gap-2">
                    {newPersonalTaskForm.collaborators.map(userId => {
                      const user = availableUsers.find(u => u.id === userId);
                      return user ? (
                        <Badge key={userId} variant="outline" className="flex items-center gap-1">
                          {user.name}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 ml-1"
                            onClick={() => setNewPersonalTaskForm({
                              ...newPersonalTaskForm,
                              collaborators: newPersonalTaskForm.collaborators.filter(id => id !== userId)
                            })}
                          >
                            ×
                          </Button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsNewPersonalTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePersonalTask}>
              Create Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Action Item Dialogs */}
      {selectedActionItem && (
        <DetailsDialog
          actionItem={selectedActionItem}
          isOpen={isActionItemDialogOpen}
          onClose={() => {
            setIsActionItemDialogOpen(false);
            setSelectedActionItem(null);
          }}
        />
      )}

      {updatingActionItem && (
        <UpdateProgressDialog
          isOpen={isUpdateProgressDialogOpen}
          onClose={() => {
            setIsUpdateProgressDialogOpen(false);
            setUpdatingActionItem(null);
          }}
          selectedItem={updatingActionItem}
          updatedSections={updatedSections}
          setUpdatedSections={setUpdatedSections}
          updateComment={updateComment}
          setUpdateComment={setUpdateComment}
          newSectionName={newSectionName}
          setNewSectionName={setNewSectionName}
          onSubmit={handleSubmitActionItemProgress}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Personal Task Progress Update Dialog */}
      {updatingPersonalTask && (
        <Dialog open={isUpdatePersonalTaskProgressOpen} onOpenChange={setIsUpdatePersonalTaskProgressOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Update Task Progress</DialogTitle>
              <DialogDescription>
                Update the progress for "{updatingPersonalTask.title}"
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Overall Progress */}
              <div className="space-y-3">
                <Label>Overall Progress</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Progress: {updatingPersonalTask.progress}%</span>
                    <Badge variant="outline">
                      {updatingPersonalTask.sectionsComplete} of {updatingPersonalTask.totalSections} sections complete
                    </Badge>
                  </div>
                  <Progress value={updatingPersonalTask.progress} />
                </div>
              </div>

              {/* Section Progress */}
              <div className="space-y-3">
                <Label>Section Progress</Label>
                <div className="space-y-3">
                  {updatingPersonalTask.sections.map((section, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {section.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                        {section.status === 'in-progress' && <Clock className="w-5 h-5 text-yellow-500" />}
                        {section.status === 'pending' && <MessageSquare className="w-5 h-5 text-gray-400" />}
                        <span className="font-medium">{section.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select 
                          value={section.status} 
                          onValueChange={(newStatus: 'pending' | 'in-progress' | 'completed') => {
                            const updatedSections = [...updatingPersonalTask.sections];
                            updatedSections[index] = { 
                              ...section, 
                              status: newStatus,
                              progress: newStatus === 'completed' ? 100 : newStatus === 'in-progress' ? 50 : 0
                            };
                            const completedCount = updatedSections.filter(s => s.status === 'completed').length;
                            const newProgress = Math.round((completedCount / updatedSections.length) * 100);
                            
                            setUpdatingPersonalTask({
                              ...updatingPersonalTask,
                              sections: updatedSections,
                              sectionsComplete: completedCount,
                              progress: newProgress
                            });
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Progress Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about your progress..."
                  value={updatingPersonalTask.notes || ''}
                  onChange={(e) => setUpdatingPersonalTask({
                    ...updatingPersonalTask,
                    notes: e.target.value
                  })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsUpdatePersonalTaskProgressOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                if (updatingPersonalTask) {
                  handleUpdatePersonalTaskProgress(
                    updatingPersonalTask.id,
                    updatingPersonalTask.progress,
                    updatingPersonalTask.sections
                  );
                }
              }}>
                Update Progress
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Personal Task Details Dialog */}
      {selectedPersonalTask && (
        <Dialog open={isPersonalTaskDialogOpen} onOpenChange={setIsPersonalTaskDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedPersonalTask.title}</DialogTitle>
              <DialogDescription>
                Personal Task Details • Created {formatDate(selectedPersonalTask.createdDate)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Task Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <Badge className={`mt-1 ${getBorderColor(selectedPersonalTask.priority).replace('border-l-4', 'bg')}`}>
                    {selectedPersonalTask.priority}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={`mt-1 ${
                    selectedPersonalTask.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    selectedPersonalTask.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedPersonalTask.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Due Date</Label>
                  <p className="mt-1">{formatDate(selectedPersonalTask.dueDate)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Progress</Label>
                  <div className="mt-1 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{selectedPersonalTask.progress}%</span>
                      <span>{selectedPersonalTask.sectionsComplete} of {selectedPersonalTask.totalSections} sections</span>
                    </div>
                    <Progress value={selectedPersonalTask.progress} />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="mt-1 text-sm text-muted-foreground">{selectedPersonalTask.description}</p>
              </div>

              {/* Tags */}
              {selectedPersonalTask.tags.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedPersonalTask.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Collaborators */}
              <div>
                <Label className="text-sm font-medium">Collaborators</Label>
                <div className="mt-2 space-y-2">
                  {selectedPersonalTask.collaborators.map((collaborator) => (
                    <div key={collaborator.id} className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">{collaborator.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{collaborator.name}</p>
                        <p className="text-xs text-muted-foreground">{collaborator.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sections */}
              <div>
                <Label className="text-sm font-medium">Task Sections</Label>
                <div className="mt-2 space-y-3">
                  {selectedPersonalTask.sections.map((section, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      {section.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                      {section.status === 'in-progress' && <Clock className="w-5 h-5 text-yellow-500" />}
                      {section.status === 'pending' && <MessageSquare className="w-5 h-5 text-gray-400" />}
                      <div className="flex-1">
                        <span className="font-medium">{section.name}</span>
                        <div className="mt-1">
                          <Progress value={section.progress} className="h-2" />
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {section.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedPersonalTask.notes && (
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedPersonalTask.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsPersonalTaskDialogOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setIsPersonalTaskDialogOpen(false);
                setUpdatingPersonalTask(selectedPersonalTask);
                setIsUpdatePersonalTaskProgressOpen(true);
              }}>
                Update Progress
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}