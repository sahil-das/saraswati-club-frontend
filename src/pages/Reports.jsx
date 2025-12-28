import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useFinance } from "../context/FinanceContext";
import { exportFinancePDF } from "../utils/pdfExport";

const COLORS = ["#6366F1", "#22C55E", "#F59E0B", "#EF4444"];

export default function Reports() {
  const {
    weeklyTotal,
    pujaTotal,
    donationTotal,
    approvedExpenses,
    centralFund,
  } = useFinance();

  // ===== DATA FOR CHARTS =====
  const contributionData = [
    { name: "Weekly", value: weeklyTotal },
    { name: "Puja", value: pujaTotal },
    { name: "Donations", value: donationTotal },
  ];

  const balanceData = [
    { name: "Collected", amount: weeklyTotal + pujaTotal + donationTotal },
    { name: "Expenses", amount: approvedExpenses },
    { name: "Balance", amount: centralFund },
  ];

  // ===== DATA FOR PDF =====
  const summary = [
    { label: "Weekly Contributions", value: weeklyTotal },
    { label: "Puja Contributions", value: pujaTotal },
    { label: "Donations", value: donationTotal },
    { label: "Approved Expenses", value: approvedExpenses },
    { label: "Central Balance", value: centralFund },
  ];

  const contributions = [
    { type: "Weekly", amount: weeklyTotal },
    { type: "Puja", amount: pujaTotal },
    { type: "Donations", amount: donationTotal },
  ];

  // mock expenses (replace with backend later)
  const expenses = [
    {
      title: "Puja Samagri",
      amount: 2500,
      addedBy: "rahul@clubname.com",
      status: "approved",
    },
    {
      title: "Decoration",
      amount: 1800,
      addedBy: "amit@clubname.com",
      status: "approved",
    },
  ];

  return (
    <div>
      {/* HEADER + PDF EXPORT */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold">Financial Reports</h2>

        <button
        onClick={() =>
            exportFinancePDF({
            clubName: "Saraswati Puja Club",
            summary,
            contributions,
            expenses,
            })
        }
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          Export PDF
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <SummaryCard
          title="Total Collection"
          value={weeklyTotal + pujaTotal + donationTotal}
        />
        <SummaryCard
          title="Approved Expenses"
          value={approvedExpenses}
        />
        <SummaryCard title="Balance" value={centralFund} />
        <SummaryCard title="Donations" value={donationTotal} />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* PIE CHART */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-4">
            Contribution Breakdown
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={contributionData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {contributionData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* BAR CHART */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-4">
            Collection vs Expenses
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={balanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#6366F1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ===== SUMMARY CARD COMPONENT ===== */
function SummaryCard({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold text-indigo-600 mt-2">
        ₹ {value}
      </h3>
    </div>
  );
}
