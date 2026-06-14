import { Link } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { MaterialIcon } from '../components/MaterialIcon';

const navItems = [
  { key: 'home', label: 'Home', icon: 'home', to: '/lists/empty' },
  { key: 'shared', label: 'Shared', icon: 'group', to: '/activity' },
  { key: 'explore', label: 'Explore', icon: 'explore', to: '/explore' },
  { key: 'profile', label: 'Profile', icon: 'person', to: '/profile' },
];

export function EmptyListsPage() {
  return (
    <AppShell activeNavKey="home" className="empty-lists-shell" navItems={navItems} showFab={false}>
      <header className="empty-lists-topbar">
        <div className="empty-lists-topbar__inner">
          <button aria-label="Menu" className="icon-button" type="button">
            <MaterialIcon name="menu" />
          </button>
          <h1>Wishly</h1>
          <Link aria-label="Notificações" className="icon-button" to="/activity">
            <MaterialIcon name="notifications" />
          </Link>
        </div>
      </header>

      <main className="page empty-lists-page">
        <section className="empty-lists-state">
          <div className="empty-lists-state__icon">
            <MaterialIcon name="format_list_bulleted" />
          </div>
          <h2>Start Your First List</h2>
          <p>Your future favorites are waiting. Create a list to organize products from any store.</p>
          <Link className="empty-lists-state__cta" to="/lists/new">
            <MaterialIcon name="add" />
            <span>Create New List</span>
          </Link>
        </section>
      </main>
    </AppShell>
  );
}
