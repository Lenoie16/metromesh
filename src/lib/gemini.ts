import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini client.
// The API key is securely injected by the AI Studio environment via process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateCrowdInsight(zone: string, density: number, peerCount: number, trend: string): Promise<string> {
  try {
    const prompt = `
      You are an expert crowd management AI for the MetroMesh system.
      Current Status:
      - Zone: ${zone}
      - Density: ${Math.round(density * 100)}%
      - Active Peer Nodes: ${peerCount}
      - Trend: ${trend}
      
      Provide a concise, 2-sentence actionable insight or recommendation for station staff or commuters based on this data. 
      Keep it professional, urgent if density is high (>70%), and reassuring if low.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No insight generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI insight unavailable. Please check API configuration.";
  }
}
