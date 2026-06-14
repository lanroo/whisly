export const homeLists = [
  {
    id: 'birthday',
    title: 'Aniversario',
    items: 12,
    privacy: 'Private',
    image:
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'home',
    title: 'Casa Nova',
    items: 24,
    privacy: 'Private',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
  },
];

export const userLists = [
  {
    id: 'birthday',
    title: 'Aniversario',
    items: 12,
    privacy: 'Private',
    updated: 'Atualizada ha 2 dias',
    image:
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
    to: '/lists/birthday',
  },
  {
    id: 'home',
    title: 'Casa Nova',
    items: 24,
    privacy: 'Private',
    updated: 'Atualizada ha 1 semana',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    to: '/lists/home',
  },
  {
    id: 'trip',
    title: 'Viagem dos Sonhos',
    items: 8,
    visibility: 'Publico',
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

export const sharedLists = [
  {
    id: 'baby-shower',
    title: 'Cha de Bebe da Maria',
    badge: 'Shared',
    image:
      'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=900&q=80',
    collaborators: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=160&q=80',
    ],
    extraCount: 3,
  },
  {
    id: 'vacation',
    title: 'Viagem de Ferias',
    badge: 'Shared',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    collaborators: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80',
    ],
  },
];

export const listProducts = [
  {
    id: 'nike',
    brand: 'Nike',
    title: 'Nike Air Max Nova Geracao',
    price: 'R$ 899,00',
    status: 'urgent',
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'watch-minimal',
    brand: 'Minimalist Store',
    title: 'Relogio Minimal White',
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
    title: 'Camera Analogica Retro',
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

export const activityFeed = [
  {
    id: 'request-sarah',
    type: 'request',
    actor: 'Sarah',
    message: 'sent you a friend request',
    time: 'Just now',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'item-julia',
    type: 'activity',
    actor: 'Julia',
    message: 'added a new item to',
    target: 'Birthday Trip',
    time: '14m ago',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=240&q=80',
    previewImage:
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'reserved-marcos',
    type: 'activity',
    actor: 'Marcos',
    message: 'reserved a gift in your',
    target: 'Anniversary list',
    time: '2h ago',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
    privacyLabel: 'Confidential',
  },
  {
    id: 'shared-elena',
    type: 'activity',
    actor: 'Elena',
    message: 'shared a new list',
    target: 'Home Decor Inspo',
    suffix: 'with you',
    time: '5h ago',
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
    actor: 'System',
    message: 'Your Birthday List is trending among your friends!',
    time: 'Yesterday',
    icon: 'celebration',
  },
];

export const exploreCategories = [
  { id: 'fashion', label: 'Fashion', icon: 'checkroom' },
  { id: 'tech', label: 'Tech', icon: 'devices' },
  { id: 'home', label: 'Home', icon: 'chair' },
  { id: 'art', label: 'Art', icon: 'palette' },
];

export const publicFriendLists = [
  {
    id: 'birthday-trip',
    owner: 'Julia',
    title: 'Birthday Trip',
    meta: '12 itens',
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'home-decor',
    owner: 'Elena',
    title: 'Home Decor Inspo',
    meta: '24 itens',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'dream-kitchen',
    owner: 'Marcos',
    title: 'Dream Kitchen',
    meta: '9 itens',
    image:
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80',
  },
];

export const friendsList = [
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

export const giftSuggestions = [
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

export function getTopRequestedGifts(limit = 5) {
  const productMap = new Map(giftSuggestions.map((gift) => [gift.id, gift]));
  const rankingMap = giftDemandEntries.reduce((accumulator, entry) => {
    const current = accumulator.get(entry.productId) ?? { count: 0, lists: new Set() };
    current.count += 1;
    current.lists.add(entry.listId);
    accumulator.set(entry.productId, current);
    return accumulator;
  }, new Map());

  return [...rankingMap.entries()]
    .map(([productId, stats]) => {
      const product = productMap.get(productId);
      return {
        ...product,
        requests: stats.count,
        listCount: stats.lists.size,
      };
    })
    .filter(Boolean)
    .sort((first, second) => second.requests - first.requests || second.listCount - first.listCount)
    .slice(0, limit);
}

export const collaborators = [
  {
    id: 'sarah-jenkins',
    name: 'Sarah Jenkins',
    role: 'Owner',
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

export const profileUser = {
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
