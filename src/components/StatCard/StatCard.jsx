import React from 'react';
import { motion } from 'framer-motion';

const gradientMap = {
  'text-blue-400':    'from-blue-500 to-indigo-600',
  'text-emerald-400': 'from-emerald-500 to-teal-600',
  'text-rose-400':    'from-rose-500 to-pink-600',
  'text-slate-400':   'from-slate-500 to-slate-700',
  'text-orange-400':  'from-orange-500 to-amber-600',
  'text-purple-400':  'from-violet-500 to-purple-700',
};

const getGradient = (colorClass = '') => {
  for (const [key, val] of Object.entries(gradientMap)) {
    if (colorClass.includes(key)) return val;
  }
  return 'from-blue-500 to-indigo-600';
};

export const StatCard = ({ title, value, icon: Icon, trend, trendDown, colorClass = 'text-blue-400', delay = 0 }) => {
  const gradient = getGradient(colorClass);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative rounded-2xl p-5 overflow-hidden cursor-default
        bg-[#1E293B]/70 backdrop-blur-xl border border-white/10 shadow-xl
        group transition-shadow duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
    >
      {/* Subtle top gradient border */}
      <div className={`absolute inset-x-0 top-0 h-[2px] rounded-t-2xl bg-gradient-to-r ${gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />

      <div className="flex justify-between items-start relative z-10">
        <div className="flex-1 min-w-0">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-white tracking-tight leading-none">{value}</h3>

          {trend && !trendDown && (
            <p className="text-xs text-emerald-400 mt-2.5 flex items-center gap-1 font-medium">
              <span className="text-base leading-none">↑</span> {trend} this week
            </p>
          )}
          {trend && trendDown && (
            <p className="text-xs text-rose-400 mt-2.5 flex items-center gap-1 font-medium">
              <span className="text-base leading-none">↓</span> {trend} this week
            </p>
          )}
          {!trend && <div className="mt-2.5 h-4" />}
        </div>

        {/* Gradient Icon Box */}
        <div className={`flex-shrink-0 ml-4 w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Decorative gradient glow */}
      <div className={`absolute -bottom-8 -right-8 w-28 h-28 rounded-full blur-3xl opacity-10 group-hover:opacity-25 transition-opacity bg-gradient-to-br ${gradient}`} />
    </motion.div>
  );
};
