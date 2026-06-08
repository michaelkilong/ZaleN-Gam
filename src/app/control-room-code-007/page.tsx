'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { StaffLoginForm } from '@/components/dashboard/StaffLoginForm';
import { ForcePasswordChange } from '@/components/dashboard/ForcePasswordChange';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { UserManagement } from '@/components/dashboard/SuperAdminViews/UserManagement';
import { SiteSettings } from '@/components/dashboard/SuperAdminViews/SiteSettings';
import { SystemLogs } from '@/components/dashboard/SuperAdminViews/SystemLogs';
import { AllArticlesTable } from '@/components/dashboard/AdminViews/AllArticlesTable';
import { CategoryManager } from '@/components/dashboard/AdminViews/CategoryManager';
import { CommentModeration } from '@/components/dashboard/AdminViews/CommentModeration';
import { MyArticlesList as EditorMyArticles } from '@/components/dashboard/EditorViews/MyArticlesList';
import { ReviewQueue } from '@/components/dashboard/EditorViews/ReviewQueue';
import { MyArticlesList as AuthorMyArticles } from '@/components/dashboard/AuthorViews/MyArticlesList';

interface StaffUser {
  id: string;
  name: string;
  email?: string;
  role: string;
  mustChangePassword: boolean;
}

function DashboardContent() {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'dashboard';

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/staff/session');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (loggedInUser: StaffUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/staff/logout', { method: 'POST' });
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handlePasswordChangeComplete = () => {
    if (user) {
      setUser({ ...user, mustChangePassword: false });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <StaffLoginForm onLogin={handleLogin} />;
  }

  if (user.mustChangePassword) {
    return <ForcePasswordChange onComplete={handlePasswordChangeComplete} />;
  }

  const renderContent = () => {
    switch (tab) {
      case 'users':
        return user.role === 'SUPER_ADMIN' ? <UserManagement /> : null;
      case 'articles':
        return ['SUPER_ADMIN', 'ADMIN'].includes(user.role) ? <AllArticlesTable /> : null;
      case 'categories':
        return ['SUPER_ADMIN', 'ADMIN'].includes(user.role) ? <CategoryManager /> : null;
      case 'comments':
        return ['SUPER_ADMIN', 'ADMIN'].includes(user.role) ? <CommentModeration /> : null;
      case 'settings':
        return user.role === 'SUPER_ADMIN' ? <SiteSettings /> : null;
      case 'logs':
        return user.role === 'SUPER_ADMIN' ? <SystemLogs /> : null;
      case 'my-articles':
        return ['EDITOR', 'AUTHOR'].includes(user.role) ? (
          user.role === 'EDITOR' ? <EditorMyArticles /> : <AuthorMyArticles />
        ) : null;
      case 'review':
        return user.role === 'EDITOR' ? <ReviewQueue /> : null;
      default:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 border rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Role</h3>
                <p className="text-2xl font-bold">{user.role.replace('_', ' ')}</p>
              </div>
              <div className="p-6 border rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Welcome</h3>
                <p className="text-lg font-semibold">{user.name}</p>
              </div>
              <div className="p-6 border rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Quick Actions</h3>
                <p className="text-sm text-muted-foreground">
                  Use the sidebar to navigate to different sections based on your role permissions.
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar userRole={user.role} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col">
        <DashboardHeader user={user} />
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default function ControlRoomPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>}>
      <DashboardContent />
    </Suspense>
  );
}
