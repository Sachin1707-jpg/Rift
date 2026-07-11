import React, { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, RefreshCw, ShieldAlert, Shield, Clock, Calendar, Activity, Fingerprint, User, KeyRound } from 'lucide-react';
import { StatusBadge }    from '../StatusBadge/StatusBadge';
import { PermissionBadge } from '../PermissionBadge/PermissionBadge';
import { useCountdown }   from '../../hooks/useCountdown';
import { AgentContext }   from '../../context/AgentContext';
import { AuthContext }    from '../../context/AuthContext';
import { TokenModal }     from '../TokenModal/TokenModal';
import { DrawerSkeleton } from '../Skeleton/Skeleton';
import { useSimulatedLoading } from '../../hooks/useSimulatedLoading';
import toast              from 'react-hot-toast';
import { Link }           from 'react-router-dom';

const formatDate = (isoString) => {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return date.toLocaleString();
};

export const AgentDrawer = ({ agent, isOpen, onClose }) => {
  const { logs, updateAgentStatus } = useContext(AgentContext);
  const { user } = useContext(AuthContext);
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const isLoading = useSimulatedLoading(700);

  const { formattedTime } = useCountdown(agent?.expiresAt, () => {
    if (agent?.status === 'Active') {
      updateAgentStatus(agent.id, 'Expired');
    }
  });

  const isActive = agent?.status === 'Active';

  const handleCopy = () => {
    if (agent?.token) {
      navigator.clipboard.writeText(agent.token);
      toast.success('Token copied to clipboard');
    }
  };

  const handleRevoke = () => {
    if (agent) {
      updateAgentStatus(agent.id, 'Revoked');
      toast.success(`${agent.name} access revoked.`);
    }
  };

  // Get recent activities for this specific agent
  const recentLogs = logs.filter(l => l.agentId === agent?.id).slice(0, 5);
  
  // Calculate a fake trust score based on denies
  const denials = logs.filter(l => l.agentId === agent?.id && l.status === 'Denied').length;
  const trustScore = Math.max(0, 100 - (denials * 15));
  let trustColor = 'text-emerald-400';
  if (trustScore < 70) trustColor = 'text-amber-400';
  if (trustScore < 40) trustColor = 'text-rose-400';

  return (
    <>
    <AnimatePresence>
      {isOpen && agent && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-[#1E293B]/90 backdrop-blur-2xl border-l border-white/10 z-50 shadow-2xl flex flex-col overflow-hidden"
          >
            {isLoading ? (
              <DrawerSkeleton />
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <Fingerprint className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white leading-tight">{agent.name}</h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{agent.id}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
              
              {/* Status & Trust Score */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-medium">Status</p>
                  <StatusBadge status={agent.status} />
                </div>
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-medium">Trust Score</p>
                  <div className="flex items-end gap-1">
                    <span className={`text-2xl font-bold ${trustColor}`}>{trustScore}</span>
                    <span className="text-slate-500 text-sm mb-1">/100</span>
                  </div>
                </div>
              </div>

              {/* Identity & Purpose */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Owner
                  </p>
                  <p className="text-sm text-slate-200 bg-slate-900/30 px-3 py-2 rounded-lg border border-white/5">
                    {user?.name || 'System Admin'} ({user?.email || 'admin@aipassport.io'})
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" /> Goal / Purpose
                  </p>
                  <p className="text-sm text-slate-200 bg-slate-900/30 px-3 py-2 rounded-lg border border-white/5 italic">
                    "{agent.purpose}"
                  </p>
                </div>
              </div>

              {/* JWT Token */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Access Token
                  </p>
                  <button
                    onClick={() => setTokenModalOpen(true)}
                    className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5" /> View Full
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-950 px-3 py-2.5 rounded-xl border border-white/5 font-mono text-sm text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap">
                    {agent.token.slice(0, 10)}••••••••••••••••{agent.token.slice(-10)}
                  </div>
                  <button 
                    onClick={handleCopy}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-colors border border-white/5"
                    title="Copy Token"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Timing */}
              <div className="bg-slate-900/30 p-4 rounded-2xl border border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Created</span>
                  </div>
                  <span className="text-sm text-slate-200">{formatDate(agent.createdAt)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Expires</span>
                  </div>
                  <span className="text-sm text-slate-200">{formatDate(agent.expiresAt)}</span>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-blue-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Time Remaining</span>
                  </div>
                  <span className="text-lg font-mono font-medium text-white">{formattedTime}</span>
                </div>
              </div>

              {/* Permissions */}
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 font-medium">Granted Permissions</p>
                <div className="flex flex-wrap gap-2">
                  {agent.permissions.map(p => (
                    <PermissionBadge key={p} permission={p} />
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 font-medium">Recent Activity</p>
                {recentLogs.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center gap-3 bg-slate-900/30 border border-white/[0.06] rounded-2xl p-6 text-center"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/20 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-violet-400 opacity-70" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-300">No activity yet</p>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Launch this agent into the Storefront to record permission checks.
                      </p>
                    </div>
                    <Link
                      to={`/store/${agent.id}`}
                      className="mt-1 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                    >
                      Launch agent →
                    </Link>
                  </motion.div>
                ) : (
                  <div className="space-y-2">
                    {recentLogs.map((log) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-slate-900/50 p-3 rounded-xl border border-white/5 flex justify-between items-center hover:border-white/10 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-200">{log.action}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{new Date(log.timestamp).toLocaleTimeString()}</p>
                        </div>
                        <StatusBadge status={log.status} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Actions Footer */}
            <div className="p-6 border-t border-white/10 bg-slate-900/50 flex gap-3">
              <button
                disabled
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all bg-slate-800 text-slate-500 border border-white/5 opacity-70 cursor-not-allowed"
                title="Regeneration is disabled in mock mode"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate Token
              </button>
              <button
                onClick={handleRevoke}
                disabled={!isActive}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all border
                  ${isActive
                    ? 'border-rose-500/30 text-rose-400 hover:bg-rose-500/10'
                    : 'border-slate-800 text-slate-600 pointer-events-none'
                  }
                `}
              >
                <ShieldAlert className="w-4 h-4" />
                Revoke
              </button>
            </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
    
    <TokenModal 
      agent={agent} 
      isOpen={tokenModalOpen} 
      onClose={() => setTokenModalOpen(false)} 
    />
    </>
  );
};
