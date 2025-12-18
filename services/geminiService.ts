
import { GoogleGenAI, Type } from "@google/genai";

export async function generateTrainingProgram(category: string, focus: string) {
  // Always create a new GoogleGenAI instance right before making an API call to ensure it uses the current process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Genera un programa de entrenamiento semanal detallado para un equipo de fútbol categoría ${category}. El enfoque principal es ${focus}. 
    Responde en formato JSON con la siguiente estructura: 
    { "sessions": [ { "day": "Lunes", "title": "...", "activities": ["...", "..."], "duration": "90 min" } ] }`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          sessions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING },
                title: { type: Type.STRING },
                activities: { type: Type.ARRAY, items: { type: Type.STRING } },
                duration: { type: Type.STRING }
              },
              required: ["day", "title", "activities", "duration"]
            }
          }
        },
        required: ["sessions"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function analyzeFinancialState(transactions: any[]) {
  // Always create a new GoogleGenAI instance right before making an API call to ensure it uses the current process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const summary = JSON.stringify(transactions);
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analiza este resumen de transacciones financieras y proporciona 3 recomendaciones clave para mejorar la salud financiera de la academia: ${summary}`,
  });
  return response.text;
}
