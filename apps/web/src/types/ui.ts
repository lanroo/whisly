/** Tipos de UI compartilhados entre componentes de layout. */

/** Item da navegação inferior / shell do app. */
export interface NavItem {
  key?: string;
  label: string;
  icon: string;
  to: string;
}
