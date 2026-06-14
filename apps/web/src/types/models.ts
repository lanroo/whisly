/**
 * Modelos de domínio do Whisly.
 *
 * Centralizam as formas de dados consumidas pela UI. Hoje alimentam os mocks
 * (`src/data/mockData.ts`); na Fase 5/6 passam a refletir os contratos da API
 * (compartilhados via `packages/shared`).
 */

export type ProductStatus = 'urgent' | 'desired' | 'later' | 'bought';

export type ActivityType = 'request' | 'activity' | 'system';

/** Resumo de uma wishlist exibido em cards (home e listagem). */
export interface WishlistSummary {
  id: string;
  title: string;
  items: number;
  image: string;
  privacy?: string;
  visibility?: string;
  updated?: string;
  to?: string;
  collaborators?: string[];
  extraCount?: number;
}

/** Lista compartilhada comigo (card da home). */
export interface SharedList {
  id: string;
  title: string;
  badge: string;
  image: string;
  collaborators: string[];
  extraCount?: number;
}

/** Item/produto dentro de uma lista. */
export interface Product {
  id: string;
  brand: string;
  title: string;
  price: string;
  status: ProductStatus;
  image: string;
}

/** Item do feed de atividades. */
export interface ActivityItem {
  id: string;
  type: ActivityType;
  actor: string;
  message: string;
  time: string;
  avatar?: string;
  target?: string;
  suffix?: string;
  previewImage?: string;
  privacyLabel?: string;
  collaborators?: string[];
  icon?: string;
}

export interface ExploreCategory {
  id: string;
  label: string;
  icon: string;
}

export interface PublicFriendList {
  id: string;
  owner: string;
  title: string;
  meta: string;
  image: string;
}

export interface Friend {
  id: string;
  name: string;
  subtitle: string;
  avatar: string;
}

export interface GiftSuggestion {
  id: string;
  name: string;
  category: string;
  price: string;
  image: string;
}

/** Sugestão de presente com métricas de demanda (ranking do Explore). */
export interface RankedGift extends GiftSuggestion {
  requests: number;
  listCount: number;
}

export interface Collaborator {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  initial?: string;
}

export interface ProfileStat {
  id: string;
  label: string;
  value: string;
}

export interface ProfileUser {
  name: string;
  handle: string;
  bio: string;
  avatar: string;
  stats: ProfileStat[];
}
