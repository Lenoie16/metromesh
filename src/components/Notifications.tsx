import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X } from 'lucide-react';

export function Notifications() {
  const { notifications, removeNotification } = useStore();

  // Auto-remove notifications after 5 seconds
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        removeNotification(notifications[0].id);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications, removeNotification]);

  return (
    <div className="fixed top-20 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="pointer-events-auto bg-[#ff3c3c]/10 border border-[#ff3c3c]/50 backdrop-blur-md p-4 rounded shadow-[0_0_20px_rgba(255,60,60,0.2)] flex items-start gap-3 w-80"
          >
            <Bell className="w-5 h-5 text-[#ff3c3c] shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1">
              <h4 className="text-[#ff3c3c] font-mono text-xs font-bold uppercase tracking-wider mb-1">Alert Triggered</h4>
              <p className="text-white text-sm leading-snug">{notif.message}</p>
            </div>
            <button 
              onClick={() => removeNotification(notif.id)}
              className="text-[#ff3c3c]/70 hover:text-[#ff3c3c] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
