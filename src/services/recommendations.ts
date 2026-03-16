"use client";

import { collection, getDocs } from "firebase/firestore";
import { db } from "@/config/firebase";

// Basic Recommendation Logic (Placeholder for full AI engine)
export const getRecommendedOpportunities = async (userId: string) => {
  try {
    const oppsRef = collection(db, "opportunities");
    const querySnapshot = await getDocs(oppsRef);
    const opps = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // For now, return deterministic scores based on available opportunities
    return opps.map((opp, i) => {
      let score = 65 + (i % 5) * 7;
      return { id: opp.id, score: Math.min(98, score) };
    });
  } catch (error) {
    console.error("AI matching failed", error);
    return [];
  }
};

export const getRecommendations = getRecommendedOpportunities;

export const getCompatibilityDetails = async (userId: string, opportunityId: string) => {
  return {
    score: 85,
    matchReasons: ["Skills match your profile", "Location preference met"],
    missingSkills: ["Cloud Architecture"]
  };
};