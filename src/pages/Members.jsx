import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Search, ChevronRight } from "lucide-react";

export default function Members() {
  const navigate = useNavigate();

  const [members, setMembers] = useState([
    {
      id: 1,
      name: "Rahul Kumar",
      email: "rahul@clubname.com",
      role: "member",
      pujaContribution: {
        amount: 1500,
        date: "2025-02-12",
      },
    },
    {
      id: 2,
      name: "Amit Singh",
      email: "amit@clubname.com",
      role: "admin",
      pujaContribution: null,
    },
  ]);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    role: "member",
  });

  const addMember = () => {
    if (!newMember.name || !newMember.email) return;

    setMembers([
      ...members,
      {
        id: Date.now(),
        ...newMember,
        pujaContribution: null,
      },
    ]);

    setNewMember({ name: "", email: "", role: "member" });
    setShowForm(false);
  };

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
        <h2 className="text-xl font-semibold">Members</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <UserPlus size={18} /> Add Member
        </button>
      </div>

      {/* ADD MEMBER */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow max-w-lg">
          <input
            placeholder="Name"
            className="w-full border rounded-lg px-3 py-2 mb-3"
            value={newMember.name}
            onChange={(e) =>
              setNewMember({ ...newMember, name: e.target.value })
            }
          />
          <input
            placeholder="email@clubname.com"
            className="w-full border rounded-lg px-3 py-2 mb-3"
            value={newMember.email}
            onChange={(e) =>
              setNewMember({ ...newMember, email: e.target.value })
            }
          />
          <select
            className="w-full border rounded-lg px-3 py-2 mb-3"
            value={newMember.role}
            onChange={(e) =>
              setNewMember({ ...newMember, role: e.target.value })
            }
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>

          <div className="flex gap-3">
            <button
              onClick={addMember}
              className="bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-300 px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-xl shadow flex items-center gap-3 max-w-md">
        <Search size={18} className="text-gray-400" />
        <input
          placeholder="Search member"
          className="w-full outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* MOBILE VIEW */}
      <div className="space-y-3 sm:hidden">
        {filteredMembers.map((m) => (
          <div
            key={m.id}
            onClick={() => navigate(`/dashboard/members/${m.id}`)}
            className="bg-white rounded-xl shadow p-4 flex justify-between items-center cursor-pointer"
          >
            <div>
              <p className="font-semibold">{m.name}</p>
              <p className="text-sm text-gray-500">{m.email}</p>
              <p
                className={`text-xs mt-1 font-semibold ${
                  m.pujaContribution ? "text-green-600" : "text-red-500"
                }`}
              >
                Puja:{" "}
                {m.pujaContribution
                  ? `₹ ${m.pujaContribution.amount}`
                  : "Not Paid"}
              </p>
            </div>
            <ChevronRight />
          </div>
        ))}
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden sm:block bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-[700px] w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Puja Contribution</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((m) => (
              <tr
                key={m.id}
                onClick={() => navigate(`/dashboard/members/${m.id}`)}
                className="border-t hover:bg-indigo-50 cursor-pointer"
              >
                <td className="p-3 font-medium">{m.name}</td>
                <td className="p-3">{m.email}</td>
                <td className="p-3 capitalize">{m.role}</td>
                <td
                  className={`p-3 font-semibold ${
                    m.pujaContribution ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {m.pujaContribution
                    ? `₹ ${m.pujaContribution.amount}`
                    : "Not Paid"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
