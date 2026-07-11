import React, { useContext } from 'react';
import { AuthContext }       from '../../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Activity, LogOut } from 'lucide-react';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard',     icon: LayoutGrid },
  { to: '/logs',      label: 'Activity Log',  icon: Activity   },
];

export const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <div className="pt-[32px] px-[24px] max-w-[1180px] mx-auto w-full">

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-[20px] py-[13px] bg-mock-panel border border-mock-border rounded-t-[14px] border-b-0">

        {/* Brand */}
        <div className="flex items-center gap-[10px]">
          <div className="w-[28px] h-[28px] rounded-[7px] bg-gradient-to-br from-mock-accent to-[#2A9D7D] flex items-center justify-center font-space font-bold text-[#08110D] text-[14px]">
            A
          </div>
          <div className="font-space font-semibold text-[15px] tracking-[-0.01em] text-mock-text">
            AI Passport
          </div>
        </div>

        {/* User chip */}
        {user && (
          <div className="flex items-center gap-[10px]">
            <div className="text-[12px] text-mock-text-dim leading-[1.3] text-right">
              <b className="text-mock-text font-medium block">{user.name}</b>
              {user.email}
            </div>
            <div className="w-[28px] h-[28px] rounded-full bg-mock-scope-post flex items-center justify-center font-space font-semibold text-[11px] text-[#1a0f24]">
              {initials}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-[6px] text-[12px] text-mock-text-dim border border-mock-border px-[10px] py-[5px] rounded-[7px] cursor-pointer hover:bg-white/5 hover:text-mock-text transition-colors"
            >
              <LogOut className="w-[12px] h-[12px]" />
              Log out
            </button>
          </div>
        )}
      </div>

      {/* ── Nav tab bar ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-[2px] px-[12px] bg-mock-panel border border-mock-border rounded-b-[14px] border-t border-t-mock-border">
        {NAV_LINKS.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname === to ||
            (to === '/dashboard' && location.pathname.startsWith('/dashboard'));
          return (
            <Link
              key={to}
              to={to}
              className={`relative flex items-center gap-[7px] px-[14px] py-[11px] text-[12.5px] font-medium transition-colors
                ${isActive
                  ? 'text-mock-accent'
                  : 'text-mock-text-dim hover:text-mock-text'
                }`}
            >
              <Icon className="w-[13px] h-[13px]" />
              {label}
              {/* active underline */}
              {isActive && (
                <span className="absolute bottom-0 left-[14px] right-[14px] h-[2px] bg-mock-accent rounded-full" />
              )}
            </Link>
          );
        })}
      </div>

    </div>
  );
};
