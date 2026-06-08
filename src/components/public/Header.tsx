'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { ThemeToggle } from './ThemeToggle';
import { SearchBar } from './SearchBar';
import { Menu, X, Bell, User, LogOut } from 'lucide-react';
import { auth } from '@/lib/firebase/client';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/category/politics', label: 'Politics' },
    { href: '/category/technology', label: 'Technology' },
    { href: '/category/sports', label: 'Sports' },
    { href: '/category/entertainment', label: 'Entertainment' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-primary">ZaleN</span>
              <span className="text-muted-foreground">-Gam</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <SearchBar />
            <ThemeToggle />

            {mounted && user ? (
              <div className="hidden md:flex items-center gap-3">
                <Link href="/dashboard" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link href="/dashboard">
                  <User className="h-5 w-5" />
                </Link>
                <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : mounted ? (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login">
                  <button className="text-sm font-medium">Sign In</button>
                </Link>
                <Link href="/register">
                  <button className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
                    Get Started
                  </button>
                </Link>
              </div>
            ) : null}

            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {mounted && user ? (
                <>
                  <Link href="/dashboard" className="text-sm font-medium">Dashboard</Link>
                  <button onClick={handleLogout} className="text-sm font-medium text-left">Sign Out</button>
                </>
              ) : mounted ? (
                <>
                  <Link href="/login" className="text-sm font-medium">Sign In</Link>
                  <Link href="/register" className="text-sm font-medium">Get Started</Link>
                </>
              ) : null}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
