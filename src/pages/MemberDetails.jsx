import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { markWeekPaid, undoWeekPaid } from "../api/weekly";
import { IndianRupee, PlusCircle, ChevronDown } from "lucide-react";
import { useFinance } from "../context/FinanceContext";

export default function MemberDetails() {
  const { memberId } = useParams();
  const { user } = useAuth();
  const { fetchCentralFund } = useFinance();

  const [member, setMember] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [cycle, setCycle] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🟣 PUJA
  const [pujaTotal, setPujaTotal] = useState(0);
  const [pujaRecords, setPujaRecords] = useState([]);
  const [amount, setAmount] = useState("");

  // 🔽 WEEK TOGGLE
  const [weeksExpanded, setWeeksExpanded] = useState(false);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (!memberId) return;

    const loadData = async () => {
      try {
        const memberRes = await api.get(`/members/${memberId}`);
        setMember(memberRes.data.data);

        const weeklyRes = await api.get(`/weekly/member/${memberId}`);
        setWeeks(weeklyRes.data.weeks);
        setCycle(weeklyRes.data.cycle);

        await loadPuja();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [memberId]);

  /* ================= PUJA ================= */
  const loadPuja = async () => {
    const res = await api.get(`/puja-contributions/member/${memberId}`);
    setPujaTotal(res.data.total);
    setPujaRecords(res.data.records);
  };

  /* ================= WEEKLY ================= */
  const handleMarkPaid = async (week) => {
    if (!window.confirm(`Mark Week ${week} as paid?`)) return;
    await markWeekPaid(memberId, week);

    setWeeks((prev) =>
      prev.map((w) =>
        w.week === week
          ? { ...w, paid: true, paidAt: new Date().toISOString() }
          : w
      )
    );
  };

  const handleUndoPaid = async (week) => {
    if (!window.confirm("Undo this payment?")) return;
    await undoWeekPaid(memberId, week);

    setWeeks((prev) =>
      prev.map((w) =>
        w.week === week ? { ...w, paid: false, paidAt: null } : w
      )
    );
  };

  /* ================= ADD PUJA ================= */
  const addPujaContribution = async () => {
    if (!amount) return;

    try {
      await api.post("/puja-contributions", {
        memberId: member._id,
        amount: Number(amount),
      });

      setAmount("");        // ✅ correct state
      await loadPuja();     // ✅ reload puja data
      fetchCentralFund();   // ✅ update dashboard totals
    } catch (err) {
      console.error("Puja add error", err);
      alert("Failed to add puja contribution");
    }
  };

  /* ================= UI STATES ================= */
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading member details…
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-6 text-center text-red-500">
        Member not found
      </div>
    );
  }

  const paidCount = weeks.filter((w) => w.paid).length;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-xl font-semibold">{member.name}</h2>
        <p className="text-sm text-gray-500">{member.email}</p>
      </div>

      {/* CYCLE */}
      {cycle && (
        <div className="bg-indigo-50 p-4 rounded-lg text-sm">
          <p className="font-medium">Active Cycle: {cycle.name}</p>
          <p>
            {cycle.startDate.slice(0, 10)} →{" "}
            {cycle.endDate.slice(0, 10)}
          </p>
        </div>
      )}

      {/* PUJA TOTAL */}
      <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
        <div className="bg-indigo-600 text-white p-3 rounded-lg">
          <IndianRupee />
        </div>
        <div>
          <p className="text-sm text-gray-500">
            Total Puja Contribution
          </p>
          <h3 className="text-xl font-bold">₹ {pujaTotal}</h3>
        </div>
      </div>

      {/* ADD PUJA */}
      {user.role === "admin" && (
        <div className="bg-white rounded-xl shadow p-5 max-w-sm">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <PlusCircle size={18} />
            Add Puja Contribution
          </h3>

          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mb-3"
          />

          <button
            onClick={addPujaContribution}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg w-full"
          >
            Add Contribution
          </button>
        </div>
      )}
      {/* PUJA CONTRIBUTION TABLE */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <h3 className="font-semibold px-5 pt-4">
          Member Contribution History
        </h3>

        <table className="w-full text-sm mt-3">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Added By</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>

          <tbody>
            {pujaRecords.length === 0 ? (
              <tr>
                <td
                  colSpan="3"
                  className="p-4 text-center text-gray-500"
                >
                  No puja contributions yet
                </td>
              </tr>
            ) : (
              pujaRecords.map((r) => (
                <tr key={r._id} className="border-t">
                  <td className="p-3 font-semibold text-green-600">
                    ₹ {r.amount}
                  </td>
                  <td className="p-3">
                    {r.addedBy?.name || r.addedBy?.email || "Admin"}
                  </td>
                  <td className="p-3">
                    {r.createdAt?.slice(0, 10)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* WEEKLY */}
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Weekly Contributions</h3>

          <button
            onClick={() => setWeeksExpanded((p) => !p)}
            className="flex items-center gap-1 text-indigo-600 text-sm font-medium"
          >
            {weeksExpanded ? "Collapse" : "Expand"}
            <ChevronDown
              className={`transition-transform duration-300 ${
                weeksExpanded ? "rotate-180" : ""
              }`}
              size={16}
            />
          </button>
        </div>

        {!weeksExpanded && (
          <p className="text-sm text-gray-500 mb-2">
            {paidCount} / {weeks.length} weeks paid
          </p>
        )}

        {/* ANIMATED CONTAINER */}
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            weeksExpanded
              ? "max-h-[2000px] opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-3">
            {weeks.map((w) => (
              <div
                key={w.week}
                className={`rounded-lg p-3 text-sm border ${
                  w.paid
                    ? "bg-green-100 border-green-400"
                    : "bg-gray-50"
                }`}
              >
                <p className="font-semibold">Week {w.week}</p>

                {w.paid ? (
                  <>
                    <p className="text-xs text-green-700">Paid ✓</p>
                    <p className="text-xs text-gray-500">
                      {w.paidAt?.slice(0, 10)}
                    </p>

                    {user.role === "admin" && (
                      <button
                        onClick={() => handleUndoPaid(w.week)}
                        className="mt-2 text-xs text-red-600 underline"
                      >
                        Undo
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-xs text-red-500">Not Paid</p>

                    {user.role === "admin" && (
                      <button
                        onClick={() => handleMarkPaid(w.week)}
                        className="mt-2 text-xs text-indigo-600 underline"
                      >
                        Mark Paid
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
