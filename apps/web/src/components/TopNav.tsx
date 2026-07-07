import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { NavItem } from '../types/ui';
import { useAuth } from '../shared/auth';
import { Brand } from './Brand';
import { MaterialIcon } from './MaterialIcon';
import { MyAvatar } from './MyAvatar';

interface TopNavProps {
  items?: NavItem[];
  activeKey?: string;
}

/**
 * Barra de navegação superior (tablet/desktop).
 *
 * Complementa a BottomNav: a TopNav aparece só em telas largas e a BottomNav
 * só no mobile (controlado por CSS). No desktop, o "Perfil" sai da barra de
 * links e vira o menu do avatar no canto (Perfil / Configurações / Sair).
 */
export function TopNav({ items = [], activeKey }: TopNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  // O Perfil no desktop é acessado pelo menu do avatar, não pela barra.
  const links = items.filter((item) => item.key !== 'profile');

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  async function handleSignOut() {
    setMenuOpen(false);
    await signOut();
    navigate('/login');
  }

  return (
    <header className="app-top-nav">
      <div className="app-top-nav__inner">
        <Link className="app-top-nav__brand" to="/home">
          <Brand />
        </Link>

        <nav className="app-top-nav__links" aria-label="Navegação principal">
          {links.map((item) => {
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

        <div className="app-top-nav__account" ref={accountRef}>
          <button
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label="Sua conta"
            className={`app-top-nav__avatar-btn ${menuOpen ? 'is-open' : ''}`.trim()}
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            <MyAvatar size="sm" />
            <MaterialIcon className="app-top-nav__caret" name="expand_more" />
          </button>

          {menuOpen ? (
            <div className="app-top-nav__menu" role="menu">
              <Link
                className="app-top-nav__menu-item"
                onClick={() => setMenuOpen(false)}
                role="menuitem"
                to="/profile"
              >
                <MaterialIcon name="person" />
                Perfil
              </Link>
              <Link
                className="app-top-nav__menu-item"
                onClick={() => setMenuOpen(false)}
                role="menuitem"
                to="/configuracoes"
              >
                <MaterialIcon name="settings" />
                Configurações
              </Link>
              <button
                className="app-top-nav__menu-item app-top-nav__menu-item--danger"
                onClick={handleSignOut}
                role="menuitem"
                type="button"
              >
                <MaterialIcon name="logout" />
                Sair
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
