"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getCurrentUser, signOutUser } from "@/services/auth";
import { getUserProfile, updateUserProfile } from "@/services/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, LogOut, Save, User as UserIcon, Mail, Building, MapPin, GraduationCap } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [location, setLocation] = useState("");
  const [year, setYear] = useState("");
  
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);
      
      const userProfile = await getUserProfile(currentUser.uid);
      if (userProfile) {
        setProfile(userProfile);
        setName(userProfile.displayName || currentUser.displayName || "");
        setCollege(userProfile.college || "");
        setLocation(userProfile.location || "");
        setYear(userProfile.year || "");
      }
      setIsLoading(false);
    };
    fetchData();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile(user.uid, {
        displayName: name,
        college,
        location,
        year,
      });
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-1/3 space-y-6">
            <Card className="glassmorphic border-white/20 overflow-hidden">
              <CardContent className="pt-8 pb-6 flex flex-col items-center text-center">
                <div className="relative mb-4 group">
                  <Avatar className="w-24 h-24 border-2 border-primary/20">
                    <AvatarImage src={user?.photoURL || ""} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <span className="text-white text-xs font-medium">Change</span>
                  </div>
                </div>
                <h2 className="text-xl font-bold">{name || "Your Name"}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <Badge variant="secondary" className="mt-4">Student Account</Badge>
              </CardContent>
              <CardFooter className="bg-muted/30 border-t border-border/50 p-4">
                <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Card className="glassmorphic border-white/20">
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your personal information and preferences.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4" /> Full Name
                      </Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Email Address
                      </Label>
                      <Input id="email" value={user?.email || ""} disabled className="bg-muted/50" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="college" className="flex items-center gap-2">
                      <Building className="w-4 h-4" /> College / University
                    </Label>
                    <Input id="college" value={college} onChange={(e) => setCollege(e.target.value)} placeholder="Stanford University" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location" className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Location
                      </Label>
                      <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="San Francisco, CA" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year" className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" /> Year of Study
                      </Label>
                      <Input id="year" value={year} onChange={(e) => setYear(e.target.value)} placeholder="Junior Year" />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button type="submit" className="w-full sm:w-auto px-8" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" /> Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
