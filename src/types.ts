import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface TradeEntry {
  id: string;
  date: string; // ISO string
  result: 'win' | 'loss' | 'breakeven';
  execution?: 'good' | 'bad';
  notes?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface ChecklistSection {
  id: string;
  title: string;
  risk?: string;
  items: ChecklistItem[];
  type?: 'A+' | 'A' | 'B' | 'C' | 'Core';
}

export interface AnalysisReport {
  id: string;
  pair: string;
  images: string[];
  bias: 'bullish' | 'bearish' | null;
  quality: 'good' | 'risky' | null;
  text: string;
  createdAt: string; // ISO string
}

export interface Alarm {
  id: string;
  time: string; // HH:mm
  label: string;
  enabled: boolean;
  sound: string;
}

export interface DailyPlan {
  id: string;
  date: string; // YYYY-MM-DD
  tasks: { id: string; time: string; activity: string; completed: boolean }[];
}

export interface PlanTask {
  id: string;
  label: string;
  completed: boolean;
}

export interface CalendarPlan {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  tasks: PlanTask[];
}

export interface AccountHistoryEntry {
  date: string; // ISO string
  balance: number;
  profit: number;
}

export interface Account {
  id: string;
  type: 'live' | 'funded';
  name: string;
  initialBalance: number;
  balance: number;
  currency: string;
  // Funded specific
  phase?: number;
  profitLimit?: number;
  lossLimit?: number; // Percentage, e.g., 5 for 5%
  status?: 'passed' | 'failed' | 'in-progress';
  strategy?: string;
  history: AccountHistoryEntry[];
}
