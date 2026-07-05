import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { MaterialIcon } from '../components/MaterialIcon';
import { MyAvatar } from '../components/MyAvatar';
import { useUnreadActivityCount } from '../features/activity/api';
import {
  fetchLinkPreview,
  useAddItemToList,
  useCreateList,
  useMyLists,
  useSharedLists,
} from '../features/lists/api';
import { MAIN_NAV_ITEMS } from '../shared/config/navigation';
import type { WishlistSummary } from '../types/models';
import { Button, Modal, SegmentedControl, Skeleton, useToast } from '../shared/ui';

type ListFilter = 'all' | 'private' | 'public';

const LIST_FILTERS: { value: ListFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'private', label: 'Privadas' },
  { value: 'public', label: 'Públicas' },
];

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
        {list.privacy ? (
          <span className="wishly-list-card__badge">
            <MaterialIcon name={list.privacy === 'Público' ? 'public' : 'lock'} />
            {list.privacy}
          </span>
        ) : null}
      </div>
      <div className="wishly-list-card__meta">
        <h4 className="wishly-list-card__title">{list.title}</h4>
        <span className="wishly-list-card__count">{list.items} itens</span>
      </div>
    </Link>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: lists, isLoading } = useMyLists();
  const { data: shared } = useSharedLists();
  const addItemToList = useAddItemToList();
  const createList = useCreateList();
  const sharedLists = shared ?? [];
  const allMyLists = useMemo(() => lists ?? [], [lists]);
  const myLists = allMyLists.slice(0, 6);
  const hasNoLists = !isLoading && myLists.length === 0;
  const { data: unread = 0 } = useUnreadActivityCount();
  const [link, setLink] = useState('');
  const [listFilter, setListFilter] = useState<ListFilter>('all');

  const filteredLists = useMemo(() => {
    const base =
      listFilter === 'public'
        ? allMyLists.filter((l) => l.privacy === 'Público')
        : listFilter === 'private'
          ? allMyLists.filter((l) => l.privacy !== 'Público')
          : allMyLists;
    return base.slice(0, 6);
  }, [allMyLists, listFilter]);

  // Modal "Guardar produto"
  const [guardOpen, setGuardOpen] = useState(false);
  const [guardUrl, setGuardUrl] = useState('');
  const [capturing, setCapturing] = useState(false);
  const [gTitle, setGTitle] = useState('');
  const [gImage, setGImage] = useState<string | null>(null);
  const [gStore, setGStore] = useState<string | null>(null);
  const [gPrice, setGPrice] = useState<string | null>(null);
  const [newListName, setNewListName] = useState('');
  const [savingTo, setSavingTo] = useState<string | null>(null);

  function handleCapture(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = link.trim();
    if (!target) return;
    setGuardUrl(target);
    setGTitle('');
    setGImage(null);
    setGStore(null);
    setGPrice(null);
    setNewListName('');
    setCapturing(true);
    setGuardOpen(true);
  }

  // Captura os dados do produto quando o modal abre.
  useEffect(() => {
    if (!guardOpen || !guardUrl) return;
    let active = true;
    fetchLinkPreview(guardUrl)
      .then((preview) => {
        if (!active) return;
        setGTitle(preview.title ?? '');
        setGImage(preview.image ?? null);
        setGStore(preview.store ?? null);
        setGPrice(preview.price ?? null);
      })
      .finally(() => {
        if (active) setCapturing(false);
      });
    return () => {
      active = false;
    };
  }, [guardOpen, guardUrl]);

  function itemInput() {
    return {
      title: gTitle.trim() || 'Produto',
      url: guardUrl,
      imageUrl: gImage,
      store: gStore,
      price: gPrice,
    };
  }

  async function saveToList(listId: string) {
    setSavingTo(listId);
    try {
      await addItemToList.mutateAsync({ listId, input: itemInput() });
      setGuardOpen(false);
      setLink('');
      toast.show({ variant: 'success', title: 'Produto guardado' });
      navigate(`/lists/${listId}`);
    } catch (error) {
      toast.show({
        variant: 'error',
        title: 'Não foi possível guardar',
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSavingTo(null);
    }
  }

  async function createAndSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newListName.trim();
    if (!name) {
      toast.show({ title: 'Dê um nome à nova lista' });
      return;
    }
    setSavingTo('new');
    try {
      const listId = await createList.mutateAsync({ title: name, privacy: 'private' });
      await addItemToList.mutateAsync({ listId, input: itemInput() });
      setGuardOpen(false);
      setLink('');
      toast.show({ variant: 'success', title: 'Lista criada e produto guardado' });
      navigate(`/lists/${listId}`);
    } catch (error) {
      toast.show({
        variant: 'error',
        title: 'Não foi possível criar a lista',
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSavingTo(null);
    }
  }

  const busy = savingTo !== null;

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
          <div className="wishly-home-topbar__actions">
            <Link aria-label="Notificações" className="icon-button bell-wrap" to="/activity">
              <MaterialIcon name="notifications" />
              {unread > 0 ? (
                <span className="bell-wrap__badge">{unread > 9 ? '9+' : unread}</span>
              ) : null}
            </Link>
            <Link aria-label="Seu perfil" className="wishly-home-topbar__avatar" to="/profile">
              <MyAvatar size="sm" />
            </Link>
          </div>
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

            <SegmentedControl
              ariaLabel="Filtrar listas"
              className="wishly-lists__filter"
              onChange={setListFilter}
              options={LIST_FILTERS}
              value={listFilter}
            />

            {isLoading ? (
              <div className="wishly-lists__stack">
                <Skeleton height={220} width="100%" />
                <Skeleton height={220} width="100%" />
              </div>
            ) : filteredLists.length === 0 ? (
              <p className="explore-empty-hint">
                Nenhuma lista {listFilter === 'public' ? 'pública' : 'privada'} ainda.
              </p>
            ) : (
              <div className="wishly-lists__stack">
                {filteredLists.map((list) => (
                  <ListTile key={list.id} list={list} shape="hero" />
                ))}
                <Link className="wishly-list-card__add" to="/lists/new">
                  <span>Adicionar nova</span>
                  <MaterialIcon name="arrow_forward" />
                </Link>
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

      <Modal onClose={() => setGuardOpen(false)} open={guardOpen} title="Guardar produto">
        <div className="guard">
          <div className="guard__preview">
            {capturing ? (
              <div className="guard__preview-empty">
                <span className="additem-spinner" />
                <span>Buscando dados do produto...</span>
              </div>
            ) : gImage ? (
              <img alt="Prévia do produto" src={gImage} />
            ) : (
              <div className="guard__preview-empty">
                <MaterialIcon name="image" />
                <span>Sem imagem — você pode ajustar na lista</span>
              </div>
            )}
          </div>

          <label className="profile-edit-field guard__name">
            <span>Nome do produto</span>
            <input
              onChange={(event) => setGTitle(event.target.value)}
              placeholder="Ex: Fone de ouvido"
              type="text"
              value={gTitle}
            />
          </label>

          {allMyLists.length > 0 ? (
            <div className="guard__section">
              <span className="guard__label">Adicionar a uma lista</span>
              <div className="guard__lists">
                {allMyLists.map((list) => (
                  <button
                    className="guard__list-row"
                    disabled={busy}
                    key={list.id}
                    onClick={() => saveToList(list.id)}
                    type="button"
                  >
                    <img alt="" className="guard__list-thumb" src={list.image} />
                    <div className="guard__list-info">
                      <strong>{list.title}</strong>
                      <span>{list.items} itens</span>
                    </div>
                    {savingTo === list.id ? (
                      <span className="additem-spinner" />
                    ) : (
                      <MaterialIcon name="add" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <form className="guard__section guard__new" onSubmit={createAndSave}>
            <span className="guard__label">
              {allMyLists.length > 0 ? 'Ou criar uma nova lista' : 'Criar sua primeira lista'}
            </span>
            <div className="guard__new-row">
              <input
                onChange={(event) => setNewListName(event.target.value)}
                placeholder="Nome da nova lista"
                type="text"
                value={newListName}
              />
              <Button disabled={busy} type="submit">
                {savingTo === 'new' ? 'Criando...' : 'Criar e guardar'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </AppShell>
  );
}
