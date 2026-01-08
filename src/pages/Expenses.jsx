import { useState, useEffect, useMemo } from "react";
import api from "../api/axios"; 
import { 
  fetchExpenses as getExpensesAPI, 
  approveExpense, 
  rejectExpense, 
  deleteExpense
} from "../api/expenses"; 
import { useAuth } from "../context/AuthContext";
import { 
  Plus, Search, CheckCircle, XCircle, Clock, Loader2, Download, Trash2,
  FileText, Calendar, Filter, ChevronDown, Lock, PlusCircle, AlertCircle
} from "lucide-react";

// Design System & Components
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import ConfirmModal from "../components/ui/ConfirmModal";
import { useToast } from "../context/ToastContext";
import AddExpenseModal from "../components/AddExpenseModal"; 
import CreateYearModal from "../components/CreateYearModal"; // 👈 Import Create Year Modal
import { exportExpensesPDF } from "../utils/pdfExport"; 

const CATEGORIES = ["Pandal", "Idol", "Light & Sound", "Food/Bhog", "Priest/Puja", "Transport", "Miscellaneous"];

export default function Expenses() {
  const { activeClub } = useAuth(); 
  const toast = useToast();
  
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreateYear, setShowCreateYear] = useState(false); // 👈 State for Create Year
  const [searchTerm, setSearchTerm] = useState("");
  const [cycle, setCycle] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });

  const loadExpenses = async () => {
    try {
      setLoading(true);

      // 1. CHECK ACTIVE YEAR FIRST
      let activeYear = null;
      try {
          const yearRes = await api.get("/years/active");
          activeYear = yearRes.data.data;
      } catch (e) {
          activeYear = null;
      }
      
      setCycle(activeYear);

      // 🛑 STOP IF YEAR IS CLOSED
      if (!activeYear) {
        setLoading(false);
        return;
      }
      
      // 2. FETCH EXPENSES (Only if year is open)
      const res = await getExpensesAPI();
      setExpenses(res.data.data);

    } catch (err) {
      console.error(err);
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeClub) loadExpenses();
  }, [activeClub]);

  const handleStatus = async (id, newStatus) => {
    if (activeClub?.role !== "admin") return;
    try {
      if (newStatus === "approved") {
        await approveExpense(id);
      } else {
        await rejectExpense(id);
      }
      
      setExpenses(prev => prev.map(e => e._id === id ? { ...e, status: newStatus } : e));
      toast.success(`Expense marked as ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const confirmDeletion = (id) => {
    setConfirmDelete({ isOpen: true, id });
  };

  const handleDelete = async () => {
    try {
      await deleteExpense(confirmDelete.id);
      setExpenses(prev => prev.filter(e => e._id !== confirmDelete.id));
      toast.success("Expense record deleted");
    } catch (err) {
      toast.error("Failed to delete record");
    } finally {
      setConfirmDelete({ isOpen: false, id: null });
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
        const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || e.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
  }, [expenses, searchTerm, statusFilter]);

  const totalApproved = expenses
    .filter(e => e.status === "approved")
    .reduce((sum, e) => sum + Number(e.amount), 0);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-indigo-600"><Loader2 className="animate-spin w-10 h-10"/></div>;

  // 🔒 CLOSED YEAR STATE
  if (!cycle) {
      if (activeClub?.role === 'admin') {
          return (
              <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200 animate-in fade-in">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md mb-6 ring-4 ring-slate-100">
                      <PlusCircle size={32} className="text-indigo-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">No Active Budget</h2>
                  <p className="text-slate-500 max-w-md mt-3 mb-8 leading-relaxed">
                      You need to start a new financial year to record and manage expenses.
                  </p>
                  <Button onClick={() => setShowCreateYear(true)} className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                      <PlusCircle size={18} className="mr-2" /> Start New Year
                  </Button>
                  
                  {/* Reuse the Create Year Modal */}
                  {showCreateYear && (
                    <CreateYearModal 
                        onSuccess={() => { setShowCreateYear(false); loadExpenses(); }} 
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
              <h2 className="text-2xl font-bold text-slate-700">Expenses Locked</h2>
              <p className="text-slate-500 max-w-md mt-2">
                  Expenses cannot be viewed or added until the new financial year begins.
              </p>
          </div>
      );
  }

  // 🔓 OPEN YEAR STATE
  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <div className="flex items-center gap-3">
             <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
                <FileText size={24} />
             </div>
             <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Expenses</h1>
                <p className="text-slate-500 text-sm font-medium">
                  {cycle.name} Cycle
                </p>
             </div>
           </div>
        </div>
        
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm sm:border-none sm:shadow-none sm:bg-transparent sm:text-right flex justify-between sm:block items-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Approved</p>
                <p className="text-lg sm:text-2xl font-bold font-mono text-slate-700">₹{totalApproved.toLocaleString()}</p>
            </div>
            
            <Button 
                onClick={() => setShowAddModal(true)}
                leftIcon={<Plus size={18} />}
                className="shadow-lg shadow-indigo-200"
            >
                Add Bill
            </Button>
        </div>
      </div>

      {/* 2. TOOLBAR */}
      <Card noPadding className="shadow-sm border-slate-200">
        <div className="p-3 md:p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18}/>
                <input 
                    type="text" 
                    placeholder="Search expenses..." 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-40">
                    <select 
                        className="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-xl pl-3 pr-8 py-2 focus:border-indigo-500 outline-none cursor-pointer appearance-none font-medium"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={16}/>
                </div>

                <Button 
                    variant="secondary" 
                    className="shrink-0 px-3 border-slate-200 hover:border-indigo-200 hover:text-indigo-600"
                    onClick={() => exportExpensesPDF({ 
                        clubName: activeClub?.clubName, 
                        cycleName: cycle?.name, 
                        expenses: filteredExpenses 
                    })}
                >
                    <Download size={18} />
                </Button>
            </div>
        </div>
      </Card>

      {/* 3. EXPENSE LIST */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm min-h-[400px]">
         {filteredExpenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <div className="bg-slate-50 p-4 rounded-full mb-3">
                    <Filter size={32} className="opacity-50"/>
                </div>
                <p className="text-sm font-medium">No expenses match your filters</p>
            </div>
         ) : (
            <div className="w-full">
                <div className="hidden md:grid grid-cols-12 bg-slate-50/80 p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <div className="col-span-4 pl-2">Details</div>
                    <div className="col-span-2">Category</div>
                    <div className="col-span-2">Amount</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                <div className="divide-y divide-slate-100">
                    {filteredExpenses.map((e) => (
                        <div key={e._id} className="group p-4 flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-0 items-start md:items-center hover:bg-slate-50/50 transition-colors">
                            <div className="col-span-4 pl-2 w-full relative">
                                <div className="flex justify-between md:block items-start">
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-sm md:text-sm lg:text-base">{e.title}</h3>
                                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                            <Calendar size={12} />
                                            {new Date(e.date).toLocaleDateString()}
                                            <span className="hidden md:inline">• By {e.recordedBy?.name || "Member"}</span>
                                        </div>
                                    </div>
                                    <span className="md:hidden font-mono font-bold text-slate-800 text-base">
                                        ₹{e.amount.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            <div className="hidden md:block col-span-2">
                                <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg border border-slate-200">
                                    {e.category}
                                </span>
                            </div>
                            <div className="hidden md:block col-span-2">
                                <span className="font-mono font-bold text-slate-700">₹{e.amount.toLocaleString()}</span>
                            </div>
                            <div className="col-span-2 w-full md:w-auto flex md:justify-center justify-between items-center">
                                <span className="md:hidden text-xs font-medium text-slate-400">Status</span>
                                <StatusBadge status={e.status} />
                            </div>
                            <div className="col-span-2 w-full flex justify-end items-center gap-2 mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-50">
                                {activeClub?.role === "admin" && (
                                    <>
                                        {e.status === "pending" && (
                                            <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm mr-2">
                                                <button onClick={() => handleStatus(e._id, "approved")} className="p-1.5 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition" title="Approve">
                                                    <CheckCircle size={18} />
                                                </button>
                                                <div className="w-px bg-slate-200"></div>
                                                <button onClick={() => handleStatus(e._id, "rejected")} className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 transition" title="Reject">
                                                    <XCircle size={18} />
                                                </button>
                                            </div>
                                        )}
                                        <button 
                                            onClick={() => confirmDeletion(e._id)}
                                            className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            aria-label="Delete Expense"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
         )}
      </div>

      <ConfirmModal 
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Expense Record?"
        message="This action cannot be undone."
        isDangerous={true}
        confirmText="Delete Record"
      />

      {showAddModal && (
        <AddExpenseModal 
          categories={CATEGORIES} 
          onClose={() => setShowAddModal(false)} 
          refresh={loadExpenses} 
        />
      )}
    </div>
  );
}

// Subcomponent: Status Badge
function StatusBadge({ status }) {
    const styles = {
        pending: "bg-amber-50 text-amber-700 border-amber-100 ring-amber-500/20",
        approved: "bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/20",
        rejected: "bg-red-50 text-red-700 border-red-100 ring-red-500/20"
    };
    const icons = { pending: Clock, approved: CheckCircle, rejected: XCircle };
    const Icon = icons[status] || Clock;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ring-1 ring-inset ${styles[status]}`}>
            <Icon size={10} strokeWidth={3} />
            {status}
        </span>
    );
}