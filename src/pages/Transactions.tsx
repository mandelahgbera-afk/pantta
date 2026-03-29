import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Clock, CheckCircle, XCircle, X, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import { toast } from 'sonner';

const TYPE_META: Record<string, any> = {
  deposit: { label: 'Deposit', icon: ArrowDownLeft, color: 'text-up bg-up' },
  withdrawal: { label: 'Withdrawal', icon: ArrowUpRight, color: 'text-down bg-down' },
  buy: { label: 'Buy', icon: ArrowLeftRight, color: 'text-blue-400 bg-blue-400/10' },
  sell: { label: 'Sell', icon: ArrowLeftRight, color: 'text-purple-400 bg-purple-400/10' },
  copy_profit: { label: 'Copy Profit', icon: ArrowDownLeft, color: 'text-up bg-up' },
};

const STATUS_META: Record<string, any> = {
  pending: { label: 'Pending', icon: Clock, cls: 'text-yellow-400 bg-yellow-400/10' },
  approved: { label: 'Approved', icon: CheckCircle, cls: 'text-up bg-up' },
  completed: { label: 'Completed', icon: CheckCircle, cls: 'text-up bg-up' },
  rejected: { label: 'Rejected', icon: XCircle, cls: 'text-down bg-down' },
};

export default function Transactions() {
  const { user } = useOutletContext<any>();
  const [txns, setTxns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState<null | 'deposit' | 'withdrawal'>(null);
  const [amount, setAmount] = useState('');
  const [wallet, setWallet] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [depositAddresses, setDepositAddresses] = useState<Record<string, string>>({});
  const [selectedNetwork, setSelectedNetwork] = useState('btc');

  useEffect(() => {
    api.platformSettings.list().then(rows => {
      const map: Record<string, string> = {};
      rows.forEach((r: any) => { map[r.key] = r.value; });
      setDepositAddresses(map);
    }).catch(() => {});
  }, []);

  const load = () => {
    if (!user?.email) return;
    api.transactions.getByEmail(user.email, 50).then(t => { setTxns(t); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [user]);

  const filtered = filter === 'all' ? txns : txns.filter(t => t.type === filter);

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) { toast.error('Enter a valid amount'); return; }
    if (modal === 'withdrawal' && !wallet) { toast.error('Enter your wallet address'); return; }
    setSubmitting(true);
    try {
      await api.transactions.create({
        user_email: user.email,
        type: modal!,
        amount: parseFloat(amount),
        wallet_address: wallet || undefined,
        status: 'pending',
      });
      toast.success(`${modal === 'deposit' ? 'Deposit' : 'Withdrawal'} request submitted! Awaiting admin approval.`);
      setModal(null); setAmount(''); setWallet('');
      load();
    } catch (e: any) {
      toast.error(e.message || 'Request failed');
    }
    setSubmitting(false);
  };

  const DEPOSIT_NETWORKS = [
    { key: 'btc', label: 'Bitcoin (BTC)', settingKey: 'deposit_address_btc' },
    { key: 'eth', label: 'Ethereum (ETH)', settingKey: 'deposit_address_eth' },
    { key: 'usdt_trc20', label: 'USDT (TRC20)', settingKey: 'deposit_address_usdt_trc20' },
    { key: 'usdt_erc20', label: 'USDT (ERC20)', settingKey: 'deposit_address_usdt_erc20' },
    { key: 'bnb', label: 'BNB', settingKey: 'deposit_address_bnb' },
  ];

  const currentAddress = depositAddresses[DEPOSIT_NETWORKS.find(n => n.key === selectedNetwork)?.settingKey || ''];

  return (
    <div className="space-y-6">
      <PageHeader user={user} title="Transactions" subtitle="Your complete transaction history" />

      <div className="flex gap-3">
        <Button onClick={() => setModal('deposit')} className="gradient-green text-white font-semibold glow-green-sm">
          <ArrowDownLeft className="w-4 h-4 mr-2" /> Deposit
        </Button>
        <Button onClick={() => setModal('withdrawal')} variant="outline" className="border-border text-foreground hover:bg-secondary font-semibold">
          <ArrowUpRight className="w-4 h-4 mr-2" /> Withdraw
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'deposit', 'withdrawal', 'buy', 'sell'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${filter === f ? 'bg-primary/15 text-primary border border-primary/25' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="space-y-px">{[1,2,3,4].map(i => <div key={i} className="h-16 shimmer" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-sm text-muted-foreground">No transactions found.</div>
        ) : (
          <div className="divide-y divide-border/40">
            {filtered.map(tx => {
              const meta = TYPE_META[tx.type] || TYPE_META.deposit;
              const statusMeta = STATUS_META[tx.status] || STATUS_META.pending;
              const Icon = meta.icon;
              const StatusIcon = statusMeta.icon;
              return (
                <div key={tx.id} className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors">
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold capitalize">{tx.type.replace('_', ' ')}</p>
                    <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-mono font-bold">${tx.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg ${statusMeta.cls}`}>
                      <StatusIcon className="w-3 h-3" />
                      <span className="capitalize">{tx.status}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg">{modal === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}</h3>
              <button onClick={() => { setModal(null); setAmount(''); setWallet(''); }}
                className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>

            {modal === 'deposit' ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {DEPOSIT_NETWORKS.map(n => (
                    <button key={n.key} onClick={() => setSelectedNetwork(n.key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${selectedNetwork === n.key ? 'bg-primary/15 text-primary border border-primary/25' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
                      {n.label}
                    </button>
                  ))}
                </div>
                {currentAddress ? (
                  <div className="bg-secondary rounded-xl p-4 space-y-2">
                    <p className="text-xs text-muted-foreground">Send to this address:</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-foreground break-all flex-1">{currentAddress}</code>
                      <button onClick={() => { navigator.clipboard.writeText(currentAddress); toast.success('Address copied!'); }}
                        className="text-muted-foreground hover:text-primary flex-shrink-0"><Copy className="w-4 h-4" /></button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-secondary rounded-xl p-4 text-xs text-muted-foreground text-center">
                    No address configured for this network yet. Contact admin.
                  </div>
                )}
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-300">
                  After sending, enter the amount below and submit to notify admin.
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Amount sent (USD equivalent)</label>
                  <Input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="bg-secondary border-border font-mono" />
                </div>
                <Button onClick={handleSubmit} disabled={submitting} className="w-full gradient-green text-white font-bold h-11">
                  {submitting ? 'Submitting...' : 'Notify Admin of Deposit'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Withdrawal Amount (USD)</label>
                  <Input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="bg-secondary border-border font-mono" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Your Wallet Address</label>
                  <Input placeholder="0x... or bc1q..." value={wallet} onChange={e => setWallet(e.target.value)} className="bg-secondary border-border font-mono text-xs" />
                </div>
                <Button onClick={handleSubmit} disabled={submitting} variant="destructive" className="w-full h-11 font-bold">
                  {submitting ? 'Submitting...' : 'Request Withdrawal'}
                </Button>
                <p className="text-xs text-center text-muted-foreground">Withdrawals are processed manually by admin within 24–48 hours.</p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
