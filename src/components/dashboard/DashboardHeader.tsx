'use client';

import { Badge } from '@/components/ui/badge';
import { Bell, User } from 'lucide-react';

interface DashboardHeaderProps {
  user: {
    name: string;
    email?: string;
    role: string;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const roleColors: Record<string, string> = {
    SUPER_ADMIN: 'bg-red-100 text-red-800',
    ADMIN: 'bg-orange-100 text-orange-800',
    EDITOR: 'bg-blue-100 text-blue-800',
    AUTHOR: 'bg-green-100 text-green-800',
  };

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold">Welcome back, {user.name}</h1>
      </div>
      <div className="flex items-center gap-4">
        <Badge className={roleColors[user.role] || 'bg-gray-100'}>
          {user.role.replace('_', ' ')}
        </Badge>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{user.name}</span>
        </div>
      </div>
    </header>
  );
}
