"use client";

import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-transparent">
      <Navbar />
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