import { useMemo, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { ProductCard } from '../components/ProductCard';
import { TopBar } from '../components/TopBar';
import { listProducts } from '../data/mockData';
import { MaterialIcon } from '../components/MaterialIcon';

const filters = [
  { key: 'all', label: 'Todos' },
  { key: 'available', label: 'Disponiveis' },
  { key: 'reserved', label: 'Reservados' },
];

export function ListDetailsPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [view, setView] = useState('list');

  const filteredProducts = useMemo(() => {
    if (activeFilter === 'all') return listProducts;
    if (activeFilter === 'available') {
      return listProducts.filter((item) => item.status !== 'bought');
    }
    return listProducts.filter((item) => item.status === 'bought');
  }, [activeFilter]);

  return (
    <AppShell className="wishly-list-shell" showFab={false}>
      <TopBar backTo="/home" title="WISHLY" />

      <main className="page list-page">
        <section className="list-summary">
          <h2>Lista de Aniversario</h2>
          <p className="list-summary__meta">24 itens salvos • Criada ha 2 meses</p>
        </section>

        <section className="quote-card quote-card--list-page">
          <MaterialIcon name="format_quote" />
          <p>
            "Aqui estao algumas ideias para o meu aniversario. Fiquem a vontade para
            escolher o que preferirem."
          </p>
        </section>

        <section className="toolbar">
          <div className="segment-control">
            {filters.map((filter) => (
              <button
                key={filter.key}
                className={activeFilter === filter.key ? 'is-active' : ''}
                onClick={() => setActiveFilter(filter.key)}
                type="button"
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="segment-control segment-control--compact">
            <button
              className={view === 'grid' ? 'is-active' : ''}
              onClick={() => setView('grid')}
              type="button"
            >
              <MaterialIcon name="grid_view" />
            </button>
            <button
              className={view === 'list' ? 'is-active' : ''}
              onClick={() => setView('list')}
              type="button"
            >
              <MaterialIcon name="view_list" />
            </button>
          </div>
        </section>

        <section className={`product-collection product-collection--${view}`}>
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} view={view} />
          ))}
        </section>
      </main>
    </AppShell>
  );
}
