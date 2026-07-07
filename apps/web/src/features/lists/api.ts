import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/shared/auth';
import { storeNameFromUrl } from '@/shared/store-name';
import type { WishlistSummary } from '@/types/models';

export type ListPrivacy = Database['public']['Enums']['list_privacy'];
export type ItemStatus = Database['public']['Enums']['item_status'];
type ListRow = Database['public']['Tables']['lists']['Row'];

const PRIVACY_LABEL: Record<ListPrivacy, string> = {
  private: 'Privada',
  collaborative: 'Colaborativa',
  public: 'Público',
};

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=1200&q=80';

type ListWithCount = ListRow & { list_items: { count: number }[] };

function mapList(row: ListWithCount): WishlistSummary {
  return {
    id: row.id,
    title: row.title,
    items: row.list_items?.[0]?.count ?? 0,
    image: row.cover_image ?? DEFAULT_COVER,
    privacy: PRIVACY_LABEL[row.privacy],
    to: `/lists/${row.id}`,
  };
}

async function fetchMyLists(userId: string): Promise<WishlistSummary[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('lists')
    .select('*, list_items(count)')
    .eq('owner_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data as unknown as ListWithCount[]).map(mapList);
}

/** Listas do usuário logado. */
export function useMyLists() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['lists', 'mine', user?.id],
    queryFn: () => fetchMyLists(user!.id),
    enabled: Boolean(user),
  });
}

export interface CreateListInput {
  title: string;
  privacy: ListPrivacy;
  coverImage?: string | null;
  description?: string | null;
}

async function createList(userId: string, input: CreateListInput): Promise<string> {
  if (!supabase) throw new Error('Supabase não configurado.');
  const { data, error } = await supabase
    .from('lists')
    .insert({
      owner_id: userId,
      title: input.title,
      privacy: input.privacy,
      cover_image: input.coverImage ?? null,
      description: input.description?.trim() || null,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

/** Cria uma lista e invalida o cache de listas. */
export function useCreateList() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (input: CreateListInput) => createList(user!.id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lists'] }),
  });
}

export interface UpdateListInput {
  title?: string;
  description?: string | null;
  privacy?: ListPrivacy;
  showPrices?: boolean;
  showPriority?: boolean;
  notifyNewItems?: boolean;
  coverImage?: string | null;
}

async function updateList(listId: string, input: UpdateListInput): Promise<void> {
  if (!supabase) throw new Error('Supabase não configurado.');
  const patch: Database['public']['Tables']['lists']['Update'] = {};
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.description !== undefined) patch.description = input.description;
  if (input.privacy !== undefined) patch.privacy = input.privacy;
  if (input.showPrices !== undefined) patch.show_prices = input.showPrices;
  if (input.showPriority !== undefined) patch.show_priority = input.showPriority;
  if (input.notifyNewItems !== undefined) patch.notify_new_items = input.notifyNewItems;
  if (input.coverImage !== undefined) patch.cover_image = input.coverImage;

  const { error } = await supabase.from('lists').update(patch).eq('id', listId);
  if (error) throw error;
}

/** Edita uma lista (título, descrição, privacidade). */
export function useUpdateList(listId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateListInput) => updateList(listId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', 'one', listId] });
      queryClient.invalidateQueries({ queryKey: ['lists', 'mine'] });
    },
  });
}

async function deleteList(listId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase não configurado.');
  const { error } = await supabase.from('lists').delete().eq('id', listId);
  if (error) throw error;
}

/** Exclui uma lista (cascata remove itens e colaboradores). */
export function useDeleteList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listId: string) => deleteList(listId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lists', 'mine'] }),
  });
}

// ===== Captura de link + upload de imagem =====

const IMAGE_BUCKET = 'item-images';

export interface LinkPreview {
  title?: string;
  store?: string;
  price?: string;
  image?: string;
}

/**
 * Captura metadados de um produto pela URL via Edge Function `link-preview`,
 * que lê Open Graph + JSON-LD e HOSPEDA a imagem no Storage (evita hotlink 403).
 */
