'use client'

import { Dispatch, SetStateAction, useRef, useState } from "react";
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
  ClipboardList,
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
  { href: "/", label: "Dashboard", icon: LayoutDashboard, description: "Overview and analytics" },
  { href: "/expenses", label: "Expenses", icon: Wallet, description: "Manage expenses" },
  { href: "/orders/create", label: "Create Order", icon: ClipboardList, description: "Create a new order" },
  { href: "/products", label: "Products", icon: ShoppingBasket, description: "Product catalog" },
  { href: "/settings", label: "Settings", icon: Settings, description: "App configuration" },
];

const MobileNav = ({ onLinkClick }: { onLinkClick: () => void }) => {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background p-4 border-b border-border">
        <div className="flex items-center justify-end mb-2">
          <Button variant="ghost" size="icon" onClick={onLinkClick} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => setIsSearchOpen(true)}
        >
          <Search className="mr-2 h-4 w-4 opacity-50" />
          <span>Cari apapun...</span>
        </Button>
        <GlobalSearch open={isSearchOpen} onOpenChange={setIsSearchOpen} />
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-2">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} onClick={onLinkClick}>
            <Button
              variant={pathname === link.href ? "secondary" : "ghost"}
              className={cn("w-full justify-start h-12 px-4")}
            >
              <link.icon className="mr-3 h-5 w-5 text-muted-foreground" />
              <div className="text-left">
                <div className="font-medium">{link.label}</div>
                {link.description && <div className="text-sm text-muted-foreground">{link.description}</div>}
              </div>
            </Button>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t text-center text-sm text-muted-foreground">
        © 2024 Manahindo
      </div>
    </div>
  );
};

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: Dispatch<SetStateAction<boolean>>;
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(mobileMenuRef, () => {
    if (isMobile) setIsCollapsed(true);
  });

  // Mobile menu
  if (isMobile && !isCollapsed) {
    return (
      <AnimatePresence>
        <motion.div
          ref={mobileMenuRef}
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 h-full w-full max-w-sm bg-background z-[9999] border-r"
        >
          <MobileNav onLinkClick={() => setIsCollapsed(true)} />
        </motion.div>
      </AnimatePresence>
    );
  }

  // Desktop sidebar
  return (
    <TooltipProvider>
      <motion.aside
        initial={{ x: -270, opacity: 0 }}
        animate={{ x: 0, opacity: 1, width: isCollapsed ? 64 : 280 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className={cn(
          "h-screen bg-background shadow-lg border-r flex flex-col fixed top-0 left-0 z-40",
          isCollapsed ? "p-3 w-[50px]" : "p-6 w-64"
        )}
      >
        {/* Nav links */}
        <nav className="flex-1 space-y-2">
          {navLinks.map((link, i) => (
            <Tooltip key={link.href}>
              <TooltipTrigger asChild>
                <Link href={link.href}>
                  <Button
                    variant={pathname === link.href ? "secondary" : "ghost"}
                    className={cn("w-full flex items-center h-12", isCollapsed ? "justify-center" : "justify-start px-3")}
                  >
                    <link.icon className="h-5 w-5" />
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2, delay: i * 0.05 }}
                        className="ml-3"
                      >
                        {link.label}
                      </motion.span>
                    )}
                  </Button>
                </Link>
              </TooltipTrigger>
              {isCollapsed && <TooltipContent side="right">{link.label}</TooltipContent>}
            </Tooltip>
          ))}
        </nav>

        {/* Collapse toggle */}
        <Button
          onClick={() => setIsCollapsed(!isCollapsed)}
          variant="ghost"
          className="w-full flex items-center justify-center mt-4"
        >
          {isCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
          {!isCollapsed && <span className="ml-2">Collapse</span>}
        </Button>
      </motion.aside>
    </TooltipProvider>
  );
}
