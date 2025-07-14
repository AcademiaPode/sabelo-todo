
import React from 'react';
import type { Badge, BadgeCategory } from './types.ts';
import { 
    PackageIcon, RocketIcon, BookStackIcon, FireIcon, DiamondIcon,
    TargetIcon, GemIcon, CrownIcon, LegendIcon,
    TrendingUpIcon, TrophyIcon, WizardHatIcon, InfinityIcon,
    CalendarIcon, ClockIcon, PodiumIcon, PuzzleIcon, KeyIcon
} from './components/icons.tsx';

const C: { [key: string]: BadgeCategory } = {
    TOPICS: 'Temas Completados',
    XP: 'XP Acumulado',
    LEVELS: 'Niveles Alcanzados',
    CHALLENGES: 'Desafíos Especiales',
}

export const INITIAL_BADGES: Badge[] = [
    // --- Temas Completados ---
    { id: 'topic_1', name: 'Primera Entrega', description: 'Completaste tu primer tema.', icon: <PackageIcon />, category: C.TOPICS, achieved: false },
    { id: 'topic_5', name: 'Ritmo Constante', description: 'Completaste 5 temas.', icon: <RocketIcon />, category: C.TOPICS, achieved: false },
    { id: 'topic_10', name: 'Compulsivo', description: 'Completaste 10 temas.', icon: <BookStackIcon />, category: C.TOPICS, achieved: false },
    { id: 'topic_20', name: 'Maratón de estudio', description: 'Completaste 20 temas.', icon: <FireIcon />, category: C.TOPICS, achieved: false },
    { id: 'topic_50', name: 'Mente brillante', description: 'Completaste 50 temas.', icon: <DiamondIcon />, category: C.TOPICS, achieved: false },

    // --- XP Acumulado ---
    { id: 'xp_130', name: 'Primer paso', description: 'Alcanzaste 130 XP.', icon: <TargetIcon />, category: C.XP, achieved: false },
    { id: 'xp_500', name: 'Explorador', description: 'Alcanzaste 500 XP.', icon: <GemIcon />, category: C.XP, achieved: false },
    { id: 'xp_1000', name: 'Avanzado', description: 'Alcanzaste 1.000 XP.', icon: <CrownIcon className="h-8 w-8" />, category: C.XP, achieved: false },
    { id: 'xp_2000', name: 'Maestro', description: 'Alcanzaste 2.000 XP.', icon: <TrophyIcon className="h-8 w-8" />, category: C.XP, achieved: false },
    { id: 'xp_5000', name: 'Leyenda', description: 'Alcanzaste 5.000 XP.', icon: <LegendIcon />, category: C.XP, achieved: false },
    
    // --- Niveles Alcanzados ---
    { id: 'level_2', name: 'Nivelado', description: 'Alcanzaste Nivel 2.', icon: <TrendingUpIcon />, category: C.LEVELS, achieved: false },
    { id: 'level_4', name: 'Ascendente', description: 'Alcanzaste Nivel 4.', icon: <RocketIcon />, category: C.LEVELS, achieved: false },
    { id: 'level_6', name: 'Avanzado', description: 'Alcanzaste Nivel 6.', icon: <TrophyIcon className="h-8 w-8" />, category: C.LEVELS, achieved: false },
    { id: 'level_10', name: 'Experto', description: 'Alcanzaste Nivel 10.', icon: <WizardHatIcon />, category: C.LEVELS, achieved: false },
    { id: 'level_15', name: 'Imparable', description: 'Alcanzaste Nivel 15.', icon: <InfinityIcon />, category: C.LEVELS, achieved: false },

    // --- Desafíos Especiales ---
    { id: 'challenge_streak', name: 'Racha activa', description: 'Estudiaste 3 días seguidos.', icon: <CalendarIcon />, category: C.CHALLENGES, achieved: false },
    { id: 'challenge_daily', name: 'Contrarreloj', description: 'Completaste 3 temas en un solo día.', icon: <ClockIcon />, category: C.CHALLENGES, achieved: false },
    { id: 'challenge_top3', name: 'Competidor', description: 'Entraste al Top 3 del ranking.', icon: <PodiumIcon />, category: C.CHALLENGES, achieved: false },
    { id: 'challenge_5_badges', name: 'Estratega', description: 'Desbloqueaste 5 insignias diferentes.', icon: <PuzzleIcon />, category: C.CHALLENGES, achieved: false },
    { id: 'challenge_all_badges', name: 'Dominador', description: 'Desbloqueaste todas las insignias.', icon: <KeyIcon />, category: C.CHALLENGES, achieved: false },
];


export const XP_PER_FLASHCARD_SESSION = 50;
export const XP_PER_QUIZ_CORRECT_ANSWER = 20;
export const XP_TO_LEVEL_UP = 200;