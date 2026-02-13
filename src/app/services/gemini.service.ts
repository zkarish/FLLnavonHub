import { Injectable } from '@angular/core';
import { GoogleGenAI, Type, Schema } from '@google/genai';

// Define interfaces for type safety within the app
export interface Task {
  taskName: string;
  description: string;
  duration: string;
}

export interface Phase {
  phaseName: string;
  tasks: Task[];
}

export interface ProjectPlan {
  projectTitle: string;
  summary: string;
  estimatedDuration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  phases: Phase[];
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY'] });
  }

  async generatePlan(goal: string): Promise<ProjectPlan> {
    const model = 'gemini-2.5-flash';
    
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        projectTitle: { type: Type.STRING, description: "A catchy title for the project" },
        summary: { type: Type.STRING, description: "A brief executive summary of the plan" },
        estimatedDuration: { type: Type.STRING, description: "Total estimated time (e.g. '2 weeks')" },
        difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard", "Expert"] },
        phases: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              phaseName: { type: Type.STRING },
              tasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    taskName: { type: Type.STRING },
                    description: { type: Type.STRING },
                    duration: { type: Type.STRING, description: "Time for this specific task" }
                  },
                  required: ["taskName", "description", "duration"]
                }
              }
            },
            required: ["phaseName", "tasks"]
          }
        }
      },
      required: ["projectTitle", "summary", "estimatedDuration", "difficulty", "phases"]
    };

    try {
      const response = await this.ai.models.generateContent({
        model: model,
        contents: `Create a detailed project plan for the following goal: "${goal}". Break it down into logical phases with specific tasks. Be realistic with time estimates.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 0.7
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error('No content generated');
      }

      return JSON.parse(text) as ProjectPlan;
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }
}
