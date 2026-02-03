'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { TaskForm } from '@/components/task-form';
import { TaskList } from '@/components/task-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  estimatedHours: number;
  assignedTo: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data.data || []);
    } catch (error) {
      console.log('[v0] Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleUpdateTask = async (taskId: string, status: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.log('[v0] Error updating task:', error);
    }
  };

  const getFilteredTasks = (filter: string) => {
    switch (filter) {
      case 'pending':
        return tasks.filter((t) => t.status === 'pending');
      case 'in-progress':
        return tasks.filter((t) => t.status === 'in-progress');
      case 'completed':
        return tasks.filter((t) => t.status === 'completed');
      default:
        return tasks;
    }
  };

  return (
    <DashboardLayout
      title="Task Management"
      subtitle="Create and manage tasks for your team"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-1">
          <TaskForm onTaskCreated={() => fetchTasks()} />
        </div>

        {/* Tasks Column */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-card border border-border mb-4">
              <TabsTrigger value="all" className="data-[state=active]:bg-accent">
                All ({tasks.length})
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="data-[state=active]:bg-accent"
              >
                Pending ({getFilteredTasks('pending').length})
              </TabsTrigger>
              <TabsTrigger
                value="in-progress"
                className="data-[state=active]:bg-accent"
              >
                In Progress ({getFilteredTasks('in-progress').length})
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="data-[state=active]:bg-accent"
              >
                Done ({getFilteredTasks('completed').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <TaskList
                tasks={tasks}
                onStatusChange={handleUpdateTask}
                loading={loading}
              />
            </TabsContent>

            <TabsContent value="pending">
              <TaskList
                tasks={getFilteredTasks('pending')}
                onStatusChange={handleUpdateTask}
                loading={loading}
              />
            </TabsContent>

            <TabsContent value="in-progress">
              <TaskList
                tasks={getFilteredTasks('in-progress')}
                onStatusChange={handleUpdateTask}
                loading={loading}
              />
            </TabsContent>

            <TabsContent value="completed">
              <TaskList
                tasks={getFilteredTasks('completed')}
                onStatusChange={handleUpdateTask}
                loading={loading}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
