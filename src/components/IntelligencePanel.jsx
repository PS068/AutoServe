import { useState, useMemo } from "react";
import {
  Users, Search, Eye, EyeOff, Download, Shield, UserCheck,
  Phone, Mail, Calendar, Hash, X, ChevronUp, ChevronDown,
  BarChart3, Activity, UserX, User, TrendingUp,
  DollarSign, Zap, Wrench, Star, AlertTriangle, CheckCircle2,
  Clock, Target, Layers, Car, Flame, RefreshCw, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { useAuth } from "../context/AuthContext";

const INR = (val) => {
  const n = Number(val) || 0;
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString("en-IN");
};

const STATUS_COLORS = {
  Delivered: "#10b981", Servicing: "#f59e0b", Booked: "#38bdf8",
  Received: "#818cf8", Inspecting: "#a78bfa", "Pending Approval": "#fbbf24",
  Ready: "#facc15", Declined: "#f43f5e", "Failed / Expired": "#ef4444", Washing: "#06b6d4",
};
const PALETTE = ["#38bdf8", "#818cf8", "#10b981", "#f59e0b", "#f43f5e", "#a78bfa", "#06b6d4"];

const ChartTip = ({ active, payload, label, suffix = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "10px 14px" }}>
      <p style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{label}</p>
      {payload.map((e, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: e.color }} />
          <span style={{ color: "#94a3b8" }}>{e.name}:</span>
          <span style={{ color: "#fff", fontWeight: 700 }}>{typeof e.value === "number" ? e.value.toLocaleString("en-IN") : e.value}{suffix}</span>
        </div>
      ))}
    </div>
  );
};

