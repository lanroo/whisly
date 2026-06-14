import { BottomNav } from './BottomNav';
import { FloatingActionButton } from './FloatingActionButton';
import { PullToRefresh } from './PullToRefresh';

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
}) {
  const content = enablePullToRefresh ? (
    <PullToRefresh onRefresh={onPullToRefresh}>{children}</PullToRefresh>
  ) : (
    children
  );

  return (
    <div className={`app-shell ${className}`.trim()}>
      {content}
      {showFab ? (
        <FloatingActionButton
          icon={fabIcon}
          label={fabLabel}
          onClick={fabOnClick}
          to={fabTo}
        />
      ) : null}
      <BottomNav activeKey={activeNavKey} items={navItems} />
    </div>
  );
}
