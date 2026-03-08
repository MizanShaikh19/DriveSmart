import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { Eye, EyeOff, Mail, Lock, Loader2, Car } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        setLoading(false)

        if (error) {
            toast.error(error.message || "Login failed. Please try again.")
            return
        }

        if (data.user) {
            toast.success("Welcome back!")
            setTimeout(() => {
                navigate("/dashboard")
            }, 500)
        }
    }

    return (
        <>
            <Toaster position="top-center" />
            <div className="min-h-screen flex bg-slate-50 relative overflow-hidden">
                <div className="absolute inset-0 skeuo-noise pointer-events-none opacity-40"></div>

                {/* Left Side - Branding (Premium Glossy Blue) */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="hidden lg:flex lg:w-1/2 bg-[#1E3A8A] relative overflow-hidden skeuo-blue-glossy border-r border-white/10"
                >
                    {/* Glossy Overlays */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-400/10 to-transparent"></div>

                    {/* Animated Telemetry Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col justify-center items-center w-full text-white p-16">
                        <motion.div
                            initial={{ scale: 0, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", damping: 12, stiffness: 200 }}
                            className="mb-12"
                        >
                            <div className="w-28 h-28 skeuo-button-driver flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                                <Car size={56} className="text-white drop-shadow-md" fill="white" />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-center"
                        >
                            <h1 className="text-6xl font-black mb-6 tracking-tighter uppercase drop-shadow-lg">
                                Drive<span className="text-blue-400">Smart</span>
                            </h1>
                            <p className="text-sm font-bold text-blue-200/60 uppercase tracking-[0.4em] mb-12 max-w-sm mx-auto">
                                Precision Logistics & Fleet Intelligence Engine
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="grid grid-cols-3 gap-12 text-center"
                        >
                            <div className="space-y-1">
                                <div className="text-3xl font-black tracking-tighter">10K+</div>
                                <div className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Active Nodes</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-3xl font-black tracking-tighter">500+</div>
                                <div className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Operators</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-3xl font-black tracking-tighter">99.9%</div>
                                <div className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Uptime</div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Corner Detail */}
                    <div className="absolute bottom-10 left-10 flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300/50">Core System Optimized</span>
                    </div>
                </motion.div>

                {/* Right Side - Login Form (Blue/White Skeuomorph) */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#F0F7FF] relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="w-full max-w-md"
                    >
                        {/* Branding Element */}
                        <div className="flex flex-col items-center mb-12 lg:items-start">
                            <h2 className="text-4xl font-black text-blue-900 tracking-tighter uppercase drop-shadow-sm">Command Access</h2>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Authenticate to begin session</p>
                        </div>

                        <div className="skeuo-card border-white/60 p-10 relative">
                            {/* Card Accent */}
                            <div className="absolute top-0 right-10 w-12 h-1 bg-blue-600 rounded-b-full shadow-sm"></div>

                            <form onSubmit={handleLogin} className="space-y-8">
                                {/* Email Field */}
                                <div className="space-y-3">
                                    <Label htmlFor="email" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                        Operator Terminal ID (Email)
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="admin@drivesmart.io"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="skeuo-inset pl-12 h-14 border-white/40 text-blue-900 font-bold placeholder:text-slate-300"
                                            required
                                            skeuo
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="space-y-3">
                                    <Label htmlFor="password" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                        Secure Access Key
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="skeuo-inset pl-12 pr-12 h-14 border-white/40 text-blue-900 font-bold placeholder:text-slate-300"
                                            required
                                            skeuo
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300 hover:text-blue-500 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Remember & Forgot */}
                                <div className="flex items-center justify-between px-1">
                                    <label className="flex items-center space-x-3 cursor-pointer group">
                                        <div className="w-5 h-5 skeuo-inset rounded-md flex items-center justify-center border-white/40 group-hover:border-blue-400 transition-colors">
                                            <input
                                                type="checkbox"
                                                className="hidden peer"
                                            />
                                            <div className="w-3 h-3 bg-blue-600 rounded-[2px] opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Persist Session</span>
                                    </label>
                                    <button
                                        type="button"
                                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-colors"
                                    >
                                        Recover Key
                                    </button>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    variant="skeuo"
                                    className="w-full h-16 text-xs font-black uppercase tracking-[0.3em] shadow-skeuo-md"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                            Establishing...
                                        </>
                                    ) : (
                                        "INITIALIZE SESSION"
                                    )}
                                </Button>
                            </form>

                            {/* Divider with tactile line */}
                            <div className="relative my-10">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full h-[2px] skeuo-inset border-none"></div>
                                </div>
                                <div className="relative flex justify-center text-[10px]">
                                    <span className="px-6 bg-[#F0F7FF] text-slate-300 font-black uppercase tracking-widest">Protocol</span>
                                </div>
                            </div>

                            {/* Sign Up Link */}
                            <div className="text-center">
                                <button
                                    onClick={() => navigate("/signup")}
                                    className="text-[11px] font-black text-blue-900 uppercase tracking-widest hover:text-blue-600 transition-colors px-8 py-3 rounded-full bg-white/50 border border-white/60 shadow-sm active:scale-95 transition-transform"
                                >
                                    Register New Node
                                </button>
                            </div>
                        </div>

                        {/* Footer Details */}
                        <div className="mt-12 flex flex-col items-center gap-4">
                            <div className="flex gap-4">
                                <div className="w-8 h-1 skeuo-inset bg-slate-200 border-none rounded-full"></div>
                                <div className="w-8 h-1 skeuo-inset bg-blue-200 border-none rounded-full"></div>
                                <div className="w-8 h-1 skeuo-inset bg-slate-200 border-none rounded-full"></div>
                            </div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">
                                © 2025 DriveSmart Internal Systems
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    )
}
