import './splash.css';

/** Tela de abertura do app (splash) — logo animado + nome + loader. */
export function SplashScreen() {
  return (
    <div className="splash" role="status" aria-label="Carregando Whisly">
      <div className="splash__logo">
        <span className="splash__mark">W</span>
        <span className="splash__name">Wishly</span>
      </div>
      <div className="splash__dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
