import { CheckCircle, XCircle, IndianRupee } from "lucide-react";

export default function PujaContributions() {
  /* ================= MOCK MEMBER DATA =================
     (Replace with backend later)
  ===================================================== */
  const members = [
    {
      id: 1,
      name: "Rahul Kumar",
      email: "rahul@clubname.com",
      pujaContribution: {
        amount: 1500,
        date: "2025-02-12",
      },
    },
    {
      id: 2,
      name: "Amit Singh",
      email: "amit@clubname.com",
      pujaContribution: null,
    },
    {
      id: 3,
      name: "Rohit Verma",
      email: "rohit@clubname.com",
      pujaContribution: {
        amount: 1000,
        date: "2025-02-13",
      },
    },
  ];

  const totalCollected = members.reduce(
    (sum, m) =>
      sum + (m.pujaContribution?.amount || 0),
    0
  );

  const paidCount = members.filter(
    (m) => m.pujaContribution
  ).length;

  const unpaidCount = members.length - paidCount;

  return (
    <div className="space-y-8">
      {/* ================= HEADER ================= */}
      <div>
        <h2 className="text-xl font-semibold">
          Puja Time Member Contributions
        </h2>
        <p className="text-sm text-gray-500">
          Paid / unpaid status of members
        </p>
      </div>

      {/* ================= SUMMARY ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <SummaryCard
          label="Total Collected"
          value={totalCollected}
          icon={<IndianRupee />}
          color="bg-green-600"
        />
        <SummaryCard
          label="Members Paid"
          value={paidCount}
          icon={<CheckCircle />}
          color="bg-indigo-600"
        />
        <SummaryCard
          label="Members Not Paid"
          value={unpaidCount}
          icon={<XCircle />}
          color="bg-red-500"
        />
      </div>

      {/* ================= MOBILE VIEW ================= */}
      <div className="space-y-3 sm:hidden">
        {members.map((m) => (
          <div
            key={m.id}
            className="bg-white rounded-xl shadow p-4"
          >
            <p className="font-semibold">{m.name}</p>
            <p className="text-sm text-gray-500">
              {m.email}
            </p>

            {m.pujaContribution ? (
              <p className="text-green-600 font-semibold mt-2">
                ₹ {m.pujaContribution.amount}
                <span className="block text-xs text-gray-500">
                  Paid on {m.pujaContribution.date}
                </span>
              </p>
            ) : (
              <p className="text-red-500 font-semibold mt-2">
                Not Paid
              </p>
            )}
          </div>
        ))}
      </div>

      {/* ================= DESKTOP VIEW ================= */}
      <div className="hidden sm:block bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-[800px] w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Member</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr
                key={m.id}
                className="border-t"
              >
                <td className="p-3 font-medium">
                  {m.name}
                </td>
                <td className="p-3">{m.email}</td>
                <td className="p-3">
                  {m.pujaContribution ? (
                    <span className="flex items-center gap-1 text-green-600 font-semibold">
                      <CheckCircle size={16} />
                      Paid
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-500 font-semibold">
                      <XCircle size={16} />
                      Not Paid
                    </span>
                  )}
                </td>
                <td className="p-3 font-semibold">
                  {m.pujaContribution
                    ? `₹ ${m.pujaContribution.amount}`
                    : "-"}
                </td>
                <td className="p-3">
                  {m.pujaContribution?.date || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */

function SummaryCard({ label, value, icon, color }) {
  return (
    <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
      <div
        className={`${color} text-white p-3 rounded-lg`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">
          {label}
        </p>
        <h3 className="text-xl font-bold">
          {label.includes("Collected")
            ? `₹ ${value}`
            : value}
        </h3>
      </div>
    </div>
  );
}
