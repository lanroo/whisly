import { MaterialIcon } from './MaterialIcon';

export function CreateListPrivacyCard({ isPublic, onToggle }) {
  return (
    <div className="create-list-privacy-card">
      <div className="create-list-privacy-card__icon">
        <MaterialIcon filled name={isPublic ? 'public' : 'lock'} />
      </div>

      <div className="create-list-privacy-card__copy">
        <strong>{isPublic ? 'Lista Publica' : 'Lista Privada'}</strong>
        <p>
          {isPublic
            ? 'Qualquer pessoa com o link pode ver.'
            : 'Somente pessoas convidadas podem acessar.'}
        </p>
      </div>

      <button
        aria-label={isPublic ? 'Definir como privada' : 'Definir como publica'}
        className={`create-list-switch ${isPublic ? 'is-active' : ''}`}
        onClick={onToggle}
        type="button"
      >
        <span />
      </button>
    </div>
  );
}
