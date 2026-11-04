export const t = {
  nav: {
    label: 'Navegação principal',
    openMenu: 'Abrir menu',
    closeMenu: 'Fechar menu',
    mobileLabel: 'Menu',
    homeLabel: 'Ir para o início',
  },
  carousel: {
    label: 'Destaques',
    prev: 'Slide anterior',
    next: 'Próximo slide',
    goTo: (n: number) => `Ir para o slide ${n}`,
    slideLabel: (index: number, total: number) => `${index} de ${total}`,
    pause: 'Pausar carrossel',
    play: 'Reproduzir carrossel',
    enableVideo: 'Ativar vídeo',
    videoTitle: 'Vídeo de fundo',
    dotsLabel: 'Escolher slide',
  },
  form: {
    submit: 'Enviar mensagem',
    submitting: 'Enviando…',
    retry: 'Tentar novamente',
    success: 'Mensagem enviada! Responderemos em breve.',
    error: 'Não foi possível enviar. Verifique sua conexão e tente novamente.',
    labels: {
      name: 'Nome',
      email: 'E-mail',
      phone: 'Telefone (opcional)',
      subject: 'Assunto',
      message: 'Mensagem',
    },
    selectSubject: 'Selecione um assunto',
    errors: {
      required: 'Campo obrigatório',
      nameLength: 'Informe entre 2 e 100 caracteres',
      email: 'Informe um e-mail válido',
      phone: 'Informe um telefone com DDD',
      messageLength: 'Escreva entre 10 e 2000 caracteres',
      consent: 'É necessário aceitar a política de privacidade',
      subject: 'Selecione um assunto',
    },
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
  notFound: {
    title: 'Página não encontrada',
    description: 'O endereço que você acessou não existe ou foi movido.',
    backHome: 'Voltar para o início',
  },
  cookieTable: {
    label: 'Cookies utilizados neste site',
    columns: {
      name: 'Cookie',
      provider: 'Provedor',
      purpose: 'Finalidade',
      duration: 'Duração',
    },
  },
} as const;
