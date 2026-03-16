"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { APP_NAME, APP_DESCRIPTION } from "@/config/constants";
import { Bot, Search, Bookmark, Bell } from "lucide-react";
import { useRouter } from "next/navigation";

const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const fadeInAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

export function HeroSection() {
  const router = useRouter();
  return (
    <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
      {/* Background shapes */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto text-center">
        {/* Animated robot */}
        <motion.div
          className="mb-12"
          initial="initial"
          animate="animate"
          variants={floatingAnimation}
        >
          <div className="inline-block p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            <Bot className="w-24 h-24 text-blue-500" />
          </div>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          initial="initial"
          animate="animate"
          variants={fadeInAnimation}
          transition={{ delay: 0.2 }}
        >
          {APP_NAME}
        </motion.h1>

        {/* Subheading */}
        <motion.p
          className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto"
          initial="initial"
          animate="animate"
          variants={fadeInAnimation}
          transition={{ delay: 0.4 }}
        >
          {APP_DESCRIPTION}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          initial="initial"
          animate="animate"
          variants={fadeInAnimation}
          transition={{ delay: 0.6 }}
        >
          <Button size="lg" className="text-lg px-8 py-6" onClick={() => router.push("/signup")}>
            Get Started
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8 py-6" onClick={() => router.push("/opportunities")}>
            Explore Opportunities
          </Button>
        </motion.div>

        {/* Features preview */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          initial="initial"
          animate="animate"
          variants={fadeInAnimation}
          transition={{ delay: 0.8 }}
        >
          <div className="glassmorphic p-6 rounded-xl border border-white/20">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="font-semibold mb-2">AI-Powered Search</h3>
            <p className="text-sm text-muted-foreground">Find opportunities tailored to your skills and interests.</p>
          </div>

          <div className="glassmorphic p-6 rounded-xl border border-white/20">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <Bookmark className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="font-semibold mb-2">Save & Track</h3>
            <p className="text-sm text-muted-foreground">Bookmark opportunities and track your applications.</p>
          </div>

          <div className="glassmorphic p-6 rounded-xl border border-white/20">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
              <Bell className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="font-semibold mb-2">Smart Alerts</h3>
            <p className="text-sm text-muted-foreground">Get notified about new opportunities and deadlines.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}