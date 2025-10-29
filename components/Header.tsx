import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Panel de Control de Alertas de Velocidad
        </h1>
        <p className="text-gray-400 mt-1">
          Análisis de datos desde archivos Fagor (.xlsx) y Coltrack (.csv).
        </p>
      </div>
    </header>
  );
};
