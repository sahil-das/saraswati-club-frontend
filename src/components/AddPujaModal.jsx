import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import api from "../api/axios";
import { addFestivalFee } from "../api/festival";
import { useToast } from "../context/ToastContext";
import { X, IndianRupee, User, FileText, Loader2, ChevronDown } from "lucide-react";

// Design System
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

export default function AddPujaModal({ onClose, refresh, preSelectedMemberId }) {
  const { register, handleSubmit, setValue } = useForm();
  
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const toast = useToast();

  useEffect(() => {
    // Only fetch members list if we need to show the dropdown
    if (!preSelectedMemberId) {
        const loadMembers = async () => {
            try {
                const res = await api.get("/members");
                setMembers(res.data.data);
            } catch(err) {
                console.error(err);
            }
        }
        loadMembers();
    } else {
        // If pre-selected, just set the value for the form logic (optional, as we handle it in onSubmit)
        setValue("userId", preSelectedMemberId);
    }
  }, [preSelectedMemberId, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // ✅ Logic: Use the Prop ID if available, otherwise use Form ID
      const finalUserId = preSelectedMemberId || data.userId;
      
      if (!finalUserId) {
          toast.error("Please select a member");
          setLoading(false);
          return;
      }

      const payload = {
        ...data,
        userId: finalUserId,
        amount: Number(data.amount)
      };

      await addFestivalFee(payload);
      toast.success("Festival fee recorded successfully");
      
      if(refresh) {
          try { await refresh(); } catch(e) { console.warn("Refresh failed", e); }
      }
      onClose();

    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add fee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="bg-rose-600 px-6 py-4 flex justify-between items-center text-white">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
               <IndianRupee size={20} className="opacity-80"/> Add Festival Fee
            </h2>
            <p className="text-rose-100 text-xs">Record extra collection (Chanda)</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-rose-700 rounded-lg transition-colors text-white/80 hover:text-white">
             <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
           
           {/* ✅ FIX: HIDE Member Selection if ID is pre-selected */}
           {!preSelectedMemberId && (
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Member</label>
                  <div className="relative">
                     <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                     <select 
                         {...register("userId", { required: true })}
                         className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl pl-10 pr-10 py-3 appearance-none outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                     >
                         <option value="">Select Member...</option>
                         {members.map(m => (
                             <option key={m.userId} value={m.userId}>{m.name}</option>
                         ))}
                     </select>
                     <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
               </div>
           )}

           <Input 
              label="Amount (₹)"
              type="number"
              icon={IndianRupee}
              placeholder="e.g. 250"
              {...register("amount", { required: true })}
           />

           <Input 
              label="Notes (Optional)"
              icon={FileText}
              placeholder="e.g. Late fee / Special Chanda"
              {...register("notes")}
           />

           <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200 border-none"
                isLoading={loading}
              >
                 Record Fee
              </Button>
           </div>

        </form>
      </div>
    </div>
  );
}