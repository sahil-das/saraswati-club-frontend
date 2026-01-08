import { path } from "framer-motion/client";
import { 
  LayoutDashboard, Users, Wallet, CreditCard, Heart,Sparkles,PieChart,
  IndianRupee, History, Settings, FileText, Archive, CalendarRange 
} from "lucide-react";

const NAV_ITEMS = [
  { 
    label: "Dashboard", 
    path: "/", 
    icon: LayoutDashboard,
    roles: ["admin", "member"] 
  },
  { 
    label: "Members", 
    path: "/members", 
    icon: Users,
    roles: ["admin", "member"] 
  },
  /* 👇 ADDED THIS MISSING LINK */
  {
    label: "My Subscriptions",
    path: "/contributions",
    icon: CalendarRange,
    roles: ["admin", "member"]
  },
  { 
    label: "Puja Chanda", 
    path: "/puja-contributions", 
    icon: Sparkles,
    roles: ["admin", "member"] 
  },
  { 
    label: "Collections Overview", 
    path: "/collections", 
    icon: Wallet,
    roles: ["admin", "member"] 
  },
  { 
    label: "Donations", 
    path: "/donations", 
    icon: Heart,
    roles: ["admin", "member"] 
  },
  { 
    label: "Expenses", 
    path: "/expenses", 
    icon: FileText,
    roles: ["admin", "member"] 
  },
  {
    label: "Audit Logs",
    path: "/audit-logs",
    icon: History,
    roles: ["admin"]
  },
  { 
    label: "Archives", 
    path: "/archives", 
    icon: Archive,
    roles: ["admin", "member"] 
  },
  // Admin Only
  { 
    label: "Reports", 
    path: "/reports", 
    icon: PieChart,
    roles: ["admin"] 
  },
  { 
    label: "Settings", 
    path: "/settings", 
    icon: Settings,
    roles: ["admin"] 
  },
];

export default NAV_ITEMS;