export async function fetchLinkPreview(url: string): Promise<LinkPreview> {
  if (!supabase) return {};
  const { data, error } = await supabase.functions.invoke<{
    title?: string;
    brand?: string;
    price?: string;
    image?: string;
    error?: string;
  }>('link-preview', { body: { url } });
  if (error || !data || data.error) return {};
  return { title: data.title, store: data.brand, price: data.price, image: data.image };
}

/** Envia uma imagem do dispositivo para o Storage e retorna a URL pública. */
export async function uploadItemImage(file: File): Promise<string> {
  if (!supabase) throw new Error('Supabase não configurado.');
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `${crypto.randomUUID()}.${ext || 'jpg'}`;
  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type || undefined, upsert: false });
  if (error) throw error;
  return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

// ===== Itens da lista =====

type ItemRow = Database['public']['Tables']['list_items']['Row'];

export interface ListItem {
  id: string;
  title: string;
  /** Nome da loja (derivado da URL ou informado). */
  store: string | null;
  price: string | null;
  url: string | null;
  imageUrl: string | null;
  /** Quem adicionou — usado para liberar editar/remover só para o autor. */
  addedBy: string | null;
  /** Urgência/estado do item (mostrado como selo no card). */
  status: ItemStatus;
  /** Reserva visível (escondida do dono = surpresa). null se não reservado/visível. */
  reservation: { id: string; reservedBy: string } | null;
}

type ReservationEmbed = { id: string; reserved_by: string };
type ItemRowWithReservation = ItemRow & {
  // PostgREST devolve objeto (relação 1-para-1 por unique(item_id)) ou array.
  reservations?: ReservationEmbed | ReservationEmbed[] | null;
};

export interface ListSummary {
  id: string;
  title: string;
  description: string | null;
  privacy: ListPrivacy;
  ownerId: string;
  ownerName: string;
  ownerHandle: string | null;
  ownerAvatar: string | null;
  showPrices: boolean;
  showPriority: boolean;
  notifyNewItems: boolean;
  image: string;
}

function mapItem(row: ItemRowWithReservation): ListItem {
  const resv = Array.isArray(row.reservations) ? row.reservations[0] : row.reservations;
  return {
    id: row.id,
    title: row.title,
    store: row.brand,
    price: row.price,
    url: row.url,
    imageUrl: row.image_url,
    addedBy: row.added_by,
    status: row.status,
    reservation: resv ? { id: resv.id, reservedBy: resv.reserved_by } : null,
  };
}

async function fetchList(listId: string): Promise<ListSummary | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('lists')
    .select(
      'id, title, description, privacy, owner_id, show_prices, show_priority, notify_new_items, cover_image',
    )
    .eq('id', listId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { data: owner } = await supabase
    .from('profiles')
    .select('name, handle, avatar_url')
    .eq('id', data.owner_id)
    .maybeSingle();

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    privacy: data.privacy,
    ownerId: data.owner_id,
    ownerName: owner?.name ?? 'Usuário',
    ownerHandle: owner?.handle ?? null,
    ownerAvatar: owner?.avatar_url ?? null,
    showPrices: data.show_prices,
    showPriority: data.show_priority,
    notifyNewItems: data.notify_new_items,
    image: data.cover_image ?? DEFAULT_COVER,
  };
}

/** Resumo de uma lista (título, privacidade, dono). */
export function useList(listId: string | undefined) {
  return useQuery({
    queryKey: ['lists', 'one', listId],
    queryFn: () => fetchList(listId!),
    enabled: Boolean(listId),
  });
}

async function fetchItems(listId: string): Promise<ListItem[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('list_items')
    .select('*, reservations(id, reserved_by)')
    .eq('list_id', listId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as unknown as ItemRowWithReservation[]).map(mapItem);
}

/** Itens de uma lista. Inclui reservas (dependem de auth.uid()), por isso
 * espera a sessão e re-busca por usuário. */
export function useListItems(listId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['list-items', listId, user?.id],
    queryFn: () => fetchItems(listId!),
    enabled: Boolean(listId && user),
  });
}

