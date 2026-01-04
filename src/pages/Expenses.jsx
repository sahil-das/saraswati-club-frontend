import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { 
  Plus, Search, CheckCircle, XCircle, Clock, Loader2, IndianRupee, AlertCircle, Lock, Download 
} from "lucide-react";
import { exportExpensesPDF } from "../utils/pdfExport"; // ✅ Import

export default function Expenses() {
  const { activeClub } = useAuth(); 
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cycle, setCycle] = useState(null);

  const CATEGORIES = ["Pandal", "Idol", "Light & Sound", "Food/Bhog", "Priest/Puja", "Transport", "Miscellaneous"];

  const fetchExpenses = async () => {
    try {
      const yearRes = await api.get("/years/active");
      const activeYear = yearRes.data.data;
      
      if (!activeYear) {
        setLoading(false);
        return;
      }

      setCycle(activeYear);
      const res = await api.get("/expenses");
      setExpenses(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [activeClub]);

  const handleStatus = async (id, newStatus) => {
    if (activeClub?.role !== "admin") return alert("Admins Only");
    try {
      await api.put(`/expenses/${id}/status`, { status: newStatus });
      setExpenses(prev => prev.map(e => e._id === id ? { ...e, status: newStatus } : e));
    } catch (err) {
      alert("Action failed: " + (err.response?.data?.message || "Server Error"));
    }
  };

  const totalApproved = expenses
    .filter(e => e.status === "approved")
    .reduce((sum, e) => sum + e.amount, 0);

  const filteredExpenses = expenses.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ HANDLER: Export PDF
  const handleExport = () => {
    exportExpensesPDF({ 
      clubName: activeClub?.clubName || activeClub?.name || "Club Committee",
      cycleName: cycle?.name, 
      expenses: filteredExpenses // Exports filtered list
    });
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64 text-indigo-600">
      <Loader2 className="animate-spin w-10 h-10" />
    </div>
  );

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
    <div className="space-y-6 pb-10">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-white border border-rose-100 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-rose-700 flex items-center gap-2">
            <IndianRupee /> Club Expenses
          </h1>
          <p className="text-gray-500 text-sm">Track and approve bills.</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-rose-400 uppercase tracking-wider">Total Approved</p>
          <p className="text-3xl font-bold font-mono text-rose-600">₹{totalApproved.toLocaleString()}</p>
        </div>
      </div>

      {/* 2. ACTIONS */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input 
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search bills..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 transition-all"
          />
        </div>
        
        {/* ✅ EXPORT BUTTON */}
        <button 
          onClick={handleExport}
          className="bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-xl font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2 shadow-sm active:scale-95"
          title="Download Expense Report"
        >
          <Download size={20} /> <span className="hidden sm:inline">Export</span>
        </button>

        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-rose-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-rose-700 flex items-center gap-2 shadow-lg shadow-rose-200 active:scale-95 transition-all"
        >
          <Plus size={20} /> Add Bill
        </button>
      </div>

      {/* 3. EXPENSE LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExpenses.map((e) => (
          <div key={e._id} className={`
            relative bg-white p-5 rounded-2xl border transition-all group
            ${e.status === 'pending' ? 'border-amber-200 bg-amber-50/50' : 'border-gray-100 hover:border-indigo-100'}
          `}>
            
            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              {e.status === 'pending' && <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full"><Clock size={10}/> REVIEW</span>}
              {e.status === 'rejected' && <span className="text-[10px] font-bold text-red-500 bg-red-100 px-2 py-1 rounded-full">REJECTED</span>}
              {e.status === 'approved' && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">APPROVED</span>}
            </div>

            <h3 className="font-bold text-gray-800 pr-16 truncate">{e.title}</h3>
            <p className="text-xs text-gray-500 mb-3">
              {new Date(e.date).toLocaleDateString()} • {e.category}
            </p>
            
            <div className="text-2xl font-mono font-bold text-gray-800 mb-4">
              ₹{e.amount.toLocaleString()}
            </div>

            <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
               <span className="text-xs text-gray-400">
                  By: <span className="font-medium text-gray-600">{e.recordedBy?.name || "Member"}</span>
               </span>
            </div>

            {/* ADMIN ACTIONS */}
            {activeClub?.role === "admin" && e.status === "pending" && (
              <div className="flex gap-2 mt-3 animate-in fade-in slide-in-from-top-2">
                <button 
                  onClick={() => handleStatus(e._id, "approved")}
                  className="flex-1 py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 shadow-sm flex justify-center items-center gap-1 transition-colors"
                >
                  <CheckCircle size={14}/> Approve
                </button>
                <button 
                  onClick={() => handleStatus(e._id, "rejected")}
                  className="flex-1 py-2 bg-white border border-red-100 text-red-500 rounded-lg text-xs font-bold hover:bg-red-50 flex justify-center items-center gap-1 transition-colors"
                >
                  <XCircle size={14}/> Reject
                </button>
              </div>
            )}
            
          </div>
        ))}
        {filteredExpenses.length === 0 && (
          <div className="col-span-full py-10 text-center text-gray-400">
            No expenses found.
          </div>
        )}
      </div>

      {showAddModal && (
        <AddExpenseModal 
          categories={CATEGORIES} 
          onClose={() => setShowAddModal(false)} 
          refresh={fetchExpenses} 
        />
      )}
    </div>
  );
}

// ... AddExpenseModal (No changes needed) ...
function AddExpenseModal({ categories, onClose, refresh }) {
    const { register, handleSubmit } = useForm();
    const [submitting, setSubmitting] = useState(false);

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            await api.post("/expenses", { 
              ...data, 
              amount: Number(data.amount),
              date: new Date() 
            });
            refresh();
            onClose();
        } catch(err) {
            alert(err.response?.data?.message || "Failed to add expense.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
             <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
                 <div className="bg-rose-600 p-4 text-white">
                    <h2 className="text-lg font-bold">Add New Expense</h2>
                    <p className="text-rose-100 text-xs">Record a bill or payment</p>
                 </div>
                 
                 <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                     <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
                        <input {...register("title", { required: true })} placeholder="e.g. Electric Bill" className="w-full border p-2.5 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-rose-500 mt-1" />
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Amount</label>
                            <input {...register("amount", { required: true })} type="number" placeholder="0" className="w-full border p-2.5 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-rose-500 mt-1" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                            <select {...register("category", { required: true })} className="w-full border p-2.5 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-rose-500 mt-1">
                                <option value="">Select...</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                     </div>

                     <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Description (Optional)</label>
                        <textarea {...register("description")} rows="2" className="w-full border p-2.5 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-rose-500 mt-1"></textarea>
                     </div>

                     <div className="flex gap-3 mt-4">
                         <button type="button" onClick={onClose} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                         <button type="submit" disabled={submitting} className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-200 transition-colors flex justify-center items-center gap-2">
                             {submitting ? <Loader2 className="animate-spin" size={18} /> : "Submit Bill"}
                         </button>
                     </div>
                 </form>
             </div>
        </div>
    )
}