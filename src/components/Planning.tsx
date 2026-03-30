import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Plus, Trash2, CheckCircle2, Circle, LayoutList, CalendarDays, Pencil } from 'lucide-react';
import { DailyPlan, CalendarPlan, PlanTask } from '../types';
import { cn } from '../lib/utils';

interface PlanningProps {
  dailyPlans: DailyPlan[];
  setDailyPlans: React.Dispatch<React.SetStateAction<DailyPlan[]>>;
  calendarPlans: CalendarPlan[];
  setCalendarPlans: React.Dispatch<React.SetStateAction<CalendarPlan[]>>;
}

export const Planning: React.FC<PlanningProps> = ({ dailyPlans, setDailyPlans, calendarPlans, setCalendarPlans }) => {
  const [activeSubTab, setActiveSubTab] = useState<'daily' | 'calendar'>('calendar');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  
  const [newTask, setNewTask] = useState({ time: '08:00', activity: '' });
  const [newPlan, setNewPlan] = useState({ title: '', description: '', tasks: [] as PlanTask[] });
  const [newTaskLabel, setNewTaskLabel] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const currentDailyPlan = dailyPlans.find(p => p.date === today) || { id: Math.random().toString(36).substr(2, 9), date: today, tasks: [] };

  // Calendar logic
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const addTask = () => {
    const updatedPlan = {
      ...currentDailyPlan,
      tasks: [...currentDailyPlan.tasks, { id: Math.random().toString(36).substr(2, 9), time: newTask.time, activity: newTask.activity, completed: false }]
    };
    setDailyPlans(prev => {
      const filtered = prev.filter(p => p.date !== today);
      return [...filtered, updatedPlan];
    });
    setNewTask({ time: '08:00', activity: '' });
  };

  const toggleTask = (taskId: string) => {
    const updatedPlan = {
      ...currentDailyPlan,
      tasks: currentDailyPlan.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
    };
    setDailyPlans(prev => {
      const filtered = prev.filter(p => p.date !== today);
      return [...filtered, updatedPlan];
    });
  };

  const deleteTask = (taskId: string) => {
    const updatedPlan = {
      ...currentDailyPlan,
      tasks: currentDailyPlan.tasks.filter(t => t.id !== taskId)
    };
    setDailyPlans(prev => {
      const filtered = prev.filter(p => p.date !== today);
      return [...filtered, updatedPlan];
    });
  };

  const saveCalendarPlan = () => {
    if (editingPlanId) {
      setCalendarPlans(prev => prev.map(p => p.id === editingPlanId ? { ...p, ...newPlan } : p));
      setEditingPlanId(null);
    } else {
      const plan: CalendarPlan = {
        id: Math.random().toString(36).substr(2, 9),
        date: selectedDate,
        ...newPlan
      };
      setCalendarPlans(prev => [...prev, plan]);
    }
    setIsAddingPlan(false);
    setNewPlan({ title: '', description: '', tasks: [] });
  };

  const deleteCalendarPlan = (id: string) => {
    setCalendarPlans(prev => prev.filter(p => p.id !== id));
  };

  const startEditPlan = (plan: CalendarPlan) => {
    setNewPlan({ title: plan.title, description: plan.description, tasks: plan.tasks || [] });
    setEditingPlanId(plan.id);
    setIsAddingPlan(true);
  };

  const addSubTask = () => {
    if (!newTaskLabel) return;
    setNewPlan(prev => ({
      ...prev,
      tasks: [...prev.tasks, { id: Math.random().toString(36).substr(2, 9), label: newTaskLabel, completed: false }]
    }));
    setNewTaskLabel('');
  };

  const toggleSubTask = (taskId: string) => {
    setNewPlan(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
    }));
  };

  const deleteSubTask = (taskId: string) => {
    setNewPlan(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId)
    }));
  };

  const plansForSelectedDate = calendarPlans.filter(p => p.date === selectedDate);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Planning</h1>
          <p className="text-text-muted mt-1">Organize your trading days and long-term goals.</p>
        </div>
        <div className="flex p-1 bg-brand-surface/50 rounded-xl border border-brand-border">
          <button
            onClick={() => setActiveSubTab('daily')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all",
              activeSubTab === 'daily' ? "bg-brand-primary text-text-inverse" : "text-text-muted hover:text-text-main"
            )}
          >
            <LayoutList size={14} />
            DAILY PLAN
          </button>
          <button
            onClick={() => setActiveSubTab('calendar')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all",
              activeSubTab === 'calendar' ? "bg-brand-primary text-text-inverse" : "text-text-muted hover:text-text-main"
            )}
          >
            <CalendarDays size={14} />
            CALENDAR
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'daily' ? (
          <motion.div
            key="daily"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="glass-card p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black flex items-center gap-2">
                  <Calendar size={20} className="text-brand-primary" />
                  Today's Schedule
                </h2>
              </div>

              <div className="flex gap-2">
                <input
                  type="time"
                  value={newTask.time}
                  onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                  className="bg-brand-dark border border-brand-border p-3 rounded-xl font-bold focus:border-brand-primary outline-none transition-all"
                />
                <input
                  type="text"
                  placeholder="Activity..."
                  value={newTask.activity}
                  onChange={(e) => setNewTask({ ...newTask, activity: e.target.value })}
                  className="flex-1 bg-brand-dark border border-brand-border p-3 rounded-xl font-bold focus:border-brand-primary outline-none transition-all"
                />
                <button
                  onClick={addTask}
                  className="px-6 bg-brand-primary text-text-inverse font-black rounded-xl hover:scale-105 transition-all"
                >
                  ADD
                </button>
              </div>

              <div className="space-y-2">
                {currentDailyPlan.tasks.sort((a, b) => a.time.localeCompare(b.time)).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-brand-dark/50 border border-brand-border rounded-xl group hover:border-brand-primary/30 transition-all">
                    <div className="flex items-center gap-4">
                      <button onClick={() => toggleTask(task.id)} className="text-brand-primary">
                        {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} className="text-text-muted" />}
                      </button>
                      <div>
                        <div className="text-xs font-black text-text-muted uppercase tracking-widest">{task.time}</div>
                        <div className={cn("font-bold text-lg", task.completed && "line-through text-text-muted")}>{task.activity}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Calendar Grid */}
            <div className="glass-card p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black">
                  {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="p-2 hover:bg-brand-surface rounded-lg border border-brand-border"
                  >
                    <Plus size={16} className="rotate-180" />
                  </button>
                  <button 
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="p-2 hover:bg-brand-surface rounded-lg border border-brand-border"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-[10px] font-black text-text-muted uppercase tracking-widest py-2">
                    {day}
                  </div>
                ))}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                  const hasPlans = calendarPlans.some(p => p.date === dateStr);
                  const isSelected = selectedDate === dateStr;
                  const isToday = today === dateStr;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(dateStr)}
                      className={cn(
                        "aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all border relative group",
                        isSelected ? "bg-brand-primary border-brand-primary text-text-inverse shadow-lg scale-105 z-10" : 
                        isToday ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary" :
                        "bg-brand-surface border-brand-border text-text-muted hover:border-brand-primary/50 hover:text-text-main"
                      )}
                    >
                      <span className="text-sm font-black">{day}</span>
                      {hasPlans && (
                        <div className={cn(
                          "w-1 h-1 rounded-full",
                          isSelected ? "bg-text-inverse" : "bg-brand-primary"
                        )} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Plans for Selected Date */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black flex items-center gap-2">
                  <Calendar size={20} className="text-brand-primary" />
                  Plans for {new Date(selectedDate).toLocaleDateString()}
                </h2>
                <button
                  onClick={() => {
                    setEditingPlanId(null);
                    setNewPlan({ title: '', description: '', tasks: [] });
                    setIsAddingPlan(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-text-inverse font-black rounded-xl hover:scale-105 transition-all shadow-lg shadow-brand-primary/20"
                >
                  <Plus size={16} />
                  ADD PLAN
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {plansForSelectedDate.map((plan) => (
                  <div key={plan.id} className="glass-card p-6 space-y-4 group relative overflow-hidden">
                    <div className="flex items-center justify-between relative z-10">
                      <h3 className="text-xl font-black">{plan.title}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditPlan(plan)}
                          className="p-2 text-text-muted hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => deleteCalendarPlan(plan.id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-text-muted leading-relaxed relative z-10">{plan.description}</p>
                    
                    {plan.tasks && plan.tasks.length > 0 && (
                      <div className="space-y-2 pt-4 border-t border-brand-border relative z-10">
                        {plan.tasks.map(task => (
                          <div key={task.id} className="flex items-center gap-3">
                            <div className={cn(
                              "w-5 h-5 rounded flex items-center justify-center border",
                              task.completed ? "bg-brand-primary border-brand-primary text-text-inverse" : "border-brand-border"
                            )}>
                              {task.completed && <CheckCircle2 size={12} />}
                            </div>
                            <span className={cn("text-sm font-medium", task.completed && "line-through text-text-muted")}>
                              {task.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {plansForSelectedDate.length === 0 && (
                  <div className="glass-card p-12 text-center text-text-muted italic">
                    No plans for this date.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Plan Modal */}
      <AnimatePresence>
        {isAddingPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-brand-surface border border-brand-border p-8 rounded-3xl max-w-lg w-full shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]"
            >
              <h3 className="text-2xl font-black">{editingPlanId ? 'Edit Plan' : 'Add Plan'}</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-text-muted uppercase tracking-widest">Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Weekly Review"
                    value={newPlan.title}
                    onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                    className="w-full bg-brand-dark border border-brand-border p-4 rounded-xl font-bold focus:border-brand-primary outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-text-muted uppercase tracking-widest">Description</label>
                  <textarea
                    placeholder="Details about your plan..."
                    value={newPlan.description}
                    onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                    className="w-full bg-brand-dark border border-brand-border p-4 rounded-xl font-bold focus:border-brand-primary outline-none transition-all min-h-[100px]"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-text-muted uppercase tracking-widest">Checklist</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add sub-task..."
                      value={newTaskLabel}
                      onChange={(e) => setNewTaskLabel(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addSubTask()}
                      className="flex-1 bg-brand-dark border border-brand-border p-3 rounded-xl font-bold focus:border-brand-primary outline-none transition-all"
                    />
                    <button
                      onClick={addSubTask}
                      className="px-4 bg-brand-primary text-text-inverse font-black rounded-xl hover:scale-105 transition-all"
                    >
                      ADD
                    </button>
                  </div>
                  <div className="space-y-2">
                    {newPlan.tasks.map(task => (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-brand-dark/30 border border-brand-border rounded-xl">
                        <div className="flex items-center gap-3">
                          <button onClick={() => toggleSubTask(task.id)} className="text-brand-primary">
                            {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} className="text-text-muted" />}
                          </button>
                          <span className={cn("font-bold", task.completed && "line-through text-text-muted")}>{task.label}</span>
                        </div>
                        <button onClick={() => deleteSubTask(task.id)} className="text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setIsAddingPlan(false)} className="flex-1 py-4 font-black text-sm border border-brand-border rounded-xl hover:bg-white/5 transition-all">CANCEL</button>
                <button onClick={saveCalendarPlan} className="flex-1 py-4 font-black text-sm bg-brand-primary text-text-inverse rounded-xl hover:scale-105 transition-all shadow-lg shadow-brand-primary/20">SAVE PLAN</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
