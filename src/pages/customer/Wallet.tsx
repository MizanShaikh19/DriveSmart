import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { motion } from "framer-motion"
import {
    Zap,
    ArrowUpRight,
    ArrowDownLeft,
    History as HistoryIcon,
    ShieldCheck,
    Loader2,
    Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function Wallet() {
    const [loading, setLoading] = useState(true)
    const [balance, setBalance] = useState(0)
    const [transactions, setTransactions] = useState<any[]>([])
    const [userId, setUserId] = useState<string | null>(null)

    useEffect(() => {
        init()

        const channel = supabase.channel('wallet-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'wallet_transactions' }, () => {
                fetchWalletData()
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [])

    const init = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            setUserId(user.id)
            fetchWalletData(user.id)
        }
    }

    const fetchWalletData = async (uid?: string) => {
        const id = uid || userId
        if (!id) return

        try {
            const { data, error } = await supabase
                .from('wallet_transactions')
                .select('*')
                .eq('user_id', id)
                .order('created_at', { ascending: false })

            if (error) throw error

            const total = (data || []).reduce((acc: number, tx: any) => {
                return tx.type === 'credit' ? acc + tx.amount : acc - tx.amount
            }, 0)

            setBalance(total)
            setTransactions(data || [])
        } catch (err) {
            console.error('Wallet Fetch Error:', err)
        } finally {
            setLoading(false)
        }
    }

    const addCapital = async () => {
        if (!userId) return
        setLoading(true)
        try {
            const { error } = await supabase.from('wallet_transactions').insert([{
                user_id: userId,
                amount: 500,
                type: 'credit',
                description: 'Terminal Recharge (Demo)',
                status: 'completed'
            }])
            if (error) throw error
            toast.success("Capital Link Established (+₹500)")
        } catch {
            toast.error("Handshake failed.")
        } finally {
            setLoading(false)
        }
    }

    if (loading && transactions.length === 0) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>

    return (
        <div className="flex flex-col h-full bg-[#F5F9FF] relative overflow-hidden pb-10">
            <div className="absolute inset-0 skeuo-noise opacity-30 pointer-events-none"></div>

            <main className="flex-1 overflow-y-auto p-4 space-y-8 relative z-10 scrollbar-hide">
                <div className="flex justify-between items-end px-2">
                    <div className="flex flex-col">
                        <h1 className="text-4xl font-black text-blue-900 tracking-tighter uppercase">Capital Hub</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Operational Liquidity</p>
                    </div>
                </div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative w-full aspect-[1.586/1] max-w-md mx-auto group">
                    <div className="absolute inset-0 bg-blue-600 rounded-[32px] overflow-hidden skeuo-card border-white shadow-skeuo-lg">
                        <div className="absolute inset-0 bg-skeuo-blue-glossy opacity-80"></div>
                        <div className="absolute top-12 left-10 w-16 h-12 bg-gradient-to-br from-amber-200 to-amber-300 rounded-lg shadow-inner border border-amber-400/30"></div>
                        <div className="absolute top-12 right-10 flex flex-col items-end">
                            <div className="flex items-center gap-2">
                                <Zap className="text-white fill-white/20" size={24} />
                                <span className="text-xl font-black text-white tracking-tighter italic">DRIVESMART</span>
                            </div>
                        </div>
                        <div className="absolute bottom-24 left-10 text-4xl font-black text-white tracking-tighter drop-shadow-lg">
                            ₹{balance.toFixed(2)}
                        </div>
                        <div className="absolute bottom-10 left-10 flex flex-col">
                            <span className="text-[8px] font-black text-blue-200 uppercase tracking-widest mb-1 opacity-60">Capital Holder</span>
                            <span className="text-sm font-black text-white uppercase tracking-wider">SECURE NODE</span>
                        </div>
                        <div className="absolute bottom-10 right-10 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center">
                            <ShieldCheck className="text-white/40" size={24} />
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-2 gap-4">
                    <Button variant="skeuo" className="h-20 flex flex-col gap-1" onClick={addCapital}>
                        <Plus size={20} />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Add Capital</span>
                    </Button>
                    <Button variant="skeuo-inset" className="h-20 flex flex-col gap-1 bg-white/40 border-white text-blue-900">
                        <ArrowUpRight size={20} className="text-blue-500" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Withdraw</span>
                    </Button>
                </div>

                <section className="space-y-4 pb-12">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 skeuo-inset flex items-center justify-center rounded-lg text-blue-500">
                                <HistoryIcon size={16} />
                            </div>
                            <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest">Audit Ledger</h3>
                        </div>
                    </div>

                    <div className="skeuo-inset p-2 rounded-[32px] bg-slate-100/50 border-white/20">
                        <div className="space-y-2">
                            {transactions.length === 0 ? (
                                <p className="p-10 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">No entries in ledger</p>
                            ) : (
                                transactions.map(tx => (
                                    <div key={tx.id} className="skeuo-card p-4 border-white/80 flex items-center gap-4 bg-white/60">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white ${tx.type === 'debit' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                            {tx.type === 'debit' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-xs font-black text-blue-900 uppercase tracking-tight truncate max-w-[150px]">{tx.description}</h4>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{new Date(tx.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-black ${tx.type === 'debit' ? 'text-blue-900' : 'text-emerald-600'}`}>
                                                {tx.type === 'debit' ? '-' : '+'}₹{tx.amount.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}
