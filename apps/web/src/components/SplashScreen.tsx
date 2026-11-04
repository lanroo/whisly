import './splash.css';

/** Tela de abertura do app (splash) — logo animado + nome + loader. */
export function SplashScreen() {
  return (
    <div className="splash" role="status" aria-label="Carregando Whisly">
      <div className="splash__logo">
        <span className="splash__mark">
          <img alt="" src="/brand-mark.svg" />
        </span>
        <span className="splash__name">Whisly</span>
      </div>
      <div className="splash__dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
