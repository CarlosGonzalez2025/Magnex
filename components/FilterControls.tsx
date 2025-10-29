import React from 'react';

interface FilterControlsProps {
  filters: {
    placa: string;
    operador: string;
    contrato: string;
  };
  onFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearFilters: () => void;
  hasAlerts: boolean;
  onExport: () => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({ filters, onFilterChange, onClearFilters, hasAlerts, onExport }) => {
  if (!hasAlerts) {
    return null;
  }

  return (
    <div className="mb-6 bg-gray-800 p-4 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Filtros de Búsqueda</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <input
                type="text"
                name="placa"
                placeholder="Filtrar por Placa..."
                value={filters.placa}
                onChange={onFilterChange}
                className="bg-gray-700 border border-gray-600 text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 lg:col-span-1"
            />
            <input
                type="text"
                name="operador"
                placeholder="Filtrar por Operador..."
                value={filters.operador}
                onChange={onFilterChange}
                className="bg-gray-700 border border-gray-600 text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 lg:col-span-1"
            />
            <input
                type="text"
                name="contrato"
                placeholder="Filtrar por Contrato..."
                value={filters.contrato}
                onChange={onFilterChange}
                className="bg-gray-700 border border-gray-600 text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 lg:col-span-1"
            />
            <button
                onClick={onClearFilters}
                className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 transition-all duration-300"
            >
                Limpiar Filtros
            </button>
            <button
                onClick={onExport}
                className="px-4 py-2 bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-300"
            >
                Exportar a CSV
            </button>
        </div>
    </div>
  );
};