import {
  Wallet,
  IndianRupee,
  TrendingUp,
  FileText,
  BarChart3,
  PlusCircle,
  Users,
} from "lucide-react";
import { useFinance } from "../context/FinanceContext";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useYear } from "../context/YearContext";

export default function DashboardHome() {
  const {
    weeklyTotal,
    pujaTotal,
    donationTotal,
    approvedExpenses,
    centralFund,
    openingBalance,
  } = useFinance();

  const { user } = useAuth();
  const { year } = useYear();

  const totalCollection =
    (weeklyTotal || 0) +
    (pujaTotal || 0) +
    (donationTotal || 0);

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome, {user.role === "admin" ? "Admin" : "Member"}
          </h1>
          <p className="text-gray-500 text-sm">
            Saraswati Puja Committee Dashboard
          </p>
        </div>

        <div className="text-right text-sm">
          <p className="text-gray-500">
            Financial Year: <span className="font-semibold text-gray-800">{year}</span>
          </p>
          <p className="text-gray-500 mt-1">
            Opening Balance: <span className="font-semibold text-green-600">₹ {openingBalance}</span>
          </p>
        </div>
      </div>

      {/* KPI CARDS (UPDATED LINKS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Central Balance"
          value={centralFund}
          icon={<Wallet />}
          color="bg-green-600"
          to="/reports" 
          subtitle={`Includes ₹${openingBalance} opening`} 
        />

        <StatCard
          title="Total Collection"
          value={totalCollection}
          icon={<IndianRupee />}
          color="bg-indigo-600"
          to="/collections" 
          subtitle="This year's revenue"
        />

        <StatCard
          title="Approved Expenses"
          value={approvedExpenses}
          icon={<FileText />}
          color="bg-red-500"
          to="/expenses" 
          subtitle="View details"
        />

        <StatCard
          title="Donations"
          value={donationTotal}
          icon={<TrendingUp />}
          color="bg-yellow-500"
          to="/donations" 
          subtitle="Member & outside"
        />
      </div>

      {/* QUICK ACTIONS (UPDATED LINKS) */}
      {user.role === "admin" && (
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold mb-4">
            Quick Actions
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <QuickAction
              label="Add Weekly"
              icon={<PlusCircle />}
              to="/weekly" 
            />

            <QuickAction
              label="Puja Contribution"
              icon={<Users />}
              to="/puja-contributions" 
            />

            <QuickAction
              label="Add Donation"
              icon={<TrendingUp />}
              to="/donations" 
            />

            <QuickAction
              label="Add Expense"
              icon={<FileText />}
              to="/expenses" 
            />

            <QuickAction
              label="Collections"
              icon={<BarChart3 />}
              to="/collections" 
            />
          </div>
        </div>
      )}

      {/* REPORTS SHORTCUT (UPDATED LINK) */}
      {user.role === "admin" && (
        <Link
          to="/reports" 
          className="bg-white rounded-xl shadow p-6 flex items-center gap-4
                     hover:bg-indigo-50 transition"
        >
          <div className="bg-indigo-600 text-white p-3 rounded-lg">
            <BarChart3 />
          </div>
          <div>
            <h3 className="font-semibold">
              Financial Reports
            </h3>
            <p className="text-sm text-gray-500">
              Source-wise collection & expenses
            </p>
          </div>
        </Link>
      )}
    </div>
  );
}

/* ================= COMPONENTS (Unchanged) ================= */

function StatCard({ title, value, icon, color, to, subtitle }) {
  return (
    <Link
      to={to}
      className="bg-white rounded-xl shadow p-5 flex items-center gap-4
                 hover:shadow-lg hover:scale-[1.02] transition cursor-pointer"
    >
      <div className={`${color} text-white p-3 rounded-lg`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-xl font-bold">₹ {value}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </Link>
  );
}

function QuickAction({ label, icon, to }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center justify-center gap-2
                 border rounded-lg p-4 hover:bg-indigo-50 transition
                 text-gray-700 hover:text-indigo-600"
    >
      <div className="text-indigo-600">{icon}</div>
      <span className="text-sm font-medium text-center">{label}</span>
    </Link>
  );
}