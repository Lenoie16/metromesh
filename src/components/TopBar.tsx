import { useStore, TimeOfDay } from '../store/useStore';
import { Bell, Map as MapIcon, Radar as RadarIcon } from 'lucide-react';

export function TopBar() {
  const { zone, setZone, timeOfDay, setTimeOfDay, viewMode, setViewMode, setAlertsModalOpen } = useStore();

  return (
    <header role="banner" className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0a0a0c]/80 backdrop-blur-md z-[100]">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-[#00f2ff] rounded-sm shadow-[0_0_10px_rgba(0,242,255,0.5)]" aria-hidden="true" />
        <h1 className="text-lg tracking-[2px] uppercase font-extrabold text-[#00f2ff]">MetroMesh</h1>
        <span className="bg-[#ff3c3c]/15 text-[#ff3c3c] px-2.5 py-1 rounded font-mono text-[10px] border border-[#ff3c3c] uppercase ml-2" role="status" aria-label="System Status: Offline Mode">
          Offline Mode
        </span>
      </div>

      <nav aria-label="Main Navigation" className="flex gap-4">
        <div className="flex items-center gap-2 bg-[#1a1a1f] border border-white/10 rounded p-1" role="group" aria-label="View Mode Selection">
          <button
            onClick={() => setViewMode('radar')}
            aria-pressed={viewMode === 'radar'}
            aria-label="Switch to Radar View"
            className={`px-3 py-1 text-xs font-mono uppercase tracking-wider rounded transition-colors flex items-center gap-2 ${
              viewMode === 'radar' ? 'bg-[#00f2ff]/20 text-[#00f2ff]' : 'text-[#888] hover:text-white'
            }`}
          >
            <RadarIcon className="w-3.5 h-3.5" aria-hidden="true" /> Radar
          </button>
          <button
            onClick={() => setViewMode('map')}
            aria-pressed={viewMode === 'map'}
            aria-label="Switch to Map View"
            className={`px-3 py-1 text-xs font-mono uppercase tracking-wider rounded transition-colors flex items-center gap-2 ${
              viewMode === 'map' ? 'bg-[#00f2ff]/20 text-[#00f2ff]' : 'text-[#888] hover:text-white'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" aria-hidden="true" /> Map
          </button>
        </div>

        <button
          onClick={() => setAlertsModalOpen(true)}
          aria-label="Open Alerts Modal"
          className="flex items-center gap-2 bg-[#1a1a1f] border border-white/10 text-white px-3 py-1.5 rounded text-xs hover:bg-white/5 transition-colors font-mono uppercase tracking-wider"
        >
          <Bell className="w-3.5 h-3.5 text-[#ffaa00]" aria-hidden="true" /> Alerts
        </button>

        <div className="w-[1px] h-8 bg-white/10 mx-2" aria-hidden="true" />

        <div className="flex items-center gap-2 text-xs text-[#888]">
          <label htmlFor="zone-select">Zone</label>
          <select 
            id="zone-select"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            aria-label="Select Station Zone"
            className="bg-[#1a1a1f] border border-white/10 text-white px-3 py-1.5 rounded text-xs outline-none cursor-pointer"
          >
            <option value="Platform A">Platform A</option>
            <option value="Platform B">Platform B</option>
            <option value="North Concourse">North Concourse</option>
            <option value="South Exit">South Exit</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#888]">
          <label htmlFor="time-select">Time</label>
          <select 
            id="time-select"
            value={timeOfDay}
            onChange={(e) => setTimeOfDay(e.target.value as TimeOfDay)}
            aria-label="Select Time of Day"
            className="bg-[#1a1a1f] border border-white/10 text-white px-3 py-1.5 rounded text-xs outline-none cursor-pointer"
          >
            <option value="Morning">Morning Peak</option>
            <option value="Peak">Mid-Day</option>
            <option value="Evening">Evening Peak</option>
          </select>
        </div>
      </nav>
    </header>
  );
}
