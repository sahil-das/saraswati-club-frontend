import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useFinance } from "../context/FinanceContext";
import { 
  Check, ChevronDown, ChevronRight, AlertCircle, 
  CreditCard, IndianRupee, Download, CalendarRange, Lock, RefreshCw 
} from "lucide-react";
import { clsx } from "clsx";

// Design System
import { Button } from "../components/ui/Button";
import { exportWeeklyAllMembersPDF } from "../utils/exportWeeklyAllMembersPDF";

export default function Contributions() {
  const { user, activeClub } = useAuth(); 
  const { fetchCentralFund } = useFinance();

  const [members, setMembers] = useState([]);
  const [cycle, setCycle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [processing, setProcessing] = useState(null);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // 1. Get Active Cycle
      const yearRes = await api.get("/years/active");
      const activeYear = yearRes.data.data;
      
      if (!activeYear) {
          setLoading(false);
          return;
      }

      setCycle({
          ...activeYear,
          subscriptionFrequency: activeYear.subscriptionFrequency || 'weekly',
          totalInstallments: activeYear.totalInstallments || 52,
          amountPerInstallment: activeYear.amountPerInstallment || 0
      });

      // 2. Get Members
      const memberRes = await api.get("/members");
      const memberList = memberRes.data.data;

      // 3. Fetch subscriptions in parallel
      const membersWithSubs = await Promise.all(
        memberList.map(async (m) => {
          const idToFetch = m.membershipId || m._id; 
          try {
            const res = await api.get(`/subscriptions/member/${idToFetch}`);
            return { ...m, subscription: res.data.data.subscription };
          } catch (err) {
            console.error(`Failed to load sub for ${m.name}`, err);
            return { ...m, subscription: null, error: true };
          }
        })
      );

      setMembers(membersWithSubs);
    } catch (err) {
      console.error("Contributions Load Error", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= ACTIONS ================= */
  
  // 🚨 FIX: Wrap values in Number() to prevent String Concatenation ("200.00" + "200.00")
  const totalCollected = members.reduce((sum, m) => {
    return sum + Number(m.subscription?.totalPaid || 0);
  }, 0);
  
  const toggleExpand = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const handlePayment = async (memberId, subscriptionId, installmentNumber) => {
    if (activeClub?.role !== "admin") return;
    if (processing) return;

    setProcessing(`${memberId}-${installmentNumber}`);

    try {
      const res = await api.post("/subscriptions/pay", { subscriptionId, installmentNumber });
      
      setMembers((prev) => prev.map((m) => 
        m.membershipId === memberId ? { ...m, subscription: res.data.data, error: false } : m
      ));
      
      fetchCentralFund();
    } catch (err) {
      alert("Payment failed: " + (err.response?.data?.message || err.message));
    } finally {
      setProcessing(null);
    }
  };

  const retrySubscription = async (m) => {
      const idToFetch = m.membershipId || m._id;
      try {
        const res = await api.get(`/subscriptions/member/${idToFetch}`);
        setMembers(prev => prev.map(curr => 
            curr._id === m._id ? { ...curr, subscription: res.data.data.subscription, error: false } : curr
        ));
      } catch (err) {
          alert("Retry failed. Check network or backend.");
      }
  };

  const handleExport = () => {
    if (!cycle || members.length === 0) return;
    const exportData = members
      .filter(m => m.subscription) 
      .map(m => ({
          id: m.membershipId,
          name: m.name,
          payments: m.subscription.installments.filter(i => i.isPaid).map(i => ({ week: i.number, date: i.paidDate })) 
      }));

    exportWeeklyAllMembersPDF({
        clubName: activeClub?.clubName || "Club Report",
        members: exportData,
        totalWeeks: cycle.totalInstallments,
        weekAmount: cycle.amountPerInstallment
    });
  };

  const visibleMembers = activeClub?.role === "admin" 
      ? members 
      : members.filter(m => m.email === user.email);

  const getLabel = (num) => {
    if (cycle?.subscriptionFrequency === 'monthly') {
       const date = new Date();
       date.setMonth(num - 1);
       return date.toLocaleString('default', { month: 'short' });
    }
    return `W${num}`;
  };

  /* ================= RENDER ================= */
  if (loading) return <SkeletonLoader />;
  if (!cycle) return <NoCycleState isAdmin={activeClub?.role === "admin"} />;

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
               <CalendarRange size={24} />
             </div>
             <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
               {cycle.subscriptionFrequency === 'monthly' ? "Monthly Chanda" : "Weekly Chanda"}
             </h1>
           </div>
           <p className="text-slate-500 text-sm ml-1">
              Active Cycle: <span className="font-bold text-slate-700">{cycle.name}</span>
           </p>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
             <StatBadge 
               label="Collected" 
               // toLocaleString works correctly on the Number we calculated above
               value={`₹ ${totalCollected.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
               icon={IndianRupee} 
               color="emerald"
             />
             <StatBadge 
               label="Rate" 
               // Ensure this is also displayed correctly
               value={`₹ ${Number(cycle.amountPerInstallment).toFixed(0)}`} 
               sub={`/${cycle.subscriptionFrequency.slice(0, 3)}`}
               icon={CreditCard} 
               color="blue"
             />
             {activeClub?.role === "admin" && (
                <Button variant="secondary" onClick={handleExport} className="h-auto">
                   <Download size={18} />
                </Button>
             )}
        </div>
      </div>

      {/* MEMBER LIST */}
      <div className="space-y-4">
        {visibleMembers.map((m) => {
          if (!m.subscription) {
              return (
                <div key={m._id} className="bg-white border border-red-100 rounded-xl p-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center font-bold">!</div>
                        <div>
                            <h3 className="font-bold text-slate-800">{m.name}</h3>
                            <p className="text-xs text-red-400">Subscription data unavailable</p>
                        </div>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => retrySubscription(m)}>
                        <RefreshCw size={14} className="mr-2"/> Retry
                    </Button>
                </div>
              );
          }

          const isOpen = expanded[m.membershipId];
          const paidCount = m.subscription.installments.filter(i => i.isPaid).length;
          const progress = Math.round((paidCount / cycle.totalInstallments) * 100);
          const isComplete = paidCount === cycle.totalInstallments;

          return (
            <div 
              key={m.membershipId} 
              className={clsx(
                "bg-white border rounded-[var(--radius-xl)] transition-all duration-300 overflow-hidden",
                isComplete ? "border-emerald-200 shadow-sm" : "border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200"
              )}
            >
              {/* MEMBER HEADER ROW */}
              <div 
                onClick={() => toggleExpand(m.membershipId)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                   {/* Progress Circle */}
                   <div className="relative w-12 h-12 flex items-center justify-center">
                      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                        <path 
                          className={isComplete ? "text-emerald-500" : "text-indigo-600"} 
                          strokeDasharray={`${progress}, 100`} 
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="3" 
                        />
                      </svg>
                      <span className="font-bold text-slate-700 text-sm">{m.name.charAt(0)}</span>
                   </div>
                   
                   <div>
                      <h3 className="font-bold text-slate-800 text-base">{m.name}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        <span className={isComplete ? "text-emerald-600 font-bold" : "text-indigo-600 font-bold"}>
                           {paidCount} 
                        </span>
                        <span className="text-slate-400"> / {cycle.totalInstallments} paid</span>
                      </p>
                   </div>
                </div>

                <div className="p-2 text-slate-400">
                    {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
              </div>

              {/* INSTALLMENT GRID */}
              {isOpen && (
                <div className="px-5 pb-6 pt-0 animate-slide-up">
                    <div className="h-px w-full bg-slate-100 mb-4" />
                    
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
                        {m.subscription.installments.map((inst) => {
                            const isProcessing = processing === `${m.membershipId}-${inst.number}`;
                            
                            return (
                                <button
                                    key={inst.number}
                                    disabled={activeClub?.role !== 'admin' || isProcessing}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePayment(m.membershipId, m.subscription._id, inst.number);
                                    }}
                                    className={clsx(
                                        "h-10 rounded-lg border text-[10px] font-bold transition-all duration-200 flex items-center justify-center relative",
                                        inst.isPaid 
                                            ? "bg-emerald-500 border-emerald-500 text-white shadow-sm" 
                                            : "bg-white border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-600",
                                        isProcessing && "opacity-50 cursor-wait",
                                        activeClub?.role !== 'admin' && !inst.isPaid && "opacity-50 cursor-not-allowed bg-slate-50"
                                    )}
                                >
                                    {inst.isPaid ? <Check size={14} strokeWidth={3} /> : getLabel(inst.number)}
                                </button>
                            );
                        })}
                    </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ... Sub-components remain unchanged ...
function StatBadge({ label, value, sub, icon: Icon, color }) {
    const colors = {
        emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
        blue: "bg-blue-50 text-blue-700 border-blue-100"
    };

    return (
        <div className={`flex flex-col items-end px-4 py-2 rounded-xl border ${colors[color]}`}>
            <div className="flex items-center gap-1 opacity-80 mb-1">
                <Icon size={12} />
                <span className="text-[10px] uppercase font-bold tracking-wider">{label}</span>
            </div>
            <div className="text-lg font-bold leading-none">
                {value}<span className="text-xs opacity-70 font-medium">{sub}</span>
            </div>
        </div>
    );
}

function SkeletonLoader() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div className="space-y-2">
                    <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
                    <div className="h-4 w-32 bg-slate-100 rounded-lg animate-pulse" />
                </div>
                <div className="h-12 w-32 bg-slate-100 rounded-xl animate-pulse" />
            </div>
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 w-full bg-white border border-slate-200 rounded-2xl animate-pulse" />
                ))}
            </div>
        </div>
    );
}

function NoCycleState({ isAdmin }) {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
            <div className="bg-slate-100 p-6 rounded-3xl mb-6 shadow-inner">
                {isAdmin ? <AlertCircle className="w-12 h-12 text-slate-400" /> : <Lock className="w-12 h-12 text-slate-400" />}
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Financial Year Not Active</h2>
            <p className="text-slate-500 max-w-md mt-2 leading-relaxed">
                {isAdmin 
                    ? "You haven't started a new financial cycle yet. Go to Settings to configure the new year." 
                    : "The committee has not opened the books for the new year yet. Please check back later."}
            </p>
        </div>
    );
}