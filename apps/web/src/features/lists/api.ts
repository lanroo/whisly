import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/shared/auth';
import { storeNameFromUrl } from '@/shared/store-name';
import type { WishlistSummary } from '@/types/models';

export type ListPrivacy = Database['public']['Enums']['list_privacy'];
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
}

export interface ListSummary {
  id: string;
  title: string;
  privacy: ListPrivacy;
  ownerId: string;
}

function mapItem(row: ItemRow): ListItem {
  return {
    id: row.id,
    title: row.title,
    store: row.brand,
    price: row.price,
    url: row.url,
    imageUrl: row.image_url,
    addedBy: row.added_by,
  };
}

async function fetchList(listId: string): Promise<ListSummary | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('lists')
    .select('id, title, privacy, owner_id')
    .eq('id', listId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return { id: data.id, title: data.title, privacy: data.privacy, ownerId: data.owner_id };
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
    .select('*')
    .eq('list_id', listId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as ItemRow[]).map(mapItem);
}

/** Itens de uma lista. */
export function useListItems(listId: string | undefined) {
  return useQuery({
    queryKey: ['list-items', listId],
    queryFn: () => fetchItems(listId!),
    enabled: Boolean(listId),
  });
}

export interface AddItemInput {
  title: string;
  url?: string | null;
  price?: string | null;
  /** Imagem capturada do link (Microlink). */
  imageUrl?: string | null;
  /** Loja capturada do link; se ausente, derivamos do domínio. */
  store?: string | null;
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

export interface Collaborator {
  id: string;
  userId: string;
  role: CollaboratorRole;
  name: string;
  handle: string | null;
  avatarUrl: string | null;
}

async function fetchCollaborators(listId: string): Promise<Collaborator[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('collaborators')
    .select('id, user_id, role')
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
    .insert({ list_id: listId, user_id: profile.id, role });
  if (error) {
    if (error.code === '23505') throw new Error('Essa pessoa já é colaboradora.');
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

async function removeCollaborator(collaboratorId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase não configurado.');
  const { error } = await supabase.from('collaborators').delete().eq('id', collaboratorId);
  if (error) throw error;
}

/** Remove um colaborador (a RLS garante: dono da lista ou o próprio). */
export function useRemoveCollaborator(listId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (collaboratorId: string) => removeCollaborator(collaboratorId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['collaborators', listId] }),
  });
}
