import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { exportAuditLogsPDF } from "../utils/pdfExport"; 
import { 
  Loader2, Shield, Clock, User, Activity, Filter, ChevronLeft, ChevronRight, Download, Calendar
} from "lucide-react"; 

export default function AuditLogs() {
  const { activeClub } = useAuth(); 
  const [logs, setLogs] = useState([]);
  const [years, setYears] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  
  // Filter States
  const [filters, setFilters] = useState({
    action: "ALL",
    startDate: "",
    endDate: "",
    festivalYearId: "", 
    lastMonths: "1" 
  });

  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // 1. Fetch Festival Years & Set Active Year as Default
  useEffect(() => {
    const fetchYears = async () => {
        try {
            const res = await api.get("/years"); 
            if (res.data.success && Array.isArray(res.data.data)) {
                setYears(res.data.data);
                
                try {
                    const activeRes = await api.get("/years/active");
                    const activeYear = activeRes.data.data;
                    if (activeYear && activeYear._id) {
                        setFilters(prev => ({ 
                            ...prev, 
                            festivalYearId: activeYear._id,
                            lastMonths: "" 
                        }));
                    }
                } catch (err) {
                    console.error("Failed to load active year", err);
                }
            }
        } catch (err) {
            console.error("Failed to load years", err);
        }
    };
    fetchYears();
  }, []);

  // 2. Fetch Logs
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const queryParams = {
        page: pagination.page,
        limit: 15,
        ...(filters.action !== "ALL" && { action: filters.action }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.festivalYearId && { festivalYearId: filters.festivalYearId }),
        ...(filters.lastMonths && { lastMonths: filters.lastMonths }),
      };

      const query = new URLSearchParams(queryParams);
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
    let newFilters = { ...filters, [key]: value };

    // Clear conflicting filters logic
    if (key === 'festivalYearId' && value) {
        newFilters.startDate = '';
        newFilters.endDate = '';
        newFilters.lastMonths = '';
    } 
    else if (key === 'lastMonths' && value) {
        newFilters.startDate = '';
        newFilters.endDate = '';
        newFilters.festivalYearId = '';
    }
    else if ((key === 'startDate' || key === 'endDate') && value) {
        newFilters.festivalYearId = '';
        newFilters.lastMonths = '';
        
        if (key === 'startDate' && newFilters.endDate) {
            const start = new Date(value);
            const end = new Date(newFilters.endDate);
            const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
            if (diffDays > 90) newFilters.endDate = ''; 
        }
    }

    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getMaxEndDate = () => {
    if (!filters.startDate) return undefined;
    const date = new Date(filters.startDate);
    date.setDate(date.getDate() + 90);
    return date.toISOString().split('T')[0];
  };

  const sanitizeLogsForExport = (logList) => {
    const hiddenFields = [
        "subscriptionId", "installment", "memberId", "userId", 
        "expenseId", "club", "__v", "_id", "createdAt", "updatedAt"
    ];

    return logList.map(log => {
        const cleanDetails = {};
        if (log.details) {
            Object.entries(log.details).forEach(([key, val]) => {
                if (!hiddenFields.includes(key)) {
                    cleanDetails[key] = val;
                }
            });
        }
        return { ...log, details: cleanDetails };
    });
  };

  const getExportHeader = () => {
    if (filters.festivalYearId) {
        const y = years.find(y => y._id === filters.festivalYearId);
        if (y) return `Cycle: ${y.name} (${new Date(y.startDate).toLocaleDateString()} - ${new Date(y.endDate).toLocaleDateString()})`;
    }

    if (filters.startDate && filters.endDate) {
        const start = new Date(filters.startDate);
        const end = new Date(filters.endDate);
        const rangeStr = `${start.toLocaleDateString()} to ${end.toLocaleDateString()}`;

        const matchingYear = years.find(y => 
            start >= new Date(y.startDate) && end <= new Date(y.endDate)
        );
        
        if (matchingYear) {
            return `${rangeStr} (Cycle: ${matchingYear.name})`;
        }
        return rangeStr;
    }

    if (filters.lastMonths) return `Last ${filters.lastMonths} Months`;

    return "All Time";
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const queryParams = {
        page: 1,      
        limit: 10000, 
        ...(filters.action !== "ALL" && { action: filters.action }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.festivalYearId && { festivalYearId: filters.festivalYearId }),
        ...(filters.lastMonths && { lastMonths: filters.lastMonths }),
      };
      
      const query = new URLSearchParams(queryParams);
      const res = await api.get(`/audit?${query.toString()}`);
      
      if (!res.data.data || res.data.data.length === 0) {
        alert("No logs to export.");
        return;
      }

      const cleanLogs = sanitizeLogsForExport(res.data.data);
      const headerText = getExportHeader();

      exportAuditLogsPDF({
          clubName: activeClub?.clubName,
          logs: cleanLogs, 
          period: headerText
      });

    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export logs.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl shadow-lg">
             <Shield size={24} />
          </div>
          <div>
             <h1 className="text-2xl font-bold text-[var(--text-main)]">Audit Logs</h1>
             <p className="text-[var(--text-muted)] text-sm">Track all administrative actions.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="text-right text-sm text-[var(--text-muted)] hidden sm:block">
             Total Records: <span className="font-bold text-primary-600 dark:text-primary-400">{pagination.total}</span>
           </div>
           
           <button 
             onClick={handleExport}
             disabled={loading || exporting || pagination.total === 0}
             className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div className="bg-[var(--bg-card)] p-4 rounded-xl shadow-sm border border-[var(--border-color)] grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Action Type */}
        <div>
          <label className="text-xs font-bold text-[var(--text-muted)] uppercase block mb-1">Action Type</label>
          <select 
            className="w-full p-2 border border-[var(--border-color)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-[var(--bg-input)] text-[var(--text-main)]"
            value={filters.action}
            onChange={(e) => handleFilterChange("action", e.target.value)}
          >
            <option value="ALL">All Actions</option>
            <option value="YEAR_UPDATED">Settings Updated</option>
            <option value="PAYMENT_COLLECTED">Payment Collected</option>
            <option value="SUBSCRIPTION_PAY">Installment Paid</option>
            <option value="SUBSCRIPTION_UNDO">Payment Reverted</option>
            <option value="CREATE_EXPENSE_REQUEST">Expense Request</option>
            <option value="EXPENSE_APPROVED">Expense Approved</option>
            <option value="MEMBER_REMOVED">Member Removed</option>
          </select>
        </div>

        {/* Quick Range */}
        <div>
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase block mb-1">Quick Range</label>
            <select 
                className="w-full p-2 border border-[var(--border-color)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-[var(--bg-input)] text-[var(--text-main)]"
                value={filters.lastMonths}
                onChange={(e) => handleFilterChange("lastMonths", e.target.value)}
            >
                <option value="">Select Range...</option>
                <option value="1">Last 30 Days</option>
                <option value="3">Last 3 Months</option>
            </select>
        </div>

        {/* Festival Year */}
        <div>
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase block mb-1">Festival Cycle</label>
            <select 
                className="w-full p-2 border border-[var(--border-color)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-[var(--bg-input)] text-[var(--text-main)]"
                value={filters.festivalYearId}
                onChange={(e) => handleFilterChange("festivalYearId", e.target.value)}
            >
                <option value="">All Cycles</option>
                {years.map(y => (
                    <option key={y._id} value={y._id}>{y.name}</option>
                ))}
            </select>
        </div>

        {/* Reset */}
        <div className="flex items-end">
            <button 
                onClick={() => setFilters({ action: "ALL", startDate: "", endDate: "", festivalYearId: filters.festivalYearId, lastMonths: "" })}
                className="w-full px-4 py-2 text-sm text-red-500 dark:text-red-400 border border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition font-medium"
            >
                Reset Filters
            </button>
        </div>

        {/* Manual Date */}
        <div className="md:col-span-4 flex gap-4 items-center pt-2 border-t border-dashed border-[var(--border-color)] mt-2">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase flex items-center gap-1">
                <Calendar size={12}/> Custom Date Override (Max 3 Months):
            </span>
            <input 
                type="date" 
                className="p-1.5 border border-[var(--border-color)] rounded-md text-xs outline-none focus:ring-2 focus:ring-primary-500 bg-[var(--bg-input)] text-[var(--text-main)]"
                value={filters.startDate}
                max={filters.endDate || undefined}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
            />
            <span className="text-[var(--text-muted)]">-</span>
            <input 
                type="date" 
                className="p-1.5 border border-[var(--border-color)] rounded-md text-xs outline-none focus:ring-2 focus:ring-primary-500 bg-[var(--bg-input)] text-[var(--text-main)]"
                value={filters.endDate}
                min={filters.startDate || undefined}
                max={getMaxEndDate()}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                disabled={!filters.startDate}
            />
        </div>

      </div>

      {/* LOGS LIST */}
      <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center h-64 text-primary-600">
            <Loader2 className="animate-spin w-8 h-8" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-[var(--text-muted)]">
            <Filter className="w-12 h-12 mb-2 opacity-20"/>
            <p>No logs found matching your filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-color)]">
            {logs.map((log) => (
              <div key={log._id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex gap-4 group">
                <div className={`mt-1 p-2 rounded-lg shrink-0 h-fit ${getActionColor(log.action)}`}>
                   <Activity size={18} />
                </div>
                <div className="flex-1">
                   <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-[var(--text-main)] text-sm">{formatAction(log.action)}</h4>
                        <p className="text-sm text-[var(--text-muted)] mt-0.5">{log.target}</p>
                      </div>
                      <span className="text-xs font-mono text-slate-400 dark:text-slate-500 whitespace-nowrap flex items-center gap-1">
                        <Clock size={12}/> 
                        {new Date(log.createdAt).toLocaleDateString()} 
                        <span className="hidden sm:inline"> {new Date(log.createdAt).toLocaleTimeString()}</span>
                      </span>
                   </div>
                   <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-3 text-xs">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md w-fit">
                        <User size={12} />
                        <span className="font-medium">{log.actor?.name || "System"}</span>
                      </div>
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
            className="p-2 border border-[var(--border-color)] rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 text-[var(--text-main)]"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-sm font-medium text-[var(--text-muted)]">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button 
            disabled={pagination.page === pagination.pages}
            onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
            className="p-2 border border-[var(--border-color)] rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 text-[var(--text-main)]"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

// HELPERS
function formatAction(action) {
  return action?.replace(/_/g, " ")?.toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') || "Unknown Action";
}

function getActionColor(action) {
  const a = action?.toLowerCase() || "";
  if (a.includes("delete") || a.includes("remove") || a.includes("reject") || a.includes("undo")) 
    return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
  if (a.includes("update") || a.includes("edit")) 
    return "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400";
  if (a.includes("create") || a.includes("add") || a.includes("approve") || a.includes("start")) 
    return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400";
  if (a.includes("pay") || a.includes("fee") || a.includes("collect")) 
    return "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400";
  return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
}

function renderDetails(details) {
  const ignoredKeys = [
      "expenseId", "memberId", "userId", "_id", "club", 
      "subscriptionId", "installment", "__v", "createdAt", "updatedAt",
      "memberName"
  ];

  return Object.entries(details).map(([key, value]) => {
    if (ignoredKeys.includes(key) || value === null || value === undefined) return null;

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
      ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold px-1.5 py-0.5 rounded uppercase text-[10px]" 
      : "text-slate-700 dark:text-slate-300 font-medium";

    return (
      <span key={key} className="flex items-center text-[var(--text-muted)] bg-[var(--bg-card)] border border-[var(--border-color)] px-2 py-1 rounded-md shadow-sm text-xs">
        <span className="mr-1 opacity-70">{label}:</span>
        <span className={badgeClass}>{displayValue}</span>
      </span>
    );
  });
}