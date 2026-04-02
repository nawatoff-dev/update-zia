import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, Plus, Trash2, TrendingUp, ShieldCheck, AlertCircle, CheckCircle2, XCircle, BrainCircuit, Target, Coins, History } from 'lucide-react';
import { Account, AccountHistoryEntry } from '../types';
import { cn } from '../lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

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
    strategy: '',
    profitLimit: 0,
    lossLimit: 0
  });

  const [logForm, setLogForm] = useState<{ accountId: string | null; profit: number }>({
    accountId: null,
    profit: 0
  });

  const addAccount = () => {
    const balance = (newAccount.balance === undefined || Number.isNaN(newAccount.balance)) ? 0 : newAccount.balance;
    const account: Account = {
      id: Math.random().toString(36).substr(2, 9),
      type: newAccount.type as 'live' | 'funded',
      name: newAccount.name || 'Account',
      initialBalance: balance,
      balance: balance,
      currency: newAccount.currency || 'USD',
      phase: newAccount.phase || 1,
      profitLimit: newAccount.profitLimit || 0,
      lossLimit: newAccount.lossLimit || 0,
      status: newAccount.status as 'passed' | 'failed' | 'in-progress',
      strategy: newAccount.strategy || '',
      history: [{
        date: new Date().toISOString(),
        balance: balance,
        profit: 0
      }]
    };
    setAccounts(prev => [...prev, account]);
    setIsAdding(false);
    setNewAccount({ type: 'live', name: '', balance: 0, currency: 'USD', phase: 1, status: 'in-progress', strategy: '', profitLimit: 0, lossLimit: 0 });
  };

  const deleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const updateAccountStatus = (id: string, status: 'passed' | 'failed' | 'in-progress') => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const logProfitLoss = (accountId: string) => {
    setAccounts(prev => prev.map(a => {
      if (a.id === accountId) {
        const newBalance = a.balance + logForm.profit;
        const totalProfit = newBalance - a.initialBalance;
        const lossPercentage = ((a.initialBalance - newBalance) / a.initialBalance) * 100;
        
        let newStatus = a.status;
        if (a.type === 'funded' && a.profitLimit && totalProfit >= a.profitLimit) {
          newStatus = 'passed';
        } else if (a.lossLimit && lossPercentage >= a.lossLimit) {
          newStatus = 'failed';
        }

        const newEntry: AccountHistoryEntry = {
          date: new Date().toISOString(),
          balance: newBalance,
          profit: logForm.profit
        };

        return {
          ...a,
          balance: newBalance,
          status: newStatus,
          history: [...(a.history || []), newEntry]
        };
      }
      return a;
    }));
    setLogForm({ accountId: null, profit: 0 });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight uppercase">Trading <span className="text-brand-primary">Accounts</span></h1>
          <p className="text-text-muted mt-1 font-medium">Track your live and funded trading accounts performance.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-8 py-4 bg-brand-primary text-text-inverse font-black rounded-2xl hover:scale-105 transition-all shadow-lg shadow-brand-primary/20"
        >
          <Plus size={20} />
          ADD ACCOUNT
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {accounts.map((account) => (
          <motion.div
            key={account.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 space-y-8 group relative overflow-hidden"
          >
            {/* Background Icon */}
            <div className="absolute top-[-20px] right-[-20px] opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
              {account.type === 'live' ? <Wallet size={160} /> : <ShieldCheck size={160} />}
            </div>

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg",
                  account.type === 'live' ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"
                )}>
                  {account.type === 'live' ? <Wallet size={28} /> : <ShieldCheck size={28} />}
                </div>
                <div>
                  <h3 className="font-black text-2xl">{account.name}</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">{account.type} ACCOUNT</p>
                </div>
              </div>
              <button
                onClick={() => deleteAccount(account.id)}
                className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              <div className="p-5 bg-brand-dark/50 border border-brand-border rounded-2xl">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Current Balance</p>
                <p className="text-2xl font-black">{account.currency} {account.balance.toLocaleString()}</p>
              </div>
              <div className="p-5 bg-brand-dark/50 border border-brand-border rounded-2xl">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">
                  {account.type === 'funded' ? 'Phase / Goal / Max Loss' : 'Max Loss Limit'}
                </p>
                <p className="text-2xl font-black">
                  {account.type === 'funded' 
                    ? `P${account.phase} / ${account.currency}${account.profitLimit?.toLocaleString()} / ${account.lossLimit}%`
                    : `${account.lossLimit || 0}%`
                  }
                </p>
              </div>
            </div>

            {/* Log Profit/Loss Form */}
            <div className="p-6 bg-brand-surface/50 border border-brand-border rounded-3xl space-y-4 relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={18} className="text-brand-primary" />
                <h4 className="text-sm font-black uppercase tracking-widest">Log Profit / Loss</h4>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Profit/Loss ({account.currency})</label>
                  <input
                    type="number"
                    value={logForm.accountId === account.id ? logForm.profit : ''}
                    onChange={(e) => setLogForm({ ...logForm, accountId: account.id, profit: parseFloat(e.target.value) || 0 })}
                    placeholder="e.g. 500 or -200"
                    className="w-full bg-brand-dark border border-brand-border p-3 rounded-xl font-bold focus:border-brand-primary outline-none transition-all text-sm"
                  />
                </div>
              </div>
              <button
                onClick={() => logProfitLoss(account.id)}
                disabled={logForm.accountId !== account.id || logForm.profit === 0}
                className="w-full py-3 bg-brand-primary text-text-inverse font-black text-xs rounded-xl hover:scale-[1.02] transition-all shadow-lg shadow-brand-primary/10 disabled:opacity-50 disabled:hover:scale-100"
              >
                UPDATE ACCOUNT
              </button>
            </div>

            {/* Performance Chart */}
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History size={18} className="text-text-muted" />
                  <h4 className="text-sm font-black uppercase tracking-widest">Performance History</h4>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Total Growth</p>
                  <p className={cn(
                    "text-sm font-black",
                    account.balance >= account.initialBalance ? "text-emerald-500" : "text-red-500"
                  )}>
                    {account.balance >= account.initialBalance ? '+' : ''}
                    {((account.balance - account.initialBalance) / account.initialBalance * 100).toFixed(2)}%
                  </p>
                </div>
              </div>
              <div className="h-[200px] w-full bg-brand-dark/30 rounded-3xl border border-brand-border p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={account.history || []}>
                    <defs>
                      <linearGradient id={`colorBalance-${account.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={account.balance >= account.initialBalance ? "#10b981" : "#ef4444"} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={account.balance >= account.initialBalance ? "#10b981" : "#ef4444"} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      hide 
                    />
                    <YAxis 
                      hide 
                      domain={['auto', 'auto']}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#141414', border: '1px solid #1A1A1A', borderRadius: '12px' }}
                      itemStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                      labelStyle={{ display: 'none' }}
                      formatter={(value: number, name: string, props: any) => {
                        const profit = props.payload.profit;
                        const profitText = profit !== 0 ? ` (${profit > 0 ? '+' : ''}${profit.toLocaleString()})` : '';
                        return [`${account.currency} ${value.toLocaleString()}${profitText}`, 'Balance'];
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="balance" 
                      stroke={account.balance >= account.initialBalance ? "#10b981" : "#ef4444"} 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill={`url(#colorBalance-${account.id})`}
                      dot={(props: any) => {
                        const { cx, cy, payload } = props;
                        if (!payload || payload.profit === 0) return <circle cx={cx} cy={cy} r={2} fill="#71717a" />;
                        return (
                          <circle 
                            cx={cx} 
                            cy={cy} 
                            r={4} 
                            fill={payload.profit > 0 ? "#10b981" : "#ef4444"} 
                            stroke="none" 
                          />
                        );
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {account.type === 'funded' && (
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between p-5 bg-brand-dark/50 border border-brand-border rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shadow-inner",
                      account.status === 'passed' ? "bg-emerald-500/10 text-emerald-500" :
                      account.status === 'failed' ? "bg-red-500/10 text-red-500" :
                      "bg-amber-500/10 text-amber-500"
                    )}>
                      {account.status === 'passed' ? <CheckCircle2 size={24} /> :
                       account.status === 'failed' ? <XCircle size={24} /> :
                       <TrendingUp size={24} />}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Current Status</p>
                      <p className="font-black uppercase text-sm tracking-widest">{account.status?.replace('-', ' ')}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => updateAccountStatus(account.id, 'passed')} className="p-3 hover:bg-emerald-500/10 rounded-xl text-emerald-500 transition-all border border-transparent hover:border-emerald-500/20"><CheckCircle2 size={20} /></button>
                    <button onClick={() => updateAccountStatus(account.id, 'failed')} className="p-3 hover:bg-red-500/10 rounded-xl text-red-500 transition-all border border-transparent hover:border-red-500/20"><XCircle size={20} /></button>
                  </div>
                </div>

                {account.status === 'failed' && account.strategy && (
                  <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-3xl flex gap-4">
                    <AlertCircle size={24} className="text-red-500 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Strategy to Follow</p>
                      <p className="text-sm font-medium text-text-main leading-relaxed">{account.strategy}</p>
                    </div>
                  </div>
                )}
                
                {account.status === 'passed' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl flex gap-4 shadow-lg shadow-emerald-500/5"
                  >
                    <CheckCircle2 size={28} className="text-emerald-500 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Congratulations!</p>
                      <p className="text-lg font-black text-text-main leading-tight">You have successfully passed Phase {account.phase}.</p>
                      <p className="text-xs text-emerald-500/70 mt-1 font-bold">Goal of {account.currency}{account.profitLimit?.toLocaleString()} reached.</p>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        ))}

        {accounts.length === 0 && !isAdding && (
          <div className="col-span-full glass-card p-20 text-center space-y-6">
            <div className="w-24 h-24 bg-brand-surface rounded-3xl flex items-center justify-center mx-auto border border-brand-border rotate-3 shadow-xl">
              <Wallet size={48} className="text-text-muted" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase">No Accounts Tracked</h3>
              <p className="text-text-muted max-w-xs mx-auto font-medium">Start by adding your first live or funded account to track performance.</p>
            </div>
          </div>
        )}
      </div>

      {/* Overall Performance Chart */}
      {accounts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 space-y-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-2xl">
                <TrendingUp size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">Overall <span className="text-brand-primary">Performance</span></h2>
                <p className="text-text-muted text-sm font-medium">Combined progress across all trading accounts.</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Total Combined Balance</p>
              <p className="text-3xl font-black text-brand-primary">
                USD {accounts.reduce((acc, curr) => acc + curr.balance, 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="h-[300px] w-full bg-brand-dark/30 rounded-[2rem] border border-brand-border p-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={
                // Aggregate all account histories into a single timeline
                Array.from(new Set(accounts.flatMap(a => (a.history || []).map(h => h.date))))
                  .sort()
                  .map((date: string) => ({
                    date: new Date(date).toLocaleDateString(),
                    totalBalance: accounts.reduce((sum, acc) => {
                      const entry = [...(acc.history || [])].reverse().find(h => h.date <= date);
                      return sum + (entry ? entry.balance : acc.initialBalance);
                    }, 0)
                  }))
              }>
                <defs>
                  <linearGradient id="colorTotalBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#71717a" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#71717a" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `$${val.toLocaleString()}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#141414', border: '1px solid #1A1A1A', borderRadius: '16px', padding: '12px' }}
                  itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="totalBalance" 
                  stroke="#10b981" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorTotalBalance)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Add Account Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-brand-surface border border-brand-border p-8 rounded-[2.5rem] max-w-md w-full shadow-2xl space-y-8 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-2xl">
                  <Plus size={24} />
                </div>
                <h3 className="text-2xl font-black uppercase">Add New Account</h3>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Account Type</label>
                  <div className="flex p-1.5 bg-brand-dark rounded-2xl border border-brand-border">
                    <button
                      onClick={() => setNewAccount({ ...newAccount, type: 'live' })}
                      className={cn(
                        "flex-1 py-4 text-xs font-black rounded-xl transition-all",
                        newAccount.type === 'live' ? "bg-brand-primary text-text-inverse shadow-lg shadow-brand-primary/20" : "text-text-muted hover:text-text-main"
                      )}
                    >
                      LIVE
                    </button>
                    <button
                      onClick={() => setNewAccount({ ...newAccount, type: 'funded' })}
                      className={cn(
                        "flex-1 py-4 text-xs font-black rounded-xl transition-all",
                        newAccount.type === 'funded' ? "bg-brand-primary text-text-inverse shadow-lg shadow-brand-primary/20" : "text-text-muted hover:text-text-main"
                      )}
                    >
                      FUNDED
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Account Name</label>
                  <input
                    type="text"
                    placeholder="e.g. My FTMO Account"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                    className="w-full bg-brand-dark border border-brand-border p-5 rounded-2xl font-bold focus:border-brand-primary outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Initial Balance</label>
                    <input
                      type="number"
                      value={newAccount.balance === undefined || Number.isNaN(newAccount.balance) ? '' : newAccount.balance}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setNewAccount({ ...newAccount, balance: val });
                      }}
                      className="w-full bg-brand-dark border border-brand-border p-5 rounded-2xl font-bold focus:border-brand-primary outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Loss Limit (%)</label>
                    <input
                      type="number"
                      value={newAccount.lossLimit === undefined || Number.isNaN(newAccount.lossLimit) ? '' : newAccount.lossLimit}
                      onChange={(e) => setNewAccount({ ...newAccount, lossLimit: parseFloat(e.target.value) || 0 })}
                      placeholder="e.g. 5"
                      className="w-full bg-brand-dark border border-brand-border p-5 rounded-2xl font-bold focus:border-brand-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Currency</label>
                  <select
                    value={newAccount.currency}
                    onChange={(e) => setNewAccount({ ...newAccount, currency: e.target.value })}
                    className="w-full bg-brand-dark border border-brand-border p-5 rounded-2xl font-bold focus:border-brand-primary outline-none transition-all appearance-none"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                  </select>
                </div>

                {newAccount.type === 'funded' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Phase</label>
                        <select
                          value={newAccount.phase}
                          onChange={(e) => setNewAccount({ ...newAccount, phase: parseInt(e.target.value) })}
                          className="w-full bg-brand-dark border border-brand-border p-5 rounded-2xl font-bold focus:border-brand-primary outline-none transition-all appearance-none"
                        >
                          <option value={1}>Phase 1</option>
                          <option value={2}>Phase 2</option>
                          <option value={3}>Phase 3</option>
                          <option value={4}>Phase 4</option>
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Profit Limit</label>
                        <input
                          type="number"
                          value={newAccount.profitLimit === undefined || Number.isNaN(newAccount.profitLimit) ? '' : newAccount.profitLimit}
                          onChange={(e) => setNewAccount({ ...newAccount, profitLimit: parseFloat(e.target.value) || 0 })}
                          placeholder="e.g. 10000"
                          className="w-full bg-brand-dark border border-brand-border p-5 rounded-2xl font-bold focus:border-brand-primary outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Strategy to follow if failed</label>
                      <textarea
                        placeholder="What strategy will you follow if you fail this phase?"
                        value={newAccount.strategy}
                        onChange={(e) => setNewAccount({ ...newAccount, strategy: e.target.value })}
                        className="w-full bg-brand-dark border border-brand-border p-5 rounded-2xl font-bold focus:border-brand-primary outline-none transition-all min-h-[100px] resize-none"
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setIsAdding(false)} className="flex-1 py-5 font-black text-xs uppercase tracking-widest border border-brand-border rounded-2xl hover:bg-white/5 transition-all">CANCEL</button>
                <button onClick={addAccount} className="flex-1 py-5 font-black text-xs uppercase tracking-widest bg-brand-primary text-text-inverse rounded-2xl hover:scale-105 transition-all shadow-lg shadow-brand-primary/20">ADD ACCOUNT</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
