import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { 
  Plus, Search, Trash2, User, Phone, MapPin, IndianRupee, Loader2, Receipt, Calendar, AlertCircle, Lock, Download 
} from "lucide-react";
import { exportDonationsPDF } from "../utils/pdfExport"; 

export default function Donations() {
  const { activeClub } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cycle, setCycle] = useState(null);

  // Fetch Donations
  const fetchDonations = async () => {
    try {
      const yearRes = await api.get("/years/active");
      const activeYear = yearRes.data.data;
      
      if (!activeYear) {
        setLoading(false);
        return;
      }

      setCycle(activeYear);
      const res = await api.get("/donations");
      setDonations(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  // Calculate Total
  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);

  // Filter Logic
  const filteredDonations = donations.filter(d => 
    d.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.receiptNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Delete Handler
  const handleDelete = async (id) => {
    if(!window.confirm("Delete this donation record? This will affect the total balance.")) return;
    try {
      await api.delete(`/donations/${id}`);
      setDonations(donations.filter(d => d._id !== id));
    } catch (err) {
      alert("Failed to delete donation");
    }
  };

  // ✅ HANDLER: Export PDF
  const handleExport = () => {
    exportDonationsPDF({ 
      clubName: activeClub?.clubName || activeClub?.name || "Club Committee", // Pass Club Name
      cycleName: cycle?.name, 
      donations: filteredDonations // Exports filtered list
    });
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500"><Loader2 className="animate-spin mx-auto mb-2"/>Loading records...</div>;
  }

  if (!cycle) {
    if (activeClub?.role === "admin") {
      return (
        <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl border border-red-100 mt-6">
          <AlertCircle className="mx-auto mb-2" size={32} />
          <p className="font-bold text-lg">No Active Financial Year found.</p>
          <p className="text-sm mt-1">Please create a new festival year in the Dashboard settings.</p>
        </div>
      );
    }
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <div className="bg-gray-100 p-6 rounded-full mb-4">
          <Lock className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-700">Financial Year Closed</h2>
        <p className="text-gray-500 max-w-md mt-2">
          The committee has closed the accounts for the previous year. 
          Please wait for the admin to start the new session.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* HEADER & TOTAL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-indigo-900 text-white p-6 rounded-2xl shadow-lg">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Receipt className="text-indigo-300"/> Public Donations
          </h1>
          <p className="text-indigo-200 text-sm mt-1">Collections from non-members</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-300">Total Collected</p>
          <p className="text-3xl font-bold font-mono">₹{totalAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* ACTIONS ROW */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="Search donor name or receipt no..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
            {/* ✅ EXPORT BUTTON */}
            <button 
              onClick={handleExport}
              className="bg-white text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2 shadow-sm active:scale-95"
              title="Download PDF Report"
            >
              <Download size={20} /> <span className="hidden sm:inline">Export</span>
            </button>

            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-md active:scale-95"
            >
              <Plus size={20} /> New Donation
            </button>
        </div>
      </div>

      {/* DONATIONS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDonations.map((d) => (
            <div key={d._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition relative group">
              
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                     {d.donorName.charAt(0)}
                   </div>
                   <div>
                     <h3 className="font-bold text-gray-800">{d.donorName}</h3>
                     <p className="text-xs text-gray-500 flex items-center gap-1">
                       <Calendar size={10}/> {new Date(d.date).toLocaleDateString()}
                     </p>
                   </div>
                </div>
                <span className="font-mono font-bold text-lg text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                  ₹{d.amount}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4 pl-1">
                {d.phone && <div className="flex items-center gap-2"><Phone size={14} className="text-gray-400"/> {d.phone}</div>}
                {d.address && <div className="flex items-center gap-2"><MapPin size={14} className="text-gray-400"/> {d.address}</div>}
                {d.receiptNo && <div className="flex items-center gap-2"><Receipt size={14} className="text-gray-400"/> Receipt: {d.receiptNo}</div>}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-50 text-xs text-gray-400">
                <span>By: {d.collectedBy?.name || "Unknown"}</span>
                
                {activeClub?.role === "admin" && (
                  <button 
                    onClick={() => handleDelete(d._id)}
                    className="text-red-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

            </div>
          ))}
          
          {filteredDonations.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              No donations found.
            </div>
          )}
      </div>

      {/* ADD MODAL */}
      {showAddModal && <AddDonationModal onClose={() => setShowAddModal(false)} refresh={fetchDonations} />}
    </div>
  );
}

// ... AddDonationModal (No Changes Needed) ...
function AddDonationModal({ onClose, refresh }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post("/donations", { ...data, amount: Number(data.amount) });
      refresh();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add donation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-fade-in overflow-hidden">
        
        <div className="bg-indigo-600 p-6 text-white text-center">
          <IndianRupee className="w-10 h-10 mx-auto mb-2 opacity-90" />
          <h2 className="text-xl font-bold">Record Donation</h2>
          <p className="text-indigo-100 text-sm">Add amount to festival fund</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
             <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Donor Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input {...register("donorName", { required: true })} className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Amit Store" />
                </div>
             </div>

             <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Amount (₹)</label>
                <input type="number" {...register("amount", { required: true })} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-700" placeholder="500" />
             </div>

             <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Receipt No</label>
                <input {...register("receiptNo")} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Optional" />
             </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input {...register("phone")} className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Optional" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input {...register("address")} className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Main Road" />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition flex justify-center items-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : "Save Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}