import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateFlowHeader } from '../components/CreateFlowHeader';
import { MaterialIcon } from '../components/MaterialIcon';
import { SettingsSelectRow } from '../components/SettingsSelectRow';
import { SettingsToggleRow } from '../components/SettingsToggleRow';
import { useToast } from '../shared/ui';

const DEFAULT_SETTINGS: AdvancedSettings = {
  allowComments: true,
  notifyNewItems: false,
  showPriority: true,
  friendsInviteOthers: false,
  requireApproval: true,
};

interface AdvancedSettings {
  allowComments: boolean;
  notifyNewItems: boolean;
  showPriority: boolean;
  friendsInviteOthers: boolean;
  requireApproval: boolean;
}

export function CreateListAdvancedPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [settings, setSettings] = useState<AdvancedSettings>(DEFAULT_SETTINGS);

  function toggleSetting(key: keyof AdvancedSettings) {
    setSettings((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  function resetSettings() {
    setSettings(DEFAULT_SETTINGS);
    toast.show({ title: 'Configurações redefinidas' });
  }

  function handleSave() {
    toast.show({ variant: 'success', title: 'Configurações salvas' });
    navigate('/lists/new');
  }

  return (
    <div className="create-flow-screen create-flow-screen--advanced">
      <CreateFlowHeader
        backTo="/lists/new"
        rightIcon="settings"
        rightLabel="Configurações"
        title="Configurações Avançadas"
      />

      <main className="create-flow-page create-flow-page--advanced">
        <section className="settings-section">
          <h2>Notificações e Interação</h2>
          <div className="settings-card">
            <SettingsToggleRow
              checked={settings.allowComments}
              description="Amigos podem comentar em itens"
              onChange={() => toggleSetting('allowComments')}
              title="Permitir comentários"
            />
            <SettingsToggleRow
              checked={settings.notifyNewItems}
              description="Avisar quando alguém adicionar sugestões"
              onChange={() => toggleSetting('notifyNewItems')}
              title="Notificações de novos itens"
            />
            <SettingsToggleRow
              checked={settings.showPriority}
              description="Exibir estrelas de urgência nos itens"
              onChange={() => toggleSetting('showPriority')}
              title="Mostrar prioridade"
            />
          </div>
        </section>

        <section className="settings-section">
          <h2>Exibição e Formatação</h2>
          <div className="settings-card">
            <SettingsSelectRow title="Mostrar preços" value="Sempre" />
            <SettingsSelectRow title="Visualização padrão" value="Grade" />
            <SettingsSelectRow title="Moeda" value="Real (BRL)" />
          </div>
        </section>

        <section className="settings-section">
          <h2>Colaboração</h2>
          <div className="settings-card">
            <SettingsToggleRow
              checked={settings.friendsInviteOthers}
              description="Permitir que colaboradores tragam pessoas"
              onChange={() => toggleSetting('friendsInviteOthers')}
              title="Amigos convidam outros"
            />
            <SettingsToggleRow
              checked={settings.requireApproval}
              description="Novos itens de terceiros precisam de aval"
              onChange={() => toggleSetting('requireApproval')}
              title="Aprovação de novos itens"
            />
          </div>
        </section>

        <section className="settings-section settings-section--danger">
          <button className="settings-reset" onClick={resetSettings} type="button">
            <span>Redefinir todas as configurações</span>
            <MaterialIcon name="refresh" />
          </button>
          <p>
            Alterações nas configurações podem levar alguns instantes para sincronizar com todos
            os seus dispositivos.
          </p>
        </section>
      </main>

      <div className="create-flow-footer">
        <div className="create-flow-footer__inner">
          <button
            className="primary-button primary-button--full create-flow-submit"
            onClick={handleSave}
            type="button"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}
