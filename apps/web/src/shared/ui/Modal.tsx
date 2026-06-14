import { useCallback, useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { MaterialIcon } from '@/components/MaterialIcon';
import './modal.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function Modal({ open, onClose, title, children, className = '' }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) {
        return;
      }

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => el.offsetParent !== null);

      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    const dialog = dialogRef.current;
    const firstFocusable = dialog?.querySelector<HTMLElement>(FOCUSABLE);
    (firstFocusable ?? dialog)?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = overflow;
      previouslyFocused.current?.focus();
    };
  }, [open, handleKeyDown]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        ref={dialogRef}
        aria-labelledby={title ? titleId : undefined}
        aria-modal="true"
        className={`modal ${className}`.trim()}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        tabIndex={-1}
      >
        {title ? (
          <header className="modal__header">
            <h2 className="modal__title" id={titleId}>
              {title}
            </h2>
            <button
              aria-label="Fechar"
              className="modal__close"
              onClick={onClose}
              type="button"
            >
              <MaterialIcon name="close" />
            </button>
          </header>
        ) : null}
        <div className="modal__body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
