import React, { useMemo } from 'react';
import type { QuizQuestion, SyllabusTopic } from '../types.ts';
import { LightBulbIcon } from './icons.tsx';

export const ResultsView = ({ subject, topic, quiz, userAnswers, studySuggestion, onPlayAgain, onBackToSyllabus }: {
    subject: string;
    topic: SyllabusTopic;
    quiz: QuizQuestion[];
    userAnswers: (string | null)[];
    studySuggestion: string;
    onPlayAgain: () => void;
    onBackToSyllabus: () => void;
}) => {
    const correctAnswersCount = useMemo(() => {
        return quiz.filter((q, i) => q.correctAnswer === userAnswers[i]).length;
    }, [quiz, userAnswers]);
    const totalQuestions = quiz.length;
    const scorePercentage = totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0;
    
    const scoreMessage = useMemo(() => {
        if (scorePercentage === 100) return "¡Puntaje perfecto! ¡Sos un genio!";
        if (scorePercentage >= 75) return "¡Excelente trabajo! Casi lo tenés.";
        if (scorePercentage >= 50) return "¡Nada mal! Un poco más de práctica y lo dominás.";
        return "¡No te desanimes! Repasar es la clave del éxito.";
    }, [scorePercentage]);
    
    return (
        <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-2 text-slate-100">Resultados del Cuestionario</h2>
            <p className="text-lg text-slate-300 mb-6">Tema: <span className="font-semibold text-sky-400">{topic.title}</span></p>

            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 mb-6">
                <p className="text-lg text-slate-300 mb-2">{scoreMessage}</p>
                <p className="text-5xl font-bold text-white mb-4">
                    {correctAnswersCount}<span className="text-3xl text-slate-400">/{totalQuestions}</span>
                </p>
                <div className="w-full h-6 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-300 transition-all duration-1000 ease-out"
                        style={{ width: `${scorePercentage}%` }}
                    />
                </div>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 mb-8 text-left">
                <h3 className="flex items-center gap-2 text-xl font-bold text-amber-300 mb-3">
                    <LightBulbIcon />
                    <span>Consejo de Estudio Personalizado</span>
                </h3>
                <p className="text-slate-300 whitespace-pre-wrap">{studySuggestion || "Generando consejo..."}</p>
            </div>
            
            <div className="flex justify-center gap-4">
                <button onClick={onPlayAgain} className="bg-sky-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-sky-700 transition-colors">
                    Reintentar Cuestionario
                </button>
                <button onClick={onBackToSyllabus} className="bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg hover:bg-slate-600 transition-colors">
                    Volver al Plan de Estudio
                </button>
            </div>
        </div>
    );
};
