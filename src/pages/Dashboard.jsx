import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function Dashboard({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <Sidebar open={open} setOpen={setOpen} />

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">
        <Navbar setOpen={setOpen} />

        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
