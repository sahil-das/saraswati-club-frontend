import { useEffect, useState } from "react";
import api from "../api/axios";
import { 
  Archive, Calendar, ChevronRight, Download, Lock, Loader2, TrendingUp, TrendingDown 
} from "lucide-react";
import { exportFinancialReportPDF } from "../utils/exportFinancialReportPDF"; 
import { clsx } from "clsx";

// Design System
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export default function Archives() {
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

    exportFinancialReportPDF({
      clubName: "Club Archive Record",
      year: selectedYear.name,
      openingBalance: summary.openingBalance,
      totalIncome: summary.income.total,
      totalExpense: summary.expense,
      netBalance: summary.netBalance,
      frequency: info.subscriptionFrequency, 
      incomeSources: {
        weekly: summary.income.subscriptions,
        puja: summary.income.fees,
        donation: summary.income.donations
      },
      details: {
        expenses: records.expenses,
        donations: records.donations,
        puja: records.fees
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-200">
           <Archive size={24} />
        </div>
        <div>
           <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Archives</h1>
           <p className="text-slate-500 text-sm">Records of previous festival years.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary-600" /></div>
      ) : years.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
           <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
             <Lock className="text-slate-300" size={24}/>
           </div>
           <p className="text-slate-500 font-medium">No closed years found yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {years.map((year) => (
            <Card key={year._id} noPadding className={clsx("transition-all duration-300", selectedYear?._id === year._id ? "ring-2 ring-primary-500 shadow-lg" : "hover:border-primary-200")}>
               
               {/* YEAR ROW */}
               <div 
                 onClick={() => handleViewYear(year)}
                 className="p-5 flex items-center justify-between cursor-pointer bg-white hover:bg-slate-50/50 transition-colors"
               >
                  <div className="flex items-center gap-4">
                     <div className={clsx("p-3 rounded-xl transition-colors", selectedYear?._id === year._id ? 'bg-primary-50 text-primary-600' : 'bg-slate-100 text-slate-400')}>
                        <Calendar size={20} />
                     </div>
                     <div>
                        <h3 className="font-bold text-lg text-slate-800">{year.name}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-2">
                           {new Date(year.startDate).getFullYear()} • 
                           <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                              Closed
                           </span>
                        </p>
                     </div>
                  </div>

                  <div className="text-right hidden sm:block">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Closing Balance</p>
                     <p className="font-mono font-bold text-lg text-slate-700">₹ {year.closingBalance?.toLocaleString('en-IN')}</p>
                  </div>
                  
                  <ChevronRight size={20} className={clsx("text-slate-400 transition-transform duration-300", selectedYear?._id === year._id && "rotate-90")} />
               </div>

               {/* EXPANDED DETAILS */}
               {selectedYear?._id === year._id && (
                  <div className="bg-slate-50/50 border-t border-slate-100 p-6 animate-slide-up">
                     {detailLoading || !yearDetails ? (
                        <div className="flex justify-center py-4"><Loader2 className="animate-spin text-primary-600" /></div>
                     ) : (
                        <div className="space-y-6">
                           
                           {/* METRICS */}
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <DetailBox label="Opening Balance" amount={yearDetails.summary.openingBalance} />
                              <DetailBox label="Total Income" amount={yearDetails.summary.income.total} color="text-emerald-600" icon={<TrendingUp size={14}/>} />
                              <DetailBox label="Total Expenses" amount={yearDetails.summary.expense} color="text-rose-600" icon={<TrendingDown size={14}/>} />
                              <DetailBox label="Net Balance" amount={yearDetails.summary.netBalance} isBold color="text-primary-700" />
                           </div>

                           {/* BREAKDOWN */}
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <Card noPadding className="bg-white">
                                    <div className="p-3 border-b border-slate-50 font-bold text-slate-700 text-xs uppercase bg-slate-50/50">Income Sources</div>
                                    <div className="p-3 space-y-2">
                                        {yearDetails.info.subscriptionFrequency !== 'none' && (
                                            <Row label="Subscriptions" value={yearDetails.summary.income.subscriptions} />
                                        )}
                                        <Row label="Puja Fees" value={yearDetails.summary.income.fees} />
                                        <Row label="Donations" value={yearDetails.summary.income.donations} />
                                    </div>
                                </Card>
                                <Card noPadding className="bg-white">
                                    <div className="p-3 border-b border-slate-50 font-bold text-slate-700 text-xs uppercase bg-slate-50/50">Record Counts</div>
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

function DetailBox({ label, amount, color, isBold, icon }) {
   return (
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
         <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mb-1 tracking-wider">
            {icon} {label}
         </p>
         <p className={clsx("font-mono text-lg", isBold ? 'font-black' : 'font-medium', color || 'text-slate-600')}>
            ₹ {(amount || 0).toLocaleString('en-IN')}
         </p>
      </div>
   )
}

function Row({ label, value, isCount }) {
    return (
        <div className="flex justify-between items-center py-1 border-b border-slate-50 last:border-0 text-sm">
            <span className="text-slate-500 font-medium">{label}</span>
            <span className="font-mono font-bold text-slate-700">
                {isCount ? value : `₹ ${value.toLocaleString('en-IN')}`}
            </span>
        </div>
    )
}