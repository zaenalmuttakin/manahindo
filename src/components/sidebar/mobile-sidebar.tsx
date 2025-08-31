'use client';

import { useRef } from "react";
import {
  LayoutDashboard,
  ShoppingBasket,
  Settings,
  Wallet,
  Users
} from "lucide-react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

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
          <DropdownMenuContent side="bottom" align="start" className="w-[220px] z-[52]">
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

export function MobileSidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (isOpen: boolean) => void }) {
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={mobileMenuRef}
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-[4rem] left-0 h-[calc(100vh-4rem)] w-72 bg-background/80 backdrop-blur-lg border-r z-51 flex flex-col lg:hidden"
        >
          <MobileNav onLinkClick={() => setIsOpen(false)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}