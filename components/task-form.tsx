'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TaskFormProps {
  onTaskCreated?: () => void;
}

export function TaskForm({ onTaskCreated }: TaskFormProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    status: 'pending',
    dueDate: '',
    estimatedHours: '1',
  });

  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.json())
      .then((data) => setUsers(data.data || []))
      .catch((err) => console.log('[v0] Error fetching users:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          estimatedHours: parseInt(formData.estimatedHours),
          dueDate: new Date(formData.dueDate),
        }),
      });

      if (response.ok) {
        setFormData({
          title: '',
          description: '',
          assignedTo: '',
          status: 'pending',
          dueDate: '',
          estimatedHours: '1',
        });
        onTaskCreated?.();
      }
    } catch (error) {
      console.log('[v0] Error creating task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Create New Task</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Task Title</label>
            <Input
              type="text"
              placeholder="Enter task title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Assign To</label>
            <Select value={formData.assignedTo} onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}>
              <SelectTrigger className="bg-secondary border-border text-foreground">
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {users.map((user) => (
                  <SelectItem key={user._id} value={user._id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Description</label>
          <textarea
            placeholder="Task description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 bg-secondary border border-border text-foreground placeholder:text-muted-foreground rounded-md"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Due Date</label>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
              className="bg-secondary border-border text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Estimated Hours</label>
            <Input
              type="number"
              min="1"
              value={formData.estimatedHours}
              onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
              required
              className="bg-secondary border-border text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Status</label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger className="bg-secondary border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-accent hover:bg-accent/90 text-primary-foreground"
        >
          {loading ? 'Creating...' : 'Create Task'}
        </Button>
      </form>
    </Card>
  );
}
