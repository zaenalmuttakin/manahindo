"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Sun, Moon, Bell, Search, Command } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import Logo from '@/components/ui/logo';
import { GlobalSearch } from '@/components/ui/global-search';

interface NavbarProps {
  onMobileMenuToggle?: () => void;
  isMobile?: boolean;
}

const ThemeToggle = () => {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label="Toggle theme"
      className="h-9 w-9 rounded-md hover:bg-accent hover:text-accent-foreground"
    >
      <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
};

const NotificationButton = () => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 rounded-md hover:bg-accent hover:text-accent-foreground relative"
      aria-label="Notifications"
    >
      <Bell className="h-[1.1rem] w-[1.1rem]" />
      <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full border-2 border-background"></span>
    </Button>
  );
};

const ProfileMenu = ({ isMobile = false }) => {
  // Placeholder for user data
  const user = { name: 'John Doe', email: 'john.doe@example.com', image: '' };
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-md hover:bg-accent hover:text-accent-foreground">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        {isMobile && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/" className="h-12 px-4">
                <div className="flex items-center">
                  <div className="mr-3">
                    <div className="font-medium">Dashboard</div>
                    <div className="text-sm text-muted-foreground">Overview and analytics</div>
                  </div>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/expenses" className="h-12 px-4">
                <div className="flex items-center">
                  <div className="mr-3">
                    <div className="font-medium">Expenses</div>
                    <div className="text-sm text-muted-foreground">Manage expenses</div>
                  </div>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem className="h-12 px-4">
          <div className="flex items-center">
            <div className="mr-3">
              <div className="font-medium">Profile</div>
              <div className="text-sm text-muted-foreground">View your profile</div>
            </div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem className="h-12 px-4">
          <div className="flex items-center">
            <div className="mr-3">
              <div className="font-medium">Settings</div>
              <div className="text-sm text-muted-foreground">App configuration</div>
            </div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="h-12 px-4 text-destructive">
          <div className="flex items-center">
            <div className="mr-3">
              <div className="font-medium">Logout</div>
              <div className="text-sm">Sign out of your account</div>
            </div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const GlobalSearchButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground sm:w-64 lg:w-80"
        onClick={() => setIsOpen(true)}
      >
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <span className="hidden lg:inline-flex">Search anything...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <GlobalSearch open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};

export default function Navbar({ onMobileMenuToggle, isMobile }: NavbarProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className="sticky top-0 z-[30] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border w-full"
    >
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 w-full">
        {/* Left side - Logo only */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Logo />
          </Link>
        </div>

        {/* Center - Global Search */}
        <div className="flex-1 flex justify-center">
          {!isMobile ? (
            <GlobalSearchButton />
          ) : (
            <div className="hidden">
              <GlobalSearchButton />
            </div>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
          {isMobile && onMobileMenuToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMobileMenuToggle}
              className="h-9 w-9 rounded-md hover:bg-accent hover:text-accent-foreground"
              aria-label="Toggle mobile menu"
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
          <NotificationButton />
          <ThemeToggle />
          <div className="hidden lg:block">
            <ProfileMenu />
          </div>
          <div className="lg:hidden">
            <ProfileMenu isMobile={true} />
          </div>
        </div>
      </div>
    </motion.header>
  );
}