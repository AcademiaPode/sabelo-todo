import React, { useState } from 'react';
import type { Flashcard as FlashcardType, SyllabusTopic } from '../types.ts';
import { ChevronLeftIcon } from './icons.tsx';
import { Flashcard } from './Flashcard.tsx';

export const StudySession = ({ topic, flashcards, onSessionComplete }: { topic: SyllabusTopic, flashcards: FlashcardType[], onSessionComplete: () => void; }) => {
    const [currentCardIndex, setCurrentCardIndex] = useState(0);

    const handleNext = () => {
        if (currentCardIndex < flashcards.length - 1) {
            setCurrentCardIndex(currentCardIndex + 1);
        } else {
            onSessionComplete();
        }
    };
    
    const handlePrev = () => {
        if(currentCardIndex > 0) {
            setCurrentCardIndex(currentCardIndex - 1);
        }
    };

    const currentCard = flashcards[currentCardIndex];
    const isLastCard = currentCardIndex === flashcards.length - 1;
    const isFirstCard = currentCardIndex === 0;

    return (
        <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-2 text-slate-100">Flashcards: <span className="text-sky-400">{topic.title}</span></h2>
            <p className="text-slate-300 mb-6">Hacé clic en la tarjeta para ver la respuesta. Usá los botones para navegar.</p>
            <Flashcard key={currentCard.id} question={currentCard.question} answer={currentCard.answer} translation={currentCard.translation} />
            <div className="mt-8 flex justify-center items-center gap-4">
                <button onClick={handlePrev} disabled={isFirstCard} className="bg-slate-700 text-white font-bold p-3 rounded-full shadow-md hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <ChevronLeftIcon />
                </button>
                <span className="text-slate-400 font-medium">{currentCardIndex + 1} / {flashcards.length}</span>
                <button onClick={handleNext} className="bg-sky-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-sky-700 transition-colors">
                    {isLastCard ? '¡Listo! Ir al Cuestionario' : 'Siguiente'}
                </button>
            </div>
        </div>
    );
};
