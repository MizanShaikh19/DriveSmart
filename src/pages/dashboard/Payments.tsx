import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import {
    DollarSign,
    CreditCard,
    Download,
    ArrowDownLeft,
    MoreHorizontal,
    RefreshCw,
    Clock,
    TrendingUp,
    Terminal,
    ArrowRight
} from "lucide-react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts"
import { format } from "date-fns"
import toast from "react-hot-toast"

interface Payment {
    id: string
    amount: number
    status: string
    payment_method: string | null
    transaction_id: string | null
    created_at: string
    booking: {
        id: string
        pickup_address: string | null
        drop_address: string | null
    } | null
}

const STATUS_CONFIG: Record<string, { color: string, label: string, bg: string }> = {
    pending: { color: "text-amber-500", label: "Authorization Pending", bg: "bg-amber-500" },
    paid: { color: "text-emerald-500", label: "Funds Secured", bg: "bg-emerald-500" },
    refunded: { color: "text-slate-400", label: "Reversed Flow", bg: "bg-slate-400" },
    failed: { color: "text-red-500", label: "Packet Drop", bg: "bg-red-500" },
}

export default function Payments() {
    const [filter, setFilter] = useState("all")

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['payments'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("payments")
                .select(`
                    *,
                    booking:booking_id (id, pickup_address, drop_address)
                `)
                .order("created_at", { ascending: false })

            if (error) {
                toast.error("Handshake error with treasury node.")
                throw error
            }

            const last7Days = [...Array(7)].map((_, i) => {
                const d = new Date()
                d.setDate(d.getDate() - i)
                return format(d, 'MMM dd')
            }).reverse()

            const chartData = last7Days.map(date => {
                const dayTotal = (data || [])
                    .filter(p => format(new Date(p.created_at), 'MMM dd') === date && p.status === 'paid')
                    .reduce((sum, p) => sum + p.amount, 0)
                return { name: date, total: dayTotal }
            })

            return {
                payments: (data || []) as Payment[],
                revenueData: chartData
            }
        },
        initialData: {
            payments: [],
            revenueData: []
        }
    })

    const { payments, revenueData } = data
    const filteredPayments = payments.filter(p => filter === "all" || p.status === filter)
    const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
    const pendingAmount = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-10 p-2"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-xl font-black text-blue-900 tracking-[0.2em] uppercase flex items-center gap-3">
                        <div className="w-10 h-10 skeuo-button bg-blue-600 flex items-center justify-center rounded-xl shadow-skeuo-sm">
                            <TrendingUp size={20} className="text-white fill-white/10" />
                        </div>
                        Financial Ledger
                    </h1>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-2 ml-13">Treasury monitoring and transaction verification</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => refetch()} variant="skeuo" size="icon" className="w-12 h-12 rounded-2xl">
                        <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                    </Button>
                    <Button variant="skeuo" className="h-12 px-6 text-[10px] font-black uppercase tracking-widest gap-2 bg-blue-600 text-white shadow-skeuo-md">
                        <Download size={16} /> Export Logs
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatsCard icon={DollarSign} label="Total Throughput" value={`₹${totalRevenue.toLocaleString()}`} color="emerald" detail="+12.5% V-Trend" />
                <StatsCard icon={Clock} label="Authorization Pending" value={`₹${pendingAmount.toLocaleString()}`} color="amber" detail={`${payments.filter(p => p.status === 'pending').length} Active Nodes`} />
                <StatsCard icon={CreditCard} label="Successful Syncs" value={payments.filter(p => p.status === 'paid').length.toString()} color="blue" detail={`${((payments.filter(p => p.status === 'paid').length / payments.length || 0) * 100).toFixed(1)}% Efficiency`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Revenue Chart */}
                <Card className="lg:col-span-2 skeuo-card border-white/80 p-6 overflow-hidden">
                    <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
                        <div>
                            <h3 className="text-sm font-black text-blue-900 uppercase tracking-tighter">Throughput Overview</h3>
                            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mt-1">7-Day Transaction Waveforms</p>
                        </div>
                        <div className="w-10 h-10 skeuo-inset bg-slate-50 flex items-center justify-center rounded-xl text-blue-300">
                            <Terminal size={16} />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="h-[300px] w-full skeuo-inset bg-slate-50/50 rounded-3xl p-6 border-white/10">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900 }}
                                        tickFormatter={(val) => `₹${val}`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(59, 130, 246, 0.05)', radius: 8 }}
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            borderRadius: '16px',
                                            border: '1px solid white',
                                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                            backdropFilter: 'blur(8px)',
                                            padding: '12px'
                                        }}
                                        itemStyle={{ color: '#1e3a8a', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase' }}
                                        labelStyle={{ color: '#94a3b8', fontWeight: 900, fontSize: '8px', textTransform: 'uppercase', marginBottom: '4px' }}
                                    />
                                    <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 4, 4]} barSize={24} shadow-color="rgba(59, 130, 246, 0.3)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent High-Pass Transactions */}
                <Card className="skeuo-card border-white/80 p-0 flex flex-col h-full bg-white/40">
                    <CardHeader className="p-6 border-b border-white/40 bg-white/30">
                        <h3 className="text-sm font-black text-blue-900 uppercase tracking-tighter">Recent Packet Flow</h3>
                    </CardHeader>
                    <CardContent className="p-6 flex-1 overflow-auto">
                        <div className="space-y-6">
                            {filteredPayments.slice(0, 5).map(payment => (
                                <div key={payment.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 skeuo-button border-white/40 flex items-center justify-center rounded-xl shadow-skeuo-sm
                                            ${payment.status === 'paid' ? 'bg-emerald-50 text-emerald-500' :
                                                payment.status === 'failed' ? 'bg-red-50 text-red-500' :
                                                    'bg-slate-50 text-slate-400'
                                            }`}>
                                            {payment.status === 'paid' ? <ArrowDownLeft size={16} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-blue-900 uppercase tracking-tight">
                                                {payment.booking?.pickup_address ? 'Transit Settlement' : 'Top-up Protocol'}
                                            </p>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                                {format(new Date(payment.created_at), 'MMM d, HH:mm')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-black tracking-tighter ${payment.status === 'paid' ? 'text-emerald-500' : 'text-blue-900'}`}>
                                            {payment.status === 'paid' ? '+' : ''}₹{payment.amount}
                                        </p>
                                        <div className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm mt-1 inline-block ${STATUS_CONFIG[payment.status]?.bg} text-white`}>
                                            {payment.status}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredPayments.length === 0 && (
                                <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-widest py-10">No packet data found</p>
                            )}
                        </div>
                    </CardContent>
                    <div className="p-4 border-t border-white/40 bg-white/30">
                        <Button variant="ghost" className="w-full h-12 text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] hover:bg-transparent hover:text-blue-700">
                            Expand Registry <ArrowRight size={12} className="ml-2" />
                        </Button>
                    </div>
                </Card>
            </div>

            <Card className="skeuo-card border-white/80 overflow-hidden shadow-skeuo-md bg-white/40">
                <CardHeader className="p-6 border-b border-white/40 bg-white/30 flex flex-row items-center justify-between">
                    <h3 className="text-sm font-black text-blue-900 uppercase tracking-tighter">Sub-Node Ledger</h3>
                    <div className="skeuo-inset p-1 bg-slate-200/30 rounded-xl border-white/20 flex gap-1">
                        {['all', 'paid', 'pending', 'failed'].map(s => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all
                                    ${filter === s
                                        ? 'skeuo-button bg-blue-600 text-white shadow-skeuo-sm'
                                        : 'text-blue-900/40'
                                    }
                                `}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#F5F9FF] border-b border-white/40">
                                <tr>
                                    <th className="py-5 px-8 text-[9px] font-black text-blue-400 uppercase tracking-widest">Temporal Node</th>
                                    <th className="py-5 px-8 text-[9px] font-black text-blue-400 uppercase tracking-widest">Metadata</th>
                                    <th className="py-5 px-8 text-[9px] font-black text-blue-400 uppercase tracking-widest">Channel</th>
                                    <th className="py-5 px-8 text-[9px] font-black text-blue-400 uppercase tracking-widest">Registry Status</th>
                                    <th className="py-5 px-8 text-right text-[9px] font-black text-blue-400 uppercase tracking-widest">Throughput</th>
                                    <th className="py-5 px-8"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/40">
                                {filteredPayments.map(payment => (
                                    <tr key={payment.id} className="hover:bg-white/40 transition-colors">
                                        <td className="py-5 px-8 text-[10px] font-black text-blue-900/60 uppercase tracking-tighter">
                                            {format(new Date(payment.created_at), 'MMM d, yyyy')}
                                        </td>
                                        <td className="py-5 px-8">
                                            <p className="text-[11px] font-black text-blue-900 uppercase tracking-tight">
                                                {payment.booking?.pickup_address?.split(',')[0] || 'System Overhead'}
                                            </p>
                                            <p className="text-[9px] font-mono text-slate-400 mt-1 uppercase">HEX: {payment.transaction_id || payment.id.slice(0, 12)}</p>
                                        </td>
                                        <td className="py-5 px-8 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                                            {payment.payment_method || 'Internal'}
                                        </td>
                                        <td className="py-5 px-8">
                                            <div className={`skeuo-inset px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border-white/10 w-fit ${STATUS_CONFIG[payment.status]?.color}`}>
                                                {STATUS_CONFIG[payment.status]?.label}
                                            </div>
                                        </td>
                                        <td className="py-5 px-8 text-right text-[12px] font-black text-blue-900 tracking-tighter">
                                            ₹{payment.amount}
                                        </td>
                                        <td className="py-5 px-8 text-right">
                                            <div className="w-8 h-8 skeuo-button border-white/20 flex items-center justify-center rounded-lg bg-slate-50/50 ml-auto">
                                                <MoreHorizontal size={14} className="text-blue-300" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

function StatsCard({ icon: Icon, label, value, color, detail }: any) {
    const accents = {
        blue: "text-blue-600 bg-blue-500/10 border-blue-100",
        amber: "text-amber-500 bg-amber-500/10 border-amber-100",
        emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-100",
    }
    const colorKey = color as keyof typeof accents

    return (
        <Card className="skeuo-card border-white/60 p-6 flex flex-col gap-5 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
            <div className="flex items-center gap-5 relative z-10">
                <div className={`w-14 h-14 skeuo-button flex items-center justify-center rounded-2xl shadow-skeuo-sm border-white/40 ${accents[colorKey]}`}>
                    <Icon size={24} className="drop-shadow-sm" />
                </div>
                <div>
                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-3xl font-black text-blue-900 tracking-tighter">{value}</p>
                </div>
            </div>
            <div className="skeuo-inset px-3 py-1 rounded-lg border-white/10 w-fit relative z-10">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{detail}</p>
            </div>
        </Card>
    )
}
