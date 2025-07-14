import React, { useState } from 'react';
import type { QuizQuestion, SyllabusTopic } from '../types.ts';

export const QuizView = ({ topic, quiz, onQuizComplete }: { topic: SyllabusTopic, quiz: QuizQuestion[], onQuizComplete: (answers: (string | null)[]) => void; }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<(string | null)[]>(Array(quiz.length).fill(null));
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

    const currentQuestion = quiz[currentQuestionIndex];

    const handleOptionSelect = (option: string) => {
        if (feedback) return;

        setSelectedOption(option);
        const isCorrect = option === currentQuestion.correctAnswer;
        setFeedback(isCorrect ? 'correct' : 'incorrect');

        const newAnswers = [...userAnswers];
        newAnswers[currentQuestionIndex] = option;
        setUserAnswers(newAnswers);
    };
    
    const handleNextQuestion = () => {
        if (currentQuestionIndex < quiz.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setFeedback(null);
        } else {
            onQuizComplete(userAnswers);
        }
    };

    const getOptionClasses = (option: string) => {
        if (!feedback) {
            return 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-sky-500';
        }
        if (option === currentQuestion.correctAnswer) {
            return 'bg-green-800/50 border-green-500 animate-slow-glow';
        }
        if (option === selectedOption && option !== currentQuestion.correctAnswer) {
            return 'bg-red-800/50 border-red-500';
        }
        return 'bg-slate-800 border-slate-700 opacity-60';
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-2 text-slate-100">Cuestionario: <span className="text-sky-400">{topic.title}</span></h2>
            <p className="text-slate-300 mb-6">Pregunta {currentQuestionIndex + 1} de {quiz.length}</p>
            
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                <p className="text-xl font-semibold text-slate-200 mb-6">{currentQuestion.question}</p>
                <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleOptionSelect(option)}
                            disabled={!!feedback}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-300 ${getOptionClasses(option)}`}
                        >
                            <span className="font-semibold">{option}</span>
                        </button>
                    ))}
                </div>
            </div>

            {feedback && (
                <div className={`mt-6 p-4 rounded-lg ${feedback === 'correct' ? 'bg-green-900/50 border border-green-700' : 'bg-red-900/50 border border-red-700'}`}>
                    <h4 className={`font-bold ${feedback === 'correct' ? 'text-green-300' : 'text-red-300'}`}>{feedback === 'correct' ? '¡Correcto!' : 'Incorrecto'}</h4>
                    <p className="text-slate-300 text-sm mt-1">{currentQuestion.explanation}</p>
                    <button onClick={handleNextQuestion} className="mt-4 bg-sky-600 text-white font-bold py-2 px-5 rounded-lg shadow-md hover:bg-sky-700 transition-colors w-full">
                        {currentQuestionIndex < quiz.length - 1 ? 'Siguiente Pregunta' : 'Ver Resultados'}
                    </button>
                </div>
            )}
        </div>
    );
};
