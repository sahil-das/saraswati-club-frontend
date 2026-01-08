import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom"; 
import { fetchMembers, deleteMember, updateMemberRole } from "../api/members";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { 
  Search, UserPlus, Phone, MessageCircle, ShieldCheck, 
  Trash2, Mail, Loader2, User, ChevronRight, Download // 👈 Download Icon
} from "lucide-react";

import { Button } from "../components/ui/Button";
import ConfirmModal from "../components/ui/ConfirmModal";
import AddMemberModal from "../components/AddMemberModal";
// ✅ CORRECT IMPORT: Use the existing function from pdfExport.js
import { exportMembersPDF } from "../utils/pdfExport"; 

export default function Members() {
  const { activeClub } = useAuth();
  const toast = useToast();
  
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState({ isOpen: false, type: null, id: null });

  const loadMembers = async () => {
    try {
      setLoading(true);
      const res = await fetchMembers();
      setMembers(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMembers(); }, [activeClub]);

  const initiateDelete = (id) => setConfirmAction({ isOpen: true, type: "delete", id, title: "Remove Member?", message: "This cannot be undone.", isDangerous: true });
  const initiateRoleToggle = (m) => setConfirmAction({ isOpen: true, type: "role", id: m.membershipId, data: m.role === "admin" ? "member" : "admin", title: "Change Role?", message: "Modify admin privileges.", isDangerous: m.role === "member" }); 

  const executeAction = async () => {
      try {
        if (confirmAction.type === 'delete') {
          await deleteMember(confirmAction.id);
          setMembers(prev => prev.filter(m => m.membershipId !== confirmAction.id));
          toast.success("Member removed");
        } else if (confirmAction.type === 'role') {
          await updateMemberRole(confirmAction.id, confirmAction.data);
          setMembers(prev => prev.map(m => m.membershipId === confirmAction.id ? { ...m, role: confirmAction.data } : m));
          toast.success("Role updated");
        }
      } catch(e) { toast.error("Action failed"); }
      setConfirmAction({ ...confirmAction, isOpen: false });
  };

  const filteredMembers = useMemo(() => {
    return members.filter(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone?.includes(searchTerm)
    );
  }, [members, searchTerm]);

  if (loading) return <div className="flex justify-center py-20 text-indigo-600"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Members</h1>
          <p className="text-slate-500 text-sm font-medium">{members.length} Active Members</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
             {/* ✅ EXPORT BUTTON */}
             <Button 
                variant="secondary"
                onClick={() => exportMembersPDF({
                    clubName: activeClub?.clubName,
                    members: filteredMembers
                })}
             >
                <Download size={18} /> <span className="hidden sm:inline ml-2">Export List</span>
             </Button>

             {activeClub?.role === 'admin' && (
                <Button onClick={() => setShowAddModal(true)} leftIcon={<UserPlus size={18} />}>Add Member</Button>
             )}
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
        <Search className="text-slate-400 ml-2" size={20} />
        <input 
          type="text"
          placeholder="Search by name, phone..."
          className="flex-1 outline-none text-sm p-2 text-slate-700 placeholder:text-slate-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* MEMBER LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredMembers.map((member) => (
          <div key={member.membershipId} className="group bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all relative">
            
            {/* 1. TOP ROW: CLICKABLE PROFILE LINK */}
            <div className="flex justify-between items-start">
               <Link 
                 to={`/members/${member.membershipId}`} 
                 className="flex items-center gap-3 flex-1 group-hover:opacity-80 transition-opacity"
               >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${
                    member.role === 'admin' 
                      ? "bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500 ring-offset-2" 
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {member.name.charAt(0)}
                  </div>
                  
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 truncate flex items-center gap-1">
                        {member.name} 
                        <ChevronRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                       <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                         member.role === 'admin' ? "bg-indigo-50 text-indigo-700 border-indigo-100" : "bg-slate-50 text-slate-500 border-slate-100"
                       }`}>
                         {member.role}
                       </span>
                    </div>
                  </div>
               </Link>

               {/* Admin Actions */}
               {activeClub?.role === 'admin' && (
                 <div className="flex gap-1">
                    <button onClick={() => initiateRoleToggle(member)} className={`p-2 rounded-lg transition-colors ${member.role === 'admin' ? "bg-indigo-50 text-indigo-600" : "text-slate-300 hover:bg-slate-50"}`}>
                      <ShieldCheck size={18} />
                    </button>
                    <button onClick={() => initiateDelete(member.membershipId)} className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                 </div>
               )}
            </div>

            {/* 2. CONTACT DETAILS */}
            <div className="mt-4 space-y-2 pl-1">
              {member.phone && (
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <Phone size={14} className="shrink-0" /> {member.phone}
                </div>
              )}
            </div>

            {/* 3. MOBILE ACTIONS */}
            {member.phone && (
               <div className="mt-4 pt-3 border-t border-slate-50 grid grid-cols-2 gap-3">
                  <a href={`tel:${member.phone}`} className="flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-50 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors">
                    <Phone size={14} /> Call
                  </a>
                  <button onClick={() => window.open(`https://wa.me/${member.phone.replace(/\D/g,'')}`, '_blank')} className="flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors">
                    <MessageCircle size={14} /> WhatsApp
                  </button>
               </div>
            )}
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
         <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <User className="w-12 h-12 mb-2 opacity-20" />
            <p>No members found.</p>
         </div>
      )}

      {/* Modals */}
      {showAddModal && <AddMemberModal onClose={() => setShowAddModal(false)} refresh={loadMembers} />}
      <ConfirmModal 
        isOpen={confirmAction.isOpen}
        onClose={() => setConfirmAction({ ...confirmAction, isOpen: false })}
        onConfirm={executeAction}
        title={confirmAction.title}
        message={confirmAction.message}
        isDangerous={confirmAction.isDangerous}
      />
    </div>
  );
}