export interface AddItemInput {
  title: string;
  url?: string | null;
  price?: string | null;
  /** Imagem capturada do link ou enviada do dispositivo. */
  imageUrl?: string | null;
  /** Loja capturada do link; se ausente, derivamos do domínio. */
  store?: string | null;
  /** Urgência/estado do item. Padrão: 'desired'. */
  status?: ItemStatus;
}

async function addItem(userId: string, listId: string, input: AddItemInput): Promise<void> {
  if (!supabase) throw new Error('Supabase não configurado.');
  const url = input.url?.trim() || null;
  const store = input.store?.trim() || (url ? storeNameFromUrl(url) : null);
  const { error } = await supabase.from('list_items').insert({
    list_id: listId,
    title: input.title.trim(),
    price: input.price?.trim() || null,
    url,
    image_url: input.imageUrl?.trim() || null,
    brand: store,
    added_by: userId,
    status: input.status ?? 'desired',
  });
  if (error) throw error;
}

/** Adiciona um item à lista (autor = usuário logado). */
export function useAddItem(listId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (input: AddItemInput) => addItem(user!.id, listId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['list-items', listId] }),
  });
}

/** Adiciona um item a uma lista escolhida na hora (ex.: pela Home). */
export function useAddItemToList() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ listId, input }: { listId: string; input: AddItemInput }) =>
      addItem(user!.id, listId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['list-items', variables.listId] });
      queryClient.invalidateQueries({ queryKey: ['lists', 'mine'] });
    },
  });
}

async function deleteItem(itemId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase não configurado.');
  const { error } = await supabase.from('list_items').delete().eq('id', itemId);
  if (error) throw error;
}

/** Remove um item (a RLS garante que só o autor consegue). */
export function useDeleteItem(listId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => deleteItem(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['list-items', listId] }),
  });
}

async function updateItemStatus(itemId: string, status: ItemStatus): Promise<void> {
  if (!supabase) throw new Error('Supabase não configurado.');
  const { error } = await supabase.from('list_items').update({ status }).eq('id', itemId);
  if (error) throw error;
}

/** Atualiza a urgência/estado de um item (a RLS garante que só o autor consegue). */
export function useUpdateItemStatus(listId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, status }: { itemId: string; status: ItemStatus }) =>
      updateItemStatus(itemId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['list-items', listId] }),
  });
}

export interface UpdateItemInput {
  title?: string;
  url?: string | null;
  price?: string | null;
  imageUrl?: string | null;
  store?: string | null;
  status?: ItemStatus;
}

async function updateItem(itemId: string, input: UpdateItemInput): Promise<void> {
  if (!supabase) throw new Error('Supabase não configurado.');
  const patch: Database['public']['Tables']['list_items']['Update'] = {};
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.url !== undefined) patch.url = input.url?.trim() || null;
  if (input.price !== undefined) patch.price = input.price?.trim() || null;
  if (input.imageUrl !== undefined) patch.image_url = input.imageUrl?.trim() || null;
  if (input.store !== undefined) patch.brand = input.store?.trim() || null;
  if (input.status !== undefined) patch.status = input.status;

  const { error } = await supabase.from('list_items').update(patch).eq('id', itemId);
  if (error) throw error;
}

/** Edita um item da lista (título, preço, link, imagem, status). */
export function useUpdateItem(listId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, input }: { itemId: string; input: UpdateItemInput }) =>
      updateItem(itemId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['list-items', listId] }),
  });
}

// ===== Reservas de presente (escondidas do dono) =====

async function reserveItem(itemId: string, userId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase não configurado.');
  const { error } = await supabase
    .from('reservations')
    .insert({ item_id: itemId, reserved_by: userId });
  if (error) {
    if (error.code === '23505') throw new Error('Este presente já foi reservado.');
    throw error;
  }
}

/** Reserva um item (presente) — invisível para o dono da lista. */
export function useReserveItem(listId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (itemId: string) => reserveItem(itemId, user!.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['list-items', listId] }),
  });
}

async function unreserveItem(reservationId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase não configurado.');
  const { error } = await supabase.from('reservations').delete().eq('id', reservationId);
  if (error) throw error;
}

