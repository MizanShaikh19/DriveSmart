import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { Car } from "lucide-react"

export default function Signup() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [fullName, setFullName] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Sign up with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        })

        setLoading(false)

        if (error) {
            alert(error.message)
            return
        }

        if (data.user) {
            // Create profile entry
            const { error: profileError } = await supabase
                .from("profiles")
                .insert([
                    {
                        id: data.user.id,
                        email: data.user.email,
                        full_name: fullName,
                    },
                ])

            if (profileError) {
                console.error("Error creating profile:", profileError)
            }

            // Redirect to role selection
            navigate("/role-selection")
        }
    }

    return (
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

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center items-center w-full text-white p-16">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 12, stiffness: 200 }}
                        className="mb-12"
                    >
                        <div className="w-24 h-24 skeuo-button-driver flex items-center justify-center shadow-lg">
                            <Car size={48} className="text-white drop-shadow-md" fill="white" />
                        </div>
                    </motion.div>

                    <h1 className="text-5xl font-black mb-6 tracking-tighter uppercase drop-shadow-lg text-center">
                        Join the <span className="text-blue-400">Fleet</span>
                    </h1>
                    <p className="text-sm font-bold text-blue-200/60 uppercase tracking-[0.4em] mb-12 max-w-sm mx-auto text-center">
                        Establish your operational node within the DriveSmart network
                    </p>

                    <div className="space-y-6 w-full max-w-xs">
                        <div className="flex items-center gap-4 skeuo-inset p-4 rounded-2xl border-white/10 bg-white/5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-100">Zero-latency dispatching</span>
                        </div>
                        <div className="flex items-center gap-4 skeuo-inset p-4 rounded-2xl border-white/10 bg-white/5">
                            <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-100">Automated revenue tracking</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Right Side - Signup Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#F0F7FF] relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-md"
                >
                    <div className="flex flex-col items-center mb-10 lg:items-start">
                        <h2 className="text-4xl font-black text-blue-900 tracking-tighter uppercase drop-shadow-sm">System Registry</h2>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Create your master identifier</p>
                    </div>

                    <Card className="skeuo-card border-white/60 p-8 pt-10">
                        <CardHeader className="p-0 mb-8">
                            <div className="absolute top-0 right-10 w-12 h-1 bg-blue-600 rounded-b-full shadow-sm"></div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <form onSubmit={handleSignup} className="space-y-6">
                                <div className="space-y-2.5">
                                    <Label htmlFor="fullName" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Operator Name</Label>
                                    <Input
                                        id="fullName"
                                        type="text"
                                        placeholder="ALEX RIDER"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="skeuo-inset h-14 border-white/40 text-blue-900 font-bold placeholder:text-slate-200"
                                        required
                                        skeuo
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <Label htmlFor="email" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Universal ID (Email)</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="OPERATOR@SYSTEM.IO"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="skeuo-inset h-14 border-white/40 text-blue-900 font-bold placeholder:text-slate-200"
                                        required
                                        skeuo
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <Label htmlFor="password" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Passkey</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="skeuo-inset h-14 border-white/40 text-blue-900 font-bold placeholder:text-slate-200"
                                        required
                                        skeuo
                                        minLength={6}
                                    />
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1">T-MIN 6 CHARACTERS REQUIRED</p>
                                </div>
                                <Button type="submit" variant="skeuo" className="w-full h-16 text-xs font-black uppercase tracking-[0.3em] shadow-skeuo-md" disabled={loading}>
                                    {loading ? "INITIALIZING..." : "GENERATE IDENTITY"}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="flex justify-center mt-8 p-0">
                            <button
                                onClick={() => navigate("/login")}
                                className="text-[10px] font-black text-blue-600 hover:text-blue-900 uppercase tracking-widest transition-colors flex items-center gap-2 group"
                            >
                                <span className="w-6 h-[1px] bg-blue-200 group-hover:w-10 transition-all"></span>
                                Existing Node? Sign In
                            </button>
                        </CardFooter>
                    </Card>

                    <div className="mt-10 text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">
                            © 2025 DriveSmart Security Infrastructure
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
