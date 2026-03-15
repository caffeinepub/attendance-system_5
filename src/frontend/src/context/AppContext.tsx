import { createContext, useContext, useState } from "react";
import type { Employee } from "../backend.d";

interface AppContextType {
  currentEmployee: Employee | null;
  setCurrentEmployee: (emp: Employee | null) => void;
}

const AppContext = createContext<AppContextType>({
  currentEmployee: null,
  setCurrentEmployee: () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  return (
    <AppContext.Provider value={{ currentEmployee, setCurrentEmployee }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
