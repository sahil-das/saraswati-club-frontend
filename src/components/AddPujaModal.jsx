import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import api from "../api/axios";
import { addFestivalFee } from "../api/festival"; // 👈 API
import { useToast } from "../context/ToastContext"; // 👈 Toast
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
    const loadMembers = async () => {
        try {
            const res = await api.get("/members");
            setMembers(res.data.data);
            if (preSelectedMemberId) {
                setValue("userId", preSelectedMemberId);
            }
        } catch(err) {
            console.error(err);
        }
    }
    loadMembers();
  }, [preSelectedMemberId, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await addFestivalFee({ ...data, amount: Number(data.amount) });
      toast.success("Festival fee recorded successfully");
      if(refresh) refresh();
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
        
        {/* HEADER: Rose Theme */}
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
           
           <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Member</label>
              <div className="relative">
                 <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                 <select 
                    {...register("userId", { required: true })}
                    disabled={!!preSelectedMemberId}
                    className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl pl-10 pr-10 py-3 appearance-none outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 disabled:bg-slate-50 disabled:text-slate-500"
                 >
                    <option value="">Select Member...</option>
                    {members.map(m => (
                        <option key={m.userId} value={m.userId}>{m.name}</option>
                    ))}
                 </select>
                 <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
           </div>

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