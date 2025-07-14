import React from 'react';
import type { LeaderboardUser } from '../types.ts';
import { getLevelIcon, getLevelName, getRankDisplay } from '../utils/uiHelpers.ts';
import { ChevronDownIcon, ChevronUpIcon, StarIcon } from './icons.tsx';

export const CompactLeaderboard = ({ leaderboardData, currentUser, isExpanded, onToggle }: { leaderboardData: LeaderboardUser[], currentUser: LeaderboardUser; isExpanded: boolean; onToggle: () => void; }) => {
  const currentUserIndex = leaderboardData.findIndex(u => u.name === currentUser.name);
  const currentUserData = leaderboardData[currentUserIndex];

  let motivationalText: React.ReactNode = null;
    if (currentUserData && currentUserIndex > 0) {
        const nextUser = leaderboardData[currentUserIndex - 1];
        const pointsNeeded = nextUser.xp - currentUserData.xp;
        if (pointsNeeded > 0) {
            motivationalText = (
                <span>
                    ¡Te faltan <strong className="text-white">{pointsNeeded.toLocaleString()}</strong> puntos para superar a <strong className="text-white">{nextUser.name}</strong>!
                </span>
            );
        }
    } else if (currentUserIndex === 0 && leaderboardData.length > 1) {
        motivationalText = "¡Estás en la cima! ¡Mantené la racha! 🚀";
    }

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-sm border-t border-slate-700 z-30 shadow-2xl">
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex justify-between items-center p-2 cursor-pointer hover:bg-slate-800/50" onClick={onToggle}>
            <h3 className="font-bold text-slate-200 ml-2">Tabla de Clasificación</h3>
            <button className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors" aria-label={isExpanded ? 'Minimizar tabla' : 'Expandir tabla'}>
                {isExpanded ? <ChevronDownIcon /> : <ChevronUpIcon />}
            </button>
        </div>
        <div className={`transition-[max-height] duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[26rem]' : 'max-h-0'}`}>
            {motivationalText && (
                <div className="px-4 py-2 text-center text-sm text-sky-300 bg-sky-900/40">
                    {motivationalText}
                </div>
            )}
            <div className={`h-full overflow-y-auto custom-scrollbar ${isExpanded ? 'max-h-[22rem]' : ''}`}>
                <table className="w-full text-sm text-left text-slate-300">
                  <thead className="sticky top-0 bg-slate-900/95 z-10">
                    <tr className="text-xs text-slate-400 font-semibold uppercase">
                      <th className="p-2 text-center w-12">Rank</th>
                      <th className="p-2">Usuario</th>
                      <th className="p-2">Nivel</th>
                      <th className="p-2 text-right">XP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.map((user) => {
                      const isCurrentUser = user.rank === currentUserData?.rank;
                      return (
                      <tr key={user.rank} className={`border-t border-slate-800 ${isCurrentUser ? 'bg-sky-800/70' : 'odd:bg-slate-800/20 even:bg-slate-800/50'}`}>
                        <td className={`p-2 text-center font-bold text-lg ${isCurrentUser ? 'text-white' : 'text-slate-400'}`}>
                          {getRankDisplay(user.rank)}
                        </td>
                        <td className="p-2 font-medium flex items-center">
                           {isCurrentUser && <StarIcon className="w-4 h-4 text-yellow-300 mr-2 flex-shrink-0" />}
                           <span className="truncate" title={user.name}>{user.name}</span>
                        </td>
                        <td className="p-2">
                           <div className="flex items-center">
                            {getLevelIcon(user.level)}
                            <span className="text-slate-400">{getLevelName(user.level)}</span>
                           </div>
                        </td>
                        <td className={`p-2 text-right font-mono font-bold ${isCurrentUser ? 'text-white' : 'text-amber-400'}`}>
                          {user.xp.toLocaleString()}
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
            </div>
        </div>
      </div>
    </footer>
  );
};
