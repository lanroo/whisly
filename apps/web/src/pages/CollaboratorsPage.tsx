import { Link } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { MaterialIcon } from '../components/MaterialIcon';
import {
  useMyListCollaborators,
  useRemoveCollaborator,
  useSharedLists,
} from '../features/lists/api';
import { MAIN_NAV_ITEMS } from '../shared/config/navigation';
import { Avatar, EmptyState, Skeleton, useToast } from '../shared/ui';

const ROLE_LABEL: Record<string, string> = {
  owner: 'Dono',
  editor: 'Editor',
  viewer: 'Leitor',
};

export function CollaboratorsPage() {
  const toast = useToast();
  const { data: shared, isLoading: loadingShared } = useSharedLists();
  const { data: people, isLoading: loadingPeople } = useMyListCollaborators();
  const removeCollaborator = useRemoveCollaborator();

  const sharedLists = shared ?? [];
  const collaborators = people ?? [];
  const loading = loadingShared || loadingPeople;
  const isEmpty = !loading && sharedLists.length === 0 && collaborators.length === 0;

  async function handleRemove(id: string, name: string) {
    try {
      await removeCollaborator.mutateAsync(id);
      toast.show({ title: `${name} removido(a)` });
    } catch (error) {
      toast.show({
        variant: 'error',
        title: 'Não foi possível remover',
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  return (
    <AppShell
      activeNavKey="lists"
      className="collaborators-shell"
      enablePullToRefresh
      navItems={MAIN_NAV_ITEMS}
      showFab={false}
    >
      <header className="collaborators-topbar">
        <div className="collaborators-topbar__inner">
          <Link aria-label="Voltar" className="icon-button" to="/lists">
            <MaterialIcon name="chevron_left" />
          </Link>
          <h1>Colaboradores</h1>
          <Link aria-label="Notificações" className="icon-button" to="/activity">
            <MaterialIcon name="notifications" />
          </Link>
        </div>
      </header>

      <main className="page collaborators-page">
        {loading ? (
          <div className="collaborators-card">
            <Skeleton height={64} width="100%" />
            <Skeleton height={64} width="100%" />
          </div>
        ) : isEmpty ? (
          <EmptyState
            description="Compartilhe uma lista pelo @usuário para colaborar, ou peça para alguém compartilhar com você."
            icon="group"
            title="Nenhuma colaboração ainda"
          />
        ) : (
          <>
            {sharedLists.length > 0 ? (
              <section className="collaborators-section">
                <h2 className="collaborators-section__title">Compartilhadas comigo</h2>
                <div className="collaborators-card">
                  {sharedLists.map((list) => (
                    <Link key={list.id} className="collaborator-row" to={`/lists/${list.id}`}>
                      <div className="collaborator-avatar collaborator-avatar--list">
                        <img alt={list.title} src={list.image} />
                      </div>
                      <div className="collaborator-row__copy">
                        <h2>{list.title}</h2>
                        <p>{list.items} itens</p>
                      </div>
                      <MaterialIcon className="collaborator-row__more" name="chevron_right" />
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            {collaborators.length > 0 ? (
              <section className="collaborators-section">
                <h2 className="collaborators-section__title">Nas minhas listas</h2>
                <div className="collaborators-card">
                  {collaborators.map((c) => (
                    <article key={c.id} className="collaborator-row">
                      <Avatar name={c.name} size="md" src={c.avatarUrl ?? undefined} />
                      <div className="collaborator-row__copy">
                        <h2>{c.name}</h2>
                        <p>
                          {ROLE_LABEL[c.role] ?? c.role} · {c.listTitle}
                        </p>
                      </div>
                      <button
                        aria-label={`Remover ${c.name}`}
                        className="icon-button collaborator-row__more"
                        disabled={removeCollaborator.isPending}
                        onClick={() => handleRemove(c.id, c.name)}
                        type="button"
                      >
                        <MaterialIcon name="close" />
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}
      </main>
    </AppShell>
  );
}
