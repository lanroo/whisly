import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { MaterialIcon } from '../components/MaterialIcon';
import { useMyLists, useSharedLists } from '../features/lists/api';
import { useAuth } from '../shared/auth';
import { MAIN_NAV_ITEMS } from '../shared/config/navigation';
import type { WishlistSummary } from '../types/models';
import { Avatar, Skeleton } from '../shared/ui';

/** Passos de onboarding exibidos para quem ainda não tem listas. */
const JOURNEY = [
  {
    num: '01',
    title: 'Cole o link',
    text: 'Qualquer produto, de qualquer loja online. Nós capturamos os detalhes magicamente.',
  },
  {
    num: '02',
    title: 'Guarde na lista',
    text: 'Organize seus desejos por categorias, coleções ou eventos específicos.',
  },
  {
    num: '03',
    title: 'Compartilhe',
    text: 'Envie sua lista aos amigos ou mantenha-a como seu segredo privado.',
  },
];

type ListTileShape = 'hero' | 'tall' | 'square';

/** Card de lista no estilo editorial (capa + título serifado + contagem). */
function ListTile({ list, shape }: { list: WishlistSummary; shape: ListTileShape }) {
  return (
    <Link
      className={`wishly-list-card${shape === 'hero' ? ' wishly-list-card--hero' : ''}`}
      to={list.to ?? `/lists/${list.id}`}
    >
      <div className={`wishly-list-card__media wishly-list-card__media--${shape}`}>
        <img alt={list.title} src={list.image} />
      </div>
      <div className="wishly-list-card__meta">
        {list.privacy ? <span className="wishly-list-card__label">{list.privacy}</span> : null}
        <h4 className="wishly-list-card__title">{list.title}</h4>
        <span className="wishly-list-card__count">{list.items} itens</span>
      </div>
    </Link>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: lists, isLoading } = useMyLists();
  const { data: shared } = useSharedLists();
  const sharedLists = shared ?? [];
  const firstName =
    (user?.user_metadata?.name as string | undefined) ?? user?.email?.split('@')[0] ?? '';
  const myLists = (lists ?? []).slice(0, 6);
  const hasNoLists = !isLoading && myLists.length === 0;
  const [link, setLink] = useState('');

  function handleCapture(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // A captura real de produto por URL ainda não existe (depende de uma edge
    // function que lê os metadados da página — ver card de captura). Por ora,
    // levamos ao fluxo de criar lista, repassando o link digitado.
    navigate('/lists/new', { state: { capturedUrl: link.trim() || undefined } });
  }

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
          <span className="wishly-home-topbar__brand">Wishly</span>
          <Link aria-label="Seu perfil" className="wishly-home-topbar__avatar" to="/profile">
            <Avatar name={firstName} size="sm" />
          </Link>
        </div>
      </header>

      <main className="page wishly-home-page">
        <section className="wishly-home-hero">
          <div className="wishly-home-hero__copy">
            <h1>
              Guarde qualquer <em>desejo</em> num só lugar.
            </h1>
            <p>Cole o link de qualquer loja. Nós organizamos o resto com elegância.</p>
          </div>

          <form className="wishly-home-capture" onSubmit={handleCapture}>
            <MaterialIcon className="wishly-home-capture__icon" name="link" />
            <input
              inputMode="url"
              onChange={(event) => setLink(event.target.value)}
              placeholder="https://loja.com/produto..."
              type="url"
              value={link}
            />
            <button type="submit">Guardar</button>
          </form>
        </section>

        {hasNoLists ? (
          <section className="section-block wishly-home-journey">
            <div className="wishly-home-journey__head">
              <h3 className="wishly-home-journey__label">Sua jornada</h3>
            </div>
            <div className="wishly-home-journey__list">
              {JOURNEY.map((step) => (
                <article key={step.num} className="wishly-home-journey__item">
                  <span className="wishly-home-journey__num">{step.num}</span>
                  <div>
                    <h4>{step.title}</h4>
                    <p>{step.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <section className="section-block wishly-lists">
            <div className="wishly-lists__head">
              <h3 className="wishly-home-section-title">Últimas listas</h3>
              <Link className="wishly-lists__all" to="/lists">
                Ver tudo
              </Link>
            </div>

            {isLoading ? (
              <div className="wishly-lists__grid">
                <div className="wishly-list-card--hero">
                  <Skeleton height={200} width="100%" />
                </div>
                <Skeleton height={180} width="100%" />
                <Skeleton height={180} width="100%" />
              </div>
            ) : (
              <div className="wishly-lists__grid">
                <ListTile list={myLists[0]} shape="hero" />
                {myLists[1] ? <ListTile list={myLists[1]} shape="tall" /> : null}
                <div className="wishly-lists__col">
                  {myLists[2] ? <ListTile list={myLists[2]} shape="square" /> : null}
                  <Link className="wishly-list-card__add" to="/lists/new">
                    <span>Adicionar nova</span>
                    <MaterialIcon name="arrow_forward" />
                  </Link>
                </div>
              </div>
            )}
          </section>
        )}

        {sharedLists.length > 0 ? (
          <section className="section-block">
            <div className="wishly-lists__head">
              <h3 className="wishly-home-section-title">Compartilhadas comigo</h3>
            </div>
            <div className="wishly-shared-grid">
              {sharedLists.map((list) => (
                <Link
                  key={list.id}
                  className="wishly-shared-card"
                  to={list.to ?? `/lists/${list.id}`}
                >
                  <div className="wishly-shared-card__thumb">
                    <img alt={list.title} src={list.image} />
                  </div>
                  <div className="wishly-shared-card__content">
                    <div className="wishly-shared-card__title">
                      <h3>{list.title}</h3>
                    </div>
                    <span className="wishly-shared-card__count">{list.items} itens</span>
                  </div>
                  <MaterialIcon className="wishly-shared-card__chevron" name="chevron_right" />
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </AppShell>
  );
}
