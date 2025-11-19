import { GoogleGenAI } from "@google/genai";
import { EcologicalReport, SpeciesType } from '../types';

const apiKey = process.env.API_KEY || ''; // Injected by the environment

const ai = new GoogleGenAI({ apiKey });

export const generateEcologicalReport = async (
  species: SpeciesType,
  daysSurvived: number,
  pollenCollected: number,
  history: { day: number, event: string }[],
  deathReason?: string
): Promise<EcologicalReport> => {
  
  if (!apiKey) {
    return {
      survivalAnalysis: "API Key missing. Unable to generate analysis.",
      strategyFeedback: "Ensure process.env.API_KEY is set.",
      score: 0
    };
  }

  const historyText = history.map(h => `Day ${h.day}: ${h.event}`).join('\n');
  
  const prompt = `
    You are a strict but fair Evolutionary Biology Professor.
    Analyze the following gameplay session of a student playing the "Pollinator Ecology" simulation.
    
    Species: ${species}
    Days Survived: ${daysSurvived} / 15
    Pollen Collected: ${pollenCollected}
    Cause of Death (if any): ${deathReason || 'Survived Season'}
    
    Event Log:
    ${historyText}
    
    Please provide a JSON response with the following structure:
    {
      "survivalAnalysis": "A paragraph explaining why they lived or died based on energy budgets, predation risk, or pesticide exposure.",
      "strategyFeedback": "A paragraph on their foraging strategy (specialist vs generalist) and how it fits the species' evolutionary traits.",
      "score": number (0-100 based on biological success)
    }
    
    Keep the tone educational and scientific.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as EcologicalReport;
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      survivalAnalysis: "Failed to analyze simulation data.",
      strategyFeedback: "Check connection and try again.",
      score: 0
    };
  }
};