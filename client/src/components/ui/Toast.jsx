import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const push = useCallback((type, text, ttl = 4500) => {
    const id = nextId++;
    setToasts((t) => [...t, { id, type, text }]);
    timers.current[id] = setTimeout(() => dismiss(id), ttl);
  }, [dismiss]);

  const value = useMemo(() => ({
    toasts,
    success: (text) => push('success', text),
    error: (text) => push('error', text),
    dismiss,
  }), [toasts, push, dismiss]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

/** Renders toasts from context — mount once near the app root. */
export function ToastViewport() {
  const { toasts, dismiss } = useToast();
  if (!toasts.length) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${
            t.type === 'error'
              ? 'border-crimson/40 bg-crimson text-blush'
              : 'border-bordeaux/10 bg-white text-bordeaux'
          }`}
        >
          <span className="text-sm leading-relaxed">{t.text}</span>
          <button
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss notification"
            className="ml-auto shrink-0 opacity-60 transition-opacity hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
