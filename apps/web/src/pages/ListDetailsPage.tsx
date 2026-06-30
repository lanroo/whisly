import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { MaterialIcon } from '../components/MaterialIcon';
import { TopBar } from '../components/TopBar';
import {
  fetchLinkPreview,
  uploadItemImage,
  useAddCollaborator,
  useAddItem,
  useCollaborators,
  useDeleteItem,
  useDeleteList,
  useList,
  useListItems,
  useRemoveCollaborator,
  useReserveItem,
  useUnreserveItem,
  useUpdateList,
  type CollaboratorRole,
  type ListItem,
  type ListPrivacy,
} from '../features/lists/api';
import { useAuth } from '../shared/auth';
import { Avatar, Button, EmptyState, Modal, Skeleton, useToast } from '../shared/ui';

const ROLE_LABEL: Record<CollaboratorRole, string> = {
  owner: 'Dono',
  editor: 'Editor',
  viewer: 'Leitor',
};

const PRIVACY_OPTIONS: { value: ListPrivacy; label: string }[] = [
  { value: 'private', label: 'Privada' },
  { value: 'collaborative', label: 'Colaborativa' },
  { value: 'public', label: 'Pública' },
];

export function ListDetailsPage() {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const { data: list } = useList(listId);
  const { data: items, isLoading } = useListItems(listId);
  const { data: collaborators } = useCollaborators(listId);
  const addItem = useAddItem(listId ?? '');
  const deleteItem = useDeleteItem(listId ?? '');
  const updateList = useUpdateList(listId);
  const deleteList = useDeleteList();
  const addCollaborator = useAddCollaborator(listId);
  const removeCollaborator = useRemoveCollaborator();
  const reserveItem = useReserveItem(listId ?? '');
  const unreserveItem = useUnreserveItem(listId ?? '');

  // Form de adicionar item
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [store, setStore] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Compartilhar
  const [shareOpen, setShareOpen] = useState(false);
  const [shareHandle, setShareHandle] = useState('');
  const [shareRole, setShareRole] = useState<CollaboratorRole>('editor');

  // Editar / excluir lista
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPrivacy, setEditPrivacy] = useState<ListPrivacy>('private');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isOwner = Boolean(user) && list?.ownerId === user?.id;
  const myRole = useMemo(
    () => collaborators?.find((c) => c.userId === user?.id)?.role,
    [collaborators, user?.id],
  );
  const canEdit = isOwner || myRole === 'editor' || myRole === 'owner';

  async function handleCapture() {
    const target = url.trim();
    if (!target) return;
    setCapturing(true);
    try {
      const preview = await fetchLinkPreview(target);
      if (preview.store) setStore(preview.store);
      if (preview.image) setImage(preview.image);
      if (preview.price && !price.trim()) setPrice(preview.price);
      if (preview.title && !title.trim()) setTitle(preview.title);
    } catch {
      // best-effort
    } finally {
      setCapturing(false);
    }
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.show({ variant: 'error', title: 'Selecione um arquivo de imagem' });
      return;
    }
    setUploading(true);
    try {
      setImage(await uploadItemImage(file));
    } catch (error) {
      toast.show({
        variant: 'error',
        title: 'Não foi possível enviar a imagem',
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setUploading(false);
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

  async function handleReserve(item: ListItem) {
    try {
      if (item.reservation) {
        await unreserveItem.mutateAsync(item.reservation.id);
        toast.show({ title: 'Reserva cancelada' });
      } else {
        await reserveItem.mutateAsync(item.id);
        toast.show({ variant: 'success', title: 'Presente reservado 🎁' });
      }
    } catch (error) {
      toast.show({
        variant: 'error',
        title: 'Não foi possível reservar',
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  function openEdit() {
    setEditTitle(list?.title ?? '');
    setEditDesc(list?.description ?? '');
    setEditPrivacy(list?.privacy ?? 'private');
    setEditOpen(true);
  }

  async function handleSaveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editTitle.trim()) {
      toast.show({ title: 'Dê um nome à lista' });
      return;
    }
    try {
      await updateList.mutateAsync({
        title: editTitle,
        description: editDesc.trim() || null,
        privacy: editPrivacy,
      });
      setEditOpen(false);
      toast.show({ variant: 'success', title: 'Lista atualizada' });
    } catch (error) {
      toast.show({
        variant: 'error',
        title: 'Não foi possível salvar',
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  async function handleDeleteList() {
    try {
      await deleteList.mutateAsync(listId!);
      toast.show({ variant: 'success', title: 'Lista excluída' });
      navigate('/lists');
    } catch (error) {
      toast.show({
        variant: 'error',
        title: 'Não foi possível excluir',
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  async function handleAddCollaborator(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await addCollaborator.mutateAsync({ handle: shareHandle, role: shareRole });
      setShareHandle('');
      toast.show({ variant: 'success', title: 'Colaborador adicionado' });
    } catch (error) {
      toast.show({
        variant: 'error',
        title: 'Não foi possível compartilhar',
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  async function handleRemoveCollaborator(collaboratorId: string) {
    try {
      await removeCollaborator.mutateAsync(collaboratorId);
      toast.show({ title: 'Colaborador removido' });
    } catch (error) {
      toast.show({
        variant: 'error',
        title: 'Não foi possível remover',
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  const list_items = items ?? [];
  const collabList = collaborators ?? [];

  return (
    <AppShell className="wishly-list-shell" showFab={false}>
      <TopBar backTo="/lists" title={list?.title ?? 'Lista'} />

      <main className="page list-detail-page">
        {list?.description ? <p className="list-detail-desc">{list.description}</p> : null}

        {isOwner ? (
          <div className="list-detail-actions">
            <Button icon="group_add" onClick={() => setShareOpen(true)} variant="secondary">
              Compartilhar{collabList.length > 0 ? ` (${collabList.length})` : ''}
            </Button>
            <button
              aria-label="Editar lista"
              className="icon-button"
              onClick={openEdit}
              type="button"
            >
              <MaterialIcon name="edit" />
            </button>
            <button
              aria-label="Excluir lista"
              className="icon-button icon-button--danger"
              onClick={() => setConfirmDelete(true)}
              type="button"
            >
              <MaterialIcon name="delete" />
            </button>
          </div>
        ) : null}

        {canEdit ? (
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
            ) : image ? (
              <div className="item-add__preview">
                <img alt="" className="item-add__preview-thumb" src={image} />
                <div className="item-add__preview-info">
                  {store ? <span className="item-card__store">{store}</span> : null}
                  <label className="item-add__upload">
                    <MaterialIcon name="upload" />
                    {uploading ? 'Enviando...' : 'Trocar imagem'}
                    <input accept="image/*" hidden onChange={handleImageUpload} type="file" />
                  </label>
                </div>
              </div>
            ) : (
              <label className="item-add__upload item-add__upload--block">
                <MaterialIcon name="add_photo_alternate" />
                {uploading ? 'Enviando...' : 'Enviar imagem do dispositivo'}
                <input accept="image/*" hidden onChange={handleImageUpload} type="file" />
              </label>
            )}

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
        ) : (
          <p className="list-detail-readonly">
            <MaterialIcon name="visibility" />
            Você está vendo esta lista. Apenas o dono e editores podem adicionar itens.
          </p>
        )}

        {isLoading ? (
          <div className="item-list">
            <Skeleton height={88} width="100%" />
            <Skeleton height={88} width="100%" />
          </div>
        ) : list_items.length === 0 ? (
          <EmptyState
            description={
              canEdit
                ? 'Cole o link de um produto de qualquer loja para começar.'
                : 'Esta lista ainda não tem produtos.'
            }
            icon="shopping_bag"
            title="Nenhum produto ainda"
          />
        ) : (
          <ul className="item-list">
            {list_items.map((item) => (
              <ItemRow
                canReserve={!isOwner}
                currentUserId={user?.id}
                item={item}
                key={item.id}
                mine={canEdit && (isOwner || item.addedBy === user?.id)}
                onDelete={() => handleDelete(item.id)}
                onReserve={() => handleReserve(item)}
                removing={deleteItem.isPending}
                reserving={reserveItem.isPending || unreserveItem.isPending}
              />
            ))}
          </ul>
        )}
      </main>

      <Modal onClose={() => setShareOpen(false)} open={shareOpen} title="Compartilhar lista">
        <form className="share-form" onSubmit={handleAddCollaborator}>
          <label className="profile-edit-field">
            <span>Adicionar por @usuário</span>
            <input
              onChange={(e) => setShareHandle(e.target.value)}
              placeholder="ex: @lanna"
              type="text"
              value={shareHandle}
            />
          </label>
          <div className="share-form__row">
            <select
              className="share-form__role"
              onChange={(e) => setShareRole(e.target.value as CollaboratorRole)}
              value={shareRole}
            >
              <option value="editor">Editor (pode adicionar itens)</option>
              <option value="viewer">Leitor (só visualiza)</option>
            </select>
            <Button disabled={addCollaborator.isPending} type="submit">
              {addCollaborator.isPending ? '...' : 'Adicionar'}
            </Button>
          </div>
        </form>

        <div className="share-list">
          {collabList.length === 0 ? (
            <p className="share-list__empty">Ninguém ainda. Adicione pelo @usuário acima.</p>
          ) : (
            collabList.map((c) => (
              <div key={c.id} className="share-list__item">
                <Avatar name={c.name} size="sm" src={c.avatarUrl ?? undefined} />
                <div className="share-list__info">
                  <strong>{c.name}</strong>
                  <span>
                    {c.handle ? `@${c.handle} · ` : ''}
                    {ROLE_LABEL[c.role]}
                  </span>
                </div>
                <button
                  aria-label={`Remover ${c.name}`}
                  className="share-list__remove"
                  onClick={() => handleRemoveCollaborator(c.id)}
                  type="button"
                >
                  <MaterialIcon name="close" />
                </button>
              </div>
            ))
          )}
        </div>
      </Modal>

      <Modal onClose={() => setEditOpen(false)} open={editOpen} title="Editar lista">
        <form className="profile-edit-form" onSubmit={handleSaveEdit}>
          <label className="profile-edit-field">
            <span>Nome da lista</span>
            <input onChange={(e) => setEditTitle(e.target.value)} type="text" value={editTitle} />
          </label>
          <label className="profile-edit-field">
            <span>Descrição</span>
            <textarea
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="Uma mensagem para quem vir a lista (opcional)"
              rows={3}
              value={editDesc}
            />
          </label>
          <label className="profile-edit-field">
            <span>Privacidade</span>
            <select
              onChange={(e) => setEditPrivacy(e.target.value as ListPrivacy)}
              value={editPrivacy}
            >
              {PRIVACY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <div className="profile-edit-actions">
            <Button onClick={() => setEditOpen(false)} type="button" variant="ghost">
              Cancelar
            </Button>
            <Button disabled={updateList.isPending} type="submit">
              {updateList.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal onClose={() => setConfirmDelete(false)} open={confirmDelete} title="Excluir lista?">
        <div className="confirm-dialog">
          <p>
            A lista e todos os seus itens serão excluídos permanentemente. Esta ação não pode ser
            desfeita.
          </p>
          <div className="confirm-dialog__actions">
            <Button onClick={() => setConfirmDelete(false)} type="button" variant="ghost">
              Cancelar
            </Button>
            <button
              className="primary-button primary-button--danger"
              disabled={deleteList.isPending}
              onClick={handleDeleteList}
              type="button"
            >
              {deleteList.isPending ? 'Excluindo...' : 'Excluir'}
            </button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}

function ItemRow({
  item,
  mine,
  onDelete,
  removing,
  canReserve,
  currentUserId,
  onReserve,
  reserving,
}: {
  item: ListItem;
  mine: boolean;
  onDelete: () => void;
  removing: boolean;
  canReserve: boolean;
  currentUserId: string | undefined;
  onReserve: () => void;
  reserving: boolean;
}) {
  const reservedByMe = item.reservation?.reservedBy === currentUserId;
  const reservedByOther = Boolean(item.reservation) && !reservedByMe;
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
      {canReserve ? (
        <button
          className={`item-card__reserve ${reservedByMe ? 'is-mine' : ''}`.trim()}
          disabled={reserving || reservedByOther}
          onClick={onReserve}
          type="button"
        >
          <MaterialIcon name={reservedByMe ? 'check_circle' : 'redeem'} />
          {reservedByOther ? 'Reservado' : reservedByMe ? 'Você reservou' : 'Reservar'}
        </button>
      ) : null}
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
