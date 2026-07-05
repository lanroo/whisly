import { Link } from 'react-router-dom';
import type { Person } from '../features/friends/api';
import { Avatar, Modal, Skeleton } from '../shared/ui';

interface FriendsModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  friends: Person[];
  loading?: boolean;
  emptyText?: string;
}

/** Lista de amigos (avatar + nome + @usuário), com link para cada perfil. */
export function FriendsModal({
  open,
  onClose,
  title,
  friends,
  loading = false,
  emptyText = 'Nenhum amigo ainda.',
}: FriendsModalProps) {
  return (
    <Modal onClose={onClose} open={open} title={title}>
      {loading ? (
        <div className="person-list">
          <Skeleton height={60} width="100%" />
          <Skeleton height={60} width="100%" />
        </div>
      ) : friends.length === 0 ? (
        <p className="explore-empty-hint">{emptyText}</p>
      ) : (
        <div className="person-list">
          {friends.map((person) => (
            <Link
              className="person-item person-item--link"
              key={person.id}
              onClick={onClose}
              to={`/u/${person.id}`}
            >
              <span className="person-item__main">
                <Avatar name={person.name} size="md" src={person.avatarUrl ?? undefined} />
                <span className="person-item__info">
                  <strong>{person.name}</strong>
                  <span>{person.handle ? `@${person.handle}` : 'Sem @usuário'}</span>
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </Modal>
  );
}
