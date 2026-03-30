import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Plus, Trash2, Power, Volume2, Pencil, CheckCircle2 } from 'lucide-react';
import { Alarm } from '../types';
import { cn } from '../lib/utils';

interface AlarmsProps {
  alarms: Alarm[];
  setAlarms: React.Dispatch<React.SetStateAction<Alarm[]>>;
  activeAlarmIds: string[];
  onStopAlarm: (id: string) => void;
}

export const ALARM_SOUNDS = [
  { name: 'Classic Bell', url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
  { name: 'Digital Alert', url: 'https://assets.mixkit.co/active_storage/sfx/1011/1011-preview.mp3' },
  { name: 'Soft Chime', url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' },
  { name: 'Cyber Pulse', url: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3' },
  { name: 'Emergency', url: 'https://assets.mixkit.co/active_storage/sfx/997/997-preview.mp3' }
];

export const Alarms: React.FC<AlarmsProps> = ({ alarms, setAlarms, activeAlarmIds, onStopAlarm }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingAlarmId, setEditingAlarmId] = useState<string | null>(null);
  const [newAlarm, setNewAlarm] = useState({ time: '08:00', label: '', sound: ALARM_SOUNDS[0].url });

  const addAlarm = () => {
    if (editingAlarmId) {
      setAlarms(prev => prev.map(a => a.id === editingAlarmId ? { ...a, ...newAlarm } : a));
      setEditingAlarmId(null);
    } else {
      const alarm: Alarm = {
        id: Math.random().toString(36).substr(2, 9),
        time: newAlarm.time,
        label: newAlarm.label || 'Alarm',
        enabled: true,
        sound: newAlarm.sound
      };
      setAlarms(prev => [...prev, alarm]);
    }
    setIsAdding(false);
    setNewAlarm({ time: '08:00', label: '', sound: ALARM_SOUNDS[0].url });
  };

  const deleteAlarm = (id: string) => {
    setAlarms(prev => prev.filter(a => a.id !== id));
  };

  const toggleAlarm = (id: string) => {
    setAlarms(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  const startEdit = (alarm: Alarm) => {
    setNewAlarm({ time: alarm.time, label: alarm.label, sound: alarm.sound });
    setEditingAlarmId(alarm.id);
    setIsAdding(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Alarms</h1>
          <p className="text-text-muted mt-1">Set alerts for your trading sessions and news events.</p>
        </div>
        <button
          onClick={() => {
            setEditingAlarmId(null);
            setNewAlarm({ time: '08:00', label: '', sound: ALARM_SOUNDS[0].url });
            setIsAdding(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-text-inverse font-black rounded-xl hover:scale-105 transition-all shadow-lg shadow-brand-primary/20"
        >
          <Plus size={20} />
          ADD ALARM
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {alarms.map((alarm) => {
            const isActive = activeAlarmIds.includes(alarm.id);
            return (
              <motion.div
                key={alarm.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  borderColor: isActive ? 'var(--brand-primary)' : 'rgba(255,255,255,0.1)'
                }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "glass-card p-6 flex items-center justify-between group transition-all border-2",
                  !alarm.enabled && !isActive ? 'opacity-60' : '',
                  isActive && "ring-4 ring-brand-primary/20 animate-pulse"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                    isActive ? "bg-brand-primary text-text-inverse" : (alarm.enabled ? 'bg-brand-primary/10 text-brand-primary' : 'bg-brand-surface text-text-muted')
                  )}>
                    <Bell size={24} className={isActive || alarm.enabled ? 'animate-bounce' : ''} />
                  </div>
                  <div>
                    <div className="text-3xl font-black tracking-tight">{alarm.time}</div>
                    <div className="text-lg font-black text-text-main uppercase tracking-tight">{alarm.label}</div>
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1">
                      <Volume2 size={10} />
                      {ALARM_SOUNDS.find(s => s.url === alarm.sound)?.name || 'Custom Sound'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isActive ? (
                    <button
                      onClick={() => onStopAlarm(alarm.id)}
                      className="px-4 py-2 bg-brand-primary text-text-inverse font-black rounded-xl hover:scale-105 transition-all shadow-lg shadow-brand-primary/20"
                    >
                      STOP
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(alarm)}
                        className="p-3 bg-brand-surface text-text-muted hover:text-brand-primary rounded-xl transition-all border border-brand-border"
                        title="Edit Alarm"
                      >
                        <Pencil size={20} />
                      </button>
                      <button
                        onClick={() => toggleAlarm(alarm.id)}
                        className={`p-3 rounded-xl transition-all ${alarm.enabled ? 'bg-brand-primary text-text-inverse' : 'bg-brand-surface text-text-muted border border-brand-border'}`}
                      >
                        <Power size={20} />
                      </button>
                      <button
                        onClick={() => deleteAlarm(alarm.id)}
                        className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-500/20"
                      >
                        <Trash2 size={20} />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {alarms.length === 0 && !isAdding && (
        <div className="glass-card p-12 text-center space-y-4">
          <div className="w-20 h-20 bg-brand-surface rounded-full flex items-center justify-center mx-auto border border-brand-border">
            <Bell size={40} className="text-text-muted" />
          </div>
          <h3 className="text-xl font-black">No Alarms Set</h3>
          <p className="text-text-muted max-w-xs mx-auto">Stay on top of your schedule by adding your first alarm.</p>
        </div>
      )}

      {/* Add Alarm Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-brand-surface border border-brand-border p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-6"
            >
              <h3 className="text-2xl font-black">{editingAlarmId ? 'Edit Alarm' : 'Create New Alarm'}</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-text-muted uppercase tracking-widest">Time</label>
                  <input
                    type="time"
                    value={newAlarm.time}
                    onChange={(e) => setNewAlarm({ ...newAlarm, time: e.target.value })}
                    className="w-full bg-brand-dark border border-brand-border p-4 rounded-xl text-2xl font-black focus:border-brand-primary outline-none transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-black text-text-muted uppercase tracking-widest">Label</label>
                  <input
                    type="text"
                    placeholder="e.g. London Open"
                    value={newAlarm.label}
                    onChange={(e) => setNewAlarm({ ...newAlarm, label: e.target.value })}
                    className="w-full bg-brand-dark border border-brand-border p-4 rounded-xl font-bold focus:border-brand-primary outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-text-muted uppercase tracking-widest">Select Sound</label>
                  <div className="grid grid-cols-1 gap-2">
                    {ALARM_SOUNDS.map((sound) => (
                      <button
                        key={sound.url}
                        onClick={() => setNewAlarm({ ...newAlarm, sound: sound.url })}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl border transition-all font-bold text-sm",
                          newAlarm.sound === sound.url 
                            ? "bg-brand-primary/10 border-brand-primary text-brand-primary" 
                            : "bg-brand-dark border-brand-border text-text-muted hover:border-brand-primary/50"
                        )}
                      >
                        {sound.name}
                        {newAlarm.sound === sound.url && <CheckCircle2 size={16} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-text-muted uppercase tracking-widest">Test Selected Sound</label>
                  <button 
                    onClick={() => {
                      const audio = new Audio(newAlarm.sound);
                      audio.onerror = (e) => {
                        console.error('Test audio failed:', e);
                        alert('Failed to load this sound. It might be blocked or unavailable.');
                      };
                      audio.play().catch(err => {
                        console.error('Test play failed:', err);
                        alert('Playback failed. Your browser might be blocking autoplay or the sound is unavailable.');
                      });
                    }}
                    className="w-full flex items-center justify-center gap-2 p-4 bg-brand-surface border border-brand-border rounded-xl font-bold hover:bg-brand-surface/80 transition-all"
                  >
                    <Volume2 size={18} />
                    Test Sound
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-4 font-black text-sm border border-brand-border rounded-xl hover:bg-white/5 transition-all"
                >
                  CANCEL
                </button>
                <button
                  onClick={addAlarm}
                  className="flex-1 py-4 font-black text-sm bg-brand-primary text-text-inverse rounded-xl hover:scale-105 transition-all shadow-lg shadow-brand-primary/20"
                >
                  SAVE ALARM
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
