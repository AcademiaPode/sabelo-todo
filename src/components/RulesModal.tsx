import React from 'react';
import { XP_PER_FLASHCARD_SESSION, XP_PER_QUIZ_CORRECT_ANSWER, XP_TO_LEVEL_UP } from '../constants.tsx';
import { XIcon } from './icons.tsx';

export const RulesModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors" aria-label="Cerrar modal">
                    <XIcon />
                </button>
                <div className="p-6 md:p-8">
                    <h3 className="text-2xl font-bold text-slate-100 mb-6 text-center">🎮 Cómo funciona el juego</h3>
                    <ul className="space-y-4 text-slate-300">
                        <li className="flex items-start gap-4">
                            <span className="text-2xl pt-1">📚</span>
                            <div>
                                <h4 className="font-semibold text-slate-100 mb-1">Aprendé y Sumá Puntos</h4>
                                <p className="text-sm">Subí tus apuntes o elegí un tema. Completá las actividades (flashcards y cuestionarios) para ganar puntos de experiencia (XP).</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <span className="text-2xl pt-1">🧠</span>
                            <div>
                                <h4 className="font-semibold text-slate-100 mb-1">Sistema de XP</h4>
                                <p className="text-sm">
                                    • <span className="font-bold text-amber-400">{XP_PER_FLASHCARD_SESSION} XP</span> por cada sesión de flashcards.<br/>
                                    • <span className="font-bold text-amber-400">{XP_PER_QUIZ_CORRECT_ANSWER} XP</span> por cada respuesta correcta en el cuestionario.
                                </p>
                            </div>
                        </li>
                         <li className="flex items-start gap-4">
                            <span className="text-2xl pt-1">🚀</span>
                             <div>
                                <h4 className="font-semibold text-slate-100 mb-1">Subí de Nivel</h4>
                                <p className="text-sm">Cada <span className="font-bold text-sky-400">{XP_TO_LEVEL_UP} XP</span> que ganás, subís de nivel. ¡Demostrá tu conocimiento en la tabla de clasificación!</p>
                            </div>
                        </li>
                         <li className="flex items-start gap-4">
                            <span className="text-2xl pt-1">🏅</span>
                            <div>
                                <h4 className="font-semibold text-slate-100 mb-1">Ganás Insignias</h4>
                                <p className="text-sm">Desbloqueá insignias especiales al completar logros, como obtener un puntaje perfecto o alcanzar nuevos niveles.</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
