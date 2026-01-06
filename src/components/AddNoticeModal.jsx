import { useState } from "react";
import { useForm } from "react-hook-form";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";
import { X, BellRing, Loader2 } from "lucide-react";

export default function AddNoticeModal({ onClose, refresh }) {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [submitting, setSubmitting] = useState(false);
    const toast = useToast();

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            await api.post("/notices", { 
                title: "Notice", 
                content: data.content, 
                priority: "normal" 
            });
            toast.success("Notice posted successfully");
            refresh();
            onClose();
        } catch (err) {
            toast.error("Failed to post notice");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
             <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                 {/* Header */}
                 <div className="bg-amber-500 px-6 py-4 flex justify-between items-center text-white">
                    <div>
                        <h2 className="text-lg font-bold flex items-center gap-2">
                           <BellRing size={20} /> New Notice
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-amber-600 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                 </div>
                 
                 <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Announcement</label>
                        <textarea 
                            {...register("content", { required: "Message is required" })} 
                            rows="4" 
                            placeholder="e.g. The General Body meeting is scheduled for Sunday..."
                            className="w-full border border-slate-200 p-3 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm resize-none placeholder:text-slate-400 font-medium"
                        ></textarea>
                        {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content.message}</p>}
                     </div>

                     <div className="flex gap-3 pt-2">
                         <button 
                            type="button" 
                            onClick={onClose} 
                            className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors text-sm"
                         >
                            Cancel
                         </button>
                         <button 
                            type="submit" 
                            disabled={submitting} 
                            className="flex-1 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 shadow-lg shadow-amber-200 transition-all flex justify-center items-center gap-2 text-sm disabled:opacity-70"
                         >
                             {submitting ? <Loader2 className="animate-spin" size={18} /> : "Post Notice"}
                         </button>
                     </div>
                 </form>
             </div>
        </div>
    );
}