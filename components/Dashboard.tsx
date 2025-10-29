import React, { useMemo } from 'react';
import { VehicleAlert, StatItem } from '../types';
import { StatCard } from './StatCard';
import { BarChart } from './BarChart';
import { Map } from './Map';

interface DashboardProps {
    alerts: VehicleAlert[];
}

const generateTopStats = (alerts: VehicleAlert[], key: keyof VehicleAlert, topN: number = 5): StatItem[] => {
    const counts = alerts.reduce((acc: Record<string, number>, alert) => {
        const value = (alert[key] as string) || 'N/A';
        acc[value] = (acc[value] || 0) + 1;
        return acc;
    }, {});

    return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, topN);
};

export const Dashboard: React.FC<DashboardProps> = ({ alerts }) => {
    const highSpeedCount = useMemo(() => alerts.filter(a => a.velocidad >= 80).length, [alerts]);
    const mediumSpeedCount = useMemo(() => alerts.filter(a => a.velocidad >= 50 && a.velocidad < 80).length, [alerts]);
    const uniqueVehicles = useMemo(() => new Set(alerts.map(a => a.placa)).size, [alerts]);

    const topPlates = useMemo(() => generateTopStats(alerts, 'placa'), [alerts]);
    const topContracts = useMemo(() => generateTopStats(alerts, 'contrato'), [alerts]);
    const topOperators = useMemo(() => generateTopStats(alerts, 'operador'), [alerts]);
    
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard title="Alertas Totales" value={alerts.length} color="text-blue-400" />
                 <StatCard title="Alertas Altas (>= 80 km/h)" value={highSpeedCount} color="text-red-400" />
                 <StatCard title="Alertas Medias (50-79 km/h)" value={mediumSpeedCount} color="text-yellow-400" />
                 <StatCard title="Vehículos Únicos" value={uniqueVehicles} color="text-teal-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
                <div className="lg:col-span-3 bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-700 min-h-[400px]">
                    <h3 className="text-xl font-bold text-gray-200 mb-4">Mapa de Puntos Calientes</h3>
                    <Map alerts={alerts} />
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <BarChart title="Top 5 Placas" data={topPlates} />
                    <BarChart title="Top 5 Contratos" data={topContracts} />
                    <BarChart title="Top 5 Operadores" data={topOperators} />
                </div>
            </div>
        </div>
    );
}
