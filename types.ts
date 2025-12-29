
export enum OperationType {
  REVISION = 'Revisión',
  REPARACION = 'Reparación',
  GARANTIA = 'Garantía'
}

export enum OrderStatus {
  PENDIENTE = 'Pendiente',
  EN_PROCESO = 'En Proceso',
  COMPLETADO = 'Completado'
}

export interface InventoryChecklist {
  [key: string]: boolean;
}

export interface OwnerData {
  name: string;
  idNumber: string;
  phone: string;
  email: string;
}

export interface MotorcycleData {
  model: string;
  chassisSerial: string;
  engineSerial: string;
  displacement: string;
  plate: string;
  mileage: string;
  color: string;
  year: string;
}

export interface OrderUpdate {
  timestamp: string;
  note: string;
  photo?: string;
}

export interface WorkshopOrder {
  id: string; // 6 digit auto
  entryDate: string;
  operationType: OperationType;
  owner: OwnerData;
  motorcycle: MotorcycleData;
  checklist: InventoryChecklist;
  photoVehicle?: string;
  photoChassis?: string;
  observations: string;
  clientReport: string;
  status: OrderStatus;
  technicianNotes: string;
  workHours: number;
  updates: OrderUpdate[];
  completionDate?: string;
  estimatedCost?: number;
}

export interface DashboardStats {
  received: number;
  inProgress: number;
  completed: number;
  totalIncome: number;
}
