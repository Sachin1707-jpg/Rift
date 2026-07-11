import React, { useContext } from 'react';
import { Navbar }        from '../../components/Navbar/Navbar';
import { ActivityTable } from '../../components/ActivityTable/ActivityTable';
import { AgentContext }  from '../../context/AgentContext';
import { EmptyState }    from '../../components/EmptyState/EmptyState';
import { Activity, Rocket } from 'lucide-react';
import { useNavigate }   from 'react-router-dom';

export const Logs = () => {
  const { logs, agents } = useContext(AgentContext);
  const navigate = useNavigate();

  const totalApproved = logs.filter(l => l.status.toLowerCase() === 'approved').length;
  const totalDenied   = logs.filter(l => l.status.toLowerCase() === 'denied').length;

  return (
    <div className="min-h-screen bg-mock-bg flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-[1180px] mx-auto px-[24px] pb-[80px]">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="flex items-end justify-between mt-[32px] mb-[20px]">
          <div>
            <h1 className="font-space text-[26px] font-semibold text-mock-text">Activity Log</h1>
            <div className="text-mock-text-dim text-[13px] mt-[4px]">
              {logs.length} events · {totalApproved} approved · {totalDenied} denied
            </div>
          </div>
        </div>

        {/* ── Stats row ───────────────────────────────────────────────────── */}
        {logs.length > 0 && (
          <div className="grid grid-cols-3 gap-[12px] mb-[24px]">
            {[
              { label: 'Total Events', value: logs.length,   color: 'text-mock-text' },
              { label: 'Approved',     value: totalApproved, color: 'text-mock-accent' },
              { label: 'Denied',       value: totalDenied,   color: 'text-mock-danger' },
            ].map(s => (
              <div
                key={s.label}
                className="bg-mock-panel border border-mock-border rounded-[12px] px-[18px] py-[14px] flex items-center justify-between"
              >
                <span className="font-mono text-[11px] text-mock-grey uppercase tracking-[0.05em]">{s.label}</span>
                <span className={`font-space text-[22px] font-bold ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>
        )}


        {/* ── Table ───────────────────────────────────────────────────────── */}
        <ActivityTable />

      </main>
    </div>
  );
};
