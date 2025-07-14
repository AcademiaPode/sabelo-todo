import React from 'react';

export const LoadingSpinner = ({ text = "Cargando..." }: { text?: string }) => (
  <div className="flex flex-col justify-center items-center p-10 gap-4">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-400"></div>
    <p className="text-sky-300">{text}</p>
  </div>
);
