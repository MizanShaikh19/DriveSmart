import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useLocationBroadcast } from '@/hooks/useLocationBroadcast'
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Navigation, Phone, MapPin, CheckCircle, Loader2, Star, ShieldAlert } from 'lucide-react'

// Custom Map Markers - Skeuomorphic Tactile Pins
const createIcon = (color: string) => {
    return new L.DivIcon({
        className: 'custom-marker',
        html: `
            <div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(255,255,255,0.8); box-shadow: 0 4px 8px rgba(0,0,0,0.3), inset 0 1px 3px rgba(255,255,255,0.4);">
                <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    })
}

const pickupIcon = createIcon('#2563eb')
const dropoffIcon = createIcon('#ea580c')
const driverIcon = new L.DivIcon({
    className: 'custom-marker',
    html: `
        <div style="background-color: #10b981; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(16,185,129,0.8); position: relative;">
            <div style="position: absolute; inset: -4px; border: 2px solid rgba(16,185,129,0.3); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
})

export default function DriverActiveRide() {
    const { bookingId } = useParams()
    const navigate = useNavigate()

    const [booking, setBooking] = useState<any>(null)
    const [customer, setCustomer] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [updatingParams, setUpdatingParams] = useState(false)
    const [driverId, setDriverId] = useState<string | null>(null)

    const { location } = useLocationBroadcast(driverId, true)

    useEffect(() => {
        init()

        const subscription = supabase
            .channel(`booking-driver-${bookingId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'bookings',
                filter: `id=eq.${bookingId}`
            }, (payload) => {
                if (payload.new.status === 'cancelled') {
                    toast.error("The customer aborted the transit pipeline.")
                    navigate('/driver')
                } else {
                    setBooking(payload.new)
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(subscription)
        }
    }, [bookingId])

    const init = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) setDriverId(user.id)

        try {
            const { data: bookingData, error: bookingErr } = await supabase
                .from('bookings')
                .select(`
                    *,
                    vehicle:vehicle_id (make, model, plate_number)
                `)
                .eq('id', bookingId)
                .single()

            if (bookingErr) throw bookingErr
            setBooking(bookingData)

            if (bookingData.customer_id) {
                const { data: customerData } = await supabase
                    .from('profiles')
                    .select('full_name, avatar_url, phone')
                    .eq('id', bookingData.customer_id)
                    .single()

                setCustomer(customerData)
            }
        } catch (err) {
            toast.error("Handshake failed. Retrying...")
            navigate('/driver')
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (newStatus: 'arrived' | 'in_progress' | 'completed') => {
        setUpdatingParams(true)
        try {
            const updates: any = { status: newStatus }

            if (newStatus === 'completed') {
                updates.completed_at = new Date().toISOString()

                // Secure financial transactions in parallel
                await Promise.all([
                    supabase.from('payments').insert([{
                        booking_id: bookingId,
                        amount: booking.fare_amount,
                        status: 'completed',
                        payment_method: 'digital_wallet'
                    }]),
                    supabase.from('wallet_transactions').insert([{
                        user_id: driverId,
                        amount: booking.fare_amount,
                        type: 'credit',
                        description: `Transit Credit: Node ${bookingId!.slice(0, 8)}`,
                        reference_id: bookingId as string,
                        status: 'completed'
                    }])
                ])
            }

            const { error } = await supabase
                .from('bookings')
                .update(updates)
                .eq('id', bookingId)

            if (error) throw error

            if (newStatus === 'completed') {
                toast.success("Transit successfully terminated. Funds secured in hub.")
                navigate('/driver')
            } else {
                setBooking({ ...booking, status: newStatus })
            }

        } catch (err: any) {
            toast.error("Command execution failure.")
        } finally {
            setUpdatingParams(false)
        }
    }

    if (loading || !booking) {
        return (
            <div className="h-full flex items-center justify-center bg-[#F5F9FF]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-blue-600 skeuo-logo-glow" size={32} />
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Syncing Feed...</span>
                </div>
            </div>
        )
    }

    const centerPos: [number, number] = [
        (booking.pickup_lat + (booking.drop_lat || booking.pickup_lat)) / 2,
        (booking.pickup_lng + (booking.drop_lng || booking.pickup_lng)) / 2
    ]

    const ActionsPanel = () => {
        let label = ""
        let color = "bg-blue-600"
        let status = ""

        switch (booking.status) {
            case 'assigned':
                label = "Initialize Arrival"
                color = "bg-orange-500"
                status = "arrived"
                break
            case 'arrived':
                label = "Initiate Transit"
                color = "bg-blue-600"
                status = "in_progress"
                break
            case 'in_progress':
                label = "Terminate & Settle"
                color = "bg-emerald-600"
                status = "completed"
                break
            default:
                return null
        }

        return (
            <Button
                variant="skeuo"
                className={`w-full h-16 text-xs font-black uppercase tracking-[0.2em] ${color} text-white shadow-skeuo-md hover:scale-[1.02] active:scale-[0.98] transition-all`}
                onClick={() => updateStatus(status as any)}
                disabled={updatingParams}
            >
                {updatingParams ? <Loader2 className="animate-spin" /> : label}
            </Button>
        )
    }

    return (
        <div className="flex flex-col h-full bg-[#F5F9FF] text-blue-900 relative overflow-hidden">
            <div className="absolute inset-0 skeuo-noise opacity-30 pointer-events-none"></div>

            {/* Status Header - Console Style */}
            <header className="skeuo-card mx-2 mt-2 px-6 py-4 z-20 border-white/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-skeuo-sm skeuo-button border-white/40
                            ${booking.status === 'assigned' ? 'bg-indigo-600' : ''}
                            ${booking.status === 'arrived' ? 'bg-orange-500' : ''}
                            ${booking.status === 'in_progress' ? 'bg-emerald-500' : ''}
                        `}>
                            {booking.status === 'assigned' && <MapPin className="text-white animate-pulse" size={20} />}
                            {booking.status === 'arrived' && <CheckCircle className="text-white" size={20} />}
                            {booking.status === 'in_progress' && <Navigation className="text-white animate-pulse" size={20} />}
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-blue-900 uppercase tracking-tighter drop-shadow-sm">
                                {booking.status === 'assigned' && "Navigation to Pickup"}
                                {booking.status === 'arrived' && "Awaiting Payload"}
                                {booking.status === 'in_progress' && "Transit Active"}
                            </h2>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight mt-0.5 truncate max-w-[200px]">
                                {booking.status === 'assigned' && booking.pickup_address}
                                {booking.status === 'arrived' && "Ready for deployment"}
                                {booking.status === 'in_progress' && booking.drop_address}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Map Area - Hardware View */}
            <div className="flex-1 relative m-2 rounded-3xl overflow-hidden skeuo-inset border-white/40">
                <MapContainer
                    center={centerPos}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                    ref={undefined}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://carto.com/">Carto</a>'
                    />

                    <Polyline
                        positions={[
                            [booking.pickup_lat, booking.pickup_lng],
                            [booking.drop_lat, booking.drop_lng]
                        ]}
                        color="#2563eb" weight={4} dashArray="8, 8" opacity={0.6}
                    />

                    <Marker position={[booking.pickup_lat, booking.pickup_lng]} icon={pickupIcon} />
                    {booking.drop_lat && <Marker position={[booking.drop_lat, booking.drop_lng]} icon={dropoffIcon} />}

                    {location && (
                        <Marker position={[location.lat, location.lng]} icon={driverIcon} zIndexOffset={100} />
                    )}
                </MapContainer>
            </div>

            {/* Bottom Panel (Command Deck) */}
            <div className="p-4 relative z-10 box-border">
                <div className="skeuo-card p-6 border-white/80 w-full overflow-hidden">
                    <div className="w-12 h-1.5 skeuo-inset bg-slate-200/50 rounded-full mx-auto mb-6 shrink-0" />

                    {/* Customer & Vehicle Info */}
                    <div className="flex items-center gap-5 mb-8">
                        <div className="relative">
                            <Avatar className="w-16 h-16 skeuo-card border-white shadow-skeuo-md scale-105">
                                <AvatarImage src={customer?.avatar_url} />
                                <AvatarFallback className="bg-blue-100 text-blue-700 font-black text-xl uppercase">{customer?.full_name?.charAt(0) || 'C'}</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 skeuo-button border-2 border-white flex items-center justify-center bg-blue-600">
                                <Star size={10} className="fill-white text-white" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-black text-blue-900 uppercase tracking-tighter mb-1 truncate">{customer?.full_name || 'Anonymous Node'}</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded shadow-skeuo-sm">Asset ID: {booking.vehicle?.plate_number}</span>
                            </div>
                        </div>

                        <a href={`tel:${customer?.phone}`} className="w-12 h-12 skeuo-button bg-blue-600 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-skeuo-md">
                            <Phone size={20} className="text-white drop-shadow-sm" />
                        </a>
                    </div>

                    {/* Key Telemetry */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="skeuo-inset p-4 border-white/10 rounded-2xl flex flex-col justify-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                <Navigation size={8} /> Vector Length
                            </p>
                            <p className="text-xl font-black text-blue-900 uppercase tracking-tight">{booking.distance_km} KM</p>
                        </div>
                        <div className="skeuo-card bg-emerald-50/30 p-4 border-emerald-100/50 rounded-2xl flex flex-col justify-center">
                            <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                <ShieldAlert size={8} /> Feed Credit
                            </p>
                            <p className="text-xl font-black text-emerald-600 uppercase tracking-tight">₹{booking.fare_amount}</p>
                        </div>
                    </div>

                    <div className="relative">
                        <ActionsPanel />
                    </div>
                </div>
            </div>
        </div>
    )
}
