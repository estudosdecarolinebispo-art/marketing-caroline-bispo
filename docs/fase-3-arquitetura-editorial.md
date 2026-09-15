# Fase 3 — Nova arquitetura editorial e comercial

Relatório de implementação e validação em 15 de setembro de 2026. A fase foi executada somente no repositório e no preview local. Não houve commit, push, publicação, alteração de DNS, mudança em contas externas nem envio real do formulário.

Os relatórios `docs/fase-1-fundacao-tecnica.md` e `docs/fase-2-migracao-eleventy.md` permanecem como documentação oficial das fases anteriores e não foram alterados.

## Resultado

O site deixou de usar a home como landing page monotemática e passou a apresentar **Caroline Bispo — Marketing Digital para Negócios Locais** como entidade central. A arquitetura agora distribui contexto e links para quatro serviços:

1. Perfil da Empresa no Google;
2. SEO Local e Google Maps;
3. Gestão de Tráfego Pago;
4. Automação de Atendimento para WhatsApp.

A landing page anterior foi preservada em `/diagnostico-google-meu-negocio/`, com o formulário, o endpoint Apps Script, a agenda Cal.com, a captura de UTMs, o consentimento e a mensuração existentes. As três URLs legais `.html` também permanecem disponíveis e não indexáveis.

Foram criadas exatamente as nove páginas indexáveis autorizadas. Não foram criadas páginas de resultados, estudos de caso, artigos, clusters, cidades, subserviços ou qualquer outra rota comercial.

## URLs, SEO on-page e Schema

| URL | Title | Meta description | H1 | Tipo principal de página |
|---|---|---|---|---|
| `/` | Marketing Digital para Negócios Locais \| Caroline Bispo | Estratégias de presença no Google, SEO Local, tráfego pago e automação de atendimento para negócios locais com Caroline Bispo. | Marketing digital para negócios locais que precisam ser encontrados, escolhidos e atendidos. | `WebPage` |
| `/sobre/` | Sobre Caroline Bispo \| Marketing Digital para Negócios Locais | Conheça a atuação de Caroline Bispo em marketing digital para negócios locais, sua abordagem e os serviços que conectam presença, mídia e atendimento. | Estratégia digital com contexto local, clareza e acompanhamento próximo. | `ProfilePage` |
| `/servicos/` | Serviços de Marketing Digital para Negócios Locais \| Caroline Bispo | Compare os serviços de Perfil da Empresa no Google, SEO Local, tráfego pago e automação de atendimento para encontrar o caminho certo. | Quatro frentes para fortalecer a presença e o atendimento do seu negócio. | `CollectionPage` |
| `/servicos/perfil-da-empresa-no-google/` | Perfil da Empresa no Google \| Caroline Bispo | Serviço profissional para configurar, otimizar e acompanhar o Perfil da Empresa no Google com foco em clareza, Google Maps e relevância local. | Perfil da Empresa no Google organizado para informar, transmitir confiança e apoiar escolhas. | `WebPage` + `Service` |
| `/servicos/seo-local-google-maps/` | SEO Local e Google Maps \| Caroline Bispo | Estratégia de SEO Local para conectar Perfil da Empresa, site, avaliações e conteúdo e melhorar a presença nas buscas e no Google Maps. | SEO Local para construir presença nas buscas e no Google Maps. | `WebPage` + `Service` |
| `/servicos/gestao-trafego-pago/` | Gestão de Tráfego Pago para Negócios Locais \| Caroline Bispo | Gestão de Google Ads e Meta Ads para campanhas locais, geração de oportunidades, monitoramento e otimizações sem promessas de resultado garantido. | Tráfego pago com objetivo comercial, acompanhamento e decisões baseadas em dados. | `WebPage` + `Service` |
| `/servicos/automacao-atendimento-whatsapp/` | Automação de Atendimento para WhatsApp \| Caroline Bispo | Automação de atendimento para WhatsApp com triagem, qualificação de leads, coleta de informações e encaminhamento ao atendimento humano. | Automação de Atendimento para WhatsApp sem perder o contexto humano. | `WebPage` + `Service` |
| `/diagnostico-google-meu-negocio/` | Diagnóstico Gratuito do Perfil da Empresa no Google \| Caroline Bispo | Solicite um diagnóstico gratuito de 30 minutos do seu Perfil da Empresa no Google e receba um relatório em PDF com prioridades práticas. | Seu negócio pode aparecer melhor no Google e atrair mais clientes locais. | `WebPage` |
| `/contato/` | Contato e Agendamento \| Caroline Bispo | Fale com Caroline Bispo por WhatsApp ou e-mail e agende uma conversa sobre marketing digital, presença local e atendimento do seu negócio. | Vamos conversar sobre o momento digital do seu negócio? | `ContactPage` |

