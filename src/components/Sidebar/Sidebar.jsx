import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Activity, Settings, ChevronRight, Zap } from 'lucide-react';
import { cn } from '../../utils/helpers';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Activity,        label: 'Activity Logs', path: '/logs' },
];

export const Sidebar = ({ isMobileOpen, onMobileClose }) => {
  const location = useLocation();

  const content = (
    <div className="flex flex-col h-full">
      <div className="flex-1 py-6 px-3 space-y-1">
        <p className="px-4 text-[10px] font-bold text-slate-600 uppercase tracking-[0.12em] mb-4">Navigation</p>

        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            onClick={onMobileClose}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium group relative',
              isActive
                ? 'bg-blue-500/10 text-blue-400'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-400 rounded-r-full" />
                )}
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Bottom hint card */}
      <div className="p-3 mb-2">
        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-blue-300">Pro Tip</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Issue an agent, then click Launch Agent to test live permission verification.
          </p>
        </div>
      </div>

      <div className="p-3 border-t border-white/10">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium">
          <Settings className="w-5 h-5" />
          Settings
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-white/10 bg-[#0F172A]/50 hidden md:flex flex-col h-[calc(100vh-4rem)] sticky top-16">
        {content}
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden"
            onClick={onMobileClose}
          />
          <aside className="fixed top-0 left-0 h-full w-64 z-50 bg-[#0F172A] border-r border-white/10 flex flex-col md:hidden shadow-2xl">
            {content}
          </aside>
        </>
      )}
    </>
  );
};
