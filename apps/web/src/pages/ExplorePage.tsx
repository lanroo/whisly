import { useMemo, useRef, useState } from 'react';
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
  const { data: graph, isPending: graphPending } = useFriendGraph();
  const { data: unread = 0 } = useUnreadActivityCount();
  const [search, setSearch] = useState('');
  const { data: searchResults, isLoading: searching } = useSearchPeople(search);
  const sendRequest = useSendFriendRequest();
  const respond = useRespondFriend();
  const searchRef = useRef<HTMLInputElement>(null);

  const isSearching = search.trim().length >= 2;
  const allLists = useMemo(() => lists ?? [], [lists]);
  const friends = useMemo(() => friendsFromGraph(graph, user?.id), [graph, user?.id]);
  const hasFriends = friends.length > 0;

  // Privacidade: só aparecem listas públicas de quem já é meu amigo.
  const friendLists = useMemo(() => {
    const friendIds = new Set(friends.map((f) => f.id));
    return allLists.filter((list) => friendIds.has(list.owner.id));
  }, [allLists, friends]);

  async function handleAdd(personId: string) {
    try {
      const result = await sendRequest.mutateAsync(personId);
      if (result === 'accepted') {
        toast.show({ variant: 'success', title: 'Agora vocês são amigos' });
      } else if (result === 'friends') {
        toast.show({ title: 'Vocês já são amigos' });
      } else {
        toast.show({ variant: 'success', title: 'Solicitação enviada' });
      }
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

  async function handleInvite() {
    const url = window.location.origin;
    const text = 'Vem organizar e compartilhar seus desejos comigo no Whisly!';
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Whisly', text, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.show({
          variant: 'success',
          title: 'Link copiado',
          description: 'Mande para seus amigos.',
        });
      }
    } catch {
      // compartilhamento cancelado pelo usuário — ignora
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

  const publicListsSection = (
    <section className="explore-section">
      <div className="section-heading explore-section__heading">
        <h2>Listas Públicas</h2>
      </div>
      {isLoading ? (
        <div className="explore-lists-grid">
          <Skeleton height={180} width="100%" />
          <Skeleton height={180} width="100%" />
        </div>
      ) : friendLists.length === 0 ? (
        <EmptyState
          description="Quando um amigo tornar uma lista pública, ela aparece aqui."
          icon="explore"
          title="Nada público ainda"
        />
      ) : (
        <div className="explore-lists-grid">
          {friendLists.map((list) => (
            <button
              className="explore-list-card"
              key={list.id}
              onClick={() => navigate(`/lists/${list.id}`)}
              type="button"
            >
              <div className="explore-list-card__media">
                <img alt={list.title} src={list.image} />
                <span className="explore-list-card__count">
                  <MaterialIcon name="redeem" />
                  {list.items}
                </span>
              </div>
              <div className="explore-list-card__body">
                <h3>{list.title}</h3>
                <div className="explore-list-card__owner">
                  <Avatar name={list.owner.name} size="sm" src={list.owner.avatarUrl ?? undefined} />
                  <span>{list.owner.name}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );

  return (
    <AppShell activeNavKey="explore" className="explore-shell" enablePullToRefresh navItems={MAIN_NAV_ITEMS} showFab={false}>
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
            ref={searchRef}
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
        ) : graphPending ? (
          <>
            <section className="explore-section">
              <div className="section-heading explore-section__heading">
                <h2>Amigos</h2>
              </div>
              <div className="explore-friends-row">
                <Skeleton height={116} width="88px" />
                <Skeleton height={116} width="88px" />
                <Skeleton height={116} width="88px" />
              </div>
            </section>
            <section className="explore-section">
              <div className="section-heading explore-section__heading">
                <h2>Listas Públicas</h2>
              </div>
              <div className="explore-lists-grid">
                <Skeleton height={220} width="100%" />
                <Skeleton height={220} width="100%" />
              </div>
            </section>
          </>
        ) : hasFriends ? (
          <>
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

            {publicListsSection}
          </>
        ) : (
          <>
            <section className="explore-connect">
              <div className="explore-connect__card">
                <div className="explore-connect__avatars" aria-hidden="true">
                  <span className="explore-connect__avatar explore-connect__avatar--side">
                    <MaterialIcon name="person" />
                  </span>
                  <span className="explore-connect__avatar explore-connect__avatar--side">
                    <MaterialIcon name="person" />
                  </span>
                  <span className="explore-connect__avatar explore-connect__avatar--main">
                    <MaterialIcon name="favorite" />
                  </span>
                </div>
                <h2>Encontre seus amigos</h2>
                <p>
                  Conecte-se pelo @usuário e as listas e novidades das pessoas aparecem aqui.
                </p>
                <div className="explore-connect__actions">
                  <button
                    className="primary-button primary-button--full"
                    onClick={handleInvite}
                    type="button"
                  >
                    <MaterialIcon name="ios_share" />
                    <span>Convidar amigos</span>
                  </button>
                  <button
                    className="secondary-button"
                    onClick={() => searchRef.current?.focus()}
                    type="button"
                  >
                    <MaterialIcon name="person_search" />
                    <span>Buscar por @usuário</span>
                  </button>
                </div>
              </div>

              <div className="explore-steps">
                <p className="explore-steps__label">Como funciona</p>
                <ol className="explore-steps__list">
                  <li>
                    <span className="explore-steps__num">1</span>
                    Busque a pessoa pelo @usuário
                  </li>
                  <li>
                    <span className="explore-steps__num">2</span>
                    Envie a solicitação de amizade
                  </li>
                  <li>
                    <span className="explore-steps__num">3</span>
                    Vejam as listas um do outro
                  </li>
                </ol>
              </div>
            </section>
          </>
        )}
      </main>
    </AppShell>
  );
}
