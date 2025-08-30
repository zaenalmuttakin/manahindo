'use client';

import { useState, useRef } from "react";
import {
  ChevronsLeft,
  ChevronsRight,
  LayoutDashboard,
  ShoppingBasket,
  Settings,
  Wallet,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/expenses",
    label: "Expenses",
    icon: Wallet,
  },
  {
    href: "/products",
    label: "Products",
    icon: ShoppingBasket,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

// A clean component for the mobile navigation links
const MobileNav = ({ onLinkClick }: { onLinkClick: () => void }) => {
  const pathname = usePathname();
  return (
    <div className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full flex items-center justify-start"
            >
              <Users className="h-6 w-6 mr-4" />
              Switch Team
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="start" className="w-[220px] z-[61]">
            <DropdownMenuItem>Team A</DropdownMenuItem>
            <DropdownMenuItem>Team B</DropdownMenuItem>
            <DropdownMenuItem>Create New Team</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <nav className="mt-6 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={onLinkClick}>
              <Button
                variant={pathname === link.href ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <link.icon className="mr-4 h-6 w-6" />
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>
    </div>
  );
};

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(mobileMenuRef, () => setIsMobileMenuOpen(false));

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // If mobile, render our custom non-modal motion sidebar
  if (isMobile) {
    return (
      <>
        {/* Trigger Button */}
        <Button
          size="icon"
          onClick={() => setIsMobileMenuOpen(true)}
          className="fixed bottom-4 left-4 rounded-full shadow-lg z-60 bg-white/30 text-zinc-900 backdrop-blur-lg ring-1 ring-black/5 hover:bg-white/50 dark:bg-zinc-900/30 dark:text-zinc-50 dark:ring-white/10 dark:hover:bg-zinc-900/50"
        >
          <ChevronsRight className="h-6 w-6" />
        </Button>

        {/* Mobile Sidebar Panel */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full w-64 bg-white/10 backdrop-blur-lg shadow-lg z-60 flex flex-col"
            >
              <MobileNav onLinkClick={() => setIsMobileMenuOpen(false)} />
              <div className="mt-auto p-4">
                <Button
                  variant="ghost"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full justify-start"
                >
                  <ChevronsLeft className="h-6 w-6 mr-4" />
                  Collapse
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // If desktop, render the standard collapsible sidebar
  return (
    <TooltipProvider>
      <motion.aside
        initial={{ x: -250, opacity: 0 }}
        animate={{
          x: 0,
          opacity: 1,
          width: isCollapsed ? 60 : 250,
        }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className={cn(
          "h-screen bg-white/10 backdrop-blur-lg shadow-lg rounded-r-2xl flex flex-col fixed top-0 left-0 z-60",
          isCollapsed ? "p-2" : "p-4"
        )}
      >
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full flex items-center",
                    isCollapsed ? "justify-center" : "justify-start"
                  )}
                >
                  <motion.div layout="position" className="flex items-center">
                    <Users className="h-6 w-6" />
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2, delay: 0.1 }}
                          className="ml-4 whitespace-nowrap"
                        >
                          Switch Team
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                side={isCollapsed ? "right" : "bottom"}
                align={isCollapsed ? "start" : "center"}
                sideOffset={8} 
                className="z-[61] w-48"
              >
                <DropdownMenuItem>Team A</DropdownMenuItem>
                <DropdownMenuItem>Team B</DropdownMenuItem>
                <DropdownMenuItem>Create New Team</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <nav className="mt-10">
            <ul>
              {navLinks.map((link, index) => (
                <li key={link.href} className="mb-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={link.href}>
                        <Button
                          variant={pathname === link.href ? "secondary" : "ghost"}
                          className={cn(
                            "w-full flex items-center",
                            isCollapsed ? "justify-center" : "justify-start"
                          )}
                        >
                          <motion.div layout="position" className="flex items-center">
                            <motion.div
                              key={isCollapsed.toString()}
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.4, delay: index * 0.05 }}
                            >
                              <link.icon className="h-6 w-6" />
                            </motion.div>
                            <AnimatePresence>
                              {!isCollapsed && (
                                <motion.span
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -20 }}
                                  transition={{ duration: 0.2, delay: 0.1 + index * 0.05 }}
                                  className="ml-4 whitespace-nowrap"
                                >
                                  {link.label}
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    {isCollapsed && (
                      <TooltipContent side="right">
                        <p>{link.label}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-auto">
          <Button
            onClick={toggleSidebar}
            variant="ghost"
            className={cn("w-full flex items-center", isCollapsed ? "justify-center" : "justify-start")}
          >
            <motion.div layout="position" className="flex items-center">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isCollapsed ? "right" : "left"}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  {isCollapsed ? <ChevronsRight className="h-8 w-8" /> : <ChevronsLeft className="h-8 w-8" />}
                </motion.div>
              </AnimatePresence>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, delay: 0.1 + navLinks.length * 0.05 }}
                    className="ml-4 whitespace-nowrap"
                  >
                    Collapse
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </Button>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}