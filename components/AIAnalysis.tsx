import React, { useState, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { VehicleAlert } from '../types';

interface AIAnalysisProps {
    alerts: VehicleAlert[];
}

// Función para generar estadísticas, similar a la del Dashboard
const generateTopStats = (alerts: VehicleAlert[], key: keyof VehicleAlert, topN: number = 5) => {
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

export const AIAnalysis: React.FC<AIAnalysisProps> = ({ alerts }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const dataSummary = useMemo(() => {
        if (alerts.length === 0) return null;
        
        const highSpeedCount = alerts.filter(a => a.velocidad >= 80).length;
        const mediumSpeedCount = alerts.filter(a => a.velocidad >= 50 && a.velocidad < 80).length;
        const uniqueVehicles = new Set(alerts.map(a => a.placa)).size;

        return {
            totalAlerts: alerts.length,
            highSpeedCount,
            mediumSpeedCount,
            uniqueVehicles,
            topPlates: generateTopStats(alerts, 'placa'),
            topContracts: generateTopStats(alerts, 'contrato'),
            topOperators: generateTopStats(alerts, 'operador'),
        };
    }, [alerts]);

    const handleGenerateAnalysis = async () => {
        if (!dataSummary) {
            setError("No hay datos suficientes para generar un análisis.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const prompt = `
                Eres un experto analista de seguridad vial y logística de flotas.
                Tu tarea es analizar el siguiente resumen de datos sobre alertas de exceso de velocidad y generar un informe conciso con conclusiones clave y recomendaciones accionables para un gerente de flota.

                Responde en español.

                Aquí están los datos:
                - Total de Alertas de Velocidad: ${dataSummary.totalAlerts}
                - Alertas de Alta Velocidad (>= 80 km/h): ${dataSummary.highSpeedCount}
                - Alertas de Velocidad Media (50-79 km/h): ${dataSummary.mediumSpeedCount}
                - Número de Vehículos Únicos con Alertas: ${dataSummary.uniqueVehicles}

                Top 5 Placas con más alertas:
                ${dataSummary.topPlates.map(item => `- ${item.name}: ${item.count} alertas`).join('\n')}

                Top 5 Contratos con más alertas:
                ${dataSummary.topContracts.map(item => `- ${item.name}: ${item.count} alertas`).join('\n')}
                
                Top 5 Operadores con más alertas:
                ${dataSummary.topOperators.map(item => `- ${item.name}: ${item.count} alertas`).join('\n')}

                Por favor, estructura tu respuesta en dos secciones claras:
                1.  **Conclusiones Clave:** Puntos directos sobre los hallazgos más importantes.
                2.  **Recomendaciones Accionables:** Pasos específicos que el gerente puede tomar para mejorar la seguridad y reducir las infracciones.

                Utiliza viñetas para que la lectura sea fácil y rápida.
            `;
            
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
            });

            setAnalysisResult(response.text);

        } catch (err) {
            console.error("Error generating AI analysis:", err);
            setError("Ocurrió un error al contactar el servicio de IA. Por favor, inténtelo de nuevo más tarde.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleClear = () => {
        setAnalysisResult(null);
        setError(null);
    }

    return (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-bold text-gray-200 mb-4">Análisis Inteligente con IA</h3>
            
            {isLoading ? (
                <div className="flex items-center justify-center space-x-3 text-gray-300">
                    <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent border-solid rounded-full animate-spin"></div>
                    <span>Analizando datos con IA, esto puede tardar un momento...</span>
                </div>
            ) : analysisResult ? (
                <div>
                    <div className="bg-gray-900/50 p-4 rounded-md border border-gray-600">
                         <pre className="text-gray-300 whitespace-pre-wrap font-sans text-sm">{analysisResult}</pre>
                    </div>
                    <button
                        onClick={handleClear}
                        className="mt-4 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-500 transition-all duration-300"
                    >
                        Limpiar Análisis
                    </button>
                </div>
            ) : (
                <div className="text-center">
                    <p className="text-gray-400 mb-4">Obtén conclusiones y recomendaciones automáticas basadas en los datos cargados.</p>
                    <button
                        onClick={handleGenerateAnalysis}
                        disabled={!dataSummary}
                        className="px-6 py-3 bg-blue-700 text-white font-bold rounded-lg shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        Generar Análisis con IA
                    </button>
                    {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
                </div>
            )}
        </div>
    );
};