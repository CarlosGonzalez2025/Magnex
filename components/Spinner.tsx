import React from 'react';

export const Spinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center my-8">
    <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent border-solid rounded-full animate-spin"></div>
    <p className="mt-4 text-lg text-gray-300">Procesando datos, por favor espere...</p>
  </div>
);
