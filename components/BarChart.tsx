import React, { useEffect, useRef } from 'react';
import { StatItem } from '../types';

// Using global Chart from script tag
declare var Chart: any;

interface BarChartProps {
    title: string;
    data: StatItem[];
}

export const BarChart: React.FC<BarChartProps> = ({ title, data }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<any>(null);

    useEffect(() => {
        if (chartRef.current && data.length > 0) {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }

            const ctx = chartRef.current.getContext('2d');
            chartInstanceRef.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.map(d => d.name),
                    datasets: [{
                        label: 'Nº de Alertas',
                        data: data.map(d => d.count),
                        backgroundColor: 'rgba(59, 130, 246, 0.5)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    scales: {
                        x: {
                            beginAtZero: true,
                            ticks: {
                                color: '#9CA3AF',
                                precision: 0
                            },
                             grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        },
                        y: {
                            ticks: { color: '#D1D5DB' },
                             grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: title,
                            color: '#F3F4F6',
                            font: {
                                size: 16
                            }
                        }
                    }
                }
            });
        }

        // Cleanup chart instance on component unmount
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [data, title]);

    if (data.length === 0) {
        return (
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-center">
                 <h3 className="text-lg font-bold text-gray-200 mb-2">{title}</h3>
                 <p className="text-gray-400">No hay datos suficientes para mostrar.</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700" style={{ height: '250px' }}>
            <canvas ref={chartRef}></canvas>
        </div>
    );
};
