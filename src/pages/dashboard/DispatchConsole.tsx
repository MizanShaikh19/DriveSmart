import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { Car, MapPin, Activity, RefreshCw, Radio, ShieldCheck, Zap } from "lucide-react"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { motion } from "framer-motion"

// Custom Skeuomorphic Map Markers
const createIcon = (color: string) => {
    return new L.DivIcon({
        className: 'custom-marker',
        html: `
            <div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.4);">
                <div style="width: 4px; height: 4px; background: white; border-radius: 50%;"></div>
            </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
    })
}

const driverIconMarker = createIcon('#10b981')
const bookingIconMarker = createIcon('#fbbf24')

interface Driver {
    id: string
    is_online: boolean
    status: string
    rating: number
    current_location: {
        coordinates: [number, number]
    } | null
    profiles: {
        email: string
        full_name: string | null
    }
}

interface Booking {
    id: string
    status: string
    pickup_lat: number
    pickup_lng: number
    pickup_address: string | null
}

export default function DispatchConsole() {
    const [center] = useState<[number, number]>([19.0760, 72.8777]) // Default to Mumbai as seen in other screens

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['dispatch'],
        queryFn: async () => {
            const { data: driversData } = await supabase
                .from("drivers")
                .select(`
                    *,
                    profiles:id (email, full_name)
                `)
                .eq("is_online", true)

            const { data: bookingsData } = await supabase
                .from("bookings")
                .select("*")
                .in("status", ["requested", "searching", "assigned"])

            return {
                drivers: (driversData || []) as Driver[],
                bookings: (bookingsData || []) as Booking[]
            }
        },
        initialData: {
            drivers: [],
            bookings: []
        },
        refetchInterval: 10000
    })

    const { drivers, bookings } = data

    useEffect(() => {
        const driversChannel = supabase
            .channel("dispatch-realtime")
            .on("postgres_changes", { event: "*", schema: "public", table: "drivers" }, () => refetch())
            .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => refetch())
            .subscribe()

        return () => {
            supabase.removeChannel(driversChannel)
        }
    }, [refetch])

    const onlineDriversCount = drivers.filter((d) => d.is_online).length
    const availableDriversCount = drivers.filter((d) => d.status === "approved" && d.is_online).length
    const unassignedBookingsCount = bookings.filter(b => b.status === "requested" || b.status === "searching").length

    return (
        <div className="h-full flex flex-col bg-[#F5F9FF] relative overflow-hidden">
            <div className="absolute inset-0 skeuo-noise opacity-30 pointer-events-none"></div>

            {/* Header Controls */}
            <header className="p-6 shrink-0 relative z-20">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-xl font-black text-blue-900 tracking-[0.2em] uppercase flex items-center gap-3">
                            <div className="w-10 h-10 skeuo-button bg-blue-600 flex items-center justify-center rounded-xl shadow-skeuo-sm">
                                <Radio size={20} className="text-white fill-white/10 animate-pulse" />
                            </div>
                            Live Command Map
                        </h1>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-2 ml-13">Satellite telemetry and active vector grid</p>
                    </div>
                    <Button
                        onClick={() => refetch()}
                        variant="skeuo"
                        className="h-12 px-6 text-[10px] font-black uppercase tracking-widest gap-2 bg-white text-blue-600 shadow-skeuo-sm border-white/60"
                    >
                        <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                        Re-Sync Grid
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatusCard icon={Car} label="Active Nodes" value={onlineDriversCount} color="emerald" status="ONLINE" />
                    <StatusCard icon={Activity} label="Ready Vectors" value={availableDriversCount} color="blue" status="AVAILABLE" />
                    <StatusCard icon={MapPin} label="Queued Requests" value={unassignedBookingsCount} color="amber" status="CRITICAL" />
                </div>
            </header>

            {/* Tactical Map View */}
            <main className="flex-1 p-6 relative z-10 box-border h-full">
                <Card className="skeuo-card border-white h-full relative overflow-hidden flex flex-col p-1 shadow-skeuo-lg">
                    <div className="p-4 bg-white/30 border-b border-white/40 flex items-center justify-between shrink-0">
                        <span className="text-[9px] font-black text-blue-900/60 uppercase tracking-[0.25em] flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Feed: Active Coordination
                        </span>
                        <div className="flex gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-200" />
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-200" />
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-200" />
                        </div>
                    </div>
                    <div className="flex-1 skeuo-inset border-white/10 m-3 rounded-[32px] overflow-hidden">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full gap-4">
                                <Loader2 className="animate-spin text-blue-600 skeuo-logo-glow" size={32} />
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Constructing Map Matrix...</span>
                            </div>
                        ) : (
                            <MapContainer
                                center={center}
                                zoom={12}
                                className="h-full w-full"
                                zoomControl={false}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://carto.com/">Carto</a>'
                                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                />

                                {drivers.map((driver) => {
                                    if (!driver.current_location?.coordinates) return null
                                    const [lng, lat] = driver.current_location.coordinates

                                    return (
                                        <Marker key={driver.id} position={[lat, lng]} icon={driverIconMarker}>
                                            <Popup className="skeuo-popup">
                                                <div className="p-3">
                                                    <p className="text-[10px] font-black text-blue-900 uppercase tracking-tight">{driver.profiles?.full_name || "NODE"}</p>
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{driver.status}</span>
                                                    </div>
                                                </div>
                                            </Popup>
                                            <Circle center={[lat, lng]} radius={500} color="#10b981" fillColor="#10b981" fillOpacity={0.05} />
                                        </Marker>
                                    )
                                })}

                                {bookings.map((booking) => (
                                    <Marker key={booking.id} position={[booking.pickup_lat, booking.pickup_lng]} icon={bookingIconMarker}>
                                        <Popup className="skeuo-popup">
                                            <div className="p-3">
                                                <p className="text-[10px] font-black text-blue-900 uppercase tracking-tight">Pickup Anchor</p>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase truncate max-w-[150px]">{booking.pickup_address}</p>
                                                <div className="flex items-center gap-1.5 mt-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                    <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest">{booking.status}</span>
                                                </div>
                                            </div>
                                        </Popup>
                                        <Circle
                                            center={[booking.pickup_lat, booking.pickup_lng]}
                                            radius={300}
                                            color="#fbbf24"
                                            fillColor="#fbbf24"
                                            fillOpacity={0.15}
                                        />
                                    </Marker>
                                ))}
                            </MapContainer>
                        )}
                    </div>
                    <div className="p-3 bg-white/20 text-center shrink-0">
                        <p className="text-[8px] font-black text-blue-300 uppercase tracking-[0.3em]">Encrypted Tactical Visualization Layer v4.0.2</p>
                    </div>
                </Card>
            </main>
        </div>
    )
}

function StatusCard({ icon: Icon, label, value, color, status }: any) {
    const accents = {
        blue: "text-blue-600 bg-blue-500/10",
        emerald: "text-emerald-500 bg-emerald-500/10",
        amber: "text-amber-500 bg-amber-500/10",
    }
    const colorKey = color as keyof typeof accents

    return (
        <Card className="skeuo-card border-white/60 p-5 flex items-center justify-between group shadow-skeuo-sm hover:translate-y-[-2px] transition-all">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 skeuo-button border-white/40 flex items-center justify-center rounded-2xl shadow-skeuo-sm ${accents[colorKey]}`}>
                    <Icon size={20} className="drop-shadow-sm" />
                </div>
                <div>
                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-2xl font-black text-blue-900 tracking-tighter">{value}</p>
                </div>
            </div>
            <div className="skeuo-inset px-3 py-1.5 rounded-lg border-white/10">
                <p className={`text-[8px] font-black uppercase tracking-widest ${accents[colorKey].split(' ')[0]}`}>{status}</p>
            </div>
        </Card>
    )
}

function Loader2({ className, size }: { className?: string, size?: number }) {
    return (
        <Zap className={`${className} fill-blue-600/20`} size={size} />
    )
}
