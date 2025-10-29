export interface VehicleAlert {
  placa: string;
  velocidad: number;
  fechaHora: string;
  operador: string;
  localidad: string;
  contrato: string;
}

export interface ContractData {
  Placa: string;
  Contrato: string;
  [key: string]: any; 
}

export interface FagorDataFromXLSX {
  [key: string]: any; 
}

export interface ColtrackDataFromCSV {
  Nombre: string;
  'Nombre Conductor': string;
  Apellido: string;
  Lat: string;
  Lon: string;
  'Hora Reporte': string;
  kph: string;
  [key: string]: any; 
}

export interface StatItem {
  name: string;
  count: number;
}
