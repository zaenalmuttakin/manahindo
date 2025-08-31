"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DialogProps } from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { Search, FileText, Settings, Wallet, ShoppingBasket, Users, Home, Calendar, BarChart3 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
    DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
      className
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

interface GlobalSearchProps extends DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const searchItems = [
  {
    title: "Dashboard",
    description: "Overview and analytics",
    icon: Home,
    href: "/",
    category: "Navigation",
  },
  {
    title: "Expenses",
    description: "Manage expenses and transactions",
    icon: Wallet,
    href: "/expenses",
    category: "Management",
  },
  {
    title: "Products",
    description: "Product catalog and inventory",
    icon: ShoppingBasket,
    href: "/products",
    category: "Management",
  },
  {
    title: "Settings",
    description: "App configuration and preferences",
    icon: Settings,
    href: "/settings",
    category: "System",
  },
  {
    title: "Team Management",
    description: "Manage team members and roles",
    icon: Users,
    href: "/team",
    category: "Management",
  },
  {
    title: "Reports",
    description: "Analytics and reporting",
    icon: BarChart3,
    href: "/reports",
    category: "Analytics",
  },
  {
    title: "Calendar",
    description: "Schedule and events",
    icon: Calendar,
    href: "/calendar",
    category: "Tools",
  },
  {
    title: "Documents",
    description: "Files and documentation",
    icon: FileText,
    href: "/documents",
    category: "Content",
  },
];

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");

  const filteredItems = React.useMemo(() => {
    if (!search) return searchItems;
    
    const searchLower = search.toLowerCase();
    return searchItems.filter(
      (item) =>
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower)
    );
  }, [search]);

  const handleSelect = React.useCallback((href: string) => {
    router.push(href);
    onOpenChange?.(false);
    setSearch("");
  }, [router, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-lg z-[9999]">
        <DialogTitle className="sr-only">Global Search</DialogTitle>
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Search anything..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No results found.
              </div>
            ) : (
              <div className="p-2">
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.href}
                      variant="ghost"
                      className="w-full justify-start gap-3 h-auto p-3"
                      onClick={() => handleSelect(item.href)}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <div className="flex flex-col items-start text-left">
                        <div className="font-medium text-foreground">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                        <div className="text-xs text-muted-foreground/70 mt-1 px-2 py-1 rounded-full bg-muted">
                          {item.category}
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between border-t px-2 py-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Press</span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                <span className="text-xs">⌘</span>K
              </kbd>
              <span>to search</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Navigate with</span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                ↑
              </kbd>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                ↓
              </kbd>
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
