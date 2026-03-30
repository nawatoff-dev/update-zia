import React from 'react';
import { FolderOpen, X, CheckCircle2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export const ExportStorageSettings: React.FC = () => {
  const { exportStorageHandle, setExportStorage, resetExportStorage } = useSettings();

  return (
    <section className="glass-card p-6 space-y-4 border-brand-border/50">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2 opacity-70">
          <FolderOpen size={16} className="text-neon-blue" />
          Export Storage Location
        </h3>
        {exportStorageHandle && (
          <button
            onClick={resetExportStorage}
            className="p-1.5 hover:bg-red-500/10 text-text-muted hover:text-red-500 rounded-lg transition-all"
            title="Reset storage location"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="bg-brand-surface/50 p-4 rounded-xl border border-brand-border/50 space-y-4">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${exportStorageHandle ? 'bg-neon-blue/10 text-neon-blue shadow-[0_0_10px_rgba(14,165,233,0.1)]' : 'bg-brand-surface text-text-muted'}`}>
            <FolderOpen size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-text-main truncate uppercase tracking-tight">
              {exportStorageHandle ? exportStorageHandle.name : 'No folder selected'}
            </p>
            <p className="text-[10px] text-text-muted mt-0.5 font-medium uppercase tracking-widest opacity-60">
              {exportStorageHandle 
                ? 'Your exports will be saved to this directory.' 
                : 'Select a base directory for your PDF exports.'}
            </p>
          </div>
          {exportStorageHandle && (
            <CheckCircle2 size={20} className="text-neon-blue mt-1 drop-shadow-[0_0_5px_rgba(14,165,233,0.5)]" />
          )}
        </div>

        <button
          onClick={setExportStorage}
          className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border ${
            exportStorageHandle
              ? 'bg-brand-surface border-brand-border text-text-muted hover:text-text-main hover:bg-brand-surface/80'
              : 'bg-neon-blue border-neon-blue text-white hover:bg-neon-blue/90 shadow-[0_0_15px_rgba(14,165,233,0.3)]'
          }`}
        >
          {exportStorageHandle ? 'Change Folder' : 'Select Folder'}
        </button>
      </div>

      <p className="text-[10px] text-text-muted italic leading-relaxed opacity-60">
        Note: The File System Access API allows the application to save files directly to your local storage. 
        You will be prompted for permission when saving files.
      </p>
    </section>
  );
};
