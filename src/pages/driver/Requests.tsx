import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { calculateDistance, parsePostgresPoint } from "@/lib/geoUtils"
import { Loader2, Zap, ZapOff } from "lucide-react"
import { toast } from "sonner"
import { AnimatePresence } from "framer-motion"
import { RequestCard } from "@/components/driver/RequestCard"

export default function Requests() {
    const navigate = useNavigate()
    const [requests, setRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [driverLocation, setDriverLocation] = useState<{ lat: number, lng: number } | null>(null)
    const [driverId, setDriverId] = useState<string | null>(null)
    const [driverVehicleId, setDriverVehicleId] = useState<string | null>(null)

    useEffect(() => {
        init()
        const channel = supabase.channel('requests-sync')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings', filter: 'status=eq.requested' }, (payload) => {
                fetchRequestDetails(payload.new.id)
                toast("📡 Vector Signal Detected", { className: "skeuo-card border-blue-200 bg-white/95 text-blue-900 font-bold" })
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings' }, (payload) => {
                if (payload.new.status !== 'requested') setRequests(prev => prev.filter(req => req.id !== payload.new.id))
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [])

    const init = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        setDriverId(user.id)

        const [vResult, dResult] = await Promise.all([
            supabase.from('vehicles').select('id').eq('owner_id', user.id).limit(1).single(),
            supabase.from('drivers').select('current_location').eq('id', user.id).single()
        ])

        if (vResult.data) setDriverVehicleId(vResult.data.id)
        if (dResult.data?.current_location) setDriverLocation(parsePostgresPoint(dResult.data.current_location))

        fetchActiveRequests()
    }

    const fetchRequestDetails = async (id: string) => {
        const { data } = await supabase.from('bookings').select('*, customer:customer_id(profiles(full_name))').eq('id', id).single()
        if (data) setRequests(prev => prev.find(r => r.id === id) ? prev : [data, ...prev])
    }

    const fetchActiveRequests = async () => {
        try {
            const { data } = await supabase.from('bookings').select('*, customer:customer_id(profiles(full_name))').eq('status', 'requested').order('created_at', { ascending: false })
            setRequests(data || [])
        } finally { setLoading(false) }
    }

    const handleAccept = async (bookingId: string) => {
        if (!driverId) return toast.error("Node identification failure.")
        setLoading(true)
        try {
            const { error } = await supabase.from('bookings').update({
                status: 'assigned',
                driver_id: driverId,
                vehicle_id: driverVehicleId
            }).eq('id', bookingId).eq('status', 'requested')

            if (error) throw error
            toast.success("Transit Authorized")
            navigate(`/driver/active-ride/${bookingId}`)
        } catch {
            toast.error("Handshake failed.")
        } finally { setLoading(false) }
    }

    if (loading && requests.length === 0) return (
        <div className="h-full flex items-center justify-center bg-[#F5F9FF]">
            <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
    )

    return (
        <div className="h-full flex flex-col bg-[#F5F9FF] relative overflow-hidden">
            <header className="skeuo-card mx-2 mt-2 px-6 h-16 flex items-center shrink-0 z-20 border-white/60">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 skeuo-logo-bg bg-blue-600 flex items-center justify-center rounded-xl shadow-skeuo-sm">
                        <Zap size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xs font-black text-blue-900 uppercase tracking-tighter">Strategy Stream</h1>
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{requests.length} Active Nodes</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 pb-24 relative z-10 scrollbar-hide">
                <AnimatePresence mode="popLayout">
                    {requests.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-10 opacity-40 grayscale">
                            <ZapOff size={48} className="text-blue-300" />
                            <p className="text-[10px] font-black text-blue-900 uppercase tracking-[0.3em]">No Active Nodes</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {requests.map(req => (
                                <RequestCard
                                    key={req.id}
                                    request={req}
                                    distanceAway={driverLocation ? `${calculateDistance(driverLocation, { lat: req.pickup_lat, lng: req.pickup_lng }).toFixed(1)} KM` : "ESTIMATING"}
                                    onAccept={handleAccept}
                                    onReject={(id) => setRequests(prev => prev.filter(r => r.id !== id))}
                                />
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    )
}
