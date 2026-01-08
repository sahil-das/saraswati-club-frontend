import { useEffect, useState } from "react";
import api from "../api/axios"; // Keep for finance summary check
import { fetchActiveYear, createYear, updateYear, closeYear } from "../api/years"; // 👈 New API
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext"; 
import { 
  Save, AlertTriangle, CheckCircle, PlusCircle, Lock, Calculator, Calendar, 
  Loader2, Edit3, X, Clock, Coins, ShieldAlert, Power, RefreshCw, Info // 👈 Added Info
} from "lucide-react";
import { clsx } from "clsx";

// Design System
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import ConfirmModal from "../components/ui/ConfirmModal"; 

export default function Settings() {
  const { activeClub } = useAuth(); 
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [isEditing, setIsEditing] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  
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
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      const res = await fetchActiveYear();
      const d = res.data.data;
      
      // 🟢 FIX: Check specifically for SUBSCRIPTIONS, not total income.
      // This prevents Donations from locking the Subscription Frequency.
      const financeRes = await api.get("/finance/summary");
      const subscriptionIncome = financeRes.data.data?.breakdown?.subscriptions || 0;

      if (d) {
        setNoActiveCycle(false);
        setActiveYearId(d._id);
        setHasExistingPayments(subscriptionIncome > 0); // 👈 Only true if subscriptions exist
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

  const handleSave = async (e) => {
    e.preventDefault();
    if (activeClub?.role !== 'admin') return;

    setLoading(true);
    try {
      if (noActiveCycle) {
        await createYear(formData);
        toast.success("New Festival Year Started Successfully!");
        // Reload to refresh all global contexts (Year, Finance, etc)
        setTimeout(() => window.location.reload(), 1500);
      } else {
        await updateYear(activeYearId, formData);
        toast.success("Configuration updated!");
        setIsEditing(false);
        setLoading(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
      setLoading(false);
    }
  };

  const handleCloseYear = async () => {
    try {
      await closeYear(activeYearId);
      toast.success("Financial Year Closed & Archived.");
      // Reload to force the app into "No Active Year" state
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      toast.error("Failed to close year. Please try again.");
    }
  };

  const getFrequencyLabel = (freq) => {
    if (freq === 'weekly') return 'Weekly Collection';
    if (freq === 'monthly') return 'Monthly Collection';
    return 'Donation Based (No Recurring)';
  };

  const totalExpected = formData.amountPerInstallment * formData.totalInstallments;

  if (loading && !formData.name) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600"/></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h2>
          <p className="text-slate-500 text-sm">
            {noActiveCycle ? "Setup a new financial year." : "Manage active cycle configuration."}
          </p>
        </div>
        
        {!noActiveCycle && !isEditing && activeClub?.role === "admin" && (
          <Button 
            onClick={() => setIsEditing(true)}
            leftIcon={<Edit3 size={18} />}
            variant="secondary"
          >
             Edit Configuration
          </Button>
        )}
      </div>

      {/* ==================== VIEW MODE (READ ONLY) ==================== */}
      {!isEditing && !noActiveCycle && (
        <div className="space-y-6">
            {/* Main Info Card */}
            <Card className="overflow-hidden border-slate-200" noPadding>
                <div className="bg-slate-50/50 px-8 py-6 border-b border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200 uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle size={10} /> Active Year
                        </span>
                        <span className="text-slate-400 text-sm font-medium flex items-center gap-1">
                          <Clock size={14}/> {new Date(formData.startDate).getFullYear()}
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{formData.name}</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="p-8 space-y-8 border-r border-slate-100">
                          <div>
                            <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Duration</label>
                            <div className="flex items-center gap-2 text-slate-700 font-medium bg-slate-50 inline-flex px-3 py-1.5 rounded-lg border border-slate-100">
                                <Calendar size={16} className="text-slate-400"/>
                                {new Date(formData.startDate).toLocaleDateString()} 
                                <span className="text-slate-300">➝</span>
                                {new Date(formData.endDate).toLocaleDateString()}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Collection Rule</label>
                            <p className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                {getFrequencyLabel(formData.subscriptionFrequency)}
                            </p>
                            {formData.subscriptionFrequency !== 'none' && (
                                <p className="text-sm text-slate-500 mt-1">
                                {formData.totalInstallments} installments of <span className="text-indigo-600 font-bold">₹{formData.amountPerInstallment}</span> each.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="p-8 bg-slate-50/30 flex flex-col justify-center items-center text-center">
                        {formData.subscriptionFrequency !== 'none' ? (
                            <>
                                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm ring-1 ring-indigo-100">
                                    <Coins size={32} />
                                </div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Projected Revenue</p>
                                <p className="text-3xl font-bold text-slate-800 tracking-tight">₹ {totalExpected.toLocaleString()}</p>
                                <p className="text-xs text-slate-400 mt-1">Target per member</p>
                            </>
                        ) : (
                            <div className="text-center">
                                <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm mx-auto">
                                    <Coins size={32} />
                                </div>
                                <p className="text-sm font-medium text-slate-600">Donation Only Mode</p>
                                <p className="text-xs text-slate-400 italic mt-1">No recurring revenue projection.</p>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* DANGER ZONE */}
            {activeClub?.role === "admin" && (
                <Card className="border-red-100 shadow-none overflow-hidden" noPadding>
                      <div className="bg-red-50/50 p-6 border-b border-red-100 flex items-start gap-4">
                        <div className="p-3 bg-red-100 text-red-600 rounded-xl shrink-0">
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-red-900">Danger Zone</h3>
                            <p className="text-sm text-red-600/80 mt-1">
                                Closing the financial year is irreversible. It will freeze all current data and archive it for read-only access.
                            </p>
                        </div>
                      </div>
                      <div className="p-6 bg-red-50/20">
                        <Button 
                            variant="danger" 
                            onClick={() => setShowCloseConfirm(true)}
                            leftIcon={<Power size={18} />}
                        >
                            Close Financial Year
                        </Button>
                      </div>
                </Card>
            )}
        </div>
      )}

      {/* ==================== EDIT/CREATE FORM ==================== */}
      {(isEditing || noActiveCycle) && (
        <Card className={noActiveCycle ? "border-indigo-200 shadow-lg" : "border-slate-200"}>
          
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
            <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800">
              {noActiveCycle ? <PlusCircle size={20} className="text-indigo-600"/> : <Edit3 size={20} className="text-slate-500"/>}
              {noActiveCycle ? "Setup New Year" : "Edit Configuration"}
            </h3>
            {!noActiveCycle && (
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X size={20}/>
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <Input 
                        label="Event Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Durga Puja 2026"
                        required
                    />
                </div>
                <div>
                    <Input 
                        type="date"
                        label="Start Date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <Input 
                        type="date"
                        label="End Date"
                        min={formData.startDate}
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        required
                    />
                </div>
            </div>

            <div className="h-px bg-slate-100 my-4" />

            {/* Rules */}
            <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Lock size={14} className="text-slate-400"/> Financial Rules
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* FREQUENCY INPUT with INFO */}
                    <div>
                        <div className="flex items-center gap-2 mb-1.5 ml-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase">Frequency</label>
                            
                            {/* ℹ️ INFO TOOLTIP */}
                            {hasExistingPayments && !noActiveCycle && (
                                <div className="group relative flex items-center">
                                    <Info size={14} className="text-amber-500 cursor-help" />
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] leading-tight rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 text-center font-medium">
                                            To change frequency, you must remove all existing subscription payments first.
                                            {/* Little Triangle Arrow */}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <select 
                            value={formData.subscriptionFrequency}
                            onChange={(e) => handleFrequencyChange(e.target.value)}
                            disabled={hasExistingPayments && !noActiveCycle}
                            className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl py-3 px-4 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-slate-50 disabled:text-slate-400 transition-all cursor-pointer disabled:cursor-not-allowed"
                        >
                            <option value="weekly">Weekly Collection</option>
                            <option value="monthly">Monthly Collection</option>
                            <option value="none">No Recurring (Donations Only)</option>
                        </select>
                        
                        {/* Lock Message */}
                        {hasExistingPayments && !noActiveCycle && (
                            <p className="text-[10px] text-amber-600 mt-1 ml-1 flex items-center gap-1 font-medium">
                                <Lock size={10} /> Locked due to existing records
                            </p>
                        )}
                    </div>

                    {formData.subscriptionFrequency !== 'none' && (
                        <>
                            <Input 
                                type="number"
                                label="Amount per Installment"
                                value={formData.amountPerInstallment}
                                onChange={(e) => setFormData({ ...formData, amountPerInstallment: e.target.value })}
                                icon={Coins}
                                required
                            />
                            
                            {formData.subscriptionFrequency === 'weekly' ? (
                                <Input 
                                    type="number"
                                    label="Total Weeks"
                                    value={formData.totalInstallments}
                                    onChange={(e) => setFormData({ ...formData, totalInstallments: e.target.value })}
                                    required
                                />
                            ) : (
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-center">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Duration</span>
                                    <span className="text-sm font-bold text-slate-700">12 Months (Fixed)</span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Opening Balance (Only for new year) */}
            {noActiveCycle && (
                <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                    <Input 
                        type="number"
                        label="Opening Balance (Optional)"
                        value={formData.openingBalance}
                        onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                        placeholder="0"
                        className="bg-white"
                        icon={Coins}
                    />
                    <p className="text-xs text-amber-600 mt-1.5 ml-1">
                        Carry forward funds from the previous year if needed.
                    </p>
                </div>
            )}

            <div className="flex gap-3 pt-4">
                {!noActiveCycle && (
                    <Button variant="secondary" onClick={() => setIsEditing(false)} className="flex-1">
                        Cancel
                    </Button>
                )}
                <Button 
                    type="submit" 
                    isLoading={loading}
                    className="flex-1"
                    leftIcon={noActiveCycle ? <PlusCircle size={18} /> : <Save size={18} />}
                >
                    {noActiveCycle ? "Start Festival Year" : "Save Changes"}
                </Button>
            </div>

          </form>
        </Card>
      )}

      {/* CONFIRM CLOSE MODAL */}
      <ConfirmModal 
        isOpen={showCloseConfirm}
        onClose={() => setShowCloseConfirm(false)}
        onConfirm={handleCloseYear}
        title="Close Financial Year?"
        message="This will archive all current data. You will be able to view it in Archives, but no new transactions can be added until a new year is started."
        confirmText="Yes, Close Year"
        isDangerous={true}
      />
    </div>
  );
}