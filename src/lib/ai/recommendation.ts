"use client";

import OpenAI from "openai";
import { getEmbeddings } from "./embeddings";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, this should be handled server-side
});

// Generate embeddings for text
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

// Calculate cosine similarity between two embeddings
function calculateSimilarity(embedding1: number[], embedding2: number[]): number {
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    magnitude1 += embedding1[i] * embedding1[i];
    magnitude2 += embedding2[i] * embedding2[i];
  }

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  return dotProduct / (magnitude1 * magnitude2);
}

// Generate personalized recommendations
export async function getPersonalizedRecommendations(userProfile: any, opportunities: any[]): Promise<any[]> {
  try {
    // Generate embedding for user profile
    const userText = `
      User Profile:
      - Skills: ${userProfile.skills?.join(", ") || "None"}
      - Interests: ${userProfile.interests?.join(", ") || "None"}
      - College: ${userProfile.college || "Not specified"}
      - Year: ${userProfile.year || "Not specified"}
      - Location: ${userProfile.location || "Not specified"}
    `;
    const userEmbedding = await generateEmbedding(userText);

    // Generate embeddings for opportunities and calculate similarity scores
    const opportunitiesWithScores = await Promise.all(
      opportunities.map(async (opportunity) => {
        const opportunityText = `
          Opportunity: ${opportunity.title}
          Organization: ${opportunity.organization}
          Category: ${opportunity.category}
          Description: ${opportunity.description}
          Skills Required: ${opportunity.skills_required?.join(", ") || "None"}
          Location: ${opportunity.location}
        `;
        const opportunityEmbedding = await generateEmbedding(opportunityText);
        const similarityScore = calculateSimilarity(userEmbedding, opportunityEmbedding);

        return {
          ...opportunity,
          similarityScore,
          compatibilityScore: Math.round(similarityScore * 100)
        };
      })
    );

    // Sort by similarity score (descending)
    opportunitiesWithScores.sort((a, b) => b.similarityScore - a.similarityScore);

    return opportunitiesWithScores;
  } catch (error) {
    console.error("Error generating personalized recommendations:", error);
    // Fallback to simple skill matching if AI fails
    return opportunities.map(opportunity => {
      const score = calculateCompatibilityScore(
        userProfile.skills || [],
        opportunity.skills_required || []
      );
      return { ...opportunity, compatibilityScore: score };
    }).sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }
}

// Generate compatibility explanation
export async function getCompatibilityExplanation(userProfile: any, opportunity: any): Promise<{
  score: number;
  explanation: string;
  matchingSkills: string[];
  missingSkills: string[];
}> {
  try {
    // Generate explanation using OpenAI
    const prompt = `
      Given a user profile and an opportunity, generate a compatibility explanation:

      User Profile:
      - Skills: ${userProfile.skills?.join(", ") || "None"}
      - Interests: ${userProfile.interests?.join(", ") || "None"}
      - College: ${userProfile.college || "Not specified"}
      - Year: ${userProfile.year || "Not specified"}

      Opportunity:
      - Title: ${opportunity.title}
      - Organization: ${opportunity.organization}
      - Category: ${opportunity.category}
      - Skills Required: ${opportunity.skills_required?.join(", ") || "None"}
      - Description: ${opportunity.description}

      Provide:
      1. A compatibility score (0-100)
      2. A brief explanation (2-3 sentences) of why this opportunity is a good match
      3. List of matching skills
      4. List of missing skills (if any)

      Format the response as JSON with keys: score, explanation, matchingSkills, missingSkills.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an AI assistant that helps students find suitable opportunities." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      score: result.score || calculateCompatibilityScore(userProfile.skills || [], opportunity.skills_required || []),
      explanation: result.explanation || "This opportunity matches your profile based on your skills and interests.",
      matchingSkills: result.matchingSkills || [],
      missingSkills: result.missingSkills || []
    };
  } catch (error) {
    console.error("Error generating compatibility explanation:", error);
    // Fallback to simple explanation
    const matchingSkills = userProfile.skills?.filter(skill =>
      opportunity.skills_required?.includes(skill)
    ) || [];

    const missingSkills = opportunity.skills_required?.filter(skill =>
      !userProfile.skills?.includes(skill)
    ) || [];

    return {
      score: calculateCompatibilityScore(userProfile.skills || [], opportunity.skills_required || []),
      explanation: matchingSkills.length > 0
        ? `This opportunity is a good match because you have ${matchingSkills.length} of the ${opportunity.skills_required?.length || 0} required skills.`
        : `This opportunity requires skills you haven't listed. Consider developing: ${missingSkills.slice(0, 3).join(', ')}`,
      matchingSkills,
      missingSkills
    };
  }
}

// Simple skill matching fallback
function calculateCompatibilityScore(userSkills: string[], opportunitySkills: string[]): number {
  if (opportunitySkills.length === 0) return 0;

  const matchingSkills = userSkills.filter(skill =>
    opportunitySkills.includes(skill)
  );

  return Math.round((matchingSkills.length / opportunitySkills.length) * 100);
}