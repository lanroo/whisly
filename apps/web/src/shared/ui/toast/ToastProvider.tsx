import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { MaterialIcon } from '@/components/MaterialIcon';
import { ToastContext } from './ToastContext';
import type { ToastItem, ToastOptions, ToastVariant } from './types';
import './toast.css';

const DEFAULT_DURATION = 4000;

const VARIANT_ICON: Record<ToastVariant, string> = {
  info: 'info',
  success: 'check_circle',
  warning: 'warning',
  error: 'error',
};

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idCounter = useRef(0);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const show = useCallback(
    (options: ToastOptions) => {
      idCounter.current += 1;
      const id = `toast-${idCounter.current}`;
      const toast: ToastItem = { variant: 'info', duration: DEFAULT_DURATION, ...options, id };

      setToasts((current) => [...current, toast]);

      if (toast.duration && toast.duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), toast.duration),
        );
      }

      return id;
    },
    [dismiss],
  );

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="toast-viewport">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast--${toast.variant ?? 'info'}`}
            role={toast.variant === 'error' ? 'alert' : 'status'}
          >
            <MaterialIcon className="toast__icon" name={VARIANT_ICON[toast.variant ?? 'info']} />
            <div className="toast__body">
              {toast.title ? <strong className="toast__title">{toast.title}</strong> : null}
              {toast.description ? <p className="toast__description">{toast.description}</p> : null}
            </div>
            <button
              aria-label="Fechar notificação"
              className="toast__close"
              onClick={() => dismiss(toast.id)}
              type="button"
            >
              <MaterialIcon name="close" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
