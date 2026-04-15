import { motion } from 'motion/react';
import { useStore } from '../store/useStore';
import { Users, Clock, AlertTriangle, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../lib/utils';

export function StatusCard() {
  const { currentDensity, predictedDensity, certainty, waitTime, lastUpdated, logs } = useStore();

  const isOffline = currentDensity === null;

  const getDensityColor = (density: number) => {
    if (density < 0.4) return 'text-[#00ff95]';
    if (density < 0.7) return 'text-[#ffaa00]';
    return 'text-[#ff3c3c]';
  };

  const getDensityBg = (density: number) => {
    if (density < 0.4) return 'bg-[#00ff95] shadow-[0_0_10px_#00ff95]';
    if (density < 0.7) return 'bg-[#ffaa00] shadow-[0_0_10px_#ffaa00]';
    return 'bg-[#ff3c3c] shadow-[0_0_10px_#ff3c3c]';
  };

  const certaintyPercent = certainty === 'High' ? 100 : certainty === 'Medium' ? 66 : 33;

  // Derive trend from the latest prediction log
  const latestPrediction = logs.find(l => l.type === 'prediction');
  const trend = latestPrediction?.data?.trend || 'stable';

  if (isOffline) {
    return (
      <section className="h-[180px] bg-[#0a0a0c] border-t border-white/10 p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-center z-10">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[rgba(20,20,25,0.7)] border border-white/10 p-4 rounded-lg backdrop-blur-md h-full flex flex-col justify-center opacity-50">
            <div className="text-[10px] text-[#888] uppercase tracking-[1px] mb-2">System Offline</div>
            <div className="text-2xl font-bold font-mono text-[#555]">--</div>
          </div>
        ))}
      </section>
    );
  }

  const densityColor = getDensityColor(predictedDensity!);
  const densityBg = getDensityBg(predictedDensity!);

  return (
    <section className="h-[180px] bg-[#0a0a0c] border-t border-white/10 p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-center z-10">
      {/* Card 1: Density */}
      <div className="bg-[rgba(20,20,25,0.7)] border border-white/10 p-4 rounded-lg backdrop-blur-md h-full flex flex-col justify-center">
        <div className="text-[10px] text-[#888] uppercase tracking-[1px] mb-2">Crowd Density</div>
        <div className={cn("text-2xl font-bold font-mono", densityColor)}>
          {Math.round(predictedDensity! * 100)}%
        </div>
        <div className={cn("text-xs mt-1 flex items-center gap-1", densityColor)}>
          {trend === 'increasing' && <TrendingUp className="w-3 h-3" />}
          {trend === 'decreasing' && <TrendingDown className="w-3 h-3" />}
          {trend === 'stable' && <Minus className="w-3 h-3" />}
          <span className="capitalize">{trend}</span>
        </div>
        <div className="h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
          <motion.div 
            className={cn("h-full", densityBg)}
            initial={{ width: 0 }}
            animate={{ width: `${predictedDensity! * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Card 2: Wait Time */}
      <div className="bg-[rgba(20,20,25,0.7)] border border-white/10 p-4 rounded-lg backdrop-blur-md h-full flex flex-col justify-center">
        <div className="text-[10px] text-[#888] uppercase tracking-[1px] mb-2">Wait Time</div>
        <div className="text-2xl font-bold font-mono text-white">
          {waitTime?.toString().padStart(2, '0')}
          <span className="text-[14px] text-[#666] ml-1 font-sans">MIN</span>
        </div>
        <div className="text-xs mt-1 text-[#888]">
          Recommendation: {predictedDensity! > 0.7 ? 'Hold' : 'Proceed'}
        </div>
        <div className="h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
          <motion.div 
            className="h-full bg-[#ffaa00] shadow-[0_0_10px_#ffaa00]"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (waitTime || 0) * 5)}%` }}
          />
        </div>
      </div>

      {/* Card 3: Certainty */}
      <div className="bg-[rgba(20,20,25,0.7)] border border-white/10 p-4 rounded-lg backdrop-blur-md h-full flex flex-col justify-center">
        <div className="text-[10px] text-[#888] uppercase tracking-[1px] mb-2">Certainty Level</div>
        <div className="text-2xl font-bold font-mono text-[#00ff95]">
          {certainty}
        </div>
        <div className="text-xs mt-1 text-[#888]">
          Peers: {useStore.getState().peerCount} active
        </div>
        <div className="h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
          <motion.div 
            className="h-full bg-[#00ff95] shadow-[0_0_10px_#00ff95]"
            initial={{ width: 0 }}
            animate={{ width: `${certaintyPercent}%` }}
          />
        </div>
      </div>

      {/* Card 4: Alt Suggestion */}
      <div className="bg-[rgba(20,20,25,0.7)] border border-white/10 p-4 rounded-lg backdrop-blur-md h-full flex flex-col justify-center">
        <div className="text-[10px] text-[#888] uppercase tracking-[1px] mb-2">Alt Suggestion</div>
        {predictedDensity! > 0.7 ? (
          <>
            <div className="text-lg font-bold font-sans text-white mt-2">
              North Stairwell
            </div>
            <div className="text-xs mt-1 text-[#00ff95]">
              35% Less Congestion
            </div>
          </>
        ) : (
          <>
            <div className="text-lg font-bold font-sans text-[#555] mt-2">
              None Needed
            </div>
            <div className="text-xs mt-1 text-[#888]">
              Current route is optimal
            </div>
          </>
        )}
      </div>
    </section>
  );
}
