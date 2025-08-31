'use client';

import { useState } from "react";
import Navbar from "@/components/navbar/navbar";
import { Sidebar } from "@/components/sidebar/sidebar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={handleMobileMenuToggle}
      />
      <div className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        isMobile ? "ml-0" : isCollapsed ? "ml-16" : "ml-72"
      )}>
        <div className="min-h-screen flex flex-col w-full">
          <Navbar 
            onMobileMenuToggle={handleMobileMenuToggle}
            isMobile={isMobile}
          />
          <main className="flex-1 w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
