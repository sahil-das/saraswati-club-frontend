import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Save, AlertTriangle, CheckCircle, PlusCircle, Lock, Calculator } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [noActiveCycle, setNoActiveCycle] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    weeklyAmount: 0,
    totalWeeks: 52,
    openingBalance: "",
    isClosed: false,
  });

  /* ================= LOAD SETTINGS ================= */
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get("/settings");
      if (res.data.data) {
        const d = res.data.data;
        setNoActiveCycle(false);
        setFormData({
          name: d.name,
          startDate: d.startDate ? d.startDate.slice(0, 10) : "",
          endDate: d.endDate ? d.endDate.slice(0, 10) : "",
          weeklyAmount: d.weeklyAmount,
          totalWeeks: d.totalWeeks,
          openingBalance: d.openingBalance || "",
          isClosed: d.isClosed,
        });
      } else {
        setNoActiveCycle(true);
        // Default to today
        const today = new Date().toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, startDate: today }));
      }
    } catch (err) {
      setNoActiveCycle(true);
    }
  };

  /* ================= VALIDATION LOGIC ================= */
  const isValid = () => {
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setMessage({ type: "error", text: "End Date must be after Start Date" });
      return false;
    }
    if (formData.weeklyAmount < 0 || formData.totalWeeks < 0) {
      setMessage({ type: "error", text: "Amounts cannot be negative" });
      return false;
    }
    return true;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!isValid()) return;
    
    setLoading(true);
    try {
      await axios.put("/settings", formData);
      setMessage({ type: "success", text: "Settings updated successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Update failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!isValid()) return;

    setLoading(true);
    try {
      const res = await axios.post("/cycles/create", formData);
      alert(`Success! ${res.data.message}`);
      window.location.reload();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to create cycle" });
      setLoading(false);
    }
  };

  // ... (Keep handleCloseYear same as before) ...
  const handleCloseYear = async () => {
      const confirmText = prompt(
        "TYPE 'CLOSE' TO CONFIRM.\n\nThis will permanently FREEZE the current financial year and calculate the Closing Balance. This cannot be undone."
      );
  
      if (confirmText !== "CLOSE") return;
  
      try {
        setLoading(true);
        const res = await axios.post("/cycles/close");
        alert(res.data.message);
        window.location.reload(); 
      } catch (err) {
        alert(err.response?.data?.message || "Failed to close year");
        setLoading(false);
      }
    };

  // ✅ AUTO-CALCULATION
  const expectedPerMember = formData.weeklyAmount * formData.totalWeeks;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">System Settings</h2>
        <p className="text-gray-500 text-sm">
          {noActiveCycle ? "Start a new financial year." : "Manage active cycle configuration."}
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 shadow-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
          {message.type === "success" ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* FORM CARD */}
      <div className={`rounded-xl shadow border overflow-hidden ${noActiveCycle ? "bg-white border-indigo-100" : "bg-white border-gray-200"}`}>
        {/* Banner */}
        <div className={`px-6 py-4 border-b flex justify-between items-center ${noActiveCycle ? "bg-indigo-50" : "bg-gray-50"}`}>
          <h3 className={`font-bold flex items-center gap-2 ${noActiveCycle ? "text-indigo-700" : "text-gray-700"}`}>
            {noActiveCycle ? <PlusCircle size={20} /> : null}
            {noActiveCycle ? "New Cycle Setup" : "Active Cycle Configuration"}
          </h3>
          {!noActiveCycle && formData.isClosed && (
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-red-200">
              <Lock size={12} /> LOCKED
            </span>
          )}
        </div>

        <form onSubmit={noActiveCycle ? handleCreate : handleUpdate} className="p-6 space-y-6">
          {/* 1. Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cycle Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!noActiveCycle && formData.isClosed}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder='e.g., "Saraswati Puja 2026"'
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  disabled={!noActiveCycle && formData.isClosed}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">End Date</label>
                <input
                  type="date"
                  min={formData.startDate} // ✅ HTML VALIDATION
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  disabled={!noActiveCycle && formData.isClosed}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
            </div>
          </div>

          <hr className="border-dashed" />

          {/* 2. Financials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Weekly Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.weeklyAmount}
                  onChange={(e) => setFormData({ ...formData, weeklyAmount: e.target.value })}
                  disabled={!noActiveCycle && formData.isClosed}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-gray-700"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Weeks</label>
                <input
                  type="number"
                  min="1"
                  max="52"
                  value={formData.totalWeeks}
                  onChange={(e) => setFormData({ ...formData, totalWeeks: e.target.value })}
                  disabled={!noActiveCycle && formData.isClosed}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
            </div>

            {/* ✅ DYNAMIC PREVIEW BOX */}
            <div className="bg-indigo-50 rounded-xl p-4 flex flex-col justify-center border border-indigo-100">
               <div className="flex items-center gap-2 text-indigo-800 font-semibold mb-2">
                 <Calculator size={18} /> Projection
               </div>
               <p className="text-sm text-indigo-600">Expected Per Member:</p>
               <p className="text-2xl font-bold text-indigo-700">₹ {expectedPerMember}</p>
               <p className="text-xs text-indigo-400 mt-1">Total collectable from one person</p>
            </div>
          </div>

          {/* 3. Opening Balance (New Cycle Only) */}
          {noActiveCycle && (
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
              <label className="block text-xs font-bold text-yellow-700 uppercase mb-1">Opening Balance Override</label>
              <input
                type="number"
                value={formData.openingBalance}
                onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                className="w-full border border-yellow-300 rounded-lg px-3 py-2 bg-white"
                placeholder="Leave blank to use Previous Closing Balance"
              />
              <p className="text-xs text-yellow-600 mt-2">
                * By default, the system automatically fetches the <b>Closing Balance</b> from the last closed year.
              </p>
            </div>
          )}

          {/* Submit */}
          <div className="pt-2">
            {!formData.isClosed && (
               <button
               type="submit"
               disabled={loading}
               className={`w-full py-3 rounded-lg font-bold text-white shadow-md transition-transform active:scale-95 flex justify-center gap-2 ${noActiveCycle ? "bg-indigo-600 hover:bg-indigo-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
             >
               {noActiveCycle ? <PlusCircle size={20} /> : <Save size={20} />}
               {noActiveCycle ? "Create New Financial Cycle" : "Save Changes"}
             </button>
            )}
           
          </div>
        </form>
      </div>

      {/* DANGER ZONE */}
      {!noActiveCycle && !formData.isClosed && (
        <div className="border border-red-200 rounded-xl p-6 bg-white shadow-sm">
          <h3 className="text-red-700 font-bold flex items-center gap-2 mb-2">
            <AlertTriangle size={20} /> Close Financial Year
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Permanently freeze this cycle and calculate closing balance. This action cannot be undone.
          </p>
          <button onClick={handleCloseYear} disabled={loading} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-semibold hover:bg-red-100 transition">
            Close Year Permanently
          </button>
        </div>
      )}
    </div>
  );
}