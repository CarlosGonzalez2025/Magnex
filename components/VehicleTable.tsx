import React, { useState, useEffect } from 'react';
import { VehicleAlert } from '../types';

interface VehicleTableProps {
  title: string;
  alerts: VehicleAlert[];
  headerColor: string;
  accentColor: string;
}

const LocationCell: React.FC<{ location: string }> = ({ location }) => {
  if (!location || typeof location !== 'string') {
    return <>{'N/A'}</>;
  }
  
  const coords = location.split(',').map(coord => parseFloat(coord.trim()));
  if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
    const [lat, lng] = coords;
    const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    return (
      <a 
        href={mapsUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-blue-400 hover:underline hover:text-blue-300 transition-colors"
        title="Ver en Google Maps"
      >
        {lat.toFixed(5)}, {lng.toFixed(5)}
      </a>
    );
  }

  return <>{location}</>;
};

export const VehicleTable: React.FC<VehicleTableProps> = ({ title, alerts, headerColor, accentColor }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(false); // Reset on data change
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [alerts]);

  return (
    <div className={`border-l-4 ${accentColor} bg-gray-800 rounded-r-lg shadow-lg transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-gray-200">{title}</h2>
            <span className={`text-sm font-bold px-3 py-1 ${headerColor} rounded-full`}>{alerts.length} Alertas</span>
        </div>
        <div className="overflow-x-auto">
            {alerts.length > 0 ? (
                <table className="w-full text-left table-auto">
                    <thead className={`${headerColor} text-gray-100 uppercase text-sm`}>
                        <tr>
                            <th className="p-3">Placa</th>
                            <th className="p-3">Velocidad (km/h)</th>
                            <th className="p-3">Fecha y Hora</th>
                            <th className="p-3">Operador</th>
                            <th className="p-3">Localidad</th>
                            <th className="p-3">Nombre del Contrato</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {alerts.map((alert, index) => (
                        <tr key={`${alert.placa}-${index}`} className="hover:bg-gray-700/50 transition-colors duration-200">
                            <td className="p-3 font-mono font-bold text-gray-100">{alert.placa}</td>
                            <td className="p-3"><span className={`font-bold ${headerColor === 'bg-red-800' ? 'text-red-400' : 'text-yellow-400'}`}>{alert.velocidad}</span></td>
                            <td className="p-3 text-gray-300">{alert.fechaHora}</td>
                            <td className="p-3 text-gray-400 text-sm">{alert.operador}</td>
                            <td className="p-3 text-gray-400 text-sm"><LocationCell location={alert.localidad} /></td>
                            <td className="p-3 text-gray-400 text-sm">{alert.contrato}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="p-4 text-gray-400">No se encontraron vehículos en esta categoría.</p>
            )}
        </div>
    </div>
  );
};
