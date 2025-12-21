
import { GoogleGenAI, Type } from "@google/genai";

/* ======================================================
   GOOGLE GENAI CLIENT
====================================================== */

// Initialize the Google GenAI client with the API key from environment variables.
// The key is obtained exclusively from process.env.API_KEY as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/* ======================================================
   WHATSAPP REPORT
====================================================== */

// generateWhatsAppReport summarizes student progress for a WhatsApp message.
export async function generateWhatsAppReport(
  studentName: string,
  topics: string[]
) {
  const prompt = `
Eres un coordinador académico de una escuela de tutoría virtual.
Resume el progreso del estudiante de forma profesional y breve para WhatsApp.

Estudiante: ${studentName}
Temas trabajados: ${topics.join(", ")}
`;

  try {
    // Basic Text Task: Use gemini-3-flash-preview.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { temperature: 0.4 }
    });

    return response.text ?? "";
  } catch (error) {
    console.error("Report generation failed", error);
    return "Error generando reporte.";
  }
}

/* ======================================================
   DIAGNÓSTICO DE MATEMÁTICAS
====================================================== */

// evaluateMathDiagnostic analyzes a math diagnostic test and returns feedback and remedial plans.
export async function evaluateMathDiagnostic(
  studentName: string,
  questions: any[],
  image?: string
) {
  const prompt = `Analiza este diagnóstico de matemáticas para ${studentName}. Preguntas: ${JSON.stringify(questions)}`;
  
  const parts: any[] = [{ text: prompt }];
  if (image) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: image.split(",")[1]
      }
    });
  }

  try {
    // Complex Reasoning Task: Use gemini-3-pro-preview.
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: { parts },
      config: {
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
            remedialClasses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  topic: { type: Type.STRING }
                },
                required: ["title", "topic"]
              }
            }
          },
          required: ["score", "feedback", "gaps", "remedialClasses"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Diagnostic failed", error);
    return { score: 0, feedback: "Error", gaps: [], remedialClasses: [] };
  }
}

/* ======================================================
   FLASHCARDS
====================================================== */

// generateFlashcards creates educational flashcards based on a topic.
export async function generateFlashcards(topic: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Crea 5 flashcards educativas sobre "${topic}".`,
      config: {
        temperature: 0.5,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              front: { type: Type.STRING },
              back: { type: Type.STRING }
            },
            required: ["front", "back"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch {
    return [];
  }
}

/* ======================================================
   SESIÓN DESDE TAREA
====================================================== */

// generateSessionFromHomework analyzes homework and creates a tutoring session plan.
export async function generateSessionFromHomework(homeworkText: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analiza la siguiente tarea y crea una sesión de tutoría. Tarea: "${homeworkText}"`,
      config: {
        temperature: 0.4,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            duration: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["math", "physics", "science", "core"] }
          },
          required: ["title", "description", "duration", "type"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Homework analysis failed", error);
    return {
      title: "Sesión de Apoyo",
      description: "Revisión guiada de la tarea",
      duration: "45m",
      type: "core",
    };
  }
}

/* ======================================================
   CONSULTA (STREAMING)
====================================================== */

/**
 * streamConsultation handles streaming academic consultations with vision and search support.
 * Fix: Updated signature to accept 4 arguments to resolve the type error in AIConsultant.tsx.
 */
export async function streamConsultation(
  history: any[],
  userText: string,
  userImage?: string,
  useSearch?: boolean
) {
  // Creating a new instance to ensure up-to-date API configuration as suggested by guidelines.
  const instanceAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const contents: any[] = history.map((h: any) => {
    const parts: any[] = [{ text: h.text || "" }];
    if (h.image) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: h.image.split(",")[1],
        },
      });
    }
    return { role: h.role === "user" ? "user" : "model", parts };
  });

  const userParts: any[] = [{ text: userText }];
  if (userImage) {
    userParts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: userImage.split(",")[1],
      },
    });
  }
  contents.push({ role: "user", parts: userParts });

  const config: any = {
    systemInstruction: `Eres un Tutor Académico de Nova Schola. Responde SOLO dudas académicas. Si es off-topic, comienza con [OFF_TOPIC].`,
    temperature: 0.6,
  };

  // Enable Google Search grounding if requested.
  if (useSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  return instanceAi.models.generateContentStream({
    // Use Pro model if search is used for higher quality results.
    model: useSearch ? "gemini-3-pro-preview" : "gemini-3-flash-preview",
    contents,
    config,
  });
}

/* ======================================================
   REPORTE PARA PADRES
====================================================== */

// generateParentEmailReport creates a professional email report for parents.
export async function generateParentEmailReport(
  studentName: string,
  performanceData: any
) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Genera un correo profesional para los padres de ${studentName} resumiendo su progreso académico: ${JSON.stringify(performanceData)}`,
      config: { temperature: 0.4 }
    });

    return response.text ?? "";
  } catch (error) {
    console.error("Parent email generation failed", error);
    return "Error al generar el reporte.";
  }
}

/* ======================================================
   ORIENTACIÓN VOCACIONAL
====================================================== */

// generateCareerGuidance provides career advice based on student profiles.
export async function generateCareerGuidance(
  mode: "TEEN" | "KIDS",
  profile: string
) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Basado en el siguiente perfil: "${profile}". Modo: ${mode}`,
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            careers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  match: { type: Type.NUMBER },
                  roadmap: { type: Type.ARRAY, items: { type: Type.STRING } },
                  salary: { type: Type.STRING },
                  superpowers: { type: Type.ARRAY, items: { type: Type.STRING } },
                  emoji: { type: Type.STRING }
                },
                required: ["title", "description", "match"]
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || '{"careers":[]}');
  } catch (error) {
    console.error("Career guidance failed", error);
    return { careers: [] };
  }
}
