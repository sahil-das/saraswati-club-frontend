import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { 
  Save, AlertTriangle, CheckCircle, PlusCircle, Lock, Calculator, Calendar, 
  Loader2, Edit3, X, Clock, Coins, Info 
} from "lucide-react";

export default function Settings() {
  const { activeClub } = useAuth(); 
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  
  // UI States
  const [isEditing, setIsEditing] = useState(false);
  
  // Data States
  const [activeYearId, setActiveYearId] = useState(null);
  const [noActiveCycle, setNoActiveCycle] = useState(false);
  const [hasExistingPayments, setHasExistingPayments] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    subscriptionFrequency: "weekly",
    amountPerInstallment: 0,
    totalInstallments: 52,
    openingBalance: 0,
  });

  /* ================= LOAD SETTINGS ================= */
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/years/active");
      const d = res.data.data;
      
      const financeRes = await api.get("/finance/summary");
      const collectedAmount = financeRes.data.data.weeklyTotal || 0;

      if (d) {
        setNoActiveCycle(false);
        setActiveYearId(d._id);
        setHasExistingPayments(collectedAmount > 0);
        setIsEditing(false);
        
        setFormData({
          name: d.name,
          startDate: d.startDate ? d.startDate.slice(0, 10) : "",
          endDate: d.endDate ? d.endDate.slice(0, 10) : "",
          subscriptionFrequency: d.subscriptionFrequency || "weekly",
          amountPerInstallment: d.amountPerInstallment || 0,
          totalInstallments: d.totalInstallments || 52,
          openingBalance: d.openingBalance || 0,
        });
      }
    } catch (err) {
      setNoActiveCycle(true);
      setIsEditing(true); 
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, startDate: today, name: `New Year ${new Date().getFullYear()}` }));
    } finally {
      setLoading(false);
    }
  };

  /* ================= HANDLERS ================= */
  const handleFrequencyChange = (newFreq) => {
    let newInstallments = formData.totalInstallments;
    if (newFreq === 'weekly') newInstallments = 52;
    if (newFreq === 'monthly') newInstallments = 12;
    if (newFreq === 'none') newInstallments = 0;

    setFormData({ 
        ...formData, 
        subscriptionFrequency: newFreq,
        totalInstallments: newInstallments 
    });
  };

  const isValid = () => {
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setMessage({ type: "error", text: "End Date must be after Start Date" });
      return false;
    }
    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isValid()) return;
    if (activeClub?.role !== 'admin') return alert("Admins Only");

    setLoading(true);
    try {
      if (noActiveCycle) {
        await api.post("/years", formData);
        alert("New Festival Year Started!");
      } else {
        await api.put(`/years/${activeYearId}`, formData);
        setMessage({ type: "success", text: "Settings updated successfully!" });
      }
      window.location.reload();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Operation failed" });
      setLoading(false);
    }
  };

  const handleCloseYear = async () => {
    if (activeClub?.role !== 'admin') return;
    const confirmText = prompt("TYPE 'CLOSE' TO CONFIRM.\n\nThis will FREEZE the current financial year.");
    if (confirmText !== "CLOSE") return;

    try {
      setLoading(true);
      await api.post(`/years/${activeYearId}/close`);
      alert("Year Closed Successfully.");
      window.location.reload(); 
    } catch (err) {
      alert("Failed to close year");
      setLoading(false);
    }
  };

  // Helper for Display Label
  const getFrequencyLabel = (freq) => {
    if (freq === 'weekly') return 'Weekly Subscription';
    if (freq === 'monthly') return 'Monthly Subscription';
    return 'Donation Based (No Recurring)';
  };

  const totalExpected = formData.amountPerInstallment * formData.totalInstallments;

  if (loading && !formData.name) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600"/></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">System Settings</h2>
          <p className="text-gray-500 text-sm">
            {noActiveCycle ? "Setup a new financial year." : "Manage active cycle configuration."}
          </p>
        </div>
        
        {!noActiveCycle && !isEditing && activeClub?.role === "admin" && (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
          >
            <Edit3 size={18} /> Edit Configuration
          </button>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 shadow-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
          {message.type === "success" ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* ==================== VIEW MODE (READ ONLY) ==================== */}
      {!isEditing && !noActiveCycle && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
          
          <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-100">
             <div className="flex items-center gap-3 mb-2">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200 uppercase tracking-wider">
                  Active
                </span>
                <span className="text-gray-400 text-sm font-medium flex items-center gap-1">
                   <Clock size={14}/> {new Date(formData.startDate).getFullYear()}
                </span>
             </div>
             <h1 className="text-3xl font-bold text-gray-800">{formData.name}</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* Left: Details */}
            <div className="p-8 space-y-6 border-r border-gray-100">
               <div>
                  <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Duration</label>
                  <div className="flex items-center gap-2 text-gray-700 font-medium">
                     <Calendar size={18} className="text-indigo-600"/>
                     {new Date(formData.startDate).toLocaleDateString()} 
                     <span className="text-gray-400 mx-2">➝</span>
                     {new Date(formData.endDate).toLocaleDateString()}
                  </div>
               </div>

               <div>
                  <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Collection Rule</label>
                  <p className="text-lg font-bold text-gray-800 flex items-center gap-2">
                     {getFrequencyLabel(formData.subscriptionFrequency)}
                  </p>
                  {formData.subscriptionFrequency !== 'none' && (
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.totalInstallments} installments of <span className="text-indigo-600 font-bold">₹{formData.amountPerInstallment}</span> each.
                    </p>
                  )}
               </div>

               {/* Only show Projection if NOT 'none' */}
               {formData.subscriptionFrequency !== 'none' && (
                 <div>
                    <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Total Projected Fund</label>
                    <div className="flex items-center gap-2 text-2xl font-bold text-indigo-700">
                       <Coins size={24}/> ₹ {totalExpected.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Target per member per year</p>
                 </div>
               )}
            </div>

            {/* Right: Actions */}
            <div className="p-8 bg-gray-50/50 flex flex-col justify-between">
                <div>
                   <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                     <Lock size={16}/> Administration
                   </h4>
                   <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                     The current financial year is active. Collections are being recorded under this configuration. 
                     Switch to Edit Mode to modify rules.
                   </p>
                </div>
                
                {activeClub?.role === "admin" && (
                   <div className="border-t border-gray-200 pt-6 mt-6">
                      <button 
                        onClick={handleCloseYear} 
                        className="w-full py-3 bg-white border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition shadow-sm text-sm"
                      >
                        End Financial Year (Close)
                      </button>
                      <p className="text-xs text-center text-gray-400 mt-3">
                        Irreversible action. Freezes all data.
                      </p>
                   </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== EDIT MODE (FORM) ==================== */}
      {(isEditing || noActiveCycle) && (
        <div className={`rounded-2xl shadow-sm border overflow-hidden bg-white ${noActiveCycle ? "border-indigo-200" : "border-amber-200"}`}>
          
          <div className={`px-6 py-4 border-b flex justify-between items-center ${noActiveCycle ? "bg-indigo-50" : "bg-amber-50"}`}>
            <h3 className={`font-bold flex items-center gap-2 ${noActiveCycle ? "text-indigo-700" : "text-amber-800"}`}>
              {noActiveCycle ? <PlusCircle size={20} /> : <Edit3 size={20} />}
              {noActiveCycle ? "Setup New Year" : "Edit Configuration"}
            </h3>
            {!noActiveCycle && (
              <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-800">
                <X size={20}/>
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-6">
            
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Event Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">End Date</label>
                  <input
                    type="date"
                    min={formData.startDate} 
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
              </div>
            </div>

            <hr className="border-dashed" />

            {/* Collection Rules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                 <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-1">
                       Frequency
                       {hasExistingPayments && !noActiveCycle && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded flex items-center gap-1 font-medium"><Lock size={10} /> Locked</span>}
                    </label>
                    <div className="relative">
                      <select 
                          value={formData.subscriptionFrequency}
                          onChange={(e) => handleFrequencyChange(e.target.value)}
                          disabled={hasExistingPayments && !noActiveCycle}
                          className={`w-full border rounded-lg px-3 py-2 outline-none appearance-none ${hasExistingPayments && !noActiveCycle ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white border-gray-300"}`}
                      >
                          <option value="weekly">Weekly Collection</option>
                          <option value="monthly">Monthly Collection</option>
                          <option value="none">No Recurring (Donations Only)</option>
                      </select>
                    </div>
                 </div>

                 {formData.subscriptionFrequency !== 'none' && (
                   <>
                     <div className="relative">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Amount (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.amountPerInstallment}
                        onChange={(e) => setFormData({ ...formData, amountPerInstallment: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none font-bold text-gray-700 focus:ring-2 focus:ring-amber-500"
                        required
                      />
                      {!noActiveCycle && hasExistingPayments && (
                        <div className="mt-2 text-xs text-amber-700 bg-amber-50 p-2 rounded flex gap-2 items-start">
                           <AlertTriangle size={14} className="mt-0.5 shrink-0"/>
                           <p>Updating this will recalculate past paid installments.</p>
                        </div>
                      )}
                    </div>
                    
                    {formData.subscriptionFrequency === 'weekly' ? (
                       <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Weeks</label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={formData.totalInstallments}
                            onChange={(e) => setFormData({ ...formData, totalInstallments: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none"
                            required
                          />
                       </div>
                    ) : (
                      <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                          <span className="text-xs text-gray-500 block">Duration</span>
                          <span className="text-sm font-bold text-gray-700">12 Months (Fixed)</span>
                      </div>
                    )}
                   </>
                 )}
              </div>

              {/* Projection Box - Hidden if None */}
              {formData.subscriptionFrequency !== 'none' ? (
                <div className="bg-indigo-50 rounded-xl p-5 flex flex-col justify-center border border-indigo-100">
                   <div className="flex items-center gap-2 text-indigo-800 font-bold mb-2 uppercase text-xs tracking-wider">
                     <Calculator size={16} /> New Projection
                   </div>
                   <p className="text-3xl font-bold text-indigo-700">₹ {totalExpected.toLocaleString()}</p>
                   <p className="text-xs text-indigo-500 mt-1 font-medium">Target per member</p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-5 flex flex-col justify-center border border-gray-200 text-center">
                    <p className="text-sm text-gray-500 italic">No recurring revenue projection for donation-based events.</p>
                </div>
              )}
            </div>

            {/* Opening Balance */}
            {noActiveCycle && (
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                <label className="block text-xs font-bold text-yellow-700 uppercase mb-1">Opening Balance</label>
                <input
                  type="number"
                  value={formData.openingBalance}
                  onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                  className="w-full border border-yellow-300 rounded-lg px-3 py-2 bg-white"
                  placeholder="0"
                />
              </div>
            )}

            {/* Action Buttons */}
            {activeClub?.role === 'admin' && (
              <div className="flex gap-3 pt-2">
                 {!noActiveCycle && (
                   <button 
                     type="button" 
                     onClick={() => setIsEditing(false)}
                     className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
                   >
                     Cancel
                   </button>
                 )}
                 <button
                   type="submit"
                   disabled={loading}
                   className={`flex-1 py-3 rounded-xl font-bold text-white shadow-md transition-transform active:scale-95 flex justify-center gap-2 ${noActiveCycle ? "bg-indigo-600 hover:bg-indigo-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
                 >
                   {noActiveCycle ? <PlusCircle size={20} /> : <Save size={20} />}
                   {loading ? <Loader2 className="animate-spin" /> : (noActiveCycle ? "Start Festival Year" : "Save Changes")}
                 </button>
              </div>
            )}
          </form>
        </div>
      )}

    </div>
  );
}