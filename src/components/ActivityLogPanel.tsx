import React from 'react';
import type { ActivityLogEntry } from '../types.ts';
import { XIcon } from './icons.tsx';

export const ActivityLogPanel = ({ log, isOpen, onClose }: { log: ActivityLogEntry[]; isOpen: boolean; onClose: () => void; }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex justify-center items-center" onClick={onClose}>
            <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h3 className="text-xl font-bold text-slate-100">Registro de Actividad</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                        <XIcon />
                    </button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    {log.length === 0 ? (
                        <p className="text-slate-400 text-center py-8">Todavía no completaste ninguna actividad. ¡A estudiar!</p>
                    ) : (
                        log.map((entry, index) => (
                            <div key={index} className="flex items-center gap-4 bg-slate-900/50 p-3 rounded-lg">
                                <div className="flex-shrink-0 text-green-400">✅</div>
                                <div className="flex-1">
                                    <p className="font-semibold text-slate-200">{entry.activityName}</p>
                                    <p className="text-xs text-slate-400">📅 {new Date(entry.timestamp).toLocaleString('es-AR')}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-amber-400">⭐ +{entry.xpGained} XP</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