Todos os titles, H1s e descriptions são únicos. As nove páginas também têm canonical absoluto com `www`, Open Graph, Twitter Card, robots indexável, HTML semântico e `<link rel="describedby" href="/llms.txt">`.

O JSON-LD é um `@graph` factual. Todas as páginas indexáveis mantêm `Person`, `WebSite` e `ImageObject`; as internas acrescentam `BreadcrumbList`. A página Sobre usa `ProfilePage` com `Person` como `mainEntity`; o hub usa `CollectionPage` e descreve os quatro serviços; as páginas comerciais têm um `Service`; Contato usa `ContactPage`. Todos os serviços apontam para `https://www.carolinebispo.com.br/#caroline` como `provider`.

Não foram usados `Organization`, `LocalBusiness`, `AggregateRating`, `Review`, `Offer`, endereço, preços, certificações ou resultados. A modelagem foi conferida nas definições atuais de [ProfilePage](https://schema.org/ProfilePage), [Service](https://schema.org/Service), [CollectionPage](https://schema.org/CollectionPage), [ContactPage](https://schema.org/ContactPage) e [BreadcrumbList](https://schema.org/BreadcrumbList).

## Estrutura da nova home

1. hero institucional com o posicionamento, dois CTAs e um painel que apresenta os quatro pilares;
2. faixa que resume descoberta, geração de oportunidades e atendimento;
3. explicação do problema geral e da escolha de prioridades;
4. cards dos quatro serviços com links para as páginas especializadas;
5. bloco de especialização em Perfil da Empresa e SEO Local;
6. apresentação factual de Caroline Bispo e link para Sobre;
7. chamada para o diagnóstico gratuito;
8. CTA final para WhatsApp e Contato;
9. rodapé institucional com navegação, contato, redes e páginas legais.

A home funciona como hub. Ela não tenta esgotar o conteúdo de cada serviço e não cria blocos artificiais de palavras-chave.

## Conteúdo das páginas

- **Sobre:** atuação, abordagem, foco em negócios locais, área regional confirmada, forma de trabalho e ligação com os quatro serviços. A trajetória foi descrita em linguagem neutra porque o projeto não contém datas, formações, certificações ou números profissionais confirmados.
- **Hub de serviços:** comparação curta dos quatro pilares, indicação de quando cada um faz sentido e explicação da sequência entre apresentar, ser encontrado, gerar oportunidades e organizar respostas.
- **Perfil da Empresa no Google:** diferencia o diagnóstico gratuito do serviço profissional completo; inclui Google Meu Negócio e Google Business Profile como nomenclaturas secundárias da mesma entidade.
- **SEO Local e Google Maps:** define SEO Local, relaciona perfil, site, conteúdo, avaliações, concorrência, buscas, área de atendimento e sinais de autoridade local sem repetição artificial.
- **Tráfego pago:** trata Google Ads, Meta Ads, segmentação, palavras-chave, anúncios, conversões, leads, ligações, WhatsApp, monitoramento, otimizações e relatórios como partes do serviço. Não há garantia de leads, vendas ou ROI.
- **Automação para WhatsApp:** trata triagem, qualificação, respostas iniciais, coleta de informações, agendamento e organização. IA aparece somente como possibilidade condicionada; a continuidade humana é explícita e nenhuma integração inexistente é citada.
- **Contato:** reúne WhatsApp, e-mail, diagnóstico e agenda. Informa somente a referência regional confirmada e declara que não há endereço público divulgado.

## Destino do conteúdo anterior e funcionamento do diagnóstico

O conteúdo da antiga home foi movido para `/diagnostico-google-meu-negocio/`. A página preserva:

- hero e proposta de análise gratuita;
- duração de 30 minutos e relatório em PDF;
- problemas analisados e processo em três etapas;
- formulário completo e consentimento específico;
- FAQ;
- agenda Cal.com sob demanda;
- CTAs e links naturais para o serviço profissional e Contato.

O formulário continua usando `method="post"` e o mesmo endpoint do Apps Script. O componente, a lógica de envio, os campos, os limites, o honeypot, a captura de UTMs e a mensagem de estado não tiveram o backend alterado. O teste foi feito apenas com o formulário vazio; a validação nativa impediu o POST e nenhum lead foi enviado.

## Arquitetura de links internos

| Origem | Destinos editoriais implementados |
|---|---|
| Home | hub, quatro serviços, Sobre, Diagnóstico e Contato |
| Hub Serviços | quatro serviços, Diagnóstico e Contato |
| Perfil da Empresa | Diagnóstico, SEO Local e Contato |
| SEO Local | Perfil da Empresa, Tráfego Pago e Contato |
| Tráfego Pago | Automação e Contato |
| Automação | Tráfego Pago e Contato |
| Sobre | hub, quatro serviços, Diagnóstico e Contato |
| Diagnóstico | Perfil da Empresa e Contato |
| Contato | Diagnóstico, WhatsApp, e-mail e agenda |

O cabeçalho e o rodapé compartilhados complementam a navegação global. As âncoras usam linguagem contextual e não repetem mecanicamente palavras-chave.

## Sitemap, robots e llms.txt

`sitemap.xml` é gerado a partir da lista central das nove páginas indexáveis. A validação exige exatamente essas nove URLs canônicas e rejeita páginas legais, drafts, arquivos técnicos, páginas futuras e metadados não confirmados como `lastmod`.

`robots.txt` foi preservado: OAI-SearchBot permitido, GPTBot bloqueado, demais robôs permitidos e sitemap absoluto com `www`.

Foi criada a primeira versão real de `llms.txt`, no formato recomendado pela [especificação llms.txt](https://llmstxt.org/): H1, resumo em bloco, contexto curto e listas de links descritos. Ela aponta exatamente para Home, Sobre, os quatro serviços, Diagnóstico e Contato. O hub `/servicos/` não foi incluído porque a lista autorizada para este arquivo nomeou especificamente essas oito páginas. Páginas legais, resultados, cases, artigos e cidades ficaram de fora.

A conferência final da especificação atual identificou a recomendação de anunciar o arquivo com `rel="describedby"`; por isso, o vínculo foi adicionado às nove páginas indexáveis e não às páginas legais.

## Arquivos criados nesta fase

- `src/_data/pages.js` — registro central de URLs, titles, descriptions e H1s;
- `src/_data/services.js` — conteúdo factual estruturado dos quatro serviços;
- `src/_includes/partials/breadcrumbs.njk` — breadcrumb visual compartilhado;
- `src/_includes/content/institutional-home.njk`;
- `src/_includes/content/about.njk`;
- `src/_includes/content/services-hub.njk`;
- `src/_includes/content/service-page.njk` — template compartilhado das quatro páginas comerciais;
- `src/_includes/content/contact.njk`;
- `src/sobre.njk`;
- `src/servicos.njk`;
- `src/servico-perfil-google.njk`;
- `src/servico-seo-local.njk`;
- `src/servico-trafego-pago.njk`;
- `src/servico-automacao-whatsapp.njk`;
- `src/diagnostico-google-meu-negocio.njk`;
- `src/contato.njk`;
- `src/llms.txt.njk`;
- `docs/fase-3-arquitetura-editorial.md`.

## Arquivos alterados nesta fase

- `src/_data/site.js` e `src/_data/navigation.json`;
- `src/index.njk` e `src/sitemap.xml.njk`;
- `src/_includes/layouts/base.njk`;
- `src/_includes/partials/head.njk`, `header.njk`, `footer.njk`, `mobile-actions.njk` e `schema.njk`;
- `src/_includes/components/profile-picture.njk`;
- `src/_includes/content/home.njk`, agora usado como conteúdo do diagnóstico;
- `src/assets/css/style.css`, ampliado com os novos blocos no mesmo sistema visual;
- `scripts/validate-build.mjs`, atualizado para funcionar como contrato da Fase 3.

`src/assets/js/script.js`, `src/assets/css/legal.css`, `src/static/CNAME` e `src/static/site.webmanifest` permanecem com os mesmos hashes aprovados. Os documentos das Fases 1 e 2 não foram editados.

## Validações executadas

| Verificação | Resultado |
|---|---|
| Build Eleventy | 15 templates gerados e 26 arquivos copiados; sem erro |
| `pnpm run verify` | aprovado |
| `html-validate` | zero erros nas 12 páginas HTML |
| Contrato estrutural | 41 arquivos obrigatórios, 9 páginas indexáveis, 3 legais e integrações críticas aprovadas |
| Nu HTML Checker do W3C | zero erros nas 12 páginas; zero avisos nas 9 indexáveis; 6 avisos informativos preexistentes nas páginas legais |
| JSON-LD | JSON válido; tipos, IDs, provider e restrições conferidos nas 9 páginas |
| Sitemap | exatamente 9 URLs canônicas e indexáveis |
| Robots | conteúdo aprovado preservado |
| llms.txt | formato e conjunto exato de 8 links aprovados |
| Canonicals e social metadata | únicos e coerentes nas 9 páginas |
| Breadcrumbs | presentes nas 8 páginas internas e ausentes na home |
| Links internos e assets | nenhum destino local quebrado |
| Rotas no preview | 14 respostas HTTP 200, incluindo 9 indexáveis, 3 legais, sitemap e llms.txt |
| Desktop | 1440 × 900, navegação completa, grids e hero sem overflow |
| Tablet | 820 × 1180, menu compacto, cards em duas colunas e sem overflow |
| Mobile | 390 × 844, menu nativo, grids em uma coluna, CTAs de 48 px e sem overflow |
| Navegação | menu móvel, links do hub e páginas de serviço exercitados |
| WhatsApp | telefone, URL codificada, `target` e `rel` preservados; nenhum envio externo foi disparado |
| Cal.com | ausente na carga inicial; 1 script e 1 iframe após o CTA; `aria-busy="false"`; UTMs encaminhadas |
| Formulário | action e POST preservados; envio vazio bloqueado; nenhum dado transmitido |
| Consentimento e Meta | recusa manteve nova página sem Pixel; aceite carregou os scripts do Meta |
| Imagens | variantes AVIF/WebP/JPEG, dimensões e referências locais aprovadas |
| Acessibilidade | H1 único, hierarquia de headings, skip link, landmarks, navegação, menu, FAQ e nomes acessíveis aprovados |
| CNAME | `www.carolinebispo.com.br` e hash preservados |
| Escopo | nenhum HTML ou destino não autorizado encontrado em `_site` |

O Nu HTML Checker manteve apenas dois avisos informativos em cada página legal, relativos a `section` e `article` sem heading próprio. Eles já estavam documentados na Fase 2 e foram preservados para não reestruturar o conteúdo jurídico fora do escopo.

## Problemas encontrados e corrigidos

1. A primeira validação apontou `aside` sem nome único em resumos de página e painéis de público. Elementos que não representavam conteúdo tangencial foram trocados por `div`, preservando apresentação e eliminando landmarks redundantes.
2. Dois blocos visuais usavam `aria-label` em `div` sem role. Os atributos foram removidos porque o contexto já é fornecido pelos headings visíveis.
3. O Nu HTML Checker identificou inicialmente que a seção de cards do hub não tinha heading no próprio escopo. Foi adicionado um H2 visualmente oculto e semanticamente descritivo.
4. A validação estrutural anterior à fase assumia apenas quatro páginas. O contrato foi ampliado para conferir as doze páginas atuais, metadata, Schema, links, sitemap, llms.txt, integrações e o conjunto exato do artefato.
5. Informações profissionais específicas não estavam confirmadas no projeto. A redação usa formulações neutras e não preenche lacunas com credenciais, números, clientes ou resultados inventados.

Nenhuma regressão funcional, de URL, SEO técnico, Schema, responsividade, acessibilidade ou integração permaneceu após as correções.

## Decisões de implementação

- O mesmo template editorial gera as quatro páginas de serviço a partir de dados estruturados, reduzindo divergências futuras.
- A identidade visual foi estendida com cards, painéis e fluxos que reutilizam paleta, tipografia, espaçamento, sombras, CTAs e animações existentes. Não houve redesign completo nem inclusão de ícones decorativos ou imagens artificiais.
- A mensagem codificada existente do WhatsApp foi preservada em todos os CTAs para não alterar o fluxo aprovado sem nova autorização, mesmo quando o link parte de uma página institucional.
- O conteúdo do diagnóstico continua separado do serviço profissional: o primeiro identifica problemas e gera o lead; o segundo explica execução, otimização e continuidade.
- O endereço residencial não aparece. A área regional é citada somente conforme já estava confirmada no conteúdo anterior.
- `Service` aponta diretamente para `Person`, pois não há organização separada confirmada.
- O JavaScript permanece mínimo e compartilhado; Cal.com só carrega quando se aproxima da viewport ou recebe interação.

## Pontos que ainda dependem de Caroline

1. Fornecer uma biografia profissional verificável, caso queira ampliar a seção de trajetória com datas, formação, certificações, experiências ou marcos específicos.
2. Decidir futuramente se os CTAs gerais de WhatsApp devem usar uma mensagem neutra distinta da mensagem atual do diagnóstico. A Fase 3 preservou o link existente.
3. Confirmar ferramentas e integrações reais de automação antes de citar plataformas específicas na página do serviço.
4. Informar condições comerciais, escopos fechados, prazos ou preços somente quando houver aprovação explícita para publicação.
5. Realizar uma submissão controlada do formulário em ambiente real quando desejar validar a gravação no Apps Script; nenhum envio foi feito nesta fase.

## Recomendação para a Fase 4

Antes de criar estudos de caso ou páginas de resultados:

1. reunir evidências verificáveis, autorização de clientes e critérios de anonimização;
2. definir quais resultados podem ser publicados e como serão comprovados;
3. separar depoimentos reais, métricas, período, contexto, escopo executado e limitações;
4. criar um modelo editorial de caso que diferencie fato, método e interpretação;
5. validar novamente links, Schema e claims antes de indexar qualquer página de autoridade.

A Fase 4 continua bloqueada. Nenhum case, resultado, depoimento, estatística, logo de cliente ou certificação foi criado nesta implementação.
