const whatsappMessage = "Olá, Caroline! Vi seu site e quero solicitar minha análise gratuita de 30 minutos do Perfil da Empresa no Google, com relatório em PDF. Meu negócio é ____ e fica em ____.";
const encodedWhatsappMessage = encodeURIComponent(whatsappMessage).replace(
  /[!'()*]/g,
  (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`
);

export default {
  name: "Caroline Bispo",
  language: "pt-BR",
  locale: "pt_BR",
  url: "https://www.carolinebispo.com.br",
  themeColor: "#071b33",
  description: "Marketing digital para negócios locais: presença no Google, SEO Local, tráfego pago e automação de atendimento.",
  location: "Franco da Rocha • SP",
  contact: {
    email: "atendimento.carolinebispo@gmail.com",
    phoneE164: "+5511980569539",
    phoneDisplay: "(11) 98056-9539"
  },
  brand: {
    logo: "images/logo-caroline-bispo-localizacao.png",
    logoWidth: 1200,
    logoHeight: 393
  },
  links: {
    whatsappBase: "https://wa.me/5511980569539",
    whatsapp: `https://wa.me/5511980569539?text=${encodedWhatsappMessage}`,
    instagram: "https://www.instagram.com/acahdomarketing/",
    facebook: "https://www.facebook.com/people/Caroline-Bispo-l-Especialista-em-Marketing-Digital/61588458444555/",
    googleReview: "https://g.page/r/CT2dDuRCxHlJEAI/review"
  },
  integrations: {
    formAction: "https://script.google.com/macros/s/AKfycbwomYhy8axlmoPtJo7Ppt7IrPEMrlSif4cE_r97rzM8W2ejA_FzktZ0vVDl0UXMDEX-/exec",
    metaPixelId: "2429202777490521",
    calLink: "caroline-bispo/agendamentos",
    calPublicUrl: "https://cal.com/caroline-bispo/agendamentos"
  },
  homeSeo: {
    image: "/images/preview-compartilhamento-caroline-bispo-v2.png",
    imageWidth: 1729,
    imageHeight: 910,
    imageAlt: "Caroline Bispo — Marketing Digital para Negócios Locais"
  }
};
