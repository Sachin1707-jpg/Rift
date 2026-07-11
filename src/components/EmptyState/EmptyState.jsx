import React from 'react';
import { motion } from 'framer-motion';

/**
 * Reusable EmptyState component
 *
 * Props:
 *   icon       – React component (lucide icon)
 *   gradient   – Tailwind gradient classes for the icon halo, e.g. 'from-blue-500 to-indigo-600'
 *   glow       – Tailwind shadow/glow colour on the icon blob, e.g. 'bg-blue-500/20'
 *   title      – Main heading
 *   subtitle   – Secondary description paragraph
 *   action     – { label, onClick, icon }  primary CTA button
 *   secondaryAction – { label, onClick }   ghost secondary button (optional)
 *   hint       – small helper text below buttons (optional)
 *   floatingOrbs – whether to show decorative background orbs (default true)
 */
export const EmptyState = ({
  icon: Icon,
  gradient    = 'from-blue-500 to-indigo-600',
  glow        = 'bg-blue-500',
  title,
  subtitle,
  action,
  secondaryAction,
  hint,
  floatingOrbs = true,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="relative flex flex-col items-center justify-center py-20 px-6 text-center overflow-hidden rounded-3xl border border-white/[0.06] bg-slate-900/30"
    >
      {/* Decorative ambient orbs */}
      {floatingOrbs && (
        <>
          <div className={`absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl opacity-[0.07] ${glow}`} />
          <div className={`absolute -bottom-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-[0.07] ${glow}`} />
        </>
      )}

      {/* Icon blob */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1, type: 'spring', stiffness: 180 }}
        className="relative mb-8"
      >
        {/* Outer glow ring */}
        <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${gradient} opacity-20 scale-125 blur-xl`} />
        {/* Icon container */}
        <div className={`relative w-24 h-24 rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-2xl`}>
          <Icon className="w-11 h-11 text-white drop-shadow-lg" strokeWidth={1.5} />
        </div>
        {/* Shine overlay */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
      </motion.div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="max-w-sm space-y-3 mb-8"
      >
        <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
        {subtitle && (
          <p className="text-sm text-slate-400 leading-relaxed">{subtitle}</p>
        )}
      </motion.div>

      {/* Actions */}
      {(action || secondaryAction) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          {action && (
            <button
              onClick={action.onClick}
              className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white
                bg-gradient-to-r ${gradient} shadow-lg transition-all duration-200
                hover:shadow-[0_0_28px_rgba(99,102,241,0.45)] hover:scale-105 active:scale-95`}
            >
              {action.icon && <action.icon className="w-4 h-4" />}
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm text-slate-300
                border border-white/10 hover:border-white/20 hover:bg-white/5 hover:text-white
                transition-all duration-200 active:scale-95"
            >
              {secondaryAction.icon && <secondaryAction.icon className="w-4 h-4" />}
              {secondaryAction.label}
            </button>
          )}
        </motion.div>
      )}

      {/* Hint text */}
      {hint && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-xs text-slate-600 max-w-xs leading-relaxed"
        >
          {hint}
        </motion.p>
      )}
    </motion.div>
  );
};
