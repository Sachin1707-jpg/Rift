import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Copy, Download, Shield, Clock, Calendar, Key,
  CheckCircle2, Lock, ChevronRight, Eye, EyeOff
} from 'lucide-react';
import { PermissionBadge } from '../PermissionBadge/PermissionBadge';
import { ModalSkeleton }   from '../Skeleton/Skeleton';
import { useSimulatedLoading } from '../../hooks/useSimulatedLoading';
import toast from 'react-hot-toast';

// ─── JWT-style token splitter ─────────────────────────────────────────────────
// Splits the mock token into three visual sections like jwt.io does
const splitToken = (token = '') => {
  const third = Math.floor(token.length / 3);
  return {
    header:    token.slice(0, third),
    payload:   token.slice(third, third * 2),
    signature: token.slice(third * 2),
  };
};

// ─── Highlighted token display ────────────────────────────────────────────────
const TokenDisplay = ({ token, revealed }) => {
  const { header, payload, signature } = splitToken(token);

  const masked = (str) =>
    str.split('').map((c, i) =>
      revealed ? c : (c === '_' || c === '-' ? c : '•')
    ).join('');

  return (
    <div className="font-mono text-[13px] leading-7 break-all select-all p-5 bg-slate-950/80 rounded-2xl border border-white/5 tracking-wide">
      <span className="text-rose-400">{revealed ? header : masked(header)}</span>
      <span className="text-slate-600">.</span>
      <span className="text-amber-300">{revealed ? payload : masked(payload)}</span>
      <span className="text-slate-600">.</span>
      <span className="text-sky-400">{revealed ? signature : masked(signature)}</span>
    </div>
  );
};

// ─── Decoded payload card ─────────────────────────────────────────────────────
const PayloadCard = ({ agent }) => {
  const payload = {
    sub:         agent.id,
    name:        agent.name,
    purpose:     agent.purpose,
    permissions: agent.permissions,
    iat:         Math.floor(new Date(agent.createdAt).getTime() / 1000),
    exp:         Math.floor(new Date(agent.expiresAt).getTime() / 1000),
    iss:         'aipassport.io',
    jti:         agent.token.slice(-12),
  };

  return (
    <div className="bg-slate-950/60 rounded-2xl border border-white/[0.06] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
        </div>
        <span className="text-[11px] text-slate-500 font-mono ml-2">jwt_payload.json</span>
      </div>
      <pre className="text-[12px] font-mono text-slate-300 p-4 leading-6 overflow-x-auto">
{`{`}
{Object.entries(payload).map(([k, v], i, arr) => (
  <span key={k}>
    {`\n  `}<span className="text-sky-400">"{k}"</span>
    {`: `}
    {Array.isArray(v)
      ? <span className="text-amber-300">["{v.join('", "')}"]</span>
      : typeof v === 'number'
        ? <span className="text-purple-400">{v}</span>
        : <span className="text-emerald-400">"{v}"</span>}
    {i < arr.length - 1 ? ',' : ''}
  </span>
))}
{`\n}`}
      </pre>
    </div>
  );
};

