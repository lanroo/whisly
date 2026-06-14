import type { ReactNode } from 'react';
import type { NavItem } from '../types/ui';
import { BottomNav } from './BottomNav';
import { FloatingActionButton } from './FloatingActionButton';
import { PullToRefresh } from './PullToRefresh';

interface AppShellProps {
  children: ReactNode;
  navItems?: NavItem[];
  activeNavKey?: string;
  fabIcon?: string;
  fabLabel?: string;
  fabTo?: string;
  fabOnClick?: () => void;
  className?: string;
  showFab?: boolean;
  enablePullToRefresh?: boolean;
  onPullToRefresh?: () => void | Promise<void>;
}

export function AppShell({
  children,
  fabIcon = 'add',
  fabLabel = 'Adicionar',
  fabTo,
  fabOnClick,
  navItems,
  activeNavKey,
  className = '',
  showFab = true,
  enablePullToRefresh = false,
  onPullToRefresh,
}: AppShellProps) {
  const content = enablePullToRefresh ? (
    <PullToRefresh onRefresh={onPullToRefresh}>{children}</PullToRefresh>
  ) : (
    children
  );

  return (
    <div className={`app-shell ${className}`.trim()}>
      {content}
      {showFab ? (
        <FloatingActionButton icon={fabIcon} label={fabLabel} onClick={fabOnClick} to={fabTo} />
      ) : null}
      <BottomNav activeKey={activeNavKey} items={navItems} />
    </div>
  );
}
