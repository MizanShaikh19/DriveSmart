import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { User, Car, Briefcase, ChevronRight, ShieldCheck, Zap } from "lucide-react"

export default function RoleSelection() {
    const navigate = useNavigate()

    const selectRole = (role: string) => {
        // TODO: Update user profile with role in real database
        console.log("Selected role:", role)
        navigate("/dashboard")
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#F5F9FF] p-4 relative overflow-hidden">
            <div className="absolute inset-0 skeuo-noise pointer-events-none opacity-30"></div>

            {/* Background elements */}
            <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-400/5 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px]"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-6xl relative z-10"
            >
                <div className="text-center mb-16">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 skeuo-button-driver bg-white flex items-center justify-center shadow-skeuo-md border-white">
                            <ShieldCheck size={32} className="text-blue-600 drop-shadow-sm" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-blue-900 tracking-tighter uppercase drop-shadow-sm mb-4">Node Authorization</h1>
                    <p className="text-[11px] font-black text-blue-400 uppercase tracking-[0.3em] flex items-center justify-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        Configure your primary grid protocol
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <RoleCard
                        title="Transit Client"
                        desc="Secure rapid transport nodes and command short-range grid movement."
                        icon={User}
                        protocol="PRTCL_01"
                        color="bg-blue-600"
                        onClick={() => selectRole('customer')}
                    />

                    <RoleCard
                        title="Hardware Operator"
                        desc="Command logistics hardware and fulfill automated dispatch tasks."
                        icon={Briefcase}
                        protocol="PRTCL_02"
                        color="bg-emerald-600"
                        onClick={() => selectRole('driver')}
                        featured
                    />

                    <RoleCard
                        title="Fleet Architect"
                        desc="Deploy autonomous assets and manage regional hardware registries."
                        icon={Car}
                        protocol="PRTCL_03"
                        color="bg-blue-900"
                        onClick={() => selectRole('vehicle_owner')}
                    />
                </div>

                <div className="mt-20 flex flex-col items-center gap-6">
                    <div className="flex gap-4">
                        <div className="w-2.5 h-2.5 rounded-full skeuo-button bg-blue-600 shadow-skeuo-sm"></div>
                        <div className="w-2.5 h-2.5 rounded-full skeuo-inset border-white/40"></div>
                        <div className="w-2.5 h-2.5 rounded-full skeuo-inset border-white/40"></div>
                    </div>
                    <p className="text-[10px] font-black text-blue-200 uppercase tracking-[0.4em]">
                        Autonomous Grid Sync v4.1 • DriveSmart Systems
                    </p>
                </div>
            </motion.div>
        </div>
    )
}

function RoleCard({ title, desc, icon: Icon, protocol, color, onClick, featured }: any) {
    return (
        <motion.div
            whileHover={{ y: -10, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="cursor-pointer group flex h-full"
        >
            <Card className={`skeuo-card border-white/80 p-10 h-full flex flex-col items-center text-center transition-all bg-white/40 shadow-skeuo-md hover:shadow-skeuo-lg relative overflow-hidden group-hover:bg-white/60 ${featured ? 'border-b-4 border-b-blue-600' : ''}`}>
                {featured && (
                    <div className="absolute top-4 right-4 animate-pulse">
                        <Zap size={14} className="text-emerald-500 fill-emerald-500/20" />
                    </div>
                )}

                <div className={`w-24 h-24 skeuo-button flex items-center justify-center mb-10 shadow-skeuo-md group-hover:scale-110 transition-transform duration-500 border-white/60 ${color} text-white`}>
                    <Icon size={44} className="drop-shadow-lg" />
                </div>

                <h3 className="text-xl font-black text-blue-900 uppercase tracking-tighter mb-4">{title}</h3>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-relaxed mb-10 min-h-[44px]">
                    {desc}
                </p>

                <div className="mt-auto w-full group/btn relative">
                    <div className="py-4 skeuo-inset rounded-2xl border-white/40 text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] group-hover:text-blue-900 group-hover:bg-white/40 transition-all flex items-center justify-center gap-3">
                        {protocol}
                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </div>
                </div>
            </Card>
        </motion.div>
    )
}
