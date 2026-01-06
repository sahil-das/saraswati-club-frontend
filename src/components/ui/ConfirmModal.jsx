// src/components/ui/ConfirmModal.jsx
import Modal from "./Modal";
import { AlertTriangle } from "lucide-react";
import { Button } from "./Button"; // Using your existing Button component

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  isDangerous = false,
  isLoading = false
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4">
        {/* Icon & Message */}
        <div className="flex gap-4">
          <div className={`shrink-0 p-3 rounded-full ${isDangerous ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <h4 className="font-bold text-slate-700">Confirmation Required</h4>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-50">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            variant={isDangerous ? "danger" : "primary"} 
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}