import { Link, useLocation } from 'react-router-dom';
import type { NavItem } from '../types/ui';
import { MaterialIcon } from './MaterialIcon';

const defaultItems: NavItem[] = [
  { label: 'Home', icon: 'home', to: '/home' },
  { label: 'Lists', icon: 'list_alt', to: '/lists' },
  { label: 'Activity', icon: 'notifications', to: '/home' },
  { label: 'Profile', icon: 'person', to: '/home' },
];

interface BottomNavProps {
  items?: NavItem[];
  activeKey?: string;
}

export function BottomNav({ items = defaultItems, activeKey }: BottomNavProps) {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      {items.map((item) => {
        const active = activeKey
          ? activeKey === item.key
          : location.pathname === item.to ||
            (item.to !== '/home' && location.pathname.startsWith(item.to));

        return (
          <Link
            key={item.key ?? item.label}
            className={`bottom-nav__item ${active ? 'is-active' : ''}`}
            to={item.to}
          >
            <MaterialIcon filled={active} name={item.icon} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
