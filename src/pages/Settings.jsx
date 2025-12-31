import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useFinance } from "../context/FinanceContext";

export default function Settings() {
  const { user } = useAuth();
  const { fetchCentralFund } = useFinance();

  const [loading, setLoading] = useState(true);
  const [cycle, setCycle] = useState(null);
  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    totalWeeks: "",
    weeklyAmount: "",
  });

  /* ================= LOAD SETTINGS ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/settings");
        if (res.data.data) {
          const c = res.data.data;
          setCycle(c);

          setForm({
            name: c.name || "",
            startDate: c.startDate?.slice(0, 10) || "",
            endDate: c.endDate?.slice(0, 10) || "",
            totalWeeks: c.totalWeeks || "",
            weeklyAmount: c.weeklyAmount || "",
          });
        }
      } catch (err) {
        console.error("Settings load error", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* ================= SAVE ================= */
  const saveSettings = async () => {
    try {
      await api.put("/settings", {
        ...form,
        totalWeeks: Number(form.totalWeeks),
        weeklyAmount: Number(form.weeklyAmount),
      });

      alert("Settings updated");
      fetchCentralFund();
    } catch (err) {
      alert("Failed to save settings");
    }
  };

  /* ================= CLOSE YEAR ================= */
  const closeYear = async () => {
    if (!window.confirm("⚠️ This will CLOSE the year permanently. Continue?")) {
      return;
    }

    try {
      await api.post("/settings/close-year");
      alert("Year closed successfully");
      window.location.reload();
    } catch (err) {
      alert("Failed to close year");
    }
  };

  /* ================= GUARDS ================= */
  if (user.role !== "admin") {
    return (
      <div className="p-6 text-red-500 text-center">
        Admin access only
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 text-gray-500 text-center">
        Loading settings…
      </div>
    );
  }

  if (!cycle) {
    return (
      <div className="p-6 text-red-500 text-center">
        No active year found
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      {/* HEADER */}
      <h2 className="text-xl font-semibold">Settings</h2>

      {/* FORM */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <Input
          label="Year Name"
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            label="Start Date"
            value={form.startDate}
            onChange={(v) => setForm({ ...form, startDate: v })}
          />
          <Input
            type="date"
            label="End Date"
            value={form.endDate}
            onChange={(v) => setForm({ ...form, endDate: v })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            label="Total Weeks"
            value={form.totalWeeks}
            onChange={(v) => setForm({ ...form, totalWeeks: v })}
          />
          <Input
            type="number"
            label="Weekly Amount (₹)"
            value={form.weeklyAmount}
            onChange={(v) => setForm({ ...form, weeklyAmount: v })}
          />
        </div>

        <button
          onClick={saveSettings}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          Save Settings
        </button>
      </div>

      {/* DANGER ZONE */}
      {!cycle.isClosed && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="font-semibold text-red-700 mb-2">
            Danger Zone
          </h3>
          <p className="text-sm text-red-600 mb-4">
            Closing the year will lock all data permanently.
          </p>
          <button
            onClick={closeYear}
            className="bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Close Year
          </button>
        </div>
      )}
    </div>
  );
}

/* ================= INPUT COMPONENT ================= */
function Input({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-600">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 mt-1"
      />
    </div>
  );
}
