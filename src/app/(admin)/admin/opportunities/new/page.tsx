"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createOpportunity } from "@/services/database";
import { OPPORTUNITY_CATEGORIES, LOCATION_TYPES } from "@/config/constants";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function NewOpportunityPage() {
  const [title, setTitle] = useState("");
  const [organization, setOrganization] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [deadline, setDeadline] = useState("");
  const [location, setLocation] = useState("");
  const [applyLink, setApplyLink] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [benefits, setBenefits] = useState("");
  const [applicationSteps, setApplicationSteps] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const opportunityId = await createOpportunity({
        title,
        organization,
        category,
        description,
        skills_required: skills.split(',').map(skill => skill.trim()).filter(skill => skill),
        deadline: new Date(deadline),
        location,
        apply_link: applyLink,
        eligibility,
        benefits,
        application_steps: applicationSteps,
      });

      toast.success("Opportunity created successfully!");

      router.push(`/admin/opportunities/${opportunityId}`);
    } catch (error) {
      console.error("Error creating opportunity:", error);
      toast.error("Failed to create opportunity. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button variant="ghost" onClick={() => router.push("/admin/opportunities")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Opportunities
        </Button>
        <h1 className="text-3xl font-bold mt-4">Create New Opportunity</h1>
        <p className="text-muted-foreground mt-1">Add a new opportunity to the platform</p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization">Organization</Label>
            <Input
              id="organization"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {OPPORTUNITY_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location Type</Label>
            <Select value={location} onValueChange={setLocation} required>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {LOCATION_TYPES.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="skills">Skills Required (comma separated)</Label>
          <Input
            id="skills"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="e.g. JavaScript, React, TypeScript"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="applyLink">Application Link</Label>
          <Input
            id="applyLink"
            type="url"
            value={applyLink}
            onChange={(e) => setApplyLink(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="eligibility">Eligibility Criteria</Label>
          <Textarea
            id="eligibility"
            value={eligibility}
            onChange={(e) => setEligibility(e.target.value)}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="benefits">Benefits</Label>
          <Textarea
            id="benefits"
            value={benefits}
            onChange={(e) => setBenefits(e.target.value)}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="applicationSteps">Application Steps</Label>
          <Textarea
            id="applicationSteps"
            value={applicationSteps}
            onChange={(e) => setApplicationSteps(e.target.value)}
            rows={4}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/opportunities")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Opportunity"
            )}
          </Button>
        </div>
      </motion.form>
    </div>
  );
}