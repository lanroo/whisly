import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { MaterialIcon } from '../components/MaterialIcon';
import { SettingsSelectRow } from '../components/SettingsSelectRow';
import { profileUser } from '../data/mockData';
import { MAIN_NAV_ITEMS } from '../shared/config/navigation';
import { Button, Modal, useToast } from '../shared/ui';

export function ProfilePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [editing, setEditing] = useState(false);

  function handleLogout() {
    toast.show({
      variant: 'success',
      title: 'Sessão encerrada',
      description: 'Você saiu da sua conta.',
    });
    navigate('/login');
  }

  function comingSoon(feature: string) {
    toast.show({ title: feature, description: 'Em breve disponível.' });
  }

  function handleSaveProfile() {
    setEditing(false);
    toast.show({ variant: 'success', title: 'Perfil atualizado' });
  }

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
            onClick={() => comingSoon('Configurações')}
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
              <img alt={profileUser.name} src={profileUser.avatar} />
            </div>
            <h2>{profileUser.name}</h2>
            <p className="profile-hero__handle">{profileUser.handle}</p>
            <p className="profile-hero__bio">{profileUser.bio}</p>
          </div>

          <div className="profile-actions">
            <Button icon="edit" onClick={() => setEditing(true)} variant="secondary">
              Editar perfil
            </Button>
            <Button icon="share" onClick={() => comingSoon('Compartilhar perfil')} variant="ghost">
              Compartilhar
            </Button>
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

        <section className="settings-section profile-menu">
          <div className="settings-card">
            <SettingsSelectRow icon="list_alt" title="Minhas listas" to="/lists" />
            <SettingsSelectRow icon="group" title="Colaboradores" to="/collaborators" />
            <SettingsSelectRow icon="notifications" title="Atividade" to="/activity" />
            <SettingsSelectRow
              icon="shield"
              onClick={() => comingSoon('Conta e privacidade')}
              title="Conta e privacidade"
            />
            <SettingsSelectRow
              icon="help"
              onClick={() => comingSoon('Ajuda e suporte')}
              title="Ajuda e suporte"
            />
          </div>
        </section>

        <Button fullWidth icon="logout" onClick={handleLogout} variant="danger">
          Sair da conta
        </Button>
      </main>

      <Modal onClose={() => setEditing(false)} open={editing} title="Editar perfil">
        <form
          className="profile-edit-form"
          onSubmit={(event) => {
            event.preventDefault();
            handleSaveProfile();
          }}
        >
          <label className="profile-edit-field">
            <span>Nome</span>
            <input defaultValue={profileUser.name} type="text" />
          </label>
          <label className="profile-edit-field">
            <span>Usuário</span>
            <input defaultValue={profileUser.handle} type="text" />
          </label>
          <label className="profile-edit-field">
            <span>Bio</span>
            <textarea defaultValue={profileUser.bio} rows={3} />
          </label>

          <div className="profile-edit-actions">
            <Button onClick={() => setEditing(false)} variant="ghost">
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
