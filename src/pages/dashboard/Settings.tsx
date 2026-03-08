import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings as SettingsIcon, DollarSign, AlertCircle, ShieldAlert, Cpu, Database, Save, Power } from "lucide-react"

export default function Settings() {
    const [baseFare, setBaseFare] = useState("2.50")
    const [perKmPrice, setPerKmPrice] = useState("1.20")
    const [perMinPrice, setPerMinPrice] = useState("0.30")
    const [emergencyStop, setEmergencyStop] = useState(false)

    const handleSavePricing = () => {
        alert("Pricing configuration saved to network registry!")
    }

    const toggleEmergencyStop = () => {
        setEmergencyStop(!emergencyStop)
        alert(`System state overhaul: Bookings ${!emergencyStop ? "SUSPENDED" : "RESUMED"}`)
    }

    return (
        <div className="p-2 space-y-10">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 skeuo-button bg-blue-600 flex items-center justify-center rounded-3xl shadow-skeuo-md">
                    <SettingsIcon size={32} className="text-white drop-shadow-md animate-[spin_8s_linear_infinite]" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-blue-900 tracking-[0.2em] uppercase">System Parameters</h1>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-2">Central logic override and hardware abstraction layer</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <Card className="skeuo-card border-white/80 overflow-hidden shadow-skeuo-md">
                    <CardHeader className="bg-skeuo-blue-glossy p-8 border-b border-white/20">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl skeuo-button border-white/40 flex items-center justify-center">
                                <DollarSign size={24} className="text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-black text-white uppercase tracking-tighter drop-shadow-sm">Pricing Logic</CardTitle>
                                <CardDescription className="text-[9px] font-black text-blue-100 uppercase tracking-[0.2em] opacity-70">Adjust coordinate fee structure</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <div className="space-y-3">
                            <Label htmlFor="baseFare" className="text-[10px] font-black text-blue-900 uppercase tracking-widest ml-1">Base Protocol Fee (₹)</Label>
                            <Input
                                id="baseFare"
                                type="number"
                                className="h-14 skeuo-inset bg-slate-50/50 rounded-2xl border-white/10 text-sm font-black text-blue-900 px-6 focus-visible:ring-0 focus-visible:border-white/40"
                                value={baseFare}
                                onChange={(e) => setBaseFare(e.target.value)}
                            />
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Minimum verification overhead charge</p>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="perKmPrice" className="text-[10px] font-black text-blue-900 uppercase tracking-widest ml-1">Vector Scale Rate (₹/KM)</Label>
                            <Input
                                id="perKmPrice"
                                type="number"
                                className="h-14 skeuo-inset bg-slate-50/50 rounded-2xl border-white/10 text-sm font-black text-blue-900 px-6 focus-visible:ring-0 focus-visible:border-white/40"
                                value={perKmPrice}
                                onChange={(e) => setPerKmPrice(e.target.value)}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="perMinPrice" className="text-[10px] font-black text-blue-900 uppercase tracking-widest ml-1">Temporal Scale Rate (₹/MIN)</Label>
                            <Input
                                id="perMinPrice"
                                type="number"
                                className="h-14 skeuo-inset bg-slate-50/50 rounded-2xl border-white/10 text-sm font-black text-blue-900 px-6 focus-visible:ring-0 focus-visible:border-white/40"
                                value={perMinPrice}
                                onChange={(e) => setPerMinPrice(e.target.value)}
                            />
                        </div>

                        <Button
                            variant="skeuo"
                            className="w-full h-16 text-xs font-black uppercase tracking-[0.2em] bg-blue-600 text-white shadow-skeuo-md mt-4"
                            onClick={handleSavePricing}
                        >
                            <Save className="mr-3" size={18} />
                            Deploy Changes
                        </Button>
                    </CardContent>
                </Card>

                <div className="space-y-10">
                    <Card className="skeuo-card border-white/80 overflow-hidden shadow-skeuo-md">
                        <CardHeader className="p-8 border-b border-white/40 bg-white/30">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl skeuo-button border-white/40 flex items-center justify-center bg-red-500">
                                    <ShieldAlert size={24} className="text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-sm font-black text-blue-900 uppercase tracking-tighter">Emergency Kill-Switch</CardTitle>
                                    <CardDescription className="text-[9px] font-black text-red-400 uppercase tracking-[0.2em]">Immediate system-wide suspension</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className={`p-6 rounded-[32px] skeuo-inset transition-all duration-500 ${emergencyStop ? "bg-red-50 border-red-200/50" : "bg-slate-50/50 border-white/10"}`}>
                                <div className="flex flex-col items-center text-center gap-6">
                                    <div className={`w-24 h-24 rounded-full flex items-center justify-center skeuo-button transition-all duration-700 relative
                                        ${emergencyStop ? "bg-red-600 shadow-[0_0_40px_rgba(220,38,38,0.5)] scale-110" : "bg-slate-200 opacity-60"}
                                    `}>
                                        <Power size={40} className={`text-white transition-opacity ${emergencyStop ? "opacity-100" : "opacity-40"}`} />
                                        {emergencyStop && (
                                            <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-2">Protocol Status</h3>
                                        <p className={`text-[11px] font-black uppercase tracking-widest ${emergencyStop ? "text-red-500 animate-pulse" : "text-emerald-500"}`}>
                                            {emergencyStop ? "⚠️ ALL COORDINATE BROADCASTS SUSPENDED" : "✅ NETWORK NODES OPERATIONAL"}
                                        </p>
                                    </div>
                                    <Button
                                        variant="skeuo"
                                        className={`w-full h-14 text-[9px] font-black uppercase tracking-[0.2em] transition-all
                                            ${emergencyStop ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}
                                        `}
                                        onClick={toggleEmergencyStop}
                                    >
                                        {emergencyStop ? "Re-Authorize Network" : "Activate Kill-Switch"}
                                    </Button>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed px-4">
                                        Activating this switch will block all incoming client requests. In-progress transits will proceed to terminal ends.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="skeuo-card border-white/80 p-6 bg-white/20">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 skeuo-button bg-slate-50 flex items-center justify-center rounded-xl text-blue-300">
                                <Database size={18} />
                            </div>
                            <h3 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em]">Environment Data Assets</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="skeuo-inset p-4 rounded-xl border-white/10 bg-slate-50/40">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                    <Cpu size={10} /> Handshake Endpoint
                                </p>
                                <p className="text-[9px] font-mono font-black text-blue-900 truncate">VITE_SUPABASE_URL_IDENTIFIED</p>
                            </div>
                            <div className="skeuo-inset p-4 rounded-xl border-white/10 bg-slate-50/40">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                    <AlertCircle size={10} /> Active Node Clusters
                                </p>
                                <p className="text-[10px] font-black text-blue-900 uppercase">Production Cloud • Mumbai-East</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
