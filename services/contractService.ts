import { ContractData } from '../types';

const API_URL = 'https://script.google.com/macros/s/AKfycbyO1ywoSOGQZuK6HfrumCGOLcCQvQuCK8tofIjEGJEihTssGkQHBljFx3M4JmfL5XY7/exec';

export const fetchContracts = async (): Promise<Map<string, string>> => {
  try {
    const response = await fetch(API_URL, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`Error en la API: ${response.statusText} (${response.status})`);
    }
    const responseData: { data: ContractData[] } = await response.json();
    
    if (!responseData || !Array.isArray(responseData.data)) {
      throw new Error('La respuesta de la API no contiene un array de contratos válido.');
    }
    
    const contractMap = new Map<string, string>();
    responseData.data.forEach(item => {
      if (item.Placa && item.Contrato) {
        contractMap.set(item.Placa.trim().toUpperCase(), item.Contrato);
      }
    });

    return contractMap;
  } catch (error) {
    console.error("Failed to fetch contracts:", error);
    throw new Error("No se pudo conectar con el servicio de contratos.");
  }
};
