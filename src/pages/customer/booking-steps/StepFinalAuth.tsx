import { motion } from "framer-motion";
import { CreditCard, Loader2, Car } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    fare: number;
    distance: number;
    pickupAddress: string;
    dropoffAddress: string;
    selectedServiceName: string;
    loading: boolean;
    onAuth: () => void;
}

export function StepFinalAuth({
    fare, distance, pickupAddress, dropoffAddress,
    selectedServiceName, loading, onAuth
}: Props) {
    return (
        <div className="p-4 space-y-6 pb-32">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="skeuo-card bg-skeuo-blue-glossy p-8 text-white border-white/40 shadow-skeuo-lg relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl opacity-50"></div>
                <div className="relative z-10 flex justify-between items-end">
                    <div>
                        <p className="text-[9px] font-black text-blue-100 uppercase tracking-[0.4em] mb-2 opacity-70">Secured Amount</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black tracking-tighter drop-shadow-lg">₹{fare}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-black tracking-tighter">{distance.toFixed(1)} <span className="text-xs opacity-60">KM</span></div>
                        <p className="text-[8px] font-black text-blue-100 uppercase tracking-widest mt-1 opacity-70">Vector Length</p>
                    </div>
                </div>
            </motion.div>

            <div className="skeuo-card p-6 border-white/80 space-y-8">
                <div className="relative border-l-2 border-dashed border-slate-200 ml-6 pl-8 space-y-10 py-2">
                    <div className="relative">
                        <div className="absolute -left-[41px] top-1 w-6 h-6 skeuo-logo-bg bg-blue-600 flex items-center justify-center rounded-lg shadow-skeuo-sm border border-white/40">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                        <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1.5">Origin Node</p>
                        <p className="text-xs font-black text-blue-900 uppercase leading-none tracking-tight">{pickupAddress}</p>
                    </div>
                    <div className="relative">
                        <div className="absolute -left-[41px] top-1 w-6 h-6 skeuo-logo-bg bg-orange-500 flex items-center justify-center rounded-lg shadow-skeuo-sm border border-white/40">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <p className="text-[8px] font-black text-orange-400 uppercase tracking-widest mb-1.5">Terminal End</p>
                        <p className="text-xs font-black text-blue-900 uppercase leading-none tracking-tight">{dropoffAddress}</p>
                    </div>
                </div>

                <div className="skeuo-inset p-5 rounded-2xl flex justify-between items-center border-white/10 bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 skeuo-button border-white/20 flex items-center justify-center text-white">
                            <Car size={24} />
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Protocol</p>
                            <p className="text-[11px] font-black text-blue-900 uppercase tracking-tight">
                                {selectedServiceName}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white skeuo-inset flex items-center justify-center border-white/60">
                            <CreditCard size={14} className="text-blue-500" />
                        </div>
                        <span className="text-[10px] font-black text-blue-900 tracking-widest">WALLET</span>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-5 z-20 pb-safe mt-6">
                <Button
                    variant="skeuo"
                    className="w-full h-16 text-[10px] font-black uppercase tracking-[0.3em] shadow-skeuo-lg"
                    onClick={onAuth}
                    disabled={loading}
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : "Confirm Protocol Link"}
                </Button>
            </div>
        </div>
    );
}
