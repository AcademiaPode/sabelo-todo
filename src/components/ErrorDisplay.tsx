import React from 'react';

export const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="bg-red-900/50 border-l-4 border-red-500 text-red-300 p-4 rounded-md shadow-lg" role="alert">
    <p className="font-bold">Ocurrió un Error</p>
    <p>{message}</p>
  </div>
);
