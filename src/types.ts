import type { ReactNode } from 'react';

export enum GameState {
  TOPIC_SELECTION,
  SYLLABUS_VIEW,
  STUDYING,
  QUIZ,
  RESULTS,
}

export interface SyllabusTopic {
  title: string;
  description: string;
}

export interface Flashcard {
  id: number;
  question: string;
  answer: string;
  translation?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface StudyMaterials {
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
}

export type BadgeCategory = 'Temas Completados' | 'XP Acumulado' | 'Niveles Alcanzados' | 'Desafíos Especiales';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  achieved: boolean;
  category: BadgeCategory;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  level: number;
  xp: number;
}

export interface ActivityLogEntry {
  activityName: string;
  xpGained: number;
  timestamp: string;
}