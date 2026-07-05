import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { MaterialIcon } from '../components/MaterialIcon';
import {
  useActivity,
  useMarkActivityRead,
  type ActivityEntry,
} from '../features/activity/api';
import { useRespondFriend } from '../features/friends/api';
import { useRespondListInvite } from '../features/lists/api';
import { MAIN_NAV_ITEMS } from '../shared/config/navigation';
import { EmptyState, Skeleton, useToast } from '../shared/ui';

const ICON: Record<ActivityEntry['type'], string> = {
  reservation: 'redeem',
  collaborator_added: 'group_add',
  item_added: 'add_shopping_cart',
  friend_request: 'person_add',
  friend_accepted: 'how_to_reg',
  list_invite: 'playlist_add',
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
          <strong>{actor}</strong> entrou na sua lista <strong>{list}</strong>. 🎉
        </>
      );
    case 'list_invite':
      return (
        <>
          {item.actorId ? (
            <Link className="activity-actor-link" to={`/u/${item.actorId}`}>
              {actor}
            </Link>
          ) : (
            <strong>{actor}</strong>
          )}{' '}
          convidou você para a lista <strong>{list}</strong>.
        </>
      );
    case 'item_added':
      return (
        <>
          <strong>{actor}</strong> adicionou {item.itemTitle ? <strong>{item.itemTitle}</strong> : 'um item'}{' '}
          em <strong>{list}</strong>.
        </>
      );
    case 'friend_request':
      return (
        <>
          {item.actorId ? (
            <Link className="activity-actor-link" to={`/u/${item.actorId}`}>
              {actor}
            </Link>
          ) : (
            <strong>{actor}</strong>
          )}{' '}
          quer ser seu amigo.
        </>
      );
    case 'friend_accepted':
      return (
        <>
          <strong>{actor}</strong> aceitou sua solicitação de amizade. 🎉
        </>
      );
    default:
      return null;
  }
}

export function ActivityPage() {
  const { data: feed, isLoading } = useActivity();
  const markRead = useMarkActivityRead();
  const respond = useRespondFriend();
  const respondInvite = useRespondListInvite();
  const toast = useToast();
  const entries = feed ?? [];

  async function handleRespond(friendshipId: string, accept: boolean) {
    try {
      await respond.mutateAsync({ friendshipId, accept });
      toast.show({
        variant: accept ? 'success' : 'info',
        title: accept ? 'Solicitação aceita' : 'Solicitação recusada',
      });
    } catch (error) {
      toast.show({
        variant: 'error',
        title: 'Não foi possível responder',
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  async function handleRespondInvite(collaboratorId: string, accept: boolean) {
    try {
      await respondInvite.mutateAsync({ collaboratorId, accept });
      toast.show({
        variant: accept ? 'success' : 'info',
        title: accept ? 'Você entrou na lista' : 'Convite recusado',
      });
    } catch (error) {
      toast.show({
        variant: 'error',
        title: 'Não foi possível responder',
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

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
              const iconAndBody = (
                <>
                  <div className={`activity-item__icon activity-item__icon--${item.type}`}>
                    <MaterialIcon name={ICON[item.type]} />
                  </div>
                  <div className="activity-item__body">
                    <p>{renderMessage(item)}</p>
                    <span>{timeAgo(item.createdAt)}</span>
                    {item.type === 'friend_request' && item.friendshipId ? (
                      <div className="activity-item__actions">
                        <button
                          className="person-add"
                          disabled={respond.isPending}
                          onClick={() => handleRespond(item.friendshipId!, true)}
                          type="button"
                        >
                          Aceitar
                        </button>
                        <button
                          className="activity-item__decline"
                          disabled={respond.isPending}
                          onClick={() => handleRespond(item.friendshipId!, false)}
                          type="button"
                        >
                          Recusar
                        </button>
                        {item.actorId ? (
                          <Link className="activity-item__profile" to={`/u/${item.actorId}`}>
                            Ver perfil
                          </Link>
                        ) : null}
                      </div>
                    ) : null}
                    {item.type === 'list_invite' && item.collaboratorId ? (
                      <div className="activity-item__actions">
                        <button
                          className="person-add"
                          disabled={respondInvite.isPending}
                          onClick={() => handleRespondInvite(item.collaboratorId!, true)}
                          type="button"
                        >
                          Aceitar
                        </button>
                        <button
                          className="activity-item__decline"
                          disabled={respondInvite.isPending}
                          onClick={() => handleRespondInvite(item.collaboratorId!, false)}
                          type="button"
                        >
                          Recusar
                        </button>
                      </div>
                    ) : null}
                  </div>
                  {!item.read ? <span className="activity-item__dot" /> : null}
                </>
              );

              if (item.type === 'friend_request' || item.type === 'list_invite') {
                return (
                  <article className="activity-item" key={item.id}>
                    {iconAndBody}
                  </article>
                );
              }
              if (item.type === 'friend_accepted' && item.actorId) {
                return (
                  <Link className="activity-item" key={item.id} to={`/u/${item.actorId}`}>
                    {iconAndBody}
                  </Link>
                );
              }
              return item.listId ? (
                <Link className="activity-item" key={item.id} to={`/lists/${item.listId}`}>
                  {iconAndBody}
                </Link>
              ) : (
                <article className="activity-item" key={item.id}>
                  {iconAndBody}
                </article>
              );
            })}
          </section>
        )}
      </main>
    </AppShell>
  );
}
