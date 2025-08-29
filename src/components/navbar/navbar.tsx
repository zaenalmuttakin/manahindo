'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Sun, Moon, Code } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

const components: { title: string; href: string; description: string }[] = [
  {
    title: 'Alert Dialog',
    href: '#',
    description: 'A modal dialog that interrupts the user with important content and expects a response.',
  },
  {
    title: 'Hover Card',
    href: '#',
    description: 'For sighted users to preview content available behind a link.',
  },
  {
    title: 'Progress',
    href: '#',
    description: 'Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.',
  },
  {
    title: 'Scroll-area',
    href: '#',
    description: 'Visually or semantically separates content.',
  },
  {
    title: 'Tabs',
    href: '#',
    description: 'A set of layered sections of content—known as tab panels—that are displayed one at a time.',
  },
  {
    title: 'Tooltip',
    href: '#',
    description:
      'A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.',
  },
];

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = 'ListItem';

const ThemeToggle = () => {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label="Toggle theme"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
};

const ProfileMenu = ({ isMobile = false }) => {
  // Placeholder for user data
  const user = { name: 'John Doe', email: 'john.doe@example.com', image: '' };
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        {isMobile && (
          <>
            <DropdownMenuItem asChild>
              <Link href="#">Getting Started</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="#">Components</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="#">Documentation</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const DesktopNav = () => (
  <NavigationMenu className="hidden lg:flex">
    <NavigationMenuList>
      <NavigationMenuItem>
        <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
            <li className="row-span-3">
              <NavigationMenuLink asChild>
                <Link
                  href="/"
                  className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                >
                  <Code className="h-6 w-6" />
                  <div className="mb-2 mt-4 text-lg font-medium">shadcn/ui</div>
                  <p className="text-sm leading-tight text-muted-foreground">
                    Beautifully designed components that you can copy and paste into your apps. Accessible. Customizable.
                    Open Source.
                  </p>
                </Link>
              </NavigationMenuLink>
            </li>
            <ListItem href="#" title="Introduction">
              Re-usable components built using Radix UI and Tailwind CSS.
            </ListItem>
            <ListItem href="#" title="Installation">
              How to install dependencies and structure your app.
            </ListItem>
            <ListItem href="#" title="Typography">
              Styles for headings, paragraphs, lists...etc
            </ListItem>
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuTrigger>Components</NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
            {components.map((component) => (
              <ListItem key={component.title} title={component.title} href={component.href}>
                {component.description}
              </ListItem>
            ))}
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink asChild>
          <Link href="#" className={navigationMenuTriggerStyle()}>
            Documentation
          </Link>
        </NavigationMenuLink>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>
);

export default function Navbar() {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className="sticky top-4 z-50 mx-auto max-w-7xl rounded-xl bg-white/30 shadow-lg ring-1 ring-black/5 backdrop-blur-lg dark:bg-zinc-900/30 dark:ring-white/10"
    >
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <Code className="h-6 w-6" />
            <span className="font-bold">AppName</span>
          </Link>
        </div>

        <div className="flex-1 flex justify-center">
          <DesktopNav />
        </div>

        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <div className="hidden lg:block">
            <ProfileMenu />
          </div>
          <div className="lg:hidden">
            <ProfileMenu isMobile={true} />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
