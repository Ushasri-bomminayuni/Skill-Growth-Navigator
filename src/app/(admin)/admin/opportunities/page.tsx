"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getOpportunities, updateOpportunity } from "@/services/database";
import { Loader2, Search, Plus, Edit, Trash2, Check, X, Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

export default function AdminOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchOpportunities = async () => {
      setIsLoading(true);
      try {
        const data = await getOpportunities();
        setOpportunities(data);
      } catch (error) {
        console.error("Error fetching opportunities:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  const handleApprove = async (opportunityId: string) => {
    try {
      await updateOpportunity(opportunityId, { verified: true });
      setOpportunities(opportunities.map(op =>
        op.id === opportunityId ? { ...op, verified: true } : op
      ));
    } catch (error) {
      console.error("Error approving opportunity:", error);
    }
  };

  const handleReject = async (opportunityId: string) => {
    try {
      await updateOpportunity(opportunityId, { verified: false });
      setOpportunities(opportunities.map(op =>
        op.id === opportunityId ? { ...op, verified: false } : op
      ));
    } catch (error) {
      console.error("Error rejecting opportunity:", error);
    }
  };

  const filteredOpportunities = opportunities.filter(opportunity =>
    opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opportunity.organization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Briefcase className="w-6 h-6" /> Opportunities
          </h1>
          <Button onClick={() => router.push("/admin/opportunities/new")}>
            <Plus className="w-4 h-4 mr-2" />
            New Opportunity
          </Button>
        </div>
        <p className="text-muted-foreground mt-1">Manage all opportunities in the system</p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search opportunities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      {/* Opportunities list */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {filteredOpportunities.length > 0 ? (
          <div className="space-y-4">
            {filteredOpportunities.map((opportunity, index) => (
              <motion.div
                key={opportunity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                        {!opportunity.verified && (
                          <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full">Pending Approval</span>
                        )}
                      </div>
                      <CardDescription>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{opportunity.organization}</span>
                          <span>{opportunity.category}</span>
                          <span>Deadline: {formatDate(new Date(opportunity.deadline))}</span>
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/opportunities/${opportunity.id}`)}
                      >
                        <Edit className="w-3 h-3 mr-1" /> Edit
                      </Button>
                      {!opportunity.verified ? (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleApprove(opportunity.id)}
                        >
                          <Check className="w-3 h-3 mr-1" /> Approve
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReject(opportunity.id)}
                        >
                          <X className="w-3 h-3 mr-1" /> Reject
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {opportunity.description.substring(0, 150)}...
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Briefcase className="w-8 h-8 mx-auto mb-4" />
              <p>No opportunities found</p>
              <p className="text-sm mt-2">Create a new opportunity to get started</p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}