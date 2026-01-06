import { useState } from "react";
import { useForm } from "react-hook-form";
import { createExpense } from "../api/expenses"; // 👈 Use centralized API
import { useToast } from "../context/ToastContext"; // 👈 Use Toast
import { Loader2, X, FileText, IndianRupee, AlignLeft, ListFilter } from "lucide-react";
import { Button } from "./ui/Button"; // Use your UI Button if available, or standard button below

export default function AddExpenseModal({ categories, onClose, refresh }) {
    const { register, handleSubmit } = useForm();
    const [submitting, setSubmitting] = useState(false);
    const toast = useToast();

    // Default categories fallback
    const CATS = categories || ["Pandal", "Idol", "Light & Sound", "Food/Bhog", "Priest/Puja", "Transport", "Miscellaneous"];

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            await createExpense({ 
              ...data, 
              amount: Number(data.amount),
              date: new Date() 
            });
            
            toast.success("Expense added successfully");
            refresh(); 
            onClose();
        } catch(err) {
            toast.error(err.response?.data?.message || "Failed to add expense");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
             <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                 
                 {/* HEADER: Indigo Theme */}
                 <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white">
                    <div>
                        <h2 className="text-lg font-bold">Add New Expense</h2>
                        <p className="text-indigo-100 text-xs">Record a bill or payment</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-1 hover:bg-indigo-700 rounded-lg transition-colors text-indigo-100 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                 </div>
                 
                 <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                     
                     {/* Title Field */}
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                            <FileText size={14} /> Title
                        </label>
                        <input 
                            {...register("title", { required: true })} 
                            placeholder="e.g. Decorator Payment" 
                            className="w-full border border-slate-200 px-4 py-3 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-800 placeholder:text-slate-400" 
                        />
                     </div>
                     
                     <div className="grid grid-cols-2 gap-5">
                        {/* Amount Field */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                                <IndianRupee size={14} /> Amount
                            </label>
                            <input 
                                {...register("amount", { required: true })} 
                                type="number" 
                                placeholder="0" 
                                className="w-full border border-slate-200 px-4 py-3 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-800" 
                            />
                        </div>

                        {/* Category Field */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                                <ListFilter size={14} /> Category
                            </label>
                            <div className="relative">
                                <select 
                                    {...register("category", { required: true })} 
                                    className="w-full border border-slate-200 px-4 py-3 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-800 appearance-none cursor-pointer"
                                >
                                    <option value="">Select...</option>
                                    {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                {/* Dropdown Arrow */}
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="m1 1 4 4 4-4"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                     </div>

                     {/* Description Field */}
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                            <AlignLeft size={14} /> Description
                        </label>
                        <textarea 
                            {...register("description")} 
                            rows="3" 
                            placeholder="Add any additional details (optional)..."
                            className="w-full border border-slate-200 px-4 py-3 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-800 resize-none"
                        ></textarea>
                     </div>

                     {/* Actions */}
                     <div className="flex gap-3 pt-2">
                         <button 
                            type="button" 
                            onClick={onClose} 
                            className="flex-1 py-3.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors text-sm"
                         >
                            Cancel
                         </button>
                         <button 
                            type="submit" 
                            disabled={submitting} 
                            className="flex-1 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all flex justify-center items-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                         >
                             {submitting ? <Loader2 className="animate-spin" size={18} /> : "Submit Bill"}
                         </button>
                     </div>
                 </form>
             </div>
        </div>
    )
}