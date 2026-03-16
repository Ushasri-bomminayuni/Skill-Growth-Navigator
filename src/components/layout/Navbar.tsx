"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/config/constants";
import { useRouter } from "next/navigation";
import { getCurrentUser, signOutUser, onAuthStateChange } from "@/services/auth";
import { User } from "@/services/auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search, Bell, Bookmark, User as UserIcon, LogOut, Settings, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const navItems = [
  { name: "Discover", path: "/opportunities", icon: Search },
  { name: "Applications", path: "/applications", icon: Briefcase },
  { name: "Saved", path: "/saved", icon: Bookmark },
  { name: "Alerts", path: "/notifications", icon: Bell },
];

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChange((currentUser) => {
      setUser(currentUser);
    });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      unsubscribeAuth();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-background/80 backdrop-blur-md border-b border-border/20" : "bg-transparent"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/")}
              className="cursor-pointer"
            >
              <h1 className="text-xl font-bold">{APP_NAME}</h1>
            </motion.div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <motion.div key={item.name} whileHover={{ scale: 1.05 }}>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2"
                  onClick={() => router.push(item.path)}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Button>
              </motion.div>
            ))}
          </nav>

          {/* User actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" onClick={() => router.push("/notifications")}>
                  <Bell className="w-5 h-5" />
                </Button>

                <Button variant="ghost" size="icon" onClick={() => router.push("/saved")}>
                  <Bookmark className="w-5 h-5" />
                </Button>

                <motion.div whileHover={{ scale: 1.05 }}>
                  <Avatar className="cursor-pointer" onClick={() => router.push("/profile")}>
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                    <AvatarFallback>
                      {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>

                <Button variant="ghost" size="icon" onClick={handleSignOut}>
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={() => router.push("/login")}>
                  Login
                </Button>
                <Button onClick={() => router.push("/signup")}>Sign Up</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}