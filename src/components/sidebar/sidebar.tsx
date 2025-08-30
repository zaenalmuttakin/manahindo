'use client';

import { useState } from "react";
import {
  ChevronsLeft,
  ChevronsRight,
  LayoutDashboard,
  ShoppingBasket,
  Settings,
  Wallet,
  Users,
  ListCheckIcon,
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
    href: "/orders/create",
    label: "Create Order",
    icon: ListCheckIcon,
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

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // If desktop, render the standard collapsible sidebar
  return (
    <TooltipProvider>
      <motion.aside
        initial={{ x: -270, opacity: 0 }}
        animate={{
          x: 0,
          opacity: 1,
          width: isCollapsed ? 50 : 250,
        }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className={cn(
          "h-[calc(100vh-4rem)] fixed top-[4rem] left-0 z-51 bg-background/80 backdrop-blur-lg border-r flex-col hidden lg:flex",
          isCollapsed ? "p-2 w-[50px]" : "p-4 w-64"
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
                  <div className="flex items-center">
                    <div className="w-6 flex-shrink-0">
                      <Users className="h-6 w-6" />
                    </div>
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: "auto", opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-4 whitespace-nowrap overflow-hidden"
                        >
                          Switch Team
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side={isCollapsed ? "right" : "bottom"}
                align={isCollapsed ? "start" : "center"}
                sideOffset={8}
                className="z-[52] w-48"
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
                          <div className="flex items-center">
                            <div className="w-6 flex-shrink-0">
                              <link.icon className="h-6 w-6" />
                            </div>
                            <AnimatePresence>
                              {!isCollapsed && (
                                <motion.span
                                  initial={{ width: 0, opacity: 0 }}
                                  animate={{ width: "auto", opacity: 1 }}
                                  exit={{ width: 0, opacity: 0 }}
                                  transition={{ duration: 0.2, delay: 0.1 + index * 0.05 }}
                                  className="ml-4 whitespace-nowrap overflow-hidden"
                                >
                                  {link.label}
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </div>
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    {isCollapsed && (
                      <TooltipContent side="right" className="z-[52]">
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
            className={cn("w-full flex items-center", isCollapsed ? "justify-center" : "justify-start")}>
            <div className="flex items-center">
                <div className="flex items-center">
                  {isCollapsed ? <ChevronsRight className="h-8 w-8" /> : <ChevronsLeft className="h-8 w-8" />}
                </div>
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
            </div>
          </Button>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}