import { Brand } from './Brand';

/** Marca no topo das telas de auth — usa a logomarca canônica. */
export function AuthBrand() {
  return (
    <header className="auth-screen__brand">
      <Brand />
    </header>
  );
}
