import { AppShell } from '../components/AppShell';
import { MaterialIcon } from '../components/MaterialIcon';
import { Link } from 'react-router-dom';
import { friendsList, getTopRequestedGifts, giftSuggestions, publicFriendLists } from '../data/mockData';

const navItems = [
  { key: 'home', label: 'Home', icon: 'home', to: '/home' },
  { key: 'shared', label: 'Shared', icon: 'group', to: '/activity' },
  { key: 'explore', label: 'Explore', icon: 'explore', to: '/explore' },
  { key: 'profile', label: 'Profile', icon: 'person', to: '/profile' },
];

const topRequestedGifts = getTopRequestedGifts(5);

export function ExplorePage() {
  return (
    <AppShell activeNavKey="explore" className="explore-shell" enablePullToRefresh navItems={navItems}>
      <header className="explore-topbar">
        <div className="explore-topbar__inner">
          <div className="explore-topbar__spacer" />
          <h1>Explore</h1>
          <Link aria-label="Notificações" className="icon-button" to="/activity">
            <MaterialIcon name="notifications" />
          </Link>
        </div>
      </header>

      <main className="page explore-page">
        <label className="search-box explore-search">
          <MaterialIcon name="search" />
          <input placeholder="Procura pessoas ou listas publicas..." type="text" />
        </label>

        <section className="explore-section">
          <div className="section-heading explore-section__heading">
            <h2>Amigos</h2>
            <button className="section-link section-link--compact" type="button">
              See all
            </button>
          </div>

          <div className="explore-friends-row">
            {friendsList.map((friend) => (
              <article key={friend.id} className="explore-creator-card explore-creator-card--friend">
                <div className="explore-creator-card__avatar">
                  <img alt={friend.name} src={friend.avatar} />
                </div>
                <h3>{friend.name}</h3>
                <p>{friend.subtitle}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="explore-section">
          <div className="section-heading explore-section__heading">
            <h2>Listas Publicas</h2>
            <button className="section-link section-link--compact" type="button">
              See all
            </button>
          </div>

          <div className="explore-product-row">
            {publicFriendLists.map((list) => (
              <article key={list.id} className="explore-product-card explore-product-card--list">
                <div className="explore-product-card__media">
                  <img alt={list.title} src={list.image} />
                  <button aria-label="Entrar na lista" className="explore-product-card__favorite" type="button">
                    <MaterialIcon name="group_add" />
                  </button>
                </div>
                <div className="explore-product-card__details">
                  <p>{list.owner}</p>
                  <h3>{list.title}</h3>
                  <strong>{list.meta}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="explore-section">
          <div className="section-heading explore-section__heading">
            <h2>Sugestao de Presentes</h2>
            <button className="section-link section-link--compact" type="button">
              Ver mais
            </button>
          </div>

          <div className="explore-product-row">
            {giftSuggestions.map((gift) => (
              <article key={gift.id} className="explore-product-card">
                <div className="explore-product-card__media">
                  <img alt={gift.name} src={gift.image} />
                </div>
                <div className="explore-product-card__details">
                  <p>{gift.category}</p>
                  <h3>{gift.name}</h3>
                  <strong>{gift.price}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="explore-section">
          <div className="section-heading explore-section__heading">
            <h2>Ranking dos Mais Pedidos</h2>
          </div>

          <div className="explore-ranking-list">
            {topRequestedGifts.map((gift, index) => (
              <article key={gift.id} className="explore-ranking-card">
                <div className="explore-ranking-card__position">{index + 1}</div>
                <div className="explore-ranking-card__media">
                  <img alt={gift.name} src={gift.image} />
                </div>
                <div className="explore-ranking-card__content">
                  <p>{gift.category}</p>
                  <h3>{gift.name}</h3>
                  <strong>{gift.requests} pedidos</strong>
                </div>
                <span className="explore-ranking-card__meta">{gift.listCount} listas</span>
              </article>
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
