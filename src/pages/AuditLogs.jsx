import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { exportAuditLogsPDF } from "../utils/pdfExport"; 
import { 
  Loader2, Shield, Clock, User, Activity, Filter, ChevronLeft, ChevronRight, Download 
} from "lucide-react"; 

export default function AuditLogs() {
  const { activeClub } = useAuth(); 
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false); // ✅ NEW: Export Loading State
  
  // Filter States
  const [filters, setFilters] = useState({
    action: "ALL",
    startDate: "",
    endDate: ""
  });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: pagination.page,
        limit: 15, // View Limit
        ...(filters.action !== "ALL" && { action: filters.action }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      });

      const res = await api.get(`/audit?${query.toString()}`);
      setLogs(res.data.data);
      setPagination(prev => ({ ...prev, ...res.data.pagination }));
    } catch (err) {
      console.error("Failed to load logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // ✅ FIXED: Fetch ALL logs for Export
  const handleExport = async () => {
    setExporting(true);
    try {
      // 1. Create a query that fetches EVERYTHING (Limit 10,000)
      const query = new URLSearchParams({
        page: 1,      
        limit: 10000, // 👈 Fetches all records matching filters
        ...(filters.action !== "ALL" && { action: filters.action }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      });

      // 2. Call API
      const res = await api.get(`/audit?${query.toString()}`);
      const fullLogList = res.data.data;

      if (!fullLogList || fullLogList.length === 0) {
        alert("No logs to export.");
        return;
      }

      // 3. Generate PDF with the FULL list
      const periodStr = filters.startDate && filters.endDate 
          ? `${new Date(filters.startDate).toLocaleDateString()} to ${new Date(filters.endDate).toLocaleDateString()}` 
          : "All Time";

      exportAuditLogsPDF({
          clubName: activeClub?.clubName,
          logs: fullLogList, // ✅ Now passes all records, not just the visible 15
          period: periodStr
      });

    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export logs. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gray-900 text-white rounded-xl shadow-lg">
             <Shield size={24} />
          </div>
          <div>
             <h1 className="text-2xl font-bold text-gray-800">Audit Logs</h1>
             <p className="text-gray-500 text-sm">Track all administrative actions.</p>
          </div>
        </div>

        {/* ✅ EXPORT BUTTON AREA */}
        <div className="flex items-center gap-3">
           <div className="text-right text-sm text-gray-500 hidden sm:block">
             Total Records: <span className="font-bold text-indigo-600">{pagination.total}</span>
           </div>
           
           <button 
             onClick={handleExport}
             disabled={loading || exporting || pagination.total === 0}
             className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {exporting ? (
               <><Loader2 size={16} className="animate-spin" /> Generating...</>
             ) : (
               <><Download size={16} /> Export PDF</>
             )}
           </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-end md:items-center">
        <div className="w-full md:w-auto">
          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Action Type</label>
          <select 
            className="w-full md:w-48 p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            value={filters.action}
            onChange={(e) => handleFilterChange("action", e.target.value)}
          >
            <option value="ALL">All Actions</option>
            <option value="YEAR_UPDATED">Settings Updated</option>
            <option value="PAYMENT_COLLECTED">Payment Collected</option>
            <option value="CREATE_EXPENSE_REQUEST">Expense Request</option>
            <option value="EXPENSE_APPROVED">Expense Approved</option>
            <option value="DELETE_EXPENSE">Expense Deleted</option>
            <option value="MEMBER_REMOVED">Member Removed</option>
          </select>
        </div>

        <div className="w-full md:w-auto">
          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Start Date</label>
          <input 
            type="date" 
            className="w-full md:w-40 p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            value={filters.startDate}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
          />
        </div>

        <div className="w-full md:w-auto">
          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">End Date</label>
          <input 
            type="date" 
            className="w-full md:w-40 p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            value={filters.endDate}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
          />
        </div>

        <button 
          onClick={() => setFilters({ action: "ALL", startDate: "", endDate: "" })}
          className="ml-auto px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition"
        >
          Reset Filters
        </button>
      </div>

      {/* LOGS LIST */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center h-64 text-indigo-600">
            <Loader2 className="animate-spin w-8 h-8" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Filter className="w-12 h-12 mb-2 opacity-20"/>
            <p>No logs found matching your filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {logs.map((log) => (
              <div key={log._id} className="p-5 hover:bg-gray-50 transition-colors flex gap-4 group">
                
                {/* Icon */}
                <div className={`mt-1 p-2 rounded-lg shrink-0 h-fit ${getActionColor(log.action)}`}>
                   <Activity size={18} />
                </div>

                {/* Main Content */}
                <div className="flex-1">
                   <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm">
                          {formatAction(log.action)}
                        </h4>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {log.target}
                        </p>
                      </div>
                      <span className="text-xs font-mono text-gray-400 whitespace-nowrap flex items-center gap-1">
                        <Clock size={12}/> 
                        {new Date(log.createdAt).toLocaleDateString()} 
                        <span className="hidden sm:inline"> {new Date(log.createdAt).toLocaleTimeString()}</span>
                      </span>
                   </div>

                   {/* User & Details */}
                   <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-3 text-xs">
                      <div className="flex items-center gap-2 text-gray-500 bg-gray-100 px-2 py-1 rounded-md w-fit">
                        <User size={12} />
                        <span className="font-medium">{log.actor?.name || "System"}</span>
                      </div>
                      
                      {/* Details Renderer */}
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="flex flex-wrap gap-2 items-center">
                           {renderDetails(log.details)}
                        </div>
                      )}
                   </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <button 
            disabled={pagination.page === 1}
            onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
            className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="px-4 py-2 bg-white border rounded-lg text-sm font-medium text-gray-600">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button 
            disabled={pagination.page === pagination.pages}
            onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
            className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

    </div>
  );
}

// ----------------------------------------------------------------------
// HELPER FUNCTIONS
// ----------------------------------------------------------------------

function formatAction(action) {
  return action?.replace(/_/g, " ")?.toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') || "Unknown Action";
}

function getActionColor(action) {
  const a = action?.toLowerCase() || "";
  if (a.includes("delete") || a.includes("remove") || a.includes("reject")) return "bg-red-100 text-red-600";
  if (a.includes("update") || a.includes("edit")) return "bg-orange-100 text-orange-600";
  if (a.includes("create") || a.includes("add") || a.includes("approve") || a.includes("start")) return "bg-emerald-100 text-emerald-600";
  if (a.includes("pay") || a.includes("fee") || a.includes("collect")) return "bg-indigo-100 text-indigo-600";
  return "bg-gray-100 text-gray-600";
}

function renderDetails(details) {
  const ignoredKeys = ["expenseId", "memberId", "userId", "_id", "club"];

  return Object.entries(details).map(([key, value]) => {
    if (ignoredKeys.includes(key) || value === null || value === undefined) return null;

    // Hide 'totalWeeks' if frequency is not weekly
    if (key === "totalWeeks") {
      const freq = details.frequency || details.newFreq; 
      if (freq && freq !== "weekly") return null; 
    }

    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

    let displayValue = value;
    if (key.toLowerCase().includes("amount") || key.toLowerCase().includes("balance")) {
      displayValue = `₹${value}`;
    }
    
    const isStatus = key.toLowerCase().includes("status") || key.toLowerCase().includes("role") || key.toLowerCase().includes("frequency");
    const badgeClass = isStatus 
      ? "bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded uppercase text-[10px]" 
      : "text-gray-700 font-medium";

    return (
      <span key={key} className="flex items-center text-gray-500 bg-white border border-gray-200 px-2 py-1 rounded-md shadow-sm">
        <span className="mr-1 opacity-70">{label}:</span>
        <span className={badgeClass}>{displayValue}</span>
      </span>
    );
  });
}