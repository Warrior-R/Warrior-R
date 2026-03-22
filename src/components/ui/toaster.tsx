"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error" | "info";
}

let toastQueue: Array<(toast: Toast) => void> = [];

export function toast(options: Omit<Toast, "id">) {
  const id = Math.random().toString(36).slice(2);
  toastQueue.forEach((handler) => handler({ ...options, id }));
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (toast: Toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4000);
    };

    toastQueue.push(handler);
    return () => {
      toastQueue = toastQueue.filter((h) => h !== handler);
    };
  }, []);

  const icons = {
    default: <Info className="w-5 h-5 text-blue-600" />,
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <XCircle className="w-5 h-5 text-red-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-start gap-3 rounded-xl p-4 shadow-lg border max-w-sm",
            "animate-in slide-in-from-right-5",
            t.variant === "error" ? "bg-red-50 border-red-200" :
            t.variant === "success" ? "bg-green-50 border-green-200" :
            "bg-white border-gray-200"
          )}
        >
          {icons[t.variant || "default"]}
          <div className="flex-1">
            <p className="font-semibold text-sm text-gray-900">{t.title}</p>
            {t.description && <p className="text-xs text-gray-600 mt-0.5">{t.description}</p>}
          </div>
          <button
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
