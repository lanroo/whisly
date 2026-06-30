import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/shared/auth';

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=1200&q=80';

export interface PublicOwner {
  id: string;
  name: string;
  handle: string | null;
  avatarUrl: string | null;
}

export interface PublicList {
  id: string;
  title: string;
  image: string;
  items: number;
  owner: PublicOwner;
}

interface PublicListRow {
  id: string;
  title: string;
  cover_image: string | null;
  owner_id: string;
  list_items: { count: number }[];
}

async function fetchPublicLists(excludeUserId?: string): Promise<PublicList[]> {
  if (!supabase) return [];

  let query = supabase
    .from('lists')
    .select('id, title, cover_image, owner_id, list_items(count)')
    .eq('privacy', 'public')
    .order('updated_at', { ascending: false })
    .limit(60);

  if (excludeUserId) query = query.neq('owner_id', excludeUserId);

  const { data, error } = await query;
  if (error) throw error;

  const rows = (data ?? []) as unknown as PublicListRow[];
  const ownerIds = [...new Set(rows.map((r) => r.owner_id))];

  const owners = new Map<string, PublicOwner>();
  if (ownerIds.length > 0) {
    const { data: profiles, error: profErr } = await supabase
      .from('profiles')
      .select('id, name, handle, avatar_url')
      .in('id', ownerIds);
    if (profErr) throw profErr;
    for (const p of profiles ?? []) {
      owners.set(p.id, {
        id: p.id,
        name: p.name ?? 'Usuário',
        handle: p.handle,
        avatarUrl: p.avatar_url,
      });
    }
  }

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    image: r.cover_image ?? DEFAULT_COVER,
    items: r.list_items?.[0]?.count ?? 0,
    owner: owners.get(r.owner_id) ?? {
      id: r.owner_id,
      name: 'Usuário',
      handle: null,
      avatarUrl: null,
    },
  }));
}

/** Listas públicas de outras pessoas (descobrir). */
export function usePublicLists() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['explore', 'public-lists', user?.id],
    queryFn: () => fetchPublicLists(user?.id),
    enabled: Boolean(user),
  });
}

/** Pessoas com listas públicas (donos distintos). */
export function usePublicPeople() {
  const lists = usePublicLists();
  const people: PublicOwner[] = [];
  const seen = new Set<string>();
  for (const list of lists.data ?? []) {
    if (!seen.has(list.owner.id)) {
      seen.add(list.owner.id);
      people.push(list.owner);
    }
  }
  return { ...lists, data: people };
}
