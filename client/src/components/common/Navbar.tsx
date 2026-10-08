import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  ShieldAlert,
  MapPin,
  Bell,
  Sparkles,
  Bot,
  UserCheck,
  ChevronDown,
  LogOut,
  Car,
  Wrench,
  Shield,
  X,
  CheckCircle2,
  AlertTriangle,
  User as UserIcon,
  Sun,
  Moon
} from 'lucide-react';

interface NavbarProps {
  onOpenSos: () => void;
  onOpenAiAssistant: () => void;
  onOpenDamageAnalysis: () => void;
  onOpenLogin: () => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSos,
  onOpenAiAssistant,
  onOpenDamageAnalysis,
  onOpenLogin,
  currentTab,
  setCurrentTab
}) => {
  const {
    user,
    role,
    demoUsers,
    switchUser,
    logout,
    notifications,
    unreadNotifCount,
    markNotificationRead,
    activeLocation,
    detectLocation
  } = useAuth();

  const { theme, toggleTheme } = useTheme();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1E2C48] dark:border-[#1E2C48] light:border-[#DCE3ED] bg-[#080D1C]/90 dark:bg-[#080D1C]/90 light:bg-[#F5F7FB]/90 backdrop-blur-md shadow-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-2.5 text-left group transition-transform duration-180 hover:scale-[1.02]"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FFB51B] to-[#FFD166] p-0.5 shadow-md shadow-[#FFB51B]/20">
              <div className="w-full h-full bg-[#080D1C] rounded-[10px] flex items-center justify-center">
                <Wrench className="w-5 h-5 text-[#FFB51B]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-lg tracking-tight text-slate-900 dark:text-[#F1F5F9] light:text-[#172033]">
                  Roadfix
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded bg-[#FFB51B]/15 text-[#FFB51B] border border-[#FFB51B]/30">
                  24/7
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-[#94A3B8] light:text-[#5B6475] hidden sm:block font-medium">
                Emergency Breakdown Assistance
              </p>
            </div>
          </button>

          {/* Location Badge with Cyan GPS Telematics */}
          <button
            onClick={detectLocation}
            title="Click to detect current GPS location"
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111A2E] dark:bg-[#111A2E] light:bg-white border border-[#1E2C48] dark:border-[#1E2C48] light:border-[#DCE3ED] text-xs text-slate-800 dark:text-[#F1F5F9] light:text-[#172033] hover:border-[#38BDF8]/60 transition-all duration-180 max-w-[240px] shadow-sm"
          >
            <MapPin className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
            <span className="truncate text-[11px] font-medium text-slate-300 dark:text-slate-200 light:text-slate-700">{activeLocation.address}</span>
          </button>
        </div>

        {/* Center / Navigation Quick Actions */}
        <div className="flex items-center gap-2">
          {/* AI Vehicle Assistant button */}
          <button
            onClick={onOpenAiAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111A2E] dark:bg-[#111A2E] light:bg-white hover:bg-[#17233D] dark:hover:bg-[#17233D] light:hover:bg-slate-100 text-[#38BDF8] border border-[#1E2C48] dark:border-[#1E2C48] light:border-[#DCE3ED] hover:border-[#38BDF8]/50 text-xs font-semibold shadow-sm transition-all duration-180"
          >
            <Bot className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="hidden sm:inline">AI Vehicle Assistant</span>
            <span className="sm:hidden">AI Helper</span>
          </button>

          {/* AI Damage Visual Scanner */}
          <button
            onClick={onOpenDamageAnalysis}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111A2E] dark:bg-[#111A2E] light:bg-white hover:bg-[#17233D] dark:hover:bg-[#17233D] light:hover:bg-slate-100 text-slate-800 dark:text-[#F1F5F9] light:text-[#172033] border border-[#1E2C48] dark:border-[#1E2C48] light:border-[#DCE3ED] hover:border-[#FFB51B]/50 text-xs font-medium transition-all duration-180 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FFB51B]" />
            <span>AI Damage Scan</span>
          </button>

          {/* Emergency SOS Button (Red reserved exclusively for SOS) */}
          <button
            onClick={onOpenSos}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#DC2626] hover:bg-[#EF4444] text-white text-xs font-extrabold tracking-wide shadow-md shadow-red-600/30 border border-red-500 transition-all duration-180 cursor-pointer active:scale-95"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>SOS</span>
          </button>
        </div>

        {/* Right Section: Theme Toggle, Notifications, 1-Click Role Switcher, Profile */}
        <div className="flex items-center gap-2.5">
          {/* Light / Dark Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl bg-[#111A2E] dark:bg-[#111A2E] light:bg-white border border-[#1E2C48] dark:border-[#1E2C48] light:border-[#DCE3ED] text-[#FFB51B] hover:border-[#FFB51B] transition-all duration-200 shadow-sm flex items-center justify-center group active:scale-95"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#FFB51B] group-hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-[#D99000] group-hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-[#111A2E] dark:bg-[#111A2E] light:bg-white border border-[#1E2C48] dark:border-[#1E2C48] light:border-[#DCE3ED] text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-all shadow-sm active:scale-95"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center ring-2 ring-slate-950 animate-bounce">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#111A2E] dark:bg-[#111A2E] light:bg-white border border-[#1E2C48] dark:border-[#1E2C48] light:border-[#DCE3ED] p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-[#1E2C48] dark:border-[#1E2C48] light:border-[#DCE3ED]">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#FFB51B]" />
                    <span className="text-sm font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 font-heading">Notifications</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {unreadNotifCount} unread
                  </span>
                </div>

                <div className="mt-3 max-h-72 overflow-y-auto space-y-2.5">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-3 rounded-xl cursor-pointer transition-colors text-left border ${
                          n.read
                            ? 'bg-[#080D1C]/40 dark:bg-[#080D1C]/40 light:bg-slate-50 border-[#1E2C48]/60 dark:border-[#1E2C48]/60 light:border-slate-200 opacity-70'
                            : 'bg-[#17233D] dark:bg-[#17233D] light:bg-amber-50/70 border-[#FFB51B]/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-semibold text-slate-200 dark:text-slate-200 light:text-slate-800">{n.title}</h4>
                          {!n.read && (
                            <span className="w-2 h-2 rounded-full bg-[#FFB51B] shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Direct Profile Details Button */}
          <button
            onClick={() => setCurrentTab('profile')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              currentTab === 'profile'
                ? 'bg-[#FFB51B] text-[#080D1C] border-[#FFB51B] font-bold shadow-md'
                : 'bg-[#111A2E] dark:bg-[#111A2E] light:bg-white border-[#1E2C48] dark:border-[#1E2C48] light:border-[#DCE3ED] text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white dark:hover:text-white light:hover:text-slate-900 shadow-sm'
            }`}
            title="View personal profile and account details"
          >
            <UserIcon className="w-3.5 h-3.5 text-[#FFB51B]" />
            <span>My Details</span>
          </button>

            {/* Authenticated User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#111A2E] dark:bg-[#111A2E] light:bg-white border border-[#1E2C48] dark:border-[#1E2C48] light:border-[#DCE3ED] hover:border-[#FFB51B]/50 transition-all text-left shadow-sm"
              >
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                  alt={user?.name || 'User'}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-[#1E2C48]"
                />
                <div className="hidden md:block">
                  <div className="text-xs font-bold text-slate-200 dark:text-slate-200 light:text-slate-800 leading-tight flex items-center gap-1.5 font-heading">
                    <span className="truncate max-w-[110px]">{user?.name || 'Registered User'}</span>
                    {role === 'customer' && <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/30 font-semibold font-mono">Customer</span>}
                    {role === 'mechanic' && <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#FFB51B]/20 text-[#FFB51B] border border-[#FFB51B]/30 font-semibold font-mono">Mechanic</span>}
                    {role === 'admin' && <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 font-semibold font-mono">Admin</span>}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium truncate max-w-[120px] font-mono">{user?.email}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

            {/* User Details Dropdown Menu */}
            {showRoleSwitcher && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#111A2E] dark:bg-[#111A2E] light:bg-white border border-[#1E2C48] dark:border-[#1E2C48] light:border-[#DCE3ED] p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2.5 border-b border-[#1E2C48] dark:border-[#1E2C48] light:border-[#DCE3ED] mb-3">
                  <div className="text-xs font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 uppercase tracking-wider flex items-center gap-1.5 font-heading">
                    <UserIcon className="w-3.5 h-3.5 text-[#FFB51B]" />
                    Account Details
                  </div>
                  <button
                    onClick={() => setShowRoleSwitcher(false)}
                    className="text-slate-400 hover:text-slate-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#080D1C] dark:bg-[#080D1C] light:bg-slate-100 border border-[#1E2C48] dark:border-[#1E2C48] light:border-[#DCE3ED] mb-3">
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                    alt={user?.name || 'User'}
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-[#1E2C48]"
                  />
                  <div className="truncate">
                    <div className="text-xs font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 truncate font-heading">{user?.name}</div>
                    <div className="text-[10px] text-slate-400 truncate font-mono">{user?.email}</div>
                    <div className="text-[9px] text-[#FFB51B] font-semibold capitalize mt-0.5 font-mono">Role: {role}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setCurrentTab('profile');
                      setShowRoleSwitcher(false);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#080D1C] dark:bg-[#080D1C] light:bg-slate-100 hover:bg-[#17233D] dark:hover:bg-[#17233D] light:hover:bg-slate-200 border border-[#1E2C48] dark:border-[#1E2C48] light:border-[#DCE3ED] text-xs font-bold text-[#FFB51B] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>View Profile & Telematics Info</span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setShowRoleSwitcher(false);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-xs font-bold text-red-400 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Direct Logout Button */}
          <button
            onClick={logout}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-500/50 text-slate-400 hover:text-red-400 text-xs font-semibold transition-all shadow-sm"
            title="Sign out of account and return to login page"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
