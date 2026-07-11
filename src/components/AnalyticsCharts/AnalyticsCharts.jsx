import React, { useContext, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar, AreaChart, Area,
} from 'recharts';
import { AgentContext } from '../../context/AgentContext';
import { TrendingUp } from 'lucide-react';

// Aggregates real log data into chart-friendly shapes
function buildRequestsOverTime(logs) {
  const buckets = {};
  logs.forEach(log => {
    const t = new Date(log.timestamp);
    const key = `${t.getHours().toString().padStart(2,'0')}:${Math.floor(t.getMinutes()/15)*15}`.padEnd(5,'0');
    if (!buckets[key]) buckets[key] = { time: key, approved: 0, denied: 0 };
    if (log.status === 'Approved') buckets[key].approved++;
    if (log.status === 'Denied') buckets[key].denied++;
  });
  const sorted = Object.values(buckets).sort((a,b)=>a.time.localeCompare(b.time));
  return sorted;
}

function buildApprovalData(logs) {
  const approved = logs.filter(l=>l.status==='Approved').length;
  const denied   = logs.filter(l=>l.status==='Denied').length;
  if (!approved && !denied) return [];
  return [
    { name: 'Approved', value: approved },
    { name: 'Denied',   value: denied  },
  ];
}

function buildPermissionData(logs) {
  const counts = { Browse: 0, Post: 0, Purchase: 0 };
  logs.forEach(l => { if (counts[l.action] !== undefined) counts[l.action]++; });
  const total = Object.values(counts).reduce((a,b)=>a+b,0);
  if (!total) return [];
  return Object.entries(counts).map(([name, count])=>({ name, count }));
}

const COLORS = { Approved: '#10B981', Denied: '#EF4444' };
const PIE_COLORS = ['#10B981', '#EF4444'];

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderRadius: '12px',
    color: '#f8fafc',
    fontSize: '13px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
  itemStyle: { color: '#94a3b8' },
  cursor: { stroke: '#334155' },
};

const ChartCard = ({ title, children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={`bg-[#1E293B]/70 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-xl group ${className}`}
  >
    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-6">{title}</h3>
    {children}
    <div className="absolute -bottom-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-[0.06] group-hover:opacity-[0.12] transition-opacity bg-blue-500 pointer-events-none" />
  </motion.div>
);

export const AnalyticsCharts = () => {
  const { logs } = useContext(AgentContext);

  const requestsData   = useMemo(() => buildRequestsOverTime(logs), [logs]);
  const approvalData   = useMemo(() => buildApprovalData(logs),     [logs]);
  const permissionData = useMemo(() => buildPermissionData(logs),   [logs]);

  const totalRequests = approvalData.reduce((a,b)=>a+b.value, 0);
  const approvalRate  = totalRequests
    ? Math.round((approvalData.find(d=>d.name==='Approved')?.value||0) / totalRequests * 100)
    : 0;

  return (
    <section className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white tracking-tight">Analytics</h2>
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
          <TrendingUp className="w-3.5 h-3.5" />
          Live data
        </div>
      </div>

      {/* Row 1: Area line (2/3) + Pie (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Area Chart */}
        <ChartCard title="Requests Over Time" delay={0.1} className="lg:col-span-2">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={requestsData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="approvedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="deniedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="approved" stroke="#10B981" strokeWidth={2.5} fill="url(#approvedGrad)"
                  dot={false} activeDot={{ r: 5, fill: '#10B981', stroke: '#0F172A', strokeWidth: 2 }} name="Approved" />
                <Area type="monotone" dataKey="denied"   stroke="#EF4444" strokeWidth={2.5} fill="url(#deniedGrad)"
                  dot={false} activeDot={{ r: 5, fill: '#EF4444', stroke: '#0F172A', strokeWidth: 2 }} name="Denied" />
                <Legend verticalAlign="top" align="right" iconType="circle"
                  wrapperStyle={{ fontSize: '11px', color: '#94a3b8', paddingBottom: '8px' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Donut Pie */}
        <ChartCard title="Approval Rate" delay={0.15}>
          <div className="relative h-56 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={approvalData} cx="50%" cy="45%" innerRadius={62} outerRadius={82}
                  paddingAngle={4} dataKey="value" stroke="none" startAngle={90} endAngle={-270}>
                  {approvalData.map((entry, i) => (
                    <Cell key={`c-${i}`} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            {/* Centre label */}
            <div className="absolute flex flex-col items-center pointer-events-none" style={{ top: '43%', transform: 'translateY(-50%)' }}>
              <span className="text-3xl font-extrabold text-white">{approvalRate}%</span>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Approved</span>
            </div>
            {/* Legend */}
            <div className="flex gap-4 mt-2">
              {approvalData.map((d,i)=>(
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                  {d.name} <span className="text-slate-200 font-semibold">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Row 2: Bar chart (full width) */}
      <ChartCard title="Permission Usage Breakdown" delay={0.2}>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={permissionData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="browseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#0d9488" />
                </linearGradient>
                <linearGradient id="postGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
                <linearGradient id="purchaseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip {...TOOLTIP_STYLE} cursor={{ fill: '#ffffff08' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={72}>
                {permissionData.map((entry, i) => {
                  const fills = ['url(#browseGrad)', 'url(#postGrad)', 'url(#purchaseGrad)'];
                  return <Cell key={`c-${i}`} fill={fills[i % fills.length]} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </section>
  );
};
