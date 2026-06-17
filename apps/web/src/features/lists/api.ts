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
