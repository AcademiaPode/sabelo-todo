import React, { useState, useEffect } from 'react';

export const Flashcard = React.memo(({ question, answer, translation }: { question: string; answer: string; translation?: string; }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        setIsFlipped(false);
    }, [question]);

    return (
        <div className="w-full h-80 [perspective:1000px] cursor-pointer" onClick={() => setIsFlipped(p => !p)}>
            <div className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                {/* Front */}
                <div className="absolute inset-0 flex items-center justify-center p-6 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 [backface-visibility:hidden]">
                    <p className="text-center text-2xl font-semibold text-slate-200">{question}</p>
                </div>
                {/* Back */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-sky-900 rounded-xl shadow-2xl border border-sky-800 [transform:rotateY(180deg)] [backface-visibility:hidden]">
                    <p className="text-center text-2xl font-semibold text-sky-200">{answer}</p>
                    {translation && (
                        <p className="text-center text-lg text-slate-300 mt-4 italic">{translation}</p>
                    )}
                </div>
            </div>
        </div>
    );
});
