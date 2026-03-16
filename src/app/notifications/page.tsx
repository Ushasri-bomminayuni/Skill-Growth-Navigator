"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/services/auth";
import { getUserNotifications, markNotificationAsRead } from "@/services/database";
import { Loader2, Bell, CheckCircle2, Clock, Calendar, Briefcase, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      setIsLoading(false);
      router.push("/login");
      return;
    }

    const { subscribeToNotifications } = require("@/services/database");
    
    const unsubscribe = subscribeToNotifications(user.uid, (data: any[]) => {
      setNotifications(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      ));
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "deadline": return <Clock className="w-5 h-5 text-orange-500" />;
      case "match": return <Briefcase className="w-5 h-5 text-primary" />;
      case "system": return <Bell className="w-5 h-5 text-blue-500" />;
      default: return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Notifications</h1>
              <p className="text-muted-foreground mt-1">Real-time alerts for opportunities and deadlines.</p>
            </div>
          </div>
          
          <Button variant="outline" size="sm" onClick={() => {
            notifications.filter(n => !n.read).forEach(n => handleMarkAsRead(n.id, { stopPropagation: () => {} } as React.MouseEvent));
          }}>
             <CheckCircle2 className="w-4 h-4 mr-2" /> Mark all as read
          </Button>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence>
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`p-5 rounded-xl border transition-colors cursor-pointer flex gap-4 ${
                  notification.read ? "bg-card border-border/50" : "bg-primary/5 border-primary/20"
                }`}
                onClick={() => {
                  if (notification.opportunityId) {
                    if (!notification.read) handleMarkAsRead(notification.id, { stopPropagation: () => {} } as React.MouseEvent);
                    router.push(`/opportunities/${notification.opportunityId}`);
                  }
                }}
              >
                <div className="mt-1">
                  {getIconForType(notification.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h4 className={`font-semibold ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                      {notification.title}
                    </h4>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                      {notification.createdAt?.seconds ? 
                        formatDistanceToNow(new Date(notification.createdAt.seconds * 1000), { addSuffix: true }) 
                        : "Just now"}
                    </span>
                  </div>
                  <p className="text-sm mt-1 text-muted-foreground">
                    {notification.message}
                  </p>
                  
                  {notification.opportunityId && (
                    <Button variant="link" className="p-0 h-auto mt-2 text-primary text-sm flex items-center">
                      View details <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>

                {!notification.read && (
                  <div className="flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-32 border border-dashed rounded-2xl bg-card/50 flex flex-col items-center">
          <Bell className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No notifications yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-6">
            When you receive alerts for new opportunities or approaching deadlines, they will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
