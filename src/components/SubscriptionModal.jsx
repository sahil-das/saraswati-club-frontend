import { useState, useEffect } from "react";
import api from "../api/axios";
import { 
  X, Loader2, CheckCircle, IndianRupee, AlertCircle, ChevronDown, ChevronUp, Plus
} from "lucide-react";

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
         const userFees = feeRes.data.data.filter(f => 
             f.user?._id === subData.memberUserId || f.user === subData.memberUserId
         ); 
         setChandaHistory(userFees);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load data");
      onClose();
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
    } catch (err) { alert("Payment failed"); } 
    finally { setProcessingId(null); }
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
      await fetchData();
    } catch (err) { alert("Failed to add chanda"); } 
    finally { setAddingChanda(false); }
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
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* HEADER */}
        <div className="bg-indigo-900 text-white p-5 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <IndianRupee className="text-yellow-400"/> {data?.memberName || "Loading..."}
            </h2>
            <p className="text-indigo-200 text-xs mt-1">
               Cycle: <span className="font-bold text-white">{data?.rules?.name}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition"><X size={24} /></button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-indigo-600 min-h-[300px]"><Loader2 className="animate-spin w-10 h-10"/></div>
        ) : (
          <div className="flex-1 overflow-y-auto bg-gray-50">
            
            {/* ✅ FIX: HIDE IF FREQUENCY IS 'NONE' */}
            {data?.rules?.frequency !== 'none' && (
              <div className="bg-white p-5 border-b border-gray-100">
                 <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                           <CheckCircle size={18} className="text-indigo-600"/> 
                           {data?.rules?.frequency === 'monthly' ? 'Monthly' : 'Weekly'} Subscription
                        </h3>
                        <p className="text-xs text-gray-500">
                           Paid: <span className="font-bold text-green-600">₹{data?.subscription?.totalPaid}</span> 
                           <span className="mx-2">|</span>
                           Due: <span className="font-bold text-red-500">₹{data?.subscription?.totalDue}</span>
                        </p>
                    </div>
                    <button 
                      onClick={() => setIsGridExpanded(!isGridExpanded)}
                      className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition"
                    >
                      {isGridExpanded ? "Collapse" : "Expand"}
                      {isGridExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                    </button>
                 </div>

                 {/* COMPACT BAR */}
                 {!isGridExpanded && (
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden mt-2">
                        <div 
                           className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                           style={{ width: `${(data?.subscription?.totalPaid / (data?.subscription?.totalPaid + data?.subscription?.totalDue)) * 100}%` }}
                        ></div>
                    </div>
                 )}

                 {/* EXPANDED GRID */}
                 {isGridExpanded && (
                    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 mt-4 animate-in fade-in">
                      {data?.subscription?.installments.map((inst) => (
                        <button
                          key={inst.number}
                          onClick={() => handleToggle(inst.number)}
                          disabled={!!processingId || !canEdit}
                          className={`
                            h-9 rounded text-xs font-bold flex items-center justify-center border transition-all
                            ${inst.isPaid ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-gray-500 hover:border-indigo-300"}
                            ${!canEdit ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}
                          `}
                        >
                          {processingId === inst.number ? <Loader2 className="animate-spin" size={12}/> : getLabel(inst.number)}
                        </button>
                      ))}
                    </div>
                 )}
              </div>
            )}

            {/* === FESTIVAL CHANDA SECTION (ALWAYS VISIBLE) === */}
            <div className="p-5">
               <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                  <IndianRupee size={18} className="text-emerald-600"/> Festival Chanda
               </h3>

               {/* History List */}
               <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-4">
                  <div className="max-h-48 overflow-y-auto">
                    {chandaHistory.length === 0 ? (
                       <p className="text-xs text-gray-400 p-4 text-center">No extra contributions yet.</p>
                    ) : (
                       chandaHistory.map((fee) => (
                          <div key={fee._id} className="flex justify-between items-center p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50">
                             <div>
                                <p className="font-bold text-gray-700 text-sm">₹ {fee.amount}</p>
                                <p className="text-[10px] text-gray-400">{new Date(fee.createdAt).toLocaleDateString()}</p>
                             </div>
                             <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500">{fee.notes || "Chanda"}</span>
                          </div>
                       ))
                    )}
                  </div>
                  {chandaHistory.length > 0 && (
                     <div className="bg-gray-50 p-2 text-center text-xs font-bold text-gray-500 border-t border-gray-100">
                        Total: ₹ {chandaHistory.reduce((acc, curr) => acc + curr.amount, 0)}
                     </div>
                  )}
               </div>

               {/* Add Form */}
               {canEdit && (
                  <form onSubmit={handleAddChanda} className="flex gap-2">
                     <div className="relative flex-1">
                        <IndianRupee size={16} className="absolute left-3 top-3 text-gray-400"/>
                        <input 
                           type="number" 
                           placeholder="Amount..." 
                           className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                           value={chandaAmount}
                           onChange={(e) => setChandaAmount(e.target.value)}
                        />
                     </div>
                     <button 
                        type="submit" 
                        disabled={addingChanda || !chandaAmount}
                        className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
                     >
                        {addingChanda ? <Loader2 className="animate-spin" size={18}/> : <Plus size={20}/>} Add
                     </button>
                  </form>
               )}
            </div>

            {!canEdit && (
               <div className="mx-5 mb-5 bg-orange-50 text-orange-600 text-xs p-3 rounded-lg flex items-center justify-center gap-2 font-bold">
                  <AlertCircle size={14}/> View Only Mode
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}