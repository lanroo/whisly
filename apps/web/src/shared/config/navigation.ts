import type { NavItem } from '../../types/ui';

/**
 * Navegação principal do app (barra inferior).
 *
 * Fonte única usada pelas telas que compartilham o mesmo conjunto de abas,
 * eliminando a duplicação que antes existia em cada página.
 */
export const MAIN_NAV_ITEMS: NavItem[] = [
  { key: 'home', label: 'Home', icon: 'home', to: '/home' },
  { key: 'shared', label: 'Shared', icon: 'group', to: '/activity' },
  { key: 'explore', label: 'Explore', icon: 'explore', to: '/explore' },
  { key: 'profile', label: 'Profile', icon: 'person', to: '/profile' },
];
