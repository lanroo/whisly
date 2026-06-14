import type { Product, ProductStatus } from '../types/models';

const badgeMap: Record<ProductStatus, { label: string; className: string }> = {
  urgent: { label: 'Urgente', className: 'badge badge--urgent' },
  desired: { label: 'Desejado', className: 'badge badge--desired' },
  later: { label: 'Pode esperar', className: 'badge badge--later' },
  bought: { label: 'Comprado', className: 'badge badge--bought' },
};

interface ProductCardProps {
  product: Product;
  view?: 'grid' | 'list';
}

export function ProductCard({ product, view = 'grid' }: ProductCardProps) {
  const badge = badgeMap[product.status];
  const bought = product.status === 'bought';

  return (
    <article
      className={`product-card product-card--${view} ${view === 'list' ? 'product-card--list-aligned' : ''} ${bought ? 'is-muted' : ''}`}
    >
      <div className="product-card__image-wrap">
        <img alt={product.title} className="product-card__image" src={product.image} />
        {badge ? <span className={badge.className}>{badge.label}</span> : null}
      </div>
      <div className="product-card__body">
        <p className="product-card__brand">{product.brand}</p>
        <h3>{product.title}</h3>
        <p className={`product-card__price ${bought ? 'is-striked' : ''}`}>{product.price}</p>
      </div>
    </article>
  );
}
