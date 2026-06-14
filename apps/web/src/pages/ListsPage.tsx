import { AppShell } from '../components/AppShell';
import { ListCard } from '../components/ListCard';
import { NewListCard } from '../components/NewListCard';
import { TopBar } from '../components/TopBar';
import { userLists } from '../data/mockData';
import { MAIN_NAV_ITEMS } from '../shared/config/navigation';

export function ListsPage() {
  return (
    <AppShell activeNavKey="lists" className="lists-shell" enablePullToRefresh navItems={MAIN_NAV_ITEMS}>
      <TopBar backTo="/home" title="WISHLY" />

      <main className="page lists-page">
        <section className="lists-page__hero">
          <h2>Minhas Listas</h2>
          <p>Todas as suas listas em um único lugar.</p>
        </section>

        <section className="lists-grid">
          {userLists.map((list) => (
            <ListCard key={list.id} list={list} variant="lists" />
          ))}
          <NewListCard className="new-list-card--grid" />
        </section>
      </main>
    </AppShell>
  );
}
