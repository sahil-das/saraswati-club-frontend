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

  // Color Themes (Light + Dark Support)
  const variants = {
    primary: "bg-primary-600 text-white shadow-xl shadow-primary-200 dark:shadow-none ring-2 ring-primary-600 ring-offset-2 dark:ring-offset-slate-900",
    
    neutral: "bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)] shadow-sm",
    
    // Semantic & Color Variants
    success: "bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/20",
    danger:  "bg-rose-50 dark:bg-rose-900/10 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/20",
    warning: "bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/20",
    
    // Brand Colors
    blue:    "bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/20",
    indigo:  "bg-indigo-50 dark:bg-indigo-900/10 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/20",
    purple:  "bg-purple-50 dark:bg-purple-900/10 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-900/20",
    emerald: "bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/20",
    amber:   "bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/20",
  };

  // Icon Backgrounds (Light mode tints + Dark mode translucent equivalents)
  const iconBgs = {
    primary: "bg-white/20 text-white",
    neutral: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
    
    success: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    danger:  "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400",
    warning: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400",
    
    blue:    "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
    indigo:  "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400",
    purple:  "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400",
    emerald: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    amber:   "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400",
  };

  // 1. HIGHLIGHT MODE (Fixed Dark Card for emphasis, even in light mode)
  if (highlight) {
    return (
      <div className="relative overflow-hidden rounded-2xl p-5 bg-slate-900 dark:bg-black text-white shadow-xl border border-slate-800 transition-transform hover:-translate-y-1">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-1 text-slate-400">
              {displayTitle}
            </p>
            <h2 className="text-2xl lg:text-3xl font-bold font-mono tracking-tight text-white">
              {typeof displayAmount === 'number' ? `₹${displayAmount.toLocaleString()}` : displayAmount}
            </h2>
            {subtext && <p className="text-xs mt-1 font-medium text-slate-500">{subtext}</p>}
          </div>
          {Icon && (
            <div className="p-3 rounded-xl bg-slate-800 text-indigo-400 border border-slate-700">
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
            displayVariant === 'primary' ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'
          )}>
            {displayTitle}
          </p>
          <h2 className={clsx(
            "text-2xl lg:text-3xl font-bold font-mono tracking-tight",
            displayVariant === 'primary' ? "text-white" : "text-[var(--text-main)]"
          )}>
            {typeof displayAmount === 'number' ? `₹${displayAmount.toLocaleString()}` : displayAmount}
          </h2>
          {subtext && (
            <p className={clsx(
              "text-xs mt-1 font-medium",
              displayVariant === 'primary' ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'
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