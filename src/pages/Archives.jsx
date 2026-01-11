import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { 
  Archive, Calendar, ChevronRight, Download, Lock, Loader2, 
  TrendingUp, TrendingDown, AlertTriangle 
} from "lucide-react";
import { exportHistoryCyclePDF } from "../utils/pdfExport"; 
import { clsx } from "clsx";

// Design System
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export default function Archives() {
  const { activeClub } = useAuth();
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(null);
  const [yearDetails, setYearDetails] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchClosedYears();
  }, []);

  const fetchClosedYears = async () => {
    try {
      const res = await api.get("/archives");
      setYears(res.data.data);
    } catch (err) {
      console.error("Failed to load archives", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewYear = async (year) => {
    if (selectedYear?._id === year._id) {
      setSelectedYear(null);
      setYearDetails(null);
      return;
    }
    
    setSelectedYear(year);
    setDetailLoading(true);

    try {
      const res = await api.get(`/archives/${year._id}`);
      setYearDetails(res.data.data);
    } catch (err) {
      console.error("Failed to load year details", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleExport = () => {
    if (!selectedYear || !yearDetails) return;
    
    const { summary, records, info } = yearDetails;
    const parse = (n) => Number(n) || 0;
    
    const frequency = info.subscriptionFrequency || 'weekly';
    const showSubscriptions = frequency !== 'none';

    const rawSubs = records.subscriptions || records.weekly || [];
    let mappedSubscriptions = rawSubs.map(s => ({
        memberName: s.memberName || s.user?.name || "Member",
        total: parse(s.totalPaid || s.totalAmount || s.total || s.amount)
    })).filter(s => s.total > 0);

    const summaryTotalSubs = parse(summary.income.subscriptions);
    if (mappedSubscriptions.length === 0 && summaryTotalSubs > 0 && showSubscriptions) {
        mappedSubscriptions = [{
            memberName: "Aggregated Collection (Details Unavailable)",
            total: summaryTotalSubs
        }];
    }

    exportHistoryCyclePDF({
      clubName: activeClub?.clubName || "Club Archive Record",
      cycle: selectedYear,
      frequency: frequency,
      
      summary: {
        openingBalance: parse(summary.openingBalance),
        collections: parse(summary.income.total),
        expenses: parse(summary.expense),
        closingBalance: parse(summary.netBalance)
      },

      weekly: showSubscriptions ? mappedSubscriptions : [],
      
      puja: (records.fees || []).map(p => ({
         memberName: p.user?.name || "Unknown",
         total: parse(p.amount)
      })),

      donations: (records.donations || []).map(d => ({
         donorName: d.donorName || "Anonymous",
         date: d.date || d.createdAt,
         amount: parse(d.amount)
      })),

      expenses: (records.expenses || []).map(e => ({
         title: e.title,
         date: e.date || e.createdAt,
         amount: parse(e.amount)
      }))
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-lg shadow-slate-200 dark:shadow-none">
           <Archive size={24} />
        </div>
        <div>
           <h1 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">Archives</h1>
           <p className="text-[var(--text-muted)] text-sm">Records of previous festival years.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary-600" /></div>
      ) : years.length === 0 ? (
        <div className="text-center py-16 bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border-color)]">
           <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
             <Lock className="text-slate-300 dark:text-slate-500" size={24}/>
           </div>
           <p className="text-[var(--text-muted)] font-medium">No closed years found yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {years.map((year) => (
            <Card key={year._id} noPadding className={clsx("transition-all duration-300 border-[var(--border-color)]", selectedYear?._id === year._id ? "ring-2 ring-primary-500 shadow-lg" : "hover:border-primary-200 dark:hover:border-primary-800")}>
                
               {/* YEAR ROW */}
               <div 
                 onClick={() => handleViewYear(year)}
                 className="p-5 flex items-center justify-between cursor-pointer bg-[var(--bg-card)] hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
               >
                  <div className="flex items-center gap-4">
                      <div className={clsx("p-3 rounded-xl transition-colors", selectedYear?._id === year._id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400')}>
                         <Calendar size={20} />
                      </div>
                      <div>
                          <h3 className="font-bold text-lg text-[var(--text-main)]">{year.name}</h3>
                          <p className="text-xs text-[var(--text-muted)] flex items-center gap-2">
                             {new Date(year.startDate).getFullYear()} • 
                             <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                               Closed
                             </span>
                          </p>
                      </div>
                  </div>

                  <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Closing Balance</p>
                      <p className="font-mono font-bold text-lg text-[var(--text-main)]">₹ {year.closingBalance?.toLocaleString('en-IN')}</p>
                  </div>
                  
                  <ChevronRight size={20} className={clsx("text-slate-400 transition-transform duration-300", selectedYear?._id === year._id && "rotate-90")} />
               </div>

               {/* EXPANDED DETAILS */}
               {selectedYear?._id === year._id && (
                  <div className="bg-slate-50/50 dark:bg-slate-800/30 border-t border-[var(--border-color)] p-6 animate-slide-up">
                      {detailLoading || !yearDetails ? (
                         <div className="flex justify-center py-4"><Loader2 className="animate-spin text-primary-600" /></div>
                      ) : (
                        <div className="space-y-6">
                           
                           {/* METRICS */}
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <DetailBox label="Opening Balance" amount={yearDetails.summary.openingBalance} />
                              <DetailBox label="Total Income" amount={yearDetails.summary.income.total} color="text-emerald-600 dark:text-emerald-400" icon={<TrendingUp size={14}/>} />
                              <DetailBox label="Total Expenses" amount={yearDetails.summary.expense} color="text-rose-600 dark:text-rose-400" icon={<TrendingDown size={14}/>} />
                              
                              {/* ⚠️ INTELLIGENT BALANCE BOX */}
                              <DetailBox 
                                label={yearDetails.summary.hasDiscrepancy ? "Stored Balance" : "Net Balance"}
                                amount={yearDetails.summary.netBalance} 
                                isBold 
                                color={yearDetails.summary.hasDiscrepancy ? "text-amber-600 dark:text-amber-400" : "text-primary-700 dark:text-primary-400"}
                                icon={yearDetails.summary.hasDiscrepancy ? <AlertTriangle size={14} className="text-amber-500" /> : null}
                                borderColor={yearDetails.summary.hasDiscrepancy ? "border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-900/10" : null}
                              />
                           </div>

                           {/* 🔴 ERROR ALERT */}
                           {yearDetails.summary.hasDiscrepancy && (
                             <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 rounded-lg p-3 flex items-start gap-3 text-sm text-amber-800 dark:text-amber-400">
                                <AlertTriangle className="mt-0.5 shrink-0" size={16} />
                                <div>
                                  <p className="font-bold">Calculation Mismatch Detected</p>
                                  <p className="opacity-90 mt-1">
                                    The records sum to <strong>₹{yearDetails.summary.calculatedBalance}</strong>, 
                                    but the database stored <strong>₹{yearDetails.summary.netBalance}</strong>. 
                                    Please verify your manual entries.
                                  </p>
                                </div>
                             </div>
                           )}

                           {/* BREAKDOWN */}
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <Card noPadding className="bg-[var(--bg-card)] border-[var(--border-color)]">
                                    <div className="p-3 border-b border-[var(--border-color)] font-bold text-[var(--text-muted)] text-xs uppercase bg-slate-50/50 dark:bg-slate-800/50">Income Sources</div>
                                    <div className="p-3 space-y-2">
                                        {yearDetails.info.subscriptionFrequency !== 'none' && (
                                            <Row 
                                                label={yearDetails.info.subscriptionFrequency === 'monthly' ? "Monthly Collection" : "Weekly Collection"} 
                                                value={yearDetails.summary.income.subscriptions} 
                                            />
                                        )}
                                        <Row label="Puja Fees" value={yearDetails.summary.income.fees} />
                                        <Row label="Donations" value={yearDetails.summary.income.donations} />
                                    </div>
                                </Card>
                                <Card noPadding className="bg-[var(--bg-card)] border-[var(--border-color)]">
                                    <div className="p-3 border-b border-[var(--border-color)] font-bold text-[var(--text-muted)] text-xs uppercase bg-slate-50/50 dark:bg-slate-800/50">Record Counts</div>
                                    <div className="p-3 space-y-2">
                                        <Row label="Expense Bills" value={yearDetails.records.expenses.length} isCount />
                                        <Row label="Fee Records" value={yearDetails.records.fees.length} isCount />
                                        <Row label="Donations" value={yearDetails.records.donations.length} isCount />
                                    </div>
                                </Card>
                           </div>

                           {/* EXPORT */}
                           <div className="flex justify-end pt-2">
                              <Button 
                                variant="secondary"
                                onClick={handleExport}
                                leftIcon={<Download size={16} />}
                              >
                                 Download Full Report
                              </Button>
                           </div>
                        </div>
                      )}
                  </div>
               )}

            </Card>
          ))}
        </div>
      )}

    </div>
  );
}

function DetailBox({ label, amount, color, isBold, icon, borderColor }) {
   return (
      <div className={clsx("p-4 rounded-xl border shadow-sm transition-colors", borderColor || "bg-[var(--bg-card)] border-[var(--border-color)]")}>
         <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase flex items-center gap-1 mb-1 tracking-wider">
            {icon} {label}
         </p>
         <p className={clsx("font-mono text-lg", isBold ? 'font-black' : 'font-medium', color || 'text-slate-600 dark:text-slate-300')}>
            ₹ {(amount || 0).toLocaleString('en-IN')}
         </p>
      </div>
   )
}

function Row({ label, value, isCount }) {
    return (
        <div className="flex justify-between items-center py-1 border-b border-[var(--border-color)] last:border-0 text-sm">
            <span className="text-[var(--text-muted)] font-medium">{label}</span>
            <span className="font-mono font-bold text-[var(--text-main)]">
                {isCount ? value : `₹ ${value.toLocaleString('en-IN')}`}
            </span>
        </div>
    )
}