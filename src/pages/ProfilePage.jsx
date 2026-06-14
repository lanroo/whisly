import { AppShell } from '../components/AppShell';
import { MaterialIcon } from '../components/MaterialIcon';
import { Link } from 'react-router-dom';
import { profileUser } from '../data/mockData';

const navItems = [
  { key: 'home', label: 'Home', icon: 'home', to: '/home' },
  { key: 'shared', label: 'Shared', icon: 'group', to: '/activity' },
  { key: 'explore', label: 'Explore', icon: 'explore', to: '/explore' },
  { key: 'profile', label: 'Profile', icon: 'person', to: '/profile' },
];

export function ProfilePage() {
  return (
    <AppShell activeNavKey="profile" className="profile-shell" enablePullToRefresh navItems={navItems} showFab={false}>
      <header className="profile-topbar">
        <div className="profile-topbar__inner">
          <div className="profile-topbar__spacer" />
          <h1>Profile</h1>
          <Link aria-label="Notificações" className="icon-button" to="/activity">
            <MaterialIcon name="notifications" />
          </Link>
        </div>
      </header>

      <main className="page profile-page">
        <section className="profile-hero-card">
          <div className="profile-hero">
            <div className="profile-hero__avatar">
              <img alt={profileUser.name} src={profileUser.avatar} />
            </div>
            <h2>{profileUser.name}</h2>
            <p className="profile-hero__handle">{profileUser.handle}</p>
            <p className="profile-hero__bio">{profileUser.bio}</p>
          </div>

          <div className="profile-stats">
            {profileUser.stats.map((stat, index) => (
              <article key={stat.id} className={`profile-stat-card profile-stat-card--${index + 1}`}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </article>
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
