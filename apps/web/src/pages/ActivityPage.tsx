import { useMemo, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { MaterialIcon } from '../components/MaterialIcon';
import { activityFeed } from '../data/mockData';
import type { ActivityItem } from '../types/models';
import type { NavItem } from '../types/ui';

const navItems: NavItem[] = [
  { key: 'home', label: 'Home', icon: 'home', to: '/home' },
  { key: 'shared', label: 'Shared', icon: 'group', to: '/activity' },
  { key: 'explore', label: 'Explore', icon: 'explore', to: '/explore' },
  { key: 'profile', label: 'Profile', icon: 'person', to: '/profile' },
];

interface ActivityRequestCardProps {
  item: ActivityItem;
  onDismiss: () => void;
}

function ActivityRequestCard({ item, onDismiss }: ActivityRequestCardProps) {
  return (
    <article className="activity-request-card">
      <div className="activity-avatar activity-avatar--request">
        <img alt={item.actor} src={item.avatar} />
        <span className="activity-avatar__badge">
          <MaterialIcon name="person_add" />
        </span>
      </div>

      <div className="activity-request-card__body">
        <div className="activity-request-card__meta">
          <p>
            <strong>{item.actor}</strong> {item.message}
          </p>
          <span>{item.time}</span>
        </div>

        <div className="activity-request-card__actions">
          <button className="activity-request-card__accept" type="button">
            Accept
          </button>
          <button className="activity-request-card__decline" onClick={onDismiss} type="button">
            Decline
          </button>
        </div>
      </div>
    </article>
  );
}

function ActivityListItem({ item }: { item: ActivityItem }) {
  return (
    <article className="activity-list-item">
      {item.type === 'system' ? (
        <div className="activity-avatar activity-avatar--system">
          <MaterialIcon name={item.icon ?? 'celebration'} />
        </div>
      ) : (
        <div className="activity-avatar">
          <img alt={item.actor} src={item.avatar} />
        </div>
      )}

      <div className="activity-list-item__body">
        <div className="activity-list-item__meta">
          <p>
            {item.type === 'system' ? <strong>{item.actor}:</strong> : <strong>{item.actor}</strong>}{' '}
            {item.message}{' '}
            {item.target ? (
              <span className={`activity-list-item__target ${item.suffix ? 'is-standalone' : ''}`}>
                {item.target}
              </span>
            ) : null}{' '}
            {item.suffix ? <span className="activity-list-item__suffix">{item.suffix}</span> : null}
          </p>
          <span>{item.time}</span>
        </div>

        {item.previewImage ? (
          <div className="activity-list-item__preview">
            <img alt="" src={item.previewImage} />
          </div>
        ) : null}

        {item.privacyLabel ? (
          <div className="activity-list-item__privacy">
            <MaterialIcon name="lock" />
            <span>{item.privacyLabel}</span>
          </div>
        ) : null}

        {item.collaborators ? (
          <div className="activity-list-item__faces">
            {item.collaborators.map((avatar, index) => (
              <img key={`${item.id}-${index + 1}`} alt="" src={avatar} />
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function ActivityPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [query, setQuery] = useState('');
  const [dismissedRequests, setDismissedRequests] = useState<string[]>([]);

  const visibleFeed = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return activityFeed.filter((item) => {
      if (item.type === 'request' && dismissedRequests.includes(item.id)) {
        return false;
      }

      if (activeTab === 'requests' && item.type !== 'request') {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = [item.actor, item.message, item.target, item.suffix, item.privacyLabel]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [activeTab, dismissedRequests, query]);

  function dismissRequest(id: string) {
    setDismissedRequests((current) => [...current, id]);
  }

  return (
    <AppShell
      activeNavKey="shared"
      className="activity-shell"
      enablePullToRefresh
      fabIcon="person_add"
      fabLabel="Adicionar amigo"
      navItems={navItems}
    >
      <header className="wishly-home-topbar">
        <div className="wishly-home-topbar__inner">
          <div className="activity-topbar__spacer" />
          <div className="wishly-home-topbar__brand activity-topbar__brand">
            <span>WISHLY</span>
          </div>
          <div className="activity-topbar__spacer" />
        </div>
      </header>

      <main className="page activity-page">
        <section className="activity-page__controls">
          <label className="search-box activity-search">
            <MaterialIcon name="search" />
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search activity..."
              type="text"
              value={query}
            />
          </label>

          <div className="activity-tabs">
            <button
              className={activeTab === 'all' ? 'is-active' : ''}
              onClick={() => setActiveTab('all')}
              type="button"
            >
              All
            </button>
            <button
              className={activeTab === 'requests' ? 'is-active' : ''}
              onClick={() => setActiveTab('requests')}
              type="button"
            >
              Requests
            </button>
          </div>
        </section>

        <section className="activity-feed">
          {visibleFeed.map((item) =>
            item.type === 'request' ? (
              <ActivityRequestCard key={item.id} item={item} onDismiss={() => dismissRequest(item.id)} />
            ) : (
              <ActivityListItem key={item.id} item={item} />
            ),
          )}
        </section>
      </main>
    </AppShell>
  );
}
