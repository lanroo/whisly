import type {
  ActivityItem,
  Collaborator,
  ExploreCategory,
  Friend,
  GiftSuggestion,
  Product,
  ProfileUser,
  PublicFriendList,
  RankedGift,
  WishlistSummary,
} from '../types/models';

export const homeLists: WishlistSummary[] = [
  {
    id: 'birthday',
    title: 'Aniversário',
    items: 12,
    privacy: 'Privada',
    image:
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'home',
    title: 'Casa Nova',
    items: 24,
    privacy: 'Privada',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
  },
];

export const userLists: WishlistSummary[] = [
  {
    id: 'birthday',
    title: 'Aniversário',
    items: 12,
    privacy: 'Privada',
    updated: 'Atualizada ha 2 dias',
    image:
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
    to: '/lists/birthday',
  },
  {
    id: 'home',
    title: 'Casa Nova',
    items: 24,
    privacy: 'Privada',
    updated: 'Atualizada ha 1 semana',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    to: '/lists/home',
  },
  {
    id: 'trip',
    title: 'Viagem dos Sonhos',
    items: 8,
    visibility: 'Público',
    updated: 'Atualizada hoje',
    collaborators: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=160&q=80',
    ],
    extraCount: 2,
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    to: '/lists/birthday',
  },
];

export const listProducts: Product[] = [
  {
    id: 'nike',
    brand: 'Nike',
    title: 'Nike Air Max Nova Geração',
    price: 'R$ 899,00',
    status: 'urgent',
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'watch-minimal',
    brand: 'Minimalist Store',
    title: 'Relógio Minimal White',
    price: 'R$ 450,00',
    status: 'bought',
    image:
      'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'headset',
    brand: 'Sony',
    title: 'Fone Noise Cancelling',
    price: 'R$ 1.299,00',
    status: 'desired',
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'camera-retro',
    brand: 'Amazon',
    title: 'Câmera Analógica Retro',
    price: 'R$ 680,00',
    status: 'later',
    image:
      'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'notebook',
    brand: 'Muji',
    title: 'Caderno de Couro Premium',
    price: 'R$ 120,00',
    status: 'bought',
    image:
      'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'headset-studio',
    brand: 'Bose',
    title: 'Headset Studio Pro Wireless',
    price: 'R$ 2.450,00',
    status: 'desired',
    image:
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=900&q=80',
  },
];

export const activityFeed: ActivityItem[] = [
  {
    id: 'request-sarah',
    type: 'request',
    actor: 'Sarah',
    message: 'enviou um pedido de amizade',
    time: 'Agora mesmo',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'item-julia',
    type: 'activity',
    actor: 'Julia',
    message: 'adicionou um item em',
    target: 'Viagem de Aniversário',
    time: 'há 14 min',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=240&q=80',
    previewImage:
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'reserved-marcos',
    type: 'activity',
    actor: 'Marcos',
    message: 'reservou um presente na sua',
    target: 'lista de Aniversário',
    time: 'há 2 h',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
    privacyLabel: 'Confidencial',
  },
  {
    id: 'shared-elena',
    type: 'activity',
    actor: 'Elena',
    message: 'compartilhou uma nova lista',
    target: 'Inspiração de Decoração',
    suffix: 'com você',
    time: 'há 5 h',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=80',
    collaborators: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    ],
  },
  {
    id: 'system-birthday',
    type: 'system',
    actor: 'Sistema',
    message: 'Sua lista de aniversário está em alta entre seus amigos!',
    time: 'Ontem',
    icon: 'celebration',
  },
];

export const exploreCategories: ExploreCategory[] = [
  { id: 'fashion', label: 'Fashion', icon: 'checkroom' },
  { id: 'tech', label: 'Tech', icon: 'devices' },
  { id: 'home', label: 'Home', icon: 'chair' },
  { id: 'art', label: 'Art', icon: 'palette' },
];

export const publicFriendLists: PublicFriendList[] = [
  {
    id: 'birthday-trip',
    owner: 'Julia',
    title: 'Viagem de Aniversário',
    meta: '12 itens',
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'home-decor',
    owner: 'Elena',
    title: 'Inspiração de Decoração',
    meta: '24 itens',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'dream-kitchen',
    owner: 'Marcos',
    title: 'Cozinha dos Sonhos',
    meta: '9 itens',
    image:
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80',
  },
];

