import React, { useState, useMemo, useCallback, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { VehicleTable } from './components/VehicleTable';
import { Dashboard } from './components/Dashboard';
import { FilterControls } from './components/FilterControls';
import { Spinner } from './components/Spinner';
import { fetchContracts } from './services/contractService';
import {
  VehicleAlert,
  FagorDataFromXLSX,
  ColtrackDataFromCSV,
} from './types';


const App: React.FC = () => {
  const [fagorAlerts, setFagorAlerts] = useState<VehicleAlert[]>([]);
  const [coltrackAlerts, setColtrackAlerts] = useState<VehicleAlert[]>([]);
  
  const [isLoadingFagor, setIsLoadingFagor] = useState<boolean>(false);
  const [isLoadingColtrack, setIsLoadingColtrack] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    placa: '',
    operador: '',
    contrato: '',
  });

  const [contractMap, setContractMap] = useState<Map<string, string>>(new Map());

  // Load contracts on initial mount
  useEffect(() => {
    const loadContracts = async () => {
        try {
            const contracts = await fetchContracts();
            setContractMap(contracts);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar contratos.');
        }
    };
    loadContracts();
  }, []);

  // Load persisted alerts from localStorage on initial mount
  useEffect(() => {
    try {
        const persistedFagor = localStorage.getItem('fagorAlertsData');
        if (persistedFagor) setFagorAlerts(JSON.parse(persistedFagor));

        const persistedColtrack = localStorage.getItem('coltrackAlertsData');
        if (persistedColtrack) setColtrackAlerts(JSON.parse(persistedColtrack));
    } catch (e) {
        console.error("Failed to load alerts from localStorage", e);
    }
  }, []);

  // Persist alerts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('fagorAlertsData', JSON.stringify(fagorAlerts));
  }, [fagorAlerts]);

  useEffect(() => {
    localStorage.setItem('coltrackAlertsData', JSON.stringify(coltrackAlerts));
  }, [coltrackAlerts]);


  const processFagorFile = useCallback((data: ArrayBuffer) => {
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: FagorDataFromXLSX[] = XLSX.utils.sheet_to_json(worksheet);

    const alerts = jsonData
      .map(row => {
        const placaRaw = row['Matrícula'] || row['placa'] || row['Placa'];
        const placa = String(placaRaw || '').trim().toUpperCase();
        const speedText = String(row['Descripcion'] || row['descripcion'] || '');
        let speed = 0;
        
        const matchSpeed1 = speedText.match(/Vel\. actual \| Vel\. permitida:.*?\| (\d+) km\/h/);
        const matchSpeed2 = speedText.match(/Vel\. Vehiculo: (\d+)/);

        if (matchSpeed1 && matchSpeed1[1]) {
            speed = parseInt(matchSpeed1[1], 10);
        } else if (matchSpeed2 && matchSpeed2[1]) {
            speed = parseInt(matchSpeed2[1], 10);
        }

        if (speed === 0) return null;

        const dateRaw = row['FECHA_Hora'] || row['Fecha_Hora'] || row['FECHA HORA'];
        let fechaHora = 'Invalid Date';

        if (dateRaw) {
            let dateObj: Date | null = null;
            
            if (typeof dateRaw === 'number') {
                const parsedDate = XLSX.SSF.parse_date_code(dateRaw);
                if (parsedDate) {
                    dateObj = new Date(parsedDate.y, parsedDate.m - 1, parsedDate.d, parsedDate.H, parsedDate.M, parsedDate.S);
                }
            } else if (typeof dateRaw === 'string') {
                // Manually parse DD/MM/YYYY HH:mm:ss format to avoid ambiguity
                const parts = dateRaw.match(/(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})\s*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?/);
                if (parts) {
                    // parts[1]=Day, parts[2]=Month, parts[3]=Year, parts[4]=Hour, ...
                    const day = parseInt(parts[1], 10);
                    const month = parseInt(parts[2], 10) - 1; // Month is 0-indexed in JS
                    const year = parseInt(parts[3], 10);
                    const hour = parts[4] ? parseInt(parts[4], 10) : 0;
                    const minute = parts[5] ? parseInt(parts[5], 10) : 0;
                    const second = parts[6] ? parseInt(parts[6], 10) : 0;
                    dateObj = new Date(year, month, day, hour, minute, second);
                } else {
                    // Fallback for other string formats (less reliable)
                    dateObj = new Date(dateRaw);
                }
            } else if (dateRaw instanceof Date) {
                 dateObj = dateRaw;
            }

            if (dateObj && !isNaN(dateObj.getTime())) {
                fechaHora = dateObj.toLocaleString('es-CO', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                }).replace(',', '');
            }
        } else {
            fechaHora = 'N/A';
        }

        return {
            placa,
            velocidad: speed,
            fechaHora,
            operador: String(row['Operador'] || 'N/A'),
            localidad: String(row['Localidad'] || 'N/A'),
            contrato: contractMap.get(placa) || 'No Asignado',
        };
      })
      .filter((alert): alert is VehicleAlert => alert !== null && alert.velocidad >= 50);

    setFagorAlerts(alerts);
  }, [contractMap]);

  const processColtrackFile = useCallback((csvText: string) => {
      Papa.parse<ColtrackDataFromCSV>(csvText, {
          header: true,
          delimiter: '|',
          skipEmptyLines: true,
          complete: (results) => {
              const alerts = results.data
                  .map(row => {
                      const placa = String(row.Nombre || '').trim().toUpperCase();
                      const velocidad = parseInt(row.kph, 10) || 0;
                      if (!placa || isNaN(velocidad) || velocidad < 50) return null;

                      return {
                          placa,
                          velocidad,
                          fechaHora: row['Hora Reporte'] || 'N/A',
                          operador: `${row['Nombre Conductor'] || ''} ${row.Apellido || ''}`.trim() || 'N/A',
                          localidad: (row.Lat && row.Lon) ? `${row.Lat.trim()}, ${row.Lon.trim()}` : 'N/A',
                          contrato: contractMap.get(placa) || 'No Asignado',
                      };
                  })
                  .filter((alert): alert is VehicleAlert => alert !== null);
              setColtrackAlerts(alerts);
          }
      });
  }, [contractMap]);


  const handleFagorFileProcess = useCallback(async (file: File) => {
    setIsLoadingFagor(true);
    setError(null);
    try {
        const data = await file.arrayBuffer();
        processFagorFile(data);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al procesar archivo XLSX.');
    } finally {
        setIsLoadingFagor(false);
    }
  }, [processFagorFile]);

  const handleColtrackFileProcess = useCallback(async (file: File) => {
      setIsLoadingColtrack(true);
      setError(null);
      try {
          const text = await file.text();
          processColtrackFile(text);
      } catch (err) {
          setError(err instanceof Error ? err.message : 'Error al procesar archivo CSV.');
      } finally {
          setIsLoadingColtrack(false);
      }
  }, [processColtrackFile]);
  
  const handleClearAllData = () => {
      setFagorAlerts([]);
      setColtrackAlerts([]);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ placa: '', operador: '', contrato: '' });
  };
  
  const combinedAlerts = useMemo(() => [...fagorAlerts, ...coltrackAlerts], [fagorAlerts, coltrackAlerts]);

  const filteredAlerts = useMemo(() => {
    if (combinedAlerts.length === 0) return [];
    return combinedAlerts.filter(alert => 
      alert.placa.toLowerCase().includes(filters.placa.toLowerCase()) &&
      alert.operador.toLowerCase().includes(filters.operador.toLowerCase()) &&
      alert.contrato.toLowerCase().includes(filters.contrato.toLowerCase())
    );
  }, [combinedAlerts, filters]);

  const handleExportCSV = useCallback(() => {
    if (filteredAlerts.length === 0) {
        alert("No hay datos filtrados para exportar.");
        return;
    }

    const headers = [
        "Placa",
        "Velocidad (km/h)",
        "Fecha y Hora",
        "Operador",
        "Localidad",
        "Nombre del Contrato"
    ];
    
    // Helper to safely format CSV fields
    const formatCSVField = (field: any): string => {
        const str = String(field);
        // If the string contains a comma, double quote, or newline, wrap it in double quotes.
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            // Also, any double quote inside the string must be escaped by another double quote.
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const rows = filteredAlerts.map(alert => [
        formatCSVField(alert.placa),
        alert.velocidad,
        formatCSVField(alert.fechaHora),
        formatCSVField(alert.operador),
        formatCSVField(alert.localidad),
        formatCSVField(alert.contrato)
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    const today = new Date().toISOString().slice(0, 10);
    link.setAttribute("download", `reporte_alertas_velocidad_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filteredAlerts]);

  const highSpeedAlerts = useMemo(() => filteredAlerts.filter(a => a.velocidad >= 80), [filteredAlerts]);
  const mediumSpeedAlerts = useMemo(() => filteredAlerts.filter(a => a.velocidad >= 50 && a.velocidad < 80), [filteredAlerts]);
  const [activeTab, setActiveTab] = useState('report');

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen font-sans">
      <Header />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FileUpload 
                title="Datos de Fagor (XLSX)"
                description="Seleccione un archivo .xlsx o .xls"
                acceptedFiles=".xlsx, .xls"
                onFileProcess={handleFagorFileProcess} 
                isLoading={isLoadingFagor} 
            />
            <FileUpload 
                title="Datos de Coltrack (CSV)"
                description="Seleccione un archivo .csv"
                acceptedFiles=".csv"
                onFileProcess={handleColtrackFileProcess} 
                isLoading={isLoadingColtrack} 
            />
        </div>
        
        {error && <div className="my-4 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-center">{error}</div>}
        
        {combinedAlerts.length > 0 && (
          <div className="mt-4 text-center">
            <button
                onClick={handleClearAllData}
                className="px-6 py-2 bg-red-800 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-75 transition-all duration-300"
            >
                Limpiar Datos Cargados
            </button>
          </div>
        )}

        {(isLoadingFagor || isLoadingColtrack) && combinedAlerts.length === 0 && <Spinner />}

        {combinedAlerts.length > 0 && !isLoadingFagor && !isLoadingColtrack && (
          <>
            <div className="my-8 border-b border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('report')} className={`${activeTab === 'report' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors`}>
                        Reporte de Alertas
                    </button>
                    <button onClick={() => setActiveTab('dashboard')} className={`${activeTab === 'dashboard' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors`}>
                        Dashboard de Análisis
                    </button>
                </nav>
            </div>

            {activeTab === 'report' && (
                <>
                    <FilterControls 
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onClearFilters={handleClearFilters}
                        hasAlerts={combinedAlerts.length > 0}
                        onExport={handleExportCSV}
                    />
                    <div className="space-y-8 mt-8">
                        <VehicleTable
                            title="Alertas de Alta Velocidad (>= 80 km/h)"
                            alerts={highSpeedAlerts}
                            headerColor="bg-red-800"
                            accentColor="border-red-600"
                        />
                        <VehicleTable
                            title="Alertas de Velocidad Media (50-79 km/h)"
                            alerts={mediumSpeedAlerts}
                            headerColor="bg-yellow-800"
                            accentColor="border-yellow-600"
                        />
                    </div>
                </>
            )}
             {activeTab === 'dashboard' && <Dashboard alerts={combinedAlerts} />}
          </>
        )}
      </main>
    </div>
  );
};

export default App;