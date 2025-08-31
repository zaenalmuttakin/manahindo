'use client';

import { useState, useRef, RefObject, Dispatch, SetStateAction, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useOnClickOutside } from "usehooks-ts";
import {
  ChevronsLeft,
  ChevronsRight,
  LayoutDashboard,
  ShoppingBasket,
  Settings,
  Wallet,
  Users,
  X,
  Search,
  ListCheckIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { GlobalSearch } from "@/components/ui/global-search";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
    description: "Overview and analytics",
  },
  {
    href: "/expenses",
    label: "Expenses",
    icon: Wallet,
    description: "Manage expenses",
  },
  {
    href: "/orders/create",
    label: "Create Order",
    icon: ListCheckIcon,
    description: "Create a new order",
  },
  {
    href: "/products",
    label: "Products",
    icon: ShoppingBasket,
    description: "Product catalog",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    description: "App configuration",
  },
];

// Mobile navigation component with improved design
const MobileNav = ({ onLinkClick }: { onLinkClick: () => void }) => {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  return (
    <div className="flex flex-col h-full">
      {/* Global Search - Fixed at the top */}
      <div className="sticky top-0 z-10 bg-background p-4 border-b border-border">
        <div className="flex items-center justify-end mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onLinkClick}
            className="h-8 w-8 hover:bg-accent hover:text-accent-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="w-full">
          <Button
            variant="outline"
            className="relative h-10 w-full justify-start rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <span>Cari apapun...</span>
          </Button>
          <GlobalSearch open={isSearchOpen} onOpenChange={setIsSearchOpen} />
        </div>
      </div>
      
      {/* Team Selector */}
      <div className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full flex items-center justify-start h-12 px-4 border-border hover:bg-accent hover:text-accent-foreground"
            >
              <Users className="h-5 w-5 mr-3 text-muted-foreground" />
              <div className="text-left">
                <div className="font-medium text-foreground">Switch Team</div>
                <div className="text-sm text-muted-foreground">Currently: Team A</div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="start" className="w-[280px] z-[10000]">
            <DropdownMenuItem className="h-12 px-4">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-3" />
                <div>
                  <div className="font-medium">Team A</div>
                  <div className="text-sm text-muted-foreground">Active team</div>
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="h-12 px-4">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-3" />
                <div>
                  <div className="font-medium">Team B</div>
                  <div className="text-sm text-muted-foreground">Secondary team</div>
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="h-12 px-4 text-primary">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-3" />
                <div>
                  <div className="font-medium">Create New Team</div>
                  <div className="text-sm text-muted-foreground">Add a new team</div>
                </div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 pt-4">
        <div className="space-y-2">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={onLinkClick}>
              <Button
                variant={pathname === link.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start h-12 px-4 transition-all duration-200",
                  pathname === link.href 
                    ? "bg-secondary text-secondary-foreground shadow-sm" 
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <link.icon className="mr-3 h-5 w-5 text-muted-foreground" />
                <div className="text-left">
                  <div className="font-medium text-foreground">{link.label}</div>
                  {link.description && <div className="text-sm text-muted-foreground">{link.description}</div>}
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-center text-sm text-muted-foreground">
          © 2024 Manahindo
        </div>
      </div>
    </div>
  );
};

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: Dispatch<SetStateAction<boolean>>;
  isMobileMenuOpen?: boolean;
  onMobileMenuToggle?: () => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed, isMobileMenuOpen, onMobileMenuToggle }: SidebarProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(mobileMenuRef as RefObject<HTMLElement>, () => {
    if (onMobileMenuToggle) onMobileMenuToggle();
  });


  const toggleSidebar = useCallback(() => {
    setIsCollapsed(!isCollapsed);
  }, [isCollapsed, setIsCollapsed]);

  // Mobile sidebar overlay
  if (isMobile && onMobileMenuToggle) {
    return (
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[9998]"
              onClick={onMobileMenuToggle}
            />
            
            {/* Sidebar Panel */}
            <motion.div
              ref={mobileMenuRef}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full w-full max-w-sm bg-background shadow-2xl z-[9999] border-r border-border flex flex-col"
            >
              <div className="flex-1 overflow-y-auto">
                <MobileNav onLinkClick={onMobileMenuToggle} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop sidebar
  return (
    <TooltipProvider>
      <motion.aside
        initial={{ x: -270, opacity: 0 }}
        animate={{
          x: 0,
          opacity: 1,
          width: isCollapsed ? 50 : 280,
        }}
        className={cn(
          "h-screen bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg border-r border-border flex flex-col fixed top-0 left-0 z-40",
          isCollapsed ? "p-2" : "p-4"
        )}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      >
        <div className="flex-grow flex flex-col">
          {/* Header */}
          <div className="mb-8">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full flex items-center h-14 transition-all duration-200",
                    isCollapsed ? "justify-center px-0" : "justify-start px-3"
                  )}
                >
                  <motion.div layout="position" className="flex items-center">
                    <div className="p-2 rounded-lg bg-primary flex-shrink-0">
                      <Users className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2, delay: 0.1 }}
                          className="ml-3 text-left whitespace-nowrap overflow-hidden"
                        >
                          <div className="font-semibold text-foreground">Switch Team</div>
                          <div className="text-sm text-muted-foreground">Team A</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                align="start"
                sideOffset={8}
                className="z-[80] w-56"
              >
                <DropdownMenuItem className="h-12 px-4">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-3" />
                    <div>
                      <div className="font-medium">Team A</div>
                      <div className="text-sm text-muted-foreground">Active team</div>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="h-12 px-4">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-3" />
                    <div>
                      <div className="font-medium">Team B</div>
                      <div className="text-sm text-muted-foreground">Secondary team</div>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="h-12 px-4 text-primary">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-3" />
                    <div>
                      <div className="font-medium">Create New Team</div>
                      <div className="text-sm text-muted-foreground">Add a new team</div>
                    </div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navLinks.map((link, index) => (
              <Tooltip key={link.href}>
                <TooltipTrigger asChild>
                  <Link href={link.href}>
                    <Button
                      variant={pathname === link.href ? "secondary" : "ghost"}
                      className={cn(
                        "w-full flex items-center h-12 transition-all duration-200",
                        isCollapsed ? "justify-center px-0" : "justify-start px-3"
                      )}
                    >
                      <motion.div layout="position" className="flex items-center">
                        <motion.div
                          key={isCollapsed ? 'collapsed' : 'expanded'}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={cn(
                            "p-2 rounded-lg transition-colors duration-200 flex-shrink-0",
                            pathname === link.href 
                              ? "bg-primary/10 text-primary" 
                              : "text-muted-foreground"
                          )}
                        >
                          <link.icon className="h-5 w-5" />
                        </motion.div>
                        <AnimatePresence>
                          {!isCollapsed && (
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.2, delay: 0.1 + index * 0.05 }}
                              className="ml-3 text-left whitespace-nowrap overflow-hidden"
                            >
                              <div className="font-medium text-foreground">{link.label}</div>
                              {link.description && <div className="text-sm text-muted-foreground">{link.description}</div>}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </Button>
                  </Link>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" className="z-[80]">
                    <div>
                      <div className="font-medium">{link.label}</div>
                      {link.description && <div className="text-sm text-muted-foreground">{link.description}</div>}
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-border pt-4 mt-4">
          <Button
            onClick={toggleSidebar}
            variant="ghost"
            className={cn(
              "w-full flex items-center h-12 transition-all duration-200",
              isCollapsed ? "justify-center px-0" : "justify-start px-3"
            )}
          >
            <motion.div layout="position" className="flex items-center">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isCollapsed ? "right" : "left"}
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                  className="p-2 rounded-lg bg-accent text-accent-foreground flex-shrink-0"
                >
                  {isCollapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
                </motion.div>
              </AnimatePresence>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                    className="ml-3 font-medium text-foreground whitespace-nowrap overflow-hidden"
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