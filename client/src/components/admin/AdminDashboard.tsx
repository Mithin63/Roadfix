import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { User, Booking, Complaint } from '../../types';
import {
  BarChart3,
  Users,
  ShieldCheck,
  Navigation,
  DollarSign,
  AlertTriangle,
  Star,
  CheckCircle2,
  XCircle,
  Ban,
  Clock,
  Eye,
  Check,
  X,
  TrendingUp,
  Activity,
  Layers,
  FileText
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'registrations' | 'mechanics' | 'users' | 'bookings' | 'complaints' | 'pricing'>('overview');
  const [stats, setStats] = useState<any | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [registrationsList, setRegistrationsList] = useState<any[]>([]);
  const [serverEngine, setServerEngine] = useState<string>('Python 3.12 Backend');
  const [mechanicsList, setMechanicsList] = useState<any[]>([]);
  const [bookingsList, setBookingsList] = useState<Booking[]>([]);
  const [complaintsList, setComplaintsList] = useState<Complaint[]>([]);
  const [pricingCatalog, setPricingCatalog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, regsRes, mechsRes, bookingsRes, complaintsRes, catalogRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getRegisteredUsers().catch(() => ({ registrations: [], serverEngine: 'Python 3.12' })),
        api.getMechanics(),
        api.getBookings(),
        api.getComplaints(),
        api.getPricingCatalog()
      ]);

      setStats(statsRes.stats);
      setUsersList(usersRes.users || []);
      setRegistrationsList(regsRes.registrations || []);
      if (regsRes.serverEngine) setServerEngine(regsRes.serverEngine);
      setMechanicsList(mechsRes.mechanics || []);
      setBookingsList(bookingsRes.bookings || []);
      setComplaintsList(complaintsRes.complaints || []);
      setPricingCatalog(catalogRes.catalog || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleBlock = async (userId: string, currentStatus: boolean) => {
    try {
      await api.blockUser(userId, !currentStatus);
      setUsersList(prev => prev.map(u => (u.id === userId ? { ...u, isBlocked: !currentStatus } : u)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyMechanic = async (mechanicId: string, isVerified: boolean) => {
    try {
      await api.verifyMechanic(mechanicId, isVerified);
      setMechanicsList(prev =>
        prev.map(m => (m.id === mechanicId ? { ...m, profile: { ...m.profile, isVerified } } : m))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveComplaint = async (complaintId: string) => {
    try {
      await api.updateComplaint(complaintId, 'resolved', 'Complaint resolved by administrator.');
      setComplaintsList(prev =>
        prev.map(c => (c.id === complaintId ? { ...c, status: 'resolved' } : c))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in text-left">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30 text-[10px] font-bold uppercase tracking-wider font-mono">
              Fleet Command Center
            </span>
            <span className="text-xs text-slate-400">Roadfix Platform Operations & Telematics</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 font-heading tracking-tight mt-1">
            System Operations & Telematics Analytics
          </h2>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#111A2E] border border-[#1E2C48] text-xs font-semibold overflow-x-auto shadow-lg">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'registrations', label: 'All Registrations & Vehicles', icon: Layers },
            { id: 'mechanics', label: 'Verify Mechanics', icon: ShieldCheck },
            { id: 'users', label: 'Users & Roles', icon: Users },
            { id: 'bookings', label: 'Live Incidents', icon: Navigation },
            { id: 'complaints', label: 'Complaints', icon: AlertTriangle },
            { id: 'pricing', label: 'Service Pricing', icon: DollarSign },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCur = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all text-xs active:scale-95 ${
                  isCur
                    ? 'bg-[#FFB51B] text-[#080D1C] font-extrabold shadow-[0_0_15px_rgba(255,181,27,0.3)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-[#1E2C48]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metrics Overview Cards (Section 22) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-2xl bg-[#111A2E] border border-[#1E2C48] space-y-1 shadow-lg hover:border-slate-600 transition-all">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Customers</span>
              <div className="text-xl font-black text-slate-100 font-heading">{stats?.totalCustomers || 10}</div>
              <span className="text-[10px] text-[#10B981] font-semibold">+12% this week</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#111A2E] border border-[#1E2C48] space-y-1 shadow-lg hover:border-slate-600 transition-all">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Mechanics</span>
              <div className="text-xl font-black text-slate-100 font-heading">{stats?.totalMechanics || 10}</div>
              <span className="text-[10px] text-[#FFB51B] font-semibold">{stats?.onlineMechanics || 8} online</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#111A2E] border border-[#1E2C48] space-y-1 shadow-lg hover:border-slate-600 transition-all">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Requests</span>
              <div className="text-xl font-black text-[#FFB51B] font-mono animate-pulse">{stats?.activeRequests || 2}</div>
              <span className="text-[10px] text-[#38BDF8]">Live dispatch</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#111A2E] border border-[#1E2C48] space-y-1 shadow-lg hover:border-slate-600 transition-all">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Completed Repairs</span>
              <div className="text-xl font-black text-[#38BDF8] font-mono">{stats?.completedRepairs || 18}</div>
              <span className="text-[10px] text-[#10B981] font-semibold">99.4% resolution</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#111A2E] border border-[#1E2C48] space-y-1 shadow-lg hover:border-slate-600 transition-all">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Revenue</span>
              <div className="text-xl font-black text-[#10B981] font-mono">₹{stats?.totalRevenue ? stats.totalRevenue.toLocaleString() : '38,400'}</div>
              <span className="text-[10px] text-slate-400">Settled via UPI/Card</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#111A2E] border border-[#1E2C48] space-y-1 shadow-lg hover:border-slate-600 transition-all">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Avg Rating</span>
              <div className="text-xl font-black text-[#FFB51B] font-mono flex items-center gap-1">
                <span>{stats?.averageRating || 4.8}</span>
                <Star className="w-4 h-4 fill-[#FFB51B] text-[#FFB51B]" />
              </div>
              <span className="text-[10px] text-slate-400">From 140+ reviews</span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Bookings & Revenue Trend Chart */}
            <div className="p-5 rounded-3xl bg-[#111A2E] border border-[#1E2C48] space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 font-heading">
                    <TrendingUp className="w-4 h-4 text-[#10B981]" />
                    Daily Incident Bookings & Revenue Trend
                  </h3>
                  <p className="text-[11px] text-slate-400">Last 7 days road service metrics</p>
                </div>
              </div>

              {/* Responsive SVG Bar Chart */}
              <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
                {(stats?.dailyBookings || [
                  { date: '19 Sep', count: 12, revenue: 14200 },
                  { date: '20 Sep', count: 18, revenue: 21600 },
                  { date: '21 Sep', count: 15, revenue: 18400 },
                  { date: '22 Sep', count: 22, revenue: 27900 },
                  { date: '23 Sep', count: 19, revenue: 23100 },
                  { date: '24 Sep', count: 26, revenue: 32500 },
                  { date: '25 Sep', count: 31, revenue: 39800 }
                ]).map((item: any, idx: number) => {
                  const maxCount = 35;
                  const heightPercent = (item.count / maxCount) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                      <div className="text-[9px] font-mono text-[#FFB51B] opacity-0 group-hover:opacity-100 transition-opacity">
                        ₹{(item.revenue / 1000).toFixed(0)}k
                      </div>
                      <div
                        className="w-full bg-gradient-to-t from-[#FFB51B]/60 to-[#FFB51B] rounded-t-lg transition-all group-hover:from-[#FFD166] group-hover:to-[#FFB51B] shadow-[0_0_12px_rgba(255,181,27,0.2)]"
                        style={{ height: `${heightPercent}%` }}
                      />
                      <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Vehicle Problem Categories Breakdown */}
            <div className="p-5 rounded-3xl bg-[#111A2E] border border-[#1E2C48] space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 font-heading">
                    <Layers className="w-4 h-4 text-[#38BDF8]" />
                    Breakdown Problem Distribution
                  </h3>
                  <p className="text-[11px] text-slate-400">By frequency of roadside calls</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { label: 'Battery Discharged / Dead', count: 7, pct: '35%', color: 'bg-[#FFB51B]' },
                  { label: 'Flat Tyre & Bead Failure', count: 5, pct: '25%', color: 'bg-[#38BDF8]' },
                  { label: 'Engine Stalling & Overheating', count: 4, pct: '20%', color: 'bg-[#FFD166]' },
                  { label: 'Fuel Starvation / Out of Fuel', count: 2, pct: '10%', color: 'bg-[#10B981]' },
                  { label: 'Brake Line Sponginess & Lockout', count: 2, pct: '10%', color: 'bg-indigo-400' },
                ].map((cat, i) => (
                  <div key={i} className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-300 font-medium">
                      <span>{cat.label}</span>
                      <span className="font-mono text-slate-400">{cat.count} requests ({cat.pct})</span>
                    </div>
                    <div className="w-full bg-[#080D1C] rounded-full h-2 overflow-hidden border border-[#1E2C48]">
                      <div className={`${cat.color} h-2 rounded-full transition-all duration-500`} style={{ width: cat.pct }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* TAB 2: MECHANIC VERIFICATION (Section 18) */}
      {activeTab === 'mechanics' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100 font-heading">
              Mechanic Verification & Telematics Credentials
            </h3>
            <span className="text-xs text-slate-400 font-mono">Section 18 Fleet Compliance</span>
          </div>

          <div className="border border-[#1E2C48] rounded-3xl overflow-hidden bg-[#111A2E] shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#080D1C] text-slate-400 font-bold uppercase text-[10px] border-b border-[#1E2C48] tracking-wider">
                  <tr>
                    <th className="p-3.5">Mechanic & Workshop</th>
                    <th className="p-3.5">Experience</th>
                    <th className="p-3.5">Credentials & Docs</th>
                    <th className="p-3.5">Equipment Count</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2C48]">
                  {mechanicsList.map((m) => (
                    <tr key={m.id} className="hover:bg-[#17233D]/60 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img src={m.avatar} alt={m.name} className="w-9 h-9 rounded-xl object-cover ring-1 ring-[#1E2C48]" />
                          <div>
                            <div className="font-bold text-slate-100 font-heading">{m.name}</div>
                            <div className="text-[11px] text-slate-400">{m.profile.workshopName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-300">
                        {m.profile.experienceYears} Years
                      </td>
                      <td className="p-3.5 text-slate-300 space-y-1">
                        <div className="font-mono text-[11px] text-slate-400">📄 {m.profile.verificationDocs.idProof}</div>
                        <div className="font-mono text-[11px] text-[#FFB51B]">🪪 {m.profile.verificationDocs.drivingLicense}</div>
                      </td>
                      <td className="p-3.5 text-slate-300 font-mono">
                        {m.profile.equipment.length} tools registered
                      </td>
                      <td className="p-3.5">
                        {m.profile.isVerified ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981] font-bold text-[10px] border border-[#10B981]/30">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified Pro
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFB51B]/20 text-[#FFB51B] font-bold text-[10px] border border-[#FFB51B]/30">
                            <Clock className="w-3 h-3" />
                            Pending Review
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        {m.profile.isVerified ? (
                          <button
                            onClick={() => handleVerifyMechanic(m.id, false)}
                            className="px-3 py-1.5 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30 text-[10px] font-bold transition-all active:scale-95"
                          >
                            Revoke Badge
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVerifyMechanic(m.id, true)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#10B981] text-[#080D1C] hover:bg-emerald-400 font-extrabold text-[10px] transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)] active:scale-95"
                          >
                            Approve & Verify
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: ALL REGISTRATIONS & VEHICLE DETAILS (PYTHON BACKEND STORE) */}
      {activeTab === 'registrations' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-3xl bg-gradient-to-r from-[#111A2E] via-[#111A2E] to-[#17233D] border border-[#1E2C48] shadow-xl">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 text-[10px] font-bold uppercase font-mono">
                  Connected to {serverEngine}
                </span>
                <span className="text-xs text-slate-400 font-mono">Port 5000</span>
              </div>
              <h3 className="text-base font-black text-slate-100 mt-1 font-heading">
                All Registered Users & Complete Asset Breakdown
              </h3>
              <p className="text-xs text-slate-400">
                Live database telemetry of registered accounts, vehicles, workshops, GPS locations & audit logs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter by name, email, vehicle..."
                className="px-3.5 py-2 rounded-xl bg-[#080D1C] border border-[#1E2C48] text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#FFB51B] transition-colors"
              />
              <span className="px-3 py-2 rounded-xl bg-[#080D1C] border border-[#1E2C48] text-xs text-[#FFB51B] font-bold font-mono">
                {registrationsList.length} Accounts
              </span>
            </div>
          </div>

          {/* Registrations List Grid */}
          <div className="grid grid-cols-1 gap-3">
            {registrationsList
              .filter((r) => {
                if (!searchFilter.trim()) return true;
                const q = searchFilter.toLowerCase();
                return (
                  r.name?.toLowerCase().includes(q) ||
                  r.email?.toLowerCase().includes(q) ||
                  r.phone?.toLowerCase().includes(q) ||
                  r.role?.toLowerCase().includes(q) ||
                  r.vehicles?.some((v: any) => `${v.make} ${v.model} ${v.regNo}`.toLowerCase().includes(q))
                );
              })
              .map((r, idx) => (
                <div
                  key={r.id || idx}
                  className="p-5 rounded-3xl bg-[#111A2E] border border-[#1E2C48] hover:border-slate-600 transition-all space-y-3.5 shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2C48] pb-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FFB51B] to-[#FFD166] p-0.5 shrink-0 shadow-md">
                        <div className="w-full h-full bg-[#080D1C] rounded-[10px] flex items-center justify-center font-black text-[#FFB51B] text-xs font-heading">
                          {r.name?.charAt(0) || 'U'}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-100 font-heading">{r.name}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                              r.role === 'customer'
                                ? 'bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/30'
                                : r.role === 'mechanic'
                                ? 'bg-[#FFB51B]/20 text-[#FFB51B] border border-[#FFB51B]/30'
                                : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            }`}
                          >
                            {r.role}
                          </span>
                          {r.isBlocked && (
                            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30">
                              Blocked
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                          <span>{r.email}</span>
                          <span>•</span>
                          <span className="text-slate-300">{r.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right text-xs text-slate-400">
                      <div className="text-[11px] text-slate-400">
                        Joined: <span className="text-slate-300 font-mono">{new Date(r.createdAt || Date.now()).toLocaleString()}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs">
                        📍 {r.address || 'Andhra Pradesh, India'}
                      </div>
                    </div>
                  </div>

                  {/* Customer Vehicles Breakdown */}
                  {r.role === 'customer' && (
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Registered Vehicles ({r.vehicles?.length || 0})
                      </span>
                      {r.vehicles && r.vehicles.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                          {r.vehicles.map((v: any, vIdx: number) => (
                            <div
                              key={v.id || vIdx}
                              className="p-3 rounded-2xl bg-[#080D1C] border border-[#1E2C48] flex items-center justify-between text-xs"
                            >
                              <div>
                                <div className="font-bold text-slate-100 font-heading">
                                  {v.year} {v.make} {v.model}
                                </div>
                                <div className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">
                                  Reg: <span className="text-[#FFB51B] font-bold">{v.regNo}</span> • Fuel: {v.fuelType}
                                </div>
                              </div>
                              <span className="px-2 py-0.5 rounded-lg bg-[#111A2E] text-slate-300 text-[9px] uppercase font-bold border border-[#1E2C48]">
                                {v.type || 'Car'}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No vehicles added yet.</p>
                      )}
                    </div>
                  )}

                  {/* Mechanic Details Breakdown */}
                  {r.role === 'mechanic' && r.mechanicProfile && (
                    <div className="p-3.5 rounded-2xl bg-[#080D1C] border border-[#1E2C48] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Workshop Name</span>
                        <span className="font-bold text-slate-100 font-heading">{r.mechanicProfile.workshopName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Rating & Repairs</span>
                        <span className="font-semibold text-[#FFB51B] font-mono">
                          {r.mechanicProfile.rating || 5.0}★ ({r.mechanicProfile.reviewCount || 0} reviews) • {r.mechanicProfile.totalRepairs || 0} repairs
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Status</span>
                        <span className={r.mechanicProfile.isOnline ? 'text-[#10B981] font-bold font-mono' : 'text-slate-400 font-mono'}>
                          {r.mechanicProfile.isOnline ? '● ONLINE (Dispatch Ready)' : '○ Offline'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 3: USERS & ROLES */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100 font-heading">Registered Users & Account Controls</h3>
            <span className="text-xs text-slate-400 font-mono">{usersList.length} users</span>
          </div>

          <div className="border border-[#1E2C48] rounded-3xl overflow-hidden bg-[#111A2E] shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#080D1C] text-slate-400 font-bold uppercase text-[10px] border-b border-[#1E2C48] tracking-wider">
                  <tr>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Phone</th>
                    <th className="p-3.5">Registered Location</th>
                    <th className="p-3.5">Account Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2C48]">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-[#17233D]/60 transition-colors">
                      <td className="p-3.5 font-semibold text-slate-100 flex items-center gap-3">
                        <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-xl object-cover ring-1 ring-[#1E2C48]" />
                        <div>
                          <div className="font-bold text-slate-100 font-heading">{u.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{u.email}</div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="capitalize px-2.5 py-0.5 rounded-lg bg-[#080D1C] text-slate-300 font-semibold text-[10px] border border-[#1E2C48]">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-300 font-mono">{u.phone}</td>
                      <td className="p-3.5 text-slate-400 truncate max-w-[160px]">{u.address || 'Mumbai'}</td>
                      <td className="p-3.5">
                        {u.isBlocked ? (
                          <span className="px-2.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold text-[10px] border border-red-500/30">
                            Suspended
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] font-bold text-[10px] border border-[#10B981]/30">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleToggleBlock(u.id, u.isBlocked)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all active:scale-95 ${
                            u.isBlocked
                              ? 'bg-[#10B981] text-[#080D1C]'
                              : 'bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30'
                          }`}
                        >
                          {u.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LIVE INCIDENTS & BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100 font-heading">Live Roadside Incidents & Bookings</h3>
            <span className="text-xs text-slate-400 font-mono">{bookingsList.length} total</span>
          </div>

          <div className="border border-[#1E2C48] rounded-3xl overflow-hidden bg-[#111A2E] shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#080D1C] text-slate-400 font-bold uppercase text-[10px] border-b border-[#1E2C48] tracking-wider">
                  <tr>
                    <th className="p-3.5">Booking ID</th>
                    <th className="p-3.5">Customer & Vehicle</th>
                    <th className="p-3.5">Assigned Mechanic</th>
                    <th className="p-3.5">Problem Type</th>
                    <th className="p-3.5">Live Status</th>
                    <th className="p-3.5 text-right">Total Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2C48]">
                  {bookingsList.map((b) => (
                    <tr key={b.id} className="hover:bg-[#17233D]/60 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-[#FFB51B]">{b.id}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-100 font-heading">{b.customerName}</div>
                        <div className="text-[10px] text-slate-400">
                          {b.vehicleInfo.make} {b.vehicleInfo.model} ({b.vehicleInfo.regNo})
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-300 font-medium">
                        {b.mechanicName || 'Pending Assignment'}
                      </td>
                      <td className="p-3.5 capitalize text-slate-300">
                        {b.problemType.replace(/_/g, ' ')}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          b.status === 'payment_completed' ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30' :
                          b.status === 'travelling' ? 'bg-[#FFB51B]/20 text-[#FFB51B] border-[#FFB51B]/30 animate-pulse' :
                          'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {b.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-[#FFB51B]">
                        ₹{b.pricing.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: COMPLAINTS */}
      {activeTab === 'complaints' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100 font-heading">Customer Complaints & Dispute Resolution</h3>
            <span className="text-xs text-slate-400 font-mono">{complaintsList.length} cases</span>
          </div>

          <div className="space-y-3">
            {complaintsList.map((c) => (
              <div key={c.id} className="p-5 rounded-3xl bg-[#111A2E] border border-[#1E2C48] space-y-2.5 text-xs shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100 font-heading">{c.customerName}</span>
                    <span className="text-slate-500">vs</span>
                    <span className="text-[#FFB51B] font-medium">{c.mechanicName}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase border ${
                    c.status === 'resolved' ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30' : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}>
                    {c.status}
                  </span>
                </div>
                <p className="text-slate-300 font-medium">"{c.description}"</p>
                {c.resolutionNote && (
                  <p className="text-slate-400 italic">Resolution: {c.resolutionNote}</p>
                )}
                {c.status !== 'resolved' && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleResolveComplaint(c.id)}
                      className="px-4 py-2 rounded-xl bg-[#10B981] font-bold text-[#080D1C] text-xs transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)] active:scale-95"
                    >
                      Mark Resolved
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: SERVICE PRICING CATALOG */}
      {activeTab === 'pricing' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100 font-heading">Problem Categories & Standard Service Pricing</h3>
            <span className="text-xs text-slate-400 font-mono">Configured baseline tariffs</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pricingCatalog.map((item) => (
              <div key={item.id} className="p-5 rounded-3xl bg-[#111A2E] border border-[#1E2C48] space-y-3 text-xs shadow-lg hover:border-slate-600 transition-all">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-100 font-heading">{item.label}</h4>
                  <span className="font-mono text-[#FFB51B] font-bold">₹{item.basePrice} Base</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">{item.description}</p>
                <div className="pt-2.5 border-t border-[#1E2C48] flex justify-between text-slate-400 font-mono text-[11px]">
                  <span>Labour Est: ₹{item.labourEst}</span>
                  <span>Est Time: ~{item.timeEstMinutes} mins</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
