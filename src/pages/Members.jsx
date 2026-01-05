import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom"; // 👈 Import Hook
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { 
  Plus, Search, Trash2, User, Phone, Mail, Loader2, UserPlus, Shield, UserCog, CreditCard, Download, ExternalLink 
} from "lucide-react";
import SubscriptionModal from "../components/SubscriptionModal";
import { exportMembersPDF } from "../utils/pdfExport";

export default function Members() {
  const navigate = useNavigate(); // 👈 Initialize Navigation
  const { activeClub, user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState(null);

  // Fetch Members on Load
  const fetchMembers = async () => {
    try {
      const res = await api.get("/members");
      setMembers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Function to handle role toggle
  const toggleRole = async (memberId, currentRole) => {
    const newRole = currentRole === "admin" ? "member" : "admin";
    if (!window.confirm(newRole === "admin" ? "Make Admin?" : "Demote to Member?")) return;

    try {
      await api.put(`/members/${memberId}/role`, { role: newRole });
      setMembers(members.map(m => m.membershipId === memberId ? { ...m, role: newRole } : m));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update role");
    }
  };

  // Filter Logic
  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.phone.includes(searchTerm)
  );

  const handleDelete = async (id) => {
    if(!window.confirm("Remove this member?")) return;
    try {
      await api.delete(`/members/${id}`);
      setMembers(members.filter(m => m.membershipId !== id));
    } catch (err) {
      alert("Failed to delete member");
    }
  };

  const handleExport = () => {
    exportMembersPDF({
      clubName: activeClub?.clubName || "Club Committee",
      members: members 
    });
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Club Members</h1>
          <p className="text-gray-500 text-sm">{members.length} Active Members</p>
        </div>
        
        {activeClub?.role === "admin" && (
          <div className="flex gap-3">
            <button onClick={handleExport} className="bg-white text-indigo-600 border border-indigo-200 px-4 py-2.5 rounded-xl font-bold hover:bg-indigo-50 transition flex items-center gap-2 shadow-sm">
               <Download size={20} /> <span className="hidden sm:inline">Export List</span>
            </button>
            <button onClick={() => setShowAddModal(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg shadow-indigo-200">
               <Plus size={20} /> Add Member
            </button>
          </div>
        )}
      </div>

      {/* SEARCH BAR */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input 
          type="text"
          placeholder="Search by name or phone..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* MEMBERS LIST */}
      {loading ? (
        <div className="text-center py-10 text-gray-500"><Loader2 className="animate-spin mx-auto mb-2"/>Loading members...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <div key={member.membershipId} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition group relative overflow-hidden flex flex-col justify-between">
              
              {/* ✅ CLICKABLE AREA: Navigate to Details */}
              <div 
                onClick={() => navigate(`/members/${member.membershipId}`)} 
                className="cursor-pointer"
                title="View Member Details"
              >
                {/* Role Badge */}
                <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold uppercase rounded-bl-xl ${member.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                  {member.role}
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white transition-transform group-hover:scale-105 ${member.role === 'admin' ? 'bg-indigo-600' : 'bg-gray-400'}`}>
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                      {member.name} <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 text-indigo-400"/>
                    </h3>
                    <p className="text-xs text-gray-500">Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-400"/> {member.phone || "No Phone"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-400"/> {member.email}
                  </div>
                </div>
              </div>

              {/* ACTIONS AREA (Stops propagation to prevent navigation when clicking buttons) */}
              {activeClub?.role === "admin" && (
                <div className="mt-2 border-t border-gray-100 pt-3" onClick={(e) => e.stopPropagation()}>
                  
                  <button 
                    onClick={() => setSelectedMemberId(member.membershipId)}
                    className="w-full mb-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-bold hover:bg-indigo-100 transition flex items-center justify-center gap-2 text-sm"
                  >
                    <CreditCard size={16} /> Collect Chanda
                  </button>

                  <div className="flex gap-2">
                    {member.role !== 'admin' && (
                      <button 
                        onClick={() => handleDelete(member.membershipId)}
                        className="flex-1 py-1.5 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition text-xs font-bold flex items-center justify-center gap-1"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    )}

                    {member.userId !== user?.id && (
                      <button 
                        onClick={() => toggleRole(member.membershipId, member.role)}
                        className={`flex-1 py-1.5 rounded-lg border transition text-xs font-bold flex items-center justify-center gap-1
                          ${member.role === 'admin' ? "border-orange-100 text-orange-600 hover:bg-orange-50" : "border-indigo-100 text-indigo-600 hover:bg-indigo-50"}`}
                      >
                        {member.role === 'admin' ? <><UserCog size={14} /> Demote</> : <><Shield size={14} /> Admin</>}
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {showAddModal && <AddMemberModal onClose={() => setShowAddModal(false)} refresh={fetchMembers} />}
      
      {selectedMemberId && (
        <SubscriptionModal 
          memberId={selectedMemberId} 
          onClose={() => setSelectedMemberId(null)}
          canEdit={activeClub?.role === "admin"} 
        />
      )}
    </div>
  );
}

// ... AddMemberModal remains unchanged ...
function AddMemberModal({ onClose, refresh }) {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post("/members", data);
      refresh();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
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