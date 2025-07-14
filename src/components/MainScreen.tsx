import React, { useState } from 'react';
import { UploadIcon, FileIcon, ImageIcon, InfoIcon } from './icons.tsx';

export const MainScreen = ({ onSubjectSelect, onFilesAnalyze, isLoading, onShowRules }: { onSubjectSelect: (subject: string) => void; onFilesAnalyze: (files: File[]) => void; isLoading: boolean; onShowRules: () => void; }) => {
    const [subject, setSubject] = useState('');
    const [files, setFiles] = useState<File[]>([]);

    const handleSubjectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (subject.trim()) {
            onSubjectSelect(subject.trim());
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const fileList = Array.from(e.target.files);
            setFiles(fileList);
        }
    };
    
    const handleFilesSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (files.length > 0) {
            onFilesAnalyze(files);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-slate-100 mb-2">Bienvenido a Sabelo Todo</h1>
            <p className="text-lg text-slate-300 mb-8">La forma más inteligente de estudiar.</p>
             <p className="text-slate-300 mt-1 mb-8">¡Subí de nivel y liderá la tabla! Cuanto más aprendas, más puntos ganás.</p>

            <div className="space-y-8">
                {/* Option 1: Enter a topic */}
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <h2 className="text-2xl font-bold text-sky-400 mb-4">Empezá con un tema</h2>
                    <p className="text-slate-400 mb-4">Decinos qué querés estudiar y la IA creará un plan de estudio para vos.</p>
                    <form onSubmit={handleSubjectSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Ej: 'Inglés' o 'Revolución de Mayo'"
                            className="flex-grow p-3 bg-slate-700 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:outline-none text-white placeholder-slate-400"
                            disabled={isLoading}
                        />
                        <button type="submit" className="bg-sky-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-sky-700 transition-colors disabled:bg-slate-500" disabled={isLoading || !subject}>
                            Crear Plan
                        </button>
                    </form>
                </div>
                
                {/* Option 2: Upload documents */}
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <h2 className="text-2xl font-bold text-amber-400 mb-4">Estudiá desde tus apuntes</h2>
                    <p className="text-slate-400 mb-4">Subí imágenes o PDF de tus notas, y la IA las analizará para crear tu plan de estudio.</p>
                    <form onSubmit={handleFilesSubmit}>
                        <label className="w-full flex justify-center items-center gap-3 px-4 py-6 bg-slate-700 text-slate-300 rounded-lg shadow-md tracking-wide border-2 border-dashed border-slate-600 cursor-pointer hover:bg-slate-600 hover:border-sky-500 transition-colors">
                            <UploadIcon />
                            <span className="text-base leading-normal">{files.length > 0 ? `${files.length} archivos seleccionados` : 'Seleccionar imágenes o PDF'}</span>
                            <input type='file' className="hidden" multiple accept="image/*,application/pdf" onChange={handleFileChange} disabled={isLoading} />
                        </label>
                         {files.length > 0 && (
                            <div className="mt-4 text-left">
                                <h4 className="font-semibold text-slate-300 mb-2">Archivos seleccionados:</h4>
                                <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                    {files.map((file, index) => (
                                      <li key={index} className="flex items-center gap-3 bg-slate-700/80 p-2 rounded-md">
                                        {file.type.startsWith('image/') ? <ImageIcon /> : <FileIcon />}
                                        <span className="text-slate-300 text-sm truncate flex-1" title={file.name}>{file.name}</span>
                                        <span className="text-slate-400 text-xs">{(file.size / 1024).toFixed(1)} KB</span>
                                      </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <button type="submit" className="mt-4 bg-amber-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-amber-700 transition-colors disabled:bg-slate-500" disabled={isLoading || files.length === 0}>
                            Analizar Apuntes
                        </button>
                    </form>
                </div>
            </div>
            <div className="mt-8 text-center">
                <button
                    onClick={onShowRules}
                    className="inline-flex items-center gap-1.5 text-sm text-slate-500 font-medium hover:text-sky-400 transition-colors"
                    aria-label="Mostrar reglas y puntuación"
                >
                    <InfoIcon />
                    <span>Reglas y Puntuación</span>
                </button>
            </div>
        </div>
    );
};
