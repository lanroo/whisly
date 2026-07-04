import { useMyProfile } from '../features/profile/api';
import { useAuth } from '../shared/auth';
import { Avatar } from '../shared/ui';

interface MyAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Avatar do usuário logado — mostra SEMPRE a foto de perfil escolhida
 * (profiles.avatar_url), com fallback para a inicial do nome.
 * Use em qualquer lugar que exiba o avatar do próprio usuário, para manter
 * a foto consistente em todo o app.
 */
export function MyAvatar({ size = 'sm', className }: MyAvatarProps) {
  const { user } = useAuth();
  const { data: profile } = useMyProfile();
  const name =
    profile?.name ??
    (user?.user_metadata?.name as string | undefined) ??
    user?.email?.split('@')[0] ??
    '';

  return <Avatar className={className} name={name} size={size} src={profile?.avatarUrl ?? undefined} />;
}
