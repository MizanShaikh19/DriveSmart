import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { calculateDistance, calculateEstimatedFare } from "@/lib/geoUtils"
import { ChevronLeft, Car, Navigation, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { StepVectorSelection } from "./booking-steps/StepVectorSelection"
import { StepProtocolConfig } from "./booking-steps/StepProtocolConfig"
import { StepFinalAuth } from "./booking-steps/StepFinalAuth"

const SERVICE_TYPES = [
    { id: 'economy', name: 'Smarter Solo', description: 'Optimal grid navigation for 1-3 nodes', multiplier: 1, icon: Car, capacity: '3 PAX' },
    { id: 'suv', name: 'Smarter XL', description: 'High-capacity hardware for 1-6 nodes', multiplier: 1.5, icon: Navigation, capacity: '6 PAX' },
    { id: 'premium', name: 'Elite Protocol', description: 'Premium armored transit for high-value nodes', multiplier: 2.2, icon: ShieldCheck, capacity: '4 PAX' }
]

export default function BookRide() {
    const navigate = useNavigate()
    const { state } = useLocation()

    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)

    // Form State
    const [selectedService, setSelectedService] = useState(SERVICE_TYPES[0].id)
    const [pickup, setPickup] = useState<{ lat: number, lng: number } | null>(null)
    const [dropoff, setDropoff] = useState<{ lat: number, lng: number } | null>(null)
    const [pickupAddress, setPickupAddress] = useState("Selecting on map...")
    const [dropoffAddress, setDropoffAddress] = useState(state?.destination || "Selecting on map...")
    const [tripType, setTripType] = useState<"one_way" | "round_trip" | "hourly">("one_way")
    const [selectingMode, setSelectingMode] = useState<'pickup' | 'dropoff' | null>('pickup')

    const distance = pickup && dropoff ? calculateDistance(pickup, dropoff) : 0
    const baseFare = calculateEstimatedFare(distance)
    const multiplier = SERVICE_TYPES.find(s => s.id === selectedService)?.multiplier || 1
    const fare = Math.round(baseFare * multiplier)

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) setUserId(user.id)

            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition((pos) => {
                    const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
                    if (!pickup) {
                        setPickup(loc)
                        setPickupAddress(`Sector ${Math.floor(Math.random() * 100)}, Grid Zone Alpha`)
                        setSelectingMode('dropoff')
                    }
                })
            }
        }
        init()
    }, [])

    const handleLocationSelect = (loc: { lat: number, lng: number }) => {
        const mockAddr = `Sector ${Math.floor(Math.random() * 100)}, Zone ${Math.random() > 0.5 ? 'A' : 'B'}`
        if (selectingMode === 'pickup') {
            setPickup(loc); setPickupAddress(mockAddr); setSelectingMode('dropoff')
        } else {
            setDropoff(loc); setDropoffAddress(mockAddr); setSelectingMode(null)
        }
    }

    const handleSubmit = async () => {
        if (!userId || !pickup || !dropoff) return toast.error("Incomplete coordinates.")

        setLoading(true)
        try {
            const { data, error } = await supabase.from('bookings').insert([{
                customer_id: userId,
                status: 'requested',
                service_type: selectedService,
                pickup_lat: pickup.lat,
                pickup_lng: pickup.lng,
                pickup_address: pickupAddress,
                drop_lat: dropoff.lat,
                drop_lng: dropoff.lng,
                drop_address: dropoffAddress,
                fare_amount: fare,
                distance_km: parseFloat(distance.toFixed(2)),
                scheduled_time: new Date().toISOString()
            }]).select().single()

            if (error) throw error
            toast.success("Transit Request Broadcasted!")
            navigate(`/customer/active-ride/${data.id}`)
        } catch (error: any) {
            toast.error("Broadcast failure.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-full bg-[#F5F9FF] relative pb-safe overflow-hidden">
            <div className="absolute inset-0 skeuo-noise opacity-30 pointer-events-none"></div>

            <header className="skeuo-card mx-2 mt-2 px-4 h-14 flex items-center shrink-0 z-20 border-white/60">
                <button
                    onClick={() => step > 1 ? setStep(step - 1) : navigate('/customer')}
                    className="skeuo-button w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95"
                >
                    <ChevronLeft size={18} className="text-white drop-shadow-sm" />
                </button>
                <div className="flex flex-col ml-4">
                    <h1 className="text-[10px] font-black text-blue-900 uppercase tracking-tighter">
                        {step === 1 ? "Vector Acquisition" : step === 2 ? "Protocol Config" : "Final Auth"}
                    </h1>
                    <div className="flex gap-1 mt-0.5">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${step >= i ? 'w-4 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'w-2 bg-slate-200'}`}></div>
                        ))}
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto relative scrollbar-hide">
                {step === 1 && (
                    <StepVectorSelection
                        pickup={pickup} dropoff={dropoff} pickupAddress={pickupAddress} dropoffAddress={dropoffAddress}
                        selectingMode={selectingMode} onLocationSelect={handleLocationSelect}
                        onSetSelectingMode={setSelectingMode} onNext={() => setStep(2)}
                    />
                )}
                {step === 2 && (
                    <StepProtocolConfig
                        services={SERVICE_TYPES} selectedService={selectedService} baseFare={baseFare} tripType={tripType}
                        onSelectService={setSelectedService} onSetTripType={setTripType} onNext={() => setStep(3)}
                    />
                )}
                {step === 3 && (
                    <StepFinalAuth
                        fare={fare} distance={distance} pickupAddress={pickupAddress} dropoffAddress={dropoffAddress}
                        selectedServiceName={SERVICE_TYPES.find(s => s.id === selectedService)?.name || ""}
                        loading={loading} onAuth={handleSubmit}
                    />
                )}
            </main>
        </div>
    )
}
