import React from 'react';
import { Loader2 } from 'lucide-react';
import { useLoading } from './LoadingContext';

export default function LoadingOverlay() {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity"
      role="status"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center bg-white p-6 rounded-2xl shadow-2xl">
        <Loader2 className="h-10 w-10 animate-spin text-primary-600 mb-2" />
        <p className="text-slate-600 font-medium">Please wait...</p>
      </div>
    </div>
  );
}