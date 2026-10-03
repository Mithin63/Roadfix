import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Notification } from '../types';
import { api } from '../services/api';

export type LocationPermissionStatus = 'idle' | 'detecting' | 'success' | 'denied' | 'unavailable';

export interface ActiveLocation {
  lat: number;
  lng: number;
  address: string;
  accuracy?: number;
  timestamp?: number;
  status: LocationPermissionStatus;
  errorMsg: string | null;
  isRealGps: boolean;
}

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
  activeLocation: ActiveLocation;
  setActiveLocation: (loc: Partial<ActiveLocation> & { lat: number; lng: number; address: string }) => void;
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

  // Single Source of Truth for Location State
  const [activeLocation, setActiveLocationState] = useState<ActiveLocation>({
    lat: 16.5062,
    lng: 80.6480,
    address: 'Detecting live GPS location...',
    status: 'idle',
    errorMsg: null,
    isRealGps: false
  });

  const setActiveLocation = (loc: Partial<ActiveLocation> & { lat: number; lng: number; address: string }) => {
    setActiveLocationState(prev => ({
      ...prev,
      ...loc,
      status: loc.status || 'success',
      errorMsg: loc.errorMsg !== undefined ? loc.errorMsg : null
    }));
  };

  const detectLocation = async (): Promise<void> => {
    if (!('geolocation' in navigator)) {
      setActiveLocationState(prev => ({
        ...prev,
        status: 'unavailable',
        errorMsg: 'Geolocation is not supported by your browser.',
        isRealGps: false
      }));
      return;
    }

    setActiveLocationState(prev => ({
      ...prev,
      status: 'detecting',
      errorMsg: null
    }));

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = pos.coords.accuracy;
          const timestamp = pos.timestamp;
          let addressName = `GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

          try {
            // Free OpenStreetMap reverse geocoding for exact street & locality
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`
            );
            if (geoRes.ok) {
              const data = await geoRes.json();
              if (data && data.display_name) {
                const parts = data.display_name.split(',');
                addressName = parts.slice(0, 3).join(',').trim() || data.display_name;
              }
            }
          } catch (e) {
            console.warn('Reverse geocoding error:', e);
          }

          setActiveLocationState({
            lat,
            lng,
            address: addressName,
            accuracy,
            timestamp,
            status: 'success',
            errorMsg: null,
            isRealGps: true
          });
          resolve();
        },
        (err) => {
          console.warn('Geolocation detection error:', err);
          let message = 'Unable to detect your current location. Please enable GPS and try again.';
          let status: LocationPermissionStatus = 'unavailable';

          if (err.code === err.PERMISSION_DENIED) {
            message = 'Location permission is required to find nearby mechanics. Please allow location access in your browser settings.';
            status = 'denied';
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            message = 'GPS signal is currently unavailable. Please check your device location services.';
            status = 'unavailable';
          } else if (err.code === err.TIMEOUT) {
            message = 'Location request timed out. Please click Retry GPS to search again.';
            status = 'unavailable';
          }

          setActiveLocationState(prev => ({
            ...prev,
            status,
            errorMsg: message,
            isRealGps: false
          }));
          resolve();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  // Auto-detect GPS location on startup
  useEffect(() => {
    detectLocation();
  }, []);

  const fetchNotifications = async () => {
    try {
      if (!user) return;
      // Maintain active notifications
    } catch (err) {
      console.error('Fetch notifications error:', err);
    }
  };

  const markNotificationRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadNotifCount(prev => Math.max(0, prev - 1));
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
