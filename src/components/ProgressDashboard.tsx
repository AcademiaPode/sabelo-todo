import React, { useMemo } from 'react';
import type { Badge, BadgeCategory } from '../types.ts';
import { XP_TO_LEVEL_UP } from '../constants.tsx';
import { AcademicCapIcon, BookOpenIcon, LockClosedIcon, StarIcon, TrophyIcon } from './icons.tsx';
import { AnimatedNumber } from './AnimatedNumber.tsx';
import { getLevelName } from '../utils/uiHelpers.ts';

export const ProgressDashboard = ({ 
    xp, level, badges, topicsCompleted, username
}: { 
    xp: number; level: number; badges: Badge[]; topicsCompleted: number; username: string;
}) => {
    const xpForNextLevel = XP_TO_LEVEL_UP;
    const currentLevelXp = xp - ((level -1) * XP_TO_LEVEL_UP);
    const progressPercentage = xpForNextLevel > 0 ? (currentLevelXp / xpForNextLevel) * 100 : 0;
    
    const groupedBadges = useMemo(() => {
        return badges.reduce((acc, badge) => {
            const category = badge.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(badge);
            return acc;
        }, {} as Record<BadgeCategory, Badge[]>);
    }, [badges]);

    const categoryColors: Record<BadgeCategory, string> = {
        'Temas Completados': 'text-sky-400',
        'XP Acumulado': 'text-amber-400',
        'Niveles Alcanzados': 'text-green-400',
        'Desafíos Especiales': 'text-purple-400',
    };

    return (
        <div className="bg-slate-800/60 backdrop-blur-xl p-5 md:p-6 rounded-3xl shadow-2xl shadow-slate-900/40 border border-slate-700/50 sticky top-6">
            <h2 className="text-2xl font-bold text-slate-100 mb-6 text-center">Progreso de <span className="text-sky-400">{username}</span></h2>
            
            <div className="space-y-5">
                {/* Level & Progress */}
                <div className="p-4 bg-slate-900/50 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="relative flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 text-white shadow-lg shadow-sky-500/20">
                                <AcademicCapIcon className="h-7 w-7" />
                            </div>
                             <div>
                                <span className="font-bold text-lg text-slate-200">Nivel {level}</span>
                                <p className="text-sm text-slate-400">{getLevelName(level)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative w-full h-5 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
                        <div 
                            className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-300 animate-gradient-x transition-all duration-1000 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white tracking-wider" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.7)'}}>{currentLevelXp} / {xpForNextLevel} XP</span>
                    </div>
                </div>

                {/* Total XP */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400 shadow-lg">
                    <div className="flex items-center justify-between text-slate-900">
                         <div className="flex items-center space-x-3">
                            <StarIcon className="h-7 w-7" />
                            <span className="font-bold text-lg">XP Total</span>
                        </div>
                        <span className="font-bold text-2xl">
                            <AnimatedNumber target={xp} />
                        </span>
                    </div>
                </div>

                {/* Badges */}
                <div className="p-4 bg-slate-900/50 rounded-xl">
                    <div className="flex items-center space-x-2 mb-4 text-purple-300">
                        <TrophyIcon />
                        <h3 className="text-lg font-bold text-slate-300">Insignias</h3>
                    </div>
                    <div className="space-y-4">
                        {(Object.keys(groupedBadges) as BadgeCategory[]).map(category => (
                            <div key={category}>
                                <h4 className={`font-bold text-sm uppercase tracking-wider mb-2 ${categoryColors[category]}`}>{category}</h4>
                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                                    {groupedBadges[category].map(badge => (
                                        <div key={badge.id} className="relative group flex justify-center">
                                            <div className={`aspect-square p-2.5 rounded-xl transition-all duration-300 w-full flex items-center justify-center ${badge.achieved ? 'bg-purple-900/50 border-2 border-purple-500 animate-slow-glow' : 'bg-slate-800/60 border border-slate-700 opacity-50 grayscale'}`}>
                                                <div className={`${badge.achieved ? 'text-amber-300' : 'text-slate-500'}`}>{badge.icon}</div>
                                                { !badge.achieved && (
                                                    <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                                        <LockClosedIcon />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="absolute bottom-full mb-2 w-48 px-3 py-2 text-sm font-medium text-white bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                <h4 className={`font-bold ${categoryColors[category]}`}>{badge.name}</h4>
                                                <p className="text-xs text-slate-300">{badge.description}</p>
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                 
                 {/* Topics Completed */}
                 <div className="flex items-center justify-center gap-3 text-slate-300 font-medium bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                    <BookOpenIcon className="h-6 w-6" />
                    <span>Temas Completados: <span className="font-bold text-xl text-sky-400">{topicsCompleted}</span></span>
                 </div>
            </div>
        </div>
    );
};
