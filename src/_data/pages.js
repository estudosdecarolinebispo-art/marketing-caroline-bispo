const entries = {
  home: {
    url: "/",
    title: "Marketing Digital para Negócios Locais | Caroline Bispo",
    description: "Estratégias de presença no Google, SEO Local, tráfego pago e automação de atendimento para negócios locais com Caroline Bispo.",
    h1: "Marketing digital para negócios locais que precisam ser encontrados, escolhidos e atendidos."
  },
  about: {
    url: "/sobre/",
    title: "Sobre Caroline Bispo | Marketing Digital para Negócios Locais",
    description: "Conheça a atuação de Caroline Bispo em marketing digital para negócios locais, sua abordagem e os serviços que conectam presença, mídia e atendimento.",
    h1: "Estratégia digital com contexto local, clareza e acompanhamento próximo."
  },
  services: {
    url: "/servicos/",
    title: "Serviços de Marketing Digital para Negócios Locais | Caroline Bispo",
    description: "Compare os serviços de Perfil da Empresa no Google, SEO Local, tráfego pago e automação de atendimento para encontrar o caminho certo.",
    h1: "Quatro frentes para fortalecer a presença e o atendimento do seu negócio."
  },
  profile: {
    url: "/servicos/perfil-da-empresa-no-google/",
    title: "Perfil da Empresa no Google | Caroline Bispo",
    description: "Serviço profissional para configurar, otimizar e acompanhar o Perfil da Empresa no Google com foco em clareza, Google Maps e relevância local.",
    h1: "Perfil da Empresa no Google organizado para informar, transmitir confiança e apoiar escolhas."
  },
  seo: {
    url: "/servicos/seo-local-google-maps/",
    title: "SEO Local e Google Maps | Caroline Bispo",
    description: "Estratégia de SEO Local para conectar Perfil da Empresa, site, avaliações e conteúdo e melhorar a presença nas buscas e no Google Maps.",
    h1: "SEO Local para construir presença nas buscas e no Google Maps."
  },
  paid: {
    url: "/servicos/gestao-trafego-pago/",
    title: "Gestão de Tráfego Pago para Negócios Locais | Caroline Bispo",
    description: "Gestão de Google Ads e Meta Ads para campanhas locais, geração de oportunidades, monitoramento e otimizações sem promessas de resultado garantido.",
    h1: "Tráfego pago com objetivo comercial, acompanhamento e decisões baseadas em dados."
  },
  automation: {
    url: "/servicos/automacao-atendimento-whatsapp/",
    title: "Automação de Atendimento para WhatsApp | Caroline Bispo",
    description: "Automação de atendimento para WhatsApp com triagem, qualificação de leads, coleta de informações e encaminhamento ao atendimento humano.",
    h1: "Automação de Atendimento para WhatsApp sem perder o contexto humano."
  },
  diagnostic: {
    url: "/diagnostico-google-meu-negocio/",
    title: "Diagnóstico Gratuito do Perfil da Empresa no Google | Caroline Bispo",
    description: "Solicite um diagnóstico gratuito de 30 minutos do seu Perfil da Empresa no Google e receba um relatório em PDF com prioridades práticas.",
    h1: "Seu negócio pode aparecer melhor no Google e atrair mais clientes locais."
  },
  contact: {
    url: "/contato/",
    title: "Contato e Agendamento | Caroline Bispo",
    description: "Fale com Caroline Bispo por WhatsApp ou e-mail e agende uma conversa sobre marketing digital, presença local e atendimento do seu negócio.",
    h1: "Vamos conversar sobre o momento digital do seu negócio?"
  },
  privacy: {
    url: "/politica-de-privacidade.html",
    title: "Política de Privacidade | Caroline Bispo",
    description: "Saiba como Caroline Bispo coleta, utiliza, protege e exclui dados pessoais no site e nos atendimentos realizados pelo WhatsApp."
  },
  terms: {
    url: "/termos-de-servico.html",
    title: "Termos de Serviço | Caroline Bispo",
    description: "Conheça as condições de uso do site e dos atendimentos oferecidos por Caroline Bispo, inclusive pelo WhatsApp."
  },
  deletion: {
    url: "/exclusao-de-dados.html",
    title: "Exclusão de Dados do Usuário | Caroline Bispo",
    description: "Veja como solicitar a exclusão dos seus dados pessoais dos atendimentos, formulários e integrações de Caroline Bispo."
  }
};

const indexableOrder = ["home", "about", "services", "profile", "seo", "paid", "automation", "diagnostic", "contact"];

export default {
  entries,
  indexable: indexableOrder.map((key) => ({ key, ...entries[key] }))
};
