import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
      {/* Shimmer Effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-slate-100/50 to-transparent"></div>

      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3 flex-1">
          {/* Avatar Skeleton */}
          <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0"></div>
          
          <div className="min-w-0 flex-1 space-y-2">
            {/* Name Skeleton */}
            <div className="h-4 w-32 bg-slate-200 rounded"></div>
            
            {/* Badge/Email Skeleton */}
            <div className="flex flex-col gap-1">
               <div className="h-3 w-16 bg-slate-200 rounded"></div>
               <div className="h-3 w-24 bg-slate-100 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}