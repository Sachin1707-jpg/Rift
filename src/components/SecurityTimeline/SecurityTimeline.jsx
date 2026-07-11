import React, { useContext, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, XCircle, AlertTriangle, Clock, LogIn,
  Fingerprint, Key, Globe, ShoppingBag, Send, ShieldAlert,
  Wifi, ShieldCheck, Zap, GitCommitVertical,
} from 'lucide-react';
import { AgentContext }  from '../../context/AgentContext';
import { EmptyState }    from '../EmptyState/EmptyState';
import { useNavigate }   from 'react-router-dom';

// ─── Map action → icon component ─────────────────────────────────────────────
const ACTION_ICON = {
  'Connection Established': Wifi,
  'Agent Created':          Fingerprint,
  'Token Issued':           Key,
  'Browse':                 Globe,
  'Purchase':               ShoppingBag,
  'Post':                   Send,
  'Revoked':                ShieldAlert,
  'Expired':                Clock,
  'Login':                  LogIn,
  'Approved':               ShieldCheck,
};

const getIcon = (action) => ACTION_ICON[action] ?? Zap;

// ─── Colour scheme per status ────────────────────────────────────────────────
const STATUS_STYLE = {
  Approved: {
    dot:   'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]',
    ring:  'ring-emerald-500/25',
    icon:  'text-emerald-400',
    label: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/25',
    line:  'from-emerald-500/40',
  },
  Denied: {
    dot:   'bg-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]',
    ring:  'ring-rose-500/25',
    icon:  'text-rose-400',
    label: 'text-rose-400 bg-rose-400/10 border-rose-400/25',
    line:  'from-rose-500/40',
  },
  Warning: {
    dot:   'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]',
    ring:  'ring-amber-400/25',
    icon:  'text-amber-400',
    label: 'text-amber-400 bg-amber-400/10 border-amber-400/25',
    line:  'from-amber-400/40',
  },
  Expired: {
    dot:   'bg-slate-500',
    ring:  'ring-slate-500/20',
    icon:  'text-slate-400',
    label: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
    line:  'from-slate-500/30',
  },
  Info: {
    dot:   'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]',
    ring:  'ring-blue-500/25',
    icon:  'text-blue-400',
    label: 'text-blue-400 bg-blue-400/10 border-blue-400/25',
    line:  'from-blue-500/40',
  },
};

// Normalise raw log status into our style keys
const resolveStyle = (log) => {
  if (log.status === 'Approved')             return STATUS_STYLE.Approved;
  if (log.status === 'Denied')               return STATUS_STYLE.Denied;
  if (log.action === 'Connection Established') return STATUS_STYLE.Info;
  if (log.action === 'Expired')              return STATUS_STYLE.Expired;
  return STATUS_STYLE.Info;
};

// ─── Format time ──────────────────────────────────────────────────────────────
const fmt = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

