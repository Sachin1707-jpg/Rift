import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Fingerprint, Key, Globe, 
  ShieldCheck, CheckCircle2, Activity, LayoutDashboard,
  Check
} from 'lucide-react';
import { AgentContext } from '../../context/AgentContext';
import { AuthContext }  from '../../context/AuthContext';

export const DemoFlow = () => {
  const { agents, logs } = useContext(AgentContext);
  const { user } = useContext(AuthContext);

  const hasAgents = agents.length > 0;
  const hasLogs   = logs.length > 0;

  // Define steps and their computed state
  const steps = [
    { id: 1, label: 'User Login',        icon: User,            status: 'completed' },
    { id: 2, label: 'Create Agent',      icon: Fingerprint,     status: hasAgents ? 'completed' : 'active' },
    { id: 3, label: 'Issue JWT',         icon: Key,             status: hasAgents ? 'completed' : 'pending' },
    { id: 4, label: 'Launch Store',      icon: Globe,           status: hasLogs ? 'completed' : (hasAgents ? 'active' : 'pending') },
    { id: 5, label: 'Verify Request',    icon: ShieldCheck,     status: hasLogs ? 'completed' : 'pending' },
    { id: 6, label: 'Approve/Deny',      icon: CheckCircle2,    status: hasLogs ? 'completed' : 'pending' },
    { id: 7, label: 'Activity Log',      icon: Activity,        status: hasLogs ? 'completed' : 'pending' },
    { id: 8, label: 'Update Dashboard',  icon: LayoutDashboard, status: hasLogs ? 'completed' : 'pending' },
  ];

  return (
    <section className="mb-10 bg-slate-900/40 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md overflow-hidden relative">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-32 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            AI Passport Architecture Flow
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Live visualization of the authentication and permission lifecycle.
          </p>
        </div>
        
        <div className="flex gap-4 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> Completed</span>
          <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse" /> Next Step</span>
          <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-700" /> Pending</span>
        </div>
      </div>

      <div className="relative z-10 w-full overflow-x-auto no-scrollbar pb-6 pt-2 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="min-w-[900px] flex items-center justify-between relative">
          
          {/* Connecting Track */}
          <div className="absolute top-6 left-6 right-6 h-1 bg-slate-800 rounded-full overflow-hidden">
            {/* Animated progress bar */}
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500"
              initial={{ width: '0%' }}
              animate={{ width: hasLogs ? '100%' : (hasAgents ? '40%' : '10%') }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            />
          </div>

          {/* Nodes */}
          {steps.map((step, i) => {
            const isCompleted = step.status === 'completed';
            const isActive    = step.status === 'active';
            const isPending   = step.status === 'pending';

            return (
              <div key={step.id} className="relative flex flex-col items-center gap-4 w-24">
                {/* Node Icon */}
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center z-10 transition-all duration-500 border-2
                    ${isCompleted ? 'bg-slate-900 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : ''}
                    ${isActive    ? 'bg-blue-500 border-blue-400 text-white shadow-[0_0_30px_rgba(59,130,246,0.4)] ring-4 ring-blue-500/20' : ''}
                    ${isPending   ? 'bg-slate-900 border-slate-700 text-slate-600' : ''}
                  `}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                </motion.div>

                {/* Pulsing indicator for active step */}
                {isActive && (
                  <div className="absolute top-0 w-12 h-12 rounded-2xl border-2 border-blue-400 animate-ping opacity-20 pointer-events-none" />
                )}

                {/* Label */}
                <div className="text-center">
                  <p className={`text-xs font-bold whitespace-nowrap mb-1
                    ${isCompleted ? 'text-emerald-400' : ''}
                    ${isActive    ? 'text-white' : ''}
                    ${isPending   ? 'text-slate-500' : ''}
                  `}>
                    {step.label}
                  </p>
                  
                  {/* Small helper text depending on state */}
                  {isActive && step.id === 2 && (
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-blue-400 font-semibold w-max bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                      Action Required
                    </span>
                  )}
                  {isActive && step.id === 4 && (
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-blue-400 font-semibold w-max bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                      Launch Agent
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
