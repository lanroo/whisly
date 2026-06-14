import { Link } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { ListCard } from '../components/ListCard';
import { MaterialIcon } from '../components/MaterialIcon';
import { NewListCard } from '../components/NewListCard';
import { homeLists, sharedLists } from '../data/mockData';
import { MAIN_NAV_ITEMS } from '../shared/config/navigation';

export function HomePage() {
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
            <div className="avatar avatar--sm">
              <img
                alt="Casper"
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80"
              />
            </div>
            <span>WISHLY</span>
          </div>
          <Link aria-label="Notificações" className="icon-button" to="/activity">
            <MaterialIcon name="notifications" />
          </Link>
        </div>
      </header>

      <main className="page wishly-home-page">
        <section className="wishly-home-welcome">
          <h1>Olá, Casper</h1>
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
            {homeLists.map((list) => (
              <ListCard key={list.id} list={list} variant="home" />
            ))}

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
