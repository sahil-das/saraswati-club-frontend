import { useState } from "react";
import { useForm } from "react-hook-form";
import api from "../api/axios";
import { Loader2, UserPlus, User, Mail, Phone } from "lucide-react";

export default function AddMemberModal({ onClose, refresh }) {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post("/members", data);
      if (refresh) refresh();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        
        <div className="bg-indigo-600 p-6 text-white text-center">
          <UserPlus className="w-10 h-10 mx-auto mb-2 opacity-90" />
          <h2 className="text-xl font-bold">Add New Member</h2>
          <p className="text-indigo-100 text-sm">They will be linked to this club instantly.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input {...register("name", { required: true })} className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Rahul Roy" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input {...register("email", { required: true })} className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="rahul@example.com" />
            </div>
            <p className="text-xs text-gray-400 mt-1">Required for login.</p>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input {...register("phone")} className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="9876543210" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Default Password</label>
            <input type="text" {...register("password", { required: true })} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50" defaultValue="123456" />
            <p className="text-xs text-gray-400 mt-1">They can change this later.</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition flex justify-center items-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}