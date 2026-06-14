import type { NavItem } from '../../types/ui';

/**
 * Navegação principal do app.
 *
 * Conjunto ÚNICO de destinos de topo, usado tanto pela barra inferior (mobile)
 * quanto pela barra superior (tablet/desktop). A tela de Atividade é acessada
 * pelo sino de notificações no cabeçalho.
 */
export const MAIN_NAV_ITEMS: NavItem[] = [
  { key: 'home', label: 'Início', icon: 'home', to: '/home' },
  { key: 'lists', label: 'Listas', icon: 'list_alt', to: '/lists' },
  { key: 'explore', label: 'Explorar', icon: 'explore', to: '/explore' },
  { key: 'profile', label: 'Perfil', icon: 'person', to: '/profile' },
];
