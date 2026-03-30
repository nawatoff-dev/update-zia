import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, Plus, Trash2, TrendingUp, ShieldCheck, AlertCircle, CheckCircle2, XCircle, BrainCircuit } from 'lucide-react';
import { Account } from '../types';
import { cn } from '../lib/utils';

interface AccountsProps {
  accounts: Account[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
}

export const Accounts: React.FC<AccountsProps> = ({ accounts, setAccounts }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newAccount, setNewAccount] = useState<Partial<Account>>({
    type: 'live',
    name: '',
    balance: 0,
    currency: 'USD',
    phase: 1,
    status: 'in-progress',
    strategy: ''
  });

  const addAccount = () => {
    const account: Account = {
      id: Math.random().toString(36).substr(2, 9),
      type: newAccount.type as 'live' | 'funded',
      name: newAccount.name || 'Account',
      balance: (newAccount.balance === undefined || Number.isNaN(newAccount.balance)) ? 0 : newAccount.balance,
      currency: newAccount.currency || 'USD',
      phase: newAccount.phase as 1 | 2 | 3 | 4,
      status: newAccount.status as 'passed' | 'failed' | 'in-progress',
      strategy: newAccount.strategy || ''
    };
    setAccounts(prev => [...prev, account]);
    setIsAdding(false);
    setNewAccount({ type: 'live', name: '', balance: 0, currency: 'USD', phase: 1, status: 'in-progress', strategy: '' });
  };

  const deleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const updateAccountStatus = (id: string, status: 'passed' | 'failed' | 'in-progress') => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Accounts</h1>
          <p className="text-text-muted mt-1">Track your live and funded trading accounts.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-text-inverse font-black rounded-xl hover:scale-105 transition-all shadow-lg shadow-brand-primary/20"
        >
          <Plus size={20} />
          ADD ACCOUNT
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accounts.map((account) => (
          <motion.div
            key={account.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 space-y-6 group relative overflow-hidden"
          >
            {/* Background Icon */}
            <div className="absolute top-[-20px] right-[-20px] opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
              {account.type === 'live' ? <Wallet size={120} /> : <ShieldCheck size={120} />}
            </div>

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  account.type === 'live' ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"
                )}>
                  {account.type === 'live' ? <Wallet size={20} /> : <ShieldCheck size={20} />}
                </div>
                <div>
                  <h3 className="font-black text-lg">{account.name}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">{account.type} ACCOUNT</p>
                </div>
              </div>
              <button
                onClick={() => deleteAccount(account.id)}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="p-4 bg-brand-dark/50 border border-brand-border rounded-2xl">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Balance</p>
                <p className="text-2xl font-black">{account.currency} {account.balance.toLocaleString()}</p>
              </div>
              {account.type === 'funded' && (
                <div className="p-4 bg-brand-dark/50 border border-brand-border rounded-2xl">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Phase</p>
                  <p className="text-2xl font-black">{account.phase}</p>
                </div>
              )}
            </div>

            {account.type === 'funded' && (
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between p-4 bg-brand-dark/50 border border-brand-border rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      account.status === 'passed' ? "bg-emerald-500/10 text-emerald-500" :
                      account.status === 'failed' ? "bg-red-500/10 text-red-500" :
                      "bg-amber-500/10 text-amber-500"
                    )}>
                      {account.status === 'passed' ? <CheckCircle2 size={16} /> :
                       account.status === 'failed' ? <XCircle size={16} /> :
                       <TrendingUp size={16} />}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Status</p>
                      <p className="font-black uppercase text-xs">{account.status?.replace('-', ' ')}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => updateAccountStatus(account.id, 'passed')} className="p-2 hover:bg-emerald-500/10 rounded-lg text-emerald-500 transition-all"><CheckCircle2 size={16} /></button>
                    <button onClick={() => updateAccountStatus(account.id, 'failed')} className="p-2 hover:bg-red-500/10 rounded-lg text-red-500 transition-all"><XCircle size={16} /></button>
                  </div>
                </div>

                {account.status === 'failed' && account.strategy && (
                  <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl flex gap-3">
                    <AlertCircle size={18} className="text-red-500 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Strategy to Follow</p>
                      <p className="text-sm font-medium text-text-main leading-relaxed">{account.strategy}</p>
                    </div>
                  </div>
                )}
                
