import { useEffect, useState } from "react";
import {
  IndianRupee,
  ChevronDown,
  ChevronUp,
  Download,
} from "lucide-react";
import api from "../api/axios";
import { exportHistoryYearPDF } from "../utils/pdfExport";
import { useAuth } from "../context/AuthContext";

export default function History() {
  const { user } = useAuth();

  const [years, setYears] = useState([]);
  const [year, setYear] = useState(null);
  const [summary, setSummary] = useState(null);

  const [weekly, setWeekly] = useState([]);
  const [puja, setPuja] = useState([]);
  const [donations, setDonations] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [open, setOpen] = useState({
    weekly: false,
    puja: false,
    donations: false,
    expenses: false,
  });

  /* ================= LOAD YEARS ================= */
  useEffect(() => {
    const loadYears = async () => {
      const res = await api.get("/cycles");
      const yearsSet = new Set();

      res.data.data.forEach((c) => {
        yearsSet.add(new Date(c.startDate).getFullYear());
        yearsSet.add(new Date(c.endDate).getFullYear());
      });

      const arr = [...yearsSet].sort((a, b) => b - a);
      setYears(arr);
      setYear(arr[0]);
    };

    loadYears();
  }, []);

  /* ================= LOAD YEAR DATA ================= */
  useEffect(() => {
    if (!year) return;

    const load = async () => {
      const [s, w, p, d, e] = await Promise.all([
        api.get(`/history/${year}/summary`),
        api.get(`/history/${year}/weekly`),
        api.get(`/history/${year}/puja`),
        api.get(`/history/${year}/donations`),
        api.get(`/history/${year}/expenses`),
      ]);

      setSummary(s.data.data);
      setWeekly(w.data.data);
      setPuja(p.data.data);
      setDonations(d.data.data);
      setExpenses(e.data.data);
    };

    load();
  }, [year]);

  if (!summary) {
    return <p className="text-gray-500">Loading history…</p>;
  }

  /* ================= TOTALS ================= */
  const weeklyTotal = weekly.reduce((s, r) => s + r.total, 0);
  const pujaTotal = puja.reduce((s, r) => s + r.total, 0);
  const donationTotal = donations.reduce((s, r) => s + r.amount, 0);
  const expenseTotal = expenses.reduce((s, r) => s + r.amount, 0);

  const toggle = (k) =>
    setOpen((p) => ({ ...p, [k]: !p[k] }));

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">
            Financial History
          </h2>
          <p className="text-sm text-gray-500">
            Previous year audit (read-only)
          </p>
        </div>

        <button
          onClick={() =>
            exportHistoryYearPDF(year, {
              summary,
              weekly,
              puja,
              donations,
              expenses,
            })
          }
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          <Download size={16} />
          Export PDF
        </button>
      </div>

      {/* YEAR SELECT */}
      <select
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
        className="border rounded-lg px-3 py-2"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard label="Opening Balance" value={summary.openingBalance} />
        <SummaryCard label="Total Collection" value={summary.collections} />
        <SummaryCard label="Expenses" value={summary.expenses} />
        <SummaryCard
          label="Closing Balance"
          value={summary.closingBalance}
          highlight
        />
      </div>

      {/* WEEKLY */}
      <Collapsible
        title="Weekly Contributions"
        total={weeklyTotal}
        open={open.weekly}
        toggle={() => toggle("weekly")}
      >
        <Table
          columns={["Member", "Total"]}
          rows={weekly.map((r) => [
            r.memberName,
            `₹ ${r.total}`,
          ])}
        />
      </Collapsible>

      {/* PUJA */}
      <Collapsible
        title="Puja Contributions"
        total={pujaTotal}
        open={open.puja}
        toggle={() => toggle("puja")}
      >
        <Table
          columns={["Member", "Total"]}
          rows={puja.map((r) => [
            r.memberName,
            `₹ ${r.total}`,
          ])}
        />
      </Collapsible>

      {/* DONATIONS */}
      <Collapsible
        title="Outside Donations"
        total={donationTotal}
        open={open.donations}
        toggle={() => toggle("donations")}
      >
        <Table
          columns={["Donor", "Amount", "Date"]}
          rows={donations.map((r) => [
            r.donorName,
            `₹ ${r.amount}`,
            r.date,
          ])}
        />
      </Collapsible>

      {/* EXPENSES */}
      <Collapsible
        title="Expenses"
        total={expenseTotal}
        open={open.expenses}
        toggle={() => toggle("expenses")}
      >
        <Table
          columns={["Title", "Amount", "Date"]}
          rows={expenses.map((r) => [
            r.title,
            `₹ ${r.amount}`,
            r.date,
          ])}
        />
      </Collapsible>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function SummaryCard({ label, value, highlight }) {
  return (
    <div
      className={`rounded-xl shadow p-5 flex gap-4 ${
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

function Collapsible({ title, total, open, toggle, children }) {
  return (
    <div className="bg-white rounded-xl shadow">
      <button
        onClick={toggle}
        className="w-full flex justify-between items-center p-4 font-semibold"
      >
        <span>{title}</span>
        <span className="flex items-center gap-3">
          <span className="text-green-600">₹ {total}</span>
          {open ? <ChevronUp /> : <ChevronDown />}
        </span>
      </button>

      {open && <div className="border-t p-4">{children}</div>}
    </div>
  );
}

function Table({ columns, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((c) => (
              <th key={c} className="p-2 text-left">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t">
              {r.map((v, j) => (
                <td key={j} className="p-2">
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
