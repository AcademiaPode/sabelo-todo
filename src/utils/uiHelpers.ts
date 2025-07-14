import React from 'react';
import { AcademicCapIcon, BookOpenIcon, BrainIcon, CrownIcon } from '../components/icons.tsx';

export const getLevelName = (level: number): string => {
  if (level >= 15) return 'Supremo';
  if (level >= 10) return 'Avanzado';
  if (level >= 5) return 'Intermedio';
  return 'Principiante';
};

export const getLevelIcon = (level: number): React.ReactNode => {
    const className = "w-4 h-4 mr-1.5 flex-shrink-0";
    if (level >= 15) return <CrownIcon className={`${className} text-amber-400`} />;
    if (level >= 10) return <BrainIcon className={`${className} text-pink-400`} />;
    if (level >= 5) return <BookOpenIcon className={`${className} text-sky-400`} />;
    return <AcademicCapIcon className={`${className} text-green-400`} />;
};

export const getRankDisplay = (rank: number): string | number => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
};