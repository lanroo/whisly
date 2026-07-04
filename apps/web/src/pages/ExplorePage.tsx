import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { MaterialIcon } from '../components/MaterialIcon';
import { useUnreadActivityCount } from '../features/activity/api';
import { usePublicLists, type PublicOwner } from '../features/explore/api';
import { MAIN_NAV_ITEMS } from '../shared/config/navigation';
import { EmptyState, Skeleton } from '../shared/ui';

export function ExplorePage() {
  const navigate = useNavigate();
  const { data: lists, isLoading } = usePublicLists();
  const { data: unread = 0 } = useUnreadActivityCount();
  const [search, setSearch] = useState('');

  const allLists = useMemo(() => lists ?? [], [lists]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return allLists;
    return allLists.filter(
      (list) =>
        list.title.toLowerCase().includes(term) ||
        list.owner.name.toLowerCase().includes(term) ||
        (list.owner.handle ?? '').toLowerCase().includes(term),
    );
  }, [allLists, search]);

  const people = useMemo(() => {
    const seen = new Set<string>();
    const out: PublicOwner[] = [];
    for (const list of allLists) {
      if (!seen.has(list.owner.id)) {
        seen.add(list.owner.id);
        out.push(list.owner);
      }
    }
    return out;
  }, [allLists]);

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
            placeholder="Buscar pessoas ou listas públicas..."
            type="text"
            value={search}
          />
        </label>

        {isLoading ? (
          <div className="explore-product-row">
            <Skeleton height={200} width={160} />
            <Skeleton height={200} width={160} />
          </div>
        ) : allLists.length === 0 ? (
          <EmptyState
            description="Quando alguém tornar uma lista pública, ela aparece aqui para você descobrir."
            icon="explore"
            title="Nada público por aqui ainda"
          />
        ) : (
          <>
            {people.length > 0 ? (
              <section className="explore-section">
                <div className="section-heading explore-section__heading">
                  <h2>Pessoas</h2>
                </div>
                <div className="explore-friends-row">
                  {people.map((person) => (
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
                      <p>{person.handle ? `@${person.handle}` : 'Listas públicas'}</p>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="explore-section">
              <div className="section-heading explore-section__heading">
                <h2>Listas Públicas</h2>
              </div>

              {filtered.length === 0 ? (
                <p className="explore-empty-hint">Nenhuma lista encontrada para "{search}".</p>
              ) : (
                <div className="explore-product-row explore-product-row--wrap">
                  {filtered.map((list) => (
                    <button
                      key={list.id}
                      className="explore-product-card explore-product-card--list"
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
