import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { MaterialIcon } from '../components/MaterialIcon';
import {
  useActivity,
  useMarkActivityRead,
  type ActivityEntry,
} from '../features/activity/api';
import { MAIN_NAV_ITEMS } from '../shared/config/navigation';
import { EmptyState, Skeleton } from '../shared/ui';

const ICON: Record<ActivityEntry['type'], string> = {
  reservation: 'redeem',
  collaborator_added: 'group_add',
  item_added: 'add_shopping_cart',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} d`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w} sem`;
  const mo = Math.floor(d / 30);
  return `${mo} mês${mo > 1 ? 'es' : ''}`;
}

function renderMessage(item: ActivityEntry) {
  const list = item.listTitle ?? 'uma lista';
  const actor = item.actorName ?? 'Alguém';
  switch (item.type) {
    case 'reservation':
      return (
        <>
          🎁 Alguém reservou um presente da sua lista <strong>{list}</strong>.
        </>
      );
    case 'collaborator_added':
      return (
        <>
          <strong>{actor}</strong> adicionou você à lista <strong>{list}</strong>.
        </>
      );
    case 'item_added':
      return (
        <>
          <strong>{actor}</strong> adicionou {item.itemTitle ? <strong>{item.itemTitle}</strong> : 'um item'}{' '}
          em <strong>{list}</strong>.
        </>
      );
    default:
      return null;
  }
}

export function ActivityPage() {
  const { data: feed, isLoading } = useActivity();
  const markRead = useMarkActivityRead();
  const entries = feed ?? [];

  // Ao abrir, marca tudo como lido (limpa o badge do sino).
  useEffect(() => {
    if (entries.some((e) => !e.read)) {
      markRead.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries.length]);

  return (
    <AppShell
      className="activity-shell"
      enablePullToRefresh
      navItems={MAIN_NAV_ITEMS}
      showFab={false}
    >
      <header className="wishly-home-topbar">
        <div className="wishly-home-topbar__inner">
          <Link aria-label="Voltar" className="icon-button" to="/home">
            <MaterialIcon name="chevron_left" />
          </Link>
          <div className="wishly-home-topbar__brand activity-topbar__brand">
            <span>Atividade</span>
          </div>
          <div className="activity-topbar__spacer" />
        </div>
      </header>

      <main className="page activity-page">
        {isLoading ? (
          <section className="activity-feed">
            <Skeleton height={68} width="100%" />
            <Skeleton height={68} width="100%" />
            <Skeleton height={68} width="100%" />
          </section>
        ) : entries.length === 0 ? (
          <EmptyState
            description="Reservas, novos colaboradores e itens em listas compartilhadas aparecem aqui."
            icon="notifications"
            title="Nenhuma atividade ainda"
          />
        ) : (
          <section className="activity-feed">
            {entries.map((item) => {
              const body = (
                <>
                  <div className={`activity-item__icon activity-item__icon--${item.type}`}>
                    <MaterialIcon name={ICON[item.type]} />
                  </div>
                  <div className="activity-item__body">
                    <p>{renderMessage(item)}</p>
                    <span>{timeAgo(item.createdAt)}</span>
                  </div>
                  {!item.read ? <span className="activity-item__dot" /> : null}
                </>
              );
              return item.listId ? (
                <Link className="activity-item" key={item.id} to={`/lists/${item.listId}`}>
                  {body}
                </Link>
              ) : (
                <article className="activity-item" key={item.id}>
                  {body}
                </article>
              );
            })}
          </section>
        )}
      </main>
    </AppShell>
  );
}