/** Cancela a própria reserva (RLS: só o autor da reserva). */
export function useUnreserveItem(listId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reservationId: string) => unreserveItem(reservationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['list-items', listId] }),
  });
}

// ===== Compartilhamento / colaboradores =====

export type CollaboratorRole = Database['public']['Enums']['collaborator_role'];

type SharedRow = {
  role: CollaboratorRole;
  lists: (ListRow & { list_items: { count: number }[] }) | null;
};

async function fetchSharedLists(userId: string): Promise<WishlistSummary[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('collaborators')
    .select('role, lists(*, list_items(count))')
    .eq('user_id', userId);

  if (error) throw error;

  return ((data ?? []) as unknown as SharedRow[])
    .filter((row) => row.lists)
    .map((row) => mapList(row.lists as ListWithCount));
}

/** Listas compartilhadas comigo (onde sou colaborador). */
export function useSharedLists() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['lists', 'shared', user?.id],
    queryFn: () => fetchSharedLists(user!.id),
    enabled: Boolean(user),
  });
}

export type CollaboratorStatus = 'pending' | 'accepted';

export interface Collaborator {
  id: string;
  userId: string;
  role: CollaboratorRole;
  status: CollaboratorStatus;
  name: string;
  handle: string | null;
  avatarUrl: string | null;
}

async function fetchCollaborators(listId: string): Promise<Collaborator[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('collaborators')
    .select('id, user_id, role, status')
    .eq('list_id', listId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  const rows = data ?? [];
  const ids = [...new Set(rows.map((r) => r.user_id))];

  const profiles = new Map<string, { name: string; handle: string | null; avatarUrl: string | null }>();
  if (ids.length > 0) {
    const { data: profs, error: pErr } = await supabase
      .from('profiles')
      .select('id, name, handle, avatar_url')
      .in('id', ids);
    if (pErr) throw pErr;
    for (const p of profs ?? []) {
      profiles.set(p.id, { name: p.name ?? 'Usuário', handle: p.handle, avatarUrl: p.avatar_url });
    }
  }

  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    role: r.role,
    status: (r.status as CollaboratorStatus) ?? 'accepted',
    name: profiles.get(r.user_id)?.name ?? 'Usuário',
    handle: profiles.get(r.user_id)?.handle ?? null,
    avatarUrl: profiles.get(r.user_id)?.avatarUrl ?? null,
  }));
}

/** Colaboradores de uma lista. */
export function useCollaborators(listId: string | undefined) {
  return useQuery({
    queryKey: ['collaborators', listId],
    queryFn: () => fetchCollaborators(listId!),
    enabled: Boolean(listId),
  });
}

export interface ListCollaborator extends Collaborator {
  listId: string;
  listTitle: string;
}

type MyCollabRow = {
  id: string;
  user_id: string;
  role: CollaboratorRole;
  status: string;
  lists: { id: string; title: string; owner_id: string } | null;
};

async function fetchMyListCollaborators(userId: string): Promise<ListCollaborator[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('collaborators')
    .select('id, user_id, role, status, lists!inner(id, title, owner_id)')
    .eq('lists.owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  const rows = (data ?? []) as unknown as MyCollabRow[];
  const ids = [...new Set(rows.map((r) => r.user_id))];

  const profiles = new Map<string, { name: string; handle: string | null; avatarUrl: string | null }>();
  if (ids.length > 0) {
    const { data: profs, error: pErr } = await supabase
      .from('profiles')
      .select('id, name, handle, avatar_url')
      .in('id', ids);
    if (pErr) throw pErr;
    for (const p of profs ?? []) {
      profiles.set(p.id, { name: p.name ?? 'Usuário', handle: p.handle, avatarUrl: p.avatar_url });
    }
  }

  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    role: r.role,
    status: (r.status as CollaboratorStatus) ?? 'accepted',
    name: profiles.get(r.user_id)?.name ?? 'Usuário',
    handle: profiles.get(r.user_id)?.handle ?? null,
    avatarUrl: profiles.get(r.user_id)?.avatarUrl ?? null,
    listId: r.lists?.id ?? '',
    listTitle: r.lists?.title ?? '',
  }));
}

