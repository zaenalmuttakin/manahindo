'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Search } from 'lucide-react';
import { motion } from 'framer-motion';


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
import { MobileSidebar } from '@/components/sidebar/mobile-sidebar';
import { ProfileMenu } from './profile-menu';
import { ThemeToggle } from './theme-toggle';

interface NavbarProps {
  onMobileMenuToggle?: () => void;
  isMobile?: boolean;
}







export default function Navbar({ onMobileMenuToggle, isMobile }: NavbarProps) {
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

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
                    <GlobalSearch />
          <ThemeToggle />
          <ProfileMenu />
        </div>
      </div>
    </motion.div>
  );
}
