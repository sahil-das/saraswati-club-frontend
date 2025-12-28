import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DashboardHome from "./pages/DashboardHome";
import Members from "./pages/Members";
import Contributions from "./pages/Contributions";
import Expenses from "./pages/Expenses";
import { FinanceProvider } from "./context/FinanceContext";
import Reports from "./pages/Reports";
import WeeklyContributions from "./pages/WeeklyContributions";
import Donations from "./pages/Donations";
import MemberDetails from "./pages/MemberDetails";
import CollectionsOverview from "./pages/CollectionsOverview";
import PujaContributions from "./pages/PujaContributions";
import History from "./pages/History";
export default function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <BrowserRouter>
          <Routes>
            {/* Login */}
            <Route path="/login" element={<Login />} />

            {/* Dashboard Home */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard>
                    <DashboardHome />
                  </Dashboard>
                </ProtectedRoute>
              }
            />

            {/* Members (Admin only) */}
            <Route
              path="/dashboard/members"
              element={
                <ProtectedRoute role="admin">
                  <Dashboard>
                    <Members />
                  </Dashboard>
                </ProtectedRoute>
              }
            />

           <Route
              path="/dashboard/collections"
              element={
                <ProtectedRoute>
                  <Dashboard>
                    <CollectionsOverview />
                  </Dashboard>
                </ProtectedRoute>
              }
            />
            <Route 
              path="/dashboard/history"
              element={
                <ProtectedRoute>
                  <Dashboard>
                    <History />
                  </Dashboard>
                </ProtectedRoute>
              }/>
            
            <Route
              path="/dashboard/puja-contributions"
              element={
                <ProtectedRoute>
                  <Dashboard>
                    <PujaContributions />
                  </Dashboard>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/expenses"
              element={
                <ProtectedRoute>
                  <Dashboard>
                    <Expenses />
                  </Dashboard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/members/:memberId"
              element={
                <ProtectedRoute role="admin">
                  <Dashboard>
                    <MemberDetails />
                  </Dashboard>
                </ProtectedRoute>
              }
            />


          <Route
            path="/dashboard/reports"
            element={
              <ProtectedRoute role="admin">
                <Dashboard>
                  <Reports />
                </Dashboard>
              </ProtectedRoute>
            }
          />
            {/* Contributions */}
            <Route
              path="/dashboard/contributions"
              element={
                <ProtectedRoute>
                  <Dashboard>
                    <Contributions />
                  </Dashboard>
                </ProtectedRoute>
              }
            />
          <Route
            path="/dashboard/weekly"
            element={
              <ProtectedRoute>
                <Dashboard>
                  <WeeklyContributions />
                </Dashboard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/donations"
            element={
              <ProtectedRoute>
                <Dashboard>
                  <Donations />
                </Dashboard>
              </ProtectedRoute>
            }
          />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </BrowserRouter>
      </FinanceProvider>
    </AuthProvider>
  );
}
