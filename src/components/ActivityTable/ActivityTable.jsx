import React, { useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgentContext }  from '../../context/AgentContext';
import { EmptyState }    from '../EmptyState/EmptyState';
import { Activity, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formatTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
};

export const ActivityTable = () => {
  const { logs, agents } = useContext(AgentContext);
  const navigate = useNavigate();
  const [displayedLogs, setDisplayedLogs] = useState([]);

  useEffect(() => {
    setDisplayedLogs(logs);
  }, [logs]);

  const getAgentDenialCount = (agentId) =>
    logs.filter(l => l.agentId === agentId && l.status === 'Denied').length;

  if (logs.length === 0) {
    const hasAgents = agents.length > 0;
    return (
      <EmptyState
        icon={Activity}
        gradient="from-violet-500 to-purple-700"
        glow="bg-violet-500"
        title="No activity recorded yet"
        subtitle={
          hasAgents
            ? "Your agents haven't made any requests yet. Launch an agent into the Storefront to start recording permission checks."
            : "You haven't created any agents yet. Start by issuing a passport from the Dashboard."
        }
        action={
          hasAgents
            ? { label: 'Go to Dashboard', onClick: () => navigate('/dashboard'), icon: Rocket }
            : { label: 'Go to Dashboard', onClick: () => navigate('/dashboard'), icon: Rocket }
        }
      />
    );
  }

  return (
    <div className="bg-mock-panel border border-mock-border rounded-[14px] overflow-hidden">

      {/* Header row */}
      <div className="grid grid-cols-[1.4fr_1fr_1fr_1.8fr_0.9fr] px-[18px] py-[11px] border-b border-mock-border">
        {['Agent', 'Action', 'Result', 'Reason', 'Time'].map(col => (
          <span key={col} className="font-mono text-[10px] text-mock-grey uppercase tracking-[0.07em]">
            {col}
          </span>
        ))}
      </div>

      {/* Body */}
      <div className="flex flex-col divide-y divide-mock-border">
        <AnimatePresence initial={false}>
          {displayedLogs.map((log) => {
            const isSuspicious = getAgentDenialCount(log.agentId) >= 2;
            const isApproved   = log.status.toLowerCase() === 'approved';

            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`grid grid-cols-[1.4fr_1fr_1fr_1.8fr_0.9fr] px-[18px] py-[14px] items-center
                  hover:bg-white/[0.018] transition-colors
                  ${isSuspicious ? 'bg-[rgba(245,192,92,0.04)]' : ''}`}
              >
                {/* Agent */}
                <span className="flex items-center gap-[8px]">
                  <span className="text-[13px] font-medium text-mock-text leading-none">
                    {log.agentName}
                  </span>
                  {isSuspicious && (
                    <span className="font-mono text-[9.5px] text-mock-warn tracking-wider">
                      ⚠ flagged
                    </span>
                  )}
                </span>

                {/* Action */}
                <span className="text-[13px] text-mock-text-dim lowercase">
                  {log.action}
                </span>

                {/* Result badge */}
                <span>
                  <span className={`inline-block font-mono text-[10.5px] font-semibold px-[9px] py-[3px] rounded-[5px] lowercase
                    ${isApproved
                      ? 'bg-mock-accent-dim text-mock-accent'
                      : 'bg-mock-danger-dim text-mock-danger'
                    }`}
                  >
                    {log.status.toLowerCase()}
                  </span>
                </span>

                {/* Reason */}
                <span className="text-[12px] text-mock-text-dim">
                  {log.reason || '—'}
                </span>

                {/* Time */}
                <span className="font-mono text-[11.5px] text-mock-grey">
                  {formatTime(log.timestamp)}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
