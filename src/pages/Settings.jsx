import { useEffect, useState } from "react";
import api from "../api/axios"; 
import { fetchActiveYear, createYear, updateYear, closeYear } from "../api/years";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext"; 
import { 
  Save, CheckCircle, PlusCircle, Lock, Calendar, 
  Loader2, Edit3, X, Clock, Coins, ShieldAlert, Power, Info 
} from "lucide-react";

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
      
      if (d) {
        setNoActiveCycle(false);
        setActiveYearId(d._id);
        
        // Check for existing payments to lock critical fields
        try {
            const financeRes = await api.get("/finance/summary");
            const subscriptionIncome = financeRes.data.data?.breakdown?.subscriptions || 0;
            setHasExistingPayments(subscriptionIncome > 0); 
        } catch (e) {
            console.warn("Failed to check existing payments");
        }
        
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
      } else {
        handleNoActiveYear();
      }
    } catch (err) {
      handleNoActiveYear();
    } finally {
      setLoading(false);
    }
  };

  const handleNoActiveYear = () => {
      setNoActiveCycle(true);
      setIsEditing(true); 
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ 
          ...prev, 
          startDate: today, 
          name: `New Year ${new Date().getFullYear()}`,
          openingBalance: 0 
      }));
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
        const payload = { ...formData };
        if (payload.subscriptionFrequency === 'none') {
            payload.totalInstallments = undefined;
        }

        await createYear(payload);
        toast.success("New Festival Year Started Successfully!");
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

  if (loading && !formData.name) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-primary-600"/></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">System Settings</h2>
          <p className="text-[var(--text-muted)] text-sm">
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
            <Card className="overflow-hidden border-[var(--border-color)]" noPadding>
                <div className="bg-slate-50/50 dark:bg-slate-800/50 px-8 py-6 border-b border-[var(--border-color)]">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200 dark:border-emerald-900/50 uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle size={10} /> Active Year
                        </span>
                        <span className="text-[var(--text-muted)] text-sm font-medium flex items-center gap-1">
                          <Clock size={14}/> {new Date(formData.startDate).getFullYear()}
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-[var(--text-main)] tracking-tight">{formData.name}</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="p-8 space-y-8 border-r border-[var(--border-color)]">
                          <div>
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase block mb-1">Duration</label>
                            <div className="flex items-center gap-2 text-[var(--text-main)] font-medium bg-slate-50 dark:bg-slate-800 inline-flex px-3 py-1.5 rounded-lg border border-[var(--border-color)]">
                                <Calendar size={16} className="text-[var(--text-muted)]"/>
                                {new Date(formData.startDate).toLocaleDateString()} 
                                <span className="text-[var(--text-muted)]">➝</span>
                                {new Date(formData.endDate).toLocaleDateString()}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase block mb-1">Collection Rule</label>
                            <p className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
                                {getFrequencyLabel(formData.subscriptionFrequency)}
                            </p>
                            {formData.subscriptionFrequency !== 'none' && (
                                <p className="text-sm text-[var(--text-muted)] mt-1">
                                {formData.totalInstallments} installments of <span className="text-primary-600 dark:text-primary-400 font-bold">₹{formData.amountPerInstallment}</span> each.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="p-8 bg-slate-50/30 dark:bg-slate-800/30 flex flex-col justify-center items-center text-center">
                        {formData.subscriptionFrequency !== 'none' ? (
                            <>
                                <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mb-4 shadow-sm ring-1 ring-primary-100 dark:ring-primary-800">
                                    <Coins size={32} />
                                </div>
                                <p className="text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Projected Revenue</p>
                                <p className="text-3xl font-bold text-[var(--text-main)] tracking-tight">₹ {totalExpected.toLocaleString()}</p>
                                <p className="text-xs text-[var(--text-muted)] mt-1">Target per member</p>
                            </>
                        ) : (
                            <div className="text-center">
                                <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-4 shadow-sm mx-auto">
                                    <Coins size={32} />
                                </div>
                                <p className="text-sm font-medium text-[var(--text-main)]">Donation Only Mode</p>
                                <p className="text-xs text-[var(--text-muted)] italic mt-1">No recurring revenue projection.</p>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* DANGER ZONE */}
            {activeClub?.role === "admin" && (
                <Card className="border-red-100 dark:border-red-900/30 shadow-none overflow-hidden" noPadding>
                      <div className="bg-red-50/50 dark:bg-red-900/10 p-6 border-b border-red-100 dark:border-red-900/30 flex items-start gap-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl shrink-0">
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-red-900 dark:text-red-200">Danger Zone</h3>
                            <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1">
                                Closing the financial year is irreversible. It will freeze all current data and archive it for read-only access.
                            </p>
                        </div>
                      </div>
                      <div className="p-6 bg-red-50/20 dark:bg-red-900/5">
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
        <Card className={noActiveCycle ? "border-primary-200 dark:border-primary-800 shadow-lg" : "border-[var(--border-color)]"}>
          
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--border-color)]">
            <h3 className="font-bold text-lg flex items-center gap-2 text-[var(--text-main)]">
              {noActiveCycle ? <PlusCircle size={20} className="text-primary-600 dark:text-primary-400"/> : <Edit3 size={20} className="text-[var(--text-muted)]"/>}
              {noActiveCycle ? "Setup New Year" : "Edit Configuration"}
            </h3>
            {!noActiveCycle && (
              <button onClick={() => setIsEditing(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition">
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
                        className="bg-[var(--bg-input)]"
                    />
                </div>
                <div>
                    <Input 
                        type="date"
                        label="Start Date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                        className="bg-[var(--bg-input)]"
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
                        className="bg-[var(--bg-input)]"
                    />
                </div>
            </div>

            <div className="h-px bg-[var(--border-color)] my-4" />

            {/* Rules */}
            <div className="space-y-4">
                <h4 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
                    <Lock size={14} className="text-[var(--text-muted)]"/> Financial Rules
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* FREQUENCY INPUT with INFO */}
                    <div>
                        <div className="flex items-center gap-2 mb-1.5 ml-1">
                            <label className="block text-xs font-bold text-[var(--text-muted)] uppercase">Frequency</label>
                            
                            {/* ℹ️ INFO TOOLTIP */}
                            {hasExistingPayments && !noActiveCycle && (
                                <div className="group relative flex items-center">
                                    <Info size={14} className="text-amber-500 cursor-help" />
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] leading-tight rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 text-center font-medium">
                                            To change frequency, you must remove all existing subscription payments first.
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <select 
                            value={formData.subscriptionFrequency}
                            onChange={(e) => handleFrequencyChange(e.target.value)}
                            disabled={hasExistingPayments && !noActiveCycle}
                            className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-main)] text-sm rounded-xl py-3 px-4 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-[var(--text-muted)] transition-all cursor-pointer disabled:cursor-not-allowed"
                        >
                            <option value="weekly">Weekly Collection</option>
                            <option value="monthly">Monthly Collection</option>
                            <option value="none">No Recurring (Donations Only)</option>
                        </select>
                        
                        {/* Lock Message */}
                        {hasExistingPayments && !noActiveCycle && (
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 ml-1 flex items-center gap-1 font-medium">
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
                                className="bg-[var(--bg-input)]"
                            />
                            
                            {formData.subscriptionFrequency === 'weekly' ? (
                                <Input 
                                    type="number"
                                    label="Total Weeks"
                                    value={formData.totalInstallments}
                                    onChange={(e) => setFormData({ ...formData, totalInstallments: e.target.value })}
                                    required
                                    className="bg-[var(--bg-input)]"
                                />
                            ) : (
                                <div className="bg-slate-50 dark:bg-slate-800 border border-[var(--border-color)] rounded-xl p-3 flex flex-col justify-center">
                                    <span className="text-xs font-bold text-[var(--text-muted)] uppercase">Duration</span>
                                    <span className="text-sm font-bold text-[var(--text-main)]">12 Months (Fixed)</span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Opening Balance (Only for new year) */}
            {noActiveCycle && (
                <div className="bg-amber-50/50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
                    <Input 
                        type="number"
                        label="Opening Balance (Optional)"
                        value={formData.openingBalance}
                        onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                        placeholder="0"
                        className="bg-[var(--bg-input)]"
                        icon={Coins}
                    />
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 ml-1">
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