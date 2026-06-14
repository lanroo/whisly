import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { CreateFlowHeader } from '../components/CreateFlowHeader';
import { CreateListPrivacyOption } from '../components/CreateListPrivacyOption';
import { MaterialIcon } from '../components/MaterialIcon';

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
  const [listName, setListName] = useState('');
  const [privacy, setPrivacy] = useState('private');

  function handleSubmit(event) {
    event.preventDefault();
    navigate('/lists');
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
                  onChange={setPrivacy}
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
            form="create-list-form"
            type="submit"
          >
            Criar Lista
          </button>
        </div>
      </div>
    </div>
  );
}
