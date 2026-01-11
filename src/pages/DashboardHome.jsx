import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

// Modals
import CreateYearModal from "../components/CreateYearModal";
import AddExpenseModal from "../components/AddExpenseModal"; 
import AddDonationModal from "../components/AddDonationModal"; 
import AddMemberModal from "../components/AddMemberModal"; 
import AddPujaModal from "../components/AddPujaModal"; 
import NoticeBoard from "../components/NoticeBoard"; 

// Icons
import { 
  Loader2, Wallet, TrendingUp, TrendingDown, PiggyBank, Calendar,
  IndianRupee, Receipt, UserPlus, Zap, Lock, Sparkles, PlusCircle
} from "lucide-react";

export default function DashboardHome() {
  const { activeClub, user } = useAuth(); 
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateYear, setShowCreateYear] = useState(false);
  
  // Modal States
  const [showExpense, setShowExpense] = useState(false);
  const [showDonation, setShowDonation] = useState(false);
  const [showMember, setShowMember] = useState(false);
  const [showPuja, setShowPuja] = useState(false); 

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 5) return "Late night working";
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const [frequency, setFrequency] = useState(null); 
  const navigate = useNavigate();

  const fetchSummary = async () => {
    try {
      setLoading(true);
      
      const summaryRes = await api.get("/finance/summary");
      const summaryData = summaryRes.data.data;
      setData(summaryData);
      
      try {
        const yearRes = await api.get("/years/active");
        if (yearRes.data.data) {
          setFrequency(yearRes.data.data.subscriptionFrequency);
        }
      } catch (e) {
        console.warn("No active year config found, defaulting frequency.");
      }

      if (summaryData?.yearName === "No Active Year" && activeClub?.role === 'admin') {
         setShowCreateYear(true);
      }

    } catch (err) {
      console.error("Dashboard Error:", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeClub) {
      fetchSummary();
    }
  }, [activeClub]);

  // Loading View
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-primary-600">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="text-sm font-medium animate-pulse">Loading Financial Data...</p>
      </div>
    );
  }

  // 1. STATE: NO ACTIVE YEAR
  if (data?.yearName === "No Active Year") {
    if (activeClub?.role === 'admin') {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
           {showCreateYear && (
             <CreateYearModal 
               onSuccess={() => { setShowCreateYear(false); fetchSummary(); toast.success("New Year Started!"); }} 
               onClose={() => setShowCreateYear(false)} 
             />
           )}
           <div className="max-w-xl w-full bg-[var(--bg-card)] rounded-3xl shadow-xl border border-[var(--border-color)] overflow-hidden text-center">
              <div className="bg-primary-600 p-8 flex justify-center">
                  <div className="bg-white/20 p-6 rounded-full backdrop-blur-sm"><Sparkles className="w-12 h-12 text-white" /></div>
              </div>
              <div className="p-10">
                <h2 className="text-3xl font-bold text-[var(--text-main)] mb-4">Ready for the Next Festival?</h2>
                <p className="text-[var(--text-muted)] mb-8 leading-relaxed">The previous financial year is closed. Initialize a new cycle to start.</p>
                <button onClick={() => setShowCreateYear(true)} className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 shadow-lg shadow-primary-200 dark:shadow-none transition-transform active:scale-95 flex items-center justify-center gap-3">
                  <PlusCircle size={24} /> Start New Financial Year
                </button>
              </div>
           </div>
        </div>
      );
    }
    // Member View when no year is active
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
         <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-4"><Lock className="w-12 h-12 text-slate-400" /></div>
         <h2 className="text-2xl font-bold text-[var(--text-main)]">Financial Year Closed</h2>
         <p className="text-[var(--text-muted)] max-w-md mt-2">Please wait for the admin to start the new session.</p>
      </div>
    );
  }

  // 🛡️ Fail-safe
  if (!data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 text-[var(--text-muted)]">
        <p>Unable to load dashboard data. Please try again.</p>
        <button onClick={fetchSummary} className="mt-4 text-primary-600 font-bold underline">Retry</button>
      </div>
    );
  }

  // 2. STATE: ACTIVE YEAR (DASHBOARD)
  return (
    <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 👋 WELCOME HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[var(--border-color)] pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-main)] tracking-tight">
            {greeting}, <span className="text-primary-600 dark:text-primary-400">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-[var(--text-muted)] mt-2 text-sm font-medium leading-relaxed">
             Here's what's happening with <span className="font-bold text-[var(--text-main)]">{activeClub?.clubName}</span> today.
             <span className="hidden sm:inline"> Everything looks under control.</span>
          </p>
        </div>
        
        <div className="flex items-center gap-2">
           <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-[var(--bg-card)] text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-800 shadow-sm">
             <Calendar size={14} className="text-primary-500" /> 
             {data?.yearName} 
           </span>
        </div>
      </div>

      {/* MAIN STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Available Balance" 
          amount={data?.balance} 
          icon={<Wallet size={24} />} 
          variant="primary"
        />
        <StatCard 
          title="Total Income" 
          amount={data?.totalIncome} 
          icon={<TrendingUp size={24} />} 
          variant="success"
        />
        <StatCard 
          title="Total Expenses" 
          amount={data?.totalExpense} 
          icon={<TrendingDown size={24} />} 
          variant="danger"
        />
        <StatCard 
          title="Opening Balance" 
          amount={data?.openingBalance} 
          icon={<PiggyBank size={24} />} 
          variant="neutral"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Actions & Breakdown */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* QUICK ACTIONS */}
           <div>
             <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Zap size={14}/> Quick Actions
             </h3>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <QuickActionBtn 
                   icon={<TrendingDown />} 
                   label="Add Expense" 
                   sub="Bill/Voucher"
                   color="rose"
                   onClick={() => setShowExpense(true)} 
                />
                <QuickActionBtn 
                   icon={<Receipt />} 
                   label="Add Donation" 
                   sub="Public Collection"
                   color="amber"
                   onClick={() => setShowDonation(true)} 
                />
                {activeClub?.role === 'admin' && (
                   <>
                     <QuickActionBtn 
                       icon={<IndianRupee />} 
                       label="Festival Fee" 
                       sub="Member Contribution"
                       color="emerald"
                       onClick={() => setShowPuja(true)} 
                     />
                     <QuickActionBtn 
                       icon={<UserPlus />} 
                       label="Add Member" 
                       sub="Registration"
                       color="indigo"
                       onClick={() => setShowMember(true)} 
                     />
                   </>
                )}
             </div>
           </div>

            {/* INCOME BREAKDOWN */}
           <div>
             <h3 className="text-lg font-bold text-[var(--text-main)] mb-4 flex items-center gap-2">
               Income Sources
             </h3>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <BreakdownCard 
                  label={frequency === 'weekly' ? 'Weekly collection' : 'Monthly collection'} 
                  amount={data?.breakdown?.subscriptions} 
                  color="indigo"
                  onClick={() => frequency && frequency !== 'none' && navigate('/contributions')}
                  disabled={!frequency || frequency === 'none'}
                />

                <BreakdownCard 
                  label="Donations" 
                  amount={data?.breakdown?.donations} 
                  color="amber"
                  onClick={() => navigate('/donations')}
                />

                <BreakdownCard 
                  label="Member's Contribution" 
                  amount={data?.breakdown?.memberFees} 
                  color="emerald"
                  onClick={() => navigate('/members-contribution')}
                />
             </div>
           </div>
        </div>

        {/* RIGHT COLUMN: Notice Board */}
        <div className="lg:col-span-1 h-full">
           <NoticeBoard />
        </div>
      </div>

      {/* MODALS */}
      {showExpense && <AddExpenseModal onClose={() => setShowExpense(false)} refresh={fetchSummary} />}
      {showDonation && <AddDonationModal onClose={() => setShowDonation(false)} refresh={fetchSummary} />}
      {showPuja && <AddPujaModal onClose={() => setShowPuja(false)} refresh={fetchSummary} />} 
      {showMember && <AddMemberModal onClose={() => setShowMember(false)} refresh={() => {}} />} 
    </div>
  );
}

