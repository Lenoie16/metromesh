import { useState } from 'react';
import { useStore, AlertConfig } from '../store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, Bell, Volume2, Activity } from 'lucide-react';

export function AlertsModal() {
  const { alerts, addAlert, removeAlert, isAlertsModalOpen, setAlertsModalOpen } = useStore();
  
  const [type, setType] = useState<'density' | 'rapid_increase'>('density');
  const [threshold, setThreshold] = useState(80);
  const [visual, setVisual] = useState(true);
  const [audio, setAudio] = useState(true);

  if (!isAlertsModalOpen) return null;

  const handleAdd = () => {
    addAlert({
      type,
      threshold: threshold / 100,
      visual,
      audio
    });
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0c0c0e] border border-white/10 rounded-lg w-full max-w-md shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#1a1a1f]">
          <h2 className="text-[#00f2ff] font-mono text-sm font-bold uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Alert Configuration
          </h2>
          <button 
            onClick={() => setAlertsModalOpen(false)}
            className="text-[#888] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Add New Alert Form */}
          <div className="space-y-4 bg-white/5 p-4 rounded border border-white/5">
            <h3 className="text-xs text-[#888] uppercase tracking-wider font-mono mb-2">Create New Alert</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[#888] mb-1">Trigger Condition</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-[#0a0a0c] border border-white/10 text-white px-3 py-2 rounded text-sm outline-none"
                >
                  <option value="density">High Density Threshold</option>
                  <option value="rapid_increase">Rapid Increase Warning</option>
                </select>
              </div>

              <div>
                <label className="flex justify-between text-xs text-[#888] mb-1">
                  <span>Threshold Level</span>
                  <span className="text-[#00f2ff] font-mono">{threshold}%</span>
                </label>
                <input 
                  type="range" 
                  min="10" max="100" step="5"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full accent-[#00f2ff]"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={visual} 
                    onChange={(e) => setVisual(e.target.checked)}
                    className="accent-[#00f2ff]"
                  />
                  <Activity className="w-4 h-4 text-[#888]" />
                  <span>Visual Toast</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={audio} 
                    onChange={(e) => setAudio(e.target.checked)}
                    className="accent-[#00f2ff]"
                  />
                  <Volume2 className="w-4 h-4 text-[#888]" />
                  <span>Audio Beep</span>
                </label>
              </div>

              <button 
                onClick={handleAdd}
                className="w-full mt-2 bg-[#00f2ff]/10 hover:bg-[#00f2ff]/20 text-[#00f2ff] border border-[#00f2ff]/30 py-2 rounded font-mono text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Alert Rule
              </button>
            </div>
          </div>

          {/* Active Alerts List */}
          <div>
            <h3 className="text-xs text-[#888] uppercase tracking-wider font-mono mb-3">Active Rules ({alerts.length})</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
              <AnimatePresence>
                {alerts.length === 0 && (
                  <div className="text-center text-[#555] text-sm py-4 italic">No active alerts.</div>
                )}
                {alerts.map(alert => (
                  <motion.div 
                    key={alert.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-between bg-[#0a0a0c] border border-white/10 p-3 rounded"
                  >
                    <div>
                      <div className="text-sm text-white flex items-center gap-2">
                        {alert.type === 'density' ? 'Density >' : 'Rapid Incr >'} 
                        <span className="text-[#00f2ff] font-mono">{Math.round(alert.threshold * 100)}%</span>
                      </div>
                      <div className="text-xs text-[#888] flex gap-2 mt-1">
                        {alert.visual && <span className="flex items-center gap-1"><Activity className="w-3 h-3"/> Visual</span>}
                        {alert.audio && <span className="flex items-center gap-1"><Volume2 className="w-3 h-3"/> Audio</span>}
                      </div>
                    </div>
                    <button 
                      onClick={() => removeAlert(alert.id)}
                      className="text-[#555] hover:text-[#ff3c3c] p-2 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
