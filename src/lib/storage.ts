import type { PersistedState, WaterContainer } from '../types';

const STORAGE_KEY = 'hydratation-demo-v1';

export const defaultContainers: WaterContainer[] = [
  { id: 'glass-200', name: 'Copo', amountMl: 200, kind: 'glass' },
  { id: 'bottle-500', name: 'Garrafa', amountMl: 500, kind: 'bottle' },
  { id: 'bottle-750', name: 'Squeeze', amountMl: 750, kind: 'bottle' },
];

const initialState: PersistedState = {
  user: null,
  goalMl: 2450,
  containers: defaultContainers,
  logs: [],
};

export function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;

    const saved = JSON.parse(raw) as Partial<PersistedState>;
    return {
      user: saved.user ?? null,
      goalMl: Number(saved.goalMl) > 0 ? Number(saved.goalMl) : initialState.goalMl,
      containers: Array.isArray(saved.containers) ? saved.containers : defaultContainers,
      logs: Array.isArray(saved.logs) ? saved.logs : [],
    };
  } catch {
    return initialState;
  }
}

export function saveState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // O protótipo continua utilizável mesmo quando o navegador bloqueia o armazenamento.
  }
}
