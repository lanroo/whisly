import { AppShell } from '../components/AppShell';
import { ListCard } from '../components/ListCard';
import { NewListCard } from '../components/NewListCard';
import { TopBar } from '../components/TopBar';
import { useMyLists } from '../features/lists/api';
import { MAIN_NAV_ITEMS } from '../shared/config/navigation';
import { Button, EmptyState, Skeleton } from '../shared/ui';

export function ListsPage() {
  const { data: lists, isLoading, isError } = useMyLists();

  return (
    <AppShell activeNavKey="lists" className="lists-shell" enablePullToRefresh navItems={MAIN_NAV_ITEMS}>
      <TopBar backTo="/home" title="WISHLY" />

      <main className="page lists-page">
        <section className="lists-page__hero">
          <h2>Minhas Listas</h2>
          <p>Todas as suas listas em um único lugar.</p>
        </section>

        {isLoading ? (
          <div className="lists-grid">
            {['a', 'b', 'c', 'd'].map((key) => (
              <Skeleton key={key} height={300} width="100%" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            description="Não foi possível carregar suas listas. Tente novamente."
            icon="error_outline"
            title="Algo deu errado"
          />
        ) : lists && lists.length > 0 ? (
          <section className="lists-grid">
            {lists.map((list) => (
              <ListCard key={list.id} list={list} variant="lists" />
            ))}
            <NewListCard className="new-list-card--grid" />
          </section>
        ) : (
          <EmptyState
            action={
              <Button icon="add" to="/lists/new">
                Criar lista
              </Button>
            }
            description="Crie sua primeira lista para começar a organizar seus desejos."
            icon="format_list_bulleted"
            title="Nenhuma lista ainda"
          />
        )}
      </main>
    </AppShell>
  );
}
