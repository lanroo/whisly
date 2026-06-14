import { Link } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { MaterialIcon } from '../components/MaterialIcon';
import { MAIN_NAV_ITEMS } from '../shared/config/navigation';

export function EmptyListsPage() {
  return (
    <AppShell activeNavKey="lists" className="empty-lists-shell" navItems={MAIN_NAV_ITEMS} showFab={false}>
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
          <h2>Crie sua primeira lista</h2>
          <p>Seus próximos favoritos estão esperando. Crie uma lista para organizar produtos de qualquer loja.</p>
          <Link className="empty-lists-state__cta" to="/lists/new">
            <MaterialIcon name="add" />
            <span>Criar nova lista</span>
          </Link>
        </section>
      </main>
    </AppShell>
  );
}
