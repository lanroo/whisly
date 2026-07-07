import { MaterialIcon } from '@/components/MaterialIcon';
import { Modal } from './Modal';
import './action-sheet.css';

export interface SheetAction {
  icon: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface ActionSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  actions: SheetAction[];
}

/**
 * Menu de ações em bottom-sheet (mobile-first): sobe de baixo no celular e vira
 * um diálogo centralizado no desktop — reaproveita o `Modal`. Substitui os
 * dropdowns dos "três pontinhos", que estouravam/cortavam dentro dos cards.
 */
export function ActionSheet({ open, onClose, title, actions }: ActionSheetProps) {
  return (
    <Modal className="action-sheet-modal" onClose={onClose} open={open} title={title}>
      <div className="action-sheet" role="menu">
        {actions.map((action) => (
          <button
            className={`action-sheet__item${action.danger ? ' action-sheet__item--danger' : ''}`}
            disabled={action.disabled}
            key={action.label}
            onClick={() => {
              onClose();
              action.onClick();
            }}
            role="menuitem"
            type="button"
          >
            <MaterialIcon name={action.icon} />
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
