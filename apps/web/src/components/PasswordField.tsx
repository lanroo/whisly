import { useState, type ReactNode } from 'react';
import { MaterialIcon } from './MaterialIcon';

interface PasswordFieldProps {
  label: string;
  placeholder?: string;
  autoComplete?: string;
  name?: string;
  /** Conteúdo opcional alinhado ao rótulo (ex: link "Esqueceu a senha?"). */
  meta?: ReactNode;
}

/** Campo de senha com botão mostrar/ocultar — reutilizado em login e registro. */
export function PasswordField({
  label,
  placeholder = '••••••••',
  autoComplete,
  name,
  meta,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="field">
      <span>{label}</span>
      {meta ? <div className="field__meta">{meta}</div> : null}
      <div className="field__control">
        <MaterialIcon className="field__icon" name="lock" />
        <input
          autoComplete={autoComplete}
          name={name}
          placeholder={placeholder}
          type={visible ? 'text' : 'password'}
        />
        <button
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          className="field__toggle"
          onClick={() => setVisible((value) => !value)}
          type="button"
        >
          <MaterialIcon name={visible ? 'visibility_off' : 'visibility'} />
        </button>
      </div>
    </div>
  );
}
