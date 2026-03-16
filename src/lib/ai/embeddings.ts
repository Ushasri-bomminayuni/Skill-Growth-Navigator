"use client";

import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, this should be handled server-side
});

export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: texts
    });

    return response.data.map(item => item.embedding);
  } catch (error) {
    console.error("Error generating embeddings:", error);
    throw error;
  }
}

// Cache embeddings to reduce API calls
export class EmbeddingCache {
  private cache: Map<string, number[]>;

  constructor() {
    this.cache = new Map();
  }

  async getEmbedding(text: string): Promise<number[]> {
    if (this.cache.has(text)) {
      return this.cache.get(text)!;
    }

    const embedding = await generateEmbedding(text);
    this.cache.set(text, embedding);
    return embedding;
  }
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text
  });

  return response.data[0].embedding;
}