import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Plus, Trash2, Calendar, Loader2, Megaphone, Bell } from "lucide-react";
import { Card } from "./ui/Card";
import ConfirmModal from "./ui/ConfirmModal";
import AddNoticeModal from "./AddNoticeModal";

export default function NoticeBoard() {
  const { activeClub } = useAuth();
  const toast = useToast();
  
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchNotices();
  }, [activeClub]);

  const fetchNotices = async () => {
    try {
      const res = await api.get("/notices");
      setNotices(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/notices/${deleteId}`);
      setNotices(prev => prev.filter(n => n._id !== deleteId));
      toast.success("Notice removed");
    } catch (err) {
      toast.error("Failed to delete notice");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <>
      <Card className="h-full flex flex-col min-h-[320px] shadow-sm border-[var(--border-color)]" noPadding>
         {/* Header */}
         <div className="p-5 border-b border-[var(--border-color)] flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
            <h3 className="font-bold text-[var(--text-main)] flex items-center gap-2">
               <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                  <Megaphone size={16} />
               </div>
               Notice Board
            </h3>
            {activeClub?.role === "admin" && (
               <button 
                  onClick={() => setShowAdd(true)}
                  className="p-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg hover:border-amber-500 hover:text-amber-600 transition shadow-sm text-[var(--text-muted)]"
                  title="Add Notice"
               >
                  <Plus size={16} />
               </button>
            )}
         </div>

         {/* Content */}
         <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
            {loading ? (
               <div className="flex flex-col items-center justify-center py-10 gap-2 text-[var(--text-muted)]">
                  <Loader2 className="animate-spin" />
                  <span className="text-xs">Loading updates...</span>
               </div>
            ) : notices.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-40 text-[var(--text-muted)] text-center">
                  <Bell className="mb-2 opacity-20" size={32} />
                  <p className="text-sm font-medium">No new announcements</p>
                  <p className="text-xs opacity-70">Check back later for updates</p>
               </div>
            ) : (
               notices.map((notice) => (
                  <div key={notice._id} className="group relative bg-amber-50/40 dark:bg-amber-900/10 border border-amber-100/60 dark:border-amber-900/20 p-4 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
                     <p className="text-[var(--text-main)] text-sm font-medium leading-relaxed pr-6">
                        {notice.content}
                     </p>
                     
                     <div className="mt-3 flex items-center gap-2 text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                        <Calendar size={12} /> 
                        {new Date(notice.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                     </div>
                     
                     {activeClub?.role === "admin" && (
                        <button 
                          onClick={() => setDeleteId(notice._id)}
                          className="absolute top-2 right-2 p-1.5 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          title="Delete Notice"
                        >
                           <Trash2 size={14} />
                        </button>
                     )}
                  </div>
               ))
            )}
         </div>
      </Card>

      {showAdd && <AddNoticeModal onClose={() => setShowAdd(false)} refresh={fetchNotices} />}
      
      <ConfirmModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Notice?"
        message="This will remove the announcement for all members."
        isDangerous={true}
      />
    </>
  );
}