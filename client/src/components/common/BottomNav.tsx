import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  Navigation,
  Car,
  Clock,
  Wrench,
  DollarSign,
  Users,
  ShieldCheck,
  BarChart3,
  Calendar,
  User as UserIcon
} from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, setCurrentTab }) => {
  const { role } = useAuth();

  const customerTabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tracking', label: 'Tracking', icon: Navigation },
    { id: 'vehicles', label: 'Vehicles', icon: Car },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  const mechanicTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'requests', label: 'Requests', icon: Navigation },
    { id: 'active-job', label: 'Active Job', icon: Wrench },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  const adminTabs = [
    { id: 'dashboard', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'mechanics', label: 'Mechanics', icon: ShieldCheck },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  const tabs = role === 'admin' ? adminTabs : role === 'mechanic' ? mechanicTabs : customerTabs;

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 px-2 py-1.5 flex justify-around items-center">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              isActive
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${isActive ? 'bg-amber-500/10' : ''}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
