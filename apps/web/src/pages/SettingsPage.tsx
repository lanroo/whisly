import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { PasswordField } from '../components/PasswordField';
import { SettingsSelectRow } from '../components/SettingsSelectRow';
import { SettingsToggleRow } from '../components/SettingsToggleRow';
import { TopBar } from '../components/TopBar';
import { useAuth } from '../shared/auth';
import { MAIN_NAV_ITEMS } from '../shared/config/navigation';
import { Button, Modal, useToast } from '../shared/ui';

export function SettingsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { signOut, updatePassword } = useAuth();
  const [pushEnabled, setPushEnabled] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

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

  async function handleLogout() {
    await signOut();
    toast.show({ variant: 'success', title: 'Sessão encerrada' });
    navigate('/login');
  }

  async function handleChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get('new-password') ?? '');
    const confirm = String(form.get('confirm-password') ?? '');

    if (password.length < 6) {
      toast.show({ variant: 'error', title: 'A senha deve ter ao menos 6 caracteres' });
      return;
    }
    if (password !== confirm) {
      toast.show({ variant: 'error', title: 'As senhas não coincidem' });
      return;
    }

    setSavingPassword(true);
    const { error } = await updatePassword(password);
    setSavingPassword(false);

    if (error) {
      toast.show({ variant: 'error', title: 'Erro ao alterar senha', description: error });
      return;
    }
    setChangingPassword(false);
    toast.show({ variant: 'success', title: 'Senha alterada' });
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
              onClick={() => setChangingPassword(true)}
              title="Alterar senha"
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

      <Modal onClose={() => setChangingPassword(false)} open={changingPassword} title="Alterar senha">
        <form className="profile-edit-form" onSubmit={handleChangePassword}>
          <PasswordField autoComplete="new-password" label="Nova senha" name="new-password" />
          <PasswordField autoComplete="new-password" label="Confirmar nova senha" name="confirm-password" />
          <div className="profile-edit-actions">
            <Button onClick={() => setChangingPassword(false)} variant="ghost">
              Cancelar
            </Button>
            <Button disabled={savingPassword} type="submit">
              {savingPassword ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
