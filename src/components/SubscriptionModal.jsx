import { useState, useEffect } from "react";
import api from "../api/axios";
import { 
  X, Loader2, CheckCircle, IndianRupee, AlertCircle, 
  ChevronDown, ChevronUp, Plus, Calendar, Clock 
} from "lucide-react";
import { clsx } from "clsx";

// Design System
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

export default function SubscriptionModal({ memberId, onClose, canEdit }) {
  const [data, setData] = useState(null);
  const [chandaHistory, setChandaHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Weekly Grid State
  const [processingId, setProcessingId] = useState(null);
  const [isGridExpanded, setIsGridExpanded] = useState(false);

  // Festival Chanda State
  const [chandaAmount, setChandaAmount] = useState("");
  const [addingChanda, setAddingChanda] = useState(false);

  /* ================= LOAD DATA ================= */
  const fetchData = async () => {
    try {
      // 1. Subscription Data
      const subRes = await api.get(`/subscriptions/member/${memberId}`);
      const subData = subRes.data.data;
      setData(subData);

      // 2. Chanda History
      if (subData?.subscription?.member) {
         const feeRes = await api.get("/member-fees");
         // Filter client-side as per your logic
         const userFees = feeRes.data.data.filter(f => 
             f.user?._id === subData.memberUserId || f.user === subData.memberUserId
         ); 
         setChandaHistory(userFees);
      }
    } catch (err) {
      console.error(err);
      // alert("Failed to load data"); // Better to show error state than alert on load
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [memberId]);

  /* ================= HANDLERS ================= */
  const handleToggle = async (installmentNumber) => {
    if (!canEdit || processingId) return;
    setProcessingId(installmentNumber);
    try {
      const res = await api.post("/subscriptions/pay", {
        subscriptionId: data.subscription._id,
        installmentNumber
      });
      setData(prev => ({ ...prev, subscription: res.data.data }));
    } catch (err) { 
        alert("Payment failed"); 
    } finally { 
        setProcessingId(null); 
    }
  };

  const handleAddChanda = async (e) => {
    e.preventDefault();
    if (!chandaAmount || !canEdit) return;
    setAddingChanda(true);
    try {
      await api.post("/member-fees", {
        userId: data.memberUserId,
        amount: Number(chandaAmount),
        notes: "Quick Collect"
      });
      setChandaAmount("");
      await fetchData(); // Refresh history
    } catch (err) { 
        alert("Failed to add chanda"); 
    } finally { 
        setAddingChanda(false); 
    }
  };

  const getLabel = (num) => {
    if (data?.rules?.frequency === 'monthly') {
      const date = new Date();
      date.setMonth(num - 1);
      return date.toLocaleString('default', { month: 'short' });
    }
    return num; 
  };

  if (!memberId) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">
        
        {/* HEADER */}
        <div className="bg-primary-600 text-white px-6 py-4 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CheckCircle className="text-primary-200" size={24}/> 
              {loading ? "Loading..." : data?.memberName}
            </h2>
            {!loading && (
                <p className="text-primary-100 text-xs mt-0.5 font-medium">
                    {data?.rules?.name} • <span className="opacity-80">Subscription Management</span>
                </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition text-white/80 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-primary-600 min-h-[300px]">
            <Loader2 className="animate-spin w-10 h-10"/>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto bg-slate-50 custom-scrollbar">
            
            {/* 1. WEEKLY / MONTHLY GRID */}
            {data?.rules?.frequency !== 'none' && (
              <div className="bg-white p-6 border-b border-slate-100">
                 <div className="flex justify-between items-end mb-4">
                    <div>
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                           <Calendar size={18} className="text-primary-600"/> 
                           {data?.rules?.frequency === 'monthly' ? 'Monthly' : 'Weekly'} Installments
                        </h3>
                        <div className="flex gap-3 text-xs mt-1.5">
                           <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                                Paid: ₹{data?.subscription?.totalPaid}
                           </span>
                           <span className="text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded">
                                Due: ₹{data?.subscription?.totalDue}
                           </span>
                        </div>
                    </div>
                    
                    <button 
                      onClick={() => setIsGridExpanded(!isGridExpanded)}
                      className="text-xs font-bold text-primary-600 flex items-center gap-1 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition"
                    >
                      {isGridExpanded ? "Collapse" : "Expand View"}
                      {isGridExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                    </button>
                 </div>

                 {/* COMPACT PROGRESS BAR */}
                 {!isGridExpanded && (
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                           className="bg-primary-500 h-full rounded-full transition-all duration-500"
                           style={{ width: `${(data?.subscription?.totalPaid / (data?.subscription?.totalPaid + data?.subscription?.totalDue)) * 100}%` }}
                        ></div>
                    </div>
                 )}

                 {/* EXPANDED GRID */}
                 {isGridExpanded && (
                    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 mt-4 animate-fade-in">
                      {data?.subscription?.installments.map((inst) => (
                        <button
                          key={inst.number}
                          onClick={() => handleToggle(inst.number)}
                          disabled={!!processingId || !canEdit}
                          className={clsx(
                            "h-9 rounded-lg text-xs font-bold flex items-center justify-center border transition-all active:scale-95",
                            inst.isPaid 
                                ? "bg-emerald-500 text-white border-emerald-500 shadow-sm" 
                                : "bg-white text-slate-400 border-slate-200 hover:border-primary-300 hover:text-primary-600",
                            (!canEdit || processingId) && "opacity-60 cursor-not-allowed"
                          )}
                        >
                          {processingId === inst.number ? <Loader2 className="animate-spin" size={12}/> : getLabel(inst.number)}
                        </button>
                      ))}
                    </div>
                 )}
              </div>
            )}

            {/* 2. FESTIVAL CHANDA SECTION */}
            <div className="p-6">
               <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <IndianRupee size={18} className="text-rose-500"/> Festival Fees (Extra)
               </h3>

               {/* History List */}
               <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
                  <div className="max-h-48 overflow-y-auto custom-scrollbar">
                    {chandaHistory.length === 0 ? (
                       <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                           <Clock size={24} className="mb-2 opacity-20"/>
                           <p className="text-xs">No extra contributions recorded.</p>
                       </div>
                    ) : (
                       chandaHistory.map((fee) => (
                          <div key={fee._id} className="flex justify-between items-center p-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                             <div>
                                <p className="font-bold text-slate-700 text-sm">₹ {fee.amount}</p>
                                <p className="text-[10px] text-slate-400">{new Date(fee.createdAt).toLocaleDateString()}</p>
                             </div>
                             <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                {fee.notes || "Chanda"}
                             </span>
                          </div>
                       ))
                    )}
                  </div>
                  {chandaHistory.length > 0 && (
                     <div className="bg-slate-50 p-2 text-center text-xs font-bold text-slate-600 border-t border-slate-200">
                        Total Collected: ₹ {chandaHistory.reduce((acc, curr) => acc + curr.amount, 0)}
                     </div>
                  )}
               </div>

               {/* Add Fee Form */}
               {canEdit && (
                  <form onSubmit={handleAddChanda} className="flex gap-2">
                      <div className="relative flex-1">
                         <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                            <IndianRupee size={16}/>
                         </div>
                         <input 
                            type="number" 
                            placeholder="Add Amount..." 
                            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all"
                            value={chandaAmount}
                            onChange={(e) => setChandaAmount(e.target.value)}
                         />
                      </div>
                      <Button 
                         type="submit" 
                         disabled={addingChanda || !chandaAmount}
                         className="bg-rose-600 hover:bg-rose-700 text-white border-none shadow-md shadow-rose-200"
                         leftIcon={!addingChanda && <Plus size={18}/>}
                         isLoading={addingChanda}
                      >
                         Add
                      </Button>
                  </form>
               )}
            </div>

            {/* Read Only Warning */}
            {!canEdit && (
               <div className="mx-6 mb-6 bg-amber-50 text-amber-700 text-xs p-3 rounded-xl border border-amber-100 flex items-center justify-center gap-2 font-bold">
                  <AlertCircle size={14}/> View Only Mode (Admin Access Required)
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}