/* --- SUB COMPONENTS (Theme Aware) --- */

function StatCard({ title, amount, icon, variant }) {
  const styles = {
    primary: "bg-primary-600 text-white shadow-xl shadow-primary-200 dark:shadow-none ring-2 ring-primary-600 ring-offset-2 dark:ring-offset-slate-900",
    success: "bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/20",
    danger: "bg-rose-50 dark:bg-rose-900/10 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/20",
    neutral: "bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)]"
  };

  const iconBg = {
    primary: "bg-white/20 text-white",
    success: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    danger: "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400",
    neutral: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${styles[variant]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${variant === 'primary' ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
            {title}
          </p>
          <h2 className="text-2xl lg:text-3xl font-bold font-mono tracking-tight">
            ₹{amount?.toLocaleString() || "0"}
          </h2>
        </div>
        <div className={`p-3 rounded-xl ${iconBg[variant]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function QuickActionBtn({ icon, label, sub, color, onClick }) {
  const colors = {
    rose: "text-rose-600 dark:text-rose-400 group-hover:bg-rose-50 dark:group-hover:bg-rose-900/20 border-rose-100 dark:border-rose-900/50 hover:border-rose-200 dark:hover:border-rose-700",
    amber: "text-amber-600 dark:text-amber-400 group-hover:bg-amber-50 dark:group-hover:bg-amber-900/20 border-amber-100 dark:border-amber-900/50 hover:border-amber-200 dark:hover:border-amber-700",
    emerald: "text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/50 hover:border-emerald-200 dark:hover:border-emerald-700",
    indigo: "text-primary-600 dark:text-primary-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 border-primary-100 dark:border-primary-900/50 hover:border-primary-200 dark:hover:border-primary-700",
  };
  
  // Base icon backgrounds
  const iconBgs = {
    rose: "bg-rose-50 dark:bg-rose-900/20",
    amber: "bg-amber-50 dark:bg-amber-900/20",
    emerald: "bg-emerald-50 dark:bg-emerald-900/20",
    indigo: "bg-primary-50 dark:bg-primary-900/20",
  };

  return (
    <button 
      onClick={onClick}
      className={`
        flex flex-col items-start gap-3 p-4 rounded-xl border transition-all duration-200 group text-left
        bg-[var(--bg-card)] hover:shadow-md border-[var(--border-color)]
        ${colors[color]}
      `}
    >
       <div className={`p-2 rounded-lg transition-colors ${iconBgs[color]}`}>
          {icon}
       </div>
       <div>
          <p className="text-sm font-bold text-[var(--text-main)]">{label}</p>
          <p className="text-[10px] text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors">{sub}</p>
       </div>
    </button>
  );
}

function BreakdownCard({ label, amount, color, onClick, disabled }) {
  const colors = {
    indigo: "border-l-primary-500",
    amber: "border-l-amber-500",
    emerald: "border-l-emerald-500"
  };

  if (disabled) return null;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      className={`bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-color)] shadow-sm flex flex-col justify-between border-l-4 ${colors[color]} cursor-pointer hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 hover:-translate-y-1 transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-200`}
    >
      <span className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest mb-2">
        {label}
      </span>
      <span className="text-xl font-bold text-[var(--text-main)]">
        ₹{amount?.toLocaleString() || "0"}
      </span>
    </div>
  );
}