import { useState, useEffect, useMemo } from "react";
import { fetchDonations, deleteDonation } from "../api/donations"; 
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext"; 
import { exportDonationsPDF } from "../utils/pdfExport"; 
import { fetchActiveYear  } from "../api/years";
// Icons
import { 
  Plus, Search, Trash2, Heart, Receipt, Calendar, 
  Loader2, Lock, Download, Filter, PlusCircle 
} from "lucide-react";

// Components
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import ConfirmModal from "../components/ui/ConfirmModal"; 
import AddDonationModal from "../components/AddDonationModal"; 
import CreateYearModal from "../components/CreateYearModal"; 

export default function Donations() {
  const { activeClub } = useAuth();
  const toast = useToast();
  
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreateYear, setShowCreateYear] = useState(false); 
  const [searchTerm, setSearchTerm] = useState("");
  const [cycle, setCycle] = useState(null);

  // Confirm Delete State
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });

  const loadDonations = async () => {
    try {
      setLoading(true);
      
      // 1. CHECK ACTIVE YEAR FIRST
      let activeYear = null;
      try {
          const yearRes = await fetchActiveYear();
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

      // 2. FETCH DONATIONS (Only if year is open)
      const res = await fetchDonations();
      setDonations(res.data.data);

    } catch (err) {
      console.error(err);
      toast.error("Failed to load donations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeClub) loadDonations();
  }, [activeClub]);

  const totalAmount = donations.reduce((sum, d) => sum + Number(d.amount), 0);

  const filteredDonations = useMemo(() => {
      return donations.filter(d => 
        d.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.receiptNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.phone?.includes(searchTerm)
      );
  }, [donations, searchTerm]);

  // Handle Delete
  const handleDelete = async () => {
    try {
      await deleteDonation(confirmDelete.id);
      setDonations(prev => prev.filter(d => d._id !== confirmDelete.id));
      toast.success("Donation record removed");
    } catch (err) {
      toast.error("Failed to delete record");
    } finally {
      setConfirmDelete({ isOpen: false, id: null });
    }
  };

  if (loading) return <div className="flex justify-center py-20 text-amber-500"><Loader2 className="animate-spin" /></div>;

  // 🔒 CLOSED YEAR STATE
  if (!cycle) {
      if (activeClub?.role === 'admin') {
          return (
              <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-[var(--bg-card)] rounded-[2.5rem] border border-dashed border-[var(--border-color)] animate-in fade-in">
                  <div className="w-20 h-20 bg-[var(--bg-card)] rounded-full flex items-center justify-center shadow-md mb-6 ring-4 ring-slate-100 dark:ring-slate-800">
                      <PlusCircle size={32} className="text-amber-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--text-main)]">No Active Collection</h2>
                  <p className="text-[var(--text-muted)] max-w-md mt-3 mb-8 leading-relaxed">
                      Start a new financial year to begin accepting public donations.
                  </p>
                  <Button onClick={() => setShowCreateYear(true)} className="bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-200 dark:shadow-none border-none text-white">
                      <PlusCircle size={18} className="mr-2" /> Start New Year
                  </Button>
                  
                  {showCreateYear && (
                    <CreateYearModal 
                        onSuccess={() => { setShowCreateYear(false); loadDonations(); }} 
                        onClose={() => setShowCreateYear(false)} 
                    />
                  )}
              </div>
          );
      }
      return (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-color)] animate-in fade-in">
              <div className="w-20 h-20 bg-[var(--bg-card)] rounded-full flex items-center justify-center shadow-md mb-6 ring-4 ring-slate-100 dark:ring-slate-800">
                  <Lock size={32} className="text-slate-400" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--text-main)]">Donations Closed</h2>
              <p className="text-[var(--text-muted)] max-w-md mt-2">
                  Public donations are currently closed until the next session begins.
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
             <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
                <Heart size={24} fill="currentColor" className="opacity-80" />
             </div>
             <div>
                <h1 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">Public Donations</h1>
                <p className="text-[var(--text-muted)] text-sm font-medium">
                  Collection Cycle: <span className="text-[var(--text-main)] font-bold">{cycle.name}</span>
                </p>
             </div>
           </div>
        </div>
        
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* TOTAL BADGE */}
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-3 rounded-xl sm:bg-transparent sm:p-0 sm:border-none sm:text-right flex justify-between sm:block items-center">
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Total Collected</p>
                <p className="text-xl sm:text-2xl font-bold font-mono text-amber-700 dark:text-amber-500">₹{totalAmount.toLocaleString()}</p>
            </div>
            
            <Button 
                onClick={() => setShowAddModal(true)}
                className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-200 dark:shadow-none border-none"
                leftIcon={<Plus size={18} />}
            >
                New Donation
            </Button>
        </div>
      </div>

      {/* 2. TOOLBAR */}
      <Card noPadding className="shadow-sm border-[var(--border-color)]">
        <div className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18}/>
                <input 
                    type="text" 
                    placeholder="Search donor, phone, receipt..." 
                    className="w-full pl-10 pr-4 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-main)] focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <Button 
                variant="secondary" 
                size="sm"
                className="w-full sm:w-auto hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 border-[var(--border-color)]"
                onClick={() => exportDonationsPDF({ 
                    clubName: activeClub?.clubName, 
                    cycleName: cycle?.name, 
                    donations: filteredDonations 
                })}
            >
                <Download size={18} />
                <span className="ml-2">Export List</span>
            </Button>
        </div>
      </Card>

      {/* 3. DONATIONS LIST */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm min-h-[400px]">
         {filteredDonations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-[var(--text-muted)]">
                <Filter size={48} className="mb-4 opacity-20"/>
                <p className="text-sm font-medium">No donations found</p>
            </div>
         ) : (
            <div className="w-full">
                {/* DESKTOP HEADER */}
                <div className="hidden md:grid grid-cols-12 bg-slate-50 dark:bg-slate-800 p-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-color)]">
                    <div className="col-span-4 pl-2">Donor Details</div>
                    <div className="col-span-3">Receipt / Contact</div>
                    <div className="col-span-2">Date</div>
                    <div className="col-span-2 text-right">Amount</div>
                    <div className="col-span-1 text-right"></div>
                </div>

                {/* ROWS */}
                <div className="divide-y divide-[var(--border-color)]">
                    {filteredDonations.map((d) => (
                        <div key={d._id} className="group p-4 flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-0 items-start md:items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                            
                            {/* 1. Donor */}
                            <div className="col-span-4 pl-2 w-full">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
                                     {d.donorName.charAt(0)}
                                   </div>
                                   <div>
                                     <h3 className="font-bold text-[var(--text-main)] text-sm md:text-base">{d.donorName}</h3>
                                     <div className="flex items-center gap-1 md:hidden text-xs text-[var(--text-muted)] mt-0.5">
                                        <Calendar size={10}/> {new Date(d.date).toLocaleDateString()}
                                     </div>
                                     {d.address && <p className="text-xs text-[var(--text-muted)] truncate max-w-[150px] hidden md:block">{d.address}</p>}
                                   </div>
                                </div>
                            </div>

                            {/* 2. Receipt/Contact (Desktop) */}
                            <div className="hidden md:block col-span-3">
                                {d.receiptNo && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono text-[var(--text-muted)] mb-1">
                                        <Receipt size={10} /> {d.receiptNo}
                                    </span>
                                )}
                                {d.phone && <div className="text-xs text-[var(--text-muted)]">{d.phone}</div>}
                            </div>

                            {/* 3. Date (Desktop) */}
                            <div className="hidden md:block col-span-2 text-sm text-[var(--text-muted)]">
                                {new Date(d.date).toLocaleDateString()}
                            </div>

                            {/* 4. Amount */}
                            <div className="col-span-2 w-full md:text-right flex justify-between md:block items-center">
                                <span className="md:hidden text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-[var(--text-muted)]">
                                    {d.receiptNo || "No Receipt"}
                                </span>
                                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                                    + ₹{d.amount.toLocaleString()}
                                </span>
                            </div>

                            {/* 5. Actions */}
                            <div className="col-span-1 w-full flex justify-end">
                                {activeClub?.role === "admin" && (
                                    <button 
                                        onClick={() => setConfirmDelete({ isOpen: true, id: d._id })}
                                        className="p-2 text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all md:opacity-0 group-hover:opacity-100"
                                        title="Delete Record"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
         )}
      </div>

      {/* MODALS */}
      {showAddModal && <AddDonationModal onClose={() => setShowAddModal(false)} refresh={loadDonations} />}
      
      <ConfirmModal 
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Donation?"
        message="This will remove the amount from the total collection. This cannot be undone."
        isDangerous={true}
      />
    </div>
  );
}