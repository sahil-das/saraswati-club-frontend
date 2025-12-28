import { useState } from "react";
import { IndianRupee, PlusCircle } from "lucide-react";

export default function Donations() {
  const [donations, setDonations] = useState([
    {
      id: 1,
      name: "Ramesh Sharma",
      amount: 2000,
      date: "2025-02-10",
      type: "Outside",
    },
    {
      id: 2,
      name: "Rahul Kumar",
      amount: 1500,
      date: "2025-02-12",
      type: "Member",
    },
  ]);

  const [form, setForm] = useState({
    name: "",
    amount: "",
    type: "Outside",
  });

  const totalDonation = donations.reduce(
    (sum, d) => sum + d.amount,
    0
  );

  /* ================= ADD DONATION ================= */
  const addDonation = () => {
    if (!form.name || !form.amount) return;

    setDonations([
      {
        id: Date.now(),
        name: form.name,
        amount: Number(form.amount),
        type: form.type,
        date: new Date().toISOString().split("T")[0],
      },
      ...donations,
    ]);

    setForm({ name: "", amount: "", type: "Outside" });
  };

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div>
        <h2 className="text-xl font-semibold">Donations</h2>
        <p className="text-sm text-gray-500">
          Puja-time & outside donations
        </p>
      </div>

      {/* ================= TOTAL CARD ================= */}
      <div className="bg-green-600 text-white rounded-xl p-6 flex items-center gap-4">
        <div className="bg-white/20 p-3 rounded-lg">
          <IndianRupee />
        </div>
        <div>
          <p className="text-sm opacity-90">Total Donations</p>
          <h3 className="text-2xl font-bold">
            ₹ {totalDonation}
          </h3>
        </div>
      </div>

      {/* ================= ADD DONATION ================= */}
      <div className="bg-white rounded-xl shadow p-6 max-w-lg">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <PlusCircle size={18} /> Add Donation
        </h3>

        <label className="text-sm font-medium">
          Donor Name
        </label>
        <input
          className="w-full border rounded-lg px-3 py-2 mb-3"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <label className="text-sm font-medium">
          Amount
        </label>
        <input
          type="number"
          className="w-full border rounded-lg px-3 py-2 mb-3"
          value={form.amount}
          onChange={(e) =>
            setForm({ ...form, amount: e.target.value })
          }
        />

        <label className="text-sm font-medium">
          Donor Type
        </label>
        <select
          className="w-full border rounded-lg px-3 py-2 mb-4"
          value={form.type}
          onChange={(e) =>
            setForm({ ...form, type: e.target.value })
          }
        >
          <option value="Outside">Outside Donor</option>
          <option value="Member">Club Member</option>
        </select>

        <button
          onClick={addDonation}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
        >
          Save Donation
        </button>
      </div>

      {/* ====================================================
          📱 MOBILE VIEW – DONATION CARDS
      ==================================================== */}
      <div className="space-y-3 sm:hidden">
        {donations.map((d) => (
          <div
            key={d.id}
            className="bg-white rounded-xl shadow p-4"
          >
            <div className="flex justify-between">
              <p className="font-semibold">{d.name}</p>
              <p className="font-bold text-green-600">
                ₹ {d.amount}
              </p>
            </div>
            <p className="text-sm text-gray-500">
              {d.type} • {d.date}
            </p>
          </div>
        ))}
      </div>

      {/* ====================================================
          💻 DESKTOP VIEW – TABLE
      ==================================================== */}
      <div className="hidden sm:block bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-[700px] w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Donor Name</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Amount</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((d) => (
              <tr
                key={d.id}
                className="border-t hover:bg-green-50"
              >
                <td className="p-3 font-medium">{d.name}</td>
                <td className="p-3">{d.type}</td>
                <td className="p-3">{d.date}</td>
                <td className="p-3 font-semibold text-green-600">
                  ₹ {d.amount}
                </td>
              </tr>
            ))}

            {donations.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="p-6 text-center text-gray-500"
                >
                  No donations recorded
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
