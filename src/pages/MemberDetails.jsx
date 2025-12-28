import { useParams } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { CheckCircle, IndianRupee } from "lucide-react";

export default function MemberDetails() {
  const { memberId } = useParams();
  const { user } = useAuth();

  /* ================= MOCK MEMBER DATA =================
     (replace with backend API later)
  ===================================================== */
  const [member, setMember] = useState({
    id: memberId,
    name: "Rahul Kumar",
    email: "rahul@clubname.com",

    weeklyPayments: [
      { week: 1, date: "2025-01-05" },
      { week: 2, date: "2025-01-12" },
      { week: 3, date: "2025-01-19" },
    ],

    // null => not contributed yet
    pujaContribution: {
      amount: 1500,
      date: "2025-02-12",
    },
  });

  /* ================= ADMIN INPUT STATE ================= */
  const [pujaAmount, setPujaAmount] = useState(
    member.pujaContribution?.amount || ""
  );

  /* ================= SAVE PUJA CONTRIBUTION ================= */
  const savePujaContribution = () => {
    if (!pujaAmount) return;

    if (
      !window.confirm(
        "Are you sure you want to save this Puja-time contribution?"
      )
    )
      return;

    setMember({
      ...member,
      pujaContribution: {
        amount: Number(pujaAmount),
        date: new Date().toISOString().split("T")[0],
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div>
        <h2 className="text-xl font-semibold">
          {member.name}
        </h2>
        <p className="text-sm text-gray-500">
          {member.email}
        </p>
      </div>

      {/* ================= WEEKLY CONTRIBUTIONS ================= */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="font-semibold mb-4">
          Weekly Contributions
        </h3>

        {member.weeklyPayments.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {member.weeklyPayments.map((p) => (
              <div
                key={p.week}
                className="bg-green-100 text-green-700 rounded-lg p-3 text-sm"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} />
                  Week {p.week}
                </div>
                <p className="text-xs mt-1">
                  {p.date}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No weekly contributions yet.
          </p>
        )}
      </div>

      {/* ================= PUJA CONTRIBUTION (VIEW) ================= */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="font-semibold mb-2">
          Puja-time Contribution
        </h3>

        {member.pujaContribution ? (
          <>
            <p className="text-lg font-bold text-green-600 flex items-center gap-1">
              <IndianRupee size={18} />
              {member.pujaContribution.amount}
            </p>
            <p className="text-sm text-gray-500">
              Paid on: {member.pujaContribution.date}
            </p>
          </>
        ) : (
          <p className="text-red-500 font-medium">
            Not contributed yet
          </p>
        )}
      </div>

      {/* ================= ADMIN: ADD / UPDATE PUJA ================= */}
      {user.role === "admin" && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-3">
            Add / Update Puja-time Contribution
          </h3>

          <input
            type="number"
            placeholder="Enter amount"
            value={pujaAmount}
            onChange={(e) =>
              setPujaAmount(e.target.value)
            }
            className="w-full border rounded-lg px-3 py-2 mb-4"
          />

          <button
            onClick={savePujaContribution}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Save Puja Contribution
          </button>

          <p className="text-xs text-gray-500 mt-2">
            * Only admin can add or update Puja-time contributions
          </p>
        </div>
      )}
    </div>
  );
}
