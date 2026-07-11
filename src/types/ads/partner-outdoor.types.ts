/**
 * Outdoor de parceiros na home (hero).
 * Conteúdo 100% data-driven via JSON — sem hardcode de slides no JSX.
 */

export interface PartnerOutdoorSlide {
  /** Identificador estável (chave React / analytics). */
  id: string;
  /** Path público da imagem, ex.: `/favico.png` ou `/ads/parceiro.png`. */
  image: string;
  /** Texto da propaganda exibido no card. */
  text: string;
  /** URL de destino; abre em nova aba. */
  href: string;
}

export interface PartnerOutdoorConfig {
  /** Rodapé do card, ex.: `© 2026 Cifra Tom`. */
  copyright: string;
  /** Intervalo do autoplay em ms (mín. 2000 no loader). */
  intervalMs: number;
  /** Até 10 slides (excesso é cortado no loader). */
  slides: PartnerOutdoorSlide[];
}

export interface PartnerOutdoorCardProps {
  config: PartnerOutdoorConfig;
  className?: string;
}

/** Uma coluna do banner do footer: 1 card com até 5 slides. */
export interface FooterCarouselColumn {
  id: string;
  config: PartnerOutdoorConfig;
}

/**
 * Footer: 3 cards lado a lado × 5 slides cada = até 15 ads.
 * Cada coluna tem o mesmo copyright/interval do JSON.
 */
export interface FooterCarouselConfig {
  columns: FooterCarouselColumn[];
}
