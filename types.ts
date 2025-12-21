
import React from 'react';

export type Language = 'es' | 'en';

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  SCHEDULE = 'SCHEDULE',
  CURRICULUM = 'CURRICULUM',
  AI_CONSULTANT = 'AI_CONSULTANT',
  METRICS = 'METRICS',
  PROGRESS = 'PROGRESS',
  DIAGNOSTIC = 'DIAGNOSTIC',
  SOCIAL = 'SOCIAL',
  FLASHCARDS = 'FLASHCARDS',
  CAREER = 'CAREER',
  REWARDS = 'REWARDS',
  SETTINGS = 'SETTINGS',
  PRICING = 'PRICING',
  REPOSITORY = 'REPOSITORY'
}

export interface AppMessage {
    id: string;
    senderId: string;
    senderName: string;
    receiverId: string;
    content: string;
    type: 'SUPPORT_TICKET' | 'ADMIN_ALERT' | 'SYSTEM_NOTIFY' | 'ADMIN_REPLY';
    timestamp: string;
    read: boolean;
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
  image?: string; // Base64 string for vision tasks
  groundingMetadata?: {
    groundingChunks: GroundingChunk[];
  };
}

export interface ScheduleBlock {
  time: string;
  activity: string;
  type: 'academic' | 'break' | 'skills' | 'wellness';
  description: string;
}

export interface Infraction {
  id: string;
  type: 'ACADEMIC_DISHONESTY' | 'LATENESS' | 'UNPREPARED' | 'DISTRACTION' | 'OFF_TOPIC';
  description: string;
  timestamp: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface StoreItem {
  id: string;
  name: string;
  cost: number;
  category: 'avatar' | 'theme' | 'coupon' | 'real';
  image?: string; // Emoji or URL
  color?: string;
  owned: boolean;
  minLevel?: number;
}

export interface Assignment {
  title: string;
  description: string;
  dueDate: string;
  timestamp: number;
}

// Nueva interfaz para Planes
export interface EducationalPlan {
    id: string;
    name: string;
    description: string;
    allowedViews: string[]; // List of ViewState IDs
}

export const SCHOOL_VALUES = [
  "Autonomía", 
  "Excelencia", 
  "Curiosidad", 
  "Resiliencia", 
  "Colaboración", 
  "Impacto Social", 
  "Felicidad"
];

// --- CURRICULUM INTERFACES (Moved from Curriculum.tsx) ---

export interface AIClassBlueprint {
  hook: string;
  development: string;
  practice: string;
  closure: string;
  differentiation: string;
}

export interface ClassSession {
  id: number;
  title: string;
  duration: string;
  topic: string;
  blueprint: AIClassBlueprint;
  isRemedial?: boolean;
  isEvaluation?: boolean;
  isWrittenExam?: boolean;
  questions?: { id: number; text: string; options: string[] }[];
  isLocked?: boolean;
}

export interface Module {
  id: number;
  name: string;
  level: string;
  focus: string;
  classes: ClassSession[];
}

export interface SkillTrack {
  id: string;
  name: string;
  overview: string;
  modules: Module[];
}

export interface Subject {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  tracks: SkillTrack[];
  colorTheme: 'amber' | 'sky' | 'rose' | 'emerald' | 'indigo' | 'fuchsia' | 'teal' | 'violet'; 
}
