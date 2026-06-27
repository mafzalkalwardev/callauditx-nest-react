import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  UploadCloud, 
  FolderHeart, 
  HelpCircle, 
  Disc, 
  TrendingUp, 
  DollarSign, 
  Settings, 
  Users, 
  AlertTriangle,
  FileAudio
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  const clientLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/uploads', label: 'Upload Calls', icon: UploadCloud },
    { to: '/categories', label: 'Categories', icon: FolderHeart },
    { to: '/questions', label: 'Review Questions', icon: HelpCircle },
    { to: '/reviews', label: 'AI Reviews', icon: Disc },
    { to: '/analytics', label: 'Analytics', icon: TrendingUp },
    { to: '/earnings', label: 'Earnings & Payout', icon: DollarSign },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Panel', icon: LayoutDashboard },
    { to: '/admin/clients', label: 'Client Manager', icon: Users },
    { to: '/admin/uploads', label: 'All Uploads', icon: UploadCloud },
    { to: '/admin/reviews', label: 'All AI Reviews', icon: Disc },
    { to: '/admin/accuracy', label: 'Accuracy Track', icon: TrendingUp },
    { to: '/admin/earnings', label: 'Global Earnings', icon: DollarSign },
    { to: '/admin/failed-reviews', label: 'Failed Reviews', icon: AlertTriangle },
    { to: '/admin/settings', label: 'System Settings', icon: Settings },
  ];

  const links = user.role === 'ADMIN' ? adminLinks : clientLinks;

  return (
    <aside className="w-64 h-screen fixed top-0 left-0 bg-darkSidebar border-r border-slate-800 text-slate-300 flex flex-col z-30 transition-all duration-300">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20">
          <FileAudio className="w-6 h-6 animate-pulse-slow" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg text-white tracking-wide bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            CallAuditX
          </h1>
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            {user.role} PORTAL
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/15'
                    : 'hover:bg-slate-800/60 hover:text-white text-slate-400'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/60">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-400">User: {user.name}</span>
          </div>
          <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full w-max">
            Active
          </span>
        </div>
      </div>
    </aside>
  );
};
