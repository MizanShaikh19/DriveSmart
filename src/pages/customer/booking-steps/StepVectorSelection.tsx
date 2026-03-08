import { motion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import MapSelector from "@/components/MapSelector";

interface Props {
    pickup: { lat: number, lng: number } | null;
    dropoff: { lat: number, lng: number } | null;
    pickupAddress: string;
    dropoffAddress: string;
    selectingMode: 'pickup' | 'dropoff' | null;
    onLocationSelect: (loc: { lat: number, lng: number }) => void;
    onSetSelectingMode: (mode: 'pickup' | 'dropoff') => void;
    onNext: () => void;
}

export function StepVectorSelection({
    pickup, dropoff, pickupAddress, dropoffAddress,
    selectingMode, onLocationSelect, onSetSelectingMode, onNext
}: Props) {
    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 relative m-2 rounded-[32px] overflow-hidden skeuo-inset border-white/40">
                <MapSelector
                    onLocationSelect={onLocationSelect}
                    pickupLocation={pickup}
                    dropoffLocation={dropoff}
                    selectingMode={selectingMode}
                    height="100%"
                />

                {selectingMode && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] skeuo-card bg-white/95 px-6 py-2 border-white text-[9px] font-black text-blue-900 uppercase tracking-[0.3em] shadow-skeuo-lg backdrop-blur-md"
                    >
                        Define {selectingMode} coordinates
                    </motion.div>
                )}
            </div>

            <div className="p-4 relative z-10 space-y-4">
                <div className="skeuo-card p-4 border-white/80 space-y-3">
                    <div
                        className={`flex gap-4 items-center p-3.5 rounded-2xl transition-all cursor-pointer ${selectingMode === 'pickup' ? 'skeuo-inset bg-blue-50/50 scale-[1.02]' : 'bg-white/40 border border-white'}`}
                        onClick={() => onSetSelectingMode('pickup')}
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-skeuo-sm ${selectingMode === 'pickup' ? 'skeuo-button' : 'skeuo-inset bg-white text-blue-400'}`}>
                            <MapPin size={18} />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Origin Node</div>
                            <div className="text-xs font-black text-blue-900 truncate tracking-tight uppercase">{pickup ? pickupAddress : "Click map to set..."}</div>
                        </div>
                    </div>

                    <div
                        className={`flex gap-4 items-center p-3.5 rounded-2xl transition-all cursor-pointer ${selectingMode === 'dropoff' ? 'skeuo-inset bg-blue-50/50 scale-[1.02]' : 'bg-white/40 border border-white'}`}
                        onClick={() => onSetSelectingMode('dropoff')}
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-skeuo-sm ${selectingMode === 'dropoff' ? 'skeuo-button bg-orange-500' : 'skeuo-inset bg-white text-orange-400'}`}>
                            <Navigation size={18} />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Terminal Vector</div>
                            <div className="text-xs font-black text-blue-900 truncate tracking-tight uppercase">{dropoff ? dropoffAddress : "Click map to set..."}</div>
                        </div>
                    </div>

                    <Button
                        variant="skeuo"
                        className="w-full h-14 text-[10px] font-black uppercase tracking-[0.25em] mt-2"
                        onClick={onNext}
                        disabled={!pickup || !dropoff}
                    >
                        Initialize Transit
                    </Button>
                </div>
            </div>
        </div>
    );
}