// ─── Main modal ───────────────────────────────────────────────────────────────
export const TokenModal = ({ agent, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('token');
  const [copied, setCopied]       = useState(false);
  const [revealed, setRevealed]   = useState(false);
  const isLoading = useSimulatedLoading(600);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) { setRevealed(false); setActiveTab('token'); setCopied(false); }
  }, [isOpen]);

  if (!agent) return null;

  const formatDate = (iso) => iso ? new Date(iso).toLocaleString() : '—';
  const isExpired  = agent.status !== 'Active';

  const timeLeft = (() => {
    const ms = new Date(agent.expiresAt) - Date.now();
    if (ms <= 0) return 'Expired';
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${h}h ${m}m ${s}s`;
  })();

  const handleCopy = () => {
    navigator.clipboard.writeText(agent.token);
    setCopied(true);
    toast.success('Token copied to clipboard');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const content = [
      '# AI Passport JWT Token',
      `# Agent: ${agent.name}`,
      `# Issued: ${formatDate(agent.createdAt)}`,
      `# Expires: ${formatDate(agent.expiresAt)}`,
      `# Permissions: ${agent.permissions.join(', ')}`,
      '',
      agent.token,
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${agent.name.replace(/\s+/g, '_')}_token.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Token file downloaded');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-full max-w-2xl pointer-events-auto rounded-3xl
                bg-[#1E293B]/85 backdrop-blur-2xl border border-white/10
                shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              {isLoading ? (
                <ModalSkeleton />
              ) : (
                <>
                  {/* ── Header ───────────────────────────────────────────────── */}
                  <div className="relative px-7 pt-7 pb-5 border-b border-white/10 flex-shrink-0 overflow-hidden">
                    {/* Ambient glow */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -top-10 left-20 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/25">
                          <Key className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white tracking-tight">Access Token</h2>
                          <p className="text-sm text-slate-400 mt-0.5">{agent.name}</p>
                        </div>
                      </div>

                      <button
                        onClick={onClose}
                        className="flex-shrink-0 p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors mt-1"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Status strip */}
                    <div className="relative z-10 flex flex-wrap gap-3 mt-5">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border
                        ${isExpired
                          ? 'bg-slate-500/10 border-slate-500/25 text-slate-400'
                          : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'}`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${isExpired ? 'bg-slate-400' : 'bg-emerald-400 animate-pulse'}`} />
                        {agent.status}
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-700/50 border border-white/10 text-xs font-medium text-slate-300">
                        <Clock className="w-3 h-3" />
                        {timeLeft}
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-700/50 border border-white/10 text-xs font-medium text-slate-300">
                        <Shield className="w-3 h-3" />
                        {agent.permissions.length} permission{agent.permissions.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  {/* ── Tab bar ───────────────────────────────────────────────── */}
                  <div className="flex gap-1 px-7 pt-4 pb-0 border-b border-white/[0.06] flex-shrink-0">
                    {[{ key: 'token', label: 'JWT Token' }, { key: 'payload', label: 'Decoded Payload' }].map(t => (
                      <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-colors relative
                          ${activeTab === t.key ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        {t.label}
                        {activeTab === t.key && (
                          <motion.div
                            layoutId="tab-underline"
                            className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-400 rounded-full"
                          />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* ── Scrollable body ───────────────────────────────────────── */}
                  <div className="flex-1 overflow-y-auto no-scrollbar px-7 py-6 space-y-5">
                    <AnimatePresence mode="wait">

                      {/* Token tab */}
                      {activeTab === 'token' && (
                        <motion.div
                          key="token"
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-5"
                        >
                          {/* JWT colour legend */}
                          <div className="flex items-center gap-4 text-xs font-semibold">
                            <span className="flex items-center gap-1.5 text-rose-400"><span className="w-2.5 h-2.5 rounded-sm bg-rose-500 opacity-80" />Header</span>
                            <span className="flex items-center gap-1.5 text-amber-300"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400 opacity-80" />Payload</span>
                            <span className="flex items-center gap-1.5 text-sky-400"><span className="w-2.5 h-2.5 rounded-sm bg-sky-500 opacity-80" />Signature</span>
                          </div>

                          {/* Token viewer */}
                          <TokenDisplay token={agent.token} revealed={revealed} />

                          {/* Reveal toggle */}
                          <button
                            onClick={() => setRevealed(v => !v)}
                            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
                          >
                            {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {revealed ? 'Mask token' : 'Reveal full token'}
                          </button>

                          {/* Metadata grid */}
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { label: 'Issued',   icon: Calendar, value: formatDate(agent.createdAt) },
                              { label: 'Expires',  icon: Calendar, value: formatDate(agent.expiresAt) },
                              { label: 'Issuer',   icon: Shield,   value: 'aipassport.io' },
                              { label: 'Token ID', icon: Key,      value: agent.token.slice(-12) },
                            ].map(({ label, icon: Icon, value }) => (
                              <div key={label} className="bg-slate-900/50 rounded-2xl p-4 border border-white/[0.06] space-y-1.5">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                  <Icon className="w-3 h-3" />
                                  {label}
                                </div>
                                <p className="text-sm font-medium text-slate-200 font-mono truncate">{value}</p>
                              </div>
                            ))}
                          </div>

                          {/* Permissions */}
                          <div className="bg-slate-900/40 rounded-2xl p-4 border border-white/[0.06]">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                              <Lock className="w-3 h-3" /> Granted Permissions
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {agent.permissions.map(p => (
                                <PermissionBadge key={p} permission={p} />
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Payload tab */}
                      {activeTab === 'payload' && (
                        <motion.div
                          key="payload"
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -8 }}
                          transition={{ duration: 0.2 }}
                        >
                          <PayloadCard agent={agent} />
                        </motion.div>
                      )}

                    </AnimatePresence>
                  </div>

                  {/* ── Footer actions ────────────────────────────────────────── */}
                  <div className="px-7 py-5 border-t border-white/10 flex items-center gap-3 bg-slate-900/30 flex-shrink-0">
                    <button
                      onClick={handleCopy}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all
                        ${copied
                          ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:shadow-[0_0_28px_rgba(99,102,241,0.4)]'}`}
                    >
                      {copied
                        ? <><CheckCircle2 className="w-4 h-4" /> Copied!</>
                        : <><Copy className="w-4 h-4" /> Copy Token</>}
                    </button>

                    <button
                      onClick={handleDownload}
                      className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-sm
                        border border-white/10 hover:border-white/20 text-slate-300 hover:text-white
                        hover:bg-white/5 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
