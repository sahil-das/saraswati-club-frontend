import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { 
  Bell, Plus, Trash2, Megaphone, Calendar, AlertCircle, X, Loader2 
} from "lucide-react";

export default function NoticeBoard() {
  const { activeClub } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({ title: "", message: "", type: "info" });
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = activeClub?.role === "admin";

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

  const handlePost = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post("/notices", formData);
      setNotices([res.data.data, ...notices]); // Prepend new notice
      setShowForm(false);
      setFormData({ title: "", message: "", type: "info" });
    } catch (err) {
      alert("Failed to post notice");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notice?")) return;
    try {
      await api.delete(`/notices/${id}`);
      setNotices(notices.filter(n => n._id !== id));
    } catch (err) {
      alert("Failed to delete");
    }
  };

  // Helper for Styles
  const getTypeStyles = (type) => {
    switch (type) {
      case "urgent": return "bg-rose-50 border-rose-100 text-rose-700";
      case "event": return "bg-purple-50 border-purple-100 text-purple-700";
      default: return "bg-blue-50 border-blue-100 text-blue-700";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "urgent": return <AlertCircle size={18} />;
      case "event": return <Calendar size={18} />;
      default: return <Megaphone size={18} />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
      
      {/* HEADER */}
      <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
        <h3 className="font-bold text-gray-700 flex items-center gap-2">
          <Bell className="text-indigo-600" size={20} /> Notice Board
        </h3>
        {isAdmin && !showForm && (
          <button 
            onClick={() => setShowForm(true)} 
            className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-700 transition flex items-center gap-1"
          >
            <Plus size={14} /> New
          </button>
        )}
      </div>

      {/* CREATE FORM (Admin Only) */}
      {showForm && (
        <div className="p-4 bg-indigo-50 border-b border-indigo-100 animate-in slide-in-from-top-2">
           <form onSubmit={handlePost} className="space-y-3">
              <div className="flex justify-between items-center mb-1">
                 <h4 className="text-xs font-bold text-indigo-800 uppercase">Post New Notice</h4>
                 <button type="button" onClick={() => setShowForm(false)} className="text-indigo-400 hover:text-indigo-700"><X size={16}/></button>
              </div>
              
              <input 
                required 
                placeholder="Title (e.g., General Meeting)" 
                className="w-full px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
              
              <textarea 
                required 
                placeholder="Message details..." 
                className="w-full px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-20 resize-none"
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
              />

              <div className="flex gap-2">
                 <select 
                   className="px-3 py-2 rounded-lg border text-sm bg-white outline-none"
                   value={formData.type}
                   onChange={e => setFormData({...formData, type: e.target.value})}
                 >
                    <option value="info">ℹ️ Info</option>
                    <option value="event">📅 Event</option>
                    <option value="urgent">🚨 Urgent</option>
                 </select>
                 <button disabled={submitting} className="flex-1 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition">
                    {submitting ? "Posting..." : "Post Notice"}
                 </button>
              </div>
           </form>
        </div>
      )}

      {/* NOTICES LIST */}
      <div className="p-4 overflow-y-auto max-h-[400px] space-y-3 flex-1">
        {loading ? (
           <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-400" /></div>
        ) : notices.length === 0 ? (
           <div className="text-center py-10 text-gray-400">
              <p className="text-sm">No new notices.</p>
           </div>
        ) : (
           notices.map(notice => (
             <div key={notice._id} className={`p-4 rounded-xl border ${getTypeStyles(notice.type)} relative group transition-transform hover:scale-[1.01]`}>
                
                {isAdmin && (
                  <button 
                    onClick={() => handleDelete(notice._id)}
                    className="absolute top-3 right-3 text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                )}

                <div className="flex items-start gap-3">
                   <div className="mt-1 shrink-0 opacity-80">{getTypeIcon(notice.type)}</div>
                   <div>
                      <h4 className="font-bold text-sm leading-tight">{notice.title}</h4>
                      <p className="text-xs mt-1 opacity-80 whitespace-pre-wrap">{notice.message}</p>
                      
                      <div className="flex items-center gap-2 mt-3 text-[10px] opacity-60 font-medium uppercase tracking-wider">
                         <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                         <span>•</span>
                         <span>{notice.postedBy?.name || "Admin"}</span>
                      </div>
                   </div>
                </div>
             </div>
           ))
        )}
      </div>

    </div>
  );
}