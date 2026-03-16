"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/services/auth";
import { getUserApplications, getOpportunity, updateApplicationStatus } from "@/services/database";
import { Loader2, Briefcase, FileText, Calendar, CheckCircle, Clock, XCircle, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchApplications = async () => {
      const user = getCurrentUser();
      
      if (!user) {
        setIsLoading(false);
        router.push("/login");
        return;
      }

      try {
        const apps = await getUserApplications(user.uid);
        
        // Fetch full opportunity data for each application
        const oppsData: any = {};
        await Promise.all(
          apps.map(async (app: any) => {
            const opp = await getOpportunity(app.opportunityId);
            if (opp) oppsData[app.id] = opp;
          })
        );
        
        setApplications(apps);
        setOpportunities(oppsData);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [router]);

  const handleUpdateStatus = async (appId: string, status: string) => {
    try {
      await updateApplicationStatus(appId, status);
      setApplications(prev => prev.map(app => 
        app.id === appId ? { ...app, status } : app
      ));
      toast.success(`Application marked as ${status}`);
    } catch (error) {
      console.error("Failed to update status", error);
      toast.error("Failed to update application status");
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "applied": return { icon: <Clock className="w-4 h-4" />, color: "text-blue-500", bg: "bg-blue-500/10", label: "Applied" };
      case "shortlisted": return { icon: <FileText className="w-4 h-4" />, color: "text-purple-500", bg: "bg-purple-500/10", label: "Shortlisted" };
      case "interview scheduled": return { icon: <Calendar className="w-4 h-4" />, color: "text-orange-500", bg: "bg-orange-500/10", label: "Interview" };
      case "accepted": return { icon: <CheckCircle className="w-4 h-4" />, color: "text-green-500", bg: "bg-green-500/10", label: "Accepted" };
      case "rejected": return { icon: <XCircle className="w-4 h-4" />, color: "text-red-500", bg: "bg-red-500/10", label: "Rejected" };
      default: return { icon: <Clock className="w-4 h-4" />, color: "text-muted-foreground", bg: "bg-muted", label: status };
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex items-center gap-3"
      >
        <div className="p-3 bg-primary/10 rounded-xl">
          <Briefcase className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Application Tracker</h1>
          <p className="text-muted-foreground mt-1">Monitor the status of all your opportunity submissions.</p>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : applications.length > 0 ? (
        <div className="grid gap-4">
          <AnimatePresence>
            {applications.map((application, index) => {
              const opp = opportunities[application.id];
              if (!opp) return null;
              
              const statusConfig = getStatusConfig(application.status || "applied");
              
              return (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-5 rounded-xl border bg-card border-border/50 transition-shadow hover:shadow-md flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       <Badge variant="outline" className={`${statusConfig.bg} ${statusConfig.color} border-0 flex items-center gap-1.5 px-2.5 py-0.5`}>
                         {statusConfig.icon}
                         {statusConfig.label}
                       </Badge>
                       <span className="text-xs text-muted-foreground">
                         Applied {formatDistanceToNow(new Date(application.createdAt?.seconds ? application.createdAt.seconds * 1000 : (application.createdAt || Date.now())), { addSuffix: true })}
                       </span>
                    </div>
                    
                    <h3 className="font-bold text-lg cursor-pointer hover:text-primary transition-colors"
                        onClick={() => router.push(`/opportunities/${opp.id}`)}>
                      {opp.title}
                    </h3>
                    <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                      <Briefcase className="w-4 h-4" /> {opp.organization}
                    </p>
                  </div>
                  
                  <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-3 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-border/50">
                     <Button variant="outline" size="sm" onClick={() => router.push(`/opportunities/${opp.id}`)}>
                       View Details
                     </Button>
                     
                     <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                         <Button variant="ghost" size="sm">
                           Update Status <ChevronDown className="w-4 h-4 ml-2" />
                         </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end">
                         <DropdownMenuItem onClick={() => handleUpdateStatus(application.id, "applied")}>
                           Applied
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleUpdateStatus(application.id, "shortlisted")}>
                           Shortlisted
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleUpdateStatus(application.id, "interview scheduled")}>
                           Interview Scheduled
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleUpdateStatus(application.id, "accepted")}>
                           Accepted
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleUpdateStatus(application.id, "rejected")}>
                           Rejected
                         </DropdownMenuItem>
                       </DropdownMenuContent>
                     </DropdownMenu>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-32 border border-dashed rounded-2xl bg-card/50 flex flex-col items-center"
        >
          <FileText className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-6">
            When you apply for opportunities, use this dashboard to track your application status.
          </p>
          <Button onClick={() => router.push("/opportunities")}>
            Find Opportunities
          </Button>
        </motion.div>
      )}
    </div>
  );
}
