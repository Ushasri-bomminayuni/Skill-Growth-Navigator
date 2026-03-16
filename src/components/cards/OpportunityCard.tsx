"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Calendar, MapPin, Briefcase, ExternalLink } from "lucide-react";
import { daysUntil, formatDate, truncateText, calculateCompatibilityScore } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { addBookmark, removeBookmark, isBookmarked } from "@/services/database";
import { getCurrentUser } from "@/services/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function OpportunityCard({ opportunity }: { opportunity: any }) {
  const [isSaved, setIsSaved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUserId(user.uid);
      checkBookmarkStatus(user.uid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opportunity.id]);

  const checkBookmarkStatus = async (uid: string) => {
    try {
      const saved = await isBookmarked(uid, opportunity.id);
      setIsSaved(saved);
    } catch (error) {
      console.error("Error checking bookmark status:", error);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!userId) {
      router.push("/login");
      return;
    }

    try {
      if (isSaved) {
        await removeBookmark(userId, opportunity.id);
      } else {
        await addBookmark(userId, opportunity.id);
      }
      setIsSaved(!isSaved);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  const daysLeft = daysUntil(new Date(opportunity.deadline));
  const isUrgent = daysLeft <= 7;
  const isExpired = daysLeft < 0;

  // Use provided score (from AI) or calculate it
  const compatibilityScore = opportunity.score || (opportunity.skills_required ?
    calculateCompatibilityScore(["JavaScript", "React", "TypeScript", "Python", "Node.js"], opportunity.skills_required) : 0);

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{opportunity.organization}</span>
          </div>
          <CardTitle className="text-lg">{opportunity.title}</CardTitle>
          <CardDescription className="mt-1">
            {opportunity.category}
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleBookmarkToggle}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? "fill-primary text-primary" : "text-muted-foreground"}`} />
        </Button>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground mb-4">
          {truncateText(opportunity.description, 120)}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {opportunity.skills_required?.slice(0, 3).map((skill: string) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {opportunity.skills_required?.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{opportunity.skills_required.length - 3} more
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{opportunity.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>
              {isExpired ? "Expired" : isUrgent ? `Closes in ${daysLeft} days` : `Closes on ${formatDate(new Date(opportunity.deadline))}`}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-300">
              {compatibilityScore}%
            </span>
          </div>
          <span className="text-sm text-muted-foreground">Match</span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link href={`/opportunities/${opportunity.id}`}>
              View Details
            </Link>
          </Button>
          <Button size="sm" asChild>
            <a href={opportunity.apply_link} target="_blank" rel="noopener noreferrer">
              Apply <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}