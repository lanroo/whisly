/**
 * Logomarca canônica do Whisly: símbolo de marcador + wordmark "WHISLY".
 *
 * FONTE ÚNICA DE VERDADE da marca — use SEMPRE este componente. Nunca escreva
 * "Whisly"/"WHISLY" solto: o selo e o nome saem daqui.
 */
export function Brand({ className = '' }: { className?: string }) {
  return (
    <span className={`brand ${className}`.trim()}>
      <span aria-hidden="true" className="brand__mark">
        <img alt="" src="/brand-mark.svg" />
      </span>
      <span className="brand__name">Whisly</span>
    </span>
  );
}
