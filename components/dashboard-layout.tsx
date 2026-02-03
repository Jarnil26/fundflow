'use client';

import React from "react"

import { Menu, Settings, Bell, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavSidebar } from '@/components/nav-sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function DashboardLayout({ children, title = 'Dashboard', subtitle }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavSidebar />
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40 lg:ml-64">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">F</span>
            </div>
            <h1 className="text-lg font-semibold">Fundflow</h1>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Bell className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-5 h-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Menu className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border">
                <DropdownMenuItem className="cursor-pointer hover:bg-secondary">
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-secondary">
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-secondary flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        <div className="px-6 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground">{title}</h2>
            {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
