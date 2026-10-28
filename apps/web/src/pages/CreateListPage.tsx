import { useNavigate } from 'react-router-dom';
import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { CreateFlowHeader } from '../components/CreateFlowHeader';
import { CreateListPrivacyOption } from '../components/CreateListPrivacyOption';
import { MaterialIcon } from '../components/MaterialIcon';
import { uploadItemImage, useCreateList, type ListPrivacy } from '../features/lists/api';
import { PRIVACY_CHOICES } from '../shared/config/privacy';
import { useToast } from '../shared/ui';

// Mesma imagem usada como capa padrão das listas (features/lists/api.ts) — evita
// depender de uma URL de preview do Google, que expira.
const DEFAULT_COVER_ART =
  'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=1200&q=80';

export function CreateListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const createList = useCreateList();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [listName, setListName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<ListPrivacy>('private');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);

  async function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.show({ variant: 'error', title: 'Selecione um arquivo de imagem' });
      return;
    }
    setUploadingCover(true);
    try {
      setCoverImage(await uploadItemImage(file));
    } catch (error) {
      toast.show({
        variant: 'error',
        title: 'Não foi possível enviar a capa',
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = listName.trim();
    if (!title) {
      toast.show({ title: 'Dê um nome à lista' });
      return;
    }

    try {
      const listId = await createList.mutateAsync({ title, privacy, coverImage, description });
      toast.show({ variant: 'success', title: 'Lista criada' });
      navigate(`/lists/${listId}`, { replace: true, state: { addItemOnOpen: true } });
    } catch (error) {
      toast.show({
        variant: 'error',
        title: 'Não foi possível criar a lista',
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  return (
    <div className="create-flow-screen">
      <CreateFlowHeader backTo="/home" title="Nova lista" />

      <main className="create-flow-page">
        <form className="create-list-form-v2" id="create-list-form" onSubmit={handleSubmit}>
          <div className="create-list-intro">
            <span className="create-list-intro__step">01 / DETALHES DA LISTA</span>
            <h2>O que você quer reunir?</h2>
            <p>Comece com um nome. Você pode ajustar os detalhes quando quiser.</p>
          </div>

          <label className="create-list-input">
            <span>Nome da lista</span>
            <div className="create-list-input__control">
              <input
                maxLength={80}
                onChange={(event) => setListName(event.target.value)}
                placeholder="Ex.: Minha viagem de férias"
                required
                type="text"
                value={listName}
              />
            </div>
          </label>

          <label className="create-list-input">
            <span>Descrição (opcional)</span>
            <div className="create-list-input__control create-list-input__control--multiline">
              <textarea
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Conte um pouco sobre esta lista"
                rows={3}
                value={description}
              />
            </div>
          </label>

          <section className="create-list-cover">
            <div className="create-list-section-heading">
              <h2>Imagem de capa</h2>
              <span>Opcional</span>
            </div>
            <button
              className="create-list-cover__button"
              disabled={uploadingCover}
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              <span className="create-list-cover__preview">
                <img alt="" src={coverImage ?? DEFAULT_COVER_ART} />
                {!coverImage ? <MaterialIcon name="photo_camera" /> : null}
              </span>
              <span className="create-list-cover__copy">
                <strong>{coverImage ? 'Capa selecionada' : 'Escolha uma capa'}</strong>
                <small>
                  {uploadingCover ? 'Enviando imagem...' : 'Uma foto para dar a cara da sua lista'}
                </small>
              </span>
              <MaterialIcon
                className="create-list-cover__action"
                name={coverImage ? 'edit' : 'add'}
              />
            </button>
            <input
              accept="image/*"
              hidden
              onChange={handleCoverChange}
              ref={fileInputRef}
              type="file"
            />
          </section>

          <section className="create-list-privacy">
            <div className="create-list-section-heading">
              <h2>Quem pode ver?</h2>
            </div>
            <div className="create-list-privacy__card">
              {PRIVACY_CHOICES.map((option) => (
                <CreateListPrivacyOption
                  checked={privacy === option.value}
                  description={option.description}
                  icon={option.icon}
                  key={option.value}
                  name="privacy"
                  onChange={(value) => setPrivacy(value as ListPrivacy)}
                  title={option.title}
                  value={option.value}
                />
              ))}
            </div>
          </section>
        </form>
      </main>

      <div className="create-flow-footer">
        <div className="create-flow-footer__inner">
          <button
            className="primary-button primary-button--full create-flow-submit"
            disabled={createList.isPending || uploadingCover}
            form="create-list-form"
            type="submit"
          >
            {createList.isPending ? 'Criando lista...' : 'Criar e adicionar produtos'}
          </button>
        </div>
      </div>
    </div>
  );
}
