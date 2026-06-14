export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  /** Tempo em ms até sumir automaticamente. 0 = não fecha sozinho. */
  duration?: number;
}

export interface ToastItem extends ToastOptions {
  id: string;
}

export interface ToastContextValue {
  /** Exibe um toast e retorna o id (para dispensar manualmente, se preciso). */
  show: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
}
