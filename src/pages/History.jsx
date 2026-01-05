import { useEffect, useState } from "react";
import axios from "../api/axios";
import { exportHistoryCyclePDF } from "../utils/pdfExport";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Lock,
  IndianRupee,
  PieChart as PieIcon,
  BarChart as BarChartIcon
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
// ✅ NEW IMPORTS
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export default function History() {
  const { user } = useAuth();
  const [cycles, setCycles] = useState([]);
  const [cycleId, setCycleId] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // ✅ NEW: View Mode (List vs Charts)
  const [viewMode, setViewMode] = useState("list"); 

  const [sections, setSections] = useState({
    weekly: false,
    puja: false,
    donations: false,
    expenses: false,
  });

  const [data, setData] = useState({
    weekly: [],
    puja: [],
    donations: [],
    expenses: [],
  });

  useEffect(() => {
    axios.get("/history/cycles").then((res) => {
      setCycles(res.data.data);
      if (res.data.data.length) setCycleId(res.data.data[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!cycleId) return;
    setLoading(true);
    axios.get(`/history/cycle/${cycleId}/summary`)
      .then((res) => setSummary(res.data.data))
      .finally(() => setLoading(false));
  }, [cycleId]);

  const loadSection = async (key) => {
    if (sections[key]) {
      setSections((p) => ({ ...p, [key]: false }));
      return;
    }
    const res = await axios.get(`/history/cycle/${cycleId}/${key}`);
    setData((p) => ({ ...p, [key]: res.data.data }));
    setSections((p) => ({ ...p, [key]: true }));
  };

  const handleExport = async () => {
    if (!cycleId || !summary) return;
    if (!window.confirm("Generate full PDF report?")) return;

    setLoading(true);
    try {
      const [weeklyRes, pujaRes, donRes, expRes] = await Promise.all([
        axios.get(`/history/cycle/${cycleId}/weekly`),
        axios.get(`/history/cycle/${cycleId}/puja`),
        axios.get(`/history/cycle/${cycleId}/donations`),
        axios.get(`/history/cycle/${cycleId}/expenses`),
      ]);

      exportHistoryCyclePDF({
        cycle: cycles.find((c) => c._id === cycleId),
        summary,
        weekly: weeklyRes.data.data,
        puja: pujaRes.data.data,
        donations: donRes.data.data,
        expenses: expRes.data.data,
      });
    } catch (error) {
      alert("Failed to generate PDF");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !summary) return <p className="text-gray-500">Loading history...</p>;

  // ✅ PREPARE CHART DATA
  const pieData = [
    { name: "Weekly", value: summary.weeklyTotal || 0, color: "#4F46E5" },
    { name: "Puja", value: summary.pujaTotal || 0, color: "#10B981" },
    { name: "Donations", value: summary.donationTotal || 0, color: "#F59E0B" },
  ];

  const barData = [
    { name: "Total Income", amount: summary.collections },
    { name: "Expenses", amount: summary.expenses },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Financial History</h2>
          <p className="text-sm text-gray-500">Archives & Analysis</p>
        </div>

        {/* ✅ VIEW TOGGLE */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition ${viewMode === 'list' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
          >
            <PieIcon size={16} /> Data
          </button>
          <button
            onClick={() => setViewMode("charts")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition ${viewMode === 'charts' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
          >
            <BarChartIcon size={16} /> Analysis
          </button>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="flex flex-wrap gap-4 items-end bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-bold text-gray-500 uppercase">Select Financial Year</label>
          <select
            value={cycleId}
            onChange={(e) => setCycleId(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-1 bg-gray-50 font-medium"
          >
            {cycles.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({new Date(c.startDate).getFullYear()})
              </option>
            ))}
          </select>
        </div>
        <button onClick={handleExport} disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex gap-2 items-center hover:bg-indigo-700 transition">
          <Download size={16} /> Export PDF
        </button>
      </div>

      {/* ✅ CONDITIONAL RENDERING */}
      {viewMode === "charts" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
           {/* CHART 1: INCOME SOURCES */}
           <div className="bg-white p-6 rounded-xl shadow">
             <h3 className="font-semibold mb-4 text-center text-gray-700">Income Sources Breakdown</h3>
             <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                     {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                   </Pie>
                   <Tooltip />
                   <Legend verticalAlign="bottom" height={36} />
                 </PieChart>
               </ResponsiveContainer>
             </div>
           </div>

           {/* CHART 2: INCOME VS EXPENSE */}
           <div className="bg-white p-6 rounded-xl shadow">
             <h3 className="font-semibold mb-4 text-center text-gray-700">Income vs. Expenses</h3>
             <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={barData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} />
                   <XAxis dataKey="name" fontSize={12} />
                   <YAxis fontSize={12} />
                   <Tooltip cursor={{fill: '#f3f4f6'}} />
                   <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={50} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
           </div>
        </div>
      ) : (
        /* STANDARD LIST VIEW */
        <div className="space-y-6 animate-fade-in-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard label="Opening Balance" value={summary.openingBalance} />
            <SummaryCard label="Total Collection" value={summary.collections} />
            <SummaryCard label="Total Expenses" value={summary.expenses} />
            <SummaryCard label="Closing Balance" value={summary.closingBalance} highlight />
          </div>

          <Section title={`Weekly Contributions (₹${summary.weeklyTotal})`} open={sections.weekly} onToggle={() => loadSection("weekly")}>
            {data.weekly.map((r) => <Row key={r._id} label={r.memberName} value={r.total} />)}
          </Section>
          <Section title={`Puja Contributions (₹${summary.pujaTotal})`} open={sections.puja} onToggle={() => loadSection("puja")}>
            {data.puja.map((r) => <Row key={r._id} label={r.memberName} value={r.total} />)}
          </Section>
          <Section title={`Donations (₹${summary.donationTotal})`} open={sections.donations} onToggle={() => loadSection("donations")}>
            {data.donations.map((r, i) => <Row key={i} label={`${r.donorName} (${r.date})`} value={r.amount} />)}
          </Section>
          <Section title={`Expenses (₹${summary.expenses})`} open={sections.expenses} onToggle={() => loadSection("expenses")}>
            {data.expenses.map((r, i) => <Row key={i} label={`${r.title} (${r.date})`} value={r.amount} negative />)}
          </Section>
        </div>
      )}
    </div>
  );
}

// ... Keep your SummaryCard, Section, and Row components as they were ...
function SummaryCard({ label, value, highlight }) {
  return (
    <div className={`rounded-xl shadow p-4 flex items-center gap-3 border ${highlight ? "bg-indigo-600 text-white border-indigo-600" : "bg-white border-gray-100"}`}>
      <div className={`p-2 rounded-lg ${highlight ? "bg-white/20" : "bg-indigo-50 text-indigo-600"}`}>
        <IndianRupee size={20} />
      </div>
      <div>
        <p className={`text-xs ${highlight ? "text-indigo-100" : "text-gray-500"}`}>{label}</p>
        <h3 className="text-lg font-bold">₹ {value}</h3>
      </div>
    </div>
  );
}

function Section({ title, open, onToggle, children }) {
  return (
    <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
      <button onClick={onToggle} className="w-full flex justify-between items-center p-4 font-semibold hover:bg-gray-50 transition">
        {title}
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && <div className="border-t border-gray-100 p-4 space-y-2 bg-gray-50/50">{children.length ? children : <p className="text-sm text-gray-400 italic">No records found</p>}</div>}
    </div>
  );
}

function Row({ label, value, negative }) {
  return (
    <div className="flex justify-between text-sm py-1 border-b border-gray-100 last:border-0">
      <span className="text-gray-700">{label}</span>
      <span className={`font-semibold ${negative ? "text-red-600" : "text-green-600"}`}>₹ {value}</span>
    </div>
  );
}