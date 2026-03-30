import React, { createContext, useContext, useState, useEffect } from 'react';
import { getBaseDirectory, setBaseDirectory, resetBaseDirectory } from '../services/fileService';

export type Theme = 'light' | 'dark' | 'modern' | 'cyber';

export interface Settings {
  theme: Theme;
  primaryColor: string;
  fontSize: number;
  fontStyle: string;
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  primaryColor: '#10b981', // emerald-500
  fontSize: 16,
  fontStyle: 'Inter',
};

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;
  restorePreviousSettings: () => void;
  exportStorageHandle: FileSystemDirectoryHandle | null;
  setExportStorage: () => Promise<void>;
  resetExportStorage: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('zzia_settings') || localStorage.getItem('prop_trader_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [previousSettings, setPreviousSettings] = useState<Settings | null>(null);
  const [exportStorageHandle, setExportStorageHandle] = useState<FileSystemDirectoryHandle | null>(null);

  useEffect(() => {
    getBaseDirectory().then(setExportStorageHandle);
  }, []);

  useEffect(() => {
    localStorage.setItem('zzia_settings', JSON.stringify(settings));
    applySettings(settings);
  }, [settings]);

  const applySettings = (s: Settings) => {
    const root = document.documentElement;
    
    // Theme
    if (s.theme === 'light') {
      root.classList.add('light');
      root.classList.remove('modern', 'cyber');
      root.style.setProperty('--brand-dark', '#f8fafc');
      root.style.setProperty('--brand-surface', '#ffffff');
      root.style.setProperty('--brand-border', '#e2e8f0');
      root.style.setProperty('--text-main', '#000000');
      root.style.setProperty('--text-muted', '#475569');
      root.style.setProperty('--text-inverse', '#ffffff');
    } else if (s.theme === 'modern') {
      root.classList.remove('light', 'cyber');
      root.classList.add('modern');
      root.style.setProperty('--brand-dark', '#0f1115');
      root.style.setProperty('--brand-surface', '#1a1d23');
      root.style.setProperty('--brand-border', '#2d333d');
      root.style.setProperty('--text-main', '#e2e8f0');
      root.style.setProperty('--text-muted', '#94a3b8');
      root.style.setProperty('--text-inverse', '#000000');
    } else if (s.theme === 'cyber') {
      root.classList.remove('light', 'modern');
      root.classList.add('cyber');
      root.style.setProperty('--brand-dark', '#020617');
      root.style.setProperty('--brand-surface', '#0f172a');
      root.style.setProperty('--brand-border', '#1e293b');
      root.style.setProperty('--text-main', '#f8fafc');
      root.style.setProperty('--text-muted', '#64748b');
      root.style.setProperty('--text-inverse', '#000000');
    } else {
      root.classList.remove('light', 'modern', 'cyber');
      root.style.setProperty('--brand-dark', '#0A0A0A');
      root.style.setProperty('--brand-surface', '#141414');
      root.style.setProperty('--brand-border', '#1A1A1A');
      root.style.setProperty('--text-main', '#ffffff');
      root.style.setProperty('--text-muted', '#71717a');
      root.style.setProperty('--text-inverse', '#000000');
    }

    // Primary Color
    root.style.setProperty('--brand-primary', s.primaryColor);
    
    // Set RGB version for transparency/glows
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '16, 185, 129';
    };
    root.style.setProperty('--brand-primary-rgb', hexToRgb(s.primaryColor));
    
    // Font Size
    root.style.fontSize = `${s.fontSize}px`;
    
    // Font Style
    // Quote font families with spaces
    const fontStyle = s.fontStyle.includes(' ') ? `"${s.fontStyle}"` : s.fontStyle;
    root.style.setProperty('--font-family-main', fontStyle);
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setPreviousSettings(settings);
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setPreviousSettings(settings);
    setSettings(DEFAULT_SETTINGS);
  };

  const restorePreviousSettings = () => {
    if (previousSettings) {
      setSettings(previousSettings);
    }
  };

  const setExportStorage = async () => {
    const handle = await setBaseDirectory();
    if (handle) setExportStorageHandle(handle);
  };

  const resetExportStorage = async () => {
    await resetBaseDirectory();
    setExportStorageHandle(null);
  };

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      updateSettings, 
      resetSettings, 
      restorePreviousSettings,
      exportStorageHandle,
      setExportStorage,
      resetExportStorage
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
};
