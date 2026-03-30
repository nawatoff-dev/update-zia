import { ChecklistSection } from './types';

export const INITIAL_CHECKLIST: ChecklistSection[] = [
  {
    id: 'core-checklist',
    title: 'Core Rules',
    type: 'Core',
    items: [
      { id: 'core-1', label: 'HTF (Daily timeframe confirmation or clear structure)', checked: false },
      { id: 'core-2', label: 'Liquidity sweep done', checked: false },
      { id: 'core-3', label: 'HTF BOS confirmation (1D,4HR,1HR)', checked: false },
      { id: 'core-4', label: 'fundamental news check', checked: false },
      { id: 'core-5', label: 'acceptance', checked: false },
      { id: 'core-6', label: 'No emotion or/FOMO entry', checked: false },
    ]
  },
  {
    id: 'a-plus',
    title: 'A+ Setup',
    risk: '2%',
    type: 'A+',
    items: [
      { id: 'bias-htf', label: 'bias -HTF alignment', checked: false },
      { id: 'bias-counter', label: '-counter trend with confirmation', checked: false },
      { id: 'liquidity-sweep', label: 'liquidity sweep (must)', checked: false },
      { id: 'clear-structure', label: 'clear structure (must)', checked: false },
      { id: 'structure-choch', label: '- V CHOCH', checked: false },
      { id: 'structure-bos', label: '- V BOS', checked: false },
      { id: 'structure-poi', label: '- POI', checked: false },
      { id: 'structure-idm', label: '- IDM (optional)', checked: false },
      { id: 'structure-eng', label: '- ENG (optional)', checked: false },
      { id: 'key-window', label: 'Key window', checked: false },
    ]
  }
];
