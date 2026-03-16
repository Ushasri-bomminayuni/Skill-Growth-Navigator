"use client";

import { HeroSection } from "@/components/landing/HeroSection";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Statistics Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-blue-50/10">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Transforming Opportunity Discovery
          </motion.h2>
          <motion.p
            className="text-xl text-muted-foreground mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Connecting students with life-changing opportunities through AI-powered recommendations
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                className="glassmorphic p-8 rounded-xl border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.title}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

const stats = [
  { value: "10,000+", title: "Opportunities Available" },
  { value: "500+", title: "Partner Organizations" },
  { value: "92%", title: "User Satisfaction" }
];