// ─── Single timeline event ────────────────────────────────────────────────────
const TimelineEvent = ({ log, isLast, index }) => {
  const style = resolveStyle(log);
  const Icon  = getIcon(log.action);

  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: index < 8 ? index * 0.05 : 0 }}
      className="flex gap-4 group relative"
    >
      {/* Left column: dot + connecting line */}
      <div className="flex flex-col items-center flex-shrink-0 w-10">
        {/* Dot */}
        <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center
          bg-slate-900 ring-2 ${style.ring} transition-all duration-300
          group-hover:scale-110`}
        >
          {/* Pulsing glow behind dot */}
          <div className={`absolute inset-0 rounded-full ${style.dot} opacity-20 scale-125 blur-sm`} />
          <div className={`w-4 h-4 rounded-full ${style.dot} flex-shrink-0 z-10`} />
        </div>

        {/* Connector line */}
        {!isLast && (
          <div className={`w-[2px] flex-1 min-h-[40px] mt-1 bg-gradient-to-b ${style.line} to-transparent`} />
        )}
      </div>

      {/* Right column: card */}
      <div className={`flex-1 mb-6 bg-slate-900/60 backdrop-blur-sm border border-white/5
        rounded-2xl px-5 py-4 transition-all duration-200
        group-hover:border-white/10 group-hover:bg-slate-800/60
        group-hover:shadow-[0_4px_24px_rgba(0,0,0,0.3)]`}
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg bg-white/5 ${style.icon}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-sm text-white">{log.action}</span>
          </div>

          {/* Status pill */}
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex-shrink-0 ${style.label}`}>
            {log.status === 'Approved' && <CheckCircle2 className="w-2.5 h-2.5" />}
            {log.status === 'Denied'   && <XCircle      className="w-2.5 h-2.5" />}
            {log.action === 'Connection Established' && <Wifi className="w-2.5 h-2.5" />}
            {log.status}
          </span>
        </div>

        {/* Agent name & reason */}
        <p className="text-xs text-slate-400 font-medium">{log.agentName}</p>
        {log.reason && (
          <p className="text-[11px] text-slate-500 mt-1 italic">"{log.reason}"</p>
        )}

        {/* Timestamp */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/5">
          <Clock className="w-3 h-3 text-slate-600" />
          <span className="text-[11px] font-mono text-slate-500">{fmt(log.timestamp)}</span>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyTimeline = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center py-16 text-center"
  >
    <div className="w-16 h-16 rounded-2xl bg-slate-800/70 border border-white/10 flex items-center justify-center mb-4">
      <Clock className="w-7 h-7 text-slate-600" />
    </div>
    <h4 className="text-slate-300 font-semibold mb-1">No events yet</h4>
    <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
      Create an agent and launch it into the Storefront to start recording security events.
    </p>
  </motion.div>
);

// ─── Timeline legend ──────────────────────────────────────────────────────────
const Legend = () => (
  <div className="flex flex-wrap gap-3">
    {[
      { label: 'Approved', dot: 'bg-emerald-500', glow: 'shadow-[0_0_6px_rgba(16,185,129,0.6)]' },
      { label: 'Denied',   dot: 'bg-rose-500',    glow: 'shadow-[0_0_6px_rgba(239,68,68,0.6)]' },
      { label: 'Info',     dot: 'bg-blue-500',    glow: 'shadow-[0_0_6px_rgba(59,130,246,0.5)]' },
      { label: 'Expired',  dot: 'bg-slate-500',   glow: '' },
    ].map(({ label, dot, glow }) => (
      <div key={label} className="flex items-center gap-1.5 text-xs text-slate-400">
        <div className={`w-2 h-2 rounded-full ${dot} ${glow}`} />
        {label}
      </div>
    ))}
  </div>
);

// ─── Main export ──────────────────────────────────────────────────────────────
export const SecurityTimeline = () => {
  const { logs }    = useContext(AgentContext);
  const navigate    = useNavigate();
  const bottomRef   = useRef(null);
  const prevLen     = useRef(logs.length);

  useEffect(() => {
    if (logs.length > prevLen.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    prevLen.current = logs.length;
  }, [logs.length]);

  // Render newest → oldest (logs are already stored newest-first)
  const ordered = [...logs]; // newest first = top of timeline

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h3 className="text-base font-bold text-white">Security Timeline</h3>
          <p className="text-xs text-slate-500 mt-0.5">{logs.length} events recorded</p>
        </div>
        <Legend />
      </div>

      {/* Scrollable feed */}
      <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
        {ordered.length === 0 ? (
          <EmptyState
            icon={GitCommitVertical}
            gradient="from-slate-600 to-slate-800"
            glow="bg-slate-600"
            title="No security events yet"
            subtitle="Launch an agent into the Storefront to start seeing permission checks appear here in real-time."
            action={{ label: 'Go to Dashboard', onClick: () => navigate('/dashboard'), icon: Zap }}
            floatingOrbs={false}
          />
        ) : (
          <AnimatePresence initial={false}>
            {ordered.map((log, i) => (
              <TimelineEvent
                key={log.id}
                log={log}
                index={i}
                isLast={i === ordered.length - 1}
              />
            ))}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
