/**
 * Logomarca canônica do Wishly: selo "W" + wordmark "WISHLY", ambos na fonte
 * serif (Playfair Display), mesmo tamanho e espaçamento.
 *
 * FONTE ÚNICA DE VERDADE da marca — use SEMPRE este componente. Nunca escreva
 * "Wishly"/"WISHLY" solto nem um "W" avulso: o selo e o nome saem daqui.
 */
export function Brand({ className = '' }: { className?: string }) {
  return (
    <span className={`brand ${className}`.trim()}>
      <span aria-hidden="true" className="brand__mark">
        W
      </span>
      <span className="brand__name">Wishly</span>
    </span>
  );
}
