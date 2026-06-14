import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { SettingsSelectRow } from '../components/SettingsSelectRow';
import { SettingsToggleRow } from '../components/SettingsToggleRow';
import { TopBar } from '../components/TopBar';
import { MAIN_NAV_ITEMS } from '../shared/config/navigation';
import { Button, useToast } from '../shared/ui';

export function SettingsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [pushEnabled, setPushEnabled] = useState(false);

  function comingSoon(feature: string) {
    toast.show({ title: feature, description: 'Em breve disponível.' });
  }

  function togglePush() {
    setPushEnabled((value) => !value);
    toast.show({
      variant: pushEnabled ? 'info' : 'success',
      title: pushEnabled ? 'Notificações desativadas' : 'Notificações ativadas',
    });
  }

  function handleLogout() {
    toast.show({ variant: 'success', title: 'Sessão encerrada' });
    navigate('/login');
  }

  return (
    <AppShell activeNavKey="profile" className="settings-shell" navItems={MAIN_NAV_ITEMS} showFab={false}>
      <TopBar backTo="/profile" rightIcon={null} title="Configurações" />

      <main className="page settings-page">
        <section className="settings-section">
          <h2>Conta</h2>
          <div className="settings-card">
            <SettingsSelectRow
              icon="shield"
              onClick={() => comingSoon('Conta e privacidade')}
              title="Conta e privacidade"
            />
            <SettingsSelectRow
              icon="lock"
              onClick={() => comingSoon('Segurança')}
              title="Segurança"
            />
          </div>
        </section>

        <section className="settings-section">
          <h2>Notificações</h2>
          <div className="settings-card">
            <SettingsToggleRow
              checked={pushEnabled}
              description="Receba avisos quando reservarem um presente ou compartilharem uma lista"
              onChange={togglePush}
              title="Notificações push"
            />
          </div>
        </section>

        <section className="settings-section">
          <h2>Preferências</h2>
          <div className="settings-card">
            <SettingsSelectRow
              icon="palette"
              onClick={() => comingSoon('Aparência')}
              title="Aparência"
              value="Claro"
            />
            <SettingsSelectRow
              icon="language"
              onClick={() => comingSoon('Idioma')}
              title="Idioma"
              value="Português"
            />
          </div>
        </section>

        <section className="settings-section">
          <h2>Suporte</h2>
          <div className="settings-card">
            <SettingsSelectRow
              icon="help"
              onClick={() => comingSoon('Central de ajuda')}
              title="Central de ajuda"
            />
            <SettingsSelectRow
              icon="info"
              onClick={() => comingSoon('Sobre o Wishly')}
              title="Sobre o Wishly"
            />
          </div>
        </section>

        <Button fullWidth icon="logout" onClick={handleLogout} variant="danger">
          Sair da conta
        </Button>
      </main>
    </AppShell>
  );
}
