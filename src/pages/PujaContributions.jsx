import { useEffect, useState, useMemo } from "react";
import api from "../api/axios"; 
import { fetchFestivalFees, addFestivalFee, deleteFestivalFee } from "../api/festival"; 
import { useFinance } from "../context/FinanceContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext"; 

// Icons
import { 
  Loader2, IndianRupee, User, Plus, Trash2, Calendar, 
  Search, Filter, Download, X, Banknote, ChevronDown, Sparkles,
  Lock, PlusCircle // 👈 Added Icons
} from "lucide-react";

// Components
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import ConfirmModal from "../components/ui/ConfirmModal"; 
import CreateYearModal from "../components/CreateYearModal"; // 👈 Import Create Year Modal
import { exportPujaPDF } from "../utils/pdfExport";

export default function PujaContributions() {
  const { fetchCentralFund, pujaTotal } = useFinance();
  const { activeClub } = useAuth(); 
  const toast = useToast();

  const [members, setMembers] = useState([]);
  const [rows, setRows] = useState([]);
  const [activeYear, setActiveYear] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mobile Form & Delete State
  const [showMobileForm, setShowMobileForm] = useState(false);
  const [showCreateYear, setShowCreateYear] = useState(false); // 👈 Create Year State
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });

  // Form State
  const [form, setForm] = useState({ userId: "", amount: "", notes: "" });

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (activeClub) loadData();
  }, [activeClub]);

  const loadData = async () => {
      try {
        setLoading(true);
        
        // 1. CHECK YEAR FIRST
        // We need to know if a year exists before fetching fees
        let currentYear = null;
        try {
            const yearRes = await api.get("/years/active");
            currentYear = yearRes.data.data;
        } catch (e) {
            // 404 means no active year
            currentYear = null;
        }

        setActiveYear(currentYear);

        // 🛑 STOP IF YEAR IS CLOSED
        if (!currentYear) {
            setLoading(false);
            return; 
        }

        // 2. FETCH DATA (Only if Year is Open)
        const [mRes, pRes] = await Promise.all([
          api.get("/members"),
          fetchFestivalFees(),
          fetchCentralFund() // Sync context
        ]);
        
        setMembers((mRes.data.data || []).sort((a, b) => a.name.localeCompare(b.name)));
        setRows(pRes.data.data || []);
        
      } catch (err) {
        console.error("Data load error", err);
        // Only show error if we expected data (Year was open)
        if (activeYear) toast.error("Failed to load festival data");
      } finally {
        setLoading(false);
      }
  };

  /* ================= HANDLERS ================= */
  const handleAddContribution = async (e) => {
    e.preventDefault();
    if (!form.userId || !form.amount) return;

    setSubmitting(true);
    try {
      await addFestivalFee({
        userId: form.userId, 
        amount: Number(form.amount),
        notes: form.notes
      });
      
      toast.success("Festival fee recorded!");
      setForm({ userId: "", amount: "", notes: "" });
      setShowMobileForm(false); 
      
      // Refresh Data
      const res = await fetchFestivalFees();
      setRows(res.data.data || []);
      await fetchCentralFund();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add record");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteFestivalFee(confirmDelete.id);
      setRows(rows.filter(r => r._id !== confirmDelete.id));
      await fetchCentralFund();
      toast.success("Record deleted");
    } catch (err) {
      toast.error("Failed to delete record");
    } finally {
      setConfirmDelete({ isOpen: false, id: null });
    }
  };

  const filteredRows = useMemo(() => {
    return rows.filter(r => 
      (r.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.notes || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rows, searchTerm]);

  /* ================= COMPONENTS ================= */
  
  const ContributionForm = () => (
    <form onSubmit={handleAddContribution} className="space-y-4">
        <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Member</label>
            <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                <select
                    className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl pl-10 pr-10 py-3 appearance-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all"
                    value={form.userId}
                    onChange={(e) => setForm({ ...form, userId: e.target.value })}
                    required
                >
                    <option value="">Select Member...</option>
                    {members.map((m) => (
                        <option key={m.membershipId} value={m.userId}>{m.name}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
        </div>

        <Input 
            label="Amount (₹)"
            type="number"
            icon={IndianRupee}
            placeholder="e.g. 500"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
        />

        <Input 
            label="Notes (Optional)"
            icon={Banknote}
            placeholder="Payment mode, etc."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />

        <Button 
            type="submit" 
            className="w-full bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200 border-none"
            isLoading={submitting}
            disabled={!form.userId || !form.amount}
        >
            Record Payment
        </Button>
    </form>
  );

  /* ================= RENDER ================= */

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-rose-600"><Loader2 className="animate-spin w-10 h-10"/></div>;

  // 🔒 CLOSED YEAR STATE
  if (!activeYear) {
      if (activeClub?.role === 'admin') {
          return (
              <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200 animate-in fade-in">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md mb-6 ring-4 ring-slate-100">
                      <PlusCircle size={32} className="text-rose-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">No Active Festival</h2>
                  <p className="text-slate-500 max-w-md mt-3 mb-8 leading-relaxed">
                      You need to start a new financial year before collecting Puja contributions.
                  </p>
                  <Button onClick={() => setShowCreateYear(true)} className="shadow-lg shadow-rose-200">
                      <PlusCircle size={18} className="mr-2" /> Start New Year
                  </Button>
                  
                  {/* Reuse the Create Year Modal */}
                  {showCreateYear && (
                    <CreateYearModal 
                        onSuccess={() => { setShowCreateYear(false); loadData(); }} 
                        onClose={() => setShowCreateYear(false)} 
                    />
                  )}
              </div>
          );
      }
      return (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-[2.5rem] border border-slate-200 animate-in fade-in">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md mb-6 ring-4 ring-slate-100">
                  <Lock size={32} className="text-slate-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-700">Financial Year Closed</h2>
              <p className="text-slate-500 max-w-md mt-2">
                  Please wait for the admin to start the new festival cycle.
              </p>
          </div>
      );
  }

  // 🔓 OPEN YEAR STATE
  return (
    <div className="space-y-6 pb-24 md:pb-10 animate-fade-in relative">
      
      {/* 1. HEADER & STATS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <div className="flex items-center gap-3">
             <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl">
                <Sparkles size={24} />
             </div>
             <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Festival Chanda</h1>
                <p className="text-slate-500 text-sm font-medium">
                    Collection for <span className="font-bold text-slate-700">{activeYear?.name || "Active Festival"}</span>
                </p>
             </div>
           </div>
        </div>
        
        {/* TOTAL CARD */}
        <div className="w-full md:w-auto bg-gradient-to-br from-rose-500 to-pink-600 text-white p-1 rounded-2xl shadow-xl shadow-rose-200">
           <div className="bg-white/10 px-6 py-4 rounded-xl backdrop-blur-sm flex flex-col items-end min-w-[200px]">
                <span className="text-[10px] font-bold opacity-90 uppercase tracking-wider mb-1">Total Collected</span>
                <span className="text-3xl font-bold font-mono tracking-tight">₹{pujaTotal.toLocaleString()}</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* 2. DESKTOP FORM (Sticky) */}
        {activeClub?.role === "admin" && (
          <div className="hidden lg:block lg:col-span-1 sticky top-24">
            <Card className="shadow-lg shadow-slate-200/50 border-rose-100/50">
              <div className="flex items-center gap-2 mb-6 text-slate-800 font-bold border-b border-slate-100 pb-4">
                 <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Plus size={18} />
                 </div>
                 New Contribution
              </div>
              <ContributionForm />
            </Card>
          </div>
        )}

        {/* 3. TRANSACTION LIST */}
        <div className={activeClub?.role === "admin" ? "lg:col-span-2" : "lg:col-span-3"}>
           <Card noPadding className="min-h-[500px] flex flex-col border-rose-100">
             
             {/* Toolbar */}
             <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18}/>
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <Button 
                    variant="secondary" 
                    size="sm"
                    className="shrink-0 hover:text-rose-600 hover:bg-rose-50"
                    onClick={() => exportPujaPDF({
                        clubName: activeClub?.clubName,
                        cycleName: activeYear?.name,
                        data: filteredRows
                    })}
                >
                    <Download size={18} />
                    <span className="hidden sm:inline ml-2">Export</span>
                </Button>
             </div>

             {/* Table Content */}
             <div className="flex-1 overflow-auto">
                {filteredRows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <Filter size={48} className="mb-4 opacity-20"/>
                        <p className="text-sm font-medium">No transactions found</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 sticky top-0 z-10 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <tr>
                                <th className="px-4 md:px-6 py-4 border-b border-slate-200">Member</th>
                                <th className="px-4 md:px-6 py-4 border-b border-slate-200">Amount</th>
                                <th className="px-6 py-4 border-b border-slate-200 hidden sm:table-cell">Date</th>
                                <th className="px-4 md:px-6 py-4 border-b border-slate-200 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {filteredRows.map((r) => (
                                <tr key={r._id} className="group hover:bg-slate-50/80 transition-colors">
                                    <td className="px-4 md:px-6 py-4">
                                        <div className="font-bold text-slate-700">{r.user?.name || "Unknown"}</div>
                                        
                                        <div className="sm:hidden flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                                           <Calendar size={10} />
                                           {new Date(r.createdAt).toLocaleDateString()}
                                        </div>

                                        {r.notes && <div className="text-xs text-slate-400 mt-0.5 italic">{r.notes}</div>}
                                    </td>
                                    
                                    <td className="px-4 md:px-6 py-4 align-top pt-5">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-bold border border-rose-100">
                                            ₹ {r.amount}
                                        </span>
                                    </td>
                                    
                                    <td className="px-6 py-4 text-slate-500 hidden sm:table-cell">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-slate-300"/>
                                            {new Date(r.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    
                                    <td className="px-4 md:px-6 py-4 text-right">
                                        {activeClub?.role === "admin" && (
                                            <button 
                                                onClick={() => setConfirmDelete({ isOpen: true, id: r._id })}
                                                className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all md:opacity-0 group-hover:opacity-100"
                                                title="Delete Record"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
             </div>
           </Card>
        </div>
      </div>

      {/* 4. MOBILE FAB */}
      {activeClub?.role === "admin" && (
        <button 
            onClick={() => setShowMobileForm(true)}
            className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-rose-600 text-white rounded-full shadow-xl shadow-rose-600/30 flex items-center justify-center z-40 active:scale-90 transition-transform hover:bg-rose-700"
        >
            <Plus size={28} />
        </button>
      )}

      {/* 5. MOBILE FORM DRAWER */}
      {showMobileForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowMobileForm(false)} />
            <div className="bg-white w-full rounded-t-2xl p-6 relative animate-slide-up shadow-2xl">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800">Record Contribution</h3>
                    <button onClick={() => setShowMobileForm(false)} className="p-2 bg-slate-100 rounded-full text-slate-500">
                        <X size={20} />
                    </button>
                </div>
                <ContributionForm />
                <div className="h-4" /> 
            </div>
        </div>
      )}

      {/* CONFIRM MODAL */}
      <ConfirmModal 
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Festival Record?"
        message="This will remove the collected amount from the total. This cannot be undone."
        isDangerous={true}
      />

    </div>
  );
}