import { Link, useLocation } from 'react-router-dom';
import type { NavItem } from '../types/ui';
import { MaterialIcon } from './MaterialIcon';

interface TopNavProps {
  items?: NavItem[];
  activeKey?: string;
}

/**
 * Barra de navegação superior (tablet/desktop).
 *
 * Complementa a BottomNav: a TopNav aparece só em telas largas e a BottomNav
 * só no mobile (controlado por CSS). Mesma fonte de itens (MAIN_NAV_ITEMS).
 */
export function TopNav({ items = [], activeKey }: TopNavProps) {
  const location = useLocation();

  return (
    <header className="app-top-nav">
      <div className="app-top-nav__inner">
        <Link className="app-top-nav__brand" to="/home">
          <span className="app-top-nav__logo">W</span>
          <span>WISHLY</span>
        </Link>

        <nav className="app-top-nav__links" aria-label="Navegação principal">
          {items.map((item) => {
            const active = activeKey
              ? activeKey === item.key
              : location.pathname === item.to ||
                (item.to !== '/home' && location.pathname.startsWith(item.to));

            return (
              <Link
                key={item.key ?? item.label}
                className={`app-top-nav__link ${active ? 'is-active' : ''}`}
                to={item.to}
              >
                <MaterialIcon filled={active} name={item.icon} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <Link aria-label="Notificações" className="icon-button app-top-nav__bell" to="/activity">
          <MaterialIcon name="notifications" />
        </Link>
      </div>
    </header>
  );
}
