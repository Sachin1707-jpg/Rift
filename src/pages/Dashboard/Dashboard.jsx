import React, { useState, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Fingerprint, ShieldCheck, Clock, Ban,
  Activity, CheckCircle, XCircle, Shield,
  Search, SlidersHorizontal, ChevronDown, X,
} from 'lucide-react';
import { Navbar }          from '../../components/Navbar/Navbar';
import { AgentCard }       from '../../components/AgentCard/AgentCard';
import { AgentModal }      from '../../components/AgentModal/AgentModal';
import { AgentDrawer }     from '../../components/AgentDrawer/AgentDrawer';
import { EmptyState }      from '../../components/EmptyState/EmptyState';
import { AgentContext }    from '../../context/AgentContext';
import { AuthContext }     from '../../context/AuthContext';
import { StatCardSkeleton, AgentCardSkeleton } from '../../components/Skeleton/Skeleton';
import { useSimulatedLoading } from '../../hooks/useSimulatedLoading';

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_FILTERS = [
  { key: 'All',        label: 'All',        color: 'text-slate-300 bg-slate-800 border-slate-700 hover:border-slate-500' },
  { key: 'Active',     label: '● Active',   color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-400' },
  { key: 'Expired',    label: '○ Expired',  color: 'text-slate-400  bg-slate-500/10  border-slate-500/30  hover:border-slate-400'  },
  { key: 'Revoked',    label: '✕ Revoked',  color: 'text-rose-400   bg-rose-500/10   border-rose-500/30   hover:border-rose-400'   },
  { key: 'Suspicious', label: '⚠ Suspicious',color: 'text-amber-400  bg-amber-500/10  border-amber-500/30  hover:border-amber-400' },
];

const SORT_OPTIONS = [
  { key: 'newest',  label: 'Newest first' },
  { key: 'oldest',  label: 'Oldest first' },
  { key: 'expiry',  label: 'Expiry time'  },
  { key: 'name',    label: 'Name A→Z'     },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const matchesSearch = (agent, q) => {
  if (!q) return true;
  const lower = q.toLowerCase();
  return (
    agent.name.toLowerCase().includes(lower) ||
    agent.purpose.toLowerCase().includes(lower) ||
    agent.status.toLowerCase().includes(lower) ||
    agent.permissions.some(p => p.toLowerCase().includes(lower))
  );
};

const sortAgents = (list, sortKey) => {
  return [...list].sort((a, b) => {
    if (sortKey === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortKey === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortKey === 'expiry') return new Date(a.expiresAt) - new Date(b.expiresAt);
    if (sortKey === 'name')   return a.name.localeCompare(b.name);
    return 0;
  });
};

// ─── Sort dropdown ────────────────────────────────────────────────────────────
const SortDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const current = SORT_OPTIONS.find(o => o.key === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700/80
          border border-white/10 rounded-xl text-sm text-slate-300 font-medium transition-colors"
      >
        <SlidersHorizontal className="w-4 h-4 text-slate-400" />
        {current?.label}
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 top-full mt-2 w-44 bg-[#1E293B] border border-white/10
              rounded-2xl shadow-2xl z-30 overflow-hidden"
          >
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => { onChange(opt.key); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                  ${value === opt.key
                    ? 'text-blue-400 bg-blue-500/10 font-semibold'
                    : 'text-slate-300 hover:bg-white/5'}`}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
export const Dashboard = () => {
  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  // ── filter / sort state ──────────────────────────────────────────────────
  const [search,     setSearch]     = useState('');
  const [statusFilter, setStatus]   = useState('All');
  const [sortKey,    setSortKey]    = useState('newest');

  const { agents, logs } = useContext(AgentContext);
  const { user }         = useContext(AuthContext);

  const isLoading = useSimulatedLoading(1000);

  // ── derived stats ────────────────────────────────────────────────────────
  const totalApproved = logs.filter(l => l.status === 'Approved').length;
  const totalDenied   = logs.filter(l => l.status === 'Denied').length;
  const totalPending  = logs.filter(l => l.status === 'Pending').length;

  const securityScore = totalApproved + totalDenied > 0 
    ? Math.round(100 - (totalDenied / (totalApproved + totalDenied)) * 100) 
    : 100;

  const stats = [
    { title: 'Total Agents',       value: agents.length.toString(),                                          icon: Fingerprint, colorClass: 'text-blue-400'    },
    { title: 'Active Tokens',      value: agents.filter(a => a.status === 'Active').length.toString(),       icon: ShieldCheck, colorClass: 'text-emerald-400' },
    { title: 'Revoked',            value: agents.filter(a => a.status === 'Revoked').length.toString(),      icon: Ban,         colorClass: 'text-rose-400'     },
    { title: 'Expired',            value: agents.filter(a => a.status === 'Expired').length.toString(),      icon: Clock,       colorClass: 'text-slate-400'    },
    { title: 'Pending Requests',   value: totalPending.toString(),                                           icon: Activity,    colorClass: 'text-orange-400'   },
    { title: 'Successful',         value: totalApproved.toString(),                                          icon: CheckCircle, colorClass: 'text-emerald-400'  },
    { title: 'Denied Requests',    value: totalDenied.toString(),                                            icon: XCircle,     colorClass: 'text-rose-400'     },
    { title: 'Security Score',     value: `${securityScore}/100`,                                            icon: Shield,      colorClass: 'text-purple-400'   },
  ];

  // ── filtered + sorted agents ─────────────────────────────────────────────
  const filteredAgents = useMemo(() => {
    let result = agents;
    if (statusFilter !== 'All') result = result.filter(a => a.status === statusFilter);
    result = result.filter(a => matchesSearch(a, search));
    return sortAgents(result, sortKey);
  }, [agents, statusFilter, search, sortKey]);

  const hasFilters = search || statusFilter !== 'All' || sortKey !== 'newest';
  const clearFilters = () => { setSearch(''); setStatus('All'); setSortKey('newest'); };

  const firstName = user?.name?.split(' ')[0] || 'there';

  const activeCount = agents.filter(a => a.status === 'Active').length;
  const revokedCount = agents.filter(a => a.status === 'Revoked').length;
  const expiredCount = agents.filter(a => a.status === 'Expired').length;
  const flaggedCount = agents.filter(a => a.status === 'Suspicious').length;

  return (
    <div className="min-h-screen bg-mock-bg flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-[1180px] mx-auto px-[24px] pb-[80px]">
        {/* ── Dashboard Header ───────────────────────────────────────────── */}
        <div className="flex items-end justify-between mt-[32px] mb-[20px]">
          <div>
            <h1 className="font-space text-[26px] font-semibold text-mock-text">Your Agents</h1>
            <div className="text-mock-text-dim text-[13px] mt-[4px]">
              {agents.length} agents · {activeCount} active · {revokedCount} revoked · {expiredCount} expired · {flaggedCount} flagged
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-mock-accent text-[#06140F] font-semibold text-[13px] px-[18px] py-[11px] rounded-[10px] flex items-center gap-[8px] hover:bg-[#3ebe95] transition-colors"
          >
            + Create New Agent
          </button>
        </div>

        {/* ── Search + Filters toolbar (only shown when agents exist) ── */}
        {agents.length > 0 && (
          <div className="flex gap-[16px] mb-[24px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-[14px] top-1/2 -translate-y-1/2 text-mock-text-dim pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search agents..."
                className="w-full bg-mock-panel2 border border-mock-border rounded-[8px] pl-[38px] pr-[14px] py-[10px] text-[13px] text-mock-text placeholder:text-mock-text-dim focus:outline-none focus:border-mock-accent transition-colors"
              />
            </div>
            <div className="flex gap-[8px]">
              {STATUS_FILTERS.map(f => (
                <button
                  key={f.key}
                  onClick={() => setStatus(f.key)}
                  className={`px-[12px] py-[8px] rounded-[8px] text-[12px] font-medium border transition-colors
                    ${statusFilter === f.key ? 'bg-mock-accent/10 border-mock-accent text-mock-accent' : 'bg-mock-panel border-mock-border text-mock-text-dim hover:text-mock-text'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Grid ───────────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
            {Array.from({ length: 3 }).map((_, i) => (
              <AgentCardSkeleton key={i} />
            ))}
          </div>
        ) : agents.length === 0 ? (
          <EmptyState
            icon={Fingerprint}
            gradient="from-slate-600 to-slate-700"
            glow="bg-slate-500"
            title="No agent passports yet"
            subtitle="Issue your first AI agent passport to grant temporary, verifiable access to external websites."
            action={{ label: 'Issue First Passport', onClick: () => setIsModalOpen(true), icon: Plus }}
          />
        ) : filteredAgents.length === 0 ? (
          <EmptyState
            icon={Search}
            gradient="from-slate-600 to-slate-700"
            glow="bg-slate-500"
            title="No agents match your filters"
            subtitle={`None of your ${agents.length} passport(s) match the current search or status filter.`}
            action={{ label: 'Clear All Filters', onClick: clearFilters, icon: X }}
          />
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 gap-[20px]"
          >
            <AnimatePresence mode="popLayout">
              {filteredAgents.map(agent => (
                <motion.div
                  key={agent.id}
                  layout
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.25 }}
                >
                  <AgentCard
                    agent={agent}
                    onClick={() => setSelectedAgent(agent)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      <AgentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <AgentDrawer
        isOpen={!!selectedAgent}
        onClose={() => setSelectedAgent(null)}
        agent={selectedAgent}
      />
    </div>
  );
};
