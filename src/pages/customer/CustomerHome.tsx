import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Navigation, Compass, ArrowRight, Zap } from "lucide-react"
import { motion } from "framer-motion"

export default function CustomerHome() {
    const navigate = useNavigate()
    const [destination, setDestination] = useState("")

    const handleContinue = () => {
        if (destination) {
            navigate("/customer/book", { state: { destination } })
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex flex-col bg-[#F5F9FF] p-4 pb-8"
        >
            <header className="mb-8 p-2">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 skeuo-button bg-blue-600 flex items-center justify-center rounded-2xl shadow-skeuo-sm">
                        <Compass size={24} className="text-white fill-white/10" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-blue-900 tracking-[0.2em] uppercase leading-none">Command Hub</h1>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            Core Systems Online
                        </p>
                    </div>
                </div>
            </header>

            {/* Map Matrix - Deep Recessed Container */}
            <div className="flex-1 skeuo-inset border-white/80 relative overflow-hidden mb-10 rounded-[40px] shadow-skeuo-inset bg-slate-100">
                <div className="absolute inset-0 skeuo-noise opacity-20 pointer-events-none"></div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                    <img
                        src="https://www.transparenttextures.com/patterns/cubes.png"
                        alt="grid texture"
                        className="w-full h-full object-cover grayscale opacity-30"
                    />
                </div>

                {/* Tactical HUD Overlays */}
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <div className="px-3 py-1 skeuo-button bg-white text-[8px] font-black text-blue-600 uppercase tracking-widest shadow-skeuo-sm border-white/60">
                        GPS_LOCK: STABLE
                    </div>
                    <div className="px-3 py-1 skeuo-inset bg-white/40 text-[8px] font-black text-blue-400 uppercase tracking-widest border-white/20">
                        NODE_SYNC: 42_ACTIVE
                    </div>
                </div>

                <div className="absolute bottom-6 right-6">
                    <div className="w-12 h-12 skeuo-button bg-white flex items-center justify-center rounded-xl shadow-skeuo-sm border-white/60">
                        <Zap size={18} className="text-blue-600" />
                    </div>
                </div>

                {/* Center marker simulation */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-32 h-32 bg-blue-600/5 rounded-full flex items-center justify-center animate-pulse-ring">
                        <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center border border-white/20">
                            <MapPin className="text-blue-600 drop-shadow-[0_8px_16px_rgba(59,130,246,0.4)]" fill="rgba(37, 99, 235, 0.2)" size={48} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tactical Booking Deck */}
            <div className="skeuo-card p-8 flex flex-col gap-8 border-white group pb-10">
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tighter drop-shadow-sm flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg skeuo-inset bg-slate-50 flex items-center justify-center border-white/10">
                            <ArrowRight size={14} className="text-blue-400" />
                        </div>
                        Target Vector
                    </h2>
                    <p className="text-[11px] font-black text-blue-400/60 uppercase tracking-[0.2em] ml-11">Initialize destination protocol</p>
                </div>

                <div className="space-y-6">
                    <div className="relative group/input">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500 drop-shadow-sm transition-transform group-focus-within/input:scale-110">
                            <Navigation size={20} className="fill-blue-500/10" />
                        </div>
                        <Input
                            placeholder="INPUT COORDINATE DATA..."
                            className="pl-16 skeuo-inset h-20 text-sm font-black tracking-[0.2em] placeholder:text-slate-200 uppercase bg-slate-50/50 rounded-2xl border-white/10 shadow-skeuo-inset focus-visible:ring-0 focus-visible:border-white/40 transition-all text-blue-900"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                        />
                    </div>

                    <Button
                        variant="skeuo"
                        className="w-full h-20 text-xs font-black uppercase tracking-[0.3em] bg-blue-600 text-white shadow-skeuo-lg hover:translate-y-[-2px] active:translate-y-[1px] transition-all disabled:opacity-30 disabled:translate-y-0"
                        onClick={handleContinue}
                        disabled={!destination}
                    >
                        Deploy Drive Protocol
                    </Button>
                </div>

                <div className="flex items-center justify-between px-2">
                    <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-100" />
                        <div className="w-2 h-2 rounded-full bg-blue-100" />
                        <div className="w-2 h-2 rounded-full bg-blue-100" />
                    </div>
                    <span className="text-[8px] font-black text-blue-300 uppercase tracking-widest leading-none">Autonomous Grid Sync v4.1</span>
                </div>
            </div>
        </motion.div>
    )
}
