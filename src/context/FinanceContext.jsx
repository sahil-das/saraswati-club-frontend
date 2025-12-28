import { createContext, useContext, useMemo, useState } from "react";

const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
  // Contributions
  const [weeklyTotal, setWeeklyTotal] = useState(25000);
  const [pujaTotal, setPujaTotal] = useState(12000);
  const [donationTotal, setDonationTotal] = useState(8500);

  // Expenses
  const [approvedExpenses, setApprovedExpenses] = useState(30000);

  const centralFund = useMemo(() => {
    return weeklyTotal + pujaTotal + donationTotal - approvedExpenses;
  }, [weeklyTotal, pujaTotal, donationTotal, approvedExpenses]);

  return (
    <FinanceContext.Provider
      value={{
        weeklyTotal,
        pujaTotal,
        donationTotal,
        approvedExpenses,
        centralFund,
        setWeeklyTotal,
        setPujaTotal,
        setDonationTotal,
        setApprovedExpenses,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => useContext(FinanceContext);
