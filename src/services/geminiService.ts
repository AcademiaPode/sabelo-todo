
import { GoogleGenAI, Type } from "@google/genai";
import type { SyllabusTopic, QuizQuestion, StudyMaterials } from '../types.ts';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateSyllabusFromFiles = async (files: { mimeType: string, data: string }[]): Promise<{ subject: string, topics: SyllabusTopic[] }> => {
    const prompt = `Sos un experto en educación. Analizá estos archivos (que pueden ser imágenes o documentos PDF de apuntes de estudio) y generá un plan de estudios completo. Identificá el tema principal y usalo como 'subject'. La respuesta debe ser un objeto JSON con 'subject' y un array 'topics'. Cada tema debe tener un 'title' y una 'description' corta. Proporcioná de 5 a 7 temas. Importante: El plan de estudios (el 'subject', los 'title' y las 'description' de los temas) debe estar siempre en español de Argentina para que el usuario pueda entenderlo, independientemente del idioma del contenido de los apuntes. Si los archivos no son claros o relevantes, respondé con un error.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            subject: { type: Type.STRING, description: 'El tema principal identificado en los apuntes.' },
            topics: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING }
                    },
                    required: ["title", "description"]
                }
            }
        },
        required: ["subject", "topics"]
    };
    
    try {
        const fileParts = files.map(file => ({
            inlineData: { mimeType: file.mimeType, data: file.data },
        }));
        const textPart = { text: prompt };
        const parts = [...fileParts, textPart];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts },
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });
        const text = response.text.trim();
        return JSON.parse(text);
    } catch (error) {
        console.error("Error generating syllabus from files:", error);
        throw new Error("Falló la generación de contenido de la IA. Por favor, revisá tu clave de API y volvé a intentarlo.");
    }
};

export const generateSyllabus = async (subject: string): Promise<{ topics: SyllabusTopic[] }> => {
    const prompt = `Generá un plan de estudios para el tema '${subject}'. La respuesta debe ser un objeto JSON con un array 'topics'. Cada tema debe tener un 'title' (título) y una 'description' (descripción) corta. Proporcioná de 5 a 7 temas principales. Importante: El plan de estudios (los 'title' y las 'description' de los temas) debe estar siempre en español de Argentina, sin importar cuál sea el tema a estudiar.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            topics: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING }
                    },
                    required: ["title", "description"]
                }
            }
        },
        required: ["topics"]
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });
        const text = response.text.trim();
        return JSON.parse(text);
    } catch (error) {
        console.error("Error generating syllabus:", error);
        throw new Error("Falló la generación de contenido de la IA. Por favor, revisá tu clave de API y volvé a intentarlo.");
    }
};

export const generateStudyMaterials = async (subject: string, topic: string): Promise<StudyMaterials> => {
    const prompt = `Sos un experto creador de materiales de estudio que actúa como un profesor particular. El tema general es '${subject}'. El subtema específico es '${topic}'.
Tu tarea es crear un paquete de estudio coherente y unificado. La respuesta debe ser un único objeto JSON que contenga:
1.  'flashcards': Un array de 10 flashcards (tarjetas de estudio) sobre '${topic}'.
2.  'quiz': Un array de 5 preguntas de cuestionario de opción múltiple.

REGLA MÁS IMPORTANTE: El 'quiz' DEBE estar directamente basado en la información presentada en las 'flashcards'. Cada pregunta del cuestionario debe evaluar un concepto enseñado en las tarjetas.

Reglas de Idioma y Contenido para Flashcards:
- Cada flashcard: 'id' (número), 'question' (pregunta), 'answer' (respuesta).
- Si '${subject}' es para aprender un idioma (ej: 'inglés'): 'question' en español, 'answer' en el idioma de estudio, y añadí un campo 'translation' con la traducción de la respuesta al español entre paréntesis.
- Para otros temas: 'question' y 'answer' en español, sin 'translation'.

Reglas de Idioma y Contenido para el Cuestionario:
- Cada pregunta del quiz: 'question' (texto), 'options' (array de 4 strings), 'correctAnswer' (una de las opciones), y 'explanation' (explicación de por qué es correcta).
- Si '${subject}' es para aprender un idioma: 'question' en español, pero 'options' y 'correctAnswer' en el idioma de estudio.
- Para otros temas: todo el contenido en español.
- La 'explanation' SIEMPRE debe estar en español de Argentina.`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            flashcards: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.NUMBER },
                        question: { type: Type.STRING },
                        answer: { type: Type.STRING },
                        translation: { type: Type.STRING, description: "Traducción de la respuesta al español, entre paréntesis. Solo para temas de idiomas." }
                    },
                    required: ["id", "question", "answer"]
                }
            },
            quiz: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correctAnswer: { type: Type.STRING },
                        explanation: { type: Type.STRING }
                    },
                    required: ["question", "options", "correctAnswer", "explanation"]
                }
            }
        },
        required: ["flashcards", "quiz"]
    };
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });
        const text = response.text.trim();
        return JSON.parse(text);
    } catch (error) {
        console.error("Error generating study materials:", error);
        throw new Error("Falló la generación de contenido de la IA. Por favor, revisá tu clave de API y volvé a intentarlo.");
    }
};

export const generateStudySuggestion = async (subject: string, topic: string, questions: QuizQuestion[], userAnswers: (string | null)[]): Promise<string> => {
    const incorrectQuestions = questions.filter((q, i) => userAnswers[i] !== q.correctAnswer);

    if (incorrectQuestions.length === 0) {
        return "¡Puntaje perfecto! Dominás este tema. ¡Seguí así!";
    }

    const analysisText = incorrectQuestions.map((q, i) => {
        const userAnswerIndex = questions.indexOf(q);
        return `- Pregunta: "${q.question}"\n  - Respuesta correcta: "${q.correctAnswer}"\n  - Tu respuesta: "${userAnswers[userAnswerIndex]}"`;
    }).join('\n');

    const prompt = `Sos un tutor de IA amigable y motivador. Un estudiante está aprendiendo sobre '${subject}', específicamente el tema '${topic}', y se equivocó en estas preguntas:\n${analysisText}\n\nBasado en estos errores, dale un consejo de estudio personalizado, conciso y útil en español de Argentina (2-4 frases). El objetivo es ayudarlo a que entienda los conceptos clave que no le quedaron claros. No repitas las preguntas, enfocate en el consejo para mejorar.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text;
    } catch (error) {
        console.error("Error generating study suggestion:", error);
        throw new Error("No se pudo generar el consejo de estudio.");
    }
};

// --- Google Sheets Integration ---

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxdpu9psd1xAFkEFVHnLjw1JzPJKXixZwOMarahg3uGoynlBk2Ew6yjB6Z0BSa0_eNFRQ/exec';

interface ProgressData {
    nombre: string;
    puntos: number;
    temas: number;
    insignias: number;
}

export const saveProgressToSheet = async (data: ProgressData): Promise<void> => {
    const formData = new FormData();
    formData.append('nombre', data.nombre);
    formData.append('puntos', String(data.puntos));
    formData.append('temas', String(data.temas));
    formData.append('insignias', String(data.insignias));
    
    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            body: formData,
            mode: 'no-cors'
        });
    } catch (error) {
        console.error('Error al guardar el progreso en Google Sheets:', error);
    }
};