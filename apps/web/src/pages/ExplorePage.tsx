import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { MaterialIcon } from '../components/MaterialIcon';
import { useUnreadActivityCount } from '../features/activity/api';
import { usePublicLists } from '../features/explore/api';
import {
  friendsFromGraph,
  statusFromGraph,
  useFriendGraph,
  useRespondFriend,
  useSearchPeople,
  useSendFriendRequest,
  type Person,
} from '../features/friends/api';
import { useAuth } from '../shared/auth';
import { MAIN_NAV_ITEMS } from '../shared/config/navigation';
import { Avatar, EmptyState, Skeleton, useToast } from '../shared/ui';

export function ExplorePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const { data: lists, isLoading } = usePublicLists();
  const { data: graph } = useFriendGraph();
  const { data: unread = 0 } = useUnreadActivityCount();
  const [search, setSearch] = useState('');
  const { data: searchResults, isLoading: searching } = useSearchPeople(search);
  const sendRequest = useSendFriendRequest();
  const respond = useRespondFriend();

  const isSearching = search.trim().length >= 2;
  const allLists = useMemo(() => lists ?? [], [lists]);
  const friends = useMemo(() => friendsFromGraph(graph, user?.id), [graph, user?.id]);

  // Sugestões: donos de listas públicas que ainda não têm relação comigo.
  const suggestions = useMemo(() => {
    const seen = new Set<string>();
    const out: Person[] = [];
    for (const list of allLists) {
      const o = list.owner;
      if (o.id === user?.id || seen.has(o.id)) continue;
      seen.add(o.id);
      if (statusFromGraph(graph, user?.id, o.id).status === 'none') {
        out.push({ id: o.id, name: o.name, handle: o.handle, avatarUrl: o.avatarUrl });
      }
    }
    return out;
  }, [allLists, graph, user?.id]);

  async function handleAdd(personId: string) {
    try {
      await sendRequest.mutateAsync(personId);
      toast.show({ variant: 'success', title: 'Solicitação enviada' });
    } catch (error) {
      toast.show({
        variant: 'error',
        title: 'Não foi possível enviar',
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  async function handleAccept(friendshipId: string) {
    try {
      await respond.mutateAsync({ friendshipId, accept: true });
      toast.show({ variant: 'success', title: 'Agora vocês são amigos' });
    } catch (error) {
      toast.show({
        variant: 'error',
        title: 'Não foi possível aceitar',
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  function renderAction(person: Person) {
    const info = statusFromGraph(graph, user?.id, person.id);
    if (info.status === 'friends') {
      return (
        <span className="person-tag person-tag--friend">
          <MaterialIcon name="check" />
          Amigos
        </span>
      );
    }
    if (info.status === 'pending_sent') {
      return <span className="person-tag">Pendente</span>;
    }
    if (info.status === 'pending_received' && info.friendshipId) {
      return (
        <button
          className="person-add"
          disabled={respond.isPending}
          onClick={() => handleAccept(info.friendshipId!)}
          type="button"
        >
          Aceitar
        </button>
      );
    }
    return (
      <button
        className="person-add"
        disabled={sendRequest.isPending}
        onClick={() => handleAdd(person.id)}
        type="button"
      >
        <MaterialIcon name="person_add" />
        Adicionar
      </button>
    );
  }

  function PersonItem({ person }: { person: Person }) {
    return (
      <div className="person-item">
        <Link className="person-item__main" to={`/u/${person.id}`}>
          <Avatar name={person.name} size="md" src={person.avatarUrl ?? undefined} />
          <div className="person-item__info">
            <strong>{person.name}</strong>
            <span>{person.handle ? `@${person.handle}` : 'Sem @usuário'}</span>
          </div>
        </Link>
        {renderAction(person)}
      </div>
    );
  }

  return (
    <AppShell activeNavKey="explore" className="explore-shell" enablePullToRefresh navItems={MAIN_NAV_ITEMS}>
      <header className="explore-topbar">
        <div className="explore-topbar__inner">
          <div className="explore-topbar__spacer" />
          <h1>Explorar</h1>
          <Link aria-label="Notificações" className="icon-button bell-wrap" to="/activity">
            <MaterialIcon name="notifications" />
            {unread > 0 ? (
              <span className="bell-wrap__badge">{unread > 9 ? '9+' : unread}</span>
            ) : null}
          </Link>
        </div>
      </header>

      <main className="page explore-page">
        <label className="search-box explore-search">
          <MaterialIcon name="search" />
          <input
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar pessoas por nome ou @usuário..."
            type="text"
            value={search}
          />
        </label>

        {isSearching ? (
          <section className="explore-section">
            <div className="section-heading explore-section__heading">
              <h2>Resultados</h2>
            </div>
            {searching ? (
              <Skeleton height={60} width="100%" />
            ) : (searchResults ?? []).length === 0 ? (
              <p className="explore-empty-hint">Ninguém encontrado para "{search}".</p>
            ) : (
              <div className="person-list">
                {(searchResults ?? []).map((person) => (
                  <PersonItem key={person.id} person={person} />
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            {friends.length > 0 ? (
              <section className="explore-section">
                <div className="section-heading explore-section__heading">
                  <h2>Amigos</h2>
                </div>
                <div className="explore-friends-row">
                  {friends.map((person) => (
                    <Link
                      className="explore-creator-card explore-creator-card--friend"
                      key={person.id}
                      to={`/u/${person.id}`}
                    >
                      <div className="explore-creator-card__avatar">
                        {person.avatarUrl ? (
                          <img alt={person.name} src={person.avatarUrl} />
                        ) : (
                          <span className="explore-creator-card__initial">
                            {(person.name ?? '?').trim().charAt(0).toUpperCase() || '?'}
                          </span>
                        )}
                      </div>
                      <h3>{person.name}</h3>
                      <p>{person.handle ? `@${person.handle}` : ''}</p>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            {suggestions.length > 0 ? (
              <section className="explore-section">
                <div className="section-heading explore-section__heading">
                  <h2>Descobrir pessoas</h2>
                </div>
                <div className="person-list">
                  {suggestions.map((person) => (
                    <PersonItem key={person.id} person={person} />
                  ))}
                </div>
              </section>
            ) : null}

            <section className="explore-section">
              <div className="section-heading explore-section__heading">
                <h2>Listas Públicas</h2>
              </div>
              {isLoading ? (
                <div className="explore-product-row">
                  <Skeleton height={200} width={160} />
                  <Skeleton height={200} width={160} />
                </div>
              ) : allLists.length === 0 ? (
                <EmptyState
                  description="Quando alguém tornar uma lista pública, ela aparece aqui."
                  icon="explore"
                  title="Nada público ainda"
                />
              ) : (
                <div className="explore-product-row explore-product-row--wrap">
                  {allLists.map((list) => (
                    <button
                      className="explore-product-card explore-product-card--list"
                      key={list.id}
                      onClick={() => navigate(`/lists/${list.id}`)}
                      type="button"
                    >
                      <div className="explore-product-card__media">
                        <img alt={list.title} src={list.image} />
                      </div>
                      <div className="explore-product-card__details">
                        <p>{list.owner.name}</p>
                        <h3>{list.title}</h3>
                        <strong>
                          {list.items} {list.items === 1 ? 'item' : 'itens'}
                        </strong>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </AppShell>
  );
}
