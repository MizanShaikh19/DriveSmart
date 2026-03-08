import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts"
import { TrendingUp, Wallet, Clock, ArrowUpRight, Zap, Target, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

export default function Earnings() {
    const [loading, setLoading] = useState(true)
    const [driverTrips, setDriverTrips] = useState<any[]>([])

    // Stats
    const [todayEarnings, setTodayEarnings] = useState(0)
    const [weeklyEarnings, setWeeklyEarnings] = useState(0)
    const [totalTrips, setTotalTrips] = useState(0)
    const [weeklyData, setWeeklyData] = useState<any[]>([])

    useEffect(() => {
        fetchEarningsData()
    }, [])

    const fetchEarningsData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('bookings')
                .select('id, created_at, fare_amount, distance_km, status, pickup_address, drop_address')
                .eq('driver_id', user.id)
                .eq('status', 'completed')
                .order('created_at', { ascending: false })

            if (error) throw error
            const trips = data || []
            setDriverTrips(trips)
            setTotalTrips(trips.length)

            calculateStats(trips)

        } catch (error) {
            console.error("Failed to fetch earnings:", error)
            toast.error("Handshake with treasury node failed.")
        } finally {
            setLoading(false)
        }
    }

    const calculateStats = (trips: any[]) => {
        const now = new Date()
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const sevenDaysAgo = new Date(startOfToday)
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)

        let todaySum = 0
        let weekSum = 0

        const daysMap = new Map()
        for (let i = 0; i < 7; i++) {
            const d = new Date(sevenDaysAgo)
            d.setDate(d.getDate() + i)
            daysMap.set(d.toDateString(), {
                dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
                dateStr: d.toDateString(),
                amount: 0
            })
        }

        trips.forEach(trip => {
            const tripDate = new Date(trip.created_at)
            const fare = trip.fare_amount || 0

            if (tripDate >= startOfToday) {
                todaySum += fare
            }

            if (tripDate >= sevenDaysAgo) {
                weekSum += fare
                const tripDateStr = new Date(tripDate.getFullYear(), tripDate.getMonth(), tripDate.getDate()).toDateString()
                if (daysMap.has(tripDateStr)) {
                    const dayData = daysMap.get(tripDateStr)
                    dayData.amount += fare
                    daysMap.set(tripDateStr, dayData)
                }
            }
        })

        setTodayEarnings(todaySum)
        setWeeklyEarnings(weekSum)
        setWeeklyData(Array.from(daysMap.values()))
    }

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-[#F5F9FF] gap-4">
                <Zap className="animate-pulse text-blue-600 skeuo-logo-glow" size={32} />
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Synching Treasury Logs...</span>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex flex-col bg-[#F5F9FF]"
        >
            <header className="p-6 shrink-0 z-10">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 skeuo-button bg-blue-600 flex items-center justify-center rounded-2xl shadow-skeuo-sm">
                        <Wallet size={24} className="text-white fill-white/10" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-blue-900 tracking-[0.2em] uppercase leading-none">Command Revenue Deck</h1>
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            Active Treasury Link
                        </p>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 pb-28 space-y-10">

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-6">
                    <SummaryCard
                        label="Packet Yield (24H)"
                        value={`₹${todayEarnings}`}
                        icon={TrendingUp}
                        color="blue"
                        accent="bg-blue-600"
                    />
                    <SummaryCard
                        label="Cycle Throughput (7D)"
                        value={`₹${weeklyEarnings}`}
                        icon={Target}
                        color="emerald"
                        accent="bg-emerald-600"
                    />
                </div>

                {/* Performance waveform */}
                <Card className="skeuo-card border-white/80 p-6 overflow-hidden bg-white/40">
                    <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
                        <div>
                            <h3 className="text-sm font-black text-blue-900 uppercase tracking-tighter">Performance Waveform</h3>
                            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mt-1">7-Cycle Revenue Distribution</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-black text-blue-900 tracking-tighter">{totalTrips}</p>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Node Exits</p>
                        </div>
                    </CardHeader>
                    <div className="h-56 w-full skeuo-inset bg-slate-50/50 rounded-2xl p-4 border-white/10">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                                <XAxis
                                    dataKey="dayName"
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
                                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)', radius: 4 }}
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        borderRadius: '12px',
                                        border: '1px solid white',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                        fontSize: '10px',
                                        fontWeight: 900,
                                        textTransform: 'uppercase'
                                    }}
                                />
                                <Bar dataKey="amount" radius={[4, 4, 4, 4]} barSize={20}>
                                    {weeklyData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.dateStr === new Date().toDateString() ? '#2563eb' : '#93c5fd'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Registry Logs */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.25em] px-1 flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                        Historical Transit Logs
                    </h3>

                    <div className="space-y-4">
                        <AnimatePresence>
                            {driverTrips.slice(0, 10).map((trip, idx) => (
                                <motion.div
                                    key={trip.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="skeuo-card border-white/80 p-5 flex items-center justify-between group bg-white/60 hover:bg-white transition-all shadow-skeuo-sm active:scale-[0.98]"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 skeuo-inset bg-emerald-50 border-white/40 flex items-center justify-center rounded-xl text-emerald-500 shrink-0">
                                            <Target size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-blue-900 uppercase tracking-tight line-clamp-1">{trip.drop_address?.split(',')[0]}</p>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                    <Clock size={10} className="text-blue-300" />
                                                    {new Date(trip.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                </span>
                                                <div className="w-1 h-1 rounded-full bg-slate-200" />
                                                <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">{trip.distance_km} KM VECTOR</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="text-sm font-black text-emerald-500 tracking-tighter">+₹{trip.fare_amount}</p>
                                        <div className="w-8 h-8 skeuo-button border-white/20 flex items-center justify-center rounded-lg bg-slate-50/50">
                                            <ChevronRight size={14} className="text-blue-200 group-hover:text-blue-400 transition-colors" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {driverTrips.length === 0 && (
                            <div className="py-20 skeuo-inset mx-4 rounded-[40px] border-white/10 text-center">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No registry records found</p>
                            </div>
                        )}

                        {driverTrips.length > 5 && (
                            <Button variant="ghost" className="w-full h-14 text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] hover:bg-transparent">
                                Full Registry Access <ArrowUpRight size={14} className="ml-2" />
                            </Button>
                        )}
                    </div>
                </div>

            </main>
        </motion.div>
    )
}

function SummaryCard({ label, value, icon: Icon, color, accent }: any) {
    return (
        <Card className="skeuo-card border-white/80 p-5 flex flex-col gap-5 overflow-hidden relative shadow-skeuo-md group h-40 justify-center">
            <div className={`absolute top-0 right-0 w-20 h-20 opacity-5 -mr-8 -mt-8 ${accent} rounded-full transition-transform group-hover:scale-150 duration-700`} />
            <div className={`w-12 h-12 skeuo-button border-white/40 flex items-center justify-center rounded-2xl shadow-skeuo-sm ${color === 'blue' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}`}>
                <Icon size={20} className="drop-shadow-sm" />
            </div>
            <div>
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1.5">{label}</p>
                <p className="text-2xl font-black text-blue-900 tracking-tighter">{value}</p>
            </div>
        </Card>
    )
}
