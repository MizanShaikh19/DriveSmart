import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import {
    CheckCircle,
    XCircle,
    Search,
    Car,
    Star,
    Activity,
    Clock,
    RefreshCw,
    ShieldCheck,
    UserCircle,
    Mail,
    IdCard,
    ChevronRight,
    Zap
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import toast from "react-hot-toast"

interface Driver {
    id: string
    license_number: string | null
    status: string
    rating: number
    is_online: boolean
    total_rides: number
    profiles: {
        email: string
        full_name: string | null
    } | null
}

const STATUS_CONFIG: Record<string, { color: string, label: string, bg: string }> = {
    approved: { color: "text-emerald-500", label: "Active Duty", bg: "bg-emerald-500" },
    pending: { color: "text-amber-500", label: "Pending Audit", bg: "bg-amber-500" },
    rejected: { color: "text-red-500", label: "Access Denied", bg: "bg-red-500" },
    suspended: { color: "text-slate-500", label: "Sync Suspended", bg: "bg-slate-500" }
}

export default function Drivers() {
    const [filter, setFilter] = useState<string>("all")
    const [search, setSearch] = useState("")

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['drivers'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("drivers")
                .select("*")
                .order("created_at", { ascending: false })

            if (error) {
                toast.error("Telemetry link failure.")
                throw error
            }

            const driversWithProfiles = await Promise.all(
                (data || []).map(async (driver) => {
                    const { data: profile } = await supabase
                        .from("profiles")
                        .select("email, full_name")
                        .eq("id", driver.id)
                        .single()
                    return { ...driver, profiles: profile }
                })
            )

            const total = driversWithProfiles.length
            const pending = driversWithProfiles.filter(d => d.status === 'pending').length
            const online = driversWithProfiles.filter(d => d.is_online).length
            const avgRating = total > 0
                ? driversWithProfiles.reduce((acc, curr) => acc + (curr.rating || 0), 0) / total
                : 0

            return {
                drivers: driversWithProfiles,
                stats: { total, pending, online, avgRating }
            }
        },
        initialData: {
            drivers: [],
            stats: { total: 0, pending: 0, online: 0, avgRating: 0 }
        }
    })

    const { drivers, stats } = data

    const updateDriverStatus = async (driverId: string, status: string, name: string) => {
        const { error } = await supabase
            .from("drivers")
            .update({ status })
            .eq("id", driverId)

        if (error) {
            toast.error("Authorization protocol failed.")
        } else {
            toast.success(`Identity ${name} marked as ${status}`)
            refetch()
        }
    }

    const filteredDrivers = drivers.filter((driver: Driver) => {
        const matchesStatus = filter === "all" || driver.status === filter
        const matchesSearch =
            driver.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            driver.profiles?.email?.toLowerCase().includes(search.toLowerCase()) ||
            driver.license_number?.toLowerCase().includes(search.toLowerCase())

        return matchesStatus && (matchesSearch || false)
    })

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
                            <IdCard size={20} className="text-white fill-white/10" />
                        </div>
                        Fleet Registry
                    </h1>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-2 ml-13">Identity verification and telemetry monitoring</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={() => refetch()}
                        variant="skeuo"
                        size="icon"
                        className="w-12 h-12 rounded-2xl"
                    >
                        <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                    </Button>
                </div>
            </div>

            {/* Stats Deck */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard icon={Car} label="Fleet Size" value={stats.total.toString()} color="blue" />
                <StatsCard icon={Clock} label="Pending Audit" value={stats.pending.toString()} color="amber" />
                <StatsCard icon={Activity} label="Active Nodes" value={stats.online.toString()} color="emerald" />
                <StatsCard icon={Star} label="Fleet Quality" value={stats.avgRating.toFixed(1)} color="blue" suffix="★" />
            </div>

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between gap-6 items-center">
                    <div className="skeuo-inset p-1.5 bg-slate-200/30 rounded-2xl border-white/20 flex gap-1 overflow-x-auto scrollbar-hide w-full md:w-auto">
                        {["all", "pending", "approved", "rejected"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap
                                    ${filter === status
                                        ? 'skeuo-button bg-blue-600 text-white shadow-skeuo-sm scale-105'
                                        : 'text-blue-900/40 hover:text-blue-900/60'
                                    }
                                `}
                            >
                                {status === 'approved' ? 'Active' : status}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-80 h-12">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400">
                            <Search size={16} />
                        </div>
                        <Input
                            placeholder="Search nodes by identity..."
                            className="w-full h-full pl-12 pr-4 skeuo-inset bg-slate-50/50 rounded-2xl border-white/10 text-[11px] font-bold text-blue-900 placeholder:text-slate-300 uppercase tracking-tight focus-visible:ring-0 focus-visible:border-white/40"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {isLoading ? (
                            [...Array(6)].map((_, i) => (
                                <div key={i} className="h-80 skeuo-card border-white/40 bg-white/20 skeuo-logo-glow animate-pulse rounded-[32px]" />
                            ))
                        ) : filteredDrivers.length === 0 ? (
                            <div className="col-span-full py-24 skeuo-inset mx-4 rounded-[40px] border-white/10 text-center">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No registry records found</p>
                            </div>
                        ) : (
                            filteredDrivers.map((driver: Driver) => (
                                <DriverCard
                                    key={driver.id}
                                    driver={driver}
                                    onUpdate={updateDriverStatus}
                                />
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    )
}

function DriverCard({ driver, onUpdate }: { driver: Driver, onUpdate: any }) {
    const status = STATUS_CONFIG[driver.status] || STATUS_CONFIG.suspended

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="skeuo-card border-white/80 overflow-hidden shadow-skeuo-md hover:bg-white/60 transition-all group p-6">
                <div className="flex items-start justify-between mb-8">
                    <div className="relative">
                        <Avatar className="h-16 w-16 skeuo-card border-white shadow-skeuo-md scale-105">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.profiles?.full_name}`} />
                            <AvatarFallback className="bg-blue-100 text-blue-700 font-black text-xl uppercase">{driver.profiles?.full_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white shadow-skeuo-sm flex items-center justify-center ${driver.is_online ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                            {driver.is_online && <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={`skeuo-inset px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border-white/10 mb-2 ${status.color}`}>
                            {status.label}
                        </div>
                        <div className="flex items-center justify-end gap-1.5 font-black text-base text-blue-900 tracking-tighter">
                            <Star size={14} className="text-amber-400 fill-amber-400" />
                            {driver.rating.toFixed(1)}
                        </div>
                    </div>
                </div>

                <div className="space-y-5 mb-8">
                    <div>
                        <h3 className="text-sm font-black text-blue-900 uppercase tracking-tighter truncate leading-none">
                            {driver.profiles?.full_name || "Unverified Node"}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-2">
                            <Mail size={10} /> {driver.profiles?.email}
                        </p>
                    </div>

                    <div className="skeuo-inset p-3 bg-slate-50/50 rounded-xl border-white/10 flex justify-between items-center">
                        <div className="space-y-1">
                            <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Protocol Stats</p>
                            <p className="text-[11px] font-black text-blue-900 uppercase tracking-tight">{driver.total_rides} Verified Transits</p>
                        </div>
                        <div className="w-8 h-8 skeuo-button bg-white flex items-center justify-center rounded-lg">
                            <ChevronRight size={14} className="text-blue-300" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 skeuo-inset flex items-center justify-center rounded text-blue-500">
                            <Zap size={10} />
                        </div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">License: {driver.license_number || "PENDING"}</span>
                    </div>
                </div>

                <div className="flex gap-4">
                    {driver.status === "pending" ? (
                        <>
                            <Button
                                className="flex-1 h-12 skeuo-button bg-emerald-600 text-[9px] font-black uppercase tracking-[0.2em] text-white shadow-skeuo-sm hover:scale-[1.02]"
                                onClick={() => onUpdate(driver.id, "approved", driver.profiles?.full_name || "")}
                            >
                                Authorize
                            </Button>
                            <Button
                                variant="ghost"
                                className="flex-1 h-12 text-[9px] font-black uppercase tracking-[0.2em] text-red-500/60 hover:text-red-500 hover:bg-transparent"
                                onClick={() => onUpdate(driver.id, "rejected", driver.profiles?.full_name || "")}
                            >
                                De-Auth
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="skeuo"
                            className="w-full h-12 text-[9px] font-black uppercase tracking-[0.2em]"
                        >
                            Open Protocol Hub
                        </Button>
                    )}
                </div>
            </Card>
        </motion.div>
    )
}

function StatsCard({ icon: Icon, label, value, color, suffix }: any) {
    const accents = {
        blue: "text-blue-600 bg-blue-500/10 border-blue-100",
        amber: "text-amber-500 bg-amber-500/10 border-amber-100",
        emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-100",
    }
    const colorKey = color as keyof typeof accents

    return (
        <Card className="skeuo-card border-white/60 p-6 flex items-center gap-5 group">
            <div className={`w-14 h-14 skeuo-button flex items-center justify-center rounded-2xl shadow-skeuo-sm border-white/40 ${accents[colorKey]}`}>
                <Icon size={24} className="drop-shadow-sm" />
            </div>
            <div>
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-2xl font-black text-blue-900 tracking-tighter">{value}{suffix}</p>
            </div>
        </Card>
    )
}