export const friendsList: Friend[] = [
  {
    id: 'elena',
    name: 'Elena M.',
    subtitle: 'Amiga',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'marcus',
    name: 'Marcus T.',
    subtitle: 'Amigo',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'sarah',
    name: 'Sarah L.',
    subtitle: 'Amiga',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'lucas',
    name: 'Lucas R.',
    subtitle: 'Amigo',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'camila',
    name: 'Camila V.',
    subtitle: 'Amiga',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'noah',
    name: 'Noah P.',
    subtitle: 'Amigo',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'sofia',
    name: 'Sofia C.',
    subtitle: 'Amiga',
    avatar:
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'daniel',
    name: 'Daniel K.',
    subtitle: 'Amigo',
    avatar:
      'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=240&q=80',
  },
];

export const giftSuggestions: GiftSuggestion[] = [
  {
    id: 'kindle-paperwhite',
    name: 'Kindle Paperwhite',
    category: 'Tech',
    price: 'R$ 649',
    image:
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'air-fryer',
    name: 'Air Fryer Compact',
    category: 'Casa',
    price: 'R$ 399',
    image:
      'https://images.unsplash.com/photo-1585515656453-5a17d66f1a7d?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'carry-on',
    name: 'Mala de Bordo',
    category: 'Viagem',
    price: 'R$ 589',
    image:
      'https://images.unsplash.com/photo-1581553680321-4fffae59fccd?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'coffee-machine',
    name: 'Cafeteira Espresso',
    category: 'Cozinha',
    price: 'R$ 829',
    image:
      'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=900&q=80',
  },
];

const giftDemandEntries = [
  {
    entryId: 'gift-1',
    productId: 'kindle-paperwhite',
    listId: 'birthday-trip',
    addedBy: 'Julia',
  },
  {
    entryId: 'gift-2',
    productId: 'carry-on',
    listId: 'birthday-trip',
    addedBy: 'Julia',
  },
  {
    entryId: 'gift-3',
    productId: 'kindle-paperwhite',
    listId: 'home-decor',
    addedBy: 'Elena',
  },
  {
    entryId: 'gift-4',
    productId: 'air-fryer',
    listId: 'dream-kitchen',
    addedBy: 'Marcos',
  },
  {
    entryId: 'gift-5',
    productId: 'coffee-machine',
    listId: 'dream-kitchen',
    addedBy: 'Marcos',
  },
  {
    entryId: 'gift-6',
    productId: 'air-fryer',
    listId: 'birthday-trip',
    addedBy: 'Sarah',
  },
  {
    entryId: 'gift-7',
    productId: 'kindle-paperwhite',
    listId: 'home-decor',
    addedBy: 'Lucas',
  },
  {
    entryId: 'gift-8',
    productId: 'coffee-machine',
    listId: 'home-decor',
    addedBy: 'Elena',
  },
  {
    entryId: 'gift-9',
    productId: 'kindle-paperwhite',
    listId: 'dream-kitchen',
    addedBy: 'Camila',
  },
  {
    entryId: 'gift-10',
    productId: 'air-fryer',
    listId: 'home-decor',
    addedBy: 'Noah',
  },
];

interface GiftDemand {
  count: number;
  lists: Set<string>;
}

export function getTopRequestedGifts(limit = 5): RankedGift[] {
  const productMap = new Map(giftSuggestions.map((gift) => [gift.id, gift]));
  const rankingMap = new Map<string, GiftDemand>();

  for (const entry of giftDemandEntries) {
    const current = rankingMap.get(entry.productId) ?? { count: 0, lists: new Set<string>() };
    current.count += 1;
    current.lists.add(entry.listId);
    rankingMap.set(entry.productId, current);
  }

  return [...rankingMap.entries()]
    .map(([productId, stats]): RankedGift | null => {
      const product = productMap.get(productId);
      if (!product) return null;
      return { ...product, requests: stats.count, listCount: stats.lists.size };
    })
    .filter((gift): gift is RankedGift => gift !== null)
    .sort((first, second) => second.requests - first.requests || second.listCount - first.listCount)
    .slice(0, limit);
}

export const collaborators: Collaborator[] = [
  {
    id: 'sarah-jenkins',
    name: 'Sarah Jenkins',
    role: 'Dona',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'michael-chang',
    name: 'Michael Chang',
    role: 'Editor',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'emma-watson',
    name: 'Emma Watson',
    role: 'Editor',
    initial: 'E',
  },
];

export const profileUser: ProfileUser = {
  name: 'Casper Moretti',
  handle: '@casperwish',
  bio: 'Organizando desejos, viagens e listas compartilhadas com quem eu gosto.',
  avatar:
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80',
  stats: [
    { id: 'lists', label: 'Listas', value: '12' },
    { id: 'friends', label: 'Amigos', value: '48' },
    { id: 'shared', label: 'Compart.', value: '9' },
  ],
};
