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
  const [activeTab, setActiveTab] = useState<'overview' | 'mechanics' | 'users' | 'bookings' | 'complaints' | 'pricing'>('overview');
  const [stats, setStats] = useState<any | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [mechanicsList, setMechanicsList] = useState<any[]>([]);
  const [bookingsList, setBookingsList] = useState<Booking[]>([]);
  const [complaintsList, setComplaintsList] = useState<Complaint[]>([]);
  const [pricingCatalog, setPricingCatalog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, mechsRes, bookingsRes, complaintsRes, catalogRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getMechanics(),
        api.getBookings(),
        api.getComplaints(),
        api.getPricingCatalog()
      ]);

      setStats(statsRes.stats);
      setUsersList(usersRes.users || []);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-bold uppercase tracking-wider">
              Platform Admin Control
            </span>
            <span className="text-xs text-slate-400">Roadfix Operational Headquarters</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            System Operations & Analytics
          </h2>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-semibold overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
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
                className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  isCur
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
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
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Customers</span>
              <div className="text-xl font-black text-white">{stats?.totalCustomers || 10}</div>
              <span className="text-[10px] text-emerald-400 font-semibold">+12% this week</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Mechanics</span>
              <div className="text-xl font-black text-white">{stats?.totalMechanics || 10}</div>
              <span className="text-[10px] text-amber-400 font-semibold">{stats?.onlineMechanics || 8} online</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Active Requests</span>
              <div className="text-xl font-black text-amber-400 font-mono animate-pulse">{stats?.activeRequests || 2}</div>
              <span className="text-[10px] text-slate-400">Live dispatch</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Completed Repairs</span>
              <div className="text-xl font-black text-cyan-400 font-mono">{stats?.completedRepairs || 18}</div>
              <span className="text-[10px] text-emerald-400 font-semibold">99.4% resolution</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Revenue</span>
              <div className="text-xl font-black text-emerald-400 font-mono">₹{stats?.totalRevenue ? stats.totalRevenue.toLocaleString() : '38,400'}</div>
              <span className="text-[10px] text-slate-400">Settled via UPI/Card</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Avg Rating</span>
              <div className="text-xl font-black text-amber-400 font-mono flex items-center gap-1">
                <span>{stats?.averageRating || 4.8}</span>
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
              <span className="text-[10px] text-slate-400">From 140+ reviews</span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Bookings & Revenue Trend Chart */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
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
                      <div className="text-[9px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        ₹{(item.revenue / 1000).toFixed(0)}k
                      </div>
                      <div
                        className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg transition-all group-hover:from-amber-500 group-hover:to-amber-300"
                        style={{ height: `${heightPercent}%` }}
                      />
                      <span className="text-[10px] text-slate-400 font-semibold">{item.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Vehicle Problem Categories Breakdown */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    Breakdown Problem Distribution
                  </h3>
                  <p className="text-[11px] text-slate-400">By frequency of roadside calls</p>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                {[
                  { label: 'Battery Discharged / Dead', count: 7, pct: '35%', color: 'bg-amber-400' },
                  { label: 'Flat Tyre & Bead Failure', count: 5, pct: '25%', color: 'bg-cyan-400' },
                  { label: 'Engine Stalling & Overheating', count: 4, pct: '20%', color: 'bg-red-400' },
                  { label: 'Fuel Starvation / Out of Fuel', count: 2, pct: '10%', color: 'bg-emerald-400' },
                  { label: 'Brake Line Sponginess & Lockout', count: 2, pct: '10%', color: 'bg-purple-400' },
                ].map((cat, i) => (
                  <div key={i} className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-300 font-medium">
                      <span>{cat.label}</span>
                      <span className="font-mono text-slate-400">{cat.count} requests ({cat.pct})</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className={`${cat.color} h-2 rounded-full`} style={{ width: cat.pct }} />
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
            <h3 className="text-base font-bold text-white">
              Mechanic Verification & Credentials Approval
            </h3>
            <span className="text-xs text-slate-400">Section 18 Compliance</span>
          </div>

          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Mechanic & Workshop</th>
                    <th className="p-3">Experience</th>
                    <th className="p-3">Submitted Documents</th>
                    <th className="p-3">Equipment Count</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {mechanicsList.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/40">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-lg object-cover" />
                          <div>
                            <div className="font-bold text-white">{m.name}</div>
                            <div className="text-[10px] text-slate-400">{m.profile.workshopName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-slate-300">
                        {m.profile.experienceYears} Years
                      </td>
                      <td className="p-3 text-slate-300 space-y-0.5">
                        <div className="font-mono text-[10px]">📄 {m.profile.verificationDocs.idProof}</div>
                        <div className="font-mono text-[10px] text-amber-400">🪪 {m.profile.verificationDocs.drivingLicense}</div>
                      </td>
                      <td className="p-3 text-slate-300">
                        {m.profile.equipment.length} tools registered
                      </td>
                      <td className="p-3">
                        {m.profile.isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified Pro
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 font-bold text-[10px]">
                            <Clock className="w-3 h-3" />
                            Pending Review
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {m.profile.isVerified ? (
                          <button
                            onClick={() => handleVerifyMechanic(m.id, false)}
                            className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-[10px] font-bold"
                          >
                            Revoke Badge
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVerifyMechanic(m.id, true)}
                            className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 text-[10px] font-bold"
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

      {/* TAB 3: USERS & ROLES */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Registered Users & Account Controls</h3>
            <span className="text-xs text-slate-400">{usersList.length} users</span>
          </div>

          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Registered Location</th>
                    <th className="p-3">Account Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-white flex items-center gap-2">
                        <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                        <div>
                          <div>{u.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{u.email}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="capitalize px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold text-[10px]">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300 font-mono">{u.phone}</td>
                      <td className="p-3 text-slate-400 truncate max-w-[160px]">{u.address || 'Mumbai'}</td>
                      <td className="p-3">
                        {u.isBlocked ? (
                          <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold text-[10px]">
                            Suspended
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleToggleBlock(u.id, u.isBlocked)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold ${
                            u.isBlocked
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
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
            <h3 className="text-base font-bold text-white">Live Roadside Incidents & Bookings</h3>
            <span className="text-xs text-slate-400">{bookingsList.length} total</span>
          </div>

          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Booking ID</th>
                    <th className="p-3">Customer & Vehicle</th>
                    <th className="p-3">Assigned Mechanic</th>
                    <th className="p-3">Problem Type</th>
                    <th className="p-3">Live Status</th>
                    <th className="p-3 text-right">Total Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {bookingsList.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-amber-400">{b.id}</td>
                      <td className="p-3">
                        <div className="font-bold text-white">{b.customerName}</div>
                        <div className="text-[10px] text-slate-400">
                          {b.vehicleInfo.make} {b.vehicleInfo.model} ({b.vehicleInfo.regNo})
                        </div>
                      </td>
                      <td className="p-3 text-slate-300 font-medium">
                        {b.mechanicName || 'Pending Assignment'}
                      </td>
                      <td className="p-3 capitalize text-slate-300">
                        {b.problemType.replace(/_/g, ' ')}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          b.status === 'payment_completed' ? 'bg-emerald-500/20 text-emerald-400' :
                          b.status === 'travelling' ? 'bg-amber-500/20 text-amber-400 animate-pulse' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {b.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-white">
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
            <h3 className="text-base font-bold text-white">Customer Complaints & Dispute Resolution</h3>
            <span className="text-xs text-slate-400">{complaintsList.length} cases</span>
          </div>

          <div className="space-y-3">
            {complaintsList.map((c) => (
              <div key={c.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{c.customerName}</span>
                    <span className="text-slate-500">vs</span>
                    <span className="text-amber-400 font-medium">{c.mechanicName}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    c.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
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
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-500 font-bold text-slate-950 text-xs"
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
            <h3 className="text-base font-bold text-white">Problem Categories & Standard Service Pricing</h3>
            <span className="text-xs text-slate-400">Configured baseline tariffs</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pricingCatalog.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white">{item.label}</h4>
                  <span className="font-mono text-amber-400 font-bold">₹{item.basePrice} Base</span>
                </div>
                <p className="text-slate-400 text-[11px]">{item.description}</p>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-slate-400">
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
