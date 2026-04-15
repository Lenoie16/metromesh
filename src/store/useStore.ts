import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { playAlertSound } from '../lib/audio';

export type TimeOfDay = 'Morning' | 'Peak' | 'Evening';
export type Trend = 'increasing' | 'decreasing' | 'stable';
export type Certainty = 'Low' | 'Medium' | 'High';
export type ViewMode = 'radar' | 'map';

export interface LogEntry {
  id: string;
  timestamp: number;
  type: 'info' | 'handshake' | 'fusion' | 'prediction';
  message: string;
  data?: any;
}

export interface RadarNode {
  id: string;
  x: number;
  y: number;
  timestamp: number;
}

export interface AlertConfig {
  id: string;
  type: 'density' | 'rapid_increase';
  threshold: number;
  visual: boolean;
  audio: boolean;
}

export interface AppNotification {
  id: string;
  message: string;
  timestamp: number;
}

interface AppState {
  zone: string;
  timeOfDay: TimeOfDay;
  currentDensity: number | null;
  predictedDensity: number | null;
  peerCount: number;
  certainty: Certainty;
  waitTime: number | null;
  logs: LogEntry[];
  nodes: RadarNode[];
  autoSimulate: boolean;
  lastUpdated: number | null;
  
  viewMode: ViewMode;
  alerts: AlertConfig[];
  notifications: AppNotification[];
  isAlertsModalOpen: boolean;
  
  setZone: (zone: string) => void;
  setTimeOfDay: (time: TimeOfDay) => void;
  setAutoSimulate: (auto: boolean) => void;
  setViewMode: (mode: ViewMode) => void;
  setAlertsModalOpen: (open: boolean) => void;
  
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  addNode: (node: Omit<RadarNode, 'timestamp'>) => void;
  removeOldNodes: () => void;
  processHandshake: (payload: HandshakePayload) => void;
  clearData: () => void;
  
  addAlert: (alert: Omit<AlertConfig, 'id'>) => void;
  removeAlert: (id: string) => void;
  addNotification: (message: string) => void;
  removeNotification: (id: string) => void;
}

export interface HandshakePayload {
  node_id: string;
  observed_density: number;
  data_freshness: number;
  trend: Trend;
  location_hash: string;
  timestamp_offset: number;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      zone: 'Platform A',
      timeOfDay: 'Morning',
      currentDensity: null,
      predictedDensity: null,
      peerCount: 0,
      certainty: 'Low',
      waitTime: null,
      logs: [],
      nodes: [],
      autoSimulate: false,
      lastUpdated: null,
      
      viewMode: 'radar',
      alerts: [],
      notifications: [],
      isAlertsModalOpen: false,

      setZone: (zone) => set({ zone }),
      setTimeOfDay: (timeOfDay) => set({ timeOfDay }),
      setAutoSimulate: (autoSimulate) => set({ autoSimulate }),
      setViewMode: (viewMode) => set({ viewMode }),
      setAlertsModalOpen: (isAlertsModalOpen) => set({ isAlertsModalOpen }),
      
      addLog: (log) => set((state) => ({
        logs: [
          { ...log, id: Math.random().toString(36).substring(7), timestamp: Date.now() },
          ...state.logs
        ].slice(0, 50)
      })),

      addNode: (node) => set((state) => ({
        nodes: [...state.nodes, { ...node, timestamp: Date.now() }]
      })),

      removeOldNodes: () => set((state) => ({
        nodes: state.nodes.filter(n => Date.now() - n.timestamp < 4000)
      })),
      
      addAlert: (alert) => set((state) => ({
        alerts: [...state.alerts, { ...alert, id: Math.random().toString(36).substring(7) }]
      })),
      
      removeAlert: (id) => set((state) => ({
        alerts: state.alerts.filter(a => a.id !== id)
      })),
      
      addNotification: (message) => set((state) => ({
        notifications: [...state.notifications, { id: Math.random().toString(36).substring(7), message, timestamp: Date.now() }]
      })),
      
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),

      processHandshake: (payload) => {
        const state = get();
        const now = Date.now();
        
        const localDensity = state.currentDensity ?? payload.observed_density;
        const localAge = state.lastUpdated ? (now - state.lastUpdated) / 1000 : 0;
        const peerAge = payload.data_freshness;

        const wLocal = 1 / (1 + localAge);
        const wPeer = 1 / (1 + peerAge);
        const wTotal = wLocal + wPeer;

        const normalizedWLocal = wLocal / wTotal;
        const normalizedWPeer = wPeer / wTotal;

        const newDensity = (localDensity * normalizedWLocal) + (payload.observed_density * normalizedWPeer);

        let rate = 0;
        if (payload.trend === 'increasing') rate = 0.05;
        if (payload.trend === 'decreasing') rate = -0.05;

        const timeMultiplier = state.timeOfDay === 'Peak' ? 1.5 : 1;
        const adjustedRate = rate * timeMultiplier;
        
        let predicted = newDensity + (adjustedRate * 5);
        predicted = Math.max(0, Math.min(1, predicted));

        const newPeerCount = state.peerCount + 1;
        let certainty: Certainty = 'Low';
        if (newPeerCount >= 6) certainty = 'High';
        else if (newPeerCount >= 3) certainty = 'Medium';

        const waitTime = Math.round(predicted * 12);
        
        // Process Alerts
        const prevDensity = state.currentDensity || 0;
        state.alerts.forEach(alert => {
          let triggered = false;
          let msg = '';
          
          if (alert.type === 'density' && newDensity >= alert.threshold && prevDensity < alert.threshold) {
            triggered = true;
            msg = `High Density Alert: Capacity exceeded ${Math.round(alert.threshold * 100)}%`;
          } else if (alert.type === 'rapid_increase' && payload.trend === 'increasing' && newDensity >= alert.threshold && prevDensity < alert.threshold) {
            triggered = true;
            msg = `Rapid Increase Alert: Capacity crossed ${Math.round(alert.threshold * 100)}% and rising`;
          }

          if (triggered) {
            if (alert.visual) {
              get().addNotification(msg);
            }
            if (alert.audio) {
              playAlertSound();
            }
            get().addLog({ type: 'info', message: `ALERT TRIGGERED: ${msg}` });
          }
        });

        set({
          currentDensity: newDensity,
          predictedDensity: predicted,
          peerCount: newPeerCount,
          certainty,
          waitTime,
          lastUpdated: now
        });

        get().addLog({
          type: 'fusion',
          message: `Fusion complete. New density: ${(newDensity * 100).toFixed(1)}%`,
          data: { w_local: normalizedWLocal.toFixed(2), w_peer: normalizedWPeer.toFixed(2) }
        });
        
        get().addLog({
          type: 'prediction',
          message: `Predicted density (5m): ${(predicted * 100).toFixed(1)}%`,
          data: { rate: adjustedRate.toFixed(3), trend: payload.trend }
        });
      },

      clearData: () => set({
        currentDensity: null,
        predictedDensity: null,
        peerCount: 0,
        certainty: 'Low',
        waitTime: null,
        logs: [],
        nodes: [],
        lastUpdated: null
      })
    }),
    {
      name: 'metromesh-storage',
      partialize: (state) => ({ 
        currentDensity: state.currentDensity,
        lastUpdated: state.lastUpdated,
        zone: state.zone,
        alerts: state.alerts
      }),
    }
  )
);
