// src/context/FinanceContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [pujaTotal, setPujaTotal] = useState(0);
  const [donationTotal, setDonationTotal] = useState(0);
  const [approvedExpenses, setApprovedExpenses] = useState(0);

  const centralFund =
    weeklyTotal + pujaTotal + donationTotal - approvedExpenses;

  /* ===== FETCH ALL TOTALS ===== */
  const fetchCentralFund = async () => {
    try {
      const [
        weeklyRes,
        pujaRes,
        donationRes,
        expenseRes,
      ] = await Promise.all([
        api.get("/finance/weekly-total"),
        api.get("/finance/puja-total"),        // ✅ ADD THIS
        api.get("/finance/donations-total"),
        api.get("/finance/expenses-total"),
      ]);

      setWeeklyTotal(weeklyRes.data.total || 0);
      setPujaTotal(pujaRes.data.total || 0);  // ✅ FIX
      setDonationTotal(donationRes.data.total || 0);
      setApprovedExpenses(expenseRes.data.total || 0);
    } catch (err) {
      console.error("Finance fetch error", err);
    }
  };

  useEffect(() => {
    fetchCentralFund();
  }, []);

  return (
    <FinanceContext.Provider
      value={{
        weeklyTotal,
        pujaTotal,          // ✅ PROVIDE IT
        donationTotal,
        approvedExpenses,
        centralFund,
        fetchCentralFund,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => useContext(FinanceContext);
