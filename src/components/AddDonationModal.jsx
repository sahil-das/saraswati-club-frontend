import { useState } from "react";
import { useForm } from "react-hook-form";
import { createDonation } from "../api/donations"; // 👈 API
import { useToast } from "../context/ToastContext"; // 👈 Toast
import { Loader2, IndianRupee, User, Phone, MapPin, X } from "lucide-react";

export default function AddDonationModal({ onClose, refresh }) {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await createDonation({ ...data, amount: Number(data.amount) });
      toast.success("Donation recorded successfully!");
      if (refresh) refresh(); 
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add donation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* HEADER: AMBER THEME */}
        <div className="bg-amber-500 px-6 py-4 flex justify-between items-center text-white">
          <div>
              <h2 className="text-lg font-bold">Record Donation</h2>
              <p className="text-amber-100 text-xs">Add amount to festival fund</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-amber-600 rounded-lg transition-colors">
              <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
             <div className="col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Donor Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-slate-400" size={16} />
                  <input 
                    {...register("donorName", { required: true })} 
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-700 placeholder:text-slate-400" 
                    placeholder="e.g. Amit Store" 
                  />
                </div>
             </div>

             <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Amount (₹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3 text-slate-400" size={16} />
                  <input 
                    type="number" 
                    {...register("amount", { required: true })} 
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-bold text-slate-700" 
                    placeholder="500" 
                  />
                </div>
             </div>

             <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Receipt No</label>
                <input 
                  {...register("receiptNo")} 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-700" 
                  placeholder="Optional" 
                />
             </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-slate-400" size={16} />
              <input 
                {...register("phone")} 
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-700" 
                placeholder="Optional" 
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
              <input 
                {...register("address")} 
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-700" 
                placeholder="e.g. Main Road" 
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors text-sm"
            >
                Cancel
            </button>
            <button 
                type="submit" 
                disabled={loading} 
                className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 shadow-lg shadow-amber-200 transition-all flex justify-center items-center gap-2 text-sm"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Save Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}