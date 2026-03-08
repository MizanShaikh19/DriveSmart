import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useDriverPool } from '@/hooks/useDriverPool'
import type { DriverNode } from '@/hooks/useDriverPool'
import { formatPostgresPoint } from '@/lib/geoUtils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { Play, Square, Loader2, Users, Download, Terminal, Navigation, Coffee, Battery, Wrench } from 'lucide-react'
import { toast } from 'sonner'

const defaultCenter: [number, number] = [28.6139, 77.2090]

const STATE_COLORS: Record<string, string> = {
    driving: '#10B981', resting: '#3B82F6', refilling: '#F59E0B', maintenance: '#EF4444'
}

const createDriverIcon = (state: string) => {
    const color = STATE_COLORS[state] || STATE_COLORS.driving
    return new L.DivIcon({
        className: 'custom-simulation-marker',
        html: `<div style="position: relative; width: 24px; height: 24px;">
                <div style="background: ${color}; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2.5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
                    <div style="width: 6px; height: 6px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
                </div>
               </div>`,
        iconSize: [24, 24], iconAnchor: [12, 24]
    })
}

export default function Simulation() {
    const { drivers: pool, loading } = useDriverPool(50)
    const [simulating, setSimulating] = useState(false)
    const [drivers, setDrivers] = useState<DriverNode[]>([])
    const simulationInterval = useRef<ReturnType<typeof setInterval> | null>(null)

    useEffect(() => {
        if (!simulating) setDrivers(pool)
    }, [pool, simulating])

    const simulateMovement = async () => {
        setDrivers(current => current.map(driver => {
            if (driver.activity_state !== 'driving') return driver

            const newLat = (driver.current_location?.lat || 0) + (Math.random() - 0.5) * 0.001
            const newLng = (driver.current_location?.lng || 0) + (Math.random() - 0.5) * 0.001

            // Randomly change state
            let newState: DriverNode['activity_state'] = driver.activity_state
            if (Math.random() < 0.05) {
                const states: DriverNode['activity_state'][] = ['driving', 'resting', 'refilling', 'maintenance']
                newState = states[Math.floor(Math.random() * states.length)]
            }

            const payload = {
                current_location: formatPostgresPoint({ lat: newLat, lng: newLng }),
                activity_state: newState
            }

            // Sync to DB (Throttled via random chance to reduce load in demo)
            if (Math.random() < 0.3) {
                supabase.from('drivers').update(payload).eq('id', driver.id).then()
            }

            return { ...driver, current_location: { lat: newLat, lng: newLng }, activity_state: newState }
        }))
    }

    const toggleSimulation = () => {
        if (simulating) {
            if (simulationInterval.current) clearInterval(simulationInterval.current)
            setSimulating(false)
            toast.info("Telemetry Suspended")
        } else {
            setSimulating(true)
            toast.success("Telemetry Engine Initialized")
            simulationInterval.current = setInterval(simulateMovement, 3000)
        }
    }

    const exportReport = () => {
        const blob = new Blob([JSON.stringify({ timestamp: new Date().toISOString(), nodes: drivers }, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `GridReport_${Date.now()}.json`; a.click()
        toast.success("Grid Report Exported")
    }

    if (loading && drivers.length === 0) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>

    return (
        <div className="space-y-8 h-full flex flex-col p-2">
            <div className="flex justify-between items-end px-2">
                <div className="flex flex-col">
                    <h1 className="text-4xl font-black text-blue-900 tracking-tighter uppercase">Signal Lab</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Advanced Telemetry Override</p>
                </div>
                <Button variant="skeuo" className="h-14 px-8 text-[10px] font-black uppercase tracking-widest gap-4 bg-white border-white text-blue-600 shadow-skeuo-md" onClick={exportReport}>
                    <Download size={16} /> Export Vectors
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 flex-1 min-h-0">
                <Card className="lg:col-span-1 skeuo-card border-white/80 p-1 flex flex-col h-full bg-white/40">
                    <CardHeader className="bg-slate-50/50 border-b border-white/60 rounded-t-3xl p-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 skeuo-logo-bg bg-blue-600 flex items-center justify-center rounded-2xl shadow-skeuo-md">
                                <Terminal size={24} className="text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-black text-blue-900 uppercase">Command Hub</CardTitle>
                                <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manual Protocol Override</CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-8 space-y-10 overflow-y-auto scrollbar-hide">
                        <Button
                            variant={simulating ? "ghost" : "skeuo"}
                            className={`w-full h-20 text-[11px] font-black uppercase tracking-widest shadow-skeuo-lg ${simulating ? 'text-red-500 hover:bg-red-50 bg-white' : 'bg-blue-600 text-white'}`}
                            onClick={toggleSimulation}
                        >
                            {simulating ? <><Square className="mr-4 h-5 w-5 fill-red-500" /> Kill Telemetry</> : <><Play className="mr-4 h-5 w-5 fill-white" /> Initialize Signal</>}
                        </Button>

                        <div className="grid grid-cols-2 gap-4">
                            <StateSummary label="Active" count={drivers.filter(d => d.activity_state === 'driving').length} color="emerald" icon={<Navigation size={10} />} />
                            <StateSummary label="Resting" count={drivers.filter(d => d.activity_state === 'resting').length} color="blue" icon={<Coffee size={10} />} />
                            <StateSummary label="Refill" count={drivers.filter(d => d.activity_state === 'refilling').length} color="amber" icon={<Battery size={10} />} />
                            <StateSummary label="Maintain" count={drivers.filter(d => d.activity_state === 'maintenance').length} color="red" icon={<Wrench size={10} />} />
                        </div>

                        <div className="skeuo-inset p-5 rounded-2xl bg-blue-50/50 border-white/10">
                            <div className="flex items-center gap-3 mb-3 text-[9px] font-black text-blue-800 uppercase tracking-widest">
                                <Users size={14} /> Registered Nodes: {drivers.length}
                            </div>
                            <div className="w-full h-1.5 skeuo-inset bg-slate-200/50 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 w-3/4 shadow-[0_0_8px_rgba(37,99,235,0.5)] transition-all duration-500"></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2 skeuo-card border-white/80 p-1 bg-white/40 overflow-hidden relative">
                    <div className="h-full w-full skeuo-inset border-white/20 rounded-[32px] overflow-hidden">
                        <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution='&copy; CARTODB' />
                            {drivers.map(driver => driver.current_location && (
                                <Marker key={driver.id} position={[driver.current_location.lat, driver.current_location.lng]} icon={createDriverIcon(driver.activity_state)}>
                                    <Popup className="skeuo-popup">
                                        <div className="p-2">
                                            <p className="text-[10px] font-black text-blue-900 uppercase">{driver.full_name}</p>
                                            <p className="text-[9px] font-black uppercase mt-1" style={{ color: STATE_COLORS[driver.activity_state] }}>{driver.activity_state}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </Card>
            </div>
        </div>
    )
}

function StateSummary({ label, count, color, icon }: { label: string, count: number, color: string, icon: any }) {
    const colors: Record<string, string> = {
        emerald: 'text-emerald-500 bg-emerald-50', blue: 'text-blue-500 bg-blue-50',
        amber: 'text-amber-500 bg-amber-50', red: 'text-red-500 bg-red-50'
    }
    return (
        <div className={`skeuo-card p-4 border-white transition-all hover:scale-105 ${colors[color]}`}>
            <div className="flex justify-between items-center opacity-60">
                <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
                {icon}
            </div>
            <p className="text-xl font-black tracking-tighter mt-1">{count}</p>
        </div>
    )
}
