import type { ListPrivacy } from '@/features/lists/api';

export interface PrivacyChoice {
  value: ListPrivacy;
  title: string;
  description: string;
  icon: string;
}

/** Opções de privacidade de lista — usadas em Criar e Editar lista. */
export const PRIVACY_CHOICES: PrivacyChoice[] = [
  {
    value: 'private',
    title: 'Privada',
    description: 'Apenas você pode ver e editar',
    icon: 'lock',
  },
  {
    value: 'collaborative',
    title: 'Colaborativa',
    description: 'Amigos podem adicionar e interagir',
    icon: 'group',
  },
  {
    value: 'public',
    title: 'Pública',
    description: 'Qualquer pessoa com o link',
    icon: 'public',
  },
];
