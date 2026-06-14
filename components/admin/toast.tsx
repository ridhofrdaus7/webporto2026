"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode
} from "react";

/* ─── Types ───────────────────────────────────────────────── */

type ToastVariant = "success" | "error";

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
  /** timestamp when auto‑dismiss fires */
  expiresAt: number;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

/* ─── Provider ────────────────────────────────────────────── */

const TOAST_DURATION = 4000;

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (message: string, variant: ToastVariant) => {
      const id = ++nextId;
      const expiresAt = Date.now() + TOAST_DURATION;
      setToasts((prev) => [...prev, { id, message, variant, expiresAt }]);

      const timer = setTimeout(() => dismiss(id), TOAST_DURATION);
      timersRef.current.set(id, timer);
    },
    [dismiss]
  );

  const success = useCallback((msg: string) => push(msg, "success"), [push]);
  const error = useCallback((msg: string) => push(msg, "error"), [push]);

  /* cleanup on unmount */
  useEffect(() => {
    const map = timersRef.current;
    return () => map.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <ToastContext.Provider value={{ success, error }}>
      {children}

      {/* ─── Toast Container (bottom‑right, above everything) ─── */}
      <div
        aria-live="polite"
        className="toast-container"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast-item ${t.variant === "success" ? "toast-success" : "toast-error"}`}
            onClick={() => dismiss(t.id)}
            role="status"
          >
            {/* Icon */}
            <span className="toast-icon">
              {t.variant === "success" ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="currentColor" opacity="0.2" />
                  <path d="M6 10.5l2.5 2.5 5.5-5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="currentColor" opacity="0.2" />
                  <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </span>

            {/* Message */}
            <span className="toast-message">{t.message}</span>

            {/* Close button */}
            <button
              className="toast-close"
              onClick={(e) => {
                e.stopPropagation();
                dismiss(t.id);
              }}
              aria-label="Dismiss"
            >
              ×
            </button>

            {/* Progress bar */}
            <span
              className="toast-progress"
              style={{ animationDuration: `${TOAST_DURATION}ms` }}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
