import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import api from "../api/axios";
import { Loader2, IndianRupee, User, FileText } from "lucide-react";

export default function AddPujaModal({ onClose, refresh }) {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);

  // Fetch Members for Dropdown
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const res = await api.get("/members");
        const sorted = (res.data.data || []).sort((a, b) => a.name.localeCompare(b.name));
        setMembers(sorted);
      } catch (err) {
        console.error("Failed to load members", err);
      }
    };
    loadMembers();
  }, []);

  const onSubmit = async (data) => {
    if (!data.userId) return alert("Please select a member");
    
    setLoading(true);
    try {
      await api.post("/member-fees", { 
        userId: data.userId, 
        amount: Number(data.amount),
        notes: data.notes 
      });
      if (refresh) refresh();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add contribution");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        
        <div className="bg-emerald-600 p-6 text-white text-center">
          <IndianRupee className="w-10 h-10 mx-auto mb-2 opacity-90" />
          <h2 className="text-xl font-bold">Collect Festival Chanda</h2>
          <p className="text-emerald-100 text-sm">Record member contribution</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Select Member</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={18} />
              <select 
                {...register("userId", { required: true })} 
                className="w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="">Select a member...</option>
                {members.map(m => (
                  <option key={m.userId} value={m.userId}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Amount (₹)</label>
                <input 
                  type="number" 
                  {...register("amount", { required: true })} 
                  className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-gray-700" 
                  placeholder="e.g. 500" 
                />
             </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Notes (Optional)</label>
            <div className="relative">
              <FileText className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                {...register("notes")} 
                className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
                placeholder="e.g. Cash / GPay" 
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition flex justify-center items-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : "Save Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}