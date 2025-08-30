"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/logo';
import { MobileSidebar } from '@/components/sidebar/mobile-sidebar';
import { ProfileMenu } from './profile-menu';
import { DesktopNav } from './desktop-nav';
import { ThemeToggle } from './theme-toggle';







export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

        <div className="flex-1 flex justify-center">
          <DesktopNav />
        </div>

        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <ProfileMenu />
        </div>
      </div>
    </motion.div>
  );
}