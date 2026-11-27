export type ContainerKind = 'glass' | 'bottle' | 'cup';

export interface User {
  id: string;
  name: string;
  email: string;
  weightKg: number;
  heightCm: number;
}

export interface WaterContainer {
  id: string;
  name: string;
  amountMl: number;
  kind: ContainerKind;
}

export interface WaterLog {
  id: string;
  containerId: string;
  containerName: string;
  amountMl: number;
  consumedAt: string;
}

export interface PersistedState {
  user: User | null;
  goalMl: number;
  containers: WaterContainer[];
  logs: WaterLog[];
}
