import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/shared/auth';

export interface ProfileStats {
  /** Listas que o usuário é dono. */
  lists: number;
  /** Itens somados em todas as listas do usuário. */
  items: number;
  /** Listas compartilhadas com o usuário (onde ele é colaborador). */
  shared: number;
}

export interface MyProfile {
  id: string;
  name: string;
  handle: string;
  bio: string;
  avatarUrl: string | null;
  stats: ProfileStats;
}

async function fetchProfile(userId: string, fallbackName: string): Promise<MyProfile> {
  if (!supabase) {
    return {
      id: userId,
      name: fallbackName,
      handle: '',
      bio: '',
      avatarUrl: null,
      stats: { lists: 0, items: 0, shared: 0 },
    };
  }

  const [profileRes, listsCount, itemsCount, sharedCount] = await Promise.all([
    supabase.from('profiles').select('name, handle, bio, avatar_url').eq('id', userId).maybeSingle(),
    supabase.from('lists').select('id', { count: 'exact', head: true }).eq('owner_id', userId),
    supabase
      .from('list_items')
      .select('id, lists!inner(owner_id)', { count: 'exact', head: true })
      .eq('lists.owner_id', userId),
    supabase.from('collaborators').select('id', { count: 'exact', head: true }).eq('user_id', userId),
  ]);

  if (profileRes.error) throw profileRes.error;

  const p = profileRes.data;
  return {
    id: userId,
    name: p?.name ?? fallbackName,
    handle: p?.handle ?? '',
    bio: p?.bio ?? '',
    avatarUrl: p?.avatar_url ?? null,
    stats: {
      lists: listsCount.count ?? 0,
      items: itemsCount.count ?? 0,
      shared: sharedCount.count ?? 0,
    },
  };
}

/** Perfil do usuário logado, com estatísticas reais. */
export function useMyProfile() {
  const { user } = useAuth();
  const fallback = (user?.user_metadata?.name as string | undefined) ?? user?.email?.split('@')[0] ?? '';
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => fetchProfile(user!.id, fallback),
    enabled: Boolean(user),
  });
}

export interface UpdateProfileInput {
  name: string;
  handle?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
}

function normalizeHandle(handle: string | null | undefined): string | null {
  const value = (handle ?? '').trim().replace(/^@+/, '').toLowerCase();
  if (!value) return null;
  return value.replace(/[^a-z0-9_.]/g, '');
}

async function updateProfile(userId: string, input: UpdateProfileInput): Promise<void> {
  if (!supabase) throw new Error('Supabase não configurado.');
  const { error } = await supabase
    .from('profiles')
    .update({
      name: input.name.trim() || null,
      handle: normalizeHandle(input.handle),
      bio: input.bio?.trim() || null,
      avatar_url: input.avatarUrl ?? undefined,
    })
    .eq('id', userId);

  if (error) {
    if (error.code === '23505') {
      throw new Error('Esse nome de usuário já está em uso.');
    }
    throw error;
  }
}

/** Atualiza o perfil do usuário logado. */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(user!.id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });
}

export interface PublicList {
  id: string;
  title: string;
  image: string;
  items: number;
}

export interface PublicProfileData {
  id: string;
  name: string;
  handle: string | null;
  bio: string | null;
  avatarUrl: string | null;
  lists: PublicList[];
}

const PROFILE_DEFAULT_COVER =
  'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=1200&q=80';

async function fetchPublicProfile(userId: string): Promise<PublicProfileData | null> {
  if (!supabase) return null;

  const [profileRes, listsRes] = await Promise.all([
    supabase.from('profiles').select('id, name, handle, bio, avatar_url').eq('id', userId).maybeSingle(),
    supabase
      .from('lists')
      .select('id, title, cover_image, list_items(count)')
      .eq('owner_id', userId)
      .eq('privacy', 'public')
      .order('updated_at', { ascending: false }),
  ]);

  if (profileRes.error) throw profileRes.error;
  if (!profileRes.data) return null;
  if (listsRes.error) throw listsRes.error;

  const p = profileRes.data;
  const rows = (listsRes.data ?? []) as unknown as {
    id: string;
    title: string;
    cover_image: string | null;
    list_items: { count: number }[];
  }[];

  return {
    id: p.id,
    name: p.name ?? 'Usuário',
    handle: p.handle,
    bio: p.bio,
    avatarUrl: p.avatar_url,
    lists: rows.map((r) => ({
      id: r.id,
      title: r.title,
      image: r.cover_image ?? PROFILE_DEFAULT_COVER,
      items: r.list_items?.[0]?.count ?? 0,
    })),
  };
}

/** Perfil público de outra pessoa (dados + listas públicas). */
export function usePublicProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['profile', 'public', userId],
    queryFn: () => fetchPublicProfile(userId!),
    enabled: Boolean(userId),
  });
}
