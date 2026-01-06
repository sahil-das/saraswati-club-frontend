import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from "recharts";
import { 
  TrendingUp, TrendingDown, Wallet, IndianRupee, PieChart as PieIcon, Download, Loader2, AlertCircle 
} from "lucide-react";
import { exportFinancialReportPDF } from "../utils/exportFinancialReportPDF"; 
import { clsx } from "clsx"; // 👈 ADDED THIS IMPORT

// Design System
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export default function Reports() {
  const { activeClub } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cycle, setCycle] = useState(null);
  
  // Data States
  const [summary, setSummary] = useState({ opening: 0, collected: 0, expenses: 0, closing: 0 });
  const [expenses, setExpenses] = useState([]);
  const [pujaList, setPujaList] = useState([]);
  const [donationList, setDonationList] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [dailyCollection, setDailyCollection] = useState([]);

  const COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444"];

  useEffect(() => {
    fetchReportData();
  }, [activeClub]);

  const fetchReportData = async () => {
    try {
      const yearRes = await api.get("/years/active");
      const activeYear = yearRes.data.data;
      
      if (!activeYear) {
        setLoading(false);
        return;
      }
      setCycle(activeYear);

      const [expRes, pujaRes, donateRes] = await Promise.all([
        api.get("/expenses"),
        api.get("/member-fees"),            
        api.get("/donations")               
      ]);

      const expenseData = expRes.data.data || [];
      const pujaData = pujaRes.data.data || [];
      const donationData = donateRes.data.data || [];

      setPujaList(pujaData);
      setDonationList(donationData);

      // Calculations
      const totalExpenses = expenseData
        .filter(e => e.status === "approved")
        .reduce((sum, e) => sum + e.amount, 0);

      const totalPuja = pujaData.reduce((sum, p) => sum + p.amount, 0);
      const totalDonations = donationData.reduce((sum, d) => sum + d.amount, 0);
      const totalCollected = totalPuja + totalDonations; 

      setSummary({
        opening: activeYear.openingBalance || 0,
        collected: totalCollected,
        expenses: totalExpenses,
        closing: (activeYear.openingBalance + totalCollected) - totalExpenses
      });

      setExpenses(expenseData);
      setContributions([
        { name: "Puja Chanda", value: totalPuja },
        { name: "Donations", value: totalDonations },
      ]);

      // Daily Trend
      const dateMap = {};
      [...pujaData, ...donationData].forEach(item => {
         const date = new Date(item.date || item.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
         dateMap[date] = (dateMap[date] || 0) + item.amount;
      });

      const trendData = Object.keys(dateMap).map(date => ({
        date,
        amount: dateMap[date]
      })).slice(-14); 

      setDailyCollection(trendData);

    } catch (err) {
      console.error("Report Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    exportFinancialReportPDF({
      clubName: activeClub?.clubName || "Club Committee",
      year: cycle?.name || new Date().getFullYear(),
      openingBalance: summary.opening,
      totalIncome: summary.collected,
      totalExpense: summary.expenses,
      netBalance: summary.closing,
      incomeSources: {
        weekly: 0, 
        puja: contributions.find(c => c.name === "Puja Chanda")?.value || 0,
        donation: contributions.find(c => c.name === "Donations")?.value || 0
      },
      details: {
        expenses: expenses.filter(e => e.status === "approved"),
        donations: donationList,
        puja: pujaList
      }
    });
  };

  if (loading) return <div className="h-64 flex justify-center items-center text-primary-600"><Loader2 className="animate-spin w-10 h-10" /></div>;

  if (!cycle) return (
    <div className="p-10 text-center bg-slate-50 rounded-3xl border border-slate-200 mt-10">
      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
        <AlertCircle className="text-slate-400" size={32} />
      </div>
      <h3 className="text-xl font-bold text-slate-800">No Active Financial Year</h3>
      <p className="text-slate-500 max-w-sm mx-auto mt-2">Reports will appear here once you start a new festival cycle in Settings.</p>
    </div>
  );

  // Data for Charts
  const expenseCategories = {};
  expenses.filter(e => e.status === "approved").forEach(e => {
    expenseCategories[e.category] = (expenseCategories[e.category] || 0) + e.amount;
  });
  const pieData = Object.keys(expenseCategories).map(cat => ({
    name: cat,
    value: expenseCategories[cat]
  }));

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Reports</h1>
          <p className="text-slate-500 text-sm">Overview of <span className="font-bold text-slate-700">{cycle.name}</span></p>
        </div>
        <Button 
          onClick={handleExport}
          leftIcon={<Download size={18} />}
        >
          Download Report
        </Button>
      </div>

      {/* 2. SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Opening Balance" 
          amount={summary.opening} 
          icon={Wallet} 
          color="blue" 
        />
        <StatCard 
          label="Total Collected" 
          amount={summary.collected} 
          icon={TrendingUp} 
          color="emerald" 
        />
        <StatCard 
          label="Total Expenses" 
          amount={summary.expenses} 
          icon={TrendingDown} 
          color="rose" 
        />
        <StatCard 
          title="Net Balance" 
          amount={summary.closing} 
          icon={IndianRupee} 
          color="indigo" 
        />
      </div>

      {/* 3. CHARTS ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* A. INCOME VS EXPENSE */}
        <Card className="min-h-[400px]">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-primary-600"/> Income vs Expense
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Income', amount: summary.collected },
                  { name: 'Expense', amount: summary.expenses }
                ]}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={50}>
                  <Cell fill="#10b981" />
                  <Cell fill="#f43f5e" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* B. EXPENSE BREAKDOWN (PIE) */}
        <Card className="min-h-[400px]">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <PieIcon size={18} className="text-primary-600"/> Expense Breakdown
          </h3>
          {pieData.length > 0 ? (
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => `₹${val}`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-slate-400">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <PieIcon size={24} className="opacity-20"/>
               </div>
               <p className="text-sm font-medium">No expenses recorded yet.</p>
            </div>
          )}
        </Card>
      </div>

      {/* 4. CHART ROW 2: TRENDS */}
      <Card>
        <h3 className="font-bold text-slate-800 mb-6">Daily Collection Trend (Last 14 Days)</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyCollection} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#6366f1" 
                fillOpacity={1} 
                fill="url(#colorAmt)" 
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function StatCard({ label, amount, icon: Icon, color, highlight }) {
  const colors = {
      blue: "bg-blue-50 text-blue-600",
      emerald: "bg-emerald-50 text-emerald-600",
      rose: "bg-rose-50 text-rose-600",
      indigo: "bg-indigo-50 text-indigo-600",
  };

  return (
    <Card className={clsx("transition-all hover:-translate-y-1", highlight && "bg-slate-900 text-white border-slate-900")}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className={clsx("text-xs font-bold uppercase tracking-wider", highlight ? "text-slate-400" : "text-slate-500")}>
            {label}
          </p>
          <h3 className="text-2xl font-bold font-mono mt-1">₹{amount.toLocaleString()}</h3>
        </div>
        <div className={clsx("p-3 rounded-xl flex items-center justify-center", !highlight && colors[color], highlight && "bg-slate-800 text-indigo-400")}>
           <Icon size={20} /> 
        </div>
      </div>
    </Card>
  );
}