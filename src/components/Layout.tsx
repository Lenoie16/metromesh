import { useEffect } from 'react';
import { TopBar } from './TopBar';
import { Radar } from './Radar';
import { MapDisplay } from './MapDisplay';
import { StatusCard } from './StatusCard';
import { DevConsole } from './DevConsole';
import { AlertsModal } from './AlertsModal';
import { Notifications } from './Notifications';
import { useStore } from '../store/useStore';
import { simulateHandshake } from '../lib/simulation';
import { Play, Square } from 'lucide-react';

export function Layout() {
  const { autoSimulate, setAutoSimulate, viewMode } = useStore();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoSimulate) {
      interval = setInterval(() => {
        simulateHandshake();
      }, 5000 + Math.random() * 3000); // 5-8 seconds
    }
    return () => clearInterval(interval);
  }, [autoSimulate]);

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0c] text-white font-sans overflow-hidden bg-radial-grid">
      <TopBar />

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-[1px] bg-white/10 overflow-hidden">
        <section className="relative flex items-center justify-center bg-[#0a0a0c] overflow-hidden">
          {viewMode === 'map' ? (
            <MapDisplay />
          ) : (
            <Radar />
          )}

          <button
            onClick={() => simulateHandshake()}
            className="absolute right-8 bottom-8 bg-[#00f2ff] text-[#0a0a0c] border-none px-5 py-3 font-mono font-bold rounded cursor-pointer flex items-center gap-2.5 uppercase text-xs shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:scale-105 transition-transform z-20"
          >
            <span>+</span> Simulate Handshake
          </button>
          
          <button
            onClick={() => setAutoSimulate(!autoSimulate)}
            className={`absolute right-8 bottom-24 px-5 py-3 font-mono font-bold rounded cursor-pointer flex items-center justify-center gap-2.5 uppercase text-xs transition-all z-20 ${
              autoSimulate 
                ? 'bg-[#ff3c3c] text-white shadow-[0_0_20px_rgba(255,60,60,0.3)]' 
                : 'bg-[#1a1a1f] text-[#888] border border-white/10 hover:text-white'
            }`}
          >
            {autoSimulate ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {autoSimulate ? 'Stop Auto' : 'Start Auto'}
          </button>
        </section>

        <aside className="bg-[#0c0c0e] hidden lg:flex flex-col overflow-hidden">
          <DevConsole />
        </aside>
      </main>

      <StatusCard />
      
      <AlertsModal />
      <Notifications />
    </div>
  );
}