function StatCard({ icon: Icon, label, value, color = "sky", sub, trend }) {
  const cs = {
    sky:     { border: "border-sky-500/30",     bg: "from-sky-500/15",     tx: "text-sky-300",     ic: "text-sky-400"     },
    amber:   { border: "border-amber-500/30",   bg: "from-amber-500/15",   tx: "text-amber-300",   ic: "text-amber-400"   },
    emerald: { border: "border-emerald-500/30", bg: "from-emerald-500/15", tx: "text-emerald-300", ic: "text-emerald-400" },
    rose:    { border: "border-rose-500/30",    bg: "from-rose-500/15",    tx: "text-rose-300",    ic: "text-rose-400"    },
    violet:  { border: "border-violet-500/30",  bg: "from-violet-500/15",  tx: "text-violet-300",  ic: "text-violet-400"  },
    cyan:    { border: "border-cyan-500/30",    bg: "from-cyan-500/15",    tx: "text-cyan-300",    ic: "text-cyan-400"    },
  };
  const c = cs[color] || cs.sky;
  return (
    <div className={`p-4 rounded-2xl border ${c.border} bg-gradient-to-br ${c.bg} to-transparent backdrop-blur-xl flex flex-col gap-2`}>
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-white/5 ${c.ic}`}><Icon size={15} /></div>
        <span className={`text-[10px] font-bold uppercase tracking-widest ${c.tx}`}>{label}</span>
      </div>
      <p className="text-2xl font-black text-white leading-none">{value}</p>
      {sub && <p className="text-[10px] text-slate-500">{sub}</p>}
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-[10px] font-bold ${trend >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
          {trend >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
          {Math.abs(trend)}% vs last period
        </div>
      )}
    </div>
  );
}

export default function IntelligencePanel({ onClose, bookings = [] }) {
  const { registeredUsers } = useAuth();
  const [activeTab, setActiveTab] = useState("bi");
  const [search, setSearch] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState(null);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronUp size={11} className="text-slate-600" />;
    return sortDir === "asc" ? <ChevronUp size={11} className="text-sky-400" /> : <ChevronDown size={11} className="text-sky-400" />;
  };

  const filteredUsers = useMemo(() => {
    let us = [...(registeredUsers || [])];
    if (roleFilter !== "ALL") us = us.filter(u => (u.role || "customer") === roleFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      us = us.filter(u => (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q) || (u.phone || "").includes(q) || (u.uid || "").toLowerCase().includes(q));
    }
    us.sort((a, b) => {
      const av = (a[sortField] || "").toString().toLowerCase();
      const bv = (b[sortField] || "").toString().toLowerCase();
      if (sortDir === "asc") return av < bv ? -1 : av > bv ? 1 : 0;
      return av > bv ? -1 : av < bv ? 1 : 0;
    });
    return us;
  }, [registeredUsers, search, roleFilter, sortField, sortDir]);

  const totalUsers = (registeredUsers || []).length;
  const numCustomers = (registeredUsers || []).filter(u => (u.role || "customer") === "customer").length;
  const numAdmins = (registeredUsers || []).filter(u => u.role === "admin").length;
  const numVerified = (registeredUsers || []).filter(u => u.isPhoneConfirmed).length;

  const bi = useMemo(() => {
    const all = bookings || [];
    const getBookingRev = (b) => Number(b.finalBill) || Number(b.billing?.total) || 0;
    const isBookingPaid = (b) => b.isPaid || b.paymentStatus === 'PAID' || b.status === "Delivered" || b.isDelivered;

    const del = all.filter(b => b.status === "Delivered" || b.isDelivered);
    const paid = all.filter(isBookingPaid);
    const act = all.filter(b => !b.isDelivered && b.status !== "Delivered" && b.status !== "Declined" && b.status !== "Failed / Expired" && !b.isDeclined);
    const fail = all.filter(b => b.status === "Declined" || b.isDeclined || b.status === "Failed / Expired");
    const urg = all.filter(b => b.isUrgent || Number(b.urgentSurcharge) > 0);
    const totalRev = paid.reduce((s, b) => s + getBookingRev(b), 0);
    const pendRev = act.filter(b => !isBookingPaid(b)).reduce((s, b) => s + getBookingRev(b), 0);
    const urgRev = urg.reduce((s, b) => s + (Number(b.urgentSurcharge) || 0), 0);
    const avgOV = paid.length > 0 ? Math.round(totalRev / paid.length) : (del.length > 0 ? Math.round(totalRev / del.length) : 0);
    const convRate = all.length > 0 ? Math.round((del.length / all.length) * 100) : 0;
    const urgRate = all.length > 0 ? Math.round((urg.length / all.length) * 100) : 0;
    const monthly = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const mo = d.getMonth(), yr = d.getFullYear();
      const mb = all.filter(b => { if (!b.createdAt) return false; const bd = new Date(b.createdAt); return bd.getMonth() === mo && bd.getFullYear() === yr; });
      monthly.push({ 
        month: d.toLocaleString("en-IN", { month: "short" }), 
        Bookings: mb.length, 
        Revenue: mb.filter(isBookingPaid).reduce((s, b) => s + getBookingRev(b), 0) 
      });
    }
    const svcMap = {};
    all.forEach(b => { const s = b.serviceType || "Other"; svcMap[s] = (svcMap[s] || 0) + 1; });
    const svcData = Object.entries(svcMap).sort(([, a], [, b]) => b - a).slice(0, 6).map(([name, value]) => ({ name: name.length > 22 ? name.slice(0, 22) + "..." : name, value }));
    const stMap = {};
    all.forEach(b => { const s = b.status || "Unknown"; stMap[s] = (stMap[s] || 0) + 1; });
    const stData = Object.entries(stMap).map(([name, value]) => ({ name, value, color: STATUS_COLORS[name] || "#64748b" }));
    const custMap = {};
    all.forEach(b => {
      const key = `${b.customerName || "Unknown"}__${b.customerPhone || ""}`;
      if (!custMap[key]) custMap[key] = { name: b.customerName || "Unknown", count: 0, revenue: 0 };
      custMap[key].count++;
      if (isBookingPaid(b)) custMap[key].revenue += getBookingRev(b);
    });
    const topCust = Object.values(custMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    const radar = [
      { subject: "Conversion", value: convRate },
      { subject: "Delivery", value: all.length > 0 ? Math.round((del.length / all.length) * 100) : 0 },
      { subject: "Urgency", value: urgRate },
      { subject: "Collection", value: (totalRev + pendRev) > 0 ? Math.min(100, Math.round((totalRev / (totalRev + pendRev)) * 100)) : 0 },
      { subject: "Utilization", value: all.length > 0 ? Math.round((act.length / all.length) * 100) : 0 },
    ];
    const pickMap = {};
    all.forEach(b => { const pt = b.location?.pickupType || "Unknown"; pickMap[pt] = (pickMap[pt] || 0) + 1; });
    const pickData = Object.entries(pickMap).sort(([, a], [, b]) => b - a).map(([name, value]) => ({ name: name.length > 20 ? name.slice(0, 20) + "..." : name, value }));
    return { total: all.length, delivered: del.length, active: act.length, failed: fail.length, urgent: urg.length, urgRate, totalRev, pendRev, urgRev, avgOV, convRate, monthly, svcData, stData, topCust, radar, pickData };
  }, [bookings]);

  const roleBadge = role => {
    const m = { admin: { label: "Admin", cls: "bg-sky-500/20 text-sky-300 border-sky-500/40" }, mechanic: { label: "Mechanic", cls: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" }, customer: { label: "Customer", cls: "bg-amber-500/20 text-amber-300 border-amber-500/40" } };
    const { label, cls } = m[role] || m.customer;
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${cls}`}>{label}</span>;
  };

  const handleExport = () => {
    const rows = [["UID", "Name", "Email", "Phone", "Role", "Password", "Verified", "Joined"], ...filteredUsers.map(u => [u.uid || "-", u.name || "-", u.email || "-", u.phone || "-", u.role || "customer", u.password || "-", u.isPhoneConfirmed ? "Yes" : "No", u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"])];
    const url = URL.createObjectURL(new Blob([rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n")], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = `users_${Date.now()}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  const handleExportBI = () => {
    const rows = [["Metric", "Value"], ["Total Bookings", bi.total], ["Delivered", bi.delivered], ["Active", bi.active], ["Failed", bi.failed], ["Urgent Jobs", bi.urgent], ["Total Revenue (Rs)", bi.totalRev], ["Pending Revenue (Rs)", bi.pendRev], ["Avg Order (Rs)", bi.avgOV], ["Conversion Rate (%)", bi.convRate]];
    const url = URL.createObjectURL(new Blob([rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n")], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = `bi_report_${Date.now()}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-[#060a14]/96 backdrop-blur-2xl py-4 sm:py-6 px-2 sm:px-4">
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-600/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500/6 rounded-full blur-[140px] pointer-events-none" />
      <div className="relative w-full max-w-7xl z-10 space-y-4">

        {/* HEADER */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 text-[10px] font-bold uppercase tracking-widest mb-1.5">
              <BarChart3 size={11} /> Intelligence Panel — Manager Access Only
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">Business Intelligence Center</h1>
            <p className="text-xs text-slate-400 mt-0.5 sm:mt-1">Revenue analytics, operational KPIs, user registry and data exports.</p>
          </div>
          <button onClick={onClose} className="p-2 sm:p-2.5 rounded-2xl bg-white/5 hover:bg-rose-500/15 border border-white/10 hover:border-rose-500/30 text-slate-400 hover:text-rose-300 transition-all shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* TABS */}
        <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/10 w-full sm:w-fit overflow-x-auto">
          {[{ id: "bi", label: "Business Intelligence", icon: TrendingUp }, { id: "users", label: "User Registry", icon: Users }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20" : "text-slate-400 hover:text-white"}`}>
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        {/* BI TAB */}
        {activeTab === "bi" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatCard icon={DollarSign} label="Total Revenue"  value={`Rs.${INR(bi.totalRev)}`} color="emerald" sub="Verified paid & delivered" />
              <StatCard icon={Clock}      label="Pending Revenue" value={`Rs.${INR(bi.pendRev)}`}  color="amber"   sub="Active pipeline"       />
              <StatCard icon={Target}     label="Avg. Order"      value={`Rs.${INR(bi.avgOV)}`}    color="sky"     sub="Per delivered job"     />
              <StatCard icon={CheckCircle2} label="Conversion"   value={`${bi.convRate}%`}          color="violet"  sub="Bookings to delivered" />
              <StatCard icon={Flame}      label="Urgent Jobs"     value={bi.urgent}                  color="rose"    sub={`${bi.urgRate}% of total`} />
              <StatCard icon={Zap}        label="Urgent Premium"  value={`Rs.${INR(bi.urgRev)}`}   color="cyan"    sub="Surcharge earned"     />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                {[
                  { label: "Total Bookings", value: bi.total,     color: "#38bdf8", icon: Layers        },
                  { label: "Delivered",       value: bi.delivered, color: "#10b981", icon: CheckCircle2  },
                  { label: "Active Jobs",     value: bi.active,    color: "#f59e0b", icon: Wrench        },
                  { label: "Cancelled",       value: bi.failed,    color: "#f43f5e", icon: AlertTriangle },
                ].map(item => (
                  <div key={item.label} className="p-3.5 rounded-2xl border border-white/10 bg-white/3 backdrop-blur-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: item.color + "22" }}>
                      <item.icon size={17} style={{ color: item.color }} />
                    </div>
                    <div>
                      <p className="text-xl font-black text-white">{item.value}</p>
                      <p className="text-[10px] text-slate-400">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="col-span-1 lg:col-span-2 p-5 rounded-2xl border border-white/10 bg-white/3 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-white">Monthly Performance Trend</p>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Last 6 months</span>
                </div>
                {bi.monthly.some(d => d.Bookings > 0 || d.Revenue > 0) ? (
                  <ResponsiveContainer width="100%" height={195}>
                    <AreaChart data={bi.monthly} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} /><stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTip />} />
                      <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
                      <Area type="monotone" dataKey="Bookings" stroke="#38bdf8" strokeWidth={2} fill="url(#gb)" dot={{ fill: "#38bdf8", r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                      <Area type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={2} fill="url(#gr)" dot={{ fill: "#10b981", r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-48 flex flex-col items-center justify-center gap-2 text-slate-600 text-sm">
                    <RefreshCw size={24} /> No booking data yet
                  </div>
                )}
              </div>

              <div className="p-5 rounded-2xl border border-white/10 bg-white/3 backdrop-blur-xl flex flex-col">
                <p className="text-sm font-bold text-white mb-3">Status Split</p>
                {bi.stData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie data={bi.stData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="value">
                        {bi.stData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip formatter={(v, n) => [`${v} orders`, n]} contentStyle={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <div className="h-36 flex items-center justify-center text-slate-600 text-sm">No data</div>}
                <div className="mt-auto space-y-1 max-h-28 overflow-y-auto">
                  {bi.stData.map((s, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[10px]">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="text-slate-400 flex-1 truncate">{s.name}</span>
                      <span className="text-white font-bold">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl border border-white/10 bg-white/3 backdrop-blur-xl">
                <p className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Wrench size={14} className="text-amber-400" /> Service Mix</p>
                {bi.svcData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={bi.svcData} layout="vertical" margin={{ top: 0, right: 15, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={92} />
                      <Tooltip content={<ChartTip suffix=" jobs" />} />
                      <Bar dataKey="value" name="Jobs" radius={[0, 6, 6, 0]}>
                        {bi.svcData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="h-44 flex items-center justify-center text-slate-600 text-sm">No service data</div>}
              </div>

              <div className="p-5 rounded-2xl border border-white/10 bg-white/3 backdrop-blur-xl">
                <p className="text-sm font-bold text-white mb-4 flex items-center gap-2"><BarChart3 size={14} className="text-violet-400" /> Operations Health</p>
                <ResponsiveContainer width="100%" height={185}>
                  <RadarChart data={bi.radar}>
                    <PolarGrid stroke="#ffffff10" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Score %" dataKey="value" stroke="#818cf8" fill="#818cf8" fillOpacity={0.25} dot={{ fill: "#818cf8", r: 3 }} />
                    <Tooltip formatter={v => [`${v}%`]} contentStyle={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 11 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col gap-3">
                <div className="p-5 rounded-2xl border border-white/10 bg-white/3 backdrop-blur-xl flex-1">
                  <p className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Star size={14} className="text-amber-400" /> Top Customers</p>
                  {bi.topCust.length > 0 ? (
                    <div className="space-y-2">
                      {bi.topCust.map((c, i) => (
                        <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/4 border border-white/8">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0 ${i === 0 ? "bg-gradient-to-br from-amber-500 to-orange-600" : i === 1 ? "bg-gradient-to-br from-slate-400 to-slate-600" : "bg-gradient-to-br from-amber-700 to-amber-900"}`}>{i + 1}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{c.name}</p>
                            <p className="text-[9px] text-slate-500">{c.count} bookings</p>
                          </div>
                          <p className="text-xs font-bold text-emerald-400 shrink-0">Rs.{INR(c.revenue)}</p>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-slate-500 text-xs text-center py-4">No data available</p>}
                </div>
                <div className="p-4 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent backdrop-blur-xl">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-2 flex items-center gap-1.5"><TrendingUp size={11} /> Revenue Snapshot</p>
                  {[{ label: "Realized", val: bi.totalRev, cls: "text-white" }, { label: "Pipeline", val: bi.pendRev, cls: "text-amber-300" }, { label: "Urgent Premium", val: bi.urgRev, cls: "text-rose-300" }].map(r => (
                    <div key={r.label} className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400">{r.label}</span>
                      <span className={`font-bold ${r.cls}`}>Rs.{INR(r.val)}</span>
                    </div>
                  ))}
                  <div className="h-px bg-white/10 my-2" />
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Total Potential</span>
                    <span className="text-emerald-400 font-black text-sm">Rs.{INR(bi.totalRev + bi.pendRev)}</span>
                  </div>
                </div>
              </div>
            </div>

            {bi.pickData.length > 0 && (
              <div className="p-5 rounded-2xl border border-white/10 bg-white/3 backdrop-blur-xl">
                <p className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Car size={14} className="text-sky-400" /> Pickup Channel Breakdown</p>
                <ResponsiveContainer width="100%" height={110}>
                  <BarChart data={bi.pickData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip suffix=" orders" />} />
                    <Bar dataKey="value" name="Orders" radius={[6, 6, 0, 0]}>
                      {bi.pickData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="flex justify-end">
              <button onClick={handleExportBI} className="px-5 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-sm font-bold flex items-center gap-2 transition-all">
                <Download size={14} /> Export BI Report (CSV)
              </button>
            </div>
          </div>
        )}

        {/* USER REGISTRY TAB */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard icon={Users}     label="Total Users"   value={totalUsers}   color="sky"     sub="All registered accounts" />
              <StatCard icon={User}      label="Customers"     value={numCustomers} color="amber"   sub="Active customers"        />
              <StatCard icon={Shield}    label="Admin / Staff" value={numAdmins}    color="emerald" sub="Admin and mechanic"      />
              <StatCard icon={UserCheck} label="Phone Verified" value={numVerified} color="rose"    sub="OTP confirmed"           />
            </div>

            <div className="p-4 rounded-2xl bg-white/3 border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="text" placeholder="Search by name, email, phone or UID..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-sky-500/50 text-white text-sm placeholder-slate-500 outline-none transition-all" />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {["ALL", "customer", "admin", "mechanic"].map(r => (
                  <button key={r} onClick={() => setRoleFilter(r)}
                    className={`px-3 py-2 rounded-xl text-[11px] font-bold transition-all capitalize ${roleFilter === r ? "bg-sky-500 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10"}`}>
                    {r === "ALL" ? "All Roles" : r}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowPasswords(p => !p)}
                  className={`px-3 py-2 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all ${showPasswords ? "bg-rose-500/20 text-rose-300 border-rose-500/30" : "bg-white/5 text-slate-300 border-white/10"}`}>
                  {showPasswords ? <EyeOff size={13} /> : <Eye size={13} />} {showPasswords ? "Hide" : "Show"} Passwords
                </button>
                <button onClick={handleExport} className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center gap-1.5 transition-all">
                  <Download size={13} /> Export CSV
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#070a14]/80 backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/3">
                      {[["uid","UID"],["name","Full Name"],["email","Email"],["phone","Phone"],["role","Role"],["password","Password"],["createdAt","Joined"]].map(([key, label]) => (
                        <th key={key} onClick={() => handleSort(key)} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 cursor-pointer hover:text-sky-300 transition-colors select-none whitespace-nowrap">
                          <div className="flex items-center gap-1.5">{label} <SortIcon field={key} /></div>
                        </th>
                      ))}
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan={8} className="text-center py-12 text-slate-500 text-sm">
                        <UserX size={28} className="mx-auto mb-2 text-slate-600" /> No users found matching your filters.
                      </td></tr>
                    ) : filteredUsers.map((user, i) => (
                      <tr key={user.uid || i} className="border-b border-white/5 hover:bg-white/4 transition-colors">
                        <td className="px-4 py-3 font-mono text-[10px] text-slate-500"><span className="bg-white/5 px-2 py-1 rounded-lg border border-white/8">{(user.uid || "-").slice(0, 10)}...</span></td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-[11px] font-black text-white shrink-0">{(user.name || "?")[0].toUpperCase()}</div>
                            <span className="text-sm font-semibold text-white">{user.name || "-"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3"><div className="flex items-center gap-1.5 text-slate-300 text-xs"><Mail size={11} className="text-slate-500" />{user.email || "-"}</div></td>
                        <td className="px-4 py-3"><div className="flex items-center gap-1.5 text-slate-300 text-xs font-mono whitespace-nowrap"><Phone size={11} className="text-slate-500" />{user.phone || "-"}{user.isPhoneConfirmed && <span className="px-1 py-0.5 rounded text-[8px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-bold">VFD</span>}</div></td>
                        <td className="px-4 py-3">{roleBadge(user.role || "customer")}</td>
                        <td className="px-4 py-3 font-mono text-xs">{showPasswords ? <span className="bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-lg text-rose-200 text-[11px]">{user.password || "-"}</span> : <span className="text-slate-600 tracking-widest">{"*".repeat(Math.min(user.password?.length || 8, 10))}</span>}</td>
                        <td className="px-4 py-3 text-[11px] text-slate-500 whitespace-nowrap"><div className="flex items-center gap-1"><Calendar size={10} />{user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }) : "Pre-existing"}</div></td>
                        <td className="px-4 py-3"><button onClick={() => setSelectedUser(user)} className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/25 text-sky-300 transition-all">View</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t border-white/5 bg-white/2 flex items-center justify-between">
                <p className="text-[11px] text-slate-500">Showing <span className="text-sky-300 font-bold">{filteredUsers.length}</span> of <span className="text-white font-bold">{totalUsers}</span> users</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-600"><Activity size={10} /> Real-time from localStorage</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl" onClick={() => setSelectedUser(null)}>
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#0a0e1c] shadow-2xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-black text-white text-lg">User Detail</h3>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-sky-500/10 to-indigo-500/10 border border-sky-500/20">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-xl font-black text-white">{(selectedUser.name || "?")[0].toUpperCase()}</div>
              <div><h4 className="font-bold text-white">{selectedUser.name || "-"}</h4><div className="mt-1">{roleBadge(selectedUser.role || "customer")}</div></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Hash,      label: "User ID",  value: selectedUser.uid },
                { icon: Mail,      label: "Email",    value: selectedUser.email },
                { icon: Phone,     label: "Phone",    value: selectedUser.phone },
                { icon: Shield,    label: "Password", value: showPasswords ? selectedUser.password : "*".repeat(Math.min(selectedUser.password?.length || 8, 12)) },
                { icon: UserCheck, label: "Verified", value: selectedUser.isPhoneConfirmed ? "Yes" : "No" },
                { icon: Calendar,  label: "Joined",   value: selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Pre-existing" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="p-3 rounded-xl bg-white/5 border border-white/8">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1"><Icon size={10} /> {label}</div>
                  <p className={`text-xs font-semibold break-all ${label === "Password" ? "font-mono text-rose-200" : "text-white"}`}>{value || "-"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
