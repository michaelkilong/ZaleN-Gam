'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useReader } from '@/hooks/useReader';
import { useNotifications } from '@/hooks/useNotifications';
import { auth } from '@/lib/firebase/client';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bookmark, 
  FolderHeart, 
  Bell, 
  LogOut, 
  User, 
  Mail,
  Check,
  Newspaper
} from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { readerData, loading: readerLoading } = useReader();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (authLoading || readerLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to access your dashboard.
          </p>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{readerData?.name || user.displayName || 'Reader'}</h1>
              <p className="text-muted-foreground flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {readerData?.email || user.email}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="saved">
          <TabsList className="mb-6">
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Saved Articles
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <FolderHeart className="h-4 w-4" />
              Followed Categories
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-1">{unreadCount}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Saved Articles */}
          <TabsContent value="saved">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bookmark className="h-5 w-5" />
                  Saved Articles
                </CardTitle>
              </CardHeader>
              <CardContent>
                {readerData?.savedArticles && readerData.savedArticles.length > 0 ? (
                  <div className="space-y-3">
                    {readerData.savedArticles.map((slug) => (
                      <Link
                        key={slug}
                        href={`/news/${slug}`}
                        className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{slug.replace(/-/g, ' ')}</span>
                          <Newspaper className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No saved articles yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Save articles to read them later
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Followed Categories */}
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderHeart className="h-5 w-5" />
                  Followed Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                {readerData?.followedCategories && readerData.followedCategories.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {readerData.followedCategories.map((slug) => (
                      <Link
                        key={slug}
                        href={`/category/${slug}`}
                        className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors"
                      >
                        {slug.replace(/-/g, ' ')}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FolderHeart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No followed categories yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Follow categories to get personalized news
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border rounded-lg transition-colors ${
                          !notification.read ? 'bg-primary/5 border-primary/20' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-medium">{notification.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{notification.body}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        {notification.link && (
                          <Link
                            href={notification.link}
                            className="text-sm text-primary hover:underline mt-2 inline-block"
                          >
                            View
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No notifications yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
