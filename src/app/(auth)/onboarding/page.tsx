"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { getCurrentUser } from "@/services/auth";
import { updateUserProfile, getUserProfile } from "@/services/database";
import { YEARS_OF_STUDY } from "@/config/constants";
import { Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const [userId, setUserId] = useState("");
  const [college, setCollege] = useState("");
  const [year, setYear] = useState("");
  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const user = getCurrentUser();
      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.uid);

      // Check if user already has a profile
      const profile = await getUserProfile(user.uid);
      if (profile) {
        if (profile.college && profile.year) {
          router.push("/dashboard");
        } else {
          // Pre-fill existing data
          setCollege(profile.college || "");
          setYear(profile.year || "");
          setSkills(profile.skills?.join(", ") || "");
          setInterests(profile.interests?.join(", ") || "");
          setLocation(profile.location || "");
        }
      }
      setIsLoading(false);
    };

    fetchUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateUserProfile(userId, {
        college,
        year,
        skills: skills.split(',').map(skill => skill.trim()).filter(skill => skill),
        interests: interests.split(',').map(interest => interest.trim()).filter(interest => interest),
        location
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        className="text-center"
      >
        <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
        <p className="text-muted-foreground">Help us find the best opportunities for you</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="college">College / University</Label>
          <Input
            id="college"
            placeholder="e.g. Stanford University"
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Year of Study</Label>
          <Select value={year} onValueChange={setYear} required>
            <SelectTrigger>
              <SelectValue placeholder="Select your year" />
            </SelectTrigger>
            <SelectContent>
              {YEARS_OF_STUDY.map((yearOption) => (
                <SelectItem key={yearOption} value={yearOption}>
                  {yearOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="skills">Skills (comma separated)</Label>
          <Input
            id="skills"
            placeholder="e.g. JavaScript, Python, React, Machine Learning"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="interests">Interests (comma separated)</Label>
          <Input
            id="interests"
            placeholder="e.g. Web Development, AI, Data Science, Entrepreneurship"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="e.g. San Francisco, CA or Remote"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving Profile...
            </>
          ) : (
            "Complete Profile"
          )}
        </Button>
      </form>
    </div>
  );
}