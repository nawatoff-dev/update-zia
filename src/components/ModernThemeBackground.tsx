import React from 'react';
import { motion } from 'motion/react';
import { useSettings } from '../contexts/SettingsContext';

export const ModernThemeBackground: React.FC = () => {
  const { settings } = useSettings();
  const isCyber = settings.theme === 'cyber';

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${isCyber ? 'opacity-60' : 'opacity-40'}`}>
      {/* Scanline for Cyber Theme */}
      {isCyber && <div className="scanline" />}

      {/* Subtle Grid */}
      <div className="absolute inset-0" 
        style={{ 
          backgroundImage: isCyber 
            ? 'linear-gradient(var(--brand-primary) 0.5px, transparent 0.5px), linear-gradient(90deg, var(--brand-primary) 0.5px, transparent 0.5px)'
            : 'linear-gradient(var(--brand-border) 1px, transparent 1px), linear-gradient(90deg, var(--brand-border) 1px, transparent 1px)',
          backgroundSize: isCyber ? '40px 40px' : '100px 100px',
          opacity: isCyber ? 0.1 : 1
        }} 
      />
      
      {/* Glowing Candles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 100 }}
          animate={{ 
            opacity: [0, isCyber ? 0.5 : 0.3, 0], 
            y: -300,
            x: Math.sin(i) * 50 
          }}
          transition={{ 
            duration: 15 + Math.random() * 10, 
            repeat: Infinity, 
            delay: i * 2,
            ease: "linear"
          }}
          className="absolute"
          style={{ 
            left: `${(i * 15) + 5}%`,
            bottom: '-100px'
          }}
        >
          <div className="flex flex-col items-center">
            {/* Candle Wick Glow */}
            <div className={`w-1 h-1 bg-brand-primary rounded-full blur-[2px] mb-1 ${isCyber ? 'shadow-[0_0_8px_var(--brand-primary)]' : ''}`} />
            {/* Candle Body */}
            <div className={`w-2 h-16 rounded-full bg-gradient-to-b from-brand-primary/20 to-transparent border border-brand-primary/10 ${isCyber ? 'border-brand-primary/30' : ''}`} />
            {/* Bottom Glow */}
            <div className={`w-8 h-8 bg-brand-primary/5 rounded-full blur-xl -mt-4 ${isCyber ? 'bg-brand-primary/10' : ''}`} />
          </div>
        </motion.div>
      ))}

      {/* Ambient Glows */}
      <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/5 rounded-full blur-[120px] ${isCyber ? 'bg-brand-primary/10' : ''}`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-primary/5 rounded-full blur-[120px] ${isCyber ? 'bg-brand-primary/10' : ''}`} />
    </div>
  );
};
