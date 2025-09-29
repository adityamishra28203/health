"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Heart, 
  Shield, 
  FileText, 
  Bell, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Sun,
  Moon,
  User as UserIcon,
  CreditCard,
  Building2
} from "lucide-react";

import { authService, User } from '@/lib/auth';
import SettingsModal from '@/components/settings/SettingsModal';

interface HeaderProps {
  user?: User;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onUserUpdate?: (updatedUser: User) => void;
}

export default function Header({ user, darkMode, onToggleDarkMode, onUserUpdate }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  // Update local user state when prop changes
  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  // Listen for auth state changes to refresh user data
  useEffect(() => {
    const handleAuthStateChanged = () => {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setCurrentUser(userData);
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error);
        }
      }
    };

    window.addEventListener('auth-state-changed', handleAuthStateChanged);
    
    return () => {
      window.removeEventListener('auth-state-changed', handleAuthStateChanged);
    };
  }, []);

  const navigationItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Heart className="h-4 w-4" />,
    },
    {
      title: "Health Records",
      href: "/records",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      title: "Hospitals",
      href: "/hospital",
      icon: <Building2 className="h-4 w-4" />,
    },
    {
      title: "Insurance",
      href: "/insurance",
      icon: <Shield className="h-4 w-4" />,
    },
    {
      title: "Claims",
      href: "/claims",
      icon: <CreditCard className="h-4 w-4" />,
    },
  ];

  const handleLogout = async () => {
    try {
      // Use auth service logout (it handles all cleanup)
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Redirect to landing page
    window.location.replace("/");
  };

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };

  const handleUserUpdate = (updatedUser: User) => {
    if (onUserUpdate) {
      onUserUpdate(updatedUser);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href={currentUser ? "/dashboard" : "/"} className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">SecureHealth</span>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navigationItems.map((item) => (
              <NavigationMenuItem key={item.title}>
                <NavigationMenuLink asChild>
                  <Link href={item.href} className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    <div className="flex items-center space-x-2">
                      {item.icon}
                      <span>{item.title}</span>
                    </div>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Dark mode toggle */}
          <div className="flex items-center space-x-2">
            <Sun className="h-4 w-4" />
            <Switch
              checked={darkMode}
              onCheckedChange={onToggleDarkMode}
              className="data-[state=checked]:bg-primary"
            />
            <Moon className="h-4 w-4" />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
              3
            </Badge>
          </Button>

          {/* User menu */}
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.avatar} alt={`${currentUser.firstName} ${currentUser.lastName}`} />
                    <AvatarFallback>
                      {`${currentUser.firstName[0]}${currentUser.lastName[0]}`}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{`${currentUser.firstName} ${currentUser.lastName}`}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser.email}
                    </p>
                    <Badge variant="secondary" className="w-fit">
                      {currentUser.role}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSettingsClick}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button asChild>
                <Link href="/">Go to Landing Page</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t bg-background md:hidden"
        >
          <div className="container py-4">
            <nav className="flex flex-col space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              ))}
            </nav>
          </div>
        </motion.div>
      )}

      {/* Settings Modal */}
      {currentUser && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          user={currentUser}
          onUpdate={handleUserUpdate}
        />
      )}
    </header>
  );
}
