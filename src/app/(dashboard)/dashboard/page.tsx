"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { OpportunityCard } from "@/components/cards/OpportunityCard";
import { getOpportunities, getUserBookmarks, getUserApplications } from "@/services/database";
import { getCurrentUser } from "@/services/auth";
import { Loader2, Bookmark, Bell, TrendingUp, Clock, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getRecommendations } from "@/services/recommendations";
import { format } from "date-fns";

const formatDate = (date: Date) => {
  try {
    return format(date, "MMM dd, yyyy");
  } catch (e) {
    return "N/A";
  }
};

export default function DashboardPage() {
  const [recommendedOpportunities, setRecommendedOpportunities] = useState<any[]>([]);
  const [trendingOpportunities, setTrendingOpportunities] = useState<any[]>([]);
  const [savedOpportunities, setSavedOpportunities] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const user = getCurrentUser();
        if (!user) {
          router.push("/login");
          return;
        }

        // Fetch recommended opportunities using AI engine
        const recs = await getRecommendations(user.uid);
        const recommended = await Promise.all(
          recs.map(async (rec: any) => await getOpportunities({ limit: 1 }).then(ops => ops.find((o: any) => o.id === rec.id) || ops[0]))
        );
        setRecommendedOpportunities(recommended.slice(0, 6));

        // Fetch trending opportunities
        const trending = await getOpportunities({ sortBy: "views", limit: 6 });
        setTrendingOpportunities(trending);

        // Fetch saved opportunities
        const bookmarks = await getUserBookmarks(user.uid);
        const saved = await Promise.all(
          bookmarks.map(async (bookmark: any) => {
            const opportunity = await getOpportunities({ limit: 1, where: { id: bookmark.opportunityId } });
            return opportunity[0];
          })
        );
        setSavedOpportunities(saved.filter(Boolean));

        // Fetch applications
        const apps = await getUserApplications(user.uid);
        const appsWithDetails = await Promise.all(
          apps.map(async (app: any) => {
            const opportunity = await getOpportunities({ limit: 1, where: { id: app.opportunityId } });
            return { ...app, opportunity: opportunity[0] };
          })
        );
        setApplications(appsWithDetails.filter(Boolean));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

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
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back!</h1>
        <p className="text-xl text-muted-foreground">Here are your personalized opportunities</p>
      </motion.div>

      {/* Recommended opportunities */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6" /> Recommended for You
          </h2>
          <button
            onClick={() => router.push("/opportunities")}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            View all →
          </button>
        </div>
        {recommendedOpportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedOpportunities.map((opportunity, index) => (
              <motion.div
                key={opportunity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <OpportunityCard opportunity={opportunity} />
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No recommended opportunities found
            </CardContent>
          </Card>
        )}
      </motion.section>

      {/* Trending opportunities */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6" /> Trending Opportunities
          </h2>
          <button
            onClick={() => router.push("/opportunities")}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            View all →
          </button>
        </div>
        {trendingOpportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingOpportunities.map((opportunity, index) => (
              <motion.div
                key={opportunity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <OpportunityCard opportunity={opportunity} />
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No trending opportunities found
            </CardContent>
          </Card>
        )}
      </motion.section>

      {/* Saved opportunities */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bookmark className="w-6 h-6" /> Saved Opportunities
          </h2>
          <button
            onClick={() => router.push("/saved")}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            View all →
          </button>
        </div>
        {savedOpportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedOpportunities.slice(0, 3).map((opportunity, index) => (
              <motion.div
                key={opportunity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <OpportunityCard opportunity={opportunity} />
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              You haven't saved any opportunities yet
            </CardContent>
          </Card>
        )}
      </motion.section>

      {/* Application tracker */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="w-6 h-6" /> Application Tracker
          </h2>
          <button
            onClick={() => router.push("/applications")}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            View all →
          </button>
        </div>
        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.slice(0, 3).map((application, index) => (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{application.opportunity.title}</CardTitle>
                      <CardDescription>{application.opportunity.organization}</CardDescription>
                    </div>
                    <Badge variant={getStatusBadgeVariant(application.status)}>
                      {application.status}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Applied on {formatDate(new Date(application.createdAt))}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Updated on {formatDate(new Date(application.updatedAt))}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              You haven't applied to any opportunities yet
            </CardContent>
          </Card>
        )}
      </motion.section>
    </div>
  );
}

function getStatusBadgeVariant(status: string) {
  switch (status.toLowerCase()) {
    case "applied":
      return "secondary";
    case "shortlisted":
      return "default";
    case "interview":
      return "default";
    case "rejected":
      return "destructive";
    default:
      return "secondary";
  }
}