import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface Item {
  id: number;
  title: string;
  description: string;
  type: 'lost' | 'found';
  location: string;
  category: string;
}

export async function findPotentialMatches(newItem: Item, existingItems: Item[]) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("AI Matching skipped: No Gemini API Key found.");
    return [];
  }

  const context = existingItems
    .filter(item => item.type !== newItem.type) // Only match lost with found
    .map(item => `ID: ${item.id} | Title: ${item.title} | Desc: ${item.description} | Loc: ${item.location}`)
    .join('\n');

  const prompt = `
    You are an AI assistant for a Lost and Found system for Barangay Paknaan.
    Given a new ${newItem.type} item and a list of existing ${newItem.type === 'lost' ? 'found' : 'lost'} items, identify up to 3 most likely matches.
    
    New Item:
    Title: ${newItem.title}
    Description: ${newItem.description}
    Location: ${newItem.location}

    Existing Items:
    ${context}

    Return a JSON array of IDs for the potential matches, ordered by relevance. If no matches seem plausible, return an empty array.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.INTEGER }
        }
      }
    });

    const matchIds = JSON.parse(response.text || '[]');
    return matchIds;
  } catch (error) {
    console.error("AI Matching failed:", error);
    return [];
  }
}
