import { useContext } from 'react';
import { ToastContext } from './ToastContext';

/** Acessa o sistema de toasts. Deve estar dentro de <ToastProvider>. */
export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast deve ser usado dentro de <ToastProvider>.');
  }

  return context;
}
