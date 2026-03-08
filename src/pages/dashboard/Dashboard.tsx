import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import {
    Users,
    Car,
    MapPin,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Activity,
    ArrowRight,
    Clock,
    CheckCircle2,
    RefreshCw,
    Zap,
    Target,
    ShieldCheck,
    Navigation2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from "recharts"

const revenueData = [
    { name: 'MON', value: 4200 },
    { name: 'TUE', value: 3800 },
    { name: 'WED', value: 5900 },
    { name: 'THU', value: 7200 },
    { name: 'FRI', value: 6400 },
    { name: 'SAT', value: 8900 },
    { name: 'SUN', value: 7500 },
]

const bookingsData = [
    { name: 'MON', completed: 200, cancelled: 12 },
    { name: 'TUE', completed: 150, cancelled: 25 },
    { name: 'WED', completed: 300, cancelled: 8 },
    { name: 'THU', completed: 400, cancelled: 15 },
    { name: 'FRI', completed: 350, cancelled: 22 },
    { name: 'SAT', completed: 500, cancelled: 5 },
    { name: 'SUN', completed: 450, cancelled: 14 },
]

export default function Dashboard() {
    const { data: stats, isLoading, refetch } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const [
                { count: userCount },
                { count: driverCount },
                { count: bookingCount },
                { data: resData },
                { count: activeDriverCount }
            ] = await Promise.all([
                supabase.from("profiles").select("*", { count: "exact", head: true }),
                supabase.from("drivers").select("*", { count: "exact", head: true }).eq('status', 'approved'),
                supabase.from("bookings").select("*", { count: "exact", head: true }),
                supabase.from("payments").select("amount"),
                supabase.from("drivers").select("*", { count: "exact", head: true }).eq('is_online', true)
            ])

            const totalRevenue = resData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0

            return {
                users: userCount || 0,
                drivers: driverCount || 0,
                bookings: bookingCount || 0,
                revenue: totalRevenue,
                activeDrivers: activeDriverCount || 0
            }
        },
        initialData: {
            users: 0,
            drivers: 0,
            bookings: 0,
            revenue: 0,
            activeDrivers: 0
        }
    })

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-12 p-2"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 skeuo-logo-bg bg-blue-600 flex items-center justify-center rounded-2xl shadow-skeuo-md relative overflow-hidden group">
                        <Navigation2 size={32} className="text-white fill-white/10 group-hover:rotate-45 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"></div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-blue-900 tracking-tighter uppercase leading-none">Global Commander</h1>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Grid Intelligence Feed: 100% Operational
                        </p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Button onClick={() => refetch()} variant="skeuo" className="h-14 px-8 text-[10px] font-black uppercase tracking-widest gap-4 shadow-skeuo-sm bg-white text-blue-600 border-white">
                        <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                        Node Sync
                    </Button>
                    <Button variant="skeuo" className="h-14 px-8 text-[10px] font-black uppercase tracking-widest gap-4 shadow-skeuo-md bg-blue-600 text-white">
                        <Zap size={16} fill="white" />
                        Audit Cycle
                    </Button>
                </div>
            </div>

            {/* Core telemetry widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                <StatsCard
                    title="Treasury Yield"
                    value={`₹${stats?.revenue.toLocaleString() || '0'}`}
                    icon={DollarSign}
                    trend="+15.2%"
                    trendUp={true}
                    color="blue"
                    loading={isLoading}
                />
                <StatsCard
                    title="Active Vectors"
                    value={stats?.bookings.toString() || '0'}
                    icon={Target}
                    trend="+7.4%"
                    trendUp={true}
                    color="emerald"
                    loading={isLoading}
                />
                <StatsCard
                    title="Fleet Nodes"
                    value={stats?.activeDrivers.toString() || '0'}
                    icon={Car}
                    trend="-1.8%"
                    trendUp={false}
                    color="blue"
                    loading={isLoading}
                />
                <StatsCard
                    title="User Grid"
                    value={stats?.users.toString() || '0'}
                    icon={Users}
                    trend="+10.1%"
                    trendUp={true}
                    color="blue"
                    loading={isLoading}
                />
            </div>

            {/* Central Analytics Hub */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <Card className="lg:col-span-2 skeuo-card border-white p-8 overflow-hidden bg-white/40 group relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Activity size={120} className="text-blue-600" />
                    </div>
                    <CardHeader className="p-0 mb-10">
                        <h3 className="text-sm font-black text-blue-900 uppercase tracking-tighter">Revenue Pulse</h3>
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mt-1">Real-time financial waveform analysis</p>
                    </CardHeader>
                    <div className="h-[340px] w-full skeuo-inset rounded-[32px] p-6 border-white/10 bg-slate-50/50">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 9, fontWeight: 900 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 9, fontWeight: 900 }} tickFormatter={(value) => `₹${value}`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '20px', border: '1px solid white', background: 'white', backdropFilter: 'blur(20px)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={5} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="lg:col-span-1 skeuo-card border-white p-8 bg-white/40 h-full">
                    <CardHeader className="p-0 mb-10">
                        <h3 className="text-sm font-black text-blue-900 uppercase tracking-tighter">Dispatch Matrix</h3>
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mt-1">Transit stability indices</p>
                    </CardHeader>
                    <div className="h-[340px] w-full skeuo-inset rounded-[32px] p-6 border-white/10 bg-slate-50/50">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={bookingsData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 9, fontWeight: 900 }} dy={10} />
                                <Bar dataKey="completed" name="OPERATIONAL" fill="#3b82f6" radius={[6, 6, 6, 6]} barSize={12} />
                                <Bar dataKey="cancelled" name="ABORTED" fill="#93c5fd" radius={[6, 6, 6, 6]} barSize={12} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Operational Logs & Critical Overrides */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pb-16">
                <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.3em] px-2 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                        Intelligence Logs
                    </h4>
                    <div className="space-y-4">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="skeuo-card border-white p-5 flex items-center justify-between bg-white/60 hover:bg-white transition-all shadow-skeuo-sm group cursor-pointer active:scale-[0.98]">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 skeuo-button border-white/40 flex items-center justify-center text-blue-600 bg-white shadow-skeuo-xs">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-blue-900 uppercase tracking-tight line-clamp-1">Transit Protocol Finalized</p>
                                        <p className="text-[8px] font-black text-blue-300 uppercase tracking-widest mt-1">NODE_ID: DS_{1024 + i} • T-MIN {i * 8 + 4} MINS</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-emerald-500 tracking-tighter">+₹{800 + i * 150}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.3em] px-2 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
                        Tactical Overrides
                    </h4>
                    <Card className="skeuo-card border-white p-8 bg-blue-600 shadow-skeuo-lg relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white opacity-5 rounded-full blur-[80px] group-hover:scale-110 transition-transform duration-1000"></div>

                        <div className="space-y-4 relative z-10">
                            <OverrideButton label="Authorize Pending Nodes" />
                            <OverrideButton label="Audit Regional Telemetry" />
                            <OverrideButton label="Initialize Grid Flush" danger />
                        </div>
                    </Card>
                </div>
            </div>
        </motion.div>
    )
}

