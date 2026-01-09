import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom"; 
import { fetchMembers, deleteMember, updateMemberRole } from "../api/members";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
// Import InlineButton and Skeleton
import InlineButton from "../loading/InlineButton";
import SkeletonCard from "../loading/SkeletonCard"; 

import { 
  Search, UserPlus, Phone, MessageCircle, ShieldCheck, 
  Trash2, Loader2, User, ChevronRight, Download
} from "lucide-react";

import { Button } from "../components/ui/Button";
import ConfirmModal from "../components/ui/ConfirmModal";
import AddMemberModal from "../components/AddMemberModal";
import { exportMembersPDF } from "../utils/pdfExport"; 

export default function Members() {
  const { activeClub } = useAuth();
  const toast = useToast();
  
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true); // Initial load
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  
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
      // Small delay to prevent immediate flash if data is cached/fast
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
      // Optimistic Updates
      const previousMembers = [...members];
      
      try {
        if (confirmAction.type === 'delete') {
          // 1. Optimistic Update: Remove from UI immediately
          setMembers(prev => prev.filter(m => m.membershipId !== confirmAction.id));
          setConfirmAction({ ...confirmAction, isOpen: false }); // Close modal immediately

          // 2. Perform API call
          await deleteMember(confirmAction.id);
          toast.success("Member removed");

        } else if (confirmAction.type === 'role') {
           // 1. Optimistic Update
           setMembers(prev => prev.map(m => m.membershipId === confirmAction.id ? { ...m, role: confirmAction.data } : m));
           setConfirmAction({ ...confirmAction, isOpen: false });

           // 2. Perform API call
           await updateMemberRole(confirmAction.id, { role: confirmAction.data });
           toast.success("Role updated");
        }
      } catch(e) { 
          // 3. Rollback on Error
          setMembers(previousMembers);
          toast.error(e.response?.data?.message || "Action failed"); 
      }
      // Ensure modal is closed if not already
      setConfirmAction(prev => ({ ...prev, isOpen: false }));
  };

  const filteredMembers = useMemo(() => {
    return members.filter(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.phone && m.phone.includes(searchTerm))
    );
  }, [members, searchTerm]);

  // Wrapped export handler to return promise for button loader
  const handleExportWrapper = async () => {
     // Simulate async generation if it were heavy, 
     // or just allow the InlineButton to handle the UI feedback
     return new Promise(resolve => {
        // Logic...
        const dataToExport = filteredMembers.map(m => {
            if (isAdmin) return m;
            return { name: m.name, email: m.email, role: m.role, joinedAt: m.joinedAt };
        });
        exportMembersPDF({
            clubName: activeClub?.clubName,
            members: dataToExport,
            showPhone: isAdmin 
        });
        // Resolve after short delay to show the spinner
        setTimeout(resolve, 800); 
     });
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Members</h1>
          <p className="text-slate-500 text-sm font-medium">
             {loading ? "Loading..." : `${members.length} Active Members`}
          </p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
             {/* Use InlineButton for visual feedback */}
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

      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
        <Search className="text-slate-400 ml-2" size={20} />
        <input 
          type="text"
          placeholder="Search by name..."
          className="flex-1 outline-none text-sm p-2 text-slate-700 placeholder:text-slate-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* MEMBER LIST GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        
        {/* Render Skeletons when loading */}
        {loading && Array.from({ length: 6 }).map((_, i) => (
           <SkeletonCard key={i} />
        ))}

        {/* Render Actual Data when loaded */}
        {!loading && filteredMembers.map((member) => {
          const Wrapper = isAdmin ? Link : 'div';
          const wrapperProps = isAdmin 
            ? { to: `/members/${member.membershipId}`, className: "flex items-center gap-3 flex-1 group-hover:opacity-80 transition-opacity" }
            : { className: "flex items-center gap-3 flex-1" };

          return (
            <div key={member.membershipId} className="group bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all relative">
              <div className="flex justify-between items-start">
                 <Wrapper {...wrapperProps}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${
                      member.role === 'admin' 
                        ? "bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500 ring-offset-2" 
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 truncate flex items-center gap-1">
                          {member.name} 
                          {isAdmin && <ChevronRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                      </h3>
                      
                      <div className="flex flex-col gap-0.5 mt-0.5">
                          <span className={`w-fit text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                            member.role === 'admin' ? "bg-indigo-50 text-indigo-700 border-indigo-100" : "bg-slate-50 text-slate-500 border-slate-100"
                          }`}>
                            {member.role}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate">
                            {member.email}
                          </span>
                      </div>
                    </div>
                 </Wrapper>

                 {isAdmin && (
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
              
              {/* (Existing contact details code omitted for brevity but should be preserved) */}
            </div>
          );
        })}
      </div>

      {!loading && filteredMembers.length === 0 && (
         <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <User className="w-12 h-12 mb-2 opacity-20" />
            <p>No members found.</p>
         </div>
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