/** Pessoas com quem o usuário compartilha (colaboradores das listas que ele é dono). */
export function useMyListCollaborators() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['collaborators', 'mine', user?.id],
    queryFn: () => fetchMyListCollaborators(user!.id),
    enabled: Boolean(user),
  });
}

function normalizeHandle(handle: string): string {
  return handle.trim().replace(/^@+/, '').toLowerCase().replace(/[^a-z0-9_.]/g, '');
}

async function addCollaborator(
  listId: string,
  handle: string,
  role: CollaboratorRole,
): Promise<void> {
  if (!supabase) throw new Error('Supabase não configurado.');
  const normalized = normalizeHandle(handle);
  if (!normalized) throw new Error('Informe o @usuário.');

  const { data: profile, error: pErr } = await supabase
    .from('profiles')
    .select('id')
    .eq('handle', normalized)
    .maybeSingle();
  if (pErr) throw pErr;
  if (!profile) throw new Error('Usuário não encontrado. Confirme o @usuário.');

  const { error } = await supabase
    .from('collaborators')
    .insert({ list_id: listId, user_id: profile.id, role, status: 'pending' });
  if (error) {
    if (error.code === '23505') throw new Error('Essa pessoa já foi convidada.');
    throw error;
  }
}

/** Adiciona um colaborador a uma lista pelo @usuário. */
export function useAddCollaborator(listId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ handle, role }: { handle: string; role: CollaboratorRole }) =>
      addCollaborator(listId!, handle, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['collaborators', listId] }),
  });
}

async function inviteById(listId: string, userId: string, role: CollaboratorRole): Promise<void> {
  if (!supabase) throw new Error('Supabase não configurado.');
  const { error } = await supabase
    .from('collaborators')
    .insert({ list_id: listId, user_id: userId, role, status: 'pending' });
  if (error) {
    if (error.code === '23505') throw new Error('Essa pessoa já foi convidada.');
    throw error;
  }
}

/**
 * Status de convite de uma pessoa nas MINHAS listas (para o modal de convite):
 * mapeia list_id -> 'pending' | 'accepted' (a RLS só devolve linhas de listas
 * que eu vejo — ou seja, minhas).
 */
export function useListInviteStatuses(userId: string | undefined) {
  return useQuery({
    queryKey: ['collaborators', 'status-of', userId],
    queryFn: async (): Promise<Record<string, CollaboratorStatus>> => {
      if (!supabase || !userId) return {};
      const { data, error } = await supabase
        .from('collaborators')
        .select('list_id, status')
        .eq('user_id', userId);
      if (error) throw error;
      const map: Record<string, CollaboratorStatus> = {};
      for (const row of data ?? []) {
        map[row.list_id] = (row.status as CollaboratorStatus) ?? 'accepted';
      }
      return map;
    },
    enabled: Boolean(userId),
  });
}

/** Responde a um convite de lista: aceita (status accepted) ou recusa (remove). */
export function useRespondListInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ collaboratorId, accept }: { collaboratorId: string; accept: boolean }) => {
      if (!supabase) throw new Error('Supabase não configurado.');
      const { error } = await supabase.rpc('respond_list_invite', {
        _collaborator: collaboratorId,
        _accept: accept,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborators'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
}

/** Convida uma pessoa (por id) para uma lista escolhida — ex.: pela tela de perfil. */
export function useInviteToList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      listId,
      userId,
      role = 'editor',
    }: {
      listId: string;
      userId: string;
      role?: CollaboratorRole;
    }) => inviteById(listId, userId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['collaborators'] }),
  });
}

async function removeCollaborator(collaboratorId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase não configurado.');
  const { error } = await supabase.from('collaborators').delete().eq('id', collaboratorId);
  if (error) throw error;
}

/** Remove um colaborador (a RLS garante: dono da lista ou o próprio). */
export function useRemoveCollaborator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (collaboratorId: string) => removeCollaborator(collaboratorId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['collaborators'] }),
  });
}
