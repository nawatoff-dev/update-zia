import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { CheckSquare, BookOpen, BarChart3, Calendar, LayoutDashboard, ArrowRight, ShieldCheck, Zap, Settings as SettingsIcon, ChevronDown, Download } from 'lucide-react';
import { cn } from '../types';

interface DashboardProps {
  setActiveTab: (tab: 'dashboard' | 'checklist' | 'calendar' | 'journal' | 'settings' | 'analysis') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const guideRef = useRef<HTMLDivElement>(null);
  const shortcuts = [
    {
      id: 'checklist',
      title: 'Checklist',
      description: 'Verify your trade setups and psychology.',
      icon: CheckSquare,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      isLive: true
    },
    {
      id: 'journal',
      title: 'Journaling',
      description: 'Record your trades and thoughts.',
      icon: BookOpen,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      isLive: true
    },
    {
      id: 'analysis',
      title: 'Analysis Report',
      description: 'Document your technical analysis.',
      icon: BarChart3,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      isLive: true
    },
    {
      id: 'calendar',
      title: 'Performance',
      description: 'Track your trading results.',
      icon: Calendar,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      isLive: true
    }
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Welcome Section */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 neon-active-blue rounded-3xl shadow-xl">
              <LayoutDashboard className="text-neon-blue" size={40} />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight uppercase leading-none mb-2 text-text-main">Trading <span className="text-neon-blue">Dashboard</span></h1>
              <p className="text-text-muted font-medium flex items-center gap-2">
                <Zap size={14} className="text-neon-gold" />
                Welcome back. Follow your process and stay disciplined.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => guideRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="hidden md:flex items-center gap-2 px-6 py-3 bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/30 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest text-brand-primary group"
            >
              <ShieldCheck size={14} className="group-hover:scale-110 transition-transform" />
              Guide
              <ChevronDown size={14} className="animate-bounce" />
            </button>
            <div className="flex items-center gap-3 px-6 py-3 neon-indicator-gold rounded-2xl">
              <div className="w-2 h-2 bg-neon-gold rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-neon-gold">System Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shortcuts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {shortcuts.map((item, idx) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => setActiveTab(item.id as any)}
            className={cn(
              "group relative p-8 rounded-[2.5rem] transition-all duration-500 hover:scale-[1.05] hover:shadow-2xl",
              "bg-brand-surface/40 hover:bg-brand-surface",
              "neon-border-green"
            )}
          >
            <div className="flex items-start justify-between mb-8">
              <div className={cn("p-6 rounded-[2rem] transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 relative neon-icon-blue")}>
                {item.isLive && (
                  <div className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-gold opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-neon-gold"></span>
                  </div>
                )}
                <item.icon className="text-white" size={48} />
              </div>
              <div className="p-3 rounded-2xl bg-white/5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                <ArrowRight size={24} className="text-text-muted" />
              </div>
            </div>
            
            <h3 className="text-2xl font-black uppercase tracking-tight mb-2 text-text-main group-hover:text-neon-blue transition-colors">{item.title}</h3>
            <p className="text-text-muted text-sm font-medium leading-relaxed mb-6">{item.description}</p>
            
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-neon-blue opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
              Launch <ArrowRight size={12} />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Download Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-12 p-8 neon-panel-purple rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 group hover:shadow-2xl transition-all"
      >
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 neon-icon-blue rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Download className="text-white" size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-1 text-text-main">Download zZIA</h2>
            <p className="text-text-muted font-medium">Get the Windows or Android installer for a better experience.</p>
          </div>
        </div>
        <button 
          onClick={() => setActiveTab('downloads' as any)}
          className="px-8 py-4 bg-neon-blue text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-lg shadow-neon-blue/20 flex items-center gap-3"
        >
          Go to Downloads
          <ArrowRight size={16} />
        </button>
      </motion.div>

      {/* Guide Section */}
      <div ref={guideRef} className="neon-panel-purple rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group shadow-2xl scroll-mt-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-neon-blue/5 blur-[120px] -mr-48 -mt-48 transition-all group-hover:bg-neon-blue/10" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black uppercase flex items-center gap-3 text-text-main">
              <ShieldCheck className="text-neon-blue" />
              Your Trading Guide
            </h2>
            <button 
              onClick={() => setActiveTab('settings')}
              className="flex items-center gap-2 px-4 py-2 neon-active-blue rounded-xl transition-all text-[10px] font-black uppercase tracking-widest text-neon-blue shadow-lg"
            >
              <SettingsIcon size={14} />
              Settings
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl neon-active-blue flex items-center justify-center text-neon-blue font-black text-xl shadow-lg">1</div>
              <h3 className="text-lg font-bold text-text-main uppercase tracking-tight">Analyze</h3>
              <p className="text-sm text-text-muted leading-relaxed">Use the <span className="text-neon-blue font-bold">Analysis Report</span> to document your bias and find high-quality setups based on HTF alignment.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl neon-active-blue flex items-center justify-center text-neon-blue font-black text-xl shadow-lg">2</div>
              <h3 className="text-lg font-bold text-text-main uppercase tracking-tight">Verify</h3>
              <p className="text-sm text-text-muted leading-relaxed">Run through your <span className="text-neon-blue font-bold">A+ Checklist</span> and psychology check. Never click execute without a full verification.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl neon-active-blue flex items-center justify-center text-neon-blue font-black text-xl shadow-lg">3</div>
              <h3 className="text-lg font-bold text-text-main uppercase tracking-tight">Journal</h3>
              <p className="text-sm text-text-muted leading-relaxed">Log every trade in your <span className="text-neon-blue font-bold">Journal</span>. Review performance weekly to refine your edge and build confidence.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
