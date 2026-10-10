import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  description?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-3.5 rounded-xl border shadow-xl flex items-start gap-3 transform transition-all duration-200 animate-in slide-in-from-bottom-2 ${
            toast.type === "success"
              ? "bg-white border-emerald-200 text-gray-900"
              : toast.type === "error"
              ? "bg-white border-rose-200 text-gray-900"
              : "bg-white border-indigo-200 text-gray-900"
          }`}
        >
          <div className="mt-0.5">
            {toast.type === "success" && (
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
            )}
            {toast.type === "error" && (
              <AlertCircle className="h-4.5 w-4.5 text-rose-600" />
            )}
            {toast.type === "info" && (
              <Info className="h-4.5 w-4.5 text-indigo-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-gray-900">{toast.title}</h4>
            {toast.description && (
              <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                {toast.description}
              </p>
            )}
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-gray-400 hover:text-gray-600 p-0.5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
