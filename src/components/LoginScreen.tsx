import React, { useState } from 'react';

export const LoginScreen = ({ onSave }: { onSave: (name: string) => void }) => {
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        if (!trimmedName) {
            setError('❗ Tenés que ingresar tu nombre para continuar');
            return;
        }
        onSave(trimmedName);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md mx-auto">
                <div className="bg-amber-700 text-white font-bold text-center p-3 rounded-t-xl">
                    👉 Ingresá tu nombre para comenzar a jugar
                </div>
                <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-b-xl shadow-2xl border border-slate-700">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            if (error) setError('');
                        }}
                        placeholder="Escribí tu apodo acá..."
                        className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:outline-none text-white placeholder-slate-400 text-lg"
                        aria-label="Tu nombre de jugador"
                        autoFocus
                    />
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                    <button type="submit" className="mt-6 w-full bg-sky-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-sky-700 transition-colors disabled:bg-slate-500">
                        Guardar
                    </button>
                </form>
            </div>
        </div>
    );
};
