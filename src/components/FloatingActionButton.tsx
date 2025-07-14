import React from 'react';
import { ClipboardListIcon } from './icons.tsx';

export const FloatingActionButton = ({ onClick }: { onClick: () => void; }) => (
    <button
        onClick={onClick}
        className="fixed bottom-24 right-4 md:bottom-6 md:right-6 bg-sky-600 text-white p-4 rounded-full shadow-lg hover:bg-sky-700 transition-transform hover:scale-110 z-20"
        aria-label="Ver registro de actividad"
    >
        <ClipboardListIcon />
    </button>
);
