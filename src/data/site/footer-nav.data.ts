export interface FooterLink {
  href: string;
  label: string;
  external?: boolean;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Músicas',
    links: [
      { href: '/', label: 'Catálogo' },
      { href: '/historico', label: 'Histórico' },
      { href: '/adicionar', label: 'Enviar cifra' },
    ],
  },
  {
    title: 'Ferramentas',
    links: [
      { href: '/acordes', label: 'Dicionário de acordes' },
      { href: '/metronomo', label: 'Metrônomo' },
      { href: '/afinador', label: 'Afinador' },
    ],
  },
  {
    title: 'Comunidade',
    links: [
      { href: '/entrar', label: 'Entrar' },
      { href: '/cadastrar', label: 'Cadastrar' },
      { href: '/conta/envios', label: 'Meus envios' },
      { href: '/conta/favoritos', label: 'Favoritos' },
    ],
  },
  {
    title: 'Sobre',
    links: [
      { href: '/faq', label: 'FAQ' },
      { href: '/privacidade', label: 'Privacidade' },
      { href: '/termos', label: 'Termos de uso' },
      { href: '/premium', label: 'Premium' },
    ],
  },
];

export const SOCIAL_LINKS: FooterLink[] = [
  { href: 'https://youtube.com', label: 'YouTube', external: true },
  { href: 'https://instagram.com', label: 'Instagram', external: true },
  { href: 'https://x.com', label: 'X', external: true },
];
