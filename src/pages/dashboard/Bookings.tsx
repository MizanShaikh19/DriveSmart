import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import {
    Calendar,
    MoreHorizontal,
    RefreshCw,
    ShieldCheck,
    Search
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import toast from "react-hot-toast"
import { format } from "date-fns"

interface Booking {
    id: string
    status: string
    pickup_address: string | null
    drop_address: string | null
    fare_amount: number | null
    distance_km: number | null
    created_at: string
    customer_id: string | null
    driver_id: string | null
    customer: {
        email: string
        full_name: string | null
    } | null
    driver: {
        profiles: {
            email: string
            full_name: string | null
        }
    } | null
}

const STATUS_CONFIG: Record<string, { color: string, label: string, accent: string }> = {
    requested: { color: "bg-blue-500", label: "Requested", accent: "text-blue-500" },
    searching: { color: "bg-amber-500", label: "Searching", accent: "text-amber-500" },
    assigned: { color: "bg-indigo-500", label: "Assigned", accent: "text-indigo-500" },
    arrived: { color: "bg-orange-500", label: "Arrived", accent: "text-orange-500" },
    in_progress: { color: "bg-blue-600", label: "En Route", accent: "text-blue-600" },
    completed: { color: "bg-emerald-500", label: "Completed", accent: "text-emerald-500" },
    cancelled: { color: "bg-red-500", label: "Cancelled", accent: "text-red-500" },
}

export default function Bookings() {
    const [filter, setFilter] = useState<string>("all")

    const { data: bookings = [], isLoading, refetch } = useQuery({
        queryKey: ['bookings'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("bookings")
                .select("*")
                .order("created_at", { ascending: false })

            if (error) {
                toast.error("Handshake failure with core data nodes.")
                throw error
            }

            return Promise.all(
                (data || []).map(async (booking) => {
                    const [customerData, driverData] = await Promise.all([
                        booking.customer_id
                            ? supabase.from("profiles").select("email, full_name").eq("id", booking.customer_id).single()
                            : Promise.resolve({ data: null }),
                        booking.driver_id
                            ? supabase.from("profiles").select("email, full_name").eq("id", booking.driver_id).single()
                            : Promise.resolve({ data: null }),
                    ])

                    return {
                        ...booking,
                        customer: customerData.data,
                        driver: driverData.data ? { profiles: driverData.data } : null,
                    }
                })
            )
        }
    })

    const filteredBookings = bookings.filter((b: Booking) => filter === "all" || b.status === filter)

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    }

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="space-y-10 p-2"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-xl font-black text-blue-900 tracking-[0.2em] uppercase flex items-center gap-3">
                        <div className="w-10 h-10 skeuo-button bg-blue-600 flex items-center justify-center rounded-xl shadow-skeuo-sm">
                            <ShieldCheck size={20} className="text-white fill-white/10" />
                        </div>
                        Transit Audit Logs
                    </h1>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-2 ml-13">Monitoring all coordinate links in real-time</p>
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

            <div className="skeuo-inset p-2 bg-slate-200/30 rounded-3xl border-white/20 flex gap-2 overflow-x-auto scrollbar-hide shrink-0">
                {["all", "requested", "assigned", "in_progress", "completed", "cancelled"].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap
                            ${filter === status
                                ? 'skeuo-button bg-blue-600 text-white shadow-skeuo-md scale-105 z-10'
                                : 'text-blue-900/40 hover:text-blue-900/60'
                            }
                        `}
                    >
                        {status.replace("_", " ")}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                    {isLoading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="h-80 skeuo-card skeuo-logo-glow animate-pulse border-white/40 bg-white/20" />
                        ))
                    ) : filteredBookings.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full py-24 skeuo-inset mx-4 rounded-[40px] border-white/10 text-center"
                        >
                            <div className="w-20 h-20 skeuo-button bg-slate-100/50 mx-auto mb-6 flex items-center justify-center rounded-full opacity-50">
                                <Search size={32} className="text-blue-300" />
                            </div>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No coordinate logs matched query</p>
                        </motion.div>
                    ) : (
                        filteredBookings.map((booking: Booking) => (
                            <BookingCard key={booking.id} booking={booking} />
                        ))
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}

function BookingCard({ booking }: { booking: Booking }) {
    const status = STATUS_CONFIG[booking.status] || { color: "bg-slate-500", label: booking.status, accent: "text-slate-500" }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="skeuo-card border-white/80 overflow-hidden shadow-skeuo-md hover:bg-white/60 transition-all group">
                <CardHeader className="pb-3 border-b border-white/40 bg-white/30 p-5">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-2">
                            <div className="skeuo-inset px-2.5 py-1 rounded-md text-[9px] font-black text-blue-900/40 uppercase tracking-widest border-white/10 w-fit">
                                LOG: {booking.id.slice(0, 8)}
                            </div>
                            <div className={`skeuo-button border-white/40 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-skeuo-sm ${status.color}`}>
                                {status.label}
                            </div>
                        </div>
                        <div className="skeuo-inset px-3 py-2 rounded-xl flex items-center gap-2 text-blue-900/60 border-white/10">
                            <Calendar size={12} />
                            <span className="text-[10px] font-black uppercase tracking-tighter">{format(new Date(booking.created_at), 'MMM d, HH:mm')}</span>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-6 px-6 pb-4 space-y-6">
                    <div className="relative pl-8 pr-2 space-y-8">
                        <div className="absolute left-3 top-2 bottom-3 w-0.5 skeuo-inset bg-slate-200/50"></div>

                        {/* Pickup */}
                        <div className="relative">
                            <div className="absolute -left-[29px] top-1 w-4 h-4 skeuo-button border-white/40 flex items-center justify-center p-0">
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Origin</p>
                                <p className="text-[11px] font-bold text-blue-900 leading-tight uppercase line-clamp-2">
                                    {booking.pickup_address || "NO COORDINATE"}
                                </p>
                            </div>
                        </div>

                        {/* Dropoff */}
                        <div className="relative">
                            <div className="absolute -left-[29px] top-1 w-4 h-4 skeuo-button bg-orange-500 border-white/40 flex items-center justify-center p-0">
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest">Terminal</p>
                                <p className="text-[11px] font-bold text-blue-900 leading-tight uppercase line-clamp-2">
                                    {booking.drop_address || "NO COORDINATE"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                        <div className="flex -space-x-3">
                            {/* Customer Avatar */}
                            <div className="relative">
                                <Avatar className="h-10 w-10 skeuo-card border-white shadow-skeuo-sm">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${booking.customer?.full_name}`} />
                                    <AvatarFallback className="bg-blue-600 text-white font-black text-[10px]">C</AvatarFallback>
                                </Avatar>
                            </div>
                            {/* Driver Avatar */}
                            {booking.driver && (
                                <div className="relative">
                                    <Avatar className="h-10 w-10 skeuo-card border-white shadow-skeuo-sm">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.driver.profiles?.full_name}`} />
                                        <AvatarFallback className="bg-emerald-600 text-white font-black text-[10px]">D</AvatarFallback>
                                    </Avatar>
                                </div>
                            )}
                        </div>

                        <div className="text-right">
                            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Audit Value</p>
                            <p className="text-2xl font-black text-blue-900 tracking-tighter">
                                ₹{booking.fare_amount?.toFixed(0) || "0"}
                            </p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{booking.distance_km?.toFixed(1) || 0} KM Vector</p>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="bg-white/20 p-4 flex justify-between items-center border-t border-white/40">
                    <Button variant="ghost" size="sm" className="h-10 text-[9px] font-black uppercase tracking-[0.2em] text-blue-900/40 hover:text-blue-900 hover:bg-transparent transition-colors">
                        Expand Metadata
                    </Button>
                    <div className="w-10 h-10 skeuo-button border-white/40 flex items-center justify-center rounded-xl bg-slate-50/50">
                        <MoreHorizontal size={14} className="text-blue-900 scale-125" />
                    </div>
                </CardFooter>
            </Card>
        </motion.div>
    )
}
