import React from 'react';
import { useLoading } from './LoadingContext';

export default function LoadingOverlay() {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity"
      role="status"
      aria-busy="true"
    >
      {/* CHANGES HERE:
         1. bg-white -> bg-white/80 (80% opacity)
         2. Added backdrop-blur-md (frosted glass effect)
      */}
      <div className="flex flex-col items-center bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl">
        
        {/* CUSTOM LOGO ANIMATION */}
        <div className="relative flex items-center justify-center mb-4">
          {/* Outer Ring (Spinner) */}
          <div className="absolute w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          
          {/* Logo in Center */}
          <img 
            src="/logo.png" 
            alt="Loading..." 
            className="w-10 h-10 object-contain animate-pulse" 
          />
        </div>
        
        <p className="text-slate-600 font-bold text-sm tracking-wide">LOADING</p>
      </div>
    </div>
  );
}