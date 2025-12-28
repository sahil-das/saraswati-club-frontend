import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useFinance } from "../context/FinanceContext";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Undo2,
} from "lucide-react";

export default function WeeklyContributions() {
  const { user } = useAuth();
  const { weeklyTotal, setWeeklyTotal } = useFinance();

  /* ===== SETTINGS ===== */
  const [totalWeeks, setTotalWeeks] = useState(50);
  const [weekAmount, setWeekAmount] = useState(100);

  const [editSettings, setEditSettings] = useState(false);
  const [tempWeeks, setTempWeeks] = useState(totalWeeks);
  const [tempAmount, setTempAmount] = useState(weekAmount);

  /* ===== MEMBERS (mock) ===== */
  const [members, setMembers] = useState([
    {
      id: 1,
      name: "Rahul Kumar",
      email: "rahul@clubname.com",
      payments: [{ week: 1, date: "2025-01-05" }],
    },
    {
      id: 2,
      name: "Amit Singh",
      email: "amit@clubname.com",
      payments: [],
    },
  ]);

  const [expanded, setExpanded] = useState({});

  const visibleMembers =
    user.role === "admin"
      ? members
      : members.filter((m) => m.email === user.email);

  const toggleExpand = (id) =>
    setExpanded((p) => ({ ...p, [id]: !p[id] }));

  /* ===== PAY WEEK ===== */
  const payWeek = (memberId, week) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;
        if (
          user.role !== "admin" &&
          m.email !== user.email
        )
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
              date: new Date()
                .toISOString()
                .split("T")[0],
            },
          ],
        };
      })
    );
  };

  /* ===== UNDO ===== */
  const undoPayment = (memberId, week) => {
    if (!window.confirm("Undo this payment?"))
      return;

    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;
        if (!m.payments.find((p) => p.week === week))
          return m;

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

      {/* ===== ADMIN SETTINGS ===== */}
      {user.role === "admin" && (
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          {!editSettings ? (
            <div className="flex gap-6 items-center">
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
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
              >
                Edit
              </button>
            </div>
          ) : (
            <div className="flex gap-4 items-end">
              <input
                type="number"
                value={tempWeeks}
                onChange={(e) =>
                  setTempWeeks(Number(e.target.value))
                }
                className="border px-3 py-2 rounded-lg"
              />
              <input
                type="number"
                value={tempAmount}
                onChange={(e) =>
                  setTempAmount(Number(e.target.value))
                }
                className="border px-3 py-2 rounded-lg"
              />

              <button
                onClick={() => {
                  if (
                    !window.confirm(
                      "Confirm change?"
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

      {/* ===== MEMBER CARDS ===== */}
      <div className="space-y-4">
        {visibleMembers.map((m) => {
          const isOpen = expanded[m.id];
          return (
            <div
              key={m.id}
              className="bg-white rounded-xl shadow"
            >
              <button
                onClick={() => toggleExpand(m.id)}
                className="w-full p-4 flex justify-between"
              >
                <div className="text-left">
                  <p className="font-semibold">
                    {m.name}
                  </p>
                  <p className="text-sm text-indigo-600">
                    Paid: {m.payments.length} /{" "}
                    {totalWeeks}
                  </p>
                </div>
                {isOpen ? (
                  <ChevronDown />
                ) : (
                  <ChevronRight />
                )}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 grid grid-cols-5 sm:grid-cols-8 gap-2">
                  {Array.from(
                    { length: totalWeeks },
                    (_, i) => i + 1
                  ).map((week) => {
                    const paid = m.payments.find(
                      (p) => p.week === week
                    );
                    return (
                      <div
                        key={week}
                        className="relative group"
                      >
                        <button
                          onClick={() =>
                            paid
                              ? null
                              : payWeek(m.id, week)
                          }
                          className={`h-9 rounded-lg text-xs w-full ${
                            paid
                              ? "bg-green-500 text-white"
                              : "bg-gray-100"
                          }`}
                        >
                          {paid ? (
                            <Check size={14} />
                          ) : (
                            `W${week}`
                          )}
                        </button>

                        {paid &&
                          user.role ===
                            "admin" && (
                            <button
                              onClick={() =>
                                undoPayment(
                                  m.id,
                                  week
                                )
                              }
                              className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/70 text-white text-xs rounded-lg"
                            >
                              Undo
                            </button>
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

      <p className="mt-6 text-indigo-600 font-semibold">
        Total Weekly Collection: ₹ {weeklyTotal}
      </p>
    </div>
  );
}
