import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Search, ChevronDown } from 'lucide-react';
import { api } from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const STATUS_META: Record<string, any> = {
  pending: { label: 'Pending', cls: 'text-yellow-400 bg-yellow-400/10' },
  approved: { label: 'Approved', cls: 'text-up bg-up' },
  completed: { label: 'Completed', cls: 'text-up bg-up' },
  rejected: { label: 'Rejected', cls: 'text-down bg-down' },
};

const TYPE_COLORS: Record<string, string> = {
  deposit: 'text-up bg-up',
  withdrawal: 'text-down bg-down',
  buy: 'text-blue-400 bg-blue-400/10',
  sell: 'text-purple-400 bg-purple-400/10',
  copy_profit: 'text-up bg-up',
};

export default function AdminTransactions() {
  const { user } = useOutletContext<any>();
  const [txns, setTxns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [updating, setUpdating] = useState<string | null>(null);

  const load = () => api.transactions.getAll(200).then(t => { setTxns(t); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = txns.filter(t => {
    const q = search.toLowerCase();
    const matchQ = !q || t.user_email?.toLowerCase().includes(q);
    const matchS = statusFilter === 'all' || t.status === statusFilter;
    const matchT = typeFilter === 'all' || t.type === typeFilter;
    return matchQ && matchS && matchT;
  });

  const approve = async (tx: any, status: 'approved' | 'rejected') => {
    setUpdating(tx.id);
    try {
      await api.transactions.update(tx.id, { status });
      if (status === 'approved' && tx.type === 'deposit') {
        await api.balances.update(tx.user_email, { balance_usd: tx.amount });
      }
      toast.success(`Transaction ${status}`);
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to update');
    }
    setUpdating(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader user={user} title="Transaction Management" subtitle={`${txns.filter(t => t.status === 'pending').length} pending approvals`} />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by email..."
            className="pl-9 bg-secondary border-border" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'approved', 'rejected'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${statusFilter === s ? 'bg-primary/15 text-primary border border-primary/25' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'deposit', 'withdrawal', 'buy', 'sell'].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${typeFilter === t ? 'bg-accent text-foreground border border-border' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="hidden sm:grid grid-cols-6 text-xs text-muted-foreground px-5 py-3 border-b border-border/60 font-medium">
          <span className="col-span-2">User</span>
          <span>Type</span>
          <span>Amount</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {loading ? (
          <div className="space-y-px">{[1,2,3,4,5].map(i => <div key={i} className="h-16 shimmer" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground">No transactions found</div>
        ) : (
          <div className="divide-y divide-border/40">
            {filtered.map(tx => (
              <div key={tx.id} className="grid grid-cols-1 sm:grid-cols-6 items-center gap-3 px-5 py-4 hover:bg-secondary/30 transition-colors">
                <div className="sm:col-span-2 min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground truncate">{tx.user_email}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`w-fit text-xs font-semibold px-2 py-1 rounded-lg capitalize ${TYPE_COLORS[tx.type] || 'bg-secondary text-muted-foreground'}`}>
                  {tx.type.replace('_', ' ')}
                </span>
                <p className="text-sm font-mono font-bold">${tx.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                <span className={`w-fit text-xs font-semibold px-2 py-1 rounded-lg capitalize ${STATUS_META[tx.status]?.cls || ''}`}>
                  {STATUS_META[tx.status]?.label || tx.status}
                </span>
                <div className="flex gap-1.5">
                  {tx.status === 'pending' ? (
                    <>
                      <button onClick={() => approve(tx, 'approved')} disabled={updating === tx.id}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-up text-up text-xs font-semibold hover:opacity-80 transition-opacity disabled:opacity-50">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {updating === tx.id ? '...' : 'Approve'}
                      </button>
                      <button onClick={() => approve(tx, 'rejected')} disabled={updating === tx.id}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-down text-down text-xs font-semibold hover:opacity-80 transition-opacity disabled:opacity-50">
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Processed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
