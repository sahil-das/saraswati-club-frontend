import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useFinance } from "../context/FinanceContext";

export default function Expenses() {
  const { user } = useAuth();
  const { centralFund, setApprovedExpenses } = useFinance();

  const [expenses, setExpenses] = useState([
    {
      id: 1,
      title: "Puja Samagri",
      amount: 2500,
      addedBy: "rahul@clubname.com",
      status: "approved",
    },
    {
      id: 2,
      title: "Decoration",
      amount: 1800,
      addedBy: "amit@clubname.com",
      status: "pending",
    },
  ]);

  const [form, setForm] = useState({
    title: "",
    amount: "",
  });

  // ADD NEW EXPENSE (MEMBER)
  const addExpense = () => {
    if (!form.title || !form.amount) return;

    setExpenses([
      ...expenses,
      {
        id: Date.now(),
        title: form.title,
        amount: Number(form.amount),
        addedBy: user.email,
        status: "pending",
      },
    ]);

    setForm({ title: "", amount: "" });
  };

  // APPROVE EXPENSE (ADMIN)
  const approveExpense = (id) => {
    const expense = expenses.find((e) => e.id === id);
    if (!expense || expense.status === "approved") return;

    // deduct from central fund
    setApprovedExpenses((prev) => prev + expense.amount);

    setExpenses(
      expenses.map((e) =>
        e.id === id ? { ...e, status: "approved" } : e
      )
    );
  };

    return (
    <div>
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center mb-6">
        <h2 className="text-xl font-semibold">Expenses</h2>

        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-semibold w-fit">
            Central Fund: ₹ {centralFund}
        </div>
        </div>

        {/* ADD EXPENSE FORM */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow mb-6 w-full sm:max-w-md">
        <h3 className="font-semibold mb-4">Add Expense</h3>

        <input
            placeholder="Expense title"
            value={form.title}
            onChange={(e) =>
            setForm({ ...form, title: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2 mb-3"
        />

        <input
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) =>
            setForm({ ...form, amount: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2 mb-4"
        />

        <button
            onClick={addExpense}
            className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
            Submit Expense
        </button>
        </div>

        {/* EXPENSE TABLE */}
        <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-[700px] w-full">
            <thead className="bg-gray-100 text-sm">
            <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Added By</th>
                <th className="p-3">Status</th>
                {user.role === "admin" && <th className="p-3">Action</th>}
            </tr>
            </thead>
            <tbody>
            {expenses.map((e) => (
                <tr key={e.id} className="border-t">
                <td className="p-3">{e.title}</td>
                <td className="p-3">₹ {e.amount}</td>
                <td className="p-3 text-sm">{e.addedBy}</td>
                <td className="p-3">
                    <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        e.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                    >
                    {e.status}
                    </span>
                </td>

                {user.role === "admin" && (
                    <td className="p-3">
                    {e.status === "pending" && (
                        <button
                        onClick={() => approveExpense(e.id)}
                        className="text-indigo-600 font-semibold hover:underline"
                        >
                        Approve
                        </button>
                    )}
                    </td>
                )}
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    </div>
    );

}
