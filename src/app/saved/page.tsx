"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/services/auth";
import { getUserBookmarks, getOpportunity } from "@/services/database";
import { OpportunityCard } from "@/components/cards/OpportunityCard";
import { Loader2, Bookmark as BookmarkIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function SavedOpportunitiesPage() {
  const [savedOpportunities, setSavedOpportunities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSaved = async () => {
      const user = getCurrentUser();
      
      if (!user) {
        setIsLoading(false);
        router.push("/login");
        return;
      }

      try {
        const bookmarks = await getUserBookmarks(user.uid);
        
        // Fetch full opportunity data for each bookmark
        const opportunitiesData = await Promise.all(
          bookmarks.map(async (bm) => {
            const opp = await getOpportunity(bm.opportunityId);
            return opp;
          })
        );
        
        // Filter out any nulls if an opportunity was deleted
        setSavedOpportunities(opportunitiesData.filter(opp => opp !== null));
      } catch (error) {
        console.error("Error fetching saved opportunities:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSaved();
  }, [router]);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex items-center gap-3"
      >
        <div className="p-3 bg-primary/10 rounded-xl">
          <BookmarkIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Saved Opportunities</h1>
          <p className="text-muted-foreground mt-1">Keep track of opportunities you want to apply for.</p>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : savedOpportunities.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {savedOpportunities.map((opportunity, index) => (
            <motion.div
              key={opportunity.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
               <OpportunityCard opportunity={opportunity} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-32 border border-dashed rounded-2xl bg-card/50 flex flex-col items-center"
        >
          <BookmarkIcon className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No saved opportunities</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            You haven't saved any opportunities yet. Browse the discovery page to find and bookmark opportunities that match your interests.
          </p>
          <Button onClick={() => router.push("/opportunities")}>
            Discover Opportunities
          </Button>
        </motion.div>
      )}
    </div>
  );
}
