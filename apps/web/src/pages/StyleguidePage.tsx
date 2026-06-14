import { useState } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  IconButton,
  Modal,
  SegmentedControl,
  Skeleton,
  TextField,
  useToast,
} from '../shared/ui';
import './styleguide.css';

const COLOR_TOKENS = [
  '--accent',
  '--primary-violet',
  '--success',
  '--warning',
  '--danger',
  '--surface-low',
  '--surface-blue-strong',
  '--text',
  '--muted',
];

export function StyleguidePage() {
  const toast = useToast();
  const [segment, setSegment] = useState('todos');
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <main className="styleguide">
      <h1 className="styleguide__title">Design System</h1>
      <p className="styleguide__subtitle">
        Referência viva dos tokens e componentes do Wishly (rota de desenvolvimento).
      </p>

      <section className="sg-section">
        <h2>Cores</h2>
        <div className="sg-swatches">
          {COLOR_TOKENS.map((token) => (
            <div key={token} className="sg-swatch">
              <div className="sg-swatch__color" style={{ background: `var(${token})` }} />
              <div className="sg-swatch__label">{token}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="sg-section">
        <h2>Botões</h2>
        <div className="sg-row">
          <Button>Primário</Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="ghost">Fantasma</Button>
          <Button variant="danger">Perigo</Button>
          <Button icon="add">Com ícone</Button>
          <Button disabled>Desabilitado</Button>
          <Button size="lg">Grande</Button>
        </div>
      </section>

      <section className="sg-section">
        <h2>Badges</h2>
        <div className="sg-row">
          <Badge>Neutro</Badge>
          <Badge variant="accent" icon="lock">
            Privada
          </Badge>
          <Badge variant="success">Disponível</Badge>
          <Badge variant="warning">Pendente</Badge>
          <Badge variant="danger">Esgotado</Badge>
        </div>
      </section>

      <section className="sg-section">
        <h2>Avatares</h2>
        <div className="sg-row">
          <Avatar name="Casper" size="sm" />
          <Avatar name="Maria" size="md" />
          <Avatar name="João" size="lg" />
          <Avatar
            size="md"
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80"
          />
        </div>
      </section>

      <section className="sg-section">
        <h2>Ícone-botão</h2>
        <div className="sg-row">
          <IconButton icon="favorite" label="Favoritar" />
          <IconButton icon="share" label="Compartilhar" variant="ghost" />
          <IconButton filled icon="notifications" label="Notificações" />
        </div>
      </section>

      <section className="sg-section">
        <h2>Controle segmentado</h2>
        <SegmentedControl
          ariaLabel="Filtro"
          onChange={setSegment}
          options={[
            { value: 'todos', label: 'Todos' },
            { value: 'disponiveis', label: 'Disponíveis' },
            { value: 'reservados', label: 'Reservados' },
          ]}
          value={segment}
        />
      </section>

      <section className="sg-section">
        <h2>Campo de texto</h2>
        <div className="sg-stack">
          <TextField icon="mail" label="E-mail" placeholder="nome@exemplo.com" type="email" />
          <TextField error="Campo obrigatório" label="Nome" placeholder="Seu nome" />
        </div>
      </section>

      <section className="sg-section">
        <h2>Card</h2>
        <div className="sg-row">
          <Card interactive padded>
            <strong>Card interativo</strong>
            <p style={{ margin: '4px 0 0', color: 'var(--muted)' }}>Passe o mouse para o hover.</p>
          </Card>
        </div>
      </section>

      <section className="sg-section">
        <h2>Estado vazio</h2>
        <Card>
          <EmptyState
            action={<Button icon="add">Criar lista</Button>}
            description="Crie sua primeira lista para começar a organizar seus desejos."
            icon="format_list_bulleted"
            title="Nenhuma lista ainda"
          />
        </Card>
      </section>

      <section className="sg-section">
        <h2>Skeleton (loading)</h2>
        <div className="sg-stack">
          <div className="sg-row">
            <Skeleton height={48} variant="circle" width={48} />
            <div style={{ display: 'grid', gap: 8, flex: 1 }}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </div>
          </div>
          <Skeleton height={120} />
        </div>
      </section>

      <section className="sg-section">
        <h2>Overlays</h2>
        <div className="sg-row">
          <Button
            onClick={() =>
              toast.show({ variant: 'success', title: 'Toast', description: 'Funciona!' })
            }
            variant="secondary"
          >
            Mostrar toast
          </Button>
          <Button onClick={() => setModalOpen(true)} variant="secondary">
            Abrir modal
          </Button>
        </div>
      </section>

      <Modal onClose={() => setModalOpen(false)} open={modalOpen} title="Exemplo de modal">
        <p style={{ margin: 0, color: 'var(--muted)' }}>
          Modal acessível com foco preso, Esc para fechar e clique no fundo.
        </p>
      </Modal>
    </main>
  );
}
