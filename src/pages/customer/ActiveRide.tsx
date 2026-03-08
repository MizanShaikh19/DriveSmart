import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Navigation, Phone, MessageSquare, ShieldAlert, Star, Loader2, MapPin, Car } from 'lucide-react'
import { motion } from 'framer-motion'

// Custom Map Markers - Skeuomorphic Tactile Pins
const createIcon = (color: string) => {
    return new L.DivIcon({
        className: 'custom-marker',
        html: `
            <div style="background-color: ${color}; width: 36px; height: 36px; border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(255,255,255,0.8); box-shadow: 0 4px 10px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.4);">
                <div style="width: 8px; height: 8px; background: white; border-radius: 50%; box-shadow: 0 0 8px rgba(255,255,255,0.8);"></div>
            </div>
            <div style="width: 2px; height: 10px; background: ${color}; margin: -2px auto 0; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
        `,
        iconSize: [36, 46],
        iconAnchor: [18, 46]
    })
}

const pickupIcon = createIcon('#2563eb')
const dropoffIcon = createIcon('#ea580c')
const driverIcon = createIcon('#10b981')

export default function ActiveRide() {
    const { bookingId } = useParams()
    const navigate = useNavigate()

    const [booking, setBooking] = useState<any>(null)
    const [driver, setDriver] = useState<any>(null)
    const [driverLocation, setDriverLocation] = useState<{ lat: number, lng: number } | null>(null)
    const [loading, setLoading] = useState(true)
    const [cancelling, setCancelling] = useState(false)
    const [mapInstance, setMapInstance] = useState<L.Map | null>(null)

    useEffect(() => {
        fetchBookingDetails()

        const bookingSubscription = supabase
            .channel(`booking-${bookingId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'bookings',
                filter: `id=eq.${bookingId}`
            }, (payload) => {
                setBooking(payload.new)
                if (payload.new.driver_id && (!booking || !booking.driver_id)) {
                    fetchDriverDetails(payload.new.driver_id)
                }

                if (payload.new.status === 'completed') {
                    toast.success("Trip completed! Redirecting to receipt...")
                    setTimeout(() => navigate('/customer/history'), 2000)
                }
                if (payload.new.status === 'cancelled') {
                    toast.error("Trip was cancelled.")
                    setTimeout(() => navigate('/customer'), 2000)
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(bookingSubscription)
        }
    }, [bookingId])

    useEffect(() => {
        if (!booking || !booking.driver_id) return

        const driverSubscription = supabase
            .channel(`driver-${booking.driver_id}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'drivers',
                filter: `id=eq.${booking.driver_id}`
            }, (payload) => {
                const locStr = payload.new.current_location
                if (locStr) {
                    const match = locStr.match(/POINT\(([-.\d]+)\s([-.\d]+)\)/)
                    if (match) {
                        const newLoc = { lat: parseFloat(match[2]), lng: parseFloat(match[1]) }
                        setDriverLocation(newLoc)

                        if (mapInstance && booking.status === 'assigned') {
                            mapInstance.panTo([newLoc.lat, newLoc.lng], { animate: true, duration: 1 })
                        }
                    }
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(driverSubscription)
        }
    }, [booking?.driver_id, mapInstance])

    const fetchBookingDetails = async () => {
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .eq('id', bookingId)
                .single()

            if (error) throw error
            setBooking(data)

            if (data.driver_id) {
                fetchDriverDetails(data.driver_id)
            }
        } catch (error: any) {
            toast.error("Could not load booking details")
            navigate('/customer')
        } finally {
            setLoading(false)
        }
    }

    const fetchDriverDetails = async (driverId: string) => {
        const { data } = await supabase
            .from('profiles')
            .select('full_name, avatar_url, phone, drivers(rating, current_location)')
            .eq('id', driverId)
            .single()

        if (data) {
            setDriver({
                name: data.full_name,
                avatar: data.avatar_url,
                phone: data.phone,
                rating: data.drivers?.[0]?.rating || 5.0
            })

            const locStr = data.drivers?.[0]?.current_location
            if (locStr) {
                const match = locStr.match(/POINT\(([-.\d]+)\s([-.\d]+)\)/)
                if (match) setDriverLocation({ lat: parseFloat(match[2]), lng: parseFloat(match[1]) })
            }
        }
    }

    const handleCancel = async () => {
        if (!confirm("Are you sure you want to cancel this ride?")) return

        setCancelling(true)
        try {
            const { error } = await supabase
                .from('bookings')
                .update({
                    status: 'cancelled',
                    cancelled_at: new Date().toISOString()
                })
                .eq('id', bookingId)

            if (error) throw error
            toast.success("Ride cancelled")
            navigate('/customer')
        } catch (error: any) {
            toast.error("Failed to cancel ride")
            setCancelling(false)
        }
    }

    if (loading || !booking) {
        return <div className="h-full flex items-center justify-center bg-white"><Loader2 className="animate-spin text-blue-600 skeuo-logo-glow" size={32} /></div>
    }

    const centerPos: [number, number] = [
        (booking.pickup_lat + (booking.drop_lat || booking.pickup_lat)) / 2,
        (booking.pickup_lng + (booking.drop_lng || booking.pickup_lng)) / 2
    ]

    const polyline: [number, number][] = [
        [booking.pickup_lat, booking.pickup_lng],
        [booking.drop_lat, booking.drop_lng]
    ]

    const StatusBanner = () => {
        let title = ""
        let subtitle = ""
        let IconComponent: any = Navigation
        let accentColor = "bg-blue-600"
        let isSpinning = false

        switch (booking.status) {
            case 'requested':
            case 'searching':
                title = "Network Scanning"
                subtitle = "Locating optimal transit node..."
                accentColor = "bg-blue-600"
                isSpinning = true
                IconComponent = Loader2
                break
            case 'assigned':
                title = "Hardware En Route"
                subtitle = "Driver is navigating to your coordinate"
                accentColor = "bg-indigo-600"
                IconComponent = Navigation
                break
            case 'arrived':
                title = "Asset Positioned"
                subtitle = "Hardware is stationary at pickup point"
                accentColor = "bg-emerald-600"
                IconComponent = MapPin
                break
            case 'in_progress':
                title = "Transit Execution"
                subtitle = "Executing delivery to terminal destination"
                accentColor = "bg-orange-500"
                IconComponent = Navigation
                break
            default:
                return null
        }

        return (
            <header className="skeuo-card mx-2 mt-2 px-6 py-4 z-20 border-white/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-skeuo-sm ${accentColor} skeuo-button`}>
                            <IconComponent className={`text-white ${isSpinning ? 'animate-spin' : 'animate-pulse'}`} size={20} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-blue-900 uppercase tracking-tighter drop-shadow-sm">{title}</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight mt-0.5">{subtitle}</p>
                        </div>
                    </div>
                </div>
                <div className="mt-4 h-1.5 w-full skeuo-inset rounded-full bg-slate-100/50 overflow-hidden">
                    <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: booking.status === 'in_progress' ? '75%' : booking.status === 'arrived' ? '50%' : '25%' }}
                        className={`h-full ${accentColor} shadow-[0_0_8px_rgba(59,130,246,0.5)]`}
                    ></motion.div>
                </div>
            </header>
        )
    }

    return (
        <div className="flex flex-col h-full bg-[#F5F9FF] relative overflow-hidden">
            <div className="absolute inset-0 skeuo-noise opacity-30 pointer-events-none"></div>

            <StatusBanner />

            {/* Map Area - Recessed */}
            <div className="flex-1 relative m-2 rounded-3xl overflow-hidden skeuo-inset border-white/40">
                <MapContainer
                    center={centerPos}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                    ref={setMapInstance}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />

                    {/* Route Line */}
                    <Polyline positions={polyline} color="#2563eb" weight={4} dashArray="8, 8" opacity={0.6} />

                    <Marker position={[booking.pickup_lat, booking.pickup_lng]} icon={pickupIcon} />
                    {booking.drop_lat && <Marker position={[booking.drop_lat, booking.drop_lng]} icon={dropoffIcon} />}

                    {/* Live Driver Marker */}
                    {driverLocation && (booking.status === 'assigned' || booking.status === 'arrived' || booking.status === 'in_progress') && (
                        <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon} zIndexOffset={100} />
                    )}
                </MapContainer>
            </div>

            {/* Bottom Panel (Tactile Card) */}
            <div className="p-4 relative z-10 box-border">
                <div className="skeuo-card p-6 border-white/80 w-full overflow-hidden">
                    <div className="w-12 h-1.5 skeuo-inset bg-slate-200/50 rounded-full mx-auto mb-6 shrink-0" />

                    {/* Driver Profile OR Finding Driver */}
                    {driver ? (
                        <div className="flex items-center gap-5 mb-8">
                            <div className="relative">
                                <Avatar className="w-16 h-16 skeuo-card border-white shadow-skeuo-md scale-105">
                                    <AvatarImage src={driver.avatar} />
                                    <AvatarFallback className="bg-blue-100 text-blue-700 font-black text-xl uppercase">{driver.name?.charAt(0) || 'D'}</AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 skeuo-button border-2 border-white flex items-center justify-center">
                                    <Star size={10} className="fill-white text-white" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-black text-blue-900 uppercase tracking-tighter">{driver.name || 'Network Operator'}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded shadow-skeuo-sm">Level {Math.floor(driver.rating)}</span>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{driver.rating} Global Rating</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <a href={`tel:${driver.phone}`} className="w-11 h-11 skeuo-button bg-emerald-600 flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
                                    <Phone size={18} className="text-white drop-shadow-sm" />
                                </a>
                                <button className="w-11 h-11 skeuo-button flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
                                    <MessageSquare size={18} className="text-white drop-shadow-sm" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-8 flex flex-col items-center justify-center text-center">
                            <div className="w-24 h-24 skeuo-inset rounded-full flex items-center justify-center mb-6 relative border-white/10 bg-slate-50/50">
                                <SearchPulse />
                                <Car className="text-blue-200 relative z-10" size={36} />
                            </div>
                            <h3 className="text-xs font-black text-blue-900 uppercase tracking-tighter">Scanning for assets</h3>
                            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-[0.2em] leading-relaxed max-w-[200px]">Negotiating transit protocols with nearest available hardware nodes...</p>
                        </div>
                    )}

                    {/* Trip Details summary */}
                    <div className="space-y-4">
                        <div className="skeuo-inset px-6 py-4 rounded-2xl flex justify-between items-center border-white/10">
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Authorized Fare</p>
                                <p className="text-xl font-black text-blue-900 uppercase tracking-tight">₹{booking.fare_amount}</p>
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                        </div>

                        {(booking.status === 'requested' || booking.status === 'searching' || booking.status === 'assigned') && (
                            <Button
                                variant="outline"
                                className="w-full h-14 text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hover:text-red-700 hover:bg-red-50 border-white/40 skeuo-inset shadow-none"
                                onClick={handleCancel}
                                disabled={cancelling}
                            >
                                {cancelling ? <Loader2 className="animate-spin" size={16} /> : "Terminate Protocol (-X)"}
                            </Button>
                        )}

                        <button className="w-full h-12 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:text-blue-500 transition-colors">
                            <ShieldAlert size={14} className="opacity-50" />
                            Safety Protocols Active
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Simple pulse animation component for "searching logic"
function SearchPulse() {
    return (
        <>
            <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
            <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '1s' }}></div>
        </>
    )
}

