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
    description: 'Só você vê e edita',
    icon: 'lock',
  },
  {
    value: 'collaborative',
    title: 'Colaborativa',
    description: 'Quem tem o link ou você convidar pode ver e editar',
    icon: 'group',
  },
  {
    value: 'public',
    title: 'Pública',
    description: 'Visível para quem já te adicionou (só ver)',
    icon: 'public',
  },
];
