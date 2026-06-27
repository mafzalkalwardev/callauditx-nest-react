import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { recordingsAPI } from '../services/api';
import { Bell, Sun, Moon, LogOut, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === 'CLIENT') {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000); // pull every 10s
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const data = await recordingsAPI.listNotifications();
      setNotifications(data);
    } catch (e) {
      console.warn("Notifications fetch failed");
    }
  };

  const handleMarkRead = async () => {
    try {
      await recordingsAPI.markNotificationsRead();
      fetchNotifications();
    } catch (e) {
      console.warn(e);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="h-16 fixed top-0 right-0 left-64 bg-slate-900 border-b border-slate-800 text-slate-100 flex items-center justify-between px-8 z-20 transition-all duration-300">
      {/* Title */}
      <div>
        <h2 className="font-semibold text-slate-200">
          Welcome back, <span className="text-blue-400 font-bold">{user?.name || 'User'}</span>
        </h2>
      </div>

      {/* Action controls */}
      <div className="flex items-center gap-4">
        {/* Dark/Light mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-all border border-slate-700/50"
          title="Toggle Theme"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications (Only for Clients) */}
        {user?.role === 'CLIENT' && (
          <div className="relative">
            <button
              onClick={() => setShowNotif(!showNotif)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-all border border-slate-700/50 relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotif && (
              <div className="absolute right-0 mt-3 w-80 bg-slate-800 border border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                  <span className="font-semibold text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkRead}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3.5 border-b border-slate-700/40 text-xs transition-colors ${
                          notif.isRead ? 'bg-slate-800/40 text-slate-400' : 'bg-slate-800/80 text-slate-200'
                        }`}
                      >
                        <p className="leading-relaxed">{notif.message}</p>
                        <span className="text-[10px] text-slate-500 mt-1.5 block">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Badge & Logout */}
        <div className="h-8 w-px bg-slate-800"></div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </header>
  );
};
