import React from 'react';
import { cn } from '../../utils/helpers';
import { CheckCircle2, XCircle, AlertTriangle, Clock, Ban } from 'lucide-react';

const statusConfig = {
  Active: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', icon: CheckCircle2 },
  Expired: { color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20', icon: Clock },
  Revoked: { color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20', icon: Ban },
  Suspicious: { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', icon: AlertTriangle },
  Approved: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', icon: CheckCircle2 },
  Denied: { color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20', icon: XCircle },
};

export const StatusBadge = ({ status, className }) => {
  const config = statusConfig[status] || { color: 'text-slate-400', bg: 'bg-slate-800', border: 'border-slate-700', icon: Clock };
  const Icon = config.icon;

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-sm",
      config.color,
      config.bg,
      config.border,
      className
    )}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </div>
  );
};
