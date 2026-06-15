import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/shared/auth';
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
