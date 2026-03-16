"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getOpportunity, isBookmarked, addBookmark, removeBookmark, createApplication } from "@/services/database";
import { getCurrentUser } from "@/services/auth";
import { getRecommendations } from "@/services/recommendations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, Bookmark, ExternalLink, Calendar, MapPin, Briefcase, Award, Sparkles, CheckCircle2 } from "lucide-react";
import { formatDate, daysUntil } from "@/lib/utils";
import { toast } from "sonner";

export default function OpportunityDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  
  const [opportunity, setOpportunity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [compatibility, setCompatibility] = useState<number | null>(null);

  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        const data = await getOpportunity(id);
        if (!data) {
          toast.error("Opportunity not found");
          router.push("/opportunities");
          return;
        }
        setOpportunity(data);
        
        const user = getCurrentUser();
        if (user) {
          setUserId(user.uid);
          const saved = await isBookmarked(user.uid, id);
          setIsSaved(saved);
          
          // Compute AI score using recommendation service
          const recs = await getRecommendations(user.uid);
          const aiMatch = recs.find(r => r.id === id);
          if (aiMatch) {
             setCompatibility(aiMatch.score);
          } else {
             setCompatibility(65); // Fallback mock score if recs not available
          }
        }
      } catch (error) {
        console.error("Error fetching opportunity:", error);
        toast.error("Failed to load opportunity details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOpportunity();
  }, [id, router]);

  const handleBookmarkToggle = async () => {
    if (!userId) {
      toast.error("Please login to save opportunities");
      router.push("/login");
      return;
    }

    try {
      if (isSaved) {
        await removeBookmark(userId, opportunity.id);
        toast.success("Removed from saved opportunities");
      } else {
        await addBookmark(userId, opportunity.id);
        toast.success("Saved opportunity!");
      }
      setIsSaved(!isSaved);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  const handleApply = async () => {
    if (!userId) {
      toast.error("Please login to apply");
      router.push("/login");
      return;
    }

    try {
      await createApplication(userId, id);
      toast.success("Application tracked! Good luck.");
    } catch (error) {
      console.error("Error creating application:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!opportunity) return null;

  const daysLeft = daysUntil(new Date(opportunity.deadline));

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <Button variant="ghost" className="mb-6 -ml-4" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden glassmorphic border-white/20">
          <CardContent className="p-0">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-8 sm:p-12 relative border-b border-border/50">
              <div className="absolute top-8 right-8 flex items-center gap-4">
                {compatibility !== null && (
                  <div className="hidden sm:flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/20">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-primary">{compatibility}% AI Match</span>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="bg-background/80 backdrop-blur-sm"
                  onClick={handleBookmarkToggle}
                >
                  <Bookmark className={`w-5 h-5 ${isSaved ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                </Button>
              </div>

              <div className="max-w-3xl">
                <Badge variant="secondary" className="mb-4">{opportunity.category}</Badge>
                <h1 className="text-3xl sm:text-4xl font-bold mb-4">{opportunity.title}</h1>
                
                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    <span className="font-medium text-foreground">{opportunity.organization}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{opportunity.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Deadline: {formatDate(new Date(opportunity.deadline))}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8 sm:p-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="md:col-span-2 space-y-10">
                  <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">01</span>
                      Overview
                    </h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {opportunity.description}
                    </p>
                  </section>

                  {opportunity.eligibility && (
                    <section>
                      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">02</span>
                        Eligibility
                      </h2>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {opportunity.eligibility}
                      </p>
                    </section>
                  )}

                  {opportunity.benefits && (
                    <section>
                      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                          <Award className="w-4 h-4" />
                        </span>
                        Benefits & Compensation
                      </h2>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {opportunity.benefits}
                      </p>
                    </section>
                  )}
                  
                  {opportunity.application_steps && (
                    <section>
                      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                          <CheckCircle2 className="w-4 h-4" />
                        </span>
                        How to Apply
                      </h2>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {opportunity.application_steps}
                      </p>
                    </section>
                  )}
                </div>

                <div className="md:col-span-1 border-t md:border-t-0 md:border-l border-border/50 pt-8 md:pt-0 md:pl-8">
                  <div className="sticky top-24 space-y-8">
                    {/* Action Card */}
                    <div className="bg-muted/30 rounded-xl p-6 border border-border/50">
                      <h3 className="font-semibold mb-4">Application Status</h3>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-bold text-primary">{daysLeft > 0 ? daysLeft : 0}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Days remaining</p>
                          <p className="text-xs text-muted-foreground">Don&apos;t miss the deadline!</p>
                        </div>
                      </div>
                      <Button 
                        className="w-full mb-3" 
                        size="lg" 
                        asChild
                        onClick={handleApply}
                      >
                        <a href={opportunity.apply_link} target="_blank" rel="noopener noreferrer">
                          Apply Now <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                      </Button>
                      <Button variant="outline" className="w-full" onClick={handleBookmarkToggle}>
                        {isSaved ? "Remove from Saved" : "Save for Later"}
                      </Button>
                    </div>

                    {/* Required Skills */}
                    {opportunity.skills_required && opportunity.skills_required.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-4">Required Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {opportunity.skills_required.map((skill: string) => (
                            <Badge key={skill} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
