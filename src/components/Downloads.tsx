import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Download, Monitor, Smartphone, ShieldCheck, Zap, ArrowRight, AlertTriangle, Plus } from 'lucide-react';

export const Downloads: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  const downloadOptions = [
    {
      id: 'windows',
      title: 'Windows',
      description: 'Desktop application for professional trading.',
      icon: Monitor,
      link: '/downloads/zZIA-setup.exe',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20'
    },
    {
      id: 'android',
      title: 'Android',
      description: 'Take your trading journal anywhere.',
      icon: Smartphone,
      link: '/downloads/zZIA.apk',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-neon-blue/10 border border-neon-blue/20 rounded-full mb-6 shadow-[0_0_15px_rgba(14,165,233,0.1)]"
        >
          <Zap size={14} className="text-neon-blue animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-neon-blue">Install zZIA</span>
        </motion.div>
        <h1 className="text-5xl font-black tracking-tighter uppercase mb-4 text-text-main">
          Download <span className="text-neon-blue drop-shadow-[0_0_10px_rgba(14,165,233,0.5)]">zZIA</span>
        </h1>
        <p className="text-text-muted max-w-xl mx-auto font-black text-[10px] uppercase tracking-[0.3em] opacity-70">
          Install zZIA on your devices for better performance, offline access, and a more integrated trading experience.
        </p>
      </div>

      {/* PWA Install Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-12 p-10 bg-gradient-to-br from-neon-blue/10 to-neon-purple/10 border border-neon-blue/30 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8 group hover:shadow-2xl hover:shadow-neon-blue/10 transition-all neon-panel-purple"
      >
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-neon-blue rounded-[2rem] flex items-center justify-center shadow-lg shadow-neon-blue/30 group-hover:scale-110 transition-transform">
            <Plus className="text-white" size={40} />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tight mb-2 text-text-main">Install as <span className="text-neon-blue">App</span></h2>
            <p className="text-text-muted font-medium max-w-md">Pin zZIA to your taskbar or home screen for instant access and full offline support.</p>
          </div>
        </div>
        <button 
          onClick={handleInstallClick}
          disabled={!isInstallable}
          className={`px-10 py-5 font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-xl flex items-center gap-3 ${
            isInstallable 
              ? "bg-neon-blue text-white hover:scale-105 shadow-neon-blue/30" 
              : "bg-brand-surface text-text-muted border border-brand-border cursor-not-allowed"
          }`}
        >
          {isInstallable ? "Install Now" : "Already Installed"}
          <ArrowRight size={18} />
        </button>
      </motion.div>

      {/* Warning Section */}
      <div className="mb-12 p-6 bg-neon-gold/10 border border-neon-gold/20 rounded-2xl flex items-start gap-4 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
        <AlertTriangle className="text-neon-gold shrink-0 mt-1" size={20} />
        <div className="text-sm">
          <p className="text-neon-gold font-black uppercase tracking-widest mb-1">Security Warning Notice</p>
          <p className="text-text-muted leading-relaxed font-medium">
            The .exe and .apk files below are currently <strong>placeholders</strong>. Windows and Android will flag them as "unrecognized" or "unsafe" because they are not yet signed with a developer certificate. For the best experience, we recommend using the <strong>"Install as App"</strong> button above.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {downloadOptions.map((option, idx) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`group relative p-10 rounded-[3rem] border ${option.border} bg-brand-surface/40 hover:bg-brand-surface transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-neon-blue/5 ${option.id === 'windows' ? 'neon-border-green' : 'border-neon-blue/30'}`}
          >
            <div className="flex items-start justify-between mb-10">
              <div className={`p-6 rounded-[2rem] ${option.bg} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-[0_0_20px_rgba(14,165,233,0.1)]`}>
                <option.icon className={option.color} size={48} />
              </div>
              <a
                href={option.link}
                download
                className="p-4 rounded-2xl bg-neon-blue text-white hover:scale-110 transition-all shadow-lg shadow-neon-blue/30"
              >
                <Download size={24} />
              </a>
            </div>

            <h3 className="text-3xl font-black uppercase tracking-tight mb-3 text-text-main group-hover:text-neon-blue transition-colors">
              {option.title}
            </h3>
            <p className="text-text-muted font-medium leading-relaxed mb-8">
              {option.description}
            </p>

            <a
              href={option.link}
              download
              className="inline-flex items-center gap-3 px-8 py-4 bg-brand-surface border border-brand-border rounded-2xl font-black text-xs uppercase tracking-widest hover:border-neon-blue hover:text-neon-blue transition-all shadow-[0_0_10px_rgba(14,165,233,0.05)]"
            >
              Download for {option.title}
              <ArrowRight size={14} />
            </a>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-brand-surface/30 border border-brand-border/50 rounded-[2.5rem] p-10 text-center neon-panel-purple"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-neon-purple/10 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.1)]">
            <ShieldCheck className="text-neon-purple" size={32} />
          </div>
        </div>
        <h3 className="text-xl font-black uppercase tracking-tight mb-4 text-text-main">PWA <span className="text-neon-purple">Technology</span></h3>
        <p className="text-text-muted text-sm max-w-lg mx-auto leading-relaxed mb-8 font-medium">
          zZIA uses Progressive Web App technology. This means it can be installed on any device without going through an app store, while maintaining full functionality and security.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <div className="px-4 py-2 bg-brand-surface border border-brand-border/50 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-neon-purple hover:border-neon-purple/30 transition-all">
            Works Offline
          </div>
          <div className="px-4 py-2 bg-brand-surface border border-brand-border/50 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-neon-purple hover:border-neon-purple/30 transition-all">
            Fast Loading
          </div>
          <div className="px-4 py-2 bg-brand-surface border border-brand-border/50 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-neon-purple hover:border-neon-purple/30 transition-all">
            No Store Required
          </div>
        </div>
      </motion.div>
    </div>
  );
};
