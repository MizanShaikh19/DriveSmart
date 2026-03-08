import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { MapPin, Clock, User, LogOut, Zap } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"

export default function CustomerLayout() {
    const location = useLocation()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate("/login")
    }

    const navItems = [
        { path: "/customer", label: "Book", icon: MapPin },
        { path: "/customer/wallet", label: "Wallet", icon: Zap },
        { path: "/customer/history", label: "History", icon: Clock },
        { path: "/customer/profile", label: "Account", icon: User },
    ]

    return (
        <div className="flex flex-col h-screen bg-[#F5F9FF] overflow-hidden relative">
            <div className="absolute inset-0 skeuo-noise opacity-30 pointer-events-none"></div>

            {/* Tactical Mobile Header */}
            <header className="skeuo-card mx-6 mt-6 mb-4 flex items-center justify-between z-30 shrink-0 h-20 px-8 border-white shadow-skeuo-md bg-white/60 backdrop-blur-xl group">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 skeuo-logo-bg bg-blue-600 flex items-center justify-center rounded-xl shadow-skeuo-sm relative overflow-hidden">
                        <Zap size={20} className="text-white fill-white/20 relative z-10" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"></div>
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-blue-900 tracking-tighter leading-none">
                            DriveSmart
                        </h1>
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.25em] mt-1 flex items-center gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                            Secure Grid
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl skeuo-button border-white bg-white text-blue-400 shadow-skeuo-sm active:shadow-skeuo-inset transition-all active:scale-95 group/exit"
                >
                    <LogOut size={20} className="group-hover:text-red-500 transition-colors" />
                </button>
            </header>

            {/* Content Buffer */}
            <main className="flex-1 overflow-auto relative px-6 pb-2">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.4 }}
                        className="h-full relative z-10"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Tactical Bottom Navigator */}
            <nav className="skeuo-card mx-6 mb-8 mt-2 flex items-center justify-around h-24 px-6 z-40 shrink-0 border-white shadow-skeuo-lg bg-white/80 backdrop-blur-2xl group">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path ||
                        (item.path !== "/customer" && location.pathname.startsWith(item.path))
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="relative flex flex-col items-center justify-center gap-2 group/nav"
                        >
                            <motion.div
                                animate={isActive ? { y: -4, scale: 1.05 } : { y: 0, scale: 1 }}
                                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 relative
                                    ${isActive
                                        ? "skeuo-button bg-blue-600 shadow-skeuo-md"
                                        : "hover:bg-blue-50/50"
                                    }
                                `}
                            >
                                <item.icon
                                    size={24}
                                    className={`transition-colors duration-500 ${isActive ? "text-white drop-shadow-md" : "text-blue-200"}`}
                                />
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-glow"
                                        className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full"
                                    />
                                )}
                            </motion.div>
                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500
                                ${isActive ? "text-blue-900 drop-shadow-sm" : "text-blue-200/60"}
                            `}>
                                {item.label}
                            </span>

                            {isActive && (
                                <motion.div
                                    layoutId="nav-dot"
                                    className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]"
                                />
                            )}
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
