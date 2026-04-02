import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mic, MicOff, Image as ImageIcon, Trash2, FileDown, Plus, X, RotateCcw } from 'lucide-react';
import { toCanvas } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { savePdf } from '../services/fileService';
import { cn } from '../lib/utils';

interface JournalEntryProps {
  setupStatus: {
    label: string;
    sub: string;
    color: string;
  } | null;
  checkedItems: string[];
  onSuccess?: () => void;
}

export const JournalEntry: React.FC<JournalEntryProps> = ({ setupStatus, checkedItems, onSuccess }) => {
  const [pair, setPair] = useState('');
  const [winRate, setWinRate] = useState('');
  const [riskPercent, setRiskPercent] = useState('');
  const [riskAmount, setRiskAmount] = useState('');
  const [reason, setReason] = useState('');
  const [psychology, setPsychology] = useState('');
  const [confluence, setConfluence] = useState('');
  const [images, setImages] = useState<string[]>([]);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('zzia_journal_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        const now = new Date().getTime();
        const oneDay = 24 * 60 * 60 * 1000;
        
        if (now - draft.updatedAt < oneDay) {
          if (draft.pair) setPair(draft.pair);
          if (draft.winRate) setWinRate(draft.winRate);
          if (draft.riskPercent) setRiskPercent(draft.riskPercent);
          if (draft.riskAmount) setRiskAmount(draft.riskAmount);
          if (draft.reason) setReason(draft.reason);
          if (draft.psychology) setPsychology(draft.psychology);
          if (draft.confluence) setConfluence(draft.confluence);
          if (draft.images) setImages(draft.images);
        } else {
          localStorage.removeItem('zzia_journal_draft');
        }
      } catch (e) {
        console.error('Failed to load journal draft', e);
      }
    }
  }, []);

  // Save draft on changes
  useEffect(() => {
    const draft = {
      pair,
      winRate,
      riskPercent,
      riskAmount,
      reason,
      psychology,
      confluence,
      images,
      updatedAt: new Date().getTime()
    };
    
    // Only save if there's actually something to save
    if (pair || winRate || riskPercent || riskAmount || reason || psychology || confluence || images.length > 0) {
      localStorage.setItem('zzia_journal_draft', JSON.stringify(draft));
    }
  }, [pair, winRate, riskPercent, riskAmount, reason, psychology, confluence, images]);
  const [isRecording, setIsRecording] = useState<'reason' | 'psychology' | 'confluence' | null>(null);
  const recognitionRef = useRef<any>(null);
  
  const pdfRef = useRef<HTMLDivElement>(null);

  // Handle Pair Input (Uppercase)
  const handlePairChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPair(e.target.value.toUpperCase());
  };

  // Voice Input Logic
  const toggleRecording = (field: 'reason' | 'psychology' | 'confluence') => {
    if (isRecording === field) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => setIsRecording(field);
    recognition.onend = () => {
      setIsRecording(null);
      recognitionRef.current = null;
    };
    recognition.onerror = (event: any) => {
      // Handle no-speech silently to avoid annoying alerts
      if (event.error === 'no-speech') {
        setIsRecording(null);
        recognitionRef.current = null;
        return;
      }

      console.error('Speech recognition error:', event.error);
      setIsRecording(null);
      recognitionRef.current = null;
      if (event.error === 'not-allowed') {
        alert('Microphone access was denied. Please check your browser permissions.');
      }
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (field === 'reason') setReason(prev => (prev ? prev + ' ' : '') + transcript);
      if (field === 'psychology') setPsychology(prev => (prev ? prev + ' ' : '') + transcript);
      if (field === 'confluence') setConfluence(prev => (prev ? prev + ' ' : '') + transcript);
    };

    recognition.start();
  };

  // Handle Paste (Ctrl+V and requested Ctrl+B)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'b')) {
        // We handle Ctrl+V via the onPaste prop on the div, 
        // but for Ctrl+B we might need a manual trigger or just rely on the same logic.
        // Actually, Ctrl+B is unusual for paste, so we'll just handle it here if needed.
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setImages(prev => [...prev, event.target!.result as string]);
            }
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  // Manual Ctrl+B listener for image paste (as requested)
  useEffect(() => {
    const handleGlobalPaste = async (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        try {
          const clipboardItems = await navigator.clipboard.read();
          for (const item of clipboardItems) {
            for (const type of item.types) {
              if (type.startsWith('image/')) {
                const blob = (await item.getType(type)) as Blob;
                const reader = new FileReader();
                reader.onload = (event) => {
                  if (event.target?.result) {
                    setImages(prev => [...prev, event.target!.result as string]);
                  }
                };
                reader.readAsDataURL(blob);
              }
            }
          }
        } catch (err) {
          console.error('Failed to read clipboard:', err);
          alert('Please use Ctrl+V to paste images, or allow clipboard permissions.');
        }
      }
    };
    window.addEventListener('keydown', handleGlobalPaste);
    return () => window.removeEventListener('keydown', handleGlobalPaste);
  }, []);

  // Manual Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: any) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setImages(prev => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // PDF Export Logic
  const exportToPDF = async () => {
    if (!pdfRef.current) return;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - (margin * 2);
    let yOffset = 0;

    const addSectionToPdf = async (element: HTMLElement, isFirst: boolean) => {
      if (!element) return;
      const canvas = await toCanvas(element, {
        width: 800,
        style: { transform: 'scale(1)', left: '0', top: '0' }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const displayWidth = isFirst ? pageWidth : contentWidth;
      const displayHeight = (imgProps.height * displayWidth) / imgProps.width;
      const xPos = isFirst ? 0 : margin;

      // If the section fits on the current page
      if (yOffset + displayHeight <= pageHeight - (isFirst ? 0 : margin)) {
        pdf.addImage(imgData, 'PNG', xPos, yOffset, displayWidth, displayHeight);
        yOffset += displayHeight + (isFirst ? 10 : 5);
      } else {
        // If the section is taller than the remaining space, but could fit on a new page
        if (displayHeight <= pageHeight - (margin * 2)) {
          pdf.addPage();
          yOffset = margin;
          pdf.addImage(imgData, 'PNG', margin, yOffset, displayWidth, displayHeight);
          yOffset += displayHeight + 5;
        } else {
          // If the section is taller than a whole page, we need to slice it
          let remainingHeight = displayHeight;
          let currentSourceY = 0;
          
          while (remainingHeight > 0) {
            const spaceLeft = pageHeight - yOffset - margin;
            const sliceHeight = Math.min(remainingHeight, spaceLeft);
            
            // Calculate the source height in the original canvas
            const sourceSliceHeight = (sliceHeight * imgProps.height) / displayHeight;
            
            // Create a temporary canvas for the slice
            const sliceCanvas = document.createElement('canvas');
            sliceCanvas.width = canvas.width;
            sliceCanvas.height = sourceSliceHeight;
            const ctx = sliceCanvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(canvas, 0, currentSourceY, canvas.width, sourceSliceHeight, 0, 0, canvas.width, sourceSliceHeight);
              const sliceData = sliceCanvas.toDataURL('image/png');
              pdf.addImage(sliceData, 'PNG', margin, yOffset, displayWidth, sliceHeight);
            }

            remainingHeight -= sliceHeight;
            currentSourceY += sourceSliceHeight;

            if (remainingHeight > 0) {
              pdf.addPage();
              yOffset = margin;
            } else {
              yOffset += sliceHeight + 5;
            }
          }
        }
      }
    };

    // Get all sections from the hidden template
    const sections = pdfRef.current.querySelectorAll('.pdf-section');
    
    for (let i = 0; i < sections.length; i++) {
      await addSectionToPdf(sections[i] as HTMLElement, i === 0);
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.getHours().toString().padStart(2, '0') + '-' + now.getMinutes().toString().padStart(2, '0');
    const fileName = `Journal_${dateStr}_${timeStr}.pdf`;
    const blob = pdf.output('blob');
    await savePdf(blob, fileName, 'journal');
    
    // Clear draft after successful export
    localStorage.removeItem('zzia_journal_draft');
    if (onSuccess) onSuccess();
  };

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const resetJournal = () => {
    if (!showResetConfirm) {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 3000); // Reset after 3s
      return;
    }
    
    setPair('');
    setWinRate('');
    setRiskPercent('');
    setRiskAmount('');
    setReason('');
    setPsychology('');
    setConfluence('');
    setImages([]);
    setShowResetConfirm(false);
    localStorage.removeItem('zzia_journal_draft');
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-4" onPaste={handlePaste}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-text-main uppercase">TRADE <span className="text-neon-blue drop-shadow-[0_0_8px_rgba(14,165,233,0.5)] tracking-widest">JOURNALING</span></h1>
          <p className="text-text-muted text-sm font-medium tracking-wide">Document your process • Learn from every trade</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={resetJournal}
            className={cn(
              "flex items-center gap-2 px-4 py-2 font-black text-xs rounded-lg transition-all border",
              showResetConfirm 
                ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
                : "bg-brand-surface/50 text-text-muted border-brand-border hover:bg-brand-surface hover:border-brand-border/80"
            )}
          >
            {showResetConfirm ? <X size={16} /> : <RotateCcw size={16} />}
            {showResetConfirm ? 'CONFIRM RESET?' : 'RESET'}
          </button>
          <button 
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-neon-blue text-white font-black text-xs rounded-lg hover:bg-neon-blue/90 transition-all shadow-lg shadow-neon-blue/20 hover:shadow-neon-blue/40 hover:scale-[1.02]"
          >
            <FileDown size={16} />
            EXPORT PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pair Input */}
        <div className="glass-card p-6 border-brand-border/50">
          <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 opacity-70">Trading Pair</label>
          <input 
            type="text"
            value={pair}
            onChange={handlePairChange}
            placeholder="e.g. XAUUSD"
            className="w-full bg-brand-surface/50 border border-brand-border rounded-xl px-4 py-3 text-lg font-black tracking-tight focus:outline-none focus:border-neon-blue/50 focus:shadow-[0_0_10px_rgba(14,165,233,0.1)] transition-all text-text-main placeholder:text-text-muted/20"
          />
        </div>

        {/* Win Rate */}
        <div className="glass-card p-6 border-brand-border/50">
          <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 opacity-70">Win Rate (%)</label>
          <input 
            type="text"
            value={winRate}
            onChange={(e) => setWinRate(e.target.value)}
            placeholder="e.g. 75%"
            className="w-full bg-brand-surface/50 border border-brand-border rounded-xl px-4 py-3 text-lg font-black tracking-tight focus:outline-none focus:border-neon-blue/50 focus:shadow-[0_0_10px_rgba(14,165,233,0.1)] transition-all text-text-main placeholder:text-text-muted/20"
          />
        </div>

        {/* Risk Percent */}
        <div className="glass-card p-6 border-brand-border/50">
          <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 opacity-70">Risk (%)</label>
          <input 
            type="text"
            value={riskPercent}
            onChange={(e) => setRiskPercent(e.target.value)}
            placeholder="e.g. 1%"
            className="w-full bg-brand-surface/50 border border-brand-border rounded-xl px-4 py-3 text-lg font-black tracking-tight focus:outline-none focus:border-neon-blue/50 focus:shadow-[0_0_10px_rgba(14,165,233,0.1)] transition-all text-text-main placeholder:text-text-muted/20"
          />
        </div>

        {/* Risk Amount */}
        <div className="glass-card p-6 border-brand-border/50">
          <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 opacity-70">Risk Amount</label>
          <input 
            type="text"
            value={riskAmount}
            onChange={(e) => setRiskAmount(e.target.value)}
            placeholder="e.g. $100"
            className="w-full bg-brand-surface/50 border border-brand-border rounded-xl px-4 py-3 text-lg font-black tracking-tight focus:outline-none focus:border-neon-blue/50 focus:shadow-[0_0_10px_rgba(14,165,233,0.1)] transition-all text-text-main placeholder:text-text-muted/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Reason */}
        <div className="glass-card p-6 border-brand-border/50">
          <div className="flex items-center justify-between mb-3">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-70">Reason</label>
            <button 
              onClick={() => toggleRecording('reason')}
              className={cn(
                "p-2 rounded-lg transition-all border",
                isRecording === 'reason' ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.2)]" : "bg-brand-surface/50 text-text-muted border-brand-border hover:text-neon-blue hover:border-neon-blue/30"
              )}
            >
              {isRecording === 'reason' ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          </div>
          <textarea 
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="What is your reason for this trade?"
            className="w-full bg-brand-surface/50 border border-brand-border rounded-xl px-4 py-3 text-sm min-h-[100px] focus:outline-none focus:border-neon-blue/50 focus:shadow-[0_0_10px_rgba(14,165,233,0.1)] transition-all resize-none text-text-main placeholder:text-text-muted/20"
          />
        </div>

        {/* Psychology */}
        <div className="glass-card p-6 border-brand-border/50">
          <div className="flex items-center justify-between mb-3">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-70">Psychology</label>
            <button 
              onClick={() => toggleRecording('psychology')}
              className={cn(
                "p-2 rounded-lg transition-all border",
                isRecording === 'psychology' ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.2)]" : "bg-brand-surface/50 text-text-muted border-brand-border hover:text-neon-blue hover:border-neon-blue/30"
              )}
            >
              {isRecording === 'psychology' ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          </div>
          <textarea 
            value={psychology}
            onChange={(e) => setPsychology(e.target.value)}
            placeholder="How are you feeling right now?"
            className="w-full bg-brand-surface/50 border border-brand-border rounded-xl px-4 py-3 text-sm min-h-[100px] focus:outline-none focus:border-neon-blue/50 focus:shadow-[0_0_10px_rgba(14,165,233,0.1)] transition-all resize-none text-text-main placeholder:text-text-muted/20"
          />
        </div>

        {/* Confluence */}
        <div className="glass-card p-6 border-brand-border/50">
          <div className="flex items-center justify-between mb-3">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-70">Confluence</label>
            <button 
              onClick={() => toggleRecording('confluence')}
              className={cn(
                "p-2 rounded-lg transition-all border",
                isRecording === 'confluence' ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.2)]" : "bg-brand-surface/50 text-text-muted border-brand-border hover:text-neon-blue hover:border-neon-blue/30"
              )}
            >
              {isRecording === 'confluence' ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          </div>
          <textarea 
            value={confluence}
            onChange={(e) => setConfluence(e.target.value)}
            placeholder="Any external factors influencing this decision?"
            className="w-full bg-brand-surface/50 border border-brand-border rounded-xl px-4 py-3 text-sm min-h-[100px] focus:outline-none focus:border-neon-blue/50 focus:shadow-[0_0_10px_rgba(14,165,233,0.1)] transition-all resize-none text-text-main placeholder:text-text-muted/20"
          />
        </div>

        {/* Checklist */}
        <div className="glass-card p-6 border-brand-border/50">
          <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4 opacity-70">Checklist</label>
          {checkedItems.length === 0 ? (
            <p className="text-text-muted/40 text-xs italic font-medium">No items checked in the checklist.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {checkedItems.map((item, idx) => (
                <div key={idx} className="px-3 py-1.5 bg-neon-blue/10 border border-neon-blue/30 rounded-lg text-[10px] font-black text-neon-blue uppercase tracking-widest shadow-[0_0_10px_rgba(14,165,233,0.05)]">
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Images */}
        <div className="glass-card p-6 border-brand-border/50">
          <div className="flex items-center justify-between mb-4">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-70">Screenshots</label>
            <label className="flex items-center gap-2 px-3 py-1.5 bg-brand-surface/50 text-text-muted hover:text-neon-blue rounded-lg cursor-pointer transition-all text-[10px] font-black border border-brand-border hover:border-neon-blue/30">
              <Plus size={14} />
              ADD IMAGE
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
          
          {images.length === 0 ? (
            <div className="border-2 border-dashed border-brand-border/30 rounded-2xl p-12 flex flex-col items-center justify-center text-text-muted/20 hover:border-neon-green/30 transition-colors group">
              <ImageIcon size={48} className="mb-4 opacity-10 group-hover:opacity-20 transition-opacity" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Paste (Ctrl+V) or Upload images</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((img, idx) => (
                <div key={idx} className="relative group aspect-video rounded-xl overflow-hidden border border-brand-border/50 hover:border-neon-blue/50 transition-colors">
                  <img src={img} alt={`Trade screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hidden PDF Template */}
      <div className="fixed -left-[9999px] top-0">
        <div 
          ref={pdfRef}
          className="w-[800px] font-sans bg-white text-zinc-900 relative"
        >
          {/* Dark Header Bar */}
          <div className="pdf-section bg-[#1a1a1a] p-12 text-white">
            <h1 className="text-5xl font-black tracking-tight uppercase mb-4">
              Z-trade evaluation
            </h1>
            <div className="flex items-center gap-4 text-zinc-400 font-bold text-sm uppercase tracking-wider">
              <span>PAIR: {pair || 'N/A'}</span>
              <span>|</span>
              <span>WR: {winRate || '0%'}</span>
              <span>|</span>
              <span>RISK: {riskPercent || '0%'} ({riskAmount || '0'})</span>
              <span>|</span>
              <span>DATE: {new Date().toLocaleString()}</span>
            </div>
          </div>

          {/* Classification Section */}
          <div className="pdf-section p-12 bg-white">
            <div className="flex items-center gap-12 p-10 bg-zinc-50 rounded-lg border border-zinc-100">
              {setupStatus && (
                <div className={cn("text-9xl font-black leading-none", setupStatus.color)}>
                  {setupStatus.label.split(' ')[0]}
                </div>
              )}
              <div className="flex-1">
                <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-1">CLASSIFICATION</p>
                {/* Removed the requested line here */}
                <p className="text-xl font-bold text-zinc-800 uppercase">
                  RISK: {setupStatus?.sub.split('•')[0].replace('Risk', '').trim() || '0.0%'}
                </p>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="p-12 space-y-12">
            <section className="pdf-section bg-white">
              <h3 className="text-zinc-900 font-black text-xs uppercase tracking-[0.2em] mb-4 border-l-4 border-zinc-900 pl-4">Reason</h3>
              <p className="leading-relaxed whitespace-pre-wrap text-zinc-700 text-sm">
                {reason || 'No reason provided.'}
              </p>
            </section>
            
            <section className="pdf-section bg-white">
              <h3 className="text-zinc-900 font-black text-xs uppercase tracking-[0.2em] mb-4 border-l-4 border-zinc-900 pl-4">Psychology</h3>
              <p className="leading-relaxed whitespace-pre-wrap text-zinc-700 text-sm">
                {psychology || 'No psychology notes.'}
              </p>
            </section>
            
            <section className="pdf-section bg-white">
              <h3 className="text-zinc-900 font-black text-xs uppercase tracking-[0.2em] mb-4 border-l-4 border-zinc-900 pl-4">Confluence</h3>
              <p className="leading-relaxed whitespace-pre-wrap text-zinc-700 text-sm">
                {confluence || 'No confluence noted.'}
              </p>
            </section>
            
            <section className="pdf-section bg-white">
              <h3 className="text-zinc-900 font-black text-xs uppercase tracking-[0.2em] mb-4 border-l-4 border-zinc-900 pl-4">Checklist</h3>
              <div className="flex flex-wrap gap-2">
                {checkedItems.length === 0 ? (
                  <p className="text-zinc-500 text-xs italic">No items checked.</p>
                ) : (
                  checkedItems.map((item, idx) => (
                    <div key={idx} className="px-3 py-1 bg-zinc-100 border border-zinc-200 rounded text-[9px] font-black text-zinc-800 uppercase tracking-wider">
                      {item}
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Images Section */}
            {images.length > 0 && (
              <section className="bg-white pt-8">
                <h3 className="pdf-section text-zinc-900 font-black text-xs uppercase tracking-[0.2em] mb-8 border-l-4 border-zinc-900 pl-4 bg-white">Visual Evidence</h3>
                <div className="grid grid-cols-1 gap-12">
                  {images.map((img, idx) => (
                    <div key={idx} className="pdf-section rounded-2xl overflow-hidden border border-zinc-100 bg-white shadow-sm">
                      <img src={img} alt="Trade capture" className="w-full" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Footer */}
          <div className="pdf-section p-12 pt-0 flex justify-between items-center text-zinc-400 text-[10px] font-black uppercase tracking-widest bg-white">
            <div className="w-full pt-8 border-t border-zinc-100 flex justify-between">
              <span>Generated on {new Date().toLocaleString()}</span>
              <span>Professional Trading Journal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
