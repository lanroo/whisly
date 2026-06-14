import { Link } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { MaterialIcon } from '../components/MaterialIcon';
import { collaborators } from '../data/mockData';

const navItems = [
  { key: 'home', label: 'Home', icon: 'home', to: '/home' },
  { key: 'shared', label: 'Shared', icon: 'group', to: '/collaborators' },
  { key: 'explore', label: 'Explore', icon: 'explore', to: '/explore' },
  { key: 'profile', label: 'Profile', icon: 'person', to: '/profile' },
];

export function CollaboratorsPage() {
  return (
    <AppShell activeNavKey="shared" className="collaborators-shell" enablePullToRefresh navItems={navItems} showFab={false}>
      <header className="collaborators-topbar">
        <div className="collaborators-topbar__inner">
          <button aria-label="Menu" className="icon-button" type="button">
            <MaterialIcon name="menu" />
          </button>
          <h1>Collaborators</h1>
          <Link aria-label="Notificações" className="icon-button" to="/activity">
            <MaterialIcon name="notifications" />
          </Link>
        </div>
      </header>

      <main className="page collaborators-page">
        <label className="search-box collaborators-search">
          <MaterialIcon name="search" />
          <input placeholder="Invite Friends..." type="text" />
        </label>

        <button className="collaborators-page__add" type="button">
          <MaterialIcon name="person_add" />
          <span>Add Collaborator</span>
        </button>

        <section className="collaborators-card">
          {collaborators.map((collaborator) => (
            <article key={collaborator.id} className="collaborator-row">
              <div className={`collaborator-avatar ${collaborator.initial ? 'is-initial' : ''}`.trim()}>
                {collaborator.avatar ? <img alt={collaborator.name} src={collaborator.avatar} /> : <span>{collaborator.initial}</span>}
              </div>

              <div className="collaborator-row__copy">
                <h2>{collaborator.name}</h2>
                <p>{collaborator.role}</p>
              </div>

              <button aria-label={`Mais opções para ${collaborator.name}`} className="icon-button collaborator-row__more" type="button">
                <MaterialIcon name="more_horiz" />
              </button>
            </article>
          ))}
        </section>

        <button className="collaborators-page__leave" type="button">
          Leave List
        </button>
      </main>
    </AppShell>
  );
}
