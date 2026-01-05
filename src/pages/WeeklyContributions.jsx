import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useFinance } from "../context/FinanceContext";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import { exportWeeklyAllMembersPDF } from "../utils/exportWeeklyAllMembersPDF";
export default function WeeklyContributions() {
  const { user } = useAuth();
  const { weeklyTotal, fetchCentralFund } = useFinance();

  const [members, setMembers] = useState([]);
  const [cycle, setCycle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const loadData = async () => {
      try {
        // 1️⃣ Active cycle
        const cycleRes = await api.get("/cycles/active");
        const activeCycle = cycleRes.data.data;
        setCycle(activeCycle);

        // 2️⃣ Members
        const memberRes = await api.get("/members");
        const memberList = memberRes.data.data;

        // 3️⃣ Weekly status per member
        const membersWithWeeks = await Promise.all(
          memberList.map(async (m) => {
            const weeklyRes = await api.get(
              `/weekly/member/${m._id}`
            );

            return {
              ...m,
              weeks: weeklyRes.data.weeks,
            };
          })
        );

        setMembers(membersWithWeeks);

        // 4️⃣ Sync central fund from backend
        await fetchCentralFund();
      } catch (err) {
        console.error("Weekly load error", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /* ================= HELPERS ================= */
  const visibleMembers =
    user.role === "admin"
      ? members
      : members.filter((m) => m.email === user.email);

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  /* ================= MARK PAID ================= */
  const payWeek = async (memberId, week) => {
    if (!window.confirm(`Mark Week ${week} as paid?`)) return;

    try {
      await api.post("/weekly/mark-paid", {
        memberId,
        weekNumber: week,
      });

      setMembers((prev) =>
        prev.map((m) =>
          m._id === memberId
            ? {
                ...m,
                weeks: m.weeks.map((w) =>
                  w.week === week
                    ? {
                        ...w,
                        paid: true,
                        paidAt: new Date().toISOString(),
                      }
                    : w
                ),
              }
            : m
        )
      );

      await fetchCentralFund();
    } catch (err) {
      console.error("Mark paid error", err);
    }
  };

  /* ================= UNDO PAID ================= */
  const undoPayment = async (memberId, week) => {
    if (!window.confirm("Undo this payment?")) return;

    try {
      await api.post("/weekly/undo-paid", {
        memberId,
        weekNumber: week,
      });

      setMembers((prev) =>
        prev.map((m) =>
          m._id === memberId
            ? {
                ...m,
                weeks: m.weeks.map((w) =>
                  w.week === week
                    ? { ...w, paid: false, paidAt: null }
                    : w
                ),
              }
            : m
        )
      );

      await fetchCentralFund();
    } catch (err) {
      console.error("Undo payment error", err);
    }
  };

  /* ================= LOADING / EMPTY ================= */
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading weekly contributions…
      </div>
    );
  }

  if (!cycle) {
    return (
      <div className="p-6 text-center text-red-500">
        No active Puja cycle found
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div>
      {/* Title removed (now in Navbar) */}

      {/* ===== CYCLE INFO ===== */}
      <div className="bg-indigo-50 p-4 rounded-xl shadow mb-6 text-sm">
        <p className="font-semibold">{cycle.name}</p>
        <p>
          Weeks: {cycle.totalWeeks} | Amount / week: ₹{" "}
          {cycle.weeklyAmount}
        </p>
      </div>

      {/* ===== EXPORT ===== */}
      {user.role === "admin" && (
        <button
          onClick={() =>
            exportWeeklyAllMembersPDF({
              clubName: "Saraswati Club",
              members,
              cycle, 
            })
          }
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg mb-6"
        >
          Export Weekly PDF
        </button>
      )}

      {/* ===== TOTAL COLLECTION ===== */}
      <p className="mb-6 text-indigo-600 font-semibold">
        Total Weekly Collection: ₹ {weeklyTotal}
      </p>

      {/* ===== MEMBER CARDS ===== */}
      <div className="space-y-4">
        {visibleMembers.map((m) => {
          const isOpen = expanded[m._id];
          const paidCount = m.weeks.filter((w) => w.paid).length;

          return (
            <div
              key={m._id}
              className="bg-white rounded-xl shadow"
            >
              <button
                onClick={() => toggleExpand(m._id)}
                className="w-full p-4 flex justify-between"
              >
                <div className="text-left">
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-sm text-indigo-600">
                    Paid: {paidCount} / {cycle.totalWeeks}
                  </p>
                </div>
                {isOpen ? <ChevronDown /> : <ChevronRight />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 grid grid-cols-5 sm:grid-cols-8 gap-2">
                  {m.weeks.map((w) => (
                    <div key={w.week} className="relative group">
                      <button
                        onClick={() =>
                          !w.paid &&
                          user.role === "admin" &&
                          payWeek(m._id, w.week)
                        }
                        className={`h-9 rounded-lg text-xs w-full flex items-center justify-center ${
                          w.paid
                            ? "bg-green-500 text-white"
                            : "bg-gray-100"
                        }`}
                      >
                        {w.paid ? <Check size={14} /> : `W${w.week}`}
                      </button>

                      {w.paid && user.role === "admin" && (
                        <button
                          onClick={() =>
                            undoPayment(m._id, w.week)
                          }
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/70 text-white text-xs rounded-lg"
                        >
                          Undo
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}