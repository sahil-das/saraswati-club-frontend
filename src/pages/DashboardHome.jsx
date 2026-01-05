import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext"; 
import CreateYearModal from "../components/CreateYearModal";
import AddExpenseModal from "../components/AddExpenseModal"; 
import AddDonationModal from "../components/AddDonationModal"; 
import AddMemberModal from "../components/AddMemberModal"; 
import AddPujaModal from "../components/AddPujaModal"; 
import NoticeBoard from "../components/NoticeBoard"; 

import { 
  Loader2, Wallet, TrendingUp, TrendingDown, PiggyBank, Calendar,
  IndianRupee, Lock, PlusCircle, Sparkles, Receipt, UserPlus, Zap
} from "lucide-react";

export default function DashboardHome() {
  // Use hook-based accessors exported by your contexts
  const { user, activeClub } = useAuth();
  const {
    // adapt to what your FinanceContext provides — using the exported names I saw:
    weeklyTotal,
    pujaTotal,
    donationTotal,
    approvedExpenses,
    openingBalance,
    centralFund,
    loading,
    // If you have a combined `recentActivities` or totals object, replace accordingly.
    // e.g., const { totals, recentActivities } = useFinance();
  } = useFinance();

  // If you prefer a totals object similar to my earlier example, compose it here:
  const totals = {
    collections: weeklyTotal + pujaTotal + donationTotal,
    expenses: approvedExpenses,
    balance: centralFund ?? openingBalance,
  };

  const recentActivities = []; // <-- Replace with actual data from your FinanceContext if present

  const showSkeleton = useSkeleton(loading);

  return (
    <div className="space-y-8 pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">Financial Overview</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm">
            <Calendar size={16} /> Current Cycle: 
            <span className="font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-xs uppercase tracking-wide">{data?.yearName}</span>
          </p>
        </div>
      </div>

      {/* MAIN STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Total Income" amount={data?.totalIncome} icon={<TrendingUp size={24} />} color="bg-emerald-50 text-emerald-600 border-emerald-100"/>
        <StatCard title="Total Expenses" amount={data?.totalExpense} icon={<TrendingDown size={24} />} color="bg-rose-50 text-rose-600 border-rose-100"/>
        <StatCard title="Available Balance" amount={data?.balance} icon={<Wallet size={24} />} color="bg-indigo-600 text-white shadow-indigo-200 shadow-xl ring-2 ring-indigo-600 ring-offset-2" isPrimary/>
        <StatCard title="Opening Balance" amount={data?.openingBalance} icon={<PiggyBank size={24} />} color="bg-gray-50 text-gray-600 border-gray-200"/>
      </div>
      {/* ✅ NEW: Notice Board Widget */}
          <NoticeBoard />
      {/* QUICK ACTIONS BAR */}
      <div>
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
           <Zap size={16}/> Quick Actions
        </h3>
        <div className="flex flex-wrap gap-4">
           {/* Add Expense (All) */}
           <button 
             onClick={() => setShowExpense(true)}
             className="flex items-center gap-3 px-5 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-rose-200 hover:bg-rose-50 transition-all group"
           >
              <div className="p-2 bg-rose-100 text-rose-600 rounded-lg group-hover:bg-rose-200 transition-colors">
                 <TrendingDown size={20} />
              </div>
              <div className="text-left">
                 <p className="text-sm font-bold text-gray-700 group-hover:text-rose-700">Record Expense</p>
                 <p className="text-[10px] text-gray-400">Add bill or voucher</p>
              </div>
           </button>

           {/* Add Donation (All) */}
           <button 
             onClick={() => setShowDonation(true)}
             className="flex items-center gap-3 px-5 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-amber-200 hover:bg-amber-50 transition-all group"
           >
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg group-hover:bg-amber-200 transition-colors">
                 <Receipt size={20} />
              </div>
              <div className="text-left">
                 <p className="text-sm font-bold text-gray-700 group-hover:text-amber-700">Record Donation</p>
                 <p className="text-[10px] text-gray-400">Public collection</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
