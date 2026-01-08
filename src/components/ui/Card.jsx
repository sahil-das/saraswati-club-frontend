import React from "react";

export function Card({ children, className = "", noPadding = false }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-[var(--radius-xl)] shadow-sm ${className}`}>
      <div className={noPadding ? "" : "p-6"}>
        {children}
      </div>
    </div>
  );
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}