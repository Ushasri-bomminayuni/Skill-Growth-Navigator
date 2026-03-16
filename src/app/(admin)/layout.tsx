"use client";

import { motion } from "framer-motion";
import { AdminNavbar } from "@/components/layout/AdminNavbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-transparent">
      <AdminNavbar />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        {children}
      </motion.main>
    </div>
  );
}