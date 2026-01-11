import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";
import { Loader2, Calendar, Coins, Settings, X } from "lucide-react";

export default function CreateYearModal({ onSuccess, onClose }) {
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      frequency: "weekly",
      totalInstallments: 52,
      amountPerInstallment: 0,
      openingBalance: "" 
    }
  });
  
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const frequency = watch("frequency");

  // ✅ Auto-set installments when frequency changes
  useEffect(() => {
    if (frequency === "monthly") {
      setValue("totalInstallments", 12);
    } else if (frequency === "weekly") {
      setValue("totalInstallments", 52);
    } else {
      setValue("totalInstallments", 0);
    }
  }, [frequency, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // ✅ FIX 1: If empty string, send undefined. 
      const balanceToSend = data.openingBalance === "" ? undefined : Number(data.openingBalance);

      // ✅ FIX 2: Handle 'none' frequency
      let installmentsToSend;
      if (data.frequency === 'none') {
          installmentsToSend = undefined;
      } else if (data.frequency === 'monthly') {
          installmentsToSend = 12;
      } else {
          installmentsToSend = Number(data.totalInstallments);
      }

      await api.post("/years", {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        openingBalance: balanceToSend, 
        subscriptionFrequency: data.frequency,
        totalInstallments: installmentsToSend,
        amountPerInstallment: Number(data.amountPerInstallment)
      });
      
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create year");
    } finally {
      setLoading(false);
    }
  };

  return (
    // 1. BACKDROP ANIMATION (Fade In)
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-300">
      
      {/* 2. MODAL CARD ANIMATION (Zoom In + Slide Up) */}
      <div className="bg-[var(--bg-card)] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-[var(--border-color)]">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all z-10"
        >
          <X size={20} />
        </button>

        <div className="bg-primary-600 px-6 py-6 text-white text-center shrink-0">
          <div className="bg-white/20 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
             <Calendar className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold">Start New Cycle</h2>
          <p className="text-primary-100 text-sm">Set up rules for the upcoming festival.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          
          {/* Basic Details */}
          <div>
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase ml-1">Event Name</label>
            <input
              {...register("name", { required: true })}
              className="w-full border border-[var(--border-color)] rounded-xl px-4 py-2.5 mt-1 bg-[var(--bg-input)] text-[var(--text-main)] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-medium transition-all"
              placeholder="e.g. Durga Puja 2026"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase ml-1">Start Date</label>
              <input type="date" {...register("startDate", { required: true })} className="w-full border border-[var(--border-color)] rounded-xl px-3 py-2.5 mt-1 bg-[var(--bg-input)] text-[var(--text-main)] focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase ml-1">End Date</label>
              <input type="date" {...register("endDate", { required: true })} className="w-full border border-[var(--border-color)] rounded-xl px-3 py-2.5 mt-1 bg-[var(--bg-input)] text-[var(--text-main)] focus:outline-none focus:border-primary-500" />
            </div>
          </div>

          {/* RULES SECTION */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-[var(--border-color)]">
             <h3 className="text-sm font-bold text-[var(--text-main)] mb-3 flex items-center gap-2">
               <Settings size={16} className="text-primary-500"/> Collection Rules
             </h3>
             
             <div className="space-y-4">
               <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1.5">Frequency</label>
                  <select {...register("frequency")} className="w-full border border-[var(--border-color)] rounded-xl px-3 py-2.5 text-sm bg-[var(--bg-input)] text-[var(--text-main)] outline-none focus:border-primary-500">
                    <option value="weekly">Weekly Collection</option>
                    <option value="monthly">Monthly Collection</option>
                    <option value="none">No Recurring (Donations Only)</option>
                  </select>
               </div>
               
               {frequency !== "none" && (
                 <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 fade-in">
                    {frequency === "weekly" ? (
                      <div>
                         <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1.5">Total Weeks</label>
                         <input 
                           type="number" 
                           {...register("totalInstallments")} 
                           className="w-full border border-[var(--border-color)] rounded-xl px-3 py-2.5 text-sm bg-[var(--bg-input)] text-[var(--text-main)] focus:border-primary-500 outline-none"
                           placeholder="52"
                         />
                      </div>
                    ) : (
                      <div className="flex flex-col justify-center bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-3">
                         <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Duration</span>
                         <span className="text-sm font-bold text-[var(--text-main)]">12 Months (Fixed)</span>
                      </div>
                    )}

                    <div>
                       <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1.5">
                         Amount / {frequency === "weekly" ? "Week" : "Month"}
                       </label>
                       <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                          <input 
                             type="number" 
                             {...register("amountPerInstallment")} 
                             className="w-full border border-[var(--border-color)] rounded-xl pl-7 pr-3 py-2.5 text-sm bg-[var(--bg-input)] text-[var(--text-main)] focus:border-primary-500 outline-none font-bold" 
                             placeholder="e.g. 50"
                          />
                       </div>
                    </div>
                 </div>
               )}
             </div>
          </div>

          {/* Opening Balance */}
          <div>
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase flex items-center gap-2 ml-1">
              <Coins size={14}/> Opening Balance
            </label>
            <input
              type="number"
              {...register("openingBalance")}
              className="w-full border border-[var(--border-color)] rounded-xl px-4 py-2.5 mt-1 bg-[var(--bg-input)] text-[var(--text-main)] focus:border-emerald-500 outline-none placeholder-slate-400 transition-colors"
              placeholder="Leave empty to auto-transfer balance"
            />
            <p className="text-[10px] text-[var(--text-muted)] mt-1.5 ml-1 leading-tight">
              If empty, we will calculate and transfer the remaining balance from the last closed year.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition flex justify-center items-center gap-2 shadow-lg shadow-primary-200 dark:shadow-none"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Start Year"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}