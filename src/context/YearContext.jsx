import { createContext, useContext, useState } from "react";

const YearContext = createContext();

export function YearProvider({ children }) {
  const [year, setYear] = useState(2025); // current year

  const availableYears = [2023, 2024, 2025];

  return (
    <YearContext.Provider
      value={{ year, setYear, availableYears }}
    >
      {children}
    </YearContext.Provider>
  );
}

export function useYear() {
  return useContext(YearContext);
}
