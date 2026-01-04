import { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import { useFinance } from "../context/FinanceContext";
import { useAuth } from "../context/AuthContext";
import { 
  Loader2, IndianRupee, User, Plus, Trash2, Calendar, Search, Filter, Download 
} from "lucide-react";
import { exportPujaPDF } from "../utils/pdfExport"; // ✅ Import Export

export default function PujaContributions() {
  const { fetchCentralFund, pujaTotal } = useFinance();
  const { activeClub } = useAuth(); 

  const [members, setMembers] = useState([]);
  const [rows, setRows] = useState([]);
  const [activeYear, setActiveYear] = useState(null); // ✅ Track Year Name
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Form State
  const [form, setForm] = useState({ userId: "", amount: "", notes: "" });

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const load = async () => {
      try {
        // 1. Fetch Basic Data
        const [mRes, pRes, yearRes] = await Promise.all([
          api.get("/members"),
          api.get("/member-fees"),
          api.get("/years/active"), // ✅ Fetch Year Info
        ]);
        
        // Sort members alphabetically
        const sortedMembers = (mRes.data.data || []).sort((a, b) => 
          a.name.localeCompare(b.name)
        );

        setMembers(sortedMembers);
        setRows(pRes.data.data || []);
        setActiveYear(yearRes.data.data);
        
        await fetchCentralFund(); 
      } catch (err) {
        console.error("Data load error", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ================= HANDLERS ================= */
  const addContribution = async (e) => {
    e.preventDefault();
    if (!form.userId || !form.amount) return alert("Please select a member and amount");

    setSubmitting(true);
    try {
      await api.post("/member-fees", {
        userId: form.userId, 
        amount: Number(form.amount),
        notes: form.notes
      });
      setForm({ userId: "", amount: "", notes: "" });
      
      const res = await api.get("/member-fees");
      setRows(res.data.data || []);
      await fetchCentralFund();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add contribution.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteRow = async (id) => {
    if(!window.confirm("Delete this record permanently?")) return;
    try {
      await api.delete(`/member-fees/${id}`);
      setRows(rows.filter(r => r._id !== id));
      fetchCentralFund();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const handleExport = () => {
    exportPujaPDF({
      clubName: activeClub?.clubName || activeClub?.name || "Club Committee",
      cycleName: activeYear?.name,
      data: filteredRows // Exports filtered view
    });
  };

  /* ================= FILTER LOGIC ================= */
  const filteredRows = useMemo(() => {
    return rows.filter(r => 
      (r.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.notes || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rows, searchTerm]);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center text-indigo-600">
      <Loader2 className="animate-spin w-10 h-10"/>
    </div>
  );

  return (
    <div className="space-y-6 pb-10">
      
      {/* 1. HEADER & STATS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <IndianRupee className="text-indigo-600"/> Festival Chanda
           </h1>
           <p className="text-gray-500 text-sm">Manage one-time collections and donations.</p>
        </div>
        
        {/* Total Badge */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-2xl shadow-lg shadow-emerald-200 flex flex-col items-end">
           <span className="text-xs font-medium opacity-90 uppercase tracking-wider">Total Collected</span>
           <span className="text-2xl font-bold">₹ {pujaTotal.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. ADMIN FORM (Sticky Sidebar) */}
        {activeClub?.role === "admin" && (
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
              <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2 border-b border-gray-100 pb-3">
                <Plus size={20} className="text-indigo-600"/> Record Payment
              </h3>
              
              <form onSubmit={addContribution} className="space-y-4">
                {/* ... (Form Inputs Remain Same) ... */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Member</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400" size={16} />
                    <select
                      className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                      value={form.userId}
                      onChange={(e) => setForm({ ...form, userId: e.target.value })}
                    >
                      <option value="">Select Member...</option>
                      {members.map((m) => (
                        <option key={m.membershipId} value={m.userId}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Amount (₹)</label>
                  <input
                    type="number"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="e.g. 500"
                  />
                </div>

                 <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Notes (Optional)</label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="e.g. Cash / GPay"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-indigo-600 text-white px-4 py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex justify-center items-center gap-2 active:scale-95"
                >
                  {submitting ? <Loader2 className="animate-spin" size={18}/> : "Save Record"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 3. HISTORY LIST */}
        <div className={activeClub?.role === "admin" ? "lg:col-span-2" : "lg:col-span-3"}>
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full min-h-[500px]">
             
             {/* Toolbar */}
             <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                    <h3 className="font-bold text-gray-700 hidden sm:block whitespace-nowrap">Transactions</h3>
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                        <input 
                            type="text" 
                            placeholder="Search member..." 
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                {/* ✅ EXPORT BUTTON */}
                <button 
                  onClick={handleExport}
                  className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition border border-gray-200 hover:border-emerald-200 flex items-center gap-2"
                  title="Download PDF"
                >
                   <Download size={18} />
                   <span className="text-sm font-bold hidden sm:inline">Export</span>
                </button>
             </div>

             {/* Table */}
             <div className="flex-1 overflow-auto">
               <div className="min-w-[600px] sm:min-w-full">
                 {/* Header */}
                 <div className="grid grid-cols-12 bg-gray-50/50 p-3 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    <div className="col-span-5 pl-2">Member</div>
                    <div className="col-span-3">Amount</div>
                    <div className="col-span-3">Date</div>
                    <div className="col-span-1 text-right"></div>
                 </div>

                 {/* Rows */}
                 <div className="divide-y divide-gray-50">
                   {filteredRows.map((r) => (
                     <div key={r._id} className="p-3 grid grid-cols-12 items-center hover:bg-indigo-50/30 transition-colors group">
                        
                        <div className="col-span-5 pl-2">
                          <p className="font-bold text-gray-700">{r.user?.name || "Unknown"}</p>
                          {r.notes && <p className="text-xs text-gray-400">{r.notes}</p>}
                        </div>

                        <div className="col-span-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-sm font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            ₹ {r.amount}
                          </span>
                        </div>

                        <div className="col-span-3 text-sm text-gray-500 flex items-center gap-1.5">
                           <Calendar size={14} className="text-gray-400"/>
                           {new Date(r.createdAt).toLocaleDateString()}
                        </div>

                        <div className="col-span-1 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                           {activeClub?.role === "admin" && (
                             <button 
                                onClick={() => deleteRow(r._id)} 
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                             >
                               <Trash2 size={16} />
                             </button>
                           )}
                        </div>
                     </div>
                   ))}
                 </div>
               </div>

               {/* Empty State */}
               {filteredRows.length === 0 && (
                 <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <Filter size={48} className="mb-4 text-gray-200"/>
                    <p>No records found.</p>
                 </div>
               )}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}