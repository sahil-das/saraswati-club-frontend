// src/components/ui/Toast.jsx
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

const toastVariants = {
  initial: { opacity: 0, y: 20, scale: 0.9 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.2 } }
};

const icons = {
  success: <CheckCircle className="text-emerald-500" size={20} />,
  error: <XCircle className="text-red-500" size={20} />,
  info: <Info className="text-blue-500" size={20} />
};

const borders = {
  success: "border-emerald-100 bg-emerald-50/80",
  error: "border-red-100 bg-red-50/80",
  info: "border-blue-100 bg-blue-50/80"
};

export default function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, removeToast }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast, removeToast]);

  return (
    <motion.div
      layout
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md ${borders[toast.type] || borders.info}`}
    >
      <div className="mt-0.5 shrink-0">{icons[toast.type] || icons.info}</div>
      <div className="flex-1">
        <h4 className={`text-sm font-bold capitalize ${toast.type === 'error' ? 'text-red-800' : 'text-slate-800'}`}>
          {toast.type}
        </h4>
        <p className="text-sm text-slate-600 leading-relaxed">
          {toast.message}
        </p>
      </div>
      <button 
        onClick={() => removeToast(toast.id)}
        className="text-slate-400 hover:text-slate-600 transition-colors"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}