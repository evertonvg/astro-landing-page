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
    title: 'Usamos cookies',
    description:
      'Usamos cookies necessários para o funcionamento do site e, com a sua permissão, cookies de análise, marketing e mídia. Você pode mudar sua escolha a qualquer momento.',
    acceptAll: 'Aceitar todos',
    rejectAll: 'Rejeitar todos',
    preferences: 'Preferências',
    savePreferences: 'Salvar preferências',
    close: 'Fechar',
    preferencesTitle: 'Preferências de cookies',
    preferencesIntroTitle: 'Como usamos cookies',
    preferencesIntro:
      'Escolha quais categorias de cookies você permite. Os cookies necessários não podem ser desativados.',
    categories: {
      necessary: {
        title: 'Necessários',
        description: 'Essenciais para o funcionamento e a segurança do site.',
      },
      analytics: {
        title: 'Analytics',
        description: 'Ajudam a entender como o site é usado, de forma estatística.',
      },
      marketing: {
        title: 'Marketing',
        description: 'Medem a eficácia de campanhas e permitem anúncios relevantes.',
      },
      media: {
        title: 'Mídia',
        description: 'Permitem carregar vídeos incorporados, como os do YouTube.',
      },
    },
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
