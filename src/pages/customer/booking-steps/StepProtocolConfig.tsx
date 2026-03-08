import { motion } from "framer-motion";
import { Sparkles, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServiceType {
    id: string;
    name: string;
    description: string;
    multiplier: number;
    icon: any;
    capacity: string;
}

interface Props {
    services: ServiceType[];
    selectedService: string;
    baseFare: number;
    tripType: string;
    onSelectService: (id: string) => void;
    onSetTripType: (type: any) => void;
    onNext: () => void;
}

export function StepProtocolConfig({
    services, selectedService, baseFare, tripType,
    onSelectService, onSetTripType, onNext
}: Props) {
    return (
        <div className="p-4 space-y-6 pb-24">
            <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 skeuo-inset flex items-center justify-center rounded-lg text-blue-500">
                    <Sparkles size={16} />
                </div>
                <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest leading-none">Service Protocols</h3>
            </div>

            <div className="grid gap-4">
                {services.map(service => (
                    <motion.div
                        key={service.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelectService(service.id)}
                        className={`skeuo-card p-5 cursor-pointer transition-all border-white/80 relative overflow-hidden group ${selectedService === service.id ? 'bg-blue-50/40 ring-2 ring-blue-500/50' : 'hover:bg-white/60'}`}
                    >
                        <div className="flex items-center gap-5 relative z-10">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-skeuo-lg transition-all border border-white/40 ${selectedService === service.id ? 'skeuo-button' : 'skeuo-inset bg-slate-50 text-slate-400'}`}>
                                <service.icon size={32} className={selectedService === service.id ? 'text-white' : ''} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-sm font-black text-blue-900 uppercase tracking-tight">{service.name}</h4>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{service.description}</p>
                                        <div className="mt-2 flex gap-2">
                                            <span className="text-[8px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded shadow-skeuo-xs uppercase">{service.capacity}</span>
                                            <span className="text-[8px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded shadow-skeuo-xs uppercase">Available</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-blue-900 tracking-tighter">₹{Math.round(baseFare * service.multiplier)}</p>
                                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-tighter mt-1">Est. Fare</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {selectedService === service.id && <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-blue-500/5 to-transparent pointer-events-none"></div>}
                    </motion.div>
                ))}
            </div>

            <section className="skeuo-card p-6 border-white/60 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 skeuo-inset flex items-center justify-center rounded-lg text-blue-500">
                        <Calendar size={16} />
                    </div>
                    <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest leading-none">Temporal Window</h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {(['one_way', 'round_trip', 'hourly'] as const).map(type => (
                        <button
                            key={type}
                            onClick={() => onSetTripType(type)}
                            className={`py-3 text-[8px] font-black uppercase tracking-widest rounded-xl transition-all ${tripType === type ? 'skeuo-button text-white shadow-skeuo-md' : 'skeuo-inset bg-slate-50 text-slate-400 hover:text-blue-400'}`}
                        >
                            {type.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </section>

            <div className="fixed bottom-0 left-0 right-0 p-5 z-20 pb-safe">
                <Button
                    variant="skeuo"
                    className="w-full h-14 text-[10px] font-black uppercase tracking-[0.25em] shadow-skeuo-lg"
                    onClick={onNext}
                >
                    Proceed to Auth
                </Button>
            </div>
        </div>
    );
}
