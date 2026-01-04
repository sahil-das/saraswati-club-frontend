import { useState } from "react";
import { useForm } from "react-hook-form";
import api from "../api/axios";
import { Loader2 } from "lucide-react";

export default function AddExpenseModal({ onClose, refresh }) {
    const { register, handleSubmit } = useForm();
    const [submitting, setSubmitting] = useState(false);

    // Default categories if not passed
    const CATEGORIES = ["Pandal", "Idol", "Light & Sound", "Food/Bhog", "Priest/Puja", "Transport", "Miscellaneous"];

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            await api.post("/expenses", { 
              ...data, 
              amount: Number(data.amount),
              date: new Date() 
            });
            refresh(); // specific refresh function
            onClose();
        } catch(err) {
            alert(err.response?.data?.message || "Failed to add expense.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
             <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
                 <div className="bg-rose-600 p-4 text-white">
                    <h2 className="text-lg font-bold">Add New Expense</h2>
                    <p className="text-rose-100 text-xs">Record a bill or payment</p>
                 </div>
                 
                 <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                     <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
                        <input {...register("title", { required: true })} placeholder="e.g. Electric Bill" className="w-full border p-2.5 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-rose-500 mt-1" />
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Amount</label>
                            <input {...register("amount", { required: true })} type="number" placeholder="0" className="w-full border p-2.5 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-rose-500 mt-1" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                            <select {...register("category", { required: true })} className="w-full border p-2.5 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-rose-500 mt-1">
                                <option value="">Select...</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                     </div>

                     <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Description (Optional)</label>
                        <textarea {...register("description")} rows="2" className="w-full border p-2.5 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-rose-500 mt-1"></textarea>
                     </div>

                     <div className="flex gap-3 mt-4">
                         <button type="button" onClick={onClose} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                         <button type="submit" disabled={submitting} className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-200 transition-colors flex justify-center items-center gap-2">
                             {submitting ? <Loader2 className="animate-spin" size={18} /> : "Submit Bill"}
                         </button>
                     </div>
                 </form>
             </div>
        </div>
    )
}