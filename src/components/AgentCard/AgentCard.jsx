import React, { useState, useContext } from 'react';
import { PermissionBadge } from '../PermissionBadge/PermissionBadge';
import { useCountdown }    from '../../hooks/useCountdown';
import { AgentContext }    from '../../context/AgentContext';
import { TokenModal }      from '../TokenModal/TokenModal';
import { Link }            from 'react-router-dom';
import { Trash2 }          from 'lucide-react';
import toast               from 'react-hot-toast';

export const AgentCard = ({ agent, onClick }) => {
  const { updateAgentStatus, addLog, removeAgent } = useContext(AgentContext);
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleExpire = () => {
    if (agent.status === 'Active') {
      updateAgentStatus(agent.id, 'Expired');
      toast(`${agent.name} has expired.`, { icon: '⏰' });
    }
  };

  const { formattedTime } = useCountdown(agent.expiresAt, handleExpire);

  const isActive = agent.status === 'Active';

  const handleRevoke = (e) => {
    e.stopPropagation();
    if (!isActive) return;
    updateAgentStatus(agent.id, 'Revoked');
    addLog({
      agentId:   agent.id,
      agentName: agent.name,
      action:    'Access Revoked',
      status:    'Denied',
      reason:    'Agent revoked by user',
    });
    toast.success(`${agent.name} access revoked.`);
  };

  const handleViewToken = (e) => {
    e.stopPropagation();
    setTokenModalOpen(true);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000); // auto-reset after 3s
      return;
    }
    removeAgent(agent.id);
    toast(`${agent.name} deleted.`, { icon: '🗑️' });
  };

  const handleLaunch = (e) => {
    e.stopPropagation();
    if (!isActive) {
      e.preventDefault();
      return;
    }
    // Add success log when launching
    addLog({
      agentId:   agent.id,
      agentName: agent.name,
      action:    'connection established',
      status:    'approved',
      reason:    'Valid Token',
    });
  };

  const topBarColor = {
    Active:     'bg-mock-accent',
    Revoked:    'bg-mock-danger',
    Expired:    'bg-mock-grey',
    Suspicious: 'bg-mock-warn',
  };

  const pillColor = {
    Active:     'bg-mock-accent-dim text-mock-accent',
    Revoked:    'bg-mock-danger-dim text-mock-danger',
    Expired:    'bg-mock-grey-dim text-mock-grey',
    Suspicious: 'bg-mock-warn-dim text-mock-warn',
  };

  return (
    <>
      <div
        onClick={onClick}
        className="relative bg-mock-panel border border-mock-border rounded-[18px] p-[26px] overflow-hidden cursor-pointer hover:bg-mock-panel2 transition-colors flex flex-col gap-[18px]"
      >
        {/* Colored top border */}
        <div className={`absolute top-0 left-0 right-0 h-[3px] ${topBarColor[agent.status] ?? 'bg-mock-grey'}`} />

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-[6px]">
            <div className="font-space font-semibold text-[18px] text-mock-text leading-tight">
              {agent.name}
            </div>
            <div className="font-mono text-[11px] text-mock-grey flex items-center gap-[6px]">
              {agent.id.slice(0, 14)}...
              <span
                onClick={handleViewToken}
                className="underline text-mock-text-dim hover:text-mock-text cursor-pointer text-[10px]"
              >
                View Token
              </span>
            </div>
          </div>
          <div className={`font-mono text-[11px] font-semibold tracking-[0.06em] px-[11px] py-[5px] rounded-[20px] uppercase ${pillColor[agent.status] ?? 'bg-mock-grey-dim text-mock-grey'}`}>
            {agent.status}
          </div>
        </div>

        {/* ── Purpose ────────────────────────────────────────────── */}
        <div className="text-[13.5px] text-mock-text-dim leading-[1.6] min-h-[40px]">
          {agent.purpose}
        </div>

        {/* ── Permission badges ──────────────────────────────────── */}
        <div className="flex gap-[8px] flex-wrap">
          {agent.permissions.map(p => (
            <PermissionBadge key={p} permission={p} />
          ))}
        </div>

        {/* ── Expiry row ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-[4px] border-t border-mock-border">
          <span className="text-[12px] text-mock-grey font-mono">
            {agent.status === 'Revoked' ? 'Revoked' : 'Expires in'}
          </span>
          <span className={`font-mono text-[15px] font-bold tracking-wider
            ${agent.status === 'Revoked' ? 'text-mock-grey' : 'text-mock-text'}`}
          >
            {agent.status === 'Revoked' ? '— : —' : formattedTime}
          </span>
        </div>

        {/* ── Action buttons ─────────────────────────────────────── */}
        <div className="flex gap-[10px]">
          {/* Delete button */}
          <button
            onClick={handleDelete}
            title={confirmDelete ? 'Click again to confirm delete' : 'Delete agent'}
            className={`py-[11px] px-[14px] rounded-[10px] text-[13px] font-medium border transition-colors flex items-center gap-[5px]
              ${ confirmDelete
                ? 'border-red-500 bg-red-500/10 text-red-400 cursor-pointer'
                : 'border-mock-border text-mock-grey hover:border-red-500/50 hover:text-red-400 cursor-pointer'
              }`}
          >
            <Trash2 size={13} />
            {confirmDelete ? 'Confirm?' : ''}
          </button>

          <button
            onClick={handleRevoke}
            disabled={!isActive}
            className={`flex-1 py-[11px] rounded-[10px] text-[13px] font-medium border border-mock-border transition-colors
              ${isActive
                ? 'text-mock-text-dim hover:bg-white/5 hover:text-mock-text cursor-pointer'
                : 'text-mock-grey opacity-40 cursor-not-allowed'
              }`}
          >
            Revoke
          </button>

          <div className={`flex-1 relative rounded-[10px] text-[13px] font-medium border border-mock-border transition-colors
            ${isActive
              ? 'bg-mock-panel2 text-mock-text hover:bg-mock-border cursor-pointer'
              : 'bg-mock-panel2 text-mock-grey opacity-40 cursor-not-allowed'
            }`}
          >
            {isActive && agent.websites && agent.websites.length > 0 ? (
              /* Open real website in new tab */
              <a
                href={`https://${agent.websites[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLaunch}
                className="absolute inset-0 flex items-center justify-center py-[11px] gap-[6px]"
              >
                Launch Agent →
              </a>
            ) : (
              /* Fallback to mock storefront */
              <Link
                to={isActive ? `/store/${agent.id}` : '#'}
                onClick={handleLaunch}
                className="absolute inset-0 flex items-center justify-center py-[11px]"
              >
                Launch Agent →
              </Link>
            )}
          </div>
        </div>
      </div>

      <TokenModal
        agent={agent}
        isOpen={tokenModalOpen}
        onClose={() => setTokenModalOpen(false)}
      />
    </>
  );
};
