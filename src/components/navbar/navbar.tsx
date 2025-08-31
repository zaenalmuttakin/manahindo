'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Search } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/logo';
import { GlobalSearch } from '@/components/ui/global-search';
import { MobileSidebar } from '@/components/sidebar/mobile-sidebar';
import { ProfileMenu } from './profile-menu';
import { ThemeToggle } from './theme-toggle';

interface NavbarProps {
  onMobileMenuToggle?: () => void;
  isMobile?: boolean;
}

export default function Navbar({ onMobileMenuToggle, isMobile }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <div className="hidden sm:block">
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
        </div>
        <div className="sm:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(true)}
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
        <GlobalSearch open={isOpen} onOpenChange={setIsOpen} />
      </>
    );
  };

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg"
    >
      <MobileSidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden z-51">
            <Menu className="h-6 w-6" />
          </Button>
          <Link href="/" className="flex items-center space-x-2">
            <Logo />
          </Link>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
          <GlobalSearchButton />
          <ThemeToggle />
          <ProfileMenu />
        </div>
      </div>
    </motion.div>
  );
}
