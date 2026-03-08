import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import {
    Ban,
    CheckCircle,
    Search,
    Mail,
    Shield,
    RefreshCw,
    UserCircle,
    Filter,
    ArrowRight,
    Users as UsersIcon
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import toast from "react-hot-toast"
import { format } from "date-fns"

interface Profile {
    id: string
    email: string
    full_name: string | null
    role: string
    is_blocked: boolean
    created_at: string
}

export default function Users() {
    const [searchTerm, setSearchTerm] = useState("")
    const [roleFilter, setRoleFilter] = useState<string>("all")

    const { data: profiles = [], isLoading, refetch } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .order("created_at", { ascending: false })

            if (error) {
                toast.error("Identity link failure.")
                throw error
            }
            return data as Profile[]
        }
    })

    const toggleBlock = async (userId: string, currentStatus: boolean, name: string) => {
        const { error } = await supabase
            .from("profiles")
            .update({ is_blocked: !currentStatus })
            .eq("id", userId)

        if (error) {
            toast.error("Access modification failed.")
        } else {
            toast.success(`Subject ${name || 'unknown'} ${currentStatus ? 're-authorized' : 'de-authorized'}`)
            refetch()
        }
    }

    const filteredProfiles = profiles.filter(profile => {
        const matchesSearch =
            profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || "")

        const matchesRole = roleFilter === "all" || profile.role === roleFilter

        return matchesSearch && matchesRole
    })

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-10 p-2"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-xl font-black text-blue-900 tracking-[0.2em] uppercase flex items-center gap-3">
                        <div className="w-10 h-10 skeuo-button bg-blue-600 flex items-center justify-center rounded-xl shadow-skeuo-sm">
                            <UsersIcon size={20} className="text-white fill-white/10" />
                        </div>
                        Identity Registry
                    </h1>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-2 ml-13">Biometric verification and access control logs</p>
                </div>
                <Button onClick={() => refetch()} variant="skeuo" size="icon" className="w-12 h-12 rounded-2xl shadow-skeuo-sm border-white/60">
                    <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                </Button>
            </div>

            <Card className="skeuo-card border-white/80 overflow-hidden shadow-skeuo-md bg-white/40">
                <CardHeader className="p-8 border-b border-white/40 bg-white/30">
                    <div className="flex flex-col lg:flex-row justify-between gap-8">
                        <div>
                            <h3 className="text-sm font-black text-blue-900 uppercase tracking-tighter">Citizen Directory</h3>
                            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mt-1">Total Verified Nodes: {filteredProfiles.length}</p>
                        </div>

                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="relative w-full md:w-80 h-12">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400">
                                    <Search size={16} />
                                </div>
                                <Input
                                    placeholder="Search by identity pulse..."
                                    className="w-full h-full pl-12 pr-4 skeuo-inset bg-slate-50/50 rounded-2xl border-white/10 text-[11px] font-bold text-blue-900 placeholder:text-slate-300 uppercase tracking-tight focus-visible:ring-0 focus-visible:border-white/40"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="skeuo-inset p-1 bg-slate-200/30 rounded-2xl border-white/20 flex gap-1 items-center">
                                {["all", "driver", "customer", "admin"].map((role) => (
                                    <button
                                        key={role}
                                        onClick={() => setRoleFilter(role)}
                                        className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                                            ${roleFilter === role
                                                ? 'skeuo-button bg-blue-600 text-white shadow-skeuo-sm scale-105'
                                                : 'text-blue-900/40 hover:text-blue-900/60'
                                            }
                                        `}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#F5F9FF] border-b border-white/40">
                                <tr>
                                    <th className="py-6 px-8 text-[9px] font-black text-blue-400 uppercase tracking-widest">Identified Node</th>
                                    <th className="py-6 px-8 text-[9px] font-black text-blue-400 uppercase tracking-widest">Protocol Role</th>
                                    <th className="py-6 px-8 text-[9px] font-black text-blue-400 uppercase tracking-widest">Access Status</th>
                                    <th className="py-6 px-8 text-[9px] font-black text-blue-400 uppercase tracking-widest">Initialization</th>
                                    <th className="py-6 px-8 text-right text-[9px] font-black text-blue-400 uppercase tracking-widest">Command</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/40">
                                <AnimatePresence mode="popLayout">
                                    {isLoading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td className="py-6 px-8"><div className="h-12 w-48 skeuo-inset bg-slate-100/50 rounded-xl" /></td>
                                                <td className="py-6 px-8"><div className="h-6 w-24 skeuo-inset bg-slate-100/50 rounded-full" /></td>
                                                <td className="py-6 px-8"><div className="h-6 w-24 skeuo-inset bg-slate-100/50 rounded-full" /></td>
                                                <td className="py-6 px-8"><div className="h-4 w-32 skeuo-inset bg-slate-100/50 rounded" /></td>
                                                <td className="py-6 px-8"><div className="h-10 w-24 skeuo-button ml-auto bg-slate-200/50 rounded-xl" /></td>
                                            </tr>
                                        ))
                                    ) : filteredProfiles.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-24 text-center">
                                                <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em]">No registry records match current filters</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredProfiles.map((profile) => (
                                            <motion.tr
                                                key={profile.id}
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="hover:bg-white/40 transition-colors group"
                                            >
                                                <td className="py-6 px-8">
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="h-12 w-12 skeuo-button border-white shadow-skeuo-sm p-0.5">
                                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.full_name || profile.email}`} />
                                                            <AvatarFallback className="bg-blue-50 text-blue-700 font-black">{profile.email[0].toUpperCase()}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-[11px] font-black text-blue-900 uppercase tracking-tight leading-none">{profile.full_name || "Unidentified Subject"}</p>
                                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all">
                                                                <Mail size={10} className="text-blue-300" />
                                                                {profile.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-8">
                                                    <div className={`skeuo-inset px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border-white/10 w-fit flex items-center gap-2
                                                        ${profile.role === 'admin' ? "text-purple-600 bg-purple-50" :
                                                            profile.role === 'driver' ? "text-blue-600 bg-blue-50" :
                                                                "text-slate-500 bg-slate-100"
                                                        }`}>
                                                        {profile.role === 'admin' && <Shield size={10} />}
                                                        {profile.role}
                                                    </div>
                                                </td>
                                                <td className="py-6 px-8">
                                                    <div className={`skeuo-inset px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border-white/10 w-fit
                                                        ${profile.is_blocked ? "text-red-500 bg-red-50" : "text-emerald-500 bg-emerald-50"}`}>
                                                        {profile.is_blocked ? "DE-AUTHORIZED" : "OPERATIONAL"}
                                                    </div>
                                                </td>
                                                <td className="py-6 px-8">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                                        {format(new Date(profile.created_at), 'MMM dd, yyyy')}
                                                    </p>
                                                </td>
                                                <td className="py-6 px-8 text-right">
                                                    <Button
                                                        variant="skeuo"
                                                        size="sm"
                                                        className={`h-10 px-6 text-[8px] font-black uppercase tracking-[0.2em] shadow-skeuo-sm transition-all
                                                            ${profile.is_blocked ? "bg-emerald-600 text-white" : "bg-white text-red-500 border-white/60"}
                                                        `}
                                                        onClick={() => toggleBlock(profile.id, profile.is_blocked, profile.full_name || profile.email)}
                                                    >
                                                        {profile.is_blocked ? "Re-Install" : "Suspend"}
                                                    </Button>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
