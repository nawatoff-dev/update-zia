import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Image as ImageIcon, Trash2, FileDown, Plus, X, RotateCcw, TrendingUp, TrendingDown, AlertTriangle, Clock, BarChart3, Target, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toCanvas } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { savePdf } from '../services/fileService';
import { cn, AnalysisReport as AnalysisReportType } from '../types';

interface AnalysisReportProps {
  reports: AnalysisReportType[];
  onAddReport: (report: AnalysisReportType) => void;
  onUpdateReport: (report: AnalysisReportType) => void;
  onDeleteReport: (id: string) => void;
  onResetReports: () => void;
}

export const AnalysisReport: React.FC<AnalysisReportProps> = ({ 
  reports, 
  onAddReport, 
  onUpdateReport,
  onDeleteReport, 
  onResetReports 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pair, setPair] = useState('');
  const [bias, setBias] = useState<'bullish' | 'bearish' | null>(null);
  const [quality, setQuality] = useState<'good' | 'risky' | null>(null);
  const [text, setText] = useState('');
  const [images, setImages] = useState<string[]>([]);

  // Persistence Logic
  useEffect(() => {
    const savedDraft = localStorage.getItem('zzia_analysis_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        const now = new Date().getTime();
        const oneDay = 24 * 60 * 60 * 1000;
        
        if (now - draft.updatedAt < oneDay) {
          if (draft.pair) setPair(draft.pair);
          if (draft.bias) setBias(draft.bias);
          if (draft.quality) setQuality(draft.quality);
          if (draft.text) setText(draft.text);
          if (draft.images) setImages(draft.images);
          if (draft.isAdding) setIsAdding(true);
          if (draft.editingId) setEditingId(draft.editingId);
        } else {
          localStorage.removeItem('zzia_analysis_draft');
        }
      } catch (e) {
        console.error('Failed to load analysis draft', e);
      }
    }
  }, []);

  useEffect(() => {
    const draft = {
      pair,
      bias,
      quality,
      text,
      images,
      isAdding,
      editingId,
      updatedAt: new Date().getTime()
    };
    
    if (isAdding || pair || bias || quality || text || images.length > 0) {
      localStorage.setItem('zzia_analysis_draft', JSON.stringify(draft));
    } else {
      localStorage.removeItem('zzia_analysis_draft');
    }
  }, [pair, bias, quality, text, images, isAdding, editingId]);
  const [isRecording, setIsRecording] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const recognitionRef = useRef<any>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  const zoomContainerRef = useRef<HTMLDivElement>(null);

  // Zoom logic
  const handleWheel = (e: React.WheelEvent) => {
    if (!zoomedImage) return;
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(0.5, scale + delta), 5);
    setScale(newScale);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setZoomedImage(null);
  };

  // Voice Input Logic
  const toggleRecording = () => {
    if (isRecording) {
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

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };
    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') {
        setIsRecording(false);
        recognitionRef.current = null;
        return;
      }
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      recognitionRef.current = null;
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setText(prev => (prev ? prev + ' ' : '') + transcript);
    };

    recognition.start();
  };

  // Handle Paste (Ctrl+V and requested Ctrl+A)
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        if (isAdding) {
          e.preventDefault();
        }
        
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
          // Fallback to standard paste event
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdding]);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddReport = () => {
    if (!pair.trim()) {
      alert('Please enter a trading pair.');
      return;
    }
    
    if (editingId) {
      // Update existing report
      const existingReport = reports.find(r => r.id === editingId);
      if (existingReport) {
        onUpdateReport({
          ...existingReport,
          pair: pair.toUpperCase(),
          bias,
          quality,
          text,
          images,
        });
      }
    } else {
      onAddReport({
        id: Math.random().toString(36).substr(2, 9),
        pair: pair.toUpperCase(),
        bias,
        quality,
        text,
        images,
        createdAt: new Date().toISOString()
      });
    }

    setPair('');
    setBias(null);
    setQuality(null);
    setText('');
    setImages([]);
    setIsAdding(false);
    setEditingId(null);
    localStorage.removeItem('zzia_analysis_draft');
  };

  const resetForm = () => {
    setPair('');
    setBias(null);
    setQuality(null);
    setText('');
    setImages([]);
    setEditingId(null);
    localStorage.removeItem('zzia_analysis_draft');
  };

  const startEditing = (report: AnalysisReportType) => {
    setEditingId(report.id);
    setPair(report.pair);
    setBias(report.bias);
    setQuality(report.quality);
    setText(report.text);
    setImages(report.images);
    setIsAdding(true);
  };

  const [reportsToExport, setReportsToExport] = useState<AnalysisReportType[]>([]);
  
  const generatePDF = async (toExport: AnalysisReportType[]) => {
    if (toExport.length === 0) return;
    setReportsToExport(toExport);
    setIsExporting(true);

    // Wait for state update and re-render
    setTimeout(async () => {
      try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const contentWidth = pageWidth - (margin * 2);
        let yOffset = 0;

        const addSectionToPdf = async (element: HTMLElement) => {
          if (!element) return;
          const canvas = await toCanvas(element, {
            width: 1200, // Higher resolution
            style: { transform: 'scale(1)', left: '0', top: '0' }
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgProps = pdf.getImageProperties(imgData);
          const displayWidth = pageWidth - (margin * 2);
          const displayHeight = (imgProps.height * displayWidth) / imgProps.width;
          const xPos = margin;

          if (yOffset + displayHeight > pageHeight - margin) {
            pdf.addPage();
            yOffset = margin;
          }

          pdf.addImage(imgData, 'PNG', xPos, yOffset, displayWidth, displayHeight);
          yOffset += displayHeight + 2;
        };

        const pdfContainer = document.getElementById('analysis-pdf-template');
        if (!pdfContainer) throw new Error('PDF Template not found');

        const sections = pdfContainer.querySelectorAll('.pdf-section');
        
        for (let i = 0; i < sections.length; i++) {
          await addSectionToPdf(sections[i] as HTMLElement);
        }

        const dateStr = new Date().toISOString().split('T')[0];
        const fileName = `Analysis_Report_${dateStr}.pdf`;
        
        const blob = pdf.output('blob');
        await savePdf(blob, fileName, 'analysis');
      } catch (err) {
        console.error('PDF Export Error:', err);
        alert('Failed to export PDF. Please try again.');
      } finally {
        setIsExporting(false);
        setReportsToExport([]);
      }
    }, 100);
  };

  const getTimeRemaining = (createdAt: string) => {
    const now = new Date().getTime();
    const created = new Date(createdAt).getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    const remaining = oneDay - (now - created);
    
    if (remaining <= 0) return 'Expired';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m left`;
  };

  const getStatusLabel = (s: 'bullish' | 'bearish' | 'good' | 'risky') => {
    switch(s) {
      case 'bullish': return 'BULLISH';
      case 'bearish': return 'BEARISH';
      case 'good': return 'GOOD';
      case 'risky': return 'RISKY';
      default: return '';
    }
  };

  const getStatusColor = (s: 'bullish' | 'bearish' | 'good' | 'risky') => {
    switch(s) {
      case 'bullish': return 'text-emerald-400';
      case 'bearish': return 'text-red-400';
      case 'good': return 'text-blue-400';
      case 'risky': return 'text-amber-400';
      default: return 'text-text-muted';
    }
  };

  const getStatusBg = (s: 'bullish' | 'bearish' | 'good' | 'risky') => {
    switch(s) {
      case 'bullish': return 'bg-emerald-500/10';
      case 'bearish': return 'bg-red-500/10';
      case 'good': return 'bg-blue-500/10';
      case 'risky': return 'bg-amber-500/10';
      default: return 'bg-brand-surface/50';
    }
  };

  const getStatusIcon = (s: 'bullish' | 'bearish' | 'good' | 'risky') => {
    switch(s) {
      case 'bullish': return <TrendingUp size={24} />;
      case 'bearish': return <TrendingDown size={24} />;
      case 'good': return <Target size={24} />;
      case 'risky': return <AlertTriangle size={24} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-4 px-4" onPaste={handlePaste}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight uppercase text-text-main">Analysis <span className="text-brand-primary">Reports</span></h1>
          <p className="text-text-muted text-sm">Document your chart analysis • Resets every 24h</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to delete ALL saved analysis reports? This cannot be undone.')) {
                onResetReports();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-brand-surface/50 text-text-muted border border-brand-border rounded-lg hover:bg-brand-surface transition-all font-black text-xs"
          >
            <RotateCcw size={16} />
            RESET ALL
          </button>
          <button 
            onClick={() => generatePDF(reports)}
            disabled={reports.length === 0 || isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-brand-surface/50 text-text-muted border border-brand-border rounded-lg hover:bg-brand-surface transition-all font-black text-xs disabled:opacity-50"
          >
            <FileDown size={16} />
            {isExporting ? 'EXPORTING...' : 'EXPORT ALL PDF'}
          </button>
          <button 
            onClick={() => { resetForm(); setIsAdding(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-neon-blue text-white font-black text-xs rounded-lg hover:bg-neon-blue/90 transition-colors shadow-lg shadow-neon-blue/20"
          >
            <Plus size={16} />
            ADD ANALYSIS REPORT
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="glass-card p-8 mb-12 neon-border-green"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black uppercase tracking-tight text-text-main">{editingId ? 'Edit Analysis Report' : 'New Analysis Report'}</h2>
              <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-text-muted hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Trading Pair</label>
                <input 
                  type="text"
                  value={pair}
                  onChange={(e) => setPair(e.target.value.toUpperCase())}
                  placeholder="e.g. EURUSD"
                  className="w-full bg-brand-surface/50 border border-brand-border rounded-xl px-4 py-3 text-lg font-black tracking-tight focus:outline-none focus:border-brand-primary/50 transition-all text-text-main"
                />
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Market Bias</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setBias(bias === 'bullish' ? null : 'bullish')}
                      className={cn(
                        "flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] transition-all border",
                        bias === 'bullish' ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20" : "bg-brand-surface/50 text-text-muted border-brand-border hover:bg-brand-surface"
                      )}
                    >
                      <TrendingUp size={14} />
                      BULLISH
                    </button>
                    <button 
                      onClick={() => setBias(bias === 'bearish' ? null : 'bearish')}
                      className={cn(
                        "flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] transition-all border",
                        bias === 'bearish' ? "bg-red-500 text-white border-red-400 shadow-lg shadow-red-500/20" : "bg-brand-surface/50 text-text-muted border-brand-border hover:bg-brand-surface"
                      )}
                    >
                      <TrendingDown size={14} />
                      BEARISH
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Market Quality</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setQuality(quality === 'good' ? null : 'good')}
                      className={cn(
                        "flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] transition-all border",
                        quality === 'good' ? "bg-blue-500 text-white border-blue-400 shadow-lg shadow-blue-500/20" : "bg-brand-surface/50 text-text-muted border-brand-border hover:bg-brand-surface"
                      )}
                    >
                      <Target size={14} />
                      GOOD
                    </button>
                    <button 
                      onClick={() => setQuality(quality === 'risky' ? null : 'risky')}
                      className={cn(
                        "flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] transition-all border",
                        quality === 'risky' ? "bg-amber-500 text-white border-amber-400 shadow-lg shadow-amber-500/20" : "bg-brand-surface/50 text-text-muted border-brand-border hover:bg-brand-surface"
                      )}
                    >
                      <AlertTriangle size={14} />
                      RISKY
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Analysis Notes</label>
                <button 
                  onClick={toggleRecording}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    isRecording ? "bg-red-500 text-white animate-pulse" : "bg-brand-surface/50 text-text-muted hover:text-text-main"
                  )}
                >
                  {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
              </div>
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Describe your analysis..."
                className="w-full bg-brand-surface/50 border border-brand-border rounded-xl px-4 py-3 text-sm min-h-[120px] focus:outline-none focus:border-brand-primary/50 transition-all resize-none text-text-main"
              />
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Screenshots ({(images || []).length})</label>
                <label className="flex items-center gap-2 px-3 py-1.5 bg-brand-surface/50 text-text-muted hover:text-text-main rounded-lg cursor-pointer transition-all text-xs font-bold border border-brand-border">
                  <Plus size={14} />
                  UPLOAD IMAGE
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
              
              {(!images || images.length === 0) ? (
                <div className="border-2 border-dashed border-brand-border rounded-2xl p-12 flex flex-col items-center justify-center text-text-muted/30">
                  <ImageIcon size={48} className="mb-4 opacity-20" />
                  <p className="text-xs font-bold uppercase tracking-widest">Paste (Ctrl+V / Ctrl+A) or Upload images</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-brand-border bg-black/20">
                      <img src={img} alt={`Analysis screenshot ${idx + 1}`} className="w-full h-auto max-h-[500px] object-contain" />
                      <button 
                        onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={resetForm}
                className="flex-[1] py-4 bg-brand-surface/50 text-text-muted border border-brand-border font-black text-sm rounded-xl hover:bg-brand-surface transition-all uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <RotateCcw size={16} />
                Reset Form
              </button>
              <button 
                onClick={handleAddReport}
                className="flex-[2] py-4 bg-neon-blue text-white font-black text-sm rounded-xl hover:bg-neon-blue/90 transition-all shadow-xl shadow-neon-blue/20 uppercase tracking-widest"
              >
                {editingId ? 'Update Analysis Report' : 'Save Analysis Report'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6">
        {reports.length === 0 ? (
          <div className="text-center py-20 bg-brand-surface/30 rounded-3xl border border-dashed border-brand-border">
            <BarChart3 size={48} className="mx-auto mb-4 text-text-muted/20" />
            <h3 className="text-lg font-black text-text-main uppercase">No active reports</h3>
            <p className="text-text-muted/60 text-sm">Add your first analysis to see it here.</p>
          </div>
        ) : (
          reports.map((report) => (
            <motion.div 
              key={report.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card overflow-hidden"
            >
              <div className="p-6 border-b border-brand-border flex items-center justify-between bg-brand-surface/30">
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    {report.bias && (
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center neon-indicator-gold",
                        getStatusColor(report.bias)
                      )}>
                        {getStatusIcon(report.bias)}
                      </div>
                    )}
                    {report.quality && (
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center neon-indicator-gold",
                        getStatusColor(report.quality)
                      )}>
                        {getStatusIcon(report.quality)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-text-main uppercase">{report.pair}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                      <Clock size={12} />
                      {getTimeRemaining(report.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => startEditing(report)}
                    className="p-2 bg-brand-surface/50 text-text-muted hover:text-neon-blue border border-brand-border rounded-lg transition-all"
                    title="Edit Report"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => generatePDF([report])}
                    className="p-2 bg-brand-surface/50 text-text-muted hover:text-neon-blue border border-brand-border rounded-lg transition-all"
                    title="Export to PDF"
                  >
                    <FileDown size={18} />
                  </button>
                  <button 
                    onClick={() => onDeleteReport(report.id)}
                    className="p-2 bg-brand-surface/50 text-text-muted hover:text-red-400 border border-brand-border rounded-lg transition-all"
                    title="Delete Report"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <div className="flex gap-2 mb-4">
                    {report.bias && (
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        getStatusBg(report.bias),
                        getStatusColor(report.bias)
                      )}>
                        {getStatusLabel(report.bias)}
                      </span>
                    )}
                    {report.quality && (
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        getStatusBg(report.quality),
                        getStatusColor(report.quality)
                      )}>
                        {getStatusLabel(report.quality)}
                      </span>
                    )}
                  </div>
                  <p className="text-text-muted text-sm leading-relaxed whitespace-pre-wrap italic">
                    "{report.text || 'No analysis text provided.'}"
                  </p>
                </div>
                
                {report.images && report.images.length > 0 && (
                  <div className="flex flex-col gap-4">
                    {report.images.map((img, idx) => (
                      <div 
                        key={idx} 
                        className="rounded-xl overflow-hidden border border-brand-border bg-black/20 cursor-zoom-in group relative"
                        onClick={() => setZoomedImage(img)}
                      >
                        <img src={img} alt={`Analysis ${idx + 1}`} className="w-full h-auto max-h-[600px] object-contain transition-transform duration-300 group-hover:scale-[1.02]" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <Plus className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-12 cursor-default"
            onClick={resetZoom}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full h-full flex items-center justify-center overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={resetZoom}
                className="absolute top-4 right-4 z-[110] p-3 bg-brand-surface/50 text-white rounded-full hover:bg-brand-surface transition-all border border-brand-border"
              >
                <X size={24} />
              </button>

              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[110] px-6 py-3 bg-brand-surface/80 backdrop-blur-md border border-brand-border rounded-2xl flex items-center gap-6 text-text-muted">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest">Zoom:</span>
                  <span className="text-sm font-black text-brand-primary">{Math.round(scale * 100)}%</span>
                </div>
                <div className="w-px h-4 bg-brand-border" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Scroll to zoom • Drag to pan</p>
                <button 
                  onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); }}
                  className="px-3 py-1 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-text-inverse transition-all"
                >
                  Reset
                </button>
              </div>

              <div 
                ref={zoomContainerRef}
                className="w-full h-full flex items-center justify-center touch-none"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <motion.img
                  src={zoomedImage}
                  alt="Zoomed analysis"
                  className="max-w-full max-h-full object-contain pointer-events-none select-none"
                  style={{
                    scale,
                    x: position.x,
                    y: position.y,
                    cursor: scale > 1 ? 'grab' : 'default'
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden PDF Template */}
      <div className="fixed -left-[9999px] top-0">
        <div 
          id="analysis-pdf-template"
          className="w-[800px] font-sans bg-white text-zinc-900 relative"
        >
          {/* Header */}
          <div className="pdf-section bg-[#1a1a1a] p-10 text-white mb-4 rounded-xl">
            <h1 className="text-4xl font-black tracking-tight uppercase mb-2">
              Analysis Report Summary
            </h1>
            <div className="flex items-center gap-4 text-zinc-400 font-bold text-xs uppercase tracking-wider">
              <span>TOTAL REPORTS: {(reportsToExport || []).length}</span>
              <span>|</span>
              <span>DATE: {new Date().toLocaleString()}</span>
            </div>
          </div>

          {/* Reports List */}
          {(reportsToExport || []).map((report, idx) => (
            <React.Fragment key={report.id}>
              {/* Report Header Section */}
              <div className="pdf-section p-8 bg-zinc-50 rounded-t-xl border-x border-t border-zinc-200 mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-zinc-900 uppercase">{report.pair}</h2>
                    <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">{new Date(report.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-4">
                    {report.bias && (
                      <div className={cn(
                        "px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest border shadow-sm",
                        report.bias === 'bullish' ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"
                      )}>
                        {getStatusLabel(report.bias)}
                      </div>
                    )}
                    {report.quality && (
                      <div className={cn(
                        "px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest border shadow-sm",
                        report.quality === 'good' ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-amber-50 text-amber-600 border-amber-200"
                      )}>
                        {getStatusLabel(report.quality)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Analysis Text Section */}
              <div className="pdf-section p-8 bg-white border-x border-zinc-200">
                <h3 className="text-zinc-400 font-black text-[9px] uppercase tracking-[0.2em] mb-2">Analysis Details</h3>
                <p className="text-zinc-800 text-sm leading-relaxed whitespace-pre-wrap italic">
                  {report.text || 'No analysis text provided.'}
                </p>
              </div>

              {/* Images Sections */}
              {report.images && report.images.length > 0 && report.images.map((img, i) => (
                <div key={i} className={cn(
                  "pdf-section p-8 bg-white border-x border-zinc-200",
                  i === report.images.length - 1 ? "rounded-b-xl border-b" : ""
                )}>
                  {i === 0 && <h3 className="text-zinc-400 font-black text-[9px] uppercase tracking-[0.2em] mb-4">Screenshots</h3>}
                  <div className="rounded-lg overflow-hidden border border-zinc-100">
                    <img src={img} alt={`Analysis ${i + 1}`} className="w-full h-auto block" />
                  </div>
                </div>
              ))}
              
              {(!report.images || report.images.length === 0) && (
                <div className="pdf-section h-4 bg-white border-x border-b border-zinc-200 rounded-b-xl" />
              )}
            </React.Fragment>
          ))}

          {/* Footer */}
          <div className="pdf-section p-8 mt-8 flex justify-between items-center text-zinc-400 text-[9px] font-black uppercase tracking-widest bg-white border-t border-zinc-100">
            <span>Generated on {new Date().toLocaleString()}</span>
            <span>Professional Analysis Report</span>
          </div>
        </div>
      </div>
    </div>
  );
};
