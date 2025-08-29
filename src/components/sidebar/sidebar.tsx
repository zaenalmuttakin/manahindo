"use client";

import { useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

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

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const finalIsCollapsed = isMobile ? false : isCollapsed;

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open);
  };

  const sidebarContent = (
    <motion.aside
      initial={false}
      animate={!isMobile ? { width: isCollapsed ? 50 : 250 } : {}}
      transition={{ duration: 0.4 }}
      className={cn(
        "h-screen bg-white/10 backdrop-blur-lg shadow-lg rounded-r-2xl flex flex-col",
        finalIsCollapsed ? "p-2" : "p-4",
        isMobile ? "w-full" : "fixed top-0 left-0 z-60",
        isMobile && "pt-12"
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
                  finalIsCollapsed ? "justify-center" : "justify-start"
                )}
              >
                <motion.div layout="position" className="flex items-center">
                  <Users className="h-6 w-6" />
                  <AnimatePresence>
                    {!finalIsCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.1, delay: 0.1 }}
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
              side={finalIsCollapsed ? "right" : "bottom"}
              align={finalIsCollapsed ? "start" : "center"}
              sideOffset={8}
              className="z-[61]"
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
                    <Link href={link.href} onClick={() => isMobile && setIsSheetOpen(false)}>
                      <Button
                        variant={pathname === link.href ? "secondary" : "ghost"}
                        className={cn(
                          "w-full flex items-center",
                          finalIsCollapsed ? "justify-center" : "justify-start"
                        )}
                      >
                        <motion.div layout="position" className="flex items-center">
                          <motion.div
                            key={finalIsCollapsed.toString()}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                          >
                            <link.icon className="h-6 w-6" />
                          </motion.div>
                          <AnimatePresence>
                            {!finalIsCollapsed && (
                              <motion.span
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.1, delay: 0.1 + index * 0.05 }}
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
                  {finalIsCollapsed && (
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
      {!isMobile && (
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
                  transition={{ duration: 0.1 }}
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
                    transition={{ duration: 0.1, delay: 0.1 + navLinks.length * 0.05 }}
                    className="ml-4 whitespace-nowrap"
                  >
                    Collapse
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </Button>
        </div>
      )}
    </motion.aside>
  );

  if (isMobile) {
    return (
      <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetTrigger asChild>
          <Button
            size="icon"
            className="fixed bottom-4 left-4 rounded-full shadow-lg z-60 bg-white/30 text-zinc-900 backdrop-blur-lg ring-1 ring-black/5 hover:bg-white/50 dark:bg-zinc-900/30 dark:text-zinc-50 dark:ring-white/10 dark:hover:bg-zinc-900/50"
          >
            <ChevronsRight className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SheetTitle className="sr-only">Sidebar Menu</SheetTitle>
          {sidebarContent}
        </SheetContent>
      </Sheet>
    );
  }

  return <TooltipProvider>{sidebarContent}</TooltipProvider>;
}
