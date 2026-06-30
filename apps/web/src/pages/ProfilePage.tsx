import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { MaterialIcon } from '../components/MaterialIcon';
import { SettingsSelectRow } from '../components/SettingsSelectRow';
import { useMyProfile, useUpdateProfile } from '../features/profile/api';
import { MAIN_NAV_ITEMS } from '../shared/config/navigation';
import { Avatar, Button, Modal, Skeleton, useToast } from '../shared/ui';

export function ProfilePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: profile, isLoading } = useMyProfile();
  const updateProfile = useUpdateProfile();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');

  function openEdit() {
    setName(profile?.name ?? '');
    setHandle(profile?.handle ?? '');
    setBio(profile?.bio ?? '');
    setEditing(true);
  }

  async function handleSaveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      toast.show({ title: 'Informe seu nome' });
      return;
    }
    try {
      await updateProfile.mutateAsync({ name, handle, bio });
      setEditing(false);
      toast.show({ variant: 'success', title: 'Perfil atualizado' });
    } catch (error) {
      toast.show({
        variant: 'error',
        title: 'Não foi possível salvar',
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  const stats = [
    { id: 'lists', label: 'Listas', value: profile?.stats.lists ?? 0 },
    { id: 'items', label: 'Itens', value: profile?.stats.items ?? 0 },
    { id: 'shared', label: 'Compartilhadas', value: profile?.stats.shared ?? 0 },
  ];

  const handleLabel = profile?.handle ? `@${profile.handle}` : 'Defina seu @usuário';

  return (
    <AppShell
      activeNavKey="profile"
      className="profile-shell"
      enablePullToRefresh
      navItems={MAIN_NAV_ITEMS}
      showFab={false}
    >
      <header className="profile-topbar">
        <div className="profile-topbar__inner">
          <div className="profile-topbar__spacer" />
          <h1>Perfil</h1>
          <button
            aria-label="Configurações"
            className="icon-button"
            onClick={() => navigate('/configuracoes')}
            type="button"
          >
            <MaterialIcon name="settings" />
          </button>
        </div>
      </header>

      <main className="page profile-page">
        <section className="profile-hero-card">
          <div className="profile-hero">
            <div className="profile-hero__avatar">
              {profile?.avatarUrl ? (
                <img alt={profile.name} src={profile.avatarUrl} />
              ) : (
                <Avatar name={profile?.name} size="lg" />
              )}
            </div>
            {isLoading ? (
              <Skeleton height={24} width={160} />
            ) : (
              <h2>{profile?.name || 'Sem nome'}</h2>
            )}
            <p className="profile-hero__handle">{handleLabel}</p>
            {profile?.bio ? <p className="profile-hero__bio">{profile.bio}</p> : null}
          </div>

          <div className="profile-actions">
            <Button icon="edit" onClick={openEdit} variant="secondary">
              Editar perfil
            </Button>
          </div>

          <div className="profile-stats">
            {stats.map((stat, index) => (
              <article key={stat.id} className={`profile-stat-card profile-stat-card--${index + 1}`}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="settings-section profile-menu">
          <h2>Atalhos</h2>
          <div className="settings-card">
            <SettingsSelectRow icon="list_alt" title="Minhas listas" to="/lists" />
            <SettingsSelectRow icon="explore" title="Explorar" to="/explore" />
            <SettingsSelectRow icon="notifications" title="Atividade" to="/activity" />
          </div>
        </section>
      </main>

      <Modal onClose={() => setEditing(false)} open={editing} title="Editar perfil">
        <form className="profile-edit-form" onSubmit={handleSaveProfile}>
          <label className="profile-edit-field">
            <span>Nome</span>
            <input onChange={(e) => setName(e.target.value)} type="text" value={name} />
          </label>
          <label className="profile-edit-field">
            <span>Usuário (@)</span>
            <input
              onChange={(e) => setHandle(e.target.value)}
              placeholder="ex: lanna"
              type="text"
              value={handle}
            />
          </label>
          <label className="profile-edit-field">
            <span>Bio</span>
            <textarea onChange={(e) => setBio(e.target.value)} rows={3} value={bio} />
          </label>

          <div className="profile-edit-actions">
            <Button onClick={() => setEditing(false)} type="button" variant="ghost">
              Cancelar
            </Button>
            <Button disabled={updateProfile.isPending} type="submit">
              {updateProfile.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
