import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { MaterialIcon } from '../components/MaterialIcon';
import { TopBar } from '../components/TopBar';
import {
  useAddItem,
  useDeleteItem,
  useList,
  useListItems,
  type ListItem,
} from '../features/lists/api';
import { useAuth } from '../shared/auth';
import { fetchLinkPreview } from '../shared/link-preview';
import { EmptyState, Skeleton, useToast } from '../shared/ui';

export function ListDetailsPage() {
  const { listId } = useParams<{ listId: string }>();
  const { user } = useAuth();
  const toast = useToast();

  const { data: list } = useList(listId);
  const { data: items, isLoading } = useListItems(listId);
  const addItem = useAddItem(listId ?? '');
  const deleteItem = useDeleteItem(listId ?? '');

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [store, setStore] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

  async function handleCapture() {
    const target = url.trim();
    if (!target) return;
    setCapturing(true);
    try {
      const preview = await fetchLinkPreview(target);
      if (preview) {
        setStore(preview.store);
        setImage(preview.image);
        if (preview.title && !title.trim()) setTitle(preview.title);
      }
    } catch {
      // Captura é best-effort: se o site bloqueia ou não tem meta tags,
      // segue no preenchimento manual sem erro.
    } finally {
      setCapturing(false);
    }
  }

  function resetForm() {
    setUrl('');
    setTitle('');
    setPrice('');
    setImage(null);
    setStore(null);
  }

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      toast.show({ title: 'Dê um nome ao produto' });
      return;
    }
    try {
      await addItem.mutateAsync({ title, url, price, imageUrl: image, store });
      resetForm();
      toast.show({ variant: 'success', title: 'Produto adicionado' });
    } catch (error) {
      toast.show({
        variant: 'error',
        title: 'Não foi possível adicionar',
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  async function handleDelete(itemId: string) {
    try {
      await deleteItem.mutateAsync(itemId);
    } catch (error) {
      toast.show({
        variant: 'error',
        title: 'Não foi possível remover',
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  const list_items = items ?? [];

  return (
    <AppShell className="wishly-list-shell" showFab={false}>
      <TopBar backTo="/lists" title={list?.title ?? 'Lista'} />

      <main className="page list-detail-page">
        <form className="item-add" onSubmit={handleAdd}>
          <div className="item-add__url">
            <MaterialIcon name="link" />
            <input
              inputMode="url"
              onBlur={handleCapture}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="Cole o link de qualquer loja"
              type="url"
              value={url}
            />
          </div>

          {capturing ? (
            <p className="item-add__status">Buscando dados do link…</p>
          ) : image || store ? (
            <div className="item-add__preview">
              {image ? <img alt="" className="item-add__preview-thumb" src={image} /> : null}
              {store ? <span className="item-card__store">{store}</span> : null}
            </div>
          ) : null}

          <div className="item-add__row">
            <input
              className="item-add__name"
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Nome do produto"
              type="text"
              value={title}
            />
            <input
              className="item-add__price"
              inputMode="decimal"
              onChange={(event) => setPrice(event.target.value)}
              placeholder="Preço"
              type="text"
              value={price}
            />
            <button className="primary-button" disabled={addItem.isPending} type="submit">
              {addItem.isPending ? '...' : 'Adicionar'}
            </button>
          </div>
        </form>

        {isLoading ? (
          <div className="item-list">
            <Skeleton height={88} width="100%" />
            <Skeleton height={88} width="100%" />
          </div>
        ) : list_items.length === 0 ? (
          <EmptyState
            description="Cole o link de um produto de qualquer loja para começar."
            icon="shopping_bag"
            title="Nenhum produto ainda"
          />
        ) : (
          <ul className="item-list">
            {list_items.map((item) => (
              <ItemRow
                item={item}
                key={item.id}
                mine={Boolean(user) && item.addedBy === user?.id}
                onDelete={() => handleDelete(item.id)}
                removing={deleteItem.isPending}
              />
            ))}
          </ul>
        )}
      </main>
    </AppShell>
  );
}

function ItemRow({
  item,
  mine,
  onDelete,
  removing,
}: {
  item: ListItem;
  mine: boolean;
  onDelete: () => void;
  removing: boolean;
}) {
  const inner = (
    <>
      {item.imageUrl ? (
        <img alt="" className="item-card__thumb" src={item.imageUrl} />
      ) : (
        <div className="item-card__thumb item-card__thumb--empty">
          <MaterialIcon name="image" />
        </div>
      )}
      <div className="item-card__body">
        {item.store ? <span className="item-card__store">{item.store}</span> : null}
        <h3 className="item-card__title">{item.title}</h3>
        {item.price ? <span className="item-card__price">{item.price}</span> : null}
      </div>
      {item.url ? <MaterialIcon className="item-card__open" name="open_in_new" /> : null}
    </>
  );

  return (
    <li className="item-card">
      {item.url ? (
        <a className="item-card__link" href={item.url} rel="noreferrer" target="_blank">
          {inner}
        </a>
      ) : (
        <div className="item-card__link">{inner}</div>
      )}
      {mine ? (
        <button
          aria-label="Remover produto"
          className="item-card__delete"
          disabled={removing}
          onClick={onDelete}
          type="button"
        >
          <MaterialIcon name="delete" />
        </button>
      ) : null}
    </li>
  );
}
