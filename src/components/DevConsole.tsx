import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Terminal, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function DevConsole() {
  const { logs, clearData } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0; // Logs are prepended, so keep at top
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-[#0c0c0e]">
      <div className="p-4 border-b border-white/10 font-mono text-[11px] uppercase text-[#666] tracking-[1px] flex justify-between items-center">
        <span>Live Dev Console</span>
        <button 
          onClick={clearData}
          className="text-[#555] hover:text-[#ff3c3c] transition-colors p-1"
          title="Clear Data"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 p-4 font-mono text-[11px] text-[#00ff95] overflow-y-auto leading-relaxed custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-3 opacity-80"
            >
              <div className="flex items-start">
                <span className="text-[#555] mr-2 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 2 })}
                </span>
                <span>
                  {log.message}
                </span>
              </div>
              {log.data && (
                <div className="pl-[72px] text-[#555] whitespace-pre-wrap break-all mt-1">
                  {JSON.stringify(log.data, null, 2)}
                </div>
              )}
            </motion.div>
          ))}
          {logs.length === 0 && (
            <div className="text-[#555] italic text-center mt-10">
              Waiting for events...
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
