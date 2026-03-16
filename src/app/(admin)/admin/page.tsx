"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getOpportunities, getUserProfiles, updateUserProfile } from "@/services/database";
import { getCurrentUser } from "@/services/auth";
import { Loader2, Briefcase, Users, TrendingUp, Clock } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { seedInitialOpportunities } from "@/services/seed";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalOpportunities: 0,
    totalUsers: 0,
    activeOpportunities: 0,
    pendingApproval: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch opportunities
        const opportunities = await getOpportunities();
        const activeOps = opportunities.filter((op: any) => new Date(op.deadline) > new Date());
        const pendingOps = opportunities.filter((op: any) => !op.verified);

        // Fetch users
        const users = await getUserProfiles();

        // Set stats
        setStats({
          totalOpportunities: opportunities.length,
          totalUsers: users.length,
          activeOpportunities: activeOps.length,
          pendingApproval: pendingOps.length,
        });

        // Prepare chart data (placeholder - will be enhanced with real data)
        const categoryData = opportunities.reduce((acc: any[], op: any) => {
          const existing = acc.find((item: any) => item.name === op.category);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ name: op.category, count: 1 });
          }
          return acc;
        }, []);

        setChartData(categoryData);
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const user = getCurrentUser();
      if (!user) throw new Error("Please sign in first.");

      // Force update user profile to admin if it matches our pattern
      if (user.email?.toLowerCase().includes("admin")) {
        await updateUserProfile(user.uid, { 
          isAdmin: true,
          email: user.email,
          displayName: user.displayName || "Admin User"
        });
        toast.success("Current user promoted to Admin in database!");
      }

      await seedInitialOpportunities();
      toast.success("Initial opportunities seeded successfully!");
      
      // Manual refresh of the stats
      window.location.reload();
    } catch (error: any) {
      console.error("Seeding failed", error);
      toast.error(`Seeding failed: ${error.message || "Please check Firestore rules and auth state."}`);
    } finally {
      setIsSeeding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-xl text-muted-foreground mt-1">Manage opportunities and users</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleSeedData}
            disabled={isSeeding}
            className="flex items-center gap-2"
          >
            {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Briefcase className="w-4 h-4" />}
            Seed Initial Data
          </Button>
        </div>
      </motion.div>

      {/* Stats cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Opportunities</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalOpportunities)}</div>
            <p className="text-xs text-muted-foreground">All opportunities in the system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalUsers)}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Opportunities</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.activeOpportunities)}</div>
            <p className="text-xs text-muted-foreground">Opportunities with upcoming deadlines</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.pendingApproval)}</div>
            <p className="text-xs text-muted-foreground">Opportunities awaiting approval</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card className="h-96">
          <CardHeader>
            <CardTitle>Opportunities by Category</CardTitle>
            <CardDescription>Distribution of opportunities across categories</CardDescription>
          </CardHeader>
          <CardContent className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="h-96">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">New opportunity added</div>
                    <div className="text-sm text-muted-foreground">Internship at Tech Corp</div>
                  </div>
                  <div className="text-sm text-muted-foreground">2 hours ago</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}