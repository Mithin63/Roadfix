import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Notification } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  token: string | null;
  isInitializing: boolean;
  demoUsers: any[];
  switchUser: (userId: string) => Promise<void>;
  login: (email: string, password?: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  updateUserProfile: (updates: any) => Promise<void>;
  notifications: Notification[];
  unreadNotifCount: number;
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  activeLocation: { lat: number; lng: number; address: string };
  setActiveLocation: (loc: { lat: number; lng: number; address: string }) => void;
  detectLocation: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [demoUsers, setDemoUsers] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  // Default location: Andhra Pradesh (Vijayawada / AP Central)
  const [activeLocation, setActiveLocation] = useState({
    lat: 16.5062,
    lng: 80.6480,
    address: 'Vijayawada, Andhra Pradesh'
  });

  const fetchDemoUsers = async () => {
    try {
      const res = await api.getDemoUsers();
      if (res.demoUsers) setDemoUsers(res.demoUsers);
    } catch (err) {
      console.warn('Could not load demo users from backend:', err);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.getNotifications(user.id);
      setNotifications(res.notifications || []);
      setUnreadNotifCount(res.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
      setUnreadNotifCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const detectLocation = async () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          let addressName = `Live GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

          try {
            // Free OpenStreetMap reverse geocoding for exact street & town in AP / India
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`);
            if (geoRes.ok) {
              const data = await geoRes.json();
              if (data && data.display_name) {
                const parts = data.display_name.split(',');
                addressName = parts.slice(0, 3).join(',').trim() || data.display_name;
              }
            }
          } catch (e) {
            console.log('Reverse geocoding error:', e);
          }

          setActiveLocation({
            lat,
            lng,
            address: addressName
          });
        },
        (err) => {
          console.log('GPS error/permission denied, using Andhra Pradesh default coordinates', err);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  // Switch user (helper for profile updates)
  const switchUser = async (userId: string) => {
    try {
      const res = await api.getMe();
      if (res.user) {
        setUser(res.user);
      }
    } catch (err) {
      console.warn('User refresh:', err);
    }
  };

  const login = async (email: string, password?: string) => {
    const res = await api.login(email, password);
    localStorage.setItem('roadfix_logged_in', 'true');
    localStorage.setItem('roadfix_token', res.token);
    localStorage.setItem('roadfix_user_id', res.user.id);
    localStorage.setItem('roadfix_user_email', res.user.email);
    // Legacy cleanup
    localStorage.removeItem('roadrescue_logged_in');
    localStorage.removeItem('roadrescue_token');
    localStorage.removeItem('roadrescue_user_id');
    localStorage.removeItem('roadrescue_user_email');

    setUser(res.user);
    setToken(res.token);
    if (res.user.lat && res.user.lng) {
      setActiveLocation({
        lat: res.user.lat,
        lng: res.user.lng,
        address: res.user.address || 'Registered Location'
      });
    }
  };

  const register = async (payload: any) => {
    const res = await api.register(payload);
    localStorage.setItem('roadfix_logged_in', 'true');
    localStorage.setItem('roadfix_token', res.token);
    localStorage.setItem('roadfix_user_id', res.user.id);
    localStorage.setItem('roadfix_user_email', res.user.email);
    // Legacy cleanup
    localStorage.removeItem('roadrescue_logged_in');
    localStorage.removeItem('roadrescue_token');
    localStorage.removeItem('roadrescue_user_id');
    localStorage.removeItem('roadrescue_user_email');

    setUser(res.user);
    setToken(res.token);
    if (res.user.lat && res.user.lng) {
      setActiveLocation({
        lat: res.user.lat,
        lng: res.user.lng,
        address: res.user.address || 'Registered Location'
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('roadfix_logged_in');
    localStorage.removeItem('roadfix_token');
    localStorage.removeItem('roadfix_user_id');
    localStorage.removeItem('roadfix_user_email');
    localStorage.removeItem('roadrescue_logged_in');
    localStorage.removeItem('roadrescue_token');
    localStorage.removeItem('roadrescue_user_id');
    localStorage.removeItem('roadrescue_user_email');
    setUser(null);
    setToken(null);
    setNotifications([]);
    setUnreadNotifCount(0);
  };

  const updateUserProfile = async (updates: any) => {
    if (!user) return;
    const res = await api.updateProfile({ ...updates, id: user.id });
    if (res.user) {
      setUser(res.user);
      if (res.user.lat && res.user.lng && updates.address) {
        setActiveLocation({
          lat: res.user.lat,
          lng: res.user.lng,
          address: updates.address
        });
      }
    }
  };

  // Initialize
  useEffect(() => {
    const initSession = async () => {
      // Check if user has an active authenticated session
      const isLoggedIn =
        localStorage.getItem('roadfix_logged_in') === 'true' ||
        localStorage.getItem('roadrescue_logged_in') === 'true';
      const storedEmail =
        localStorage.getItem('roadfix_user_email') ||
        localStorage.getItem('roadrescue_user_email');

      if (isLoggedIn && storedEmail) {
        try {
          const res = await api.getMe();
          if (res.user) {
            setUser(res.user);
            if (res.user.lat && res.user.lng) {
              setActiveLocation({
                lat: res.user.lat,
                lng: res.user.lng,
                address: res.user.address || 'Registered Location'
              });
            }
          }
        } catch (e) {
          console.warn('Session restore failed, returning to login:', e);
          logout();
        }
      } else {
        // First-time or logged-out: do not auto-login, show login page!
        setUser(null);
        setToken(null);
      }

      setIsInitializing(false);
      // Auto-detect real physical GPS coordinates on startup
      detectLocation();
    };

    initSession();
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 12000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'customer',
        token,
        isInitializing,
        demoUsers,
        switchUser,
        login,
        register,
        logout,
        updateUserProfile,
        notifications,
        unreadNotifCount,
        fetchNotifications,
        markNotificationRead,
        activeLocation,
        setActiveLocation,
        detectLocation
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
