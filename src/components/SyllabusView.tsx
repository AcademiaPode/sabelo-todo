import React from 'react';
import type { SyllabusTopic } from '../types.ts';

export const SyllabusView = ({ subject, syllabus, onSelectTopic, onStartOver }: { subject: string, syllabus: SyllabusTopic[]; onSelectTopic: (topic: SyllabusTopic) => void; onStartOver: () => void; }) => (
    <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-2 text-slate-100">Plan de Estudio: <span className="text-sky-400">{subject}</span></h2>
        <p className="text-slate-300 mb-6">Seleccioná un tema para empezar tu sesión de estudio con flashcards generadas por IA.</p>
        <div className="space-y-3">
            {syllabus.map((topic, index) => (
                <div key={index} onClick={() => onSelectTopic(topic)} className="bg-slate-800 p-5 rounded-lg shadow-sm border border-slate-700 hover:shadow-lg hover:border-sky-600 cursor-pointer transition-all">
                    <h3 className="font-bold text-xl text-slate-100">{topic.title}</h3>
                    <p className="text-slate-400">{topic.description}</p>
                </div>
            ))}
        </div>
        <button onClick={onStartOver} className="mt-8 text-sky-400 font-semibold hover:underline">Elegir otro método</button>
    </div>
);
