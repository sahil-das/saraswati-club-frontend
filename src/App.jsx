import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Providers & Components
import { AuthProvider } from "./context/AuthContext";
import { FinanceProvider } from "./context/FinanceContext"; 
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute"; // 👈 IMPORT THIS
import RequireSubscription from "./components/RequireSubscription";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard"; 
import DashboardHome from "./pages/DashboardHome";
import UserProfile from "./pages/UserProfile";
import Settings from "./pages/Settings";
import CollectionsOverview from "./pages/CollectionsOverview";
import Contributions from "./pages/Contributions";
import PujaContributions from "./pages/PujaContributions";
import Donations from "./pages/Donations";
import Expenses from "./pages/Expenses";
import Members from "./pages/Members";
import MemberDetails from "./pages/MemberDetails";
import Reports from "./pages/Reports";
import RegisterClub from "./pages/RegisterClub";
import AuditLogs from "./pages/AuditLogs";
import Archives from "./pages/Archives";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              
              {/* 🟢 PUBLIC ROUTES (Redirects to Dashboard if already logged in) */}
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<RegisterClub />} />
              </Route>

              {/* 🔒 PROTECTED ROUTES (Accessible only if logged in) */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <FinanceProvider>
                      <Dashboard />
                    </FinanceProvider>
                  </ProtectedRoute>
                }
              >
                
                <Route index element={<DashboardHome />} />
                <Route path="profile" element={<UserProfile />} />

                {/* ✅ AVAILABLE TO EVERYONE */}
                <Route path="puja-contributions" element={<PujaContributions />} />
                <Route path="collections" element={<CollectionsOverview />} />
                <Route path="donations" element={<Donations />} />
                <Route path="expenses" element={<Expenses />} />
                <Route path="archives" element={<Archives />} />
                
                {/* 🚨 Members is open to all (Privacy logic inside) */}
                <Route path="members" element={<Members />} />

                {/* 🔒 SUBSCRIPTIONS (Blocked if 'None') */}
                <Route element={<RequireSubscription />}>
                  <Route path="contributions" element={<Contributions />} />
                </Route>

                {/* --- 🔒 ADMIN ONLY --- */}
                <Route path="members/:memberId" element={<ProtectedRoute role="admin"><MemberDetails /></ProtectedRoute>} />
                <Route path="reports" element={<ProtectedRoute role="admin"><Reports /></ProtectedRoute>} />
                <Route path="settings" element={<ProtectedRoute role="admin"><Settings /></ProtectedRoute>} />
                <Route path="audit-logs" element={<ProtectedRoute role="admin"><AuditLogs /></ProtectedRoute>} />
              </Route>

              {/* 404 Not Found */}
              <Route path="*" element={<NotFound />} />

            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}