function OverrideButton({ label, danger }: any) {
    return (
        <button className={`w-full flex items-center justify-between h-16 px-8 rounded-2xl bg-white/10 border border-white/20 skeuo-inset hover:bg-white/20 transition-all text-white active:scale-[0.98] group/btn
            ${danger ? 'hover:bg-red-500/20 hover:border-red-500/40' : ''}
        `}>
            <span className="text-[9px] font-black uppercase tracking-[0.25em]">{label}</span>
            <div className="w-8 h-8 rounded-xl skeuo-button border-white/20 flex items-center justify-center bg-white/10 group-hover/btn:scale-110 transition-transform">
                <ArrowRight size={14} className={danger ? 'text-red-200' : 'text-blue-100'} />
            </div>
        </button>
    )
}

function StatsCard({ title, value, icon: Icon, trend, trendUp, color, loading }: any) {
    return (
        <Card className="skeuo-card border-white p-6 relative shadow-skeuo-md bg-white/40 group hover:-translate-y-2 transition-all duration-500 overflow-hidden h-48 justify-center flex flex-col">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                <Icon size={100} />
            </div>
            <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 skeuo-button flex items-center justify-center rounded-2xl shadow-skeuo-sm transition-transform duration-700 group-hover:rotate-[360deg]
                    ${color === 'emerald' ? 'bg-emerald-600' : 'bg-blue-600'} text-white`}>
                    <Icon size={26} className="drop-shadow-sm" />
                </div>
                <div className={`skeuo-inset px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border-white/20 flex items-center gap-1.5
                    ${trendUp ? 'text-emerald-500 bg-emerald-50' : 'text-red-500 bg-red-50'}`}>
                    {trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {trend}
                </div>
            </div>

            <div className="space-y-1 relative z-10">
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1.5">{title}</p>
                {loading ? (
                    <div className="h-10 w-32 skeuo-inset bg-slate-100 rounded-2xl animate-pulse" />
                ) : (
                    <h2 className="text-3xl font-black text-blue-900 tracking-tighter drop-shadow-sm">{value}</h2>
                )}
            </div>
        </Card>
    )
}
