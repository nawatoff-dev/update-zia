import React, { useState } from 'react';
import { CheckSquare, Calendar, Download, Upload, ShieldCheck, BookOpen, Settings as SettingsIcon, ChevronLeft, ChevronRight, BarChart3, LayoutDashboard, Zap, Bell, LayoutList, Wallet } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: 'dashboard' | 'checklist' | 'calendar' | 'journal' | 'settings' | 'analysis' | 'downloads' | 'alarms' | 'planning' | 'accounts';
  setActiveTab: (tab: 'dashboard' | 'checklist' | 'calendar' | 'journal' | 'settings' | 'analysis' | 'downloads' | 'alarms' | 'planning' | 'accounts') => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isOpen, 
  setIsOpen,
  isCollapsed,
  setIsCollapsed,
  onExport,
  onImport
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'checklist', label: 'Checklist', icon: CheckSquare },
    { id: 'journal', label: 'Journaling', icon: BookOpen },
    { id: 'analysis', label: 'Analysis Report', icon: BarChart3 },
    { id: 'calendar', label: 'Performance', icon: Calendar },
    { id: 'alarms', label: 'Alarms', icon: Bell },
    { id: 'planning', label: 'Planning', icon: LayoutList },
    { id: 'accounts', label: 'Accounts', icon: Wallet },
    { id: 'downloads', label: 'Downloads', icon: Download },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed top-0 left-0 h-full bg-brand-surface border-r border-brand-border z-50 transition-all duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <div className="p-4 flex flex-col h-full">
          <div className={cn(
            "flex items-center gap-3 mb-10 transition-all duration-300",
            isCollapsed ? "justify-center" : "px-2"
          )}>
            <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-cyan-500 rounded-xl flex items-center justify-center rotate-3 shadow-lg shadow-brand-primary/10 shrink-0">
              <span className="text-brand-dark font-bold text-lg">Z</span>
            </div>
            {!isCollapsed && (
              <h2 className="font-black text-xl tracking-tight text-text-main whitespace-nowrap overflow-hidden">
                z<span className="text-brand-primary">ZIA</span>
              </h2>
            )}
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setIsOpen(false);
                }}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                  activeTab === item.id 
                    ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/20" 
                    : "text-text-muted hover:text-text-main hover:bg-brand-surface/80",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <item.icon size={20} className={cn(
                  "transition-transform group-hover:scale-110 shrink-0",
                  activeTab === item.id ? "text-brand-primary" : "text-text-muted"
                )} />
                {!isCollapsed && <span className="font-medium whitespace-nowrap overflow-hidden">{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className="pt-6 border-t border-brand-border space-y-4">
            <div className="space-y-2">
              <button 
                onClick={onExport}
                title={isCollapsed ? "Backup Data" : undefined}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-text-muted hover:text-text-main hover:bg-brand-surface/80 rounded-lg transition-all",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <Download size={14} className="shrink-0" />
                {!isCollapsed && <span>BACKUP DATA</span>}
              </button>
              <label 
                title={isCollapsed ? "Restore Data" : undefined}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-text-muted hover:text-text-main hover:bg-brand-surface/80 rounded-lg transition-all cursor-pointer",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <Upload size={14} className="shrink-0" />
                {!isCollapsed && <span>RESTORE DATA</span>}
                <input type="file" accept=".json" onChange={onImport} className="hidden" />
              </label>
            </div>

            {!isCollapsed ? (
              <div className="p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
                <p className="text-[10px] text-text-muted uppercase tracking-widest font-black mb-2 flex items-center gap-2">
                  <ShieldCheck size={12} className="text-brand-primary" />
                  Auto-Save Active
                </p>
                <p className="text-[11px] font-medium text-brand-primary/80 leading-tight">
                  All data is stored locally on your device.
                </p>
              </div>
            ) : (
              <div className="flex justify-center">
                <ShieldCheck size={16} className="text-brand-primary" />
              </div>
            )}

            {/* Collapse Toggle Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex w-full items-center justify-center p-2 text-text-muted hover:text-text-main hover:bg-brand-surface/80 rounded-lg transition-all"
            >
              {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>

            {/* Live Shortcuts below Settings */}
            {!isCollapsed && (
              <div className="mt-4 p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
                <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Zap size={12} className="animate-pulse" />
                  Live Shortcuts
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'checklist', icon: CheckSquare },
                    { id: 'journal', icon: BookOpen },
                    { id: 'analysis', icon: BarChart3 },
                    { id: 'calendar', icon: Calendar }
                  ].map((s) => (
                    <button 
                      key={s.id}
                      onClick={() => setActiveTab(s.id as any)}
                      className="p-3 bg-brand-surface border border-brand-border rounded-xl hover:border-brand-primary/50 transition-all flex items-center justify-center group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <s.icon size={18} className="text-text-muted group-hover:text-brand-primary transition-colors relative z-10" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
