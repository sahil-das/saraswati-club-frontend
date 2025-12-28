import { useState } from "react";
import { IndianRupee, Download, ChevronDown, ChevronUp } from "lucide-react";
import { exportHistoryYearPDF } from "../utils/pdfExport";
import { useAuth } from "../context/AuthContext";

export default function History() {
  const availableYears = [2024, 2023, 2022];
  const [year, setYear] = useState(2024);

  const [open, setOpen] = useState({
    weekly: false,
    puja: false,
    donations: false,
    expenses: false,
  });

  const { user } = useAuth();

  const [closedYears, setClosedYears] = useState([2023]); // mock closed years

  const isClosed = closedYears.includes(year);

  const closeYear = () => {
    if (!window.confirm(`Close financial year ${year}? This cannot be undone.`))
      return;

    // calculate closing balance
    const closingBalance = data.openingBalance + data.collections - data.expenses;

    // mark year closed
    setClosedYears((prev) => [...prev, year]);

    // auto-carry to next year
    historyData[year + 1] = {
      openingBalance: closingBalance,
      collections: 0,
      expenses: 0,
      closingBalance: 0,
      weekly: [],
      puja: [],
      donations: [],
      expensesList: [],
    };

    alert(`Year ${year} closed. Opening balance for ${year + 1} set to ₹${closingBalance}`);
  };

  /* ================= MOCK HISTORY DATA ================= */
  const historyData = {
    2024: {
      openingBalance: 3200,
      collections: 45000,
      expenses: 41800,
      closingBalance: 6400,

      weekly: [
        { member: "Rahul Kumar", amount: 5200 },
        { member: "Amit Singh", amount: 5000 },
      ],

      puja: [
        { member: "Rahul Kumar", amount: 1500, date: "2024-02-12" },
        { member: "Amit Singh", amount: 1200, date: "2024-02-13" },
      ],

      donations: [
        { name: "Ramesh Sharma", amount: 2000, date: "2024-02-10" },
        { name: "Anita Devi", amount: 1500, date: "2024-02-12" },
      ],

      expensesList: [
        { title: "Decoration", amount: 1800, date: "2024-02-11" },
        { title: "Puja Samagri", amount: 2500, date: "2024-02-09" },
      ],
    },
  };

  const data = historyData[year];

  const toggle = (key) =>
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-xl font-semibold">Financial History</h2>
        <p className="text-sm text-gray-500">
          Previous years data (read-only)
        </p>
      </div>

      {/* YEAR SELECT + EXPORT */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <div className="bg-white p-4 rounded-xl shadow max-w-xs">
          <label className="text-sm font-medium">Select Year</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => exportHistoryYearPDF(year, data)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          <Download size={16} />
          Export PDF
        </button>

        {user.role === "admin" && !isClosed && (
          <button
            onClick={closeYear}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Close Year
          </button>
        )}

        {isClosed && (
          <span className="text-sm text-green-600 font-medium">
            Year Closed ✔
          </span>
        )}
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard label="Opening Balance" value={data.openingBalance} />
        <SummaryCard label="Total Collection" value={data.collections} />
        <SummaryCard label="Total Expenses" value={data.expenses} />
        <SummaryCard
          label="Closing Balance"
          value={data.closingBalance}
          highlight
        />
      </div>

      {/* COLLAPSIBLE SECTIONS */}
      <Collapsible
        title="Weekly Contributions"
        open={open.weekly}
        onToggle={() => toggle("weekly")}
      >
        {data.weekly.map((w, i) => (
          <Row key={i} label={w.member} value={w.amount} />
        ))}
      </Collapsible>

      <Collapsible
        title="Puja Contributions"
        open={open.puja}
        onToggle={() => toggle("puja")}
      >
        {data.puja.map((p, i) => (
          <Row
            key={i}
            label={`${p.member} (${p.date})`}
            value={p.amount}
          />
        ))}
      </Collapsible>

      <Collapsible
        title="Outside Donations"
        open={open.donations}
        onToggle={() => toggle("donations")}
      >
        {data.donations.map((d, i) => (
          <Row
            key={i}
            label={`${d.name} (${d.date})`}
            value={d.amount}
          />
        ))}
      </Collapsible>

      <Collapsible
        title="Expenses"
        open={open.expenses}
        onToggle={() => toggle("expenses")}
      >
        {data.expensesList.map((e, i) => (
          <Row
            key={i}
            label={`${e.title} (${e.date})`}
            value={e.amount}
            negative
          />
        ))}
      </Collapsible>
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

function SummaryCard({ label, value, highlight }) {
  return (
    <div
      className={`rounded-xl shadow p-5 flex items-center gap-4 ${
        highlight ? "bg-indigo-600 text-white" : "bg-white"
      }`}
    >
      <div className="bg-indigo-100 text-indigo-600 p-3 rounded-lg">
        <IndianRupee />
      </div>
      <div>
        <p className="text-sm opacity-80">{label}</p>
        <h3 className="text-xl font-bold">₹ {value}</h3>
      </div>
    </div>
  );
}

function Collapsible({ title, open, onToggle, children }) {
  return (
    <div className="bg-white rounded-xl shadow">
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center p-4 font-semibold"
      >
        {title}
        {open ? <ChevronUp /> : <ChevronDown />}
      </button>

      {open && (
        <div className="border-t p-4 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, negative }) {
  return (
    <div className="flex justify-between text-sm">
      <span>{label}</span>
      <span
        className={`font-semibold ${
          negative ? "text-red-600" : "text-green-600"
        }`}
      >
        ₹ {value}
      </span>
    </div>
  );
}
