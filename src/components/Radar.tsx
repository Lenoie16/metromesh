import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { Radio } from 'lucide-react';

export function Radar() {
  const { nodes, removeOldNodes, autoSimulate } = useStore();
  const [pulses, setPulses] = useState<number[]>([]);

  // Cleanup old nodes
  useEffect(() => {
    const interval = setInterval(() => {
      removeOldNodes();
    }, 1000);
    return () => clearInterval(interval);
  }, [removeOldNodes]);

  // Generate pulses
  useEffect(() => {
    const interval = setInterval(() => {
      setPulses(p => [...p, Date.now()].slice(-3)); // Keep last 3 pulses
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-[600px] h-[600px] flex items-center justify-center">
      {/* Background grid/circles */}
      <div className="absolute w-[150px] h-[150px] rounded-full border border-[#00f2ff]/15" />
      <div className="absolute w-[300px] h-[300px] rounded-full border border-[#00f2ff]/15" />
      <div className="absolute w-[450px] h-[450px] rounded-full border border-[#00f2ff]/15" />
      <div className="absolute w-[600px] h-[600px] rounded-full border border-[#00f2ff]/15" />
      
      {/* Crosshairs */}
      <div className="absolute w-full h-[1px] bg-[#00f2ff]/5" />
      <div className="absolute h-full w-[1px] bg-[#00f2ff]/5" />

      {/* Sweep */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute w-full h-full rounded-full"
        style={{ background: 'conic-gradient(from 0deg, rgba(0, 242, 255, 0.2) 0deg, transparent 90deg)' }}
      />

      {/* Pulses */}
      <AnimatePresence>
        {pulses.map(id => (
          <motion.div
            key={id}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, ease: "easeOut" }}
            className="absolute w-24 h-24 rounded-full border border-[#00f2ff]/50 bg-[#00f2ff]/5"
          />
        ))}
      </AnimatePresence>

      {/* Nodes and Connection Lines */}
      <AnimatePresence>
        {nodes.map(node => (
          <div key={node.id} className="absolute inset-0 pointer-events-none">
            {/* Connection Line */}
            <motion.svg 
              className="absolute inset-0 w-full h-full" 
              viewBox="-300 -300 600 600"
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: 0.5, pathLength: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <line 
                x1="0" 
                y1="0" 
                x2={node.x} 
                y2={node.y} 
                stroke="#00f2ff" 
                strokeWidth="1" 
                strokeDasharray="4 4"
              />
            </motion.svg>

            {/* Node Point */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute w-2 h-2 bg-[#00f2ff] rounded-full shadow-[0_0_15px_#00f2ff]"
              style={{
                left: `calc(50% + ${node.x}px)`,
                top: `calc(50% + ${node.y}px)`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          </div>
        ))}
      </AnimatePresence>

      {/* Center Device */}
      <div className="relative z-10 flex items-center justify-center w-3 h-3 rounded-full bg-[#00f2ff] shadow-[0_0_20px_#00f2ff]">
        <div className={`absolute inset-0 rounded-full bg-[#00f2ff] ${autoSimulate ? 'animate-ping' : ''}`} />
      </div>
    </div>
  );
}
