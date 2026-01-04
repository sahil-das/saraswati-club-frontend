import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import api from "../api/axios";
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
  const frequency = watch("frequency");

  // ✅ Auto-set installments when frequency changes
  useEffect(() => {
    if (frequency === "monthly") {
      setValue("totalInstallments", 12);
    } else if (frequency === "weekly") {
      setValue("totalInstallments", 52); // Default to 52 for weekly
    } else {
      setValue("totalInstallments", 0);
    }
  }, [frequency, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const balanceToSend = data.openingBalance === "" ? "" : Number(data.openingBalance);

      await api.post("/years", {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        openingBalance: balanceToSend,
        subscriptionFrequency: data.frequency,
        
        // ✅ Send 12 if monthly, otherwise use the input value
        totalInstallments: data.frequency === 'monthly' ? 12 : Number(data.totalInstallments),
        
        amountPerInstallment: Number(data.amountPerInstallment)
      });
      
      alert("New Financial Year Started Successfully!");
      if (onSuccess) onSuccess();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create year");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all z-10"
        >
          <X size={20} />
        </button>

        <div className="bg-indigo-600 p-6 text-white text-center shrink-0">
          <Calendar className="w-10 h-10 mx-auto mb-2 opacity-90" />
          <h2 className="text-2xl font-bold">Start New Cycle</h2>
          <p className="text-indigo-100 text-sm">Set up rules for the upcoming festival.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 overflow-y-auto">
          
          {/* 1. Basic Details */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Event Name</label>
            <input
              {...register("name", { required: true })}
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 mt-1 focus:border-indigo-500 outline-none font-medium"
              placeholder="e.g. Durga Puja 2026"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Start Date</label>
              <input type="date" {...register("startDate", { required: true })} className="w-full border rounded-lg px-3 py-2 mt-1" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">End Date</label>
              <input type="date" {...register("endDate", { required: true })} className="w-full border rounded-lg px-3 py-2 mt-1" />
            </div>
          </div>

          {/* 2. RULES SECTION */}
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
             <h3 className="text-sm font-bold text-indigo-700 mb-3 flex items-center gap-2">
               <Settings size={16}/> Collection Rules
             </h3>
             
             <div className="space-y-4">
               {/* Frequency Selector */}
               <div>
                  <label className="block text-xs text-gray-600 mb-1">Frequency</label>
                  <select {...register("frequency")} className="w-full border rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="weekly">Weekly Subscription</option>
                    <option value="monthly">Monthly Subscription</option>
                    <option value="none">No Recurring (Donations Only)</option>
                  </select>
               </div>
               
               {/* Conditional Inputs */}
               {frequency !== "none" && (
                 <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 fade-in">
                    
                    {/* ✅ SHOW ONLY IF WEEKLY */}
                    {frequency === "weekly" ? (
                      <div>
                         <label className="block text-xs text-gray-600 mb-1">
                           Total Weeks
                         </label>
                         <input 
                            type="number" 
                            {...register("totalInstallments")} 
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="52"
                         />
                      </div>
                    ) : (
                      /* If Monthly, show static text or nothing */
                      <div className="flex flex-col justify-center">
                         <span className="text-xs text-gray-400 uppercase font-bold">Duration</span>
                         <span className="text-sm font-bold text-gray-700">12 Months (Fixed)</span>
                      </div>
                    )}

                    <div>
                       <label className="block text-xs text-gray-600 mb-1">
                         Amount / {frequency === "weekly" ? "Week" : "Month"}
                       </label>
                       <div className="relative">
                          <span className="absolute left-3 top-2 text-gray-400">₹</span>
                          <input 
                              type="number" 
                              {...register("amountPerInstallment")} 
                              className="w-full border rounded-lg pl-6 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                              placeholder="e.g. 50"
                          />
                       </div>
                    </div>
                 </div>
               )}
             </div>
          </div>

          {/* 3. Opening Balance */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
              <Coins size={14}/> Opening Balance
            </label>
            <input
              type="number"
              {...register("openingBalance")}
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 mt-1 focus:border-green-500 outline-none placeholder-gray-400 transition-colors"
              placeholder="Leave empty to auto-transfer balance"
            />
            <p className="text-[10px] text-gray-400 mt-1 ml-1">
              If empty, we will calculate and transfer the remaining balance from the last closed year.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition flex justify-center items-center gap-2 shadow-lg shadow-indigo-200"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Start Year"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}