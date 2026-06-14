import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { MaterialIcon } from '../components/MaterialIcon';
import {
  friendsList,
  getTopRequestedGifts,
  giftSuggestions,
  publicFriendLists,
} from '../data/mockData';
import { MAIN_NAV_ITEMS } from '../shared/config/navigation';
import { useToast } from '../shared/ui';

const topRequestedGifts = getTopRequestedGifts(5);

export function ExplorePage() {
  const toast = useToast();
  const [followedLists, setFollowedLists] = useState<string[]>([]);

  function comingSoon(feature: string) {
    toast.show({ title: feature, description: 'Em breve disponível.' });
  }

  function toggleFollow(list: { id: string; title: string }) {
    const isFollowing = followedLists.includes(list.id);

    if (isFollowing) {
      setFollowedLists((current) => current.filter((id) => id !== list.id));
      toast.show({ title: 'Você saiu da lista', description: list.title });
      return;
    }

    // Lista pública: entra na hora, sem solicitação de aprovação.
    setFollowedLists((current) => [...current, list.id]);
    toast.show({
      variant: 'success',
      title: 'Você entrou na lista',
      description: `Agora você acompanha "${list.title}".`,
    });
  }

  return (
    <AppShell activeNavKey="explore" className="explore-shell" enablePullToRefresh navItems={MAIN_NAV_ITEMS}>
      <header className="explore-topbar">
        <div className="explore-topbar__inner">
          <div className="explore-topbar__spacer" />
          <h1>Explorar</h1>
          <Link aria-label="Notificações" className="icon-button" to="/activity">
            <MaterialIcon name="notifications" />
          </Link>
        </div>
      </header>

      <main className="page explore-page">
        <label className="search-box explore-search">
          <MaterialIcon name="search" />
          <input placeholder="Buscar pessoas ou listas públicas..." type="text" />
        </label>

        <section className="explore-section">
          <div className="section-heading explore-section__heading">
            <h2>Amigos</h2>
            <Link className="section-link section-link--compact" to="/collaborators">
              Ver todos
            </Link>
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
            <h2>Listas Públicas</h2>
            <button
              className="section-link section-link--compact"
              onClick={() => comingSoon('Listas públicas')}
              type="button"
            >
              Ver todos
            </button>
          </div>

          <div className="explore-product-row">
            {publicFriendLists.map((list) => (
              <article key={list.id} className="explore-product-card explore-product-card--list">
                <div className="explore-product-card__media">
                  <img alt={list.title} src={list.image} />
                  <button
                    aria-label={
                      followedLists.includes(list.id)
                        ? `Sair da lista de ${list.owner}`
                        : `Entrar na lista de ${list.owner}`
                    }
                    className={`explore-product-card__favorite ${
                      followedLists.includes(list.id) ? 'is-following' : ''
                    }`.trim()}
                    onClick={() => toggleFollow(list)}
                    type="button"
                  >
                    <MaterialIcon name={followedLists.includes(list.id) ? 'check' : 'add'} />
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
            <h2>Sugestão de Presentes</h2>
            <button
              className="section-link section-link--compact"
              onClick={() => comingSoon('Sugestões de presentes')}
              type="button"
            >
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
