"use client";

import { calculateCompatibilityScore } from "./utils";
import { getCompatibilityDetails } from "@/services/recommendations";
import { UserProfile } from "@/services/database";

const ensureDate = (date: any): Date => {
  if (!date) return new Date();
  if (typeof date.toDate === 'function') return date.toDate();
  return new Date(date);
};

// Calculate AI compatibility score with explanation
export const getAICompatibilityScore = async (userId: string, opportunity: any) => {
  try {
    const result = await getCompatibilityDetails(userId, opportunity.id);
    return {
      score: result.score,
      explanation: result.explanation,
      matchingSkills: result.matchingSkills,
      missingSkills: result.missingSkills
    };
  } catch (error) {
    console.error("Error getting AI compatibility score:", error);
    // Fallback to simple score
    const score = calculateCompatibilityScore(
      ["JavaScript", "React", "TypeScript"], // Placeholder for user skills
      opportunity.skills_required || []
    );

    return {
      score,
      explanation: `This opportunity matches ${score}% of the required skills based on your profile.`,
      matchingSkills: [],
      missingSkills: []
    };
  }
};

// Calculate deadline countdown
export const getDeadlineCountdown = (deadline: Date) => {
  const now = new Date();
  const diffTime = deadline.getTime() - now.getTime();

  if (diffTime < 0) {
    return { days: 0, hours: 0, minutes: 0, expired: true };
  }

  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes, expired: false };
};

// Get trending opportunities algorithm
export const getTrendingOpportunities = async (opportunities: any[], limit = 6) => {
  // Sort by views, then by upcoming deadlines
  const now = new Date();

  const trending = opportunities.sort((a, b) => {
    // First by views (descending)
    if (b.views !== a.views) {
      return b.views - a.views;
    }
    // Then by upcoming deadlines (ascending)
    const aDeadline = ensureDate(a.deadline);
    const bDeadline = ensureDate(b.deadline);
    const aDaysLeft = Math.ceil((aDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const bDaysLeft = Math.ceil((bDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return aDaysLeft - bDaysLeft;
  });

  return trending.slice(0, limit);
};

// Filter opportunities by eligibility
export const filterByEligibility = (opportunities: any[], userProfile: any) => {
  return opportunities.filter(opportunity => {
    // Check if user meets basic eligibility criteria
    // This would be enhanced with more sophisticated logic

    // Check year of study
    if (opportunity.eligibleYears && opportunity.eligibleYears.length > 0) {
      if (!opportunity.eligibleYears.includes(userProfile.year)) {
        return false;
      }
    }

    // Check location
    if (opportunity.location && opportunity.location !== "Remote") {
      if (userProfile.location && !userProfile.location.includes(opportunity.location)) {
        return false;
      }
    }

    // Check skills (at least 50% match)
    if (opportunity.skills_required && opportunity.skills_required.length > 0) {
      const score = calculateCompatibilityScore(
        userProfile.skills || [],
        opportunity.skills_required
      );

      if (score < 50) {
        return false;
      }
    }

    return true;
  });
};

// Get personalized dashboard widgets
export const getPersonalizedDashboard = async (userId: string, opportunities: any[], userProfile?: UserProfile) => {
  // This would be enhanced with AI to create truly personalized widgets
  const now = new Date();

  // Recommended opportunities (based on skills)
  const recommended = opportunities.sort((a, b) => {
    const aScore = calculateCompatibilityScore(
      ["JavaScript", "React", "TypeScript"], // Placeholder for user skills
      a.skills_required || []
    );
    const bScore = calculateCompatibilityScore(
      ["JavaScript", "React", "TypeScript"], // Placeholder for user skills
      b.skills_required || []
    );

    return bScore - aScore;
  }).slice(0, 6);

  // Upcoming deadlines
  const upcomingDeadlines = opportunities
    .filter(op => ensureDate(op.deadline) > now)
    .sort((a, b) => ensureDate(a.deadline).getTime() - ensureDate(b.deadline).getTime())
    .slice(0, 6);

  // New opportunities
  const newOpportunities = opportunities
    .sort((a, b) => ensureDate(b.createdAt).getTime() - ensureDate(a.createdAt).getTime())
    .slice(0, 6);

  // Opportunities in user's location
  const locationOpportunities = opportunities
    .filter(op => op.location === "Remote" || (userProfile?.location && op.location.includes(userProfile.location)))
    .slice(0, 6);

  return {
    recommended,
    upcomingDeadlines,
    newOpportunities,
    locationOpportunities
  };
};