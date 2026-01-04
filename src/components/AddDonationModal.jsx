import { useState } from "react";
import { useForm } from "react-hook-form";
import api from "../api/axios";
import { Loader2, IndianRupee, User, Phone, MapPin } from "lucide-react";

// ✅ CRITICAL: Must start with "export default"
export default function AddDonationModal({ onClose, refresh }) {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post("/donations", { ...data, amount: Number(data.amount) });
      if (refresh) refresh(); // Call refresh if provided
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add donation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        
        <div className="bg-indigo-600 p-6 text-white text-center">
          <IndianRupee className="w-10 h-10 mx-auto mb-2 opacity-90" />
          <h2 className="text-xl font-bold">Record Donation</h2>
          <p className="text-indigo-100 text-sm">Add amount to festival fund</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
             <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Donor Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input {...register("donorName", { required: true })} className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Amit Store" />
                </div>
             </div>

             <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Amount (₹)</label>
                <input type="number" {...register("amount", { required: true })} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-700" placeholder="500" />
             </div>

             <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Receipt No</label>
                <input {...register("receiptNo")} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Optional" />
             </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input {...register("phone")} className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Optional" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input {...register("address")} className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Main Road" />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition flex justify-center items-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : "Save Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}