import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star, CreditCard, Loader2, ChevronLeft, Clock, X } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function History() {
    const navigate = useNavigate()
    const [bookings, setBookings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedBooking, setSelectedBooking] = useState<any>(null)
    const [isReceiptOpen, setIsReceiptOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<'completed' | 'cancelled'>('completed')

    useEffect(() => {
        fetchHistory()
    }, [])

    const fetchHistory = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    *,
                    driver:driver_id (
                        id,
                        profiles (full_name, avatar_url)
                    ),
                    vehicle:vehicle_id (make, model, plate_number)
                `)
                .eq('customer_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setBookings(data || [])
        } catch (error: any) {
            toast.error("Failed to load booking history")
        } finally {
            setLoading(false)
        }
    }

    const filteredBookings = bookings.filter(b => b.status === activeTab)

    const openReceipt = (booking: any) => {
        setSelectedBooking(booking)
        setIsReceiptOpen(true)
    }

    const RatingStars = ({ bookingId, initialRating }: { bookingId: string, initialRating?: number }) => {
        const [rating, setRating] = useState(initialRating || 0)
        const [hover, setHover] = useState(0)
        const [submitting, setSubmitting] = useState(false)

        const handleRate = async (value: number) => {
            if (initialRating) return
            setRating(value)
            setSubmitting(true)
            try {
                await new Promise(res => setTimeout(res, 500))
                toast.success("Driver rated successfully!")
            } catch (err) {
                toast.error("Failed to submit rating")
                setRating(0)
            } finally {
                setSubmitting(false)
            }
        }

        return (
            <div className="flex flex-col items-center py-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                    {initialRating ? "Protocol Verified" : "Grade Transit Execution"}
                </p>
                <div className="flex gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            className={`${initialRating ? 'cursor-default' : 'cursor-pointer'} transition-all active:scale-90`}
                            onClick={(e) => { e.stopPropagation(); handleRate(star); }}
                            onMouseEnter={() => !initialRating && setHover(star)}
                            onMouseLeave={() => !initialRating && setHover(0)}
                            disabled={submitting || !!initialRating}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${((hover || rating) >= star) ? 'skeuo-button bg-amber-400' : 'skeuo-inset bg-slate-50 opacity-40'}`}>
                                <Star
                                    size={20}
                                    className={`${(hover || rating) >= star ? 'fill-white text-white' : 'text-slate-400'} transition-colors duration-200`}
                                />
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        )
    }

    const BookingCard = ({ booking }: { booking: any }) => {
        const date = new Date(booking.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        const isCompleted = booking.status === 'completed'

        return (
            <motion.div
                whileTap={{ scale: 0.98 }}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => openReceipt(booking)}
                className="mb-5 cursor-pointer"
            >
                <Card className="skeuo-card border-white/60 overflow-hidden hover:bg-white/60 transition-colors">
                    <CardContent className="p-0">
                        <div className="px-5 py-3 border-b border-white/40 flex justify-between items-center bg-white/30">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 skeuo-inset flex items-center justify-center rounded-md text-blue-500">
                                    <Clock size={12} />
                                </div>
                                <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">{date}</span>
                            </div>
                            <div className="text-xs font-black text-blue-900 uppercase tracking-tighter">
                                ₹{booking.fare_amount}
                            </div>
                        </div>

                        <div className="p-5">
                            <div className="relative pl-6 mb-5">
                                <div className="absolute left-1.5 top-1.5 bottom-1.5 w-0.5 skeuo-inset bg-slate-200/50"></div>

                                <div className="mb-4 relative">
                                    <div className="absolute -left-[26px] top-1 w-2.5 h-2.5 skeuo-button flex items-center justify-center">
                                        <div className="w-1 h-1 bg-white rounded-full"></div>
                                    </div>
                                    <p className="text-[11px] font-bold text-blue-900/60 truncate tracking-tight uppercase">{booking.pickup_address}</p>
                                </div>

                                <div className="relative">
                                    <div className="absolute -left-[26px] top-1 w-2.5 h-2.5 skeuo-button bg-orange-500 flex items-center justify-center">
                                        <div className="w-1 h-1 bg-white rounded-full"></div>
                                    </div>
                                    <p className="text-[11px] font-bold text-blue-900/60 truncate tracking-tight uppercase">{booking.drop_address}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 skeuo-inset bg-slate-50/50 px-3 py-1.5 rounded-xl border-white/20 overflow-hidden max-w-[60%]">
                                    <div className="w-6 h-6 skeuo-card border-white flex items-center justify-center shrink-0">
                                        {booking.driver?.profiles?.avatar_url ? (
                                            <img src={booking.driver.profiles.avatar_url} alt="driver" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-black text-[10px] text-blue-900">D</span>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-black text-blue-900 uppercase truncate tracking-tight">{booking.driver?.profiles?.full_name || 'Autonomous'}</span>
                                </div>

                                <span className={`skeuo-inset px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-white/20
                                    ${isCompleted ? 'text-emerald-500' : 'text-red-500'}
                                `}>
                                    {booking.status}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        )
    }

    return (
        <div className="h-full flex flex-col bg-[#F5F9FF] relative overflow-hidden">
            <div className="absolute inset-0 skeuo-noise opacity-30 pointer-events-none"></div>

            <header className="skeuo-card mx-4 mt-4 px-6 h-16 flex items-center shrink-0 z-20 border-white/60">
                <button
                    onClick={() => navigate('/customer')}
                    className="skeuo-button w-9 h-9 flex items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95"
                >
                    <ChevronLeft size={20} className="text-white drop-shadow-sm" />
                </button>
                <h1 className="text-sm font-black text-blue-900 uppercase tracking-[0.2em] ml-6">Log Archive</h1>
                <div className="ml-auto skeuo-inset px-3 py-1 rounded-full text-[9px] font-black text-blue-400 uppercase tracking-widest border-white/20">
                    {bookings.length} FILES
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 pb-24 relative z-10">
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <Loader2 className="animate-spin text-blue-600 skeuo-logo-glow" size={32} />
                    </div>
                ) : (
                    <div className="w-full">
                        <div className="w-full mb-8 skeuo-inset p-1.5 bg-slate-200/30 rounded-2xl border-white/20 h-14 flex">
                            <button
                                onClick={() => setActiveTab('completed')}
                                className={`flex-1 h-full rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'completed' ? 'skeuo-button bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/20'}`}
                            >
                                Verified
                            </button>
                            <button
                                onClick={() => setActiveTab('cancelled')}
                                className={`flex-1 h-full rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'cancelled' ? 'skeuo-button bg-red-500 text-white' : 'text-slate-400 hover:bg-white/20'}`}
                            >
                                Aborted
                            </button>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                            >
                                {filteredBookings.length === 0 ? (
                                    <div className="text-center py-20 skeuo-inset mx-4 rounded-3xl border-white/10 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                        No {activeTab} transits found
                                    </div>
                                ) : (
                                    filteredBookings.map(b => <BookingCard key={b.id} booking={b} />)
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                )}
            </main>

            {/* Custom Modal for Receipt */}
            <AnimatePresence>
                {isReceiptOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsReceiptOpen(false)}
                            className="absolute inset-0 bg-blue-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-md bg-[#F5F9FF] rounded-[32px] overflow-hidden shadow-2xl relative z-10 skeuo-card border-white/80"
                        >
                            <div className="absolute inset-0 skeuo-noise opacity-20 pointer-events-none"></div>

                            <div className="skeuo-card bg-skeuo-blue-glossy p-10 text-white rounded-none border-b border-white/20 relative">
                                <button
                                    onClick={() => setIsReceiptOpen(false)}
                                    className="absolute top-6 right-6 w-8 h-8 skeuo-button border-white/20 flex items-center justify-center rounded-full text-white/60 hover:text-white transition-colors"
                                >
                                    <X size={16} />
                                </button>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-[10px] font-black text-blue-100 uppercase tracking-[0.3em] mb-2 opacity-80">Audit Receipt</h2>
                                        <div className="text-5xl font-black tracking-tighter drop-shadow-lg">₹{selectedBooking?.fare_amount}</div>
                                    </div>
                                    <div className="w-14 h-14 skeuo-button border-white/40 flex items-center justify-center">
                                        <CreditCard size={24} className="text-white" />
                                    </div>
                                </div>
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest border-t border-white/20 pt-6">
                                    <span>{new Date(selectedBooking?.created_at || Date.now()).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                    <span className="text-emerald-300">PROTOCOL SETTLED</span>
                                </div>
                            </div>

                            <div className="p-8 space-y-8 relative z-10">
                                <div className="relative pl-8">
                                    <div className="absolute left-2.5 top-2 bottom-2 w-0.5 skeuo-inset bg-slate-200/50"></div>
                                    <div className="mb-8 relative">
                                        <div className="absolute -left-[30px] top-1 w-4 h-4 skeuo-button flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                        </div>
                                        <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1.5">Origin Node</p>
                                        <p className="text-[11px] font-black text-blue-900 leading-relaxed uppercase tracking-tight">{selectedBooking?.pickup_address}</p>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute -left-[30px] top-1 w-4 h-4 skeuo-button bg-orange-500 flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                        </div>
                                        <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-1.5">Terminal End</p>
                                        <p className="text-[11px] font-black text-blue-900 leading-relaxed uppercase tracking-tight">{selectedBooking?.drop_address}</p>
                                    </div>
                                </div>

                                <hr className="border-slate-200/50" />

                                {selectedBooking?.status === 'completed' && (
                                    <div className="skeuo-card p-2 border-white/60 bg-white/40">
                                        <RatingStars bookingId={selectedBooking.id} />
                                    </div>
                                )}

                                <Button
                                    variant="skeuo"
                                    className="w-full h-14 text-xs font-black uppercase tracking-[0.2em]"
                                    onClick={() => setIsReceiptOpen(false)}
                                >
                                    Dismiss Log
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
