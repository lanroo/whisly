import { Link } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { ListCard } from '../components/ListCard';
import { MaterialIcon } from '../components/MaterialIcon';
import { NewListCard } from '../components/NewListCard';
import { sharedLists } from '../data/mockData';
import { useMyLists } from '../features/lists/api';
import { useAuth } from '../shared/auth';
import { MAIN_NAV_ITEMS } from '../shared/config/navigation';
import { Avatar, Skeleton } from '../shared/ui';

export function HomePage() {
  const { user } = useAuth();
  const { data: lists, isLoading } = useMyLists();
  const firstName =
    (user?.user_metadata?.name as string | undefined) ?? user?.email?.split('@')[0] ?? '';
  const myLists = (lists ?? []).slice(0, 6);

  return (
    <AppShell
      activeNavKey="home"
      className="wishly-home-shell"
      enablePullToRefresh
      fabLabel="Nova lista"
      fabTo="/lists/new"
      navItems={MAIN_NAV_ITEMS}
    >
      <header className="wishly-home-topbar">
        <div className="wishly-home-topbar__inner">
          <div className="wishly-home-topbar__brand">
            <Avatar name={firstName} size="sm" />
            <span>WISHLY</span>
          </div>
          <Link aria-label="Notificações" className="icon-button" to="/activity">
            <MaterialIcon name="notifications" />
          </Link>
        </div>
      </header>

      <main className="page wishly-home-page">
        <section className="wishly-home-welcome">
          <h1>{firstName ? `Olá, ${firstName}` : 'Olá'}</h1>
          <p>O que vamos desejar hoje?</p>

          <label className="search-box wishly-home-search">
            <MaterialIcon name="search" />
            <input placeholder="Procurar listas ou itens..." type="text" />
          </label>
        </section>

        <section className="section-block">
          <div className="section-heading">
            <h2>Minhas Listas</h2>
            <Link className="section-link" to="/lists">
              Ver tudo
            </Link>
          </div>

          <div className="wishly-home-list-row">
            {isLoading
              ? ['a', 'b'].map((key) => <Skeleton key={key} height={320} width={256} />)
              : myLists.map((list) => <ListCard key={list.id} list={list} variant="home" />)}

            <NewListCard />
          </div>
        </section>

        <section className="section-block">
          <div className="section-heading">
            <h2>Compartilhadas comigo</h2>
          </div>

          <div className="wishly-shared-grid">
            {sharedLists.map((list) => (
              <article key={list.id} className="wishly-shared-card">
                <div className="wishly-shared-card__thumb">
                  <img alt={list.title} src={list.image} />
                </div>
                <div className="wishly-shared-card__content">
                  <div className="wishly-shared-card__title">
                    <h3>{list.title}</h3>
                    <span>{list.badge}</span>
                  </div>
                  <div className="wishly-facepile">
                    {list.collaborators.map((avatar, index) => (
                      <img key={`${list.id}-${index + 1}`} alt="" src={avatar} />
                    ))}
                    {list.extraCount ? <div>+{list.extraCount}</div> : null}
                  </div>
                </div>
                <MaterialIcon className="wishly-shared-card__chevron" name="chevron_right" />
              </article>
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
