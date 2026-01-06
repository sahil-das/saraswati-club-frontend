import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* SIDEBAR:
        - Mobile: Hidden by default, slides in (z-50)
        - Desktop: Static width, sits in flow
      */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col h-full relative w-full transition-all duration-300">
        
        {/* TOP BAR */}
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 relative scroll-smooth">
          <div className="max-w-7xl mx-auto w-full pb-20">
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}