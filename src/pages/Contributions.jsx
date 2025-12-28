import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useFinance } from "../context/FinanceContext";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Undo2,
} from "lucide-react";
import { exportWeeklyAllMembersPDF } from "../utils/weeklyAllMembersPdf";
import { FileText } from "lucide-react";

export default function Contributions() {
  const { user } = useAuth();
  const { weeklyTotal, setWeeklyTotal } = useFinance();

  /* ================= WEEK SETTINGS ================= */
  const [totalWeeks, setTotalWeeks] = useState(50);
  const [weekAmount, setWeekAmount] = useState(100);

  // Safe edit mode
  const [editSettings, setEditSettings] = useState(false);
  const [tempWeeks, setTempWeeks] = useState(totalWeeks);
  const [tempAmount, setTempAmount] = useState(weekAmount);

  /* ================= MEMBERS (MOCK) ================= */
  const [members, setMembers] = useState([
    {
      id: 1,
      name: "Rahul Kumar",
      email: "rahul@clubname.com",
      payments: [
        { week: 1, date: "2025-01-05" },
        { week: 2, date: "2025-01-12" },
      ],
    },
    {
      id: 2,
      name: "Amit Singh",
      email: "amit@clubname.com",
      payments: [{ week: 1, date: "2025-01-06" }],
    },
  ]);

  /* ================= UI STATE ================= */
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  /* ================= VISIBILITY ================= */
  const visibleMembers =
    user.role === "admin"
      ? members
      : members.filter((m) => m.email === user.email);

  /* ================= PAY WEEK ================= */
  const payWeek = (memberId, week) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;

        // permission
        if (user.role !== "admin" && m.email !== user.email)
          return m;

        if (m.payments.some((p) => p.week === week))
          return m;

        setWeeklyTotal((t) => t + weekAmount);

        return {
          ...m,
          payments: [
            ...m.payments,
            {
              week,
              date: new Date().toISOString().split("T")[0],
            },
          ],
        };
      })
    );
  };

  /* ================= UNDO PAYMENT ================= */
  const undoPayment = (memberId, week) => {
    if (!window.confirm("Undo this payment?")) return;

    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;

        const payment = m.payments.find(
          (p) => p.week === week
        );
        if (!payment) return m;

        setWeeklyTotal((t) => t - weekAmount);

        return {
          ...m,
          payments: m.payments.filter(
            (p) => p.week !== week
          ),
        };
      })
    );
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">
        Weekly Contributions
      </h2>
      {user.role === "admin" && (
  <button
    onClick={() =>
      exportWeeklyAllMembersPDF({
        clubName: "Saraswati Puja Club",
        members,
        totalWeeks,
        weekAmount,
      })
    }
    className="mb-4 flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
            <FileText size={18} />
            Export Weekly Register (PDF)
        </button>
        )}


      {/* ================= ADMIN SETTINGS (SAFE) ================= */}
      {user.role === "admin" && (
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <h3 className="font-semibold mb-3">
            Weekly Settings
          </h3>

          {!editSettings ? (
            /* LOCKED VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div>
                <p className="text-sm text-gray-500">
                  Total Weeks
                </p>
                <p className="font-semibold">
                  {totalWeeks}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Amount / Week
                </p>
                <p className="font-semibold">
                  ₹ {weekAmount}
                </p>
              </div>

              <button
                onClick={() => {
                  setTempWeeks(totalWeeks);
                  setTempAmount(weekAmount);
                  setEditSettings(true);
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg w-fit"
              >
                Edit Settings
              </button>
            </div>
          ) : (
            /* EDIT MODE */
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-sm font-medium">
                  Total Weeks
                </label>
                <input
                  type="number"
                  value={tempWeeks}
                  onChange={(e) =>
                    setTempWeeks(Number(e.target.value))
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Amount / Week (₹)
                </label>
                <input
                  type="number"
                  value={tempAmount}
                  onChange={(e) =>
                    setTempAmount(Number(e.target.value))
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <button
                onClick={() => {
                  if (
                    !window.confirm(
                      "Are you sure you want to change weekly settings?"
                    )
                  )
                    return;

                  setTotalWeeks(tempWeeks);
                  setWeekAmount(tempAmount);
                  setEditSettings(false);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                Save
              </button>

              <button
                onClick={() =>
                  setEditSettings(false)
                }
                className="bg-gray-300 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= MEMBER CARDS ================= */}
      <div className="space-y-4">
        {visibleMembers.map((member) => {
          const isOpen = expanded[member.id];
          const paidWeeks = member.payments.map(
            (p) => p.week
          );

          return (
            <div
              key={member.id}
              className="bg-white rounded-xl shadow"
            >
              {/* HEADER */}
              <button
                onClick={() => toggleExpand(member.id)}
                className="w-full p-4 flex justify-between items-center"
              >
                <div className="text-left">
                  <h3 className="font-semibold">
                    {member.name}
                  </h3>
                  <p className="text-sm text-indigo-600">
                    Paid: {paidWeeks.length} /{" "}
                    {totalWeeks}
                  </p>
                </div>

                {isOpen ? (
                  <ChevronDown />
                ) : (
                  <ChevronRight />
                )}
              </button>

              {/* EXPAND */}
              {isOpen && (
                <div className="px-4 pb-4 grid grid-cols-5 sm:grid-cols-8 gap-2">
                  {Array.from(
                    { length: totalWeeks },
                    (_, i) => i + 1
                  ).map((week) => {
                    const payment =
                      member.payments.find(
                        (p) => p.week === week
                      );

                    return (
                      <div
                        key={week}
                        className="relative group"
                      >
                        <button
                          onClick={() =>
                            payment
                              ? null
                              : payWeek(
                                  member.id,
                                  week
                                )
                          }
                          className={`h-10 w-full rounded-lg text-xs font-medium flex items-center justify-center
                            ${
                              payment
                                ? "bg-green-500 text-white"
                                : "bg-gray-100 hover:bg-indigo-100"
                            }`}
                        >
                          {payment ? (
                            <Check size={14} />
                          ) : (
                            `W${week}`
                          )}
                        </button>

                        {/* DATE + UNDO */}
                        {payment && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 bg-black/70 text-white text-[10px] rounded-lg">
                            <span>
                              {payment.date}
                            </span>

                            {user.role ===
                              "admin" && (
                              <button
                                onClick={() =>
                                  undoPayment(
                                    member.id,
                                    week
                                  )
                                }
                                className="mt-1 flex items-center gap-1 text-red-300"
                              >
                                <Undo2 size={12} />{" "}
                                Undo
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* SUMMARY */}
      <p className="mt-6 text-sm font-semibold text-indigo-600">
        Total Weekly Collection: ₹ {weeklyTotal}
      </p>
    </div>
  );
}
