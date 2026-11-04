import { useMemo, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { ListCard } from '../components/ListCard';
import { MaterialIcon } from '../components/MaterialIcon';
import { NewListCard } from '../components/NewListCard';
import { TopBar } from '../components/TopBar';
import { useMyLists } from '../features/lists/api';
import { MAIN_NAV_ITEMS } from '../shared/config/navigation';
import { Button, EmptyState, Skeleton } from '../shared/ui';

export function ListsPage() {
  const { data: lists, isLoading, isError } = useMyLists();
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredLists = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term || !lists) return lists ?? [];
    return lists.filter((list) => list.title.toLowerCase().includes(term));
  }, [lists, search]);

  return (
    <AppShell
      activeNavKey="lists"
      className="lists-shell"
      enablePullToRefresh
      fabLabel="Nova lista"
      fabTo="/lists/new"
      navItems={MAIN_NAV_ITEMS}
    >
      <TopBar
        backTo="/home"
        brand
        onRight={() => setSearchOpen((open) => !open)}
        rightIcon={searchOpen ? 'close' : 'search'}
        title="Whisly"
      />

      <main className="page lists-page">
        <section className="lists-page__hero">
          <h2>Minhas Listas</h2>
          <p>Todas as suas listas em um único lugar.</p>
        </section>

        {searchOpen ? (
          <label className="search-box lists-page__search">
            <MaterialIcon name="search" />
            <input
              autoFocus
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar nas suas listas..."
              type="text"
              value={search}
            />
          </label>
        ) : null}

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
          filteredLists.length > 0 ? (
            <section className="lists-grid">
              {filteredLists.map((list) => (
                <ListCard key={list.id} list={list} variant="lists" />
              ))}
              <NewListCard className="new-list-card--grid" />
            </section>
          ) : (
            <p className="explore-empty-hint">Nenhuma lista encontrada para "{search}".</p>
          )
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
