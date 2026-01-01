import { useEffect, useState } from "react";
import axios from "../api/axios";
import { exportHistoryCyclePDF } from "../utils/pdfExport";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Lock,
  IndianRupee,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function History() {
  const { user } = useAuth();

  const [cycles, setCycles] = useState([]);
  const [cycleId, setCycleId] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

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

  /* ================= LOAD CYCLES ================= */
  useEffect(() => {
    axios.get("/history/cycles").then((res) => {
      setCycles(res.data.data);
      if (res.data.data.length) {
        setCycleId(res.data.data[0]._id);
      }
    });
  }, []);

  /* ================= LOAD SUMMARY ================= */
  useEffect(() => {
    if (!cycleId) return;

    setLoading(true);
    axios
      .get(`/history/cycle/${cycleId}/summary`)
      .then((res) => setSummary(res.data.data))
      .finally(() => setLoading(false));
  }, [cycleId]);

  /* ================= LOAD SECTION ================= */
  const loadSection = async (key) => {
    if (sections[key]) {
      setSections((p) => ({ ...p, [key]: false }));
      return;
    }

    const res = await axios.get(
      `/history/cycle/${cycleId}/${key}`
    );

    setData((p) => ({ ...p, [key]: res.data.data }));
    setSections((p) => ({ ...p, [key]: true }));
  };

  /* ================= CLOSE CYCLE ================= */
  const closeCycle = async () => {
    if (!window.confirm("Close this cycle permanently?")) return;

    await axios.post(`/history/cycle/${cycleId}/close`);
    alert("Cycle closed");
    window.location.reload();
  };

  if (loading || !summary) {
    return <p className="text-gray-500">Loading history...</p>;
  }

  const cycle = cycles.find((c) => c._id === cycleId);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-xl font-semibold">Financial History</h2>
        <p className="text-sm text-gray-500">
          Read-only records per puja cycle
        </p>
      </div>

      {/* CYCLE SELECT */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="bg-white p-4 rounded-xl shadow max-w-sm">
          <label className="text-sm font-medium">Select Cycle</label>
          <select
            value={cycleId}
            onChange={(e) => setCycleId(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          >
            {cycles.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} (
                {new Date(c.startDate).getFullYear()}–
                {new Date(c.endDate).getFullYear()})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() =>
            exportHistoryCyclePDF({
              cycle,
              summary,
              weekly: data.weekly,
              puja: data.puja,
              donations: data.donations,
              expenses: data.expenses,
            })
          }
          className="btn-primary flex gap-2"
        >
          <Download size={16} />
          Export PDF
        </button>


        {summary.isClosed && (
          <span className="text-green-600 font-medium flex items-center gap-1">
            <Lock size={16} /> Closed
          </span>
        )}

        {user.role === "admin" && !summary.isClosed && (
          <button
            onClick={closeCycle}
            className="btn-danger"
          >
            Close Cycle
          </button>
        )}
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          label="Opening Balance"
          value={summary.openingBalance}
        />
        <SummaryCard
          label="Total Collection"
          value={summary.collections}
        />
        <SummaryCard
          label="Total Expenses"
          value={summary.expenses}
        />
        <SummaryCard
          label="Closing Balance"
          value={summary.closingBalance}
          highlight
        />
      </div>

      {/* COLLAPSIBLES */}
      <Section
        title={`Weekly Contributions (₹${summary.weeklyTotal || 0})`}
        open={sections.weekly}
        onToggle={() => loadSection("weekly")}
      >
        {data.weekly.map((r) => (
          <Row
            key={r._id}
            label={r.memberName}
            value={r.total}
          />
        ))}
      </Section>

      <Section
        title={`Puja Contributions (₹${summary.pujaTotal || 0})`}
        open={sections.puja}
        onToggle={() => loadSection("puja")}
      >
        {data.puja.map((r) => (
          <Row
            key={r._id}
            label={r.memberName}
            value={r.total}
          />
        ))}
      </Section>

      <Section
        title={`Donations (₹${summary.donationTotal || 0})`}
        open={sections.donations}
        onToggle={() => loadSection("donations")}
      >
        {data.donations.map((r, i) => (
          <Row
            key={i}
            label={`${r.donorName} (${r.date})`}
            value={r.amount}
          />
        ))}
      </Section>

      <Section
        title={`Expenses (₹${summary.expenses || 0})`}
        open={sections.expenses}
        onToggle={() => loadSection("expenses")}
      >
        {data.expenses.map((r, i) => (
          <Row
            key={i}
            label={`${r.title} (${r.date})`}
            value={r.amount}
            negative
          />
        ))}
      </Section>
    </div>
  );
}

/* ================= COMPONENTS ================= */

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

function Section({ title, open, onToggle, children }) {
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
          {children.length ? children : (
            <p className="text-sm text-gray-500">
              No records
            </p>
          )}
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
