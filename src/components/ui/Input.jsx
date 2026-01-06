import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Input = React.forwardRef(({ className, icon: Icon, suffix, error, label, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
          {label}
        </label>
      )}
      
      <div className="relative group">
        {/* LEFT ICON */}
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        
        <input
          ref={ref}
          className={cn(
            "w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl py-3 transition-all",
            "placeholder:text-slate-400",
            "focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10",
            Icon ? "pl-10" : "px-4", // Left padding if icon exists
            suffix ? "pr-10" : "pr-4", // Right padding if suffix exists
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/10",
            className
          )}
          {...props}
        />

        {/* RIGHT SUFFIX (Action Slot) */}
        {suffix && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {suffix}
          </div>
        )}
      </div>
      
      {error && <p className="text-xs text-red-500 mt-1 ml-1 font-medium">{error}</p>}
    </div>
  );
});

Input.displayName = "Input";