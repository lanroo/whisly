import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { CreateListPrivacyOption } from '../components/CreateListPrivacyOption';
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
  useUpdateItemStatus,
  useUpdateList,
  type CollaboratorRole,
  type ItemStatus,
  type ListItem,
  type ListPrivacy,
} from '../features/lists/api';
import { useAuth } from '../shared/auth';
import { PRIVACY_CHOICES } from '../shared/config/privacy';
import { Avatar, Button, EmptyState, Modal, Skeleton, useToast } from '../shared/ui';

const ROLE_LABEL: Record<CollaboratorRole, string> = {
  owner: 'Dono',
  editor: 'Editor',
  viewer: 'Leitor',
};

const STATUS_OPTIONS: { value: ItemStatus; label: string }[] = [
  { value: 'urgent', label: 'Urgente' },
  { value: 'desired', label: 'Desejado' },
  { value: 'later', label: 'Pode esperar' },
  { value: 'bought', label: 'Comprado' },
];

function statusLabel(status: ItemStatus): string {
  return STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

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
  const updateItemStatus = useUpdateItemStatus(listId ?? '');

  // Form de adicionar item (modal)
  const [addOpen, setAddOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [store, setStore] = useState<string | null>(null);
  const [status, setStatus] = useState<ItemStatus>('desired');
  const [capturing, setCapturing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const lastCaptured = useRef('');

  // Editar status de um item existente
  const [statusItem, setStatusItem] = useState<ListItem | null>(null);
  const [editingStatus, setEditingStatus] = useState<ItemStatus>('desired');

  // Busca dentro da lista
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');

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

  // Captura automática ao colar o link (debounce). Só preenche campos vazios.
  useEffect(() => {
    if (!addOpen) return;
    const target = url.trim();
    if (!/^https?:\/\/\S+\.\S+/.test(target) || target === lastCaptured.current) return;

    let active = true;
    const timer = setTimeout(async () => {
      lastCaptured.current = target;
      setCapturing(true);
      try {
        const preview = await fetchLinkPreview(target);
        if (!active) return;
        setTitle((v) => v || preview.title || '');
        setStore((v) => v ?? preview.store ?? null);
        setPrice((v) => v || preview.price || '');
        setImage((v) => v ?? preview.image ?? null);
      } catch {
        // best-effort
      } finally {
        if (active) setCapturing(false);
      }
    }, 700);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [url, addOpen]);

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

  function closeForm() {
    setAddOpen(false);
    setUrl('');
    setTitle('');
    setPrice('');
    setImage(null);
    setStore(null);
    setStatus('desired');
    lastCaptured.current = '';
  }

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      toast.show({ title: 'Dê um nome ao produto' });
      return;
    }
    try {
      await addItem.mutateAsync({ title, url, price, imageUrl: image, store, status });
      closeForm();
      toast.show({ variant: 'success', title: 'Produto adicionado' });
    } catch (error) {
      toast.show({
        variant: 'error',
        title: 'Não foi possível adicionar',
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  function openStatusEdit(item: ListItem) {
    setStatusItem(item);
    setEditingStatus(item.status);
  }

  async function handleSaveStatus() {
    if (!statusItem) return;
    try {
      await updateItemStatus.mutateAsync({ itemId: statusItem.id, status: editingStatus });
      setStatusItem(null);
      toast.show({ variant: 'success', title: 'Status atualizado' });
    } catch (error) {
      toast.show({
        variant: 'error',
        title: 'Não foi possível atualizar',
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

  const list_items = useMemo(() => items ?? [], [items]);
  const collabList = collaborators ?? [];

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return list_items;
    return list_items.filter(
      (item) =>
        item.title.toLowerCase().includes(term) || (item.store ?? '').toLowerCase().includes(term),
    );
  }, [list_items, search]);

  return (
    <AppShell className="wishly-list-shell" showFab={false}>
      <TopBar
        backTo="/lists"
        onRight={() => setSearchOpen((open) => !open)}
        rightIcon={searchOpen ? 'close' : 'search'}
        title={list?.title ?? 'Lista'}
      />

      <main className="page list-detail-page">
        {list?.description ? <p className="list-detail-desc">{list.description}</p> : null}

        {searchOpen ? (
          <label className="search-box list-item-search">
            <MaterialIcon name="search" />
            <input
              autoFocus
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar nesta lista..."
              type="text"
              value={search}
            />
          </label>
        ) : null}

        {isOwner ? (
          <div className="list-detail-actions">
            <Button icon="group_add" onClick={() => setShareOpen(true)} variant="secondary">
              Compartilhar{collabList.length > 0 ? ` (${collabList.length})` : ''}
            </Button>
            <div className="list-detail-actions__icons">
              <button
                aria-label="Editar lista"
                className="list-detail-actions__icon"
                onClick={openEdit}
                type="button"
              >
                <MaterialIcon name="edit" />
              </button>
              <button
                aria-label="Excluir lista"
                className="list-detail-actions__icon list-detail-actions__icon--danger"
                onClick={() => setConfirmDelete(true)}
                type="button"
              >
                <MaterialIcon name="delete" />
              </button>
            </div>
          </div>
        ) : null}

        {canEdit ? (
          <button
            className="primary-button primary-button--full additem-trigger"
            onClick={() => setAddOpen(true)}
            type="button"
          >
            <MaterialIcon name="add" />
            Adicionar item
          </button>
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
        ) : filteredItems.length === 0 ? (
          <p className="explore-empty-hint">Nenhum produto encontrado para "{search}".</p>
        ) : (
          <ul className="item-list">
            {filteredItems.map((item) => (
              <ItemRow
                canReserve={!isOwner && item.addedBy !== user?.id}
                currentUserId={user?.id}
                item={item}
                key={item.id}
                mine={canEdit && (isOwner || item.addedBy === user?.id)}
                onDelete={() => handleDelete(item.id)}
                onEditStatus={() => openStatusEdit(item)}
                onReserve={() => handleReserve(item)}
                removing={deleteItem.isPending}
                reserving={reserveItem.isPending || unreserveItem.isPending}
              />
            ))}
          </ul>
        )}
      </main>

      <Modal onClose={closeForm} open={addOpen} title="Adicionar item">
        <form className="additem-form" onSubmit={handleAdd}>
          <div className="additem-link">
            <div className="ui-field__control ui-field__control--with-icon">
              <MaterialIcon className="ui-field__icon" name="link" />
              <input
                autoFocus
                inputMode="url"
                onChange={(event) => setUrl(event.target.value)}
                placeholder="Cole o link e os dados vêm sozinhos"
                type="url"
                value={url}
              />
            </div>
            {capturing ? (
              <p className="additem-hint is-loading">
                <span className="additem-spinner" />
                Buscando dados do produto...
              </p>
            ) : (
              <p className="additem-hint">Nome, marca, preço e foto vêm automáticos ao colar o link.</p>
            )}
          </div>

          <div className="additem-image">
            <span className="profile-edit-field__label">Imagem</span>

            <div className="additem-preview">
              {image ? (
                <img alt="Prévia do produto" src={image} />
              ) : (
                <div className="additem-preview-empty">
                  <MaterialIcon name="image" />
                  <span>Detectada do link, ou escolha abaixo</span>
                </div>
              )}
            </div>

            <div className="additem-image-options">
              <label className="secondary-button additem-upload">
                <MaterialIcon name="upload" />
                {uploading ? 'Enviando...' : image ? 'Trocar foto' : 'Enviar do dispositivo'}
                <input
                  accept="image/*"
                  disabled={uploading}
                  hidden
                  onChange={handleImageUpload}
                  type="file"
                />
              </label>

              <span className="additem-or">ou</span>

              <div className="additem-url ui-field__control ui-field__control--with-icon">
                <MaterialIcon className="ui-field__icon" name="link" />
                <input
                  inputMode="url"
                  onChange={(event) => setImage(event.target.value.trim() || null)}
                  placeholder="Cole o link da imagem"
                  type="url"
                  value={image ?? ''}
                />
              </div>

              {image ? (
                <button className="additem-remove" onClick={() => setImage(null)} type="button">
                  Remover
                </button>
              ) : null}
            </div>
          </div>

          <label className="profile-edit-field">
            <span>Nome do item</span>
            <input
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex: Fone de ouvido"
              type="text"
              value={title}
            />
          </label>
          <div className="additem-row2">
            <label className="profile-edit-field">
              <span>Marca</span>
              <input
                onChange={(event) => setStore(event.target.value)}
                placeholder="Ex: Sony"
                type="text"
                value={store ?? ''}
              />
            </label>
            <label className="profile-edit-field">
              <span>Preço</span>
              <input
                inputMode="decimal"
                onChange={(event) => setPrice(event.target.value)}
                placeholder="R$ 299,00"
                type="text"
                value={price}
              />
            </label>
          </div>

          <div className="additem-status">
            <span className="additem-status__label">Status</span>
            <div className="chip-group">
              {STATUS_OPTIONS.map((option) => (
                <button
                  className={`chip chip--${option.value} ${status === option.value ? 'is-active' : ''}`.trim()}
                  key={option.value}
                  onClick={() => setStatus(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <button
            className="primary-button primary-button--full"
            disabled={addItem.isPending}
            type="submit"
          >
            {addItem.isPending ? 'Adicionando...' : 'Salvar item'}
          </button>
        </form>
      </Modal>

      <Modal onClose={() => setStatusItem(null)} open={Boolean(statusItem)} title="Status do item">
        <div className="status-edit">
          <div className="chip-group">
            {STATUS_OPTIONS.map((option) => (
              <button
                className={`chip chip--${option.value} ${editingStatus === option.value ? 'is-active' : ''}`.trim()}
                key={option.value}
                onClick={() => setEditingStatus(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
          <Button disabled={updateItemStatus.isPending} fullWidth onClick={handleSaveStatus}>
            {updateItemStatus.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </Modal>

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
            <div className="chip-group share-form__role-chips">
              <button
                className={`chip ${shareRole === 'editor' ? 'is-active' : ''}`.trim()}
                onClick={() => setShareRole('editor')}
                type="button"
              >
                Editor
              </button>
              <button
                className={`chip ${shareRole === 'viewer' ? 'is-active' : ''}`.trim()}
                onClick={() => setShareRole('viewer')}
                type="button"
              >
                Leitor
              </button>
            </div>
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
          <div className="edit-list-privacy">
            <span className="profile-edit-field__label">Privacidade</span>
            <div className="create-list-privacy__card">
              {PRIVACY_CHOICES.map((option) => (
                <CreateListPrivacyOption
                  checked={editPrivacy === option.value}
                  description={option.description}
                  icon={option.icon}
                  key={option.value}
                  name="edit-list-privacy"
                  onChange={(value) => setEditPrivacy(value as ListPrivacy)}
                  title={option.title}
                  value={option.value}
                />
              ))}
            </div>
          </div>
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
  onEditStatus,
}: {
  item: ListItem;
  mine: boolean;
  onDelete: () => void;
  removing: boolean;
  canReserve: boolean;
  currentUserId: string | undefined;
  onReserve: () => void;
  reserving: boolean;
  onEditStatus: () => void;
}) {
  const reservedByMe = item.reservation?.reservedBy === currentUserId;
  const reservedByOther = Boolean(item.reservation) && !reservedByMe;
  const inner = (
    <>
      <div className="item-card__media">
        {item.imageUrl ? (
          <img alt="" className="item-card__thumb" src={item.imageUrl} />
        ) : (
          <div className="item-card__thumb item-card__thumb--empty">
            <MaterialIcon name="image" />
          </div>
        )}
      </div>
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
          className={`item-card__badge item-card__badge--${item.status}`}
          onClick={onEditStatus}
          type="button"
        >
          {statusLabel(item.status)}
        </button>
      ) : (
        <span className={`item-card__badge item-card__badge--${item.status}`}>
          {statusLabel(item.status)}
        </span>
      )}

      <div className="item-card__actions">
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
      </div>
    </li>
  );
}
