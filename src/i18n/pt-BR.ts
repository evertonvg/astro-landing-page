export const t = {
  nav: {
    label: 'Navegação principal',
    openMenu: 'Abrir menu',
    closeMenu: 'Fechar menu',
    mobileLabel: 'Menu',
    homeLabel: 'Ir para o início',
  },
  carousel: {
    label: 'Carrossel',
    previous: 'Slide anterior',
    next: 'Próximo slide',
  },
  form: {
    submit: 'Enviar',
    sending: 'Enviando...',
    required: 'Campo obrigatório',
  },
  consent: {
    accept: 'Aceitar',
    reject: 'Recusar',
  },
  pricing: {
    popular: 'Mais popular',
    billingYearly: 'Cobrança anual',
    perMonth: '/mês',
    perYear: '/ano',
    savings: (percent: number) => `Economize ${percent}%`,
  },
  common: {
    skipToContent: 'Pular para o conteúdo',
    cookiePreferences: 'Preferências de cookies',
    socialLabel: 'Redes sociais',
    footerLabel: 'Rodapé',
  },
} as const;
