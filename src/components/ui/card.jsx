import React from "react";

export function Card({ children, className = "", noPadding = false }) {
  return (
    <div className={`bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-xl)] shadow-sm ${className}`}>
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
        <h3 className="text-lg font-bold text-[var(--text-main)] tracking-tight">{title}</h3>
        {subtitle && <p className="text-sm text-[var(--text-muted)] mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}