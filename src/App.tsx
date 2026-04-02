import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, Zap } from 'lucide-react';
import { cn } from './lib/utils';
import { IntroAnimation } from './components/IntroAnimation';
import { Sidebar } from './components/Sidebar';
import { Checklist } from './components/Checklist';
import { JournalCalendar } from './components/JournalCalendar';
import { JournalEntry } from './components/JournalEntry';
import { Settings } from './components/Settings';
import { Dashboard } from './components/Dashboard';
import { INITIAL_CHECKLIST } from './constants';
import { ChecklistSection, TradeEntry, AnalysisReport, Alarm, DailyPlan, CalendarPlan, Account } from './types';
import { AnalysisReport as AnalysisReportComponent } from './components/AnalysisReport';
import { Alarms } from './components/Alarms';
import { Planning } from './components/Planning';
import { Accounts } from './components/Accounts';
import { Downloads } from './components/Downloads';
import { useSettings } from './contexts/SettingsContext';
import { ModernThemeBackground } from './components/ModernThemeBackground';

export default function App() {
  const { settings } = useSettings();
  const [showIntro, setShowIntro] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'checklist' | 'calendar' | 'journal' | 'settings' | 'analysis' | 'downloads' | 'alarms' | 'planning' | 'accounts'>(() => {
    const saved = localStorage.getItem('zzia_active_tab');
    return (saved as any) || 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('zzia_active_tab', activeTab);
  }, [activeTab]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  // State for Checklist
  const [checklist, setChecklist] = useState<ChecklistSection[]>(() => {
    const saved = localStorage.getItem('zzia_checklist') || localStorage.getItem('prop_trader_checklist');
    const defaults = JSON.parse(JSON.stringify(INITIAL_CHECKLIST));
    if (!saved) return defaults;
    try {
      const parsed = JSON.parse(saved) as ChecklistSection[];
      
      // Check if we need to update core rules to the new ones
      const coreSection = parsed.find(s => s.type === 'Core');
      const oldCoreLabels1 = ['A+ Setup Verification', 'Psychology Check'];
      const oldCoreLabels2 = ['EXCEPTANCE', 'are you fine loosing this trade', 'have you excute your edge'];
      
      const hasOldCore = coreSection && (
        (coreSection.items.length === 2 && coreSection.items.every(item => oldCoreLabels1.includes(item.label))) ||
        (coreSection.items.length === 3 && coreSection.items.every(item => oldCoreLabels2.includes(item.label)))
      );
      
      // Check if we need to update A+ rules to the new ones
      const aPlusSection = parsed.find(s => s.type === 'A+');
      // If the new labels are missing, update to INITIAL_CHECKLIST[1]
      const hasMustLabels = aPlusSection && aPlusSection.items.some(item => item.label.includes('(must)'));
      const hasOptionalLabels = aPlusSection && aPlusSection.items.some(item => item.label.includes('(optional)'));
      const hasNewRule = aPlusSection && aPlusSection.items.some(item => item.label === 'bias -HTF alignment');
      const hasOldAPlus = aPlusSection && (!hasNewRule || !hasMustLabels || !hasOptionalLabels);

      if (hasOldCore || hasOldAPlus) {
        return parsed.map(section => {
          if (section.type === 'Core' && hasOldCore) return JSON.parse(JSON.stringify(INITIAL_CHECKLIST[0]));
          if (section.type === 'A+' && hasOldAPlus) return JSON.parse(JSON.stringify(INITIAL_CHECKLIST[1]));
          return section;
        });
      }

      // Filter out removed sections (A, B, C)
      return parsed.filter(section => section.type === 'Core' || section.type === 'A+');
    } catch (e) {
      return defaults;
    }
  });

  // Calculate Setup Status for Journaling
  const getSetupStatus = () => {
    const aPlusSection = checklist.find(s => s.type === 'A+');
    if (!aPlusSection || aPlusSection.items.length === 0) return null;
    
    const allItems = aPlusSection.items;
    const biasHtf = allItems.find(i => i.id === 'bias-htf');
    const biasCounter = allItems.find(i => i.id === 'bias-counter');
    
    // Filter out optional items for percentage calculation
    const nonOptionalItems = allItems.filter(i => !i.label.toLowerCase().includes('(optional)'));
    const otherRequiredItems = nonOptionalItems.filter(i => i.id !== 'bias-htf' && i.id !== 'bias-counter');
    const otherChecked = otherRequiredItems.filter(i => i.checked).length;
    
    const biasGroupChecked = (biasHtf?.checked || biasCounter?.checked) ? 1 : 0;
    
    const checkedCount = otherChecked + biasGroupChecked;
    const totalCount = otherRequiredItems.length + 1;
    const percentage = (checkedCount / totalCount) * 100;
    
    // Crucial items are those marked with (must) OR the default crucial ones if not explicitly marked
    const mustIds = allItems.filter(i => i.label.toLowerCase().includes('(must)')).map(i => i.id);
    const defaultCrucialIds = ['bias-htf', 'liquidity-sweep', 'clear-structure', 'structure-choch', 'structure-bos'];
    const crucialIds = mustIds.length > 0 ? [...new Set([...mustIds, 'bias-htf'])] : defaultCrucialIds;

    const areCrucialChecked = crucialIds.every(id => {
      if (id === 'bias-htf') {
        return allItems.find(item => item.id === 'bias-htf')?.checked || 
               allItems.find(item => item.id === 'bias-counter')?.checked;
      }
      return allItems.find(item => item.id === id)?.checked;
    });
    
    if (percentage === 100) {
      return { label: 'A+ Setup', sub: 'Risk 2%', color: 'text-emerald-400' };
    }
    if (percentage > 85 && areCrucialChecked) {
      return { label: 'A Setup', sub: 'Risk 1%', color: 'text-blue-400' };
    }
    if (areCrucialChecked) {
      return { label: 'B Setup', sub: 'Risk 0.5% • Optional', color: 'text-amber-400' };
    }
    return { label: 'C Setup', sub: 'Risk 0.0% • Red Flag', color: 'text-red-400' };
  };

  const setupStatus = getSetupStatus();

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Control + S (or Command + S on Mac)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setActiveTab('settings');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Backup functionality
  const exportData = () => {
    const data = {
      checklist,
      trades,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zZIA-Backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.checklist && data.trades) {
          if (confirm('Importing data will overwrite your current journal and checklist. Proceed?')) {
            setChecklist(data.checklist);
            setTrades(data.trades);
          }
        }
      } catch (err) {
        alert('Invalid backup file.');
      }
    };
    reader.readAsText(file);
  };

  // State for Trades
  const [trades, setTrades] = useState<TradeEntry[]>(() => {
    const saved = localStorage.getItem('zzia_trades') || localStorage.getItem('prop_trader_trades');
    return saved ? JSON.parse(saved) : [];
  });

  // State for Analysis Reports
  const [analysisReports, setAnalysisReports] = useState<AnalysisReport[]>(() => {
    const saved = localStorage.getItem('zzia_analysis_reports');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved) as any[];
      // Filter out reports older than 24 hours and migrate data
      const now = new Date().getTime();
      const oneDay = 24 * 60 * 60 * 1000;
      
      return parsed
        .filter(report => {
          const createdAt = new Date(report.createdAt).getTime();
          return now - createdAt < oneDay;
        })
        .map(report => {
          // Migration logic
          const migrated: AnalysisReport = {
            id: report.id,
            pair: report.pair,
            text: report.text,
            createdAt: report.createdAt,
            images: Array.isArray(report.images) ? report.images : (report.image ? [report.image] : []),
            bias: report.bias || (report.status === 'bullish' || report.status === 'bearish' ? report.status : null),
            quality: report.quality || (report.status === 'good' || report.status === 'risky' ? report.status : null),
          };
          return migrated;
        });
    } catch (e) {
      return [];
    }
  });

  // State for Alarms
  const [alarms, setAlarms] = useState<Alarm[]>(() => {
    const saved = localStorage.getItem('zzia_alarms');
    return saved ? JSON.parse(saved) : [];
  });

  // State for Daily Plans
  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>(() => {
    const saved = localStorage.getItem('zzia_daily_plans');
    return saved ? JSON.parse(saved) : [];
  });

  // State for Calendar Plans
  const [calendarPlans, setCalendarPlans] = useState<CalendarPlan[]>(() => {
    const saved = localStorage.getItem('zzia_calendar_plans');
    return saved ? JSON.parse(saved) : [];
  });

  // State for Accounts
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('zzia_accounts');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved) as any[];
      return parsed.map(acc => ({
        ...acc,
        initialBalance: acc.initialBalance ?? acc.balance ?? 0,
        balance: acc.balance ?? 0,
        pips: acc.pips ?? 0,
        history: Array.isArray(acc.history) ? acc.history : [{
          date: acc.createdAt || new Date().toISOString(),
          balance: acc.balance ?? 0,
          profit: 0,
          pips: acc.pips ?? 0
        }]
      }));
    } catch (e) {
      return [];
    }
  });

  // State for Active Alarms (ringing)
  const [activeAlarms, setActiveAlarms] = useState<{ [key: string]: { startTime: number; audio: HTMLAudioElement | null } }>({});

  // Alarm checking logic
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const nowTimestamp = now.getTime();
      
      // 1. Check for new alarms to start
      alarms.forEach(alarm => {
        if (alarm.enabled && alarm.time === currentTime && now.getSeconds() === 0) {
          if (!activeAlarms[alarm.id]) {
            setActiveAlarms(prev => ({
              ...prev,
              [alarm.id]: { startTime: nowTimestamp, audio: null }
            }));
            
            // Initial Notification
            if (Notification.permission === 'granted') {
              new Notification(`zZIA Alarm: ${alarm.label}`, {
                body: `It is now ${alarm.time}. Alarm will ring for 5 minutes.`,
                icon: '/icons/icon-192.svg',
                tag: `alarm-${alarm.id}`
              });
            }
          }
        }
      });

      // 2. Process active alarms
      const updatedActiveAlarms = { ...activeAlarms };
      let changed = false;

      Object.keys(updatedActiveAlarms).forEach(alarmId => {
        const alarm = alarms.find(a => a.id === alarmId);
        const active = updatedActiveAlarms[alarmId];
        
        if (!alarm || !alarm.enabled) {
          if (active.audio) {
            active.audio.pause();
            active.audio = null;
          }
          delete updatedActiveAlarms[alarmId];
          changed = true;
          return;
        }

        const elapsedMs = nowTimestamp - active.startTime;
        const fiveMinutesMs = 5 * 60 * 1000;

        if (elapsedMs >= fiveMinutesMs) {
          // 5 minutes passed, stop alarm
          if (active.audio) {
            active.audio.pause();
            active.audio = null;
          }
          delete updatedActiveAlarms[alarmId];
          changed = true;
        } else {
          // 5-minute window logic: 45s on, 15s off
          const elapsedSeconds = Math.floor(elapsedMs / 1000);
          const cycleSeconds = elapsedSeconds % 60;
          const shouldRing = cycleSeconds < 45;

          if (shouldRing) {
            if (!active.audio) {
              const audio = new Audio(alarm.sound);
              audio.loop = true;
              
              // Error handling for audio
              audio.onerror = (e) => {
                console.error('Audio load failed:', e);
                // Try fallback sound if the primary one fails
                const fallbackSound = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
                if (alarm.sound !== fallbackSound) {
                  console.log('Attempting fallback sound...');
                  const fallbackAudio = new Audio(fallbackSound);
                  fallbackAudio.loop = true;
                  fallbackAudio.play().catch(err => console.error('Fallback audio failed:', err));
                  updatedActiveAlarms[alarmId].audio = fallbackAudio;
                  setActiveAlarms({ ...updatedActiveAlarms });
                }
              };

              audio.play().catch(e => {
                console.log('Audio play failed', e);
                // If play fails immediately (e.g. autoplay blocked), we might need user interaction
              });
              updatedActiveAlarms[alarmId].audio = audio;
              changed = true;

              // Periodic Notification while ringing
              if (Notification.permission === 'granted' && cycleSeconds === 0) {
                new Notification(`zZIA Alarm: ${alarm.label}`, {
                  body: `Alarm is ringing... (${Math.floor((fiveMinutesMs - elapsedMs) / 1000)}s remaining)`,
                  icon: '/icons/icon-192.svg',
                  tag: `alarm-${alarm.id}`
                });
              }
            }
          } else {
            if (active.audio) {
              active.audio.pause();
              active.audio = null;
              changed = true;
            }
          }
        }
      });

      if (changed) {
        setActiveAlarms(updatedActiveAlarms);
      }
    };

    const interval = setInterval(checkAlarms, 1000);
    
    // Request notification permission on mount
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      clearInterval(interval);
      // Cleanup audio on unmount
      Object.values(activeAlarms).forEach(a => {
        const active = a as { audio: HTMLAudioElement | null };
        if (active.audio) active.audio.pause();
      });
    };
  }, [alarms, activeAlarms]);

  // Persistence for new states
  useEffect(() => {
    localStorage.setItem('zzia_alarms', JSON.stringify(alarms));
  }, [alarms]);

  useEffect(() => {
    localStorage.setItem('zzia_daily_plans', JSON.stringify(dailyPlans));
  }, [dailyPlans]);

  useEffect(() => {
    localStorage.setItem('zzia_calendar_plans', JSON.stringify(calendarPlans));
  }, [calendarPlans]);

  useEffect(() => {
    localStorage.setItem('zzia_accounts', JSON.stringify(accounts));
  }, [accounts]);

  // 24-hour reset check effect
  useEffect(() => {
    const checkResets = () => {
      const now = new Date().getTime();
      const oneDay = 24 * 60 * 60 * 1000;

      // Reset checklist if older than 24h
      const lastChecklistUpdate = localStorage.getItem('zzia_checklist_last_update');
      if (lastChecklistUpdate && now - parseInt(lastChecklistUpdate) > oneDay) {
        resetChecklist();
      }

      // Filter out reports older than 24 hours
      setAnalysisReports(prev => {
        const filtered = prev.filter(report => {
          const createdAt = new Date(report.createdAt).getTime();
          return now - createdAt < oneDay;
        });
        if (filtered.length !== prev.length) {
          return filtered;
        }
        return prev;
      });
    };

    const interval = setInterval(checkResets, 60000); // Check every minute
    checkResets(); // Check immediately on mount

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('zzia_trades', JSON.stringify(trades));
  }, [trades]);

  useEffect(() => {
    localStorage.setItem('zzia_analysis_reports', JSON.stringify(analysisReports));
  }, [analysisReports]);

  const toggleChecklistItem = (sectionId: string, itemId: string) => {
    setChecklist(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.map(item => 
            item.id === itemId ? { ...item, checked: !item.checked } : item
          )
        };
      }
      return section;
    }));
  };

  const addChecklistItem = (sectionId: string, label: string) => {
    setChecklist(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: [...section.items, { id: Math.random().toString(36).substr(2, 9), label, checked: false }]
        };
      }
      return section;
    }));
  };

  const deleteChecklistItem = (sectionId: string, itemId: string) => {
    setChecklist(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.filter(item => item.id !== itemId)
        };
      }
      return section;
    }));
  };

  const editChecklistItem = (sectionId: string, itemId: string, newLabel: string) => {
    setChecklist(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.map(item => 
            item.id === itemId ? { ...item, label: newLabel } : item
          )
        };
      }
      return section;
    }));
  };

  const resetChecklist = () => {
    setChecklist(prev => prev.map(section => ({
      ...section,
      items: section.items.map(item => ({ ...item, checked: false }))
    })));
  };

  const handleRestoreDefaults = () => {
    const freshChecklist = JSON.parse(JSON.stringify(INITIAL_CHECKLIST));
    setChecklist(freshChecklist);
    localStorage.setItem('zzia_checklist', JSON.stringify(freshChecklist));
    setIsRestoreModalOpen(false);
  };

  const addTrade = (trade: TradeEntry) => {
    setTrades(prev => [...prev, trade]);
  };

  const deleteTrade = (id: string) => {
    setTrades(prev => prev.filter(t => t.id !== id));
  };

  const resetTrades = () => {
    setTrades([]);
  };

  const addAnalysisReport = (report: AnalysisReport) => {
    setAnalysisReports(prev => [report, ...prev]);
  };

  const updateAnalysisReport = (updatedReport: AnalysisReport) => {
    setAnalysisReports(prev => prev.map(r => r.id === updatedReport.id ? updatedReport : r));
  };

  const deleteAnalysisReport = (id: string) => {
    setAnalysisReports(prev => prev.filter(r => r.id !== id));
  };

  const resetAnalysisReports = () => {
    setAnalysisReports([]);
  };

  const stopAlarm = (alarmId: string) => {
    setActiveAlarms(prev => {
      const active = prev[alarmId];
      if (active && active.audio) {
        active.audio.pause();
      }
      const updated = { ...prev };
      delete updated[alarmId];
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-brand-dark text-white selection:bg-emerald-500/30">
      <AnimatePresence>
        {showIntro && (
          <IntroAnimation onComplete={() => setShowIntro(false)} />
        )}
      </AnimatePresence>

      {!showIntro && (
        <div className="flex min-h-screen relative">
          {(settings.theme === 'modern' || settings.theme === 'cyber') && <ModernThemeBackground />}
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
            onExport={exportData}
            onImport={importData}
          />

          <main className={cn(
            "flex-1 min-h-screen relative transition-all duration-300 z-10",
            isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
          )}>
            {/* Top Navigation for Desktop */}
            <header className="hidden lg:flex items-center justify-between px-8 py-4 sticky top-0 bg-brand-dark/50 backdrop-blur-xl z-40 border-b border-brand-border">
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-brand-surface/50 border border-brand-border rounded-xl flex items-center gap-3">
                  <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                    {activeTab === 'dashboard' ? 'Overview' : activeTab.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={cn(
                    "px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border",
                    activeTab === 'dashboard' 
                      ? "bg-brand-primary text-text-inverse border-brand-primary shadow-lg shadow-brand-primary/20" 
                      : "bg-brand-surface/50 text-text-muted border-brand-border hover:text-text-main hover:bg-brand-surface"
                  )}
                >
                  Dashboard
                </button>
              </div>
            </header>

            {/* Header for Mobile */}
            <header className="lg:hidden flex items-center justify-between p-4 sticky top-0 bg-brand-dark/80 backdrop-blur-md z-30 border-b border-brand-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center rotate-3">
                  <span className="text-text-inverse font-bold text-sm">Z</span>
                </div>
                <span className="font-black tracking-tight text-text-main">z<span className="text-brand-primary">ZIA</span></span>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-text-muted hover:text-text-main"
              >
                <Menu size={24} />
              </button>
            </header>

            <div className="p-4 md:p-8">
              <AnimatePresence mode="wait">
                {activeTab === 'dashboard' ? (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Dashboard setActiveTab={setActiveTab} />
                  </motion.div>
                ) : activeTab === 'checklist' ? (
                  <motion.div
                    key="checklist"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Checklist 
                      sections={checklist} 
                      onToggle={toggleChecklistItem} 
                      onReset={resetChecklist}
                      onRestoreDefaults={() => setIsRestoreModalOpen(true)}
                      onAddItem={addChecklistItem}
                      onDeleteItem={deleteChecklistItem}
                      onEditItem={editChecklistItem}
                    />
                  </motion.div>
                ) : activeTab === 'calendar' ? (
                  <motion.div
                    key="calendar"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <JournalCalendar 
                      trades={trades} 
                      onAddTrade={addTrade} 
                      onDeleteTrade={deleteTrade}
                      onResetTrades={resetTrades}
                    />
                  </motion.div>
                ) : activeTab === 'journal' ? (
                  <motion.div
                    key="journal"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <JournalEntry 
                      setupStatus={setupStatus} 
                      checkedItems={checklist.flatMap(s => s.items.filter(i => i.checked).map(i => i.label))}
                      onSuccess={resetChecklist}
                    />
                  </motion.div>
                ) : activeTab === 'analysis' ? (
                  <motion.div
                    key="analysis"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AnalysisReportComponent 
                      reports={analysisReports}
                      onAddReport={addAnalysisReport}
                      onUpdateReport={updateAnalysisReport}
                      onDeleteReport={deleteAnalysisReport}
                      onResetReports={resetAnalysisReports}
                    />
                  </motion.div>
                ) : activeTab === 'alarms' ? (
                  <motion.div
                    key="alarms"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alarms 
                      alarms={alarms} 
                      setAlarms={setAlarms} 
                      activeAlarmIds={Object.keys(activeAlarms)}
                      onStopAlarm={stopAlarm}
                    />
                  </motion.div>
                ) : activeTab === 'planning' ? (
                  <motion.div
                    key="planning"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Planning 
                      dailyPlans={dailyPlans} 
                      setDailyPlans={setDailyPlans}
                      calendarPlans={calendarPlans}
                      setCalendarPlans={setCalendarPlans}
                    />
                  </motion.div>
                ) : activeTab === 'accounts' ? (
                  <motion.div
                    key="accounts"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Accounts accounts={accounts} setAccounts={setAccounts} />
                  </motion.div>
                ) : activeTab === 'downloads' ? (
                  <motion.div
                    key="downloads"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Downloads />
                  </motion.div>
                ) : (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Settings />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>
      )}
      <AnimatePresence>
        {isRestoreModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-brand-surface border border-brand-border p-6 rounded-2xl max-w-md w-full shadow-2xl"
            >
              <h3 className="text-xl font-black mb-2">RESTORE DEFAULTS?</h3>
              <p className="text-text-muted mb-6">This will remove all your custom rules and edits, restoring the checklist to its original state. This cannot be undone.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsRestoreModalOpen(false)}
                  className="flex-1 py-3 font-black text-sm border border-brand-border rounded-xl hover:bg-white/5 transition-colors"
                >
                  CANCEL
                </button>
                <button 
                  onClick={handleRestoreDefaults}
                  className="flex-1 py-3 font-black text-sm bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                >
                  RESTORE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
