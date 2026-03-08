import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useLocationBroadcast } from "@/hooks/useLocationBroadcast"
import { MapContainer, TileLayer, Marker, Circle } from "react-leaflet"
import L from "leaflet"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Navigation, Loader2, Radio, Zap, ShieldCheck, Power } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const createIcon = (color: string) => {
    return new L.DivIcon({
        className: 'custom-marker',
        html: `
            <div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.4);">
                <div style="width: 4px; height: 4px; background: white; border-radius: 50%;"></div>
            </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
    })
}

const driverIconMarker = createIcon('#2563eb')

export default function DriverHome() {
    const [userId, setUserId] = useState<string | null>(null)
    const [isOnline, setIsOnline] = useState(false)
    const [loading, setLoading] = useState(true)

    // Setup broadcast hook
    const { location, error: geoError } = useLocationBroadcast(userId, isOnline)

    useEffect(() => {
        checkUser()
    }, [])

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            setUserId(user.id)
            fetchDriverState(user.id)
        }
    }

    const fetchDriverState = async (uid: string) => {
        try {
            const { data, error } = await supabase
                .from('drivers')
                .select('*')
                .eq('id', uid)
                .single()

            if (data) {
                setIsOnline(data.is_online || false)
            }
        } catch (err) {
            console.error("Could not fetch driver state", err)
        } finally {
            setLoading(false)
        }
    }

    const handleToggleOnline = async (checked: boolean) => {
        setIsOnline(checked)
        if (!checked && userId) {
            await supabase.from('drivers').update({ is_online: false }).eq('id', userId)
        }
    }

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-[#F5F9FF] gap-4">
                <Zap className="animate-pulse text-blue-600 skeuo-logo-glow" size={32} />
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Synching Duty Roster...</span>
            </div>
        )
    }

    const mapCenter: [number, number] = location ? [location.lat, location.lng] : [19.0760, 72.8777]

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex flex-col bg-[#F5F9FF] p-4 relative overflow-hidden"
        >
            <div className="absolute inset-0 skeuo-noise opacity-30 pointer-events-none"></div>

            {/* Tactical Status Bar */}
            <div className="relative z-20 mb-6">
                <div className="skeuo-card border-white/80 p-6 flex flex-row items-center justify-between shadow-skeuo-md bg-white/60 backdrop-blur-lg">
                    <div className="flex flex-col gap-1.5">
                        <h2 className="text-[9px] font-black text-blue-400 uppercase tracking-[0.25em] flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                            Roster Status
                        </h2>
                        <p className={`text-xl font-black uppercase tracking-tight ${isOnline ? 'text-blue-900 drop-shadow-sm' : 'text-slate-400'}`}>
                            {isOnline ? 'Active On-Grid' : 'Node Disconnected'}
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-[#F5F9FF]/80 p-2 pl-5 rounded-2xl skeuo-inset border-white/20">
                        <Label htmlFor="duty-mode" className="text-[10px] font-black text-blue-900/60 uppercase tracking-widest cursor-pointer select-none">Deploy</Label>
                        <div className="relative">
                            <Switch
                                id="duty-mode"
                                checked={isOnline}
                                onCheckedChange={handleToggleOnline}
                                className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-slate-300 h-8 w-14 border-white shadow-skeuo-sm"
                            />
                            <div className="absolute inset-0 pointer-events-none rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Area (Deep Recessed) */}
            <div className="flex-1 skeuo-inset border-white/80 relative z-10 m-1 rounded-[40px] overflow-hidden mb-6 shadow-skeuo-inset bg-slate-100">
                <MapContainer
                    center={mapCenter}
                    zoom={location ? 16 : 13}
                    className="h-full w-full"
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; CARTO'
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />

                    {location && (
                        <>
                            <Marker position={[location.lat, location.lng]} icon={driverIconMarker} />
                            {isOnline && (
                                <Circle
                                    center={[location.lat, location.lng]}
                                    radius={200}
                                    pathOptions={{ color: '#2563eb', fillColor: '#2563eb', fillOpacity: 0.1, weight: 1.5, dashArray: '5, 5' }}
                                />
                            )}
                        </>
                    )}
                </MapContainer>

                {/* HUD Elements */}
                <div className="absolute top-6 left-6 p-4 rounded-2xl bg-white/40 backdrop-blur-md border border-white/40 hidden md:block">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-lg skeuo-inset bg-slate-50 flex items-center justify-center">
                                <Radio size={12} className="text-blue-500" />
                            </div>
                            <span className="text-[8px] font-black text-blue-900 uppercase tracking-widest">Signal: 100% Verified</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-lg skeuo-inset bg-slate-50 flex items-center justify-center">
                                <ShieldCheck size={12} className="text-emerald-500" />
                            </div>
                            <span className="text-[8px] font-black text-blue-900 uppercase tracking-widest">Protocol: Secure</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Command Center Card */}
            <div className="skeuo-card p-10 pb-12 border-white group relative overflow-hidden bg-white/80 backdrop-blur-xl shrink-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-blue-100 rounded-full mt-4 shadow-inner" />

                <AnimatePresence mode="wait">
                    {isOnline ? (
                        <motion.div
                            key="online"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center py-4 flex flex-col items-center"
                        >
                            <div className="relative w-28 h-28 mb-8 flex items-center justify-center">
                                <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-pulse-ring"></div>
                                <div className="w-16 h-16 skeuo-button bg-blue-600 flex items-center justify-center relative z-10 shadow-skeuo-lg group-hover:scale-105 transition-transform duration-500">
                                    <Navigation className="text-white drop-shadow-md" size={26} fill="rgba(255,255,255,0.2)" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-blue-900 mb-2 uppercase tracking-tighter drop-shadow-sm">System Deployed</h3>
                            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.25em] max-w-[240px] leading-relaxed">Broadcast active. Standing by for regional transit requests.</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="offline"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center py-4 flex flex-col items-center"
                        >
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-10 skeuo-inset border-white/20 shadow-skeuo-inset">
                                <Power className="text-slate-300" size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-400 mb-3 uppercase tracking-tighter">Command Idle</h3>
                            <p className="text-slate-300 text-[11px] font-black uppercase tracking-widest mb-10">Deploy node to receive telemetry tasks</p>
                            <Button
                                variant="skeuo"
                                className="w-full h-20 text-xs font-black uppercase tracking-[0.3em] shadow-skeuo-lg bg-blue-600 text-white hover:translate-y-[-2px] active:translate-y-[1px] transition-all"
                                onClick={() => handleToggleOnline(true)}
                            >
                                Activate Grid Handshake
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {geoError && (
                    <div className="mt-8 p-4 rounded-2xl skeuo-inset bg-red-50 border-red-100 text-red-500 text-[9px] font-black uppercase tracking-widest text-center animate-pulse">
                        SATTELITE LINK FAILURE: {geoError}
                    </div>
                )}
            </div>
        </motion.div>
    )
}
