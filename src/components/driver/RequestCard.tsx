import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Sparkles } from "lucide-react"

interface RequestCardProps {
    request: any;
    distanceAway: string;
    onAccept: (id: string) => void;
    onReject: (id: string) => void;
}

export function RequestCard({ request, distanceAway, onAccept, onReject }: RequestCardProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
        >
            <Card className="skeuo-card border-white/80 overflow-hidden shadow-skeuo-lg group p-1">
                <div className="bg-skeuo-blue-glossy p-5 flex justify-between items-center rounded-t-[20px] border-b border-white/20">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg skeuo-button border-white/40 flex items-center justify-center">
                            <Sparkles size={14} className="text-white" />
                        </div>
                        <span className="text-[9px] font-black text-blue-50 uppercase tracking-widest drop-shadow-sm">
                            {request.service_type || request.notes?.split(':')[1] || 'STANDARD'}
                        </span>
                    </div>
                    <div className="text-3xl font-black text-white drop-shadow-lg tracking-tighter">
                        ₹{request.fare_amount}
                    </div>
                </div>

                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-8">
                        <div className="flex-1">
                            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Target Identity</p>
                            <h3 className="text-sm font-black text-blue-900 uppercase tracking-tight truncate leading-none">
                                {request.customer?.profiles?.full_name || 'Anonymous Node'}
                            </h3>
                            <div className="mt-3 flex gap-2">
                                <span className="text-[8px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded shadow-skeuo-xs uppercase tracking-widest leading-none flex items-center gap-1.5">
                                    <ShieldCheck size={10} /> Verified
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Range</p>
                            <p className="text-xl font-black text-blue-900 leading-none tracking-tight">
                                {distanceAway}
                            </p>
                            <p className="text-[9px] font-black text-blue-300 mt-2 uppercase tracking-widest leading-none">
                                {request.distance_km} KM Transit
                            </p>
                        </div>
                    </div>

                    <div className="relative pl-8 pr-4 py-6 skeuo-inset bg-slate-50/50 rounded-2xl border-white/10 mb-8">
                        <div className="absolute left-3.5 top-8 bottom-8 w-0.5 bg-slate-200/50"></div>

                        <div className="mb-6 relative">
                            <div className="absolute -left-[26px] top-0.5 w-4 h-4 skeuo-button flex items-center justify-center p-0">
                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                            </div>
                            <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">Pickup Point</p>
                            <p className="text-[10px] font-black text-blue-900 leading-tight uppercase line-clamp-2">{request.pickup_address}</p>
                        </div>

                        <div className="relative">
                            <div className="absolute -left-[26px] top-0.5 w-4 h-4 skeuo-button bg-orange-500 flex items-center justify-center p-0">
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                            </div>
                            <p className="text-[8px] font-black text-orange-400 uppercase tracking-widest mb-1">Destination Node</p>
                            <p className="text-[10px] font-black text-blue-900 leading-tight uppercase line-clamp-2">{request.drop_address}</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button
                            variant="ghost"
                            className="flex-1 h-14 text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 hover:text-red-500 transition-colors"
                            onClick={() => onReject(request.id)}
                        >
                            Abort Feed
                        </Button>
                        <Button
                            className="flex-[2] h-14 skeuo-button bg-emerald-600 text-[10px] font-black uppercase tracking-[0.4em] text-white hover:scale-[1.02] active:scale-[0.98] transition-all"
                            onClick={() => onAccept(request.id)}
                        >
                            Authorize Link
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
