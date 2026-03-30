import React from 'react';
import { motion } from 'motion/react';
import { Sun, Moon, Sparkles, RotateCcw, Trash2, Plus, Minus, Type, Zap } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { ExportStorageSettings } from './ExportStorageSettings';

const COLORS = [
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Purple', hex: '#8b5cf6' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'White', hex: '#ffffff' },
];

const FONTS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Montserrat',
  'Playfair Display',
  'Space Grotesk',
  'JetBrains Mono',
];

export const Settings: React.FC = () => {
  const { settings, updateSettings, resetSettings, restorePreviousSettings } = useSettings();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black tracking-tight">App Settings</h1>
        <div className="flex gap-2">
          <button
            onClick={restorePreviousSettings}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-brand-surface/50 hover:bg-brand-surface rounded-xl transition-all border border-brand-border text-text-main"
            title="Restore previous settings"
          >
            <RotateCcw size={14} />
            RESTORE
          </button>
          <button
            onClick={resetSettings}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-all border border-red-500/20"
          >
            <Trash2 size={14} />
            RESET ALL
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theme Section */}
        <section className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
            <Sun size={16} />
            Theme Mode
          </h3>
          <div className="flex p-1 bg-brand-surface/50 rounded-xl border border-brand-border">
            <button
              onClick={() => updateSettings({ theme: 'light' })}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
                settings.theme === 'light' ? 'bg-brand-primary text-text-inverse shadow-lg' : 'text-text-muted hover:text-text-main'
              }`}
            >
              <Sun size={18} />
              <span className="font-bold">Light</span>
            </button>
            <button
              onClick={() => updateSettings({ theme: 'dark' })}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
                settings.theme === 'dark' ? 'bg-brand-primary text-text-inverse shadow-lg' : 'text-text-muted hover:text-text-main'
              }`}
            >
              <Moon size={18} />
              <span className="font-bold">Dark</span>
            </button>
            <button
              onClick={() => updateSettings({ theme: 'modern' })}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
                settings.theme === 'modern' ? 'bg-brand-primary text-text-inverse shadow-lg' : 'text-text-muted hover:text-text-main'
              }`}
            >
              <Sparkles size={18} />
              <span className="font-bold">Modern</span>
            </button>
            <button
              onClick={() => updateSettings({ theme: 'cyber' })}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
                settings.theme === 'cyber' ? 'bg-brand-primary text-text-inverse shadow-lg' : 'text-text-muted hover:text-text-main'
              }`}
            >
              <Zap size={18} />
              <span className="font-bold">Cyber</span>
            </button>
          </div>
        </section>

        {/* Primary Color Section */}
        <section className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-brand-primary" />
            Accent Color
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {COLORS.map((color) => (
              <button
                key={color.hex}
                onClick={() => updateSettings({ primaryColor: color.hex })}
                className={`w-full aspect-square rounded-xl border-2 transition-all ${
                  settings.primaryColor === color.hex ? 'border-text-main scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        </section>

        {/* Font Size Section */}
        <section className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
            <Type size={16} />
            Font Size
          </h3>
          <div className="flex items-center justify-between bg-brand-surface/50 p-4 rounded-xl border border-brand-border">
            <button
              onClick={() => updateSettings({ fontSize: Math.max(12, settings.fontSize - 1) })}
              className="p-2 hover:bg-brand-surface rounded-lg transition-all text-text-muted hover:text-text-main"
            >
              <Minus size={20} />
            </button>
            <div className="text-center">
              <span className="text-2xl font-black text-text-main">{settings.fontSize}</span>
              <span className="text-[10px] block text-text-muted font-bold">PIXELS</span>
            </div>
            <button
              onClick={() => updateSettings({ fontSize: Math.min(24, settings.fontSize + 1) })}
              className="p-2 hover:bg-brand-surface rounded-lg transition-all text-text-muted hover:text-text-main"
            >
              <Plus size={20} />
            </button>
          </div>
          <p className="text-[11px] text-text-muted text-center italic">
            Adjusts the overall scale of the application text.
          </p>
        </section>

        {/* Font Style Section */}
        <section className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
            <Type size={16} />
            Typography Style
          </h3>
          <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
            {FONTS.map((font) => (
              <button
                key={font}
                onClick={() => updateSettings({ fontStyle: font })}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all border ${
                  settings.fontStyle === font
                    ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary'
                    : 'bg-brand-surface/50 border-brand-border text-text-muted hover:text-text-main hover:bg-brand-surface'
                }`}
                style={{ fontFamily: font }}
              >
                {font}
              </button>
            ))}
          </div>
        </section>
      </div>

      <ExportStorageSettings />

      <div className="glass-card p-8 text-center space-y-4">
        <h2 className="text-xl font-black text-text-main" style={{ fontFamily: settings.fontStyle }}>
          Typography Preview
        </h2>
        <p className="text-text-muted leading-relaxed" style={{ fontSize: `${settings.fontSize}px` }}>
          The quick brown fox jumps over the lazy dog. This is how your journaling and checklists will look with the current settings.
        </p>
      </div>
    </div>
  );
};
