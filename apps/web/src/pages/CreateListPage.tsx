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
      navigate(`/lists/${listId}`);
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
      <CreateFlowHeader backTo="/home" title="Criar Nova Lista" />

      <main className="create-flow-page">
        <form className="create-list-form-v2" id="create-list-form" onSubmit={handleSubmit}>
          <section className="create-list-cover">
            <button
              className="create-list-cover__button"
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              <div className={`create-list-cover__art ${coverImage ? 'has-image' : ''}`.trim()}>
                <img alt="Prévia da capa da lista" src={coverImage ?? DEFAULT_COVER_ART} />
                {!coverImage ? (
                  <div className="create-list-cover__overlay">
                    <div className="create-list-cover__phone">
                      <div className="create-list-cover__phone-notch" />
                      <div className="create-list-cover__phone-lines">
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
              <span className="create-list-cover__edit">
                <MaterialIcon name={uploadingCover ? 'hourglass_top' : 'edit'} />
              </span>
            </button>
            <input
              accept="image/*"
              hidden
              onChange={handleCoverChange}
              ref={fileInputRef}
              type="file"
            />
            <p>
              {uploadingCover
                ? 'Enviando...'
                : coverImage
                  ? 'Trocar imagem de capa'
                  : 'Escolher imagem de capa'}
            </p>
          </section>

          <label className="create-list-input">
            <span>Nome da Lista</span>
            <div className="create-list-input__control">
              <input
                onChange={(event) => setListName(event.target.value)}
                placeholder="Ex: Viagem de Férias ✈️"
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
                placeholder="Do que é essa lista? Ex: presentes de aniversário"
                rows={3}
                value={description}
              />
            </div>
          </label>

          <section className="create-list-privacy">
            <h2>Privacidade</h2>
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
            disabled={createList.isPending}
            form="create-list-form"
            type="submit"
          >
            {createList.isPending ? 'Criando...' : 'Criar Lista'}
          </button>
        </div>
      </div>
    </div>
  );
}
