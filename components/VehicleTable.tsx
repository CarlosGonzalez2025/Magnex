import React from 'react';
import { VehicleAlert } from '../types';

interface VehicleTableProps {
  title: string;
  alerts: VehicleAlert[];
  headerColor: string;
  accentColor: string;
}

// Sub-componente para manejar los enlaces de ubicación de forma inteligente
const LocationCell: React.FC<{ location: string }> = ({ location }) => {
    if (!location || location.toLowerCase() === 'n/a') {
        return <span>N/A</span>;
    }

    // Regex para detectar formatos de coordenadas como "lat, lng", "lat/lng", o "lat/-lng"
    const coordRegex = /^\s*(-?\d+\.?\d*)\s*[,/]\s*(-?\d+\.?\d*)/;
    const match = location.match(coordRegex);

    let url: string;
    let displayText = location;

    if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        url = `https://www.google.com/maps?q=${lat},${lng}`;
        displayText = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } else {
        // Si no son coordenadas, se trata como una dirección de texto
        url = `https://www.google.com/maps?q=${encodeURIComponent(location)}`;
    }

    return (
        <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-400 hover:underline"
        >
            {displayText}
        </a>
    );
};

export const VehicleTable: React.FC<VehicleTableProps> = ({ title, alerts, headerColor, accentColor }) => {
  if (alerts.length === 0) {
    return (
      <div className={`bg-gray-800 rounded-lg border ${accentColor} shadow-lg overflow-hidden`}>
        <div className={`${headerColor} px-6 py-4`}>
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        <div className="p-6 text-center text-gray-400">
          <p>No hay alertas para mostrar en esta categoría.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg border ${accentColor} shadow-lg overflow-hidden`}>
      <div className={`${headerColor} px-6 py-4 flex justify-between items-center`}>
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <span className="bg-gray-900/50 text-white text-sm font-semibold px-3 py-1 rounded-full">
            {alerts.length} Alertas
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-100 uppercase bg-gray-700/50">
            <tr>
              <th scope="col" className="px-6 py-3">Placa</th>
              <th scope="col" className="px-6 py-3">Velocidad (km/h)</th>
              <th scope="col" className="px-6 py-3">Fecha y Hora</th>
              <th scope="col" className="px-6 py-3">Operador</th>
              <th scope="col" className="px-6 py-3">Localidad</th>
              <th scope="col" className="px-6 py-3">Contrato</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert, index) => (
              <tr key={`${alert.placa}-${alert.fechaHora}-${index}`} className="border-b border-gray-700 hover:bg-gray-700/50">
                <td className="px-6 py-4 font-medium text-gray-100 whitespace-nowrap">{alert.placa}</td>
                <td className={`px-6 py-4 font-bold ${alert.velocidad >= 80 ? 'text-red-400' : 'text-yellow-400'}`}>{alert.velocidad}</td>
                <td className="px-6 py-4">{alert.fechaHora}</td>
                <td className="px-6 py-4">{alert.operador}</td>
                <td className="px-6 py-4">
                  <LocationCell location={alert.localidad} />
                </td>
                <td className="px-6 py-4">{alert.contrato}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
