'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Users,
  FolderOpen,
  MessageSquare,
  Settings,
  ScrollText,
  PenTool,
  LogOut,
  Shield,
} from 'lucide-react';

interface DashboardSidebarProps {
  userRole: string;
  onLogout: () => void;
}

export function DashboardSidebar({ userRole, onLogout }: DashboardSidebarProps) {
  const pathname = usePathname();

  const getNavItems = () => {
    const baseItems = [
      { href: '/control-room-code-007', label: 'Dashboard', icon: LayoutDashboard },
    ];

    if (userRole === 'SUPER_ADMIN') {
      return [
        ...baseItems,
        { href: '/control-room-code-007?tab=users', label: 'User Management', icon: Users },
        { href: '/control-room-code-007?tab=articles', label: 'All Articles', icon: FileText },
        { href: '/control-room-code-007?tab=categories', label: 'Categories', icon: FolderOpen },
        { href: '/control-room-code-007?tab=comments', label: 'Comments', icon: MessageSquare },
        { href: '/control-room-code-007?tab=settings', label: 'Site Settings', icon: Settings },
        { href: '/control-room-code-007?tab=logs', label: 'System Logs', icon: ScrollText },
      ];
    }

    if (userRole === 'ADMIN') {
      return [
        ...baseItems,
        { href: '/control-room-code-007?tab=articles', label: 'All Articles', icon: FileText },
        { href: '/control-room-code-007?tab=categories', label: 'Categories', icon: FolderOpen },
        { href: '/control-room-code-007?tab=comments', label: 'Comments', icon: MessageSquare },
      ];
    }

    if (userRole === 'EDITOR') {
      return [
        ...baseItems,
        { href: '/control-room-code-007?tab=my-articles', label: 'My Articles', icon: FileText },
        { href: '/control-room-code-007?tab=review', label: 'Review Queue', icon: PenTool },
      ];
    }

    if (userRole === 'AUTHOR') {
      return [
        ...baseItems,
        { href: '/control-room-code-007?tab=my-articles', label: 'My Articles', icon: FileText },
      ];
    }

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-card border-r min-h-screen flex flex-col">
      <div className="p-6 border-b">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">Control Room</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href.includes('?tab=') && pathname.includes('control-room-code-007'));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
