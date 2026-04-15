import { useState } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../store/useStore';
import { Users, Clock, AlertTriangle, Activity, TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { generateCrowdInsight } from '../lib/gemini';

export function StatusCard() {
  const { zone, currentDensity, predictedDensity, certainty, waitTime, lastUpdated, logs, peerCount } = useStore();
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const handleGenerateInsight = async () => {
    if (isGenerating || !zone || predictedDensity === null) return;
    setIsGenerating(true);
    const insight = await generateCrowdInsight(zone, predictedDensity, peerCount, trend);
    setAiInsight(insight);
    setIsGenerating(false);
  };

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

      {/* Card 4: Gemini AI Insights */}
      <div className="bg-[rgba(20,20,25,0.7)] border border-[#4285F4]/30 p-4 rounded-lg backdrop-blur-md h-full flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#FBBC05]" />
        <div className="flex justify-between items-start mb-2">
          <div className="text-[10px] text-[#888] uppercase tracking-[1px] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#4285F4]" />
            Google Gemini Insight
          </div>
          {!aiInsight && (
            <button 
              onClick={handleGenerateInsight}
              disabled={isGenerating}
              className="text-[10px] bg-[#4285F4]/20 text-[#4285F4] hover:bg-[#4285F4]/40 px-2 py-1 rounded transition-colors disabled:opacity-50"
            >
              {isGenerating ? 'Analyzing...' : 'Generate'}
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
          {aiInsight ? (
            <div className="text-xs text-white leading-relaxed">
              {aiInsight}
            </div>
          ) : (
            <div className="text-xs text-[#555] h-full flex items-center justify-center text-center italic">
              Click generate to analyze current crowd metrics using Google Gemini AI.
            </div>
          )}
        </div>
        
        {aiInsight && (
          <button 
            onClick={handleGenerateInsight}
            disabled={isGenerating}
            className="text-[10px] text-[#888] hover:text-white mt-2 text-left transition-colors"
          >
            {isGenerating ? 'Refreshing...' : '↻ Refresh Insight'}
          </button>
        )}
      </div>
    </section>
  );
}
