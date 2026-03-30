import React, { useState, useMemo } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isToday,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { ChevronLeft, ChevronRight, Download, TrendingUp, TrendingDown, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TradeEntry, cn } from '../types';
import jsPDF from 'jspdf';
import { toCanvas } from 'html-to-image';
import { savePdf } from '../services/fileService';

interface JournalCalendarProps {
  trades: TradeEntry[];
  onAddTrade: (trade: TradeEntry) => void;
  onDeleteTrade: (id: string) => void;
  onResetTrades: () => void;
}

export const JournalCalendar: React.FC<JournalCalendarProps> = ({ trades, onAddTrade, onDeleteTrade, onResetTrades }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const winRate = useMemo(() => {
    const monthTrades = trades.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
    });
    if (monthTrades.length === 0) return 0;
    const wins = monthTrades.filter(t => t.result === 'win').length;
    return Math.round((wins / monthTrades.length) * 100);
  }, [trades, currentMonth]);

  const breakEvenRate = useMemo(() => {
    const monthTrades = trades.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
    });
    if (monthTrades.length === 0) return 0;
    const be = monthTrades.filter(t => t.result === 'breakeven').length;
    return Math.round((be / monthTrades.length) * 100);
  }, [trades, currentMonth]);

  const exportToPDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - (margin * 2);
    let yOffset = margin;

    const addSectionToPdf = async (element: HTMLElement) => {
      if (!element) return;
      const canvas = await toCanvas(element, {
        backgroundColor: '#ffffff',
        width: 800,
        style: { transform: 'scale(1)', left: '0', top: '0' }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const displayWidth = contentWidth;
      const displayHeight = (imgProps.height * displayWidth) / imgProps.width;

      if (yOffset + displayHeight > pageHeight - margin) {
        pdf.addPage();
        yOffset = margin;
      }

      pdf.addImage(imgData, 'PNG', margin, yOffset, displayWidth, displayHeight);
      yOffset += displayHeight + 5;
    };

    const reportContainer = document.createElement('div');
    reportContainer.style.width = '800px';
    reportContainer.style.padding = '40px';
    reportContainer.style.backgroundColor = '#ffffff';
    reportContainer.style.color = '#09090b';
    reportContainer.style.fontFamily = 'Inter, sans-serif';

    const monthTrades = trades.filter(t => format(new Date(t.date), 'yyyy-MM') === format(currentMonth, 'yyyy-MM'));

    const sections = [
      // Header
      `
      <div class="pdf-section" style="margin-bottom: 40px; border-bottom: 2px solid #f3f4f6; padding-bottom: 20px; text-align: center;">
        <h1 style="font-size: 32px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: -1px;">Trading Performance</h1>
        <p style="color: #71717a; margin-top: 5px; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">${format(currentMonth, 'MMMM yyyy')}</p>
      </div>
      `,
      // Stats
      `
      <div class="pdf-section" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px;">
        <div style="background: #f9fafb; padding: 20px; border-radius: 16px; border: 1px solid #e5e7eb; text-align: center;">
          <p style="font-size: 10px; color: #71717a; font-weight: 900; letter-spacing: 1px; margin: 0 0 10px 0; text-transform: uppercase;">WIN RATE</p>
          <h2 style="font-size: 32px; font-weight: 900; margin: 0; color: #10b981;">${winRate}%</h2>
        </div>
        <div style="background: #f9fafb; padding: 20px; border-radius: 16px; border: 1px solid #e5e7eb; text-align: center;">
          <p style="font-size: 10px; color: #71717a; font-weight: 900; letter-spacing: 1px; margin: 0 0 10px 0; text-transform: uppercase;">BREAK EVEN</p>
          <h2 style="font-size: 32px; font-weight: 900; margin: 0; color: #f59e0b;">${breakEvenRate}%</h2>
        </div>
      </div>
      `,
      // Table Header
      `
      <div class="pdf-section">
        <h3 style="font-size: 14px; font-weight: 900; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 2px; color: #71717a;">Trade Logs</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="text-align: left; border-bottom: 2px solid #f3f4f6;">
              <th style="padding: 12px; color: #71717a; font-size: 10px; font-weight: 900; text-transform: uppercase;">DATE</th>
              <th style="padding: 12px; color: #71717a; font-size: 10px; font-weight: 900; text-transform: uppercase;">RESULT</th>
            </tr>
          </thead>
        </table>
      </div>
      `
    ];

    // Add trades in chunks to support multi-page tables
    const chunkSize = 15;
    for (let i = 0; i < monthTrades.length; i += chunkSize) {
      const chunk = monthTrades.slice(i, i + chunkSize);
      sections.push(`
        <div class="pdf-section">
          <table style="width: 100%; border-collapse: collapse;">
            <tbody>
              ${chunk.map(t => `
                <tr style="border-bottom: 1px solid #f9fafb;">
                  <td style="padding: 12px; font-size: 13px; font-weight: 600; color: #3f3f46;">${format(new Date(t.date), 'MMM dd, yyyy')}</td>
                  <td style="padding: 12px; font-size: 13px; font-weight: 900; color: ${t.result === 'win' ? '#10b981' : t.result === 'breakeven' ? '#f59e0b' : '#ef4444'}">${t.result.toUpperCase()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `);
    }

    if (monthTrades.length === 0) {
      sections.push('<div class="pdf-section"><p style="text-align: center; color: #71717a; padding: 40px;">No trades recorded for this month.</p></div>');
    }

    document.body.appendChild(reportContainer);

    for (const html of sections) {
      reportContainer.innerHTML = html;
      const element = reportContainer.firstElementChild as HTMLElement;
      await addSectionToPdf(element);
    }

    document.body.removeChild(reportContainer);
    const blob = pdf.output('blob');
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `Performance_Report_${dateStr}.pdf`;
    await savePdf(blob, fileName, 'performance');
  };
;

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
  };

  const addTrade = (result: 'win' | 'loss' | 'breakeven') => {
    if (!selectedDate) return;
    const newTrade: TradeEntry = {
      id: Math.random().toString(36).substr(2, 9),
      date: selectedDate.toISOString(),
      result,
      execution: 'good'
    };
    onAddTrade(newTrade);
    setSelectedDate(null);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2 text-text-main uppercase">TRADING <span className="text-neon-blue drop-shadow-[0_0_8px_rgba(14,165,233,0.5)] tracking-widest">JOURNAL</span></h1>
          <p className="text-text-muted font-black text-[10px] uppercase tracking-[0.3em] opacity-70">Track your performance and psychology.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsResetModalOpen(true)}
            className="px-4 py-2 text-[10px] font-black text-text-muted hover:text-red-500 transition-all border border-brand-border rounded-lg hover:border-red-500/30 uppercase tracking-widest"
          >
            RESET JOURNAL
          </button>
          <button 
            onClick={() => setSelectedDate(new Date())}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-surface/50 border border-brand-border text-text-main font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-brand-surface hover:border-neon-blue/30 transition-all"
          >
            <TrendingUp size={18} className="text-neon-blue" />
            LOG TODAY
          </button>
          <div className="flex items-center bg-brand-surface border border-brand-border rounded-xl p-1">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-brand-surface/50 rounded-lg transition-colors text-text-muted hover:text-neon-blue">
              <ChevronLeft size={20} />
            </button>
            <span className="px-4 font-black text-[10px] uppercase tracking-widest min-w-[140px] text-center text-text-main">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-brand-surface/50 rounded-lg transition-colors text-text-muted hover:text-neon-blue">
              <ChevronRight size={20} />
            </button>
          </div>
          <button 
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2.5 bg-neon-blue text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-neon-blue/90 transition-all shadow-[0_0_15px_rgba(14,165,233,0.3)]"
          >
            <Download size={18} />
            EXPORT PDF
          </button>
        </div>
      </div>

      <div id="journal-content" className="grid lg:grid-cols-3 gap-8">
        {/* Stats Column */}
        <div className="space-y-6">
          <div className="glass-card p-6 border-brand-border/50 neon-panel-purple">
            <p className="text-[10px] font-black text-text-muted tracking-[0.2em] uppercase mb-4 opacity-70">Monthly Stats</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-brand-surface/50 border border-brand-border/50 shadow-[0_0_10px_rgba(16,185,129,0.05)]">
                <TrendingUp size={18} className="text-neon-green mb-1" />
                <p className="text-xl font-black text-text-main drop-shadow-[0_0_8px_rgba(16,185,129,0.2)]">{winRate}%</p>
                <p className="text-[9px] text-text-muted font-black tracking-widest uppercase">WIN RATE</p>
              </div>
              <div className="p-3 rounded-2xl bg-brand-surface/50 border border-brand-border/50 shadow-[0_0_10px_rgba(245,158,11,0.05)]">
                <TrendingUp size={18} className="text-neon-gold mb-1 rotate-90" />
                <p className="text-xl font-black text-text-main drop-shadow-[0_0_8px_rgba(245,158,11,0.2)]">{breakEvenRate}%</p>
                <p className="text-[9px] text-text-muted font-black tracking-widest uppercase">B.E RATE</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border-brand-border/50">
            <p className="text-[10px] font-black text-text-muted tracking-[0.2em] uppercase mb-4 opacity-70">Recent Trades</p>
            <div className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar">
              {trades
                .filter(t => format(new Date(t.date), 'yyyy-MM') === format(currentMonth, 'yyyy-MM'))
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(trade => (
                  <div key={trade.id} className="flex items-center justify-between p-3 rounded-xl bg-brand-surface/50 border border-brand-border/50 group hover:border-neon-blue/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-8 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.2)]",
                        trade.result === 'win' ? "bg-neon-green shadow-[0_0_8px_rgba(16,185,129,0.3)]" : trade.result === 'breakeven' ? "bg-neon-gold shadow-[0_0_8px_rgba(245,158,11,0.3)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]"
                      )} />
                      <div>
                        <p className="text-sm font-black text-text-main uppercase tracking-tight">{format(new Date(trade.date), 'MMM dd')}</p>
                        <p className={cn(
                          "text-[9px] font-black uppercase tracking-widest",
                          trade.result === 'win' ? "text-neon-green" : trade.result === 'breakeven' ? "text-neon-gold" : "text-red-500"
                        )}>
                          {trade.result}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => onDeleteTrade(trade.id)}
                      className="p-2 text-text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                ))}
              {trades.length === 0 && (
                <p className="text-center py-8 text-text-muted text-[10px] font-black uppercase tracking-widest italic opacity-50">No trades logged yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Calendar Column */}
        <div className="lg:col-span-2">
          <div className="glass-card p-4 border-brand-border/50 neon-border-green">
            <div className="grid grid-cols-7 mb-2">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                <div key={day} className="text-center py-2 text-[9px] font-black text-text-muted tracking-[0.2em] uppercase opacity-60">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, idx) => {
                const dayTrades = trades.filter(t => isSameDay(new Date(t.date), day));
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();

                return (
                  <button
                    key={idx}
                    onClick={() => handleDayClick(day)}
                    className={cn(
                      "aspect-square relative flex flex-col items-center justify-center rounded-xl transition-all border",
                      !isCurrentMonth ? "opacity-10 border-transparent" : "border-brand-border/50 hover:bg-brand-surface/50 hover:border-neon-blue/30",
                      isToday(day) && "border-neon-blue/50 bg-neon-blue/5 shadow-[inset_0_0_10px_rgba(14,165,233,0.1)]",
                      selectedDate && isSameDay(day, selectedDate) && "ring-1 ring-neon-blue ring-inset bg-neon-blue/10"
                    )}
                  >
                    <span className={cn(
                      "text-xs font-black mb-1 tracking-tighter",
                      isToday(day) ? "text-neon-blue drop-shadow-[0_0_5px_rgba(14,165,233,0.5)]" : "text-text-main"
                    )}>
                      {format(day, 'd')}
                    </span>
                    <div className="flex gap-0.5">
                      {dayTrades.map((t, i) => (
                        <div 
                          key={i} 
                          className={cn(
                            "w-1.5 h-1.5 rounded-full shadow-[0_0_5px_rgba(0,0,0,0.3)]",
                            t.result === 'win' ? "bg-neon-green shadow-[0_0_5px_rgba(16,185,129,0.5)]" : t.result === 'breakeven' ? "bg-neon-gold shadow-[0_0_5px_rgba(245,158,11,0.5)]" : "bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]"
                          )} 
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence>
            {isResetModalOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsResetModalOpen(false)}
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-md glass-card p-8 border-red-500/30 bg-red-500/[0.02] shadow-[0_0_30px_rgba(239,68,68,0.1)]"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                      <XCircle size={32} className="text-red-500" />
                    </div>
                    <h3 className="text-2xl font-black mb-2 text-text-main uppercase tracking-widest">RESET <span className="text-red-500">JOURNAL?</span></h3>
                    <p className="text-text-muted mb-8 font-medium text-sm">This will permanently delete all your trade logs. This action cannot be undone.</p>
                    
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => {
                          onResetTrades();
                          setIsResetModalOpen(false);
                        }}
                        className="w-full py-4 bg-red-500 text-white font-black rounded-2xl hover:bg-red-600 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] uppercase tracking-widest text-xs"
                      >
                        YES, RESET EVERYTHING
                      </button>
                      <button 
                        onClick={() => setIsResetModalOpen(false)}
                        className="w-full py-4 text-text-muted font-black uppercase tracking-widest text-[10px] hover:text-text-main transition-colors"
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-6 p-6 glass-card border-neon-blue/30 bg-neon-blue/[0.02] shadow-[0_0_20px_rgba(14,165,233,0.05)]"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-xl text-text-main uppercase tracking-tight">LOG TRADE: <span className="text-neon-blue drop-shadow-[0_0_8px_rgba(14,165,233,0.5)]">{format(selectedDate, 'MMM dd, yyyy')}</span></h3>
                  <button onClick={() => setSelectedDate(null)} className="text-text-muted hover:text-red-500 transition-colors">
                    <XCircle size={20} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-8">
                  <div>
                    <p className="text-[10px] font-black text-text-muted tracking-[0.2em] uppercase mb-3 opacity-70">Select Result</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => addTrade('win')}
                        className="flex-1 py-4 rounded-2xl bg-neon-green/10 border border-neon-green/20 text-neon-green font-black uppercase tracking-widest text-xs hover:bg-neon-green hover:text-white transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_25px_rgba(16,185,129,0.3)]"
                      >
                        WIN
                      </button>
                      <button 
                        onClick={() => addTrade('breakeven')}
                        className="flex-1 py-4 rounded-2xl bg-neon-gold/10 border border-neon-gold/20 text-neon-gold font-black uppercase tracking-widest text-xs hover:bg-neon-gold hover:text-white transition-all shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:shadow-[0_0_25px_rgba(245,158,11,0.3)]"
                      >
                        B.E
                      </button>
                      <button 
                        onClick={() => addTrade('loss')}
                        className="flex-1 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase tracking-widest text-xs hover:bg-red-500 hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_25px_rgba(239,68,68,0.3)]"
                      >
                        LOSS
                      </button>
                    </div>
                  </div>
                </div>
                <p className="mt-6 text-[10px] text-text-muted italic text-center font-medium opacity-60 uppercase tracking-widest">Clicking any button above will log the trade for this day.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