                {account.status === 'passed' && (
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex gap-3">
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Congratulations!</p>
                      <p className="text-sm font-medium text-text-main leading-relaxed">You have successfully passed Phase {account.phase}.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}

        {accounts.length === 0 && !isAdding && (
          <div className="col-span-full glass-card p-12 text-center space-y-4">
            <div className="w-20 h-20 bg-brand-surface rounded-full flex items-center justify-center mx-auto border border-brand-border">
              <Wallet size={40} className="text-text-muted" />
            </div>
            <h3 className="text-xl font-black">No Accounts Tracked</h3>
            <p className="text-text-muted max-w-xs mx-auto">Start by adding your first live or funded account.</p>
          </div>
        )}
      </div>

      {/* Add Account Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-brand-surface border border-brand-border p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]"
            >
              <h3 className="text-2xl font-black">Add New Account</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-text-muted uppercase tracking-widest">Account Type</label>
                  <div className="flex p-1 bg-brand-dark rounded-xl border border-brand-border">
                    <button
                      onClick={() => setNewAccount({ ...newAccount, type: 'live' })}
                      className={cn(
                        "flex-1 py-3 text-xs font-black rounded-lg transition-all",
                        newAccount.type === 'live' ? "bg-brand-primary text-text-inverse" : "text-text-muted hover:text-text-main"
                      )}
                    >
                      LIVE
                    </button>
                    <button
                      onClick={() => setNewAccount({ ...newAccount, type: 'funded' })}
                      className={cn(
                        "flex-1 py-3 text-xs font-black rounded-lg transition-all",
                        newAccount.type === 'funded' ? "bg-brand-primary text-text-inverse" : "text-text-muted hover:text-text-main"
                      )}
                    >
                      FUNDED
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-text-muted uppercase tracking-widest">Account Name</label>
                  <input
                    type="text"
                    placeholder="e.g. My FTMO Account"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                    className="w-full bg-brand-dark border border-brand-border p-4 rounded-xl font-bold focus:border-brand-primary outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-text-muted uppercase tracking-widest">Balance</label>
                    <input
                      type="number"
                      value={newAccount.balance === undefined || Number.isNaN(newAccount.balance) ? '' : newAccount.balance}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setNewAccount({ ...newAccount, balance: val });
                      }}
                      className="w-full bg-brand-dark border border-brand-border p-4 rounded-xl font-bold focus:border-brand-primary outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-text-muted uppercase tracking-widest">Currency</label>
                    <select
                      value={newAccount.currency}
                      onChange={(e) => setNewAccount({ ...newAccount, currency: e.target.value })}
                      className="w-full bg-brand-dark border border-brand-border p-4 rounded-xl font-bold focus:border-brand-primary outline-none transition-all"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="JPY">JPY</option>
                    </select>
                  </div>
                </div>

                {newAccount.type === 'funded' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-text-muted uppercase tracking-widest">Phase</label>
                      <select
                        value={newAccount.phase}
                        onChange={(e) => setNewAccount({ ...newAccount, phase: parseInt(e.target.value) as any })}
                        className="w-full bg-brand-dark border border-brand-border p-4 rounded-xl font-bold focus:border-brand-primary outline-none transition-all"
                      >
                        <option value={1}>Phase 1</option>
                        <option value={2}>Phase 2</option>
                        <option value={3}>Phase 3</option>
                        <option value={4}>Phase 4</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-text-muted uppercase tracking-widest">Strategy to follow if failed</label>
                      <textarea
                        placeholder="What strategy will you follow if you fail this phase?"
                        value={newAccount.strategy}
                        onChange={(e) => setNewAccount({ ...newAccount, strategy: e.target.value })}
                        className="w-full bg-brand-dark border border-brand-border p-4 rounded-xl font-bold focus:border-brand-primary outline-none transition-all min-h-[80px]"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setIsAdding(false)} className="flex-1 py-4 font-black text-sm border border-brand-border rounded-xl hover:bg-white/5 transition-all">CANCEL</button>
                <button onClick={addAccount} className="flex-1 py-4 font-black text-sm bg-brand-primary text-text-inverse rounded-xl hover:scale-105 transition-all shadow-lg shadow-brand-primary/20">ADD ACCOUNT</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
