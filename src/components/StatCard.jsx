import { clsx } from "clsx";

export default function StatCard({ 
  title, 
  label, 
  amount, 
  value, 
  icon: Icon, 
  variant, 
  color,   
  subtext,
  onClick,
  highlight = false 
}) {
  
  // Normalize props
  const displayTitle = title || label;
  const displayAmount = amount !== undefined ? amount : value;
  const displayVariant = variant || color || "neutral";

  // Color Themes
  const variants = {
    primary: "bg-indigo-600 text-white shadow-xl shadow-indigo-200 ring-2 ring-indigo-600 ring-offset-2",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    danger: "bg-rose-50 text-rose-700 border border-rose-100",
    neutral: "bg-white text-gray-600 border border-gray-200 shadow-sm",
    blue: "bg-blue-50 text-blue-700 border border-blue-100",
    rose: "bg-rose-50 text-rose-700 border border-rose-100",
    indigo: "bg-indigo-50 text-indigo-700 border border-indigo-100",
    amber: "bg-amber-50 text-amber-700 border border-amber-100",
    emerald: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  };

  // Icon Backgrounds (for light variants)
  const iconBgs = {
    primary: "bg-white/20 text-white",
    success: "bg-emerald-100 text-emerald-600",
    danger: "bg-rose-100 text-rose-600",
    neutral: "bg-gray-100 text-gray-500",
    blue: "bg-blue-100 text-blue-600",
    rose: "bg-rose-100 text-rose-600",
    indigo: "bg-indigo-100 text-indigo-600",
    amber: "bg-amber-100 text-amber-600",
    emerald: "bg-emerald-100 text-emerald-600",
  };

  // 1. HIGHLIGHT MODE (Dark Card) - Fixed Background Color
  if (highlight) {
    return (
      <div className="relative overflow-hidden rounded-2xl p-5 bg-gray-900 text-white shadow-xl border border-gray-800 transition-transform hover:-translate-y-1">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-400">
              {displayTitle}
            </p>
            <h2 className="text-2xl lg:text-3xl font-bold font-mono tracking-tight text-white">
              {typeof displayAmount === 'number' ? `₹${displayAmount.toLocaleString()}` : displayAmount}
            </h2>
            {subtext && <p className="text-xs mt-1 font-medium text-gray-500">{subtext}</p>}
          </div>
          {Icon && (
            <div className="p-3 rounded-xl bg-gray-800 text-indigo-400">
              <Icon size={20} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. STANDARD MODE
  return (
    <div 
      onClick={onClick}
      className={clsx(
        "relative overflow-hidden rounded-2xl p-5 transition-all duration-300 border",
        variants[displayVariant] || variants.neutral,
        onClick && "cursor-pointer hover:-translate-y-1 hover:shadow-md"
      )}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className={clsx(
            "text-xs font-bold uppercase tracking-wider mb-1", 
            displayVariant === 'primary' ? 'text-indigo-100' : 'text-gray-500'
          )}>
            {displayTitle}
          </p>
          <h2 className="text-2xl lg:text-3xl font-bold font-mono tracking-tight">
            {typeof displayAmount === 'number' ? `₹${displayAmount.toLocaleString()}` : displayAmount}
          </h2>
          {subtext && (
            <p className={clsx(
              "text-xs mt-1 font-medium",
              displayVariant === 'primary' ? 'text-indigo-200' : 'text-gray-400'
            )}>
              {subtext}
            </p>
          )}
        </div>
        
        {Icon && (
          <div className={clsx("p-3 rounded-xl", iconBgs[displayVariant] || iconBgs.neutral)}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
}