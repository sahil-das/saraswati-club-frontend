import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom"; 
import { fetchMembers, deleteMember, updateMemberRole } from "../api/members";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import InlineButton from "../loading/InlineButton";
import SkeletonCard from "../loading/SkeletonCard"; 

import { 
  Search, UserPlus, Phone, MessageCircle, ShieldCheck, 
  Trash2, User, ChevronRight, Download,
  LayoutGrid, List
} from "lucide-react";

import { Button } from "../components/ui/Button";
import ConfirmModal from "../components/ui/ConfirmModal";
import AddMemberModal from "../components/AddMemberModal";
import { exportMembersPDF } from "../utils/pdfExport"; 

export default function Members() {
  const { activeClub } = useAuth();
  const toast = useToast();
  
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  
  const [confirmAction, setConfirmAction] = useState({ 
    isOpen: false, type: null, id: null, data: null, title: "", message: "", isDangerous: false
  });

  const isAdmin = activeClub?.role === 'admin';

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

  const initiateDelete = (id) => {
    if (!isAdmin) return; 
    setConfirmAction({ 
        isOpen: true, type: "delete", id, 
        title: "Remove Member?", message: "This member will be removed from the club.", 
        isDangerous: true 
    });
  };

  const initiateRoleToggle = (m) => {
    if (!isAdmin) return; 
    const newRole = m.role === "admin" ? "member" : "admin";
    setConfirmAction({ 
        isOpen: true, type: "role", id: m.membershipId, data: newRole,
        title: `Make ${newRole === 'admin' ? 'Admin' : 'Member'}?`, 
        message: `Are you sure you want to change ${m.name}'s role?`, 
        isDangerous: newRole === "member"
    }); 
  };

  const executeAction = async () => {
      const previousMembers = [...members];
      
      try {
        if (confirmAction.type === 'delete') {
          setMembers(prev => prev.filter(m => m.membershipId !== confirmAction.id));
          setConfirmAction({ ...confirmAction, isOpen: false }); 
          await deleteMember(confirmAction.id);
          toast.success("Member removed");

        } else if (confirmAction.type === 'role') {
           setMembers(prev => prev.map(m => m.membershipId === confirmAction.id ? { ...m, role: confirmAction.data } : m));
           setConfirmAction({ ...confirmAction, isOpen: false });
           await updateMemberRole(confirmAction.id, { role: confirmAction.data });
           toast.success("Role updated");
        }
      } catch(e) { 
          setMembers(previousMembers);
          toast.error(e.response?.data?.message || "Action failed"); 
      }
      setConfirmAction(prev => ({ ...prev, isOpen: false }));
  };

  const filteredMembers = useMemo(() => {
    return members.filter(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.phone && m.phone.includes(searchTerm))
    );
  }, [members, searchTerm]);

  const handleExportWrapper = async () => {
     return new Promise(resolve => {
        const dataToExport = filteredMembers.map(m => {
            if (isAdmin) return m;
            return { name: m.name, email: m.email, role: m.role, joinedAt: m.joinedAt };
        });
        exportMembersPDF({
            clubName: activeClub?.clubName,
            members: dataToExport,
            showPhone: isAdmin 
        });
        setTimeout(resolve, 800); 
     });
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">Members</h1>
          <p className="text-[var(--text-muted)] text-sm font-medium">
             {loading ? "Loading..." : `${members.length} Active Members`}
          </p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
             <InlineButton 
                variant="secondary"
                onClick={handleExportWrapper}
                leftIcon={<Download size={18} />}
             >
                <span className="hidden sm:inline">Export List</span>
             </InlineButton>

             {isAdmin && (
                <Button onClick={() => setShowAddModal(true)} leftIcon={<UserPlus size={18} />}>Add Member</Button>
             )}
        </div>
      </div>

      {/* TOOLBAR: SEARCH & VIEW TOGGLE */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="bg-[var(--bg-card)] p-2 rounded-xl border border-[var(--border-color)] shadow-sm flex items-center gap-2 flex-1">
          <Search className="text-[var(--text-muted)] ml-2" size={20} />
          <input 
            type="text"
            placeholder="Search by name..."
            className="flex-1 outline-none text-sm p-2 bg-transparent text-[var(--text-main)] placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* View Toggle Buttons */}
        <div className="bg-[var(--bg-card)] p-1 rounded-xl border border-[var(--border-color)] shadow-sm flex items-center gap-1 shrink-0">
          <button 
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-all ${
              viewMode === "grid" 
                ? "bg-slate-100 dark:bg-slate-700 text-[var(--text-main)] shadow-sm" 
                : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
            title="Grid View"
          >
            <LayoutGrid size={20} />
          </button>
          <button 
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-all ${
              viewMode === "list" 
                ? "bg-slate-100 dark:bg-slate-700 text-[var(--text-main)] shadow-sm" 
                : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
            title="List View"
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
           {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredMembers.length === 0 ? (
         <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)]">
            <User className="w-12 h-12 mb-2 opacity-20" />
            <p>No members found.</p>
         </div>
      ) : (
        <>
          {/* ===================== GRID VIEW ===================== */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredMembers.map((member) => {
                const Wrapper = isAdmin ? Link : 'div';
                const wrapperProps = isAdmin 
                  ? { to: `/members/${member.membershipId}`, className: "flex items-center gap-3 flex-1 group-hover:opacity-80 transition-opacity" }
                  : { className: "flex items-center gap-3 flex-1" };

                return (
                  <div key={member.membershipId} className="group bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 shadow-sm hover:shadow-md transition-all relative">
                    <div className="flex justify-between items-start">
                       <Wrapper {...wrapperProps}>
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${
                            member.role === 'admin' 
                              ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 ring-2 ring-indigo-500 dark:ring-indigo-700 ring-offset-2 dark:ring-offset-slate-900" 
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          }`}>
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          
                          <div className="min-w-0">
                            <h3 className="font-bold text-[var(--text-main)] truncate flex items-center gap-1">
                                {member.name} 
                                {isAdmin && <ChevronRight size={14} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />}
                            </h3>
                            
                            <div className="flex flex-col gap-0.5 mt-0.5">
                                <span className={`w-fit text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                                  member.role === 'admin' 
                                    ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800" 
                                    : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700"
                                }`}>
                                  {member.role}
                                </span>
                                <span className="text-[11px] text-[var(--text-muted)] truncate">
                                  {member.email}
                                </span>
                            </div>
                          </div>
                       </Wrapper>

                       {isAdmin && (
                         <div className="flex gap-1">
                            <button onClick={() => initiateRoleToggle(member)} className={`p-2 rounded-lg transition-colors ${member.role === 'admin' ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400" : "text-[var(--text-muted)] hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                              <ShieldCheck size={18} />
                            </button>
                            <button onClick={() => initiateDelete(member.membershipId)} className="p-2 text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                              <Trash2 size={18} />
                            </button>
                         </div>
                       )}
                    </div>

                    {isAdmin && member.phone && (
                      <div className="mt-4 space-y-2 pl-1">
                          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium">
                            <Phone size={14} className="shrink-0" /> {member.phone}
                          </div>
                      </div>
                    )}
                    
                    {/* Mobile Quick Actions */}
                    {isAdmin && member.phone && (
                       <div className="mt-4 pt-3 border-t border-[var(--border-color)] grid grid-cols-2 gap-3">
                          <a href={`tel:${member.phone}`} className="flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            <Phone size={14} /> Call
                          </a>
                          <button onClick={() => window.open(`https://wa.me/${member.phone.replace(/\D/g,'')}`, '_blank')} className="flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors">
                            <MessageCircle size={14} /> WhatsApp
                          </button>
                       </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ===================== LIST VIEW ===================== */}
          {viewMode === "list" && (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-[var(--border-color)]">
                    <tr>
                      <th className="px-6 py-4 font-bold text-[var(--text-muted)] uppercase text-xs">Member</th>
                      <th className="px-6 py-4 font-bold text-[var(--text-muted)] uppercase text-xs">Role</th>
                      {isAdmin && <th className="px-6 py-4 font-bold text-[var(--text-muted)] uppercase text-xs">Contact</th>}
                      {isAdmin && <th className="px-6 py-4 font-bold text-[var(--text-muted)] uppercase text-xs text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {filteredMembers.map((member) => {
                      const Wrapper = isAdmin ? Link : 'div';
                      const wrapperProps = isAdmin 
                        ? { to: `/members/${member.membershipId}`, className: "group flex items-center gap-3" }
                        : { className: "flex items-center gap-3" };

                      return (
                        <tr key={member.membershipId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4">
                             <Wrapper {...wrapperProps}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                                  member.role === 'admin' 
                                    ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400" 
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                                }`}>
                                  {member.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                   <div className="font-bold text-[var(--text-main)] flex items-center gap-2">
                                     {member.name}
                                     {isAdmin && <ChevronRight size={14} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />}
                                   </div>
                                   <div className="text-[var(--text-muted)] text-xs">{member.email}</div>
                                </div>
                             </Wrapper>
                          </td>
                          <td className="px-6 py-4">
                             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border ${
                                member.role === 'admin' 
                                  ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800" 
                                  : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700"
                             }`}>
                                {member.role}
                             </span>
                          </td>
                          {isAdmin && (
                            <td className="px-6 py-4 text-[var(--text-muted)] font-medium">
                               {member.phone ? (
                                 <div className="flex gap-3">
                                   <a href={`tel:${member.phone}`} className="hover:text-[var(--text-main)]" title="Call">
                                     {member.phone}
                                   </a>
                                   <button onClick={() => window.open(`https://wa.me/${member.phone.replace(/\D/g,'')}`, '_blank')} className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300" title="WhatsApp">
                                      <MessageCircle size={16} />
                                   </button>
                                 </div>
                               ) : <span className="text-[var(--text-muted)] opacity-50 italic">No phone</span>}
                            </td>
                          )}
                          {isAdmin && (
                            <td className="px-6 py-4 text-right">
                               <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => initiateRoleToggle(member)} className={`p-2 rounded-lg transition-colors ${member.role === 'admin' ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400" : "text-[var(--text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[var(--text-main)]"}`} title="Toggle Role">
                                    <ShieldCheck size={18} />
                                  </button>
                                  <button onClick={() => initiateDelete(member.membershipId)} className="p-2 text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete Member">
                                    <Trash2 size={18} />
                                  </button>
                               </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

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