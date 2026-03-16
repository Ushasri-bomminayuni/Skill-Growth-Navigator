"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getOpportunities } from "@/services/database";
import { OpportunityCard } from "@/components/cards/OpportunityCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Filter } from "lucide-react";
import { OPPORTUNITY_CATEGORIES } from "@/config/constants";

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    const fetchOpportunities = async () => {
      setIsLoading(true);
      try {
        const data = await getOpportunities();
        setOpportunities(data);
        setFilteredOpportunities(data);
      } catch (error) {
        console.error("Error fetching opportunities:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  useEffect(() => {
    let result = opportunities;
    
    if (searchTerm) {
      result = result.filter(opp => 
        opp.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        opp.organization.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter && categoryFilter !== "All") {
      result = result.filter(opp => opp.category === categoryFilter);
    }
    
    setFilteredOpportunities(result);
  }, [searchTerm, categoryFilter, opportunities]);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Discover Opportunities</h1>
        <p className="text-muted-foreground mb-8">
          Find the perfect internship, scholarship, or hackathon matching your skills.
        </p>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search by title or organization..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {OPPORTUNITY_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredOpportunities.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {filteredOpportunities.map((opportunity, index) => (
            <motion.div
              key={opportunity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
               <OpportunityCard opportunity={opportunity} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-20 border rounded-xl bg-card text-muted-foreground">
          <p>No opportunities found matching your filters.</p>
          <Button 
            variant="link" 
            onClick={() => { setSearchTerm(""); setCategoryFilter("All"); }}
            className="mt-2"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
