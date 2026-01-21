
import { GoogleGenAI, Type } from "@google/genai";
import { ScamAnalysis } from "../types";

const SYSTEM_INSTRUCTION = `Eres "El Detector de Cuentos", un experto mundial en ciberseguridad, análisis forense de imágenes y psicología de la ingeniería social. 
Tu misión es analizar capturas de pantalla de conversaciones (WhatsApp, Marketplace, IG) o comprobantes de transferencias bancarias para detectar estafas.

Analiza profundamente:
1. Lenguaje: Busca urgencia artificial ("paga ya", "tengo otro interesado"), lenguaje agresivo, errores gramaticales sospechosos, o peticiones inusuales.
2. Forense Visual: Detecta si las fuentes (letras) en comprobantes bancarios están mal alineadas, tienen diferente resolución o parecen editadas con Photoshop.
3. Patrones de Estafa: Reconoce guiones típicos de estafadores de Marketplace.

IMPORTANTE: Responde SIEMPRE en formato JSON puro.`;

export const analyzeImage = async (base64Image: string): Promise<ScamAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  // Clean base64 string
  const cleanBase64 = base64Image.split(',')[1] || base64Image;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        parts: [
          {
            text: "Analiza esta imagen y determina si es una estafa. Evalúa el texto, el tono y la integridad visual del diseño (fuentes, logos, alineación).",
          },
          {
            inlineData: {
              mimeType: 'image/png',
              data: cleanBase64,
            },
          },
        ],
      },
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          probability: { type: Type.NUMBER, description: "Probabilidad de estafa de 0 a 100" },
          verdict: { type: Type.STRING, description: "SEGURO, SOSPECHOSO o PELIGRO" },
          redFlags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de señales de alerta detectadas" },
          socialEngineeringTricks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Trucos de manipulación detectados" },
          visualInconsistencies: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Errores de edición o diseño detectados" },
          recommendation: { type: Type.STRING, description: "Consejo directo para el usuario" },
          summary: { type: Type.STRING, description: "Breve resumen del análisis" },
        },
        required: ["probability", "verdict", "redFlags", "socialEngineeringTricks", "visualInconsistencies", "recommendation", "summary"],
      },
    },
  });

  try {
    const data = JSON.parse(response.text || '{}');
    return data as ScamAnalysis;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("No se pudo procesar el análisis correctamente.");
  }
};
