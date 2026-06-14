import { useMemo, useState, type ReactNode, type TouchEvent } from 'react';
import { MaterialIcon } from './MaterialIcon';

const MAX_PULL = 92;
const TRIGGER_PULL = 60;
const HOLD_PULL = 52;

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh?: () => void | Promise<void>;
}

export function PullToRefresh({ children, onRefresh }: PullToRefreshProps) {
  const [startY, setStartY] = useState<number | null>(null);
  const [distance, setDistance] = useState(0);
  const [ready, setReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const progress = useMemo(() => Math.min(1, distance / TRIGGER_PULL), [distance]);

  async function runRefresh() {
    if (refreshing) {
      return;
    }

    setRefreshing(true);
    setDistance(HOLD_PULL);

    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        window.location.reload();
      }
    } finally {
      setRefreshing(false);
      setDistance(0);
      setReady(false);
    }
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    if (refreshing || window.scrollY > 0 || event.touches.length !== 1) {
      return;
    }

    setStartY(event.touches[0].clientY);
  }

  function handleTouchMove(event: TouchEvent<HTMLDivElement>) {
    if (startY === null || refreshing) {
      return;
    }

    const delta = event.touches[0].clientY - startY;

    if (delta <= 0 || window.scrollY > 0) {
      setDistance(0);
      setReady(false);
      return;
    }

    if (event.cancelable) {
      event.preventDefault();
    }

    const dampedDistance = Math.min(MAX_PULL, delta * 0.42);
    setDistance(dampedDistance);
    setReady(dampedDistance >= TRIGGER_PULL);
  }

  function resetPull() {
    setStartY(null);

    if (!refreshing) {
      setDistance(0);
      setReady(false);
    }
  }

  async function handleTouchEnd() {
    if (startY === null) {
      return;
    }

    setStartY(null);

    if (ready) {
      await runRefresh();
      return;
    }

    setDistance(0);
    setReady(false);
  }

  return (
    <div
      className={`pull-refresh ${refreshing ? 'is-refreshing' : ''} ${ready ? 'is-ready' : ''}`.trim()}
      onTouchCancel={resetPull}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
    >
      <div
        className="pull-refresh__indicator"
        style={{
          opacity: progress,
          transform: `translate(-50%, ${Math.max(0, 28 - distance * 0.32)}px) scale(${0.82 + progress * 0.18})`,
        }}
      >
        <MaterialIcon className={refreshing ? 'pull-refresh__spinner' : ''} name="refresh" />
        <span>
          {refreshing
            ? 'Atualizando...'
            : ready
              ? 'Solte para atualizar'
              : 'Puxe para atualizar'}
        </span>
      </div>

      <div
        className={`pull-refresh__content ${startY !== null && !refreshing ? 'is-pulling' : ''}`.trim()}
      >
        {children}
      </div>
    </div>
  );
}
