'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  DollarSign,
  Receipt,
  UserCheck,
  LogOut,
  Bell,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const navItems = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Wallets',
    href: '/wallets',
    icon: DollarSign,
  },
  {
    label: 'Expenses',
    href: '/expenses',
    icon: Receipt,
  },
  {
    label: 'Digital Services',
    href: '/digital-services',
    icon: UserCheck,
  },
];

export function NavSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-20 left-6 z-50 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-card border-border"
        >
          {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-border pt-20 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <nav className="flex flex-col h-full px-4 py-6">
          {/* NAV LINKS */}
          <div className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all
                    ${
                      active
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* BOTTOM ACTIONS */}
          <div className="space-y-3 border-t border-sidebar-border pt-4">
            {/* Notifications (UI Ready) */}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => {
                // Future notification panel
                alert('Notifications coming soon 🚀');
              }}
            >
              <Bell className="w-4 h-4" />
              Notifications
            </Button>

            {/* Logout */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={async () => {
                try {
                  await fetch('/api/auth/logout', {
                    method: 'POST',
                    credentials: 'include',
                  });

                  router.replace('/login');
                } catch (err) {
                  console.error('Logout failed', err);
                }
              }}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Desktop Spacer */}
      <div className="hidden lg:block lg:w-64" />
    </>
  );
}
