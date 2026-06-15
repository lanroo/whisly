import { Link, useNavigate } from 'react-router-dom';
import { useState, type FormEvent } from 'react';
import { CreateFlowHeader } from '../components/CreateFlowHeader';
import { CreateListPrivacyOption } from '../components/CreateListPrivacyOption';
import { MaterialIcon } from '../components/MaterialIcon';
import { useCreateList, type ListPrivacy } from '../features/lists/api';
import { useToast } from '../shared/ui';

const privacyOptions = [
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

export function CreateListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const createList = useCreateList();
  const [listName, setListName] = useState('');
  const [privacy, setPrivacy] = useState<ListPrivacy>('private');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = listName.trim();
    if (!title) {
      toast.show({ title: 'Dê um nome à lista' });
      return;
    }

    try {
      const listId = await createList.mutateAsync({ title, privacy });
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
            <button className="create-list-cover__button" type="button">
              <div className="create-list-cover__art">
                <img
                  alt="Prévia da capa da lista"
                  src="https://lh3.googleusercontent.com/aida/AP1WRLsWlDuX8SuZ7KMoHHkoC2fOyS_OQFhABOBOKG4n7TcMHM2BNXia-Xxxw3Tox07NyiiirNzIyIJAYTDdH-Y3rk3ZRKPaMFmkCjpBox2tu6tqayL4CcPZzgn70YgYFacD9PeSmPGbgm8CjZENn5yRcDjMQF13eeYkbf0e8qMOLlau7mtcO-lPyz-zSxxa8owMHYy1KgnrnwJhf3TzLqFxrrKyHlw3T0SSGkpk-LHG8HNMYQCIdRlHGoqD3g"
                />
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
              </div>
              <span className="create-list-cover__edit">
                <MaterialIcon name="edit" />
              </span>
            </button>
            <p>Escolher imagem de capa</p>
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

          <section className="create-list-privacy">
            <h2>Privacidade</h2>
            <div className="create-list-privacy__card">
              {privacyOptions.map((option) => (
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

          <section className="create-list-advanced-link">
            <span>Configurações Avançadas</span>
            <Link className="create-list-advanced-link__trigger" to="/lists/new/advanced">
              <MaterialIcon name="expand_more" />
            </Link>
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
