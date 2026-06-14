import { useState } from 'react';
import { CreateFlowHeader } from '../components/CreateFlowHeader';
import { MaterialIcon } from '../components/MaterialIcon';
import { SettingsSelectRow } from '../components/SettingsSelectRow';
import { SettingsToggleRow } from '../components/SettingsToggleRow';

export function CreateListAdvancedPage() {
  const [settings, setSettings] = useState({
    allowComments: true,
    notifyNewItems: false,
    showPriority: true,
    friendsInviteOthers: false,
    requireApproval: true,
  });

  function toggleSetting(key) {
    setSettings((current) => ({
      ...current,
      [key]: !current[key],
    }));
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
          <button className="settings-reset" type="button">
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
          <button className="primary-button primary-button--full create-flow-submit" type="button">
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}
