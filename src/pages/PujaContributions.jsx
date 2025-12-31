import { useEffect, useState } from "react";
import api from "../api/axios";
import { useFinance } from "../context/FinanceContext";
import { useAuth } from "../context/AuthContext";

export default function PujaContributions() {
  const { fetchCentralFund } = useFinance();
  const { user } = useAuth();

  const [members, setMembers] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    memberId: "",
    amount: "",
  });

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const [mRes, pRes] = await Promise.all([
          api.get("/members"),
          api.get("/puja-contributions"),
        ]);

        setMembers(mRes.data.data || []);
        setRows(pRes.data.data || []);
      } catch (err) {
        console.error("Puja load error", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* ================= ADD CONTRIBUTION (ADMIN) ================= */
  const addContribution = async () => {
    if (!form.memberId || !form.amount) {
      alert("Select member & amount");
      return;
    }

    try {
      await api.post("/puja-contributions", {
        memberId: form.memberId,
        amount: Number(form.amount),
      });

      setForm({ memberId: "", amount: "" });

      // reload list
      const res = await api.get("/puja-contributions");
      setRows(res.data.data || []);

      // 🔥 update dashboard totals
      fetchCentralFund();
    } catch (err) {
      console.error(err);
      alert("Failed to add contribution");
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading puja contributions…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">
        Puja-Time Member Contributions
      </h2>

      {/* ================= ADD FORM (ADMIN ONLY) ================= */}
      {user.role === "admin" && (
        <div className="bg-white p-4 rounded-xl shadow max-w-md">
          <h3 className="font-semibold mb-3">
            Add Contribution
          </h3>

          <select
            className="w-full border p-2 rounded mb-3"
            value={form.memberId}
            onChange={(e) =>
              setForm({ ...form, memberId: e.target.value })
            }
          >
            <option value="">Select Member</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Amount"
            className="w-full border p-2 rounded mb-3"
            value={form.amount}
            onChange={(e) =>
              setForm({ ...form, amount: e.target.value })
            }
          />

          <button
            onClick={addContribution}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Save Contribution
          </button>
        </div>
      )}

      {/* ================= LIST ================= */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Member</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Added By</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="p-3 font-medium">
                  {r.member?.name || "—"}
                </td>

                <td className="p-3 text-green-600 font-semibold">
                  ₹ {r.amount}
                </td>

                <td className="p-3 text-sm text-gray-600">
                  {r.addedBy?.email || "System"}
                </td>

                <td className="p-3">
                  {r.createdAt
                    ? new Date(r.createdAt).toLocaleDateString()
                    : "—"}
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="p-6 text-center text-gray-500"
                >
                  No puja contributions recorded
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
