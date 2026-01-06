import React from "react";
import { Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for merging tailwind classes safely
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Button = React.forwardRef(({ 
  className, 
  variant = "primary", 
  size = "md", 
  isLoading = false, 
  leftIcon, 
  rightIcon, 
  children, 
  disabled, 
  ...props 
}, ref) => {
  
  const baseStyles = "inline-flex items-center justify-center rounded-[var(--radius-button)] font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-primary-200";
  
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-200",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
    outline: "border-2 border-primary-600 text-primary-600 hover:bg-primary-50"
  };

  const sizes = {
    sm: "h-9 px-3 text-xs",
    md: "h-11 px-5 text-sm",
    lg: "h-14 px-8 text-base",
    icon: "h-10 w-10 p-2"
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = "Button";