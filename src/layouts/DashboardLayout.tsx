import { useState } from "react"
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom"
import {
    LayoutDashboard,
    Users,
    Car,
    MapPin,
    DollarSign,
    Settings,
    LogOut,
    Bell,
    Search,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Play,
    Terminal,
    ShieldCheck
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function DashboardLayout() {
    const navigate = useNavigate()
    const location = useLocation()
    const [collapsed, setCollapsed] = useState(false)

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate("/login")
    }

    const navItems = [
        { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { path: "/dashboard/users", label: "Identity", icon: Users },
        { path: "/dashboard/drivers", label: "Fleet", icon: Car },
        { path: "/dashboard/dispatch", label: "Dispatch", icon: MapPin },
        { path: "/dashboard/bookings", label: "Bookings", icon: Calendar },
        { path: "/dashboard/payments", label: "Vault", icon: DollarSign },
        { path: "/dashboard/simulation", label: "Signal Lab", icon: Play },
        { path: "/dashboard/settings", label: "System", icon: Settings },
    ]

    return (
        <div className="flex h-screen bg-[#F5F9FF] overflow-hidden relative">
            <div className="absolute inset-0 skeuo-noise opacity-20 pointer-events-none"></div>

            {/* Sidebar (Tactile Panel) */}
            <motion.aside
                initial={{ width: 280 }}
                animate={{ width: collapsed ? 100 : 280 }}
                transition={{ duration: 0.4, type: "spring", damping: 20 }}
                className="skeuo-sidebar flex flex-col z-30 relative border-white/80 bg-white/40 backdrop-blur-xl m-4 rounded-[40px] shadow-skeuo-md"
            >
                {/* Toggle Button (Raised Circle) */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-4 top-12 w-8 h-8 bg-blue-600 border border-white rounded-full flex items-center justify-center shadow-skeuo-sm hover:translate-x-1 text-white z-50 transition-all active:scale-90"
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>

                {/* Logo Section */}
                <div className="p-8 flex items-center h-24 border-b border-white/40">
                    <div className="flex items-center gap-4 overflow-hidden whitespace-nowrap">
                        <div className="w-12 h-12 skeuo-button bg-blue-600 flex items-center justify-center shadow-skeuo-sm flex-shrink-0 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <ShieldCheck className="text-white drop-shadow-md relative z-10" size={24} />
                        </div>
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="flex flex-col"
                                >
                                    <h1 className="text-xl font-black text-blue-900 tracking-tighter leading-none">
                                        DriveSmart
                                    </h1>
                                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mt-1">Command Core</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-6 space-y-4 overflow-y-auto no-scrollbar">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path ||
                            (item.path !== "/dashboard" && location.pathname.startsWith(item.path))

                        return (
                            <Link key={item.path} to={item.path}>
                                <div className={`
                                    flex items-center gap-4 h-14 rounded-2xl transition-all duration-300 relative group
                                    ${collapsed ? "justify-center px-0" : "px-5"}
                                    ${isActive
                                        ? "skeuo-button bg-blue-600 text-white shadow-skeuo-sm scale-[1.02]"
                                        : "text-blue-900/40 hover:text-blue-900 hover:bg-white/40 shadow-none hover:shadow-skeuo-xs"
                                    }
                                `}>
                                    <item.icon className={`${isActive ? "text-white" : "text-blue-300"} transition-colors`} size={20} />
                                    {!collapsed && (
                                        <span className="text-[10px] font-black uppercase tracking-[0.1em]">
                                            {item.label}
                                        </span>
                                    )}
                                    {isActive && !collapsed && (
                                        <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                    )}
                                </div>
                            </Link>
                        )
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-6 border-t border-white/40">
                    <button
                        className={`w-full flex items-center rounded-2xl transition-all duration-300 font-black text-[10px] uppercase tracking-widest
                            ${collapsed ? "justify-center h-14" : "h-14 px-5"}
                            bg-white/40 text-red-500 hover:bg-red-50 hover:text-red-700 shadow-skeuo-xs active:shadow-skeuo-inset
                        `}
                        onClick={handleLogout}
                    >
                        <LogOut size={20} className={collapsed ? "" : "mr-4"} />
                        {!collapsed && <span>System Exit</span>}
                    </button>
                    {!collapsed && (
                        <div className="mt-6 flex justify-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-100"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-100"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-100"></div>
                        </div>
                    )}
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Tactical Header */}
                <header className="h-24 mx-8 mt-4 flex items-center justify-between z-20 shrink-0 px-10 skeuo-card border-white shadow-skeuo-md bg-white/60 backdrop-blur-xl group">
                    <div className="flex items-center gap-6">
                        <div className="w-10 h-10 skeuo-inset bg-slate-50 border-white/10 flex items-center justify-center rounded-xl">
                            <Terminal size={18} className="text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-[10px] font-black text-blue-400/60 uppercase tracking-[0.3em] mb-1">
                                Current Module
                            </h2>
                            <h2 className="text-lg font-black text-blue-900 uppercase tracking-tighter drop-shadow-sm flex items-center gap-3">
                                {location.pathname.split("/").pop() || "Control Center"}
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-10">
                        {/* Search Node */}
                        <div className="hidden lg:flex items-center skeuo-inset px-6 h-14 w-80 border-white/10 bg-slate-50/50 group-focus-within:bg-white transition-all">
                            <Search size={16} className="text-blue-300 mr-4" />
                            <input
                                type="text"
                                placeholder="QUERY NODE REGISTRY..."
                                className="bg-transparent border-none outline-none text-[10px] font-black tracking-widest w-full text-blue-900 placeholder:text-slate-200 uppercase"
                            />
                        </div>

                        <div className="flex items-center gap-6">
                            {/* Time Sync */}
                            <div className="hidden xl:flex flex-col items-end border-r border-white/40 pr-6">
                                <p className="text-[14px] font-black text-blue-900 tracking-tighter">09:42:15</p>
                                <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Network Time Sync</p>
                            </div>

                            {/* Alert Node */}
                            <button className="relative h-12 w-12 flex items-center justify-center rounded-2xl skeuo-button border-white bg-white text-blue-400 shadow-skeuo-sm active:shadow-skeuo-inset transition-all group/bell">
                                <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse"></span>
                            </button>

                            {/* Identity Token */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="flex items-center gap-5 pl-6"
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-[11px] font-black text-blue-900 uppercase tracking-tight">Master Admin</p>
                                    <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mt-1">Root Authority</p>
                                </div>
                                <Avatar className="h-12 w-12 skeuo-button border-white p-0.5 shadow-skeuo-md cursor-pointer relative group/avatar">
                                    <AvatarImage src="https://github.com/shadcn.png" className="rounded-xl overflow-hidden" />
                                    <AvatarFallback className="bg-blue-50 text-blue-900 font-bold">AD</AvatarFallback>
                                    <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover/avatar:opacity-100 rounded-xl transition-opacity"></div>
                                </Avatar>
                            </motion.div>
                        </div>
                    </div>
                </header>

                {/* Command Deck Content */}
                <main className="flex-1 overflow-auto p-8 pt-6 relative no-scrollbar">
                    <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#F5F9FF] to-transparent pointer-events-none z-10"></div>

                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full max-w-7xl mx-auto pb-20 relative z-0"
                    >
                        <Outlet />
                    </motion.div>
                </main>
            </div>
        </div>
    )
}
