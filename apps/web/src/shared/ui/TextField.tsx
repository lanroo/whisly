import type { InputHTMLAttributes } from 'react';
import { MaterialIcon } from '@/components/MaterialIcon';
import './primitives.css';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
  error?: string;
}

/** Campo de texto padrão do app (rótulo + ícone opcional + erro). */
export function TextField({ label, icon, error, id, name, className, ...rest }: TextFieldProps) {
  const inputId = id ?? name;

  return (
    <div className="ui-field">
      {label ? (
        <label className="ui-field__label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <div className={`ui-field__control ${icon ? 'ui-field__control--with-icon' : ''}`.trim()}>
        {icon ? <MaterialIcon className="ui-field__icon" name={icon} /> : null}
        <input className={className} id={inputId} name={name} {...rest} />
      </div>
      {error ? <span className="ui-field__error">{error}</span> : null}
    </div>
  );
}
