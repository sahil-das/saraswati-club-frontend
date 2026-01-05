import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Navigate } from "react-router-dom";
import { Building2, ChevronRight, LogOut } from "lucide-react"; // Make sure to install lucide-react

export default function Login() {
  const { user, activeClub, login, selectClub, logout } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  
  // Local state for the "Select Club" UI
  const [showClubSelection, setShowClubSelection] = useState(false);
  const [userClubs, setUserClubs] = useState([]);

  // 🔒 Redirect: Only if User AND Active Club are set
  if (user && activeClub) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data) => {
    try {
      const clubs = await login(data.email, data.password);
      
      if (clubs.length === 0) {
        alert("You are not a member of any club.");
        logout();
      } else if (clubs.length === 1) {
        // Only 1 club? Auto-select and go!
        selectClub(clubs[0]);
        navigate("/");
      } else {
        // Multiple clubs? Show selection screen
        setUserClubs(clubs);
        setShowClubSelection(true);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Invalid credentials");
    }
  };

  const handleClubSelect = (club) => {
    selectClub(club);
    navigate("/");
  };

  // 🌟 RENDER: CLUB SELECTION SCREEN
  if (showClubSelection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="text-center mb-6">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="text-indigo-600 w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Select Organization</h2>
            <p className="text-gray-500">Welcome, {user?.name}</p>
          </div>

          <div className="space-y-3">
            {userClubs.map((club) => (
              <button
                key={club.clubId}
                onClick={() => handleClubSelect(club)}
                className="w-full flex items-center justify-between p-4 border rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition group"
              >
                <div className="text-left">
                  <h3 className="font-semibold text-gray-800">{club.clubName}</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{club.role}</p>
                </div>
                <ChevronRight className="text-gray-300 group-hover:text-indigo-500" />
              </button>
            ))}
          </div>

          <button 
            onClick={() => { setShowClubSelection(false); logout(); }}
            className="mt-6 w-full flex items-center justify-center gap-2 text-gray-400 hover:text-red-500 transition py-2"
          >
            <LogOut size={16} />
            <span>Sign in with different account</span>
          </button>
        </div>
      </div>
    );
  }

  // 🌟 RENDER: LOGIN FORM
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">
          SaaS Club Login
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            {...register("email", { required: "Email is required" })}
            className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="name@example.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            {...register("password", { required: "Password is required" })}
            className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded-xl hover:bg-indigo-700 transition"
        >
          Continue
        </button>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Want to start a new club?{" "}
            <a href="/register" className="text-indigo-600 font-bold hover:underline">
              Create Organization
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}