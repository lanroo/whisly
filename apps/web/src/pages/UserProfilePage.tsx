import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { MaterialIcon } from '../components/MaterialIcon';
import { TopBar } from '../components/TopBar';
import { useMyLists, useInviteToList } from '../features/lists/api';
import { usePublicProfile } from '../features/profile/api';
import { useAuth } from '../shared/auth';
import { Button, EmptyState, Modal, Skeleton, useToast } from '../shared/ui';

export function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const { data: profile, isLoading } = usePublicProfile(userId);
  const { data: myLists } = useMyLists();
  const invite = useInviteToList();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [invitingTo, setInvitingTo] = useState<string | null>(null);

  const isSelf = user?.id === userId;
  const lists = profile?.lists ?? [];
  const ownedLists = myLists ?? [];
  const initial = (profile?.name ?? '?').trim().charAt(0).toUpperCase() || '?';

  async function handleInvite(listId: string) {
    if (!userId) return;
    setInvitingTo(listId);
    try {
      await invite.mutateAsync({ listId, userId, role: 'editor' });
      setInviteOpen(false);
      toast.show({ variant: 'success', title: `${profile?.name ?? 'Pessoa'} convidada` });
    } catch (error) {
      toast.show({
        variant: 'error',
        title: 'Não foi possível convidar',
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setInvitingTo(null);
    }
  }

  return (
    <AppShell className="profile-shell" showFab={false}>
      <TopBar backTo="/explore" rightIcon={null} title="Perfil" />

      <main className="page profile-page">
        {isLoading ? (
          <section className="profile-hero-card">
            <Skeleton height={104} width={104} />
            <Skeleton height={24} width={160} />
          </section>
        ) : !profile ? (
          <EmptyState
            description="Este perfil não está disponível."
            icon="person_off"
            title="Perfil não encontrado"
          />
        ) : (
          <>
            <section className="profile-hero-card">
              <div className="profile-hero">
                <div className="profile-hero__avatar">
                  {profile.avatarUrl ? (
                    <img alt={profile.name} src={profile.avatarUrl} />
                  ) : (
                    <span className="profile-hero__avatar-fallback">{initial}</span>
                  )}
                </div>
                <h2>{profile.name}</h2>
                <p className="profile-hero__handle">
                  {profile.handle ? `@${profile.handle}` : 'Sem @usuário'}
                </p>
                {profile.bio ? <p className="profile-hero__bio">{profile.bio}</p> : null}
              </div>

              {!isSelf ? (
                <div className="profile-actions">
                  <Button icon="group_add" onClick={() => setInviteOpen(true)} variant="secondary">
                    Convidar para uma lista
                  </Button>
                </div>
              ) : null}
            </section>

            <section className="explore-section">
              <div className="section-heading explore-section__heading">
                <h2>Listas públicas</h2>
              </div>
              {lists.length === 0 ? (
                <p className="explore-empty-hint">Esta pessoa ainda não tem listas públicas.</p>
              ) : (
                <div className="explore-product-row explore-product-row--wrap">
                  {lists.map((list) => (
                    <button
                      className="explore-product-card explore-product-card--list"
                      key={list.id}
                      onClick={() => navigate(`/lists/${list.id}`)}
                      type="button"
                    >
                      <div className="explore-product-card__media">
                        <img alt={list.title} src={list.image} />
                      </div>
                      <div className="explore-product-card__details">
                        <h3>{list.title}</h3>
                        <strong>
                          {list.items} {list.items === 1 ? 'item' : 'itens'}
                        </strong>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <Modal onClose={() => setInviteOpen(false)} open={inviteOpen} title="Convidar para uma lista">
        {ownedLists.length === 0 ? (
          <EmptyState
            action={
              <Button to="/lists/new" variant="secondary">
                Criar lista
              </Button>
            }
            description="Crie uma lista para convidar pessoas a colaborar."
            icon="format_list_bulleted"
            title="Você ainda não tem listas"
          />
        ) : (
          <div className="guard__lists">
            {ownedLists.map((list) => (
              <button
                className="guard__list-row"
                disabled={invitingTo !== null}
                key={list.id}
                onClick={() => handleInvite(list.id)}
                type="button"
              >
                <img alt="" className="guard__list-thumb" src={list.image} />
                <div className="guard__list-info">
                  <strong>{list.title}</strong>
                  <span>{list.items} itens</span>
                </div>
                {invitingTo === list.id ? (
                  <span className="additem-spinner" />
                ) : (
                  <MaterialIcon name="group_add" />
                )}
              </button>
            ))}
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
