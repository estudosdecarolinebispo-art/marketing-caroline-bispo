# Fase 1 — Fundação técnica

Relatório de implementação e auditoria em 10 de setembro de 2026. Esta etapa foi executada somente no repositório local; não houve publicação, alteração de DNS, mudança em contas externas nem envio real do formulário.

## Linha de base registrada antes das alterações

- Arquitetura: site estático em HTML, CSS e JavaScript, sem gerador, dependências de projeto ou pipeline de build.
- Git: branch `codex/adiciona-paginas-legais`, commit `bc201bb8bdccbd9c4d1f32b613e6ac69efd889ce`, alinhado ao remoto no início da etapa.
- Alterações preexistentes preservadas: quebra de linha adicionada em `CNAME` e arquivo não rastreado `images/.gitkeep`. O valor do CNAME já era `www.carolinebispo.com.br` e não foi alterado nesta fase.
- URLs públicas existentes: `/`, `/politica-de-privacidade.html`, `/termos-de-servico.html` e `/exclusao-de-dados.html`.
- Canônica da home, Open Graph, Twitter Image, Schema, sitemap e robots apontavam para o domínio sem `www`, apesar de o CNAME e o redirecionamento público usarem `www`.
- O sitemap continha quatro URLs, inclusive as três páginas legais, além de `priority` e `changefreq`.
- As três páginas legais estavam com `index, follow`.
- O Schema usava `ProfessionalService`, tipo descontinuado no vocabulário atual, e incluía área de atendimento no dado estruturado.
- O validador Nu do W3C encontrou dois erros na home: `aria-label` aplicado a duas `div` genéricas (região do calendário e barra móvel). As páginas legais não tinham erros, somente dois avisos informativos de estrutura semântica cada.
- O retrato usado na seção Sobre era um PNG RGB de 2000 × 2000 px e 4.340.815 bytes.
- O Cal.com era baixado e inicializado na abertura da home, embora a agenda esteja próxima do final da página.
- O formulário fazia POST para um Apps Script com `mode: "no-cors"` e tratava qualquer resolução da promessa como confirmação de gravação, limpando os campos e registrando conversões mesmo sem acesso ao status da resposta.
- O Pixel da Meta já existia, condicionado ao consentimento salvo em `localStorage`. Não havia GA4 nem GTM. Os eventos próprios eram acumulados em `window.dataLayer`, mas não havia consumidor analítico instalado.

## Alterações implementadas

### Canônica, indexação e rastreamento

- A referência canônica foi unificada em `https://www.carolinebispo.com.br/` na home, Open Graph, Twitter Image, Schema, sitemap e páginas legais.
- As páginas legais continuam acessíveis e com o mesmo conteúdo, mas agora usam `noindex, follow` e foram retiradas do sitemap.
- O sitemap contém somente a home canônica e não usa `lastmod`, `priority` ou `changefreq` sem evidência confiável.
- O `robots.txt` passou a permitir `OAI-SearchBot`, bloquear `GPTBot`, permitir os demais robôs e anunciar o sitemap em `www`. Essa separação segue a documentação oficial de crawlers da OpenAI: <https://developers.openai.com/api/docs/bots>.

### Dados estruturados

O bloco antigo foi substituído por um grafo pequeno e factual com:

- `Person` como entidade principal;
- `WebSite`;
- `WebPage`;
- `ImageObject`.

Não foram adicionados `Organization`, `LocalBusiness`, endereço, CNPJ, certificações, avaliações, preços, resultados, novas áreas atendidas ou serviços ainda não publicados. Todas as URLs e referências `@id` do grafo foram verificadas localmente.

### Acessibilidade e HTML

- A agenda é uma região nomeada por `aria-labelledby` ligado ao título visível da seção, com `aria-busy` durante o carregamento.
- A barra de ações móvel passou de `div` para `nav`, preservando aparência e links.
- Resultado após a alteração: zero erros nas quatro páginas no validador Nu do W3C. Permanecem apenas os avisos informativos preexistentes nas páginas legais; eles não são erros e a estrutura do texto jurídico não foi reescrita.

### Imagens e CLS

- O PNG original foi preservado.
- Foram geradas variantes 480, 800 e 1200 px em AVIF, WebP e JPEG.
- A home usa `picture`, `srcset`, `sizes`, fallback JPEG, `width`, `height`, `loading="lazy"` e `decoding="async"`.
- Em viewport móvel, o navegador escolheu `caroline-bispo-perfil-480.avif` (24.548 bytes), redução de 99,43% em relação ao PNG original de 4.340.815 bytes.
- Comparação técnica do AVIF móvel com o original redimensionado: PSNR de 39,48 dB. A inspeção visual de original, WebP e AVIF decodificado não revelou degradação perceptível no tamanho de exibição do site.
- Logos transparentes e imagens de compartilhamento foram mantidos sem conversão ou substituição.

### Cal.com

- O embed agora é carregado sob demanda quando se aproxima da viewport, em vez de bloquear a abertura da página.
- A inicialização mantém layout, cor, link `caroline-bispo/agendamentos`, evento `bookingSuccessfulV2` e encaminhamento de parâmetros da URL.
- Há estado acessível de carregamento e fallback para abrir a agenda em nova aba quando o script falha ou demora mais de 15 segundos. O fallback também preserva a query string.
- Teste com `?utm_source=codex_test&utm_medium=cpc`: o `src` final do iframe continha ambos os parâmetros. A configuração segue a documentação oficial do Cal.com: <https://cal.com/help/embedding/embed-auto-forward-query-params>.

## Auditoria do formulário e do Apps Script

### Evidência observável

- Endpoint público usado pela home: `https://script.google.com/macros/s/AKfycbwomYhy8axlmoPtJo7Ppt7IrPEMrlSif4cE_r97rzM8W2ejA_FzktZ0vVDl0UXMDEX-/exec`.
- Uma consulta GET sem dados respondeu HTTP 200 com a mensagem do Google Apps Script `Função de script não encontrada: doGet`. Isso confirma o deploy, mas não o conteúdo de `doPost`.
- Uma consulta OPTIONS respondeu HTTP 200 e anunciou `HEAD, GET, POST`, sem cabeçalho `Access-Control-Allow-Origin` observável.
- O código-fonte de `doPost`, o ID da planilha e a lógica de gravação não estão neste repositório e não podem ser lidos a partir do endpoint publicado. Portanto, ainda não é possível comprovar como os campos chegam à planilha, quais validações rodam no servidor ou se uma resposta de sucesso corresponde a uma linha realmente gravada.

### Problema real

Em `no-cors`, o navegador entrega uma resposta opaca: JavaScript não pode ler status, corpo ou confirmação da aplicação. Além disso, `fetch` resolve normalmente para respostas HTTP de erro; ele rejeita principalmente em falhas de rede. O comportamento anterior tratava essa resolução como sucesso confirmado, limpava o formulário e disparava `lead_submit` e Meta `Lead`, podendo produzir confirmação e mensuração falsas.

### Mitigação aplicada no cliente

- O POST existente foi preservado; backend, campos, consentimento, UTMs e endpoint não mudaram.
- Após a resposta opaca, os campos não são apagados e o site informa claramente que a solicitação foi encaminhada, mas que a gravação não pôde ser confirmada.
- `lead_submit` e Meta `Lead` não são disparados sem confirmação verificável. Cliques, WhatsApp, visualização da agenda e agendamento continuam com a lógica existente.
- O cenário de campos obrigatórios vazios foi testado sem transmissão: o navegador bloqueou o envio, focou `nome` e não exibiu status de sucesso.
- Nenhum POST real foi executado durante a auditoria, evitando criar linha de teste na planilha ou uma falsa solicitação comercial.

### Solução recomendada antes de alterar o backend

1. Obter acesso de leitura ao Apps Script e à planilha de teste, ou uma cópia sanitizada de `doPost`.
2. Documentar o mapeamento campo → coluna, validações, tratamento de duplicidade, retorno, logs e permissões do deploy.
3. Fazer o endpoint retornar JSON verificável, por exemplo `{ "ok": true, "submissionId": "..." }`, somente depois de a gravação terminar.
4. Preferir uma função server-side no mesmo domínio ou uma camada intermediária controlada que valide a origem e exponha CORS estrito. Se o Apps Script continuar direto, validar em produção se o redirecionamento e os cabeçalhos permitem leitura real antes de remover `no-cors`.
5. Validar no servidor tipos, limites, consentimento, honeypot, taxa de requisições e caracteres que iniciam fórmulas em planilhas (`=`, `+`, `-`, `@`). Não incluir segredos no JavaScript do cliente nem enviar respostas do formulário ao Meta.
6. Só então restaurar a confirmação visual, limpar os campos e disparar `lead_submit`/Meta `Lead` após `ok: true`, com identificador para deduplicação.

Impacto esperado: confirmação confiável e métricas limpas. Riscos: mudança de CORS/deploy pode interromper o formulário; por isso a troca exige ambiente de teste, rollback do endpoint e conferência de uma linha real antes da publicação.

## Recomendação de arquitetura de mensuração

Não foi instalado GA4, GTM ou novo rastreador nesta fase.

Antes da instalação, recomenda-se separar consentimento analítico de consentimento de marketing e definir um contrato único de eventos no `dataLayer`:

- `form_start_click` — intenção de iniciar;
- `whatsapp_click` — saída para WhatsApp;
- `schedule_click` — intenção de abrir agenda;
- `schedule_view` — embed visível;
- `schedule_complete` — reserva confirmada pelo Cal.com;
- `lead_submit` — somente resposta positiva e verificável do backend.

Depois dessa decisão, GTM pode centralizar GA4 e Meta, respeitando consentimento por categoria. `lead_submit` e `schedule_complete` devem usar identificadores próprios para evitar duplicidade. A política e o texto do banner precisam ser revisados antes de qualquer coleta analítica adicional.

## Search Console

Configuração recomendada, sem alteração de conta ou DNS nesta fase:

- propriedade de Domínio `carolinebispo.com.br` como principal;
- propriedade de prefixo `https://www.carolinebispo.com.br/` como complementar para diagnóstico do host canônico;
- sitemap a enviar: `https://www.carolinebispo.com.br/sitemap.xml`.

## Modelo futuro de dados para Eleventy

Somente documentação; nenhum arquivo, dependência, template ou pipeline Eleventy foi criado.

- `site`: nome, URL canônica, idioma, contato, redes e imagem principal;
- `services`: `slug`, título, resumo, intenção de busca, benefícios confirmados, CTA e estado de publicação;
- `areas`: `slug`, nome da localidade, cobertura confirmada, contexto local real e estado de publicação;
- `articles`: `slug`, título, descrição, data real, autor, tópico, relações com serviço/localidade e estado de publicação;
- `legal`: título, descrição, data de atualização, política de indexação e conteúdo;
- `redirects`: origem, destino, código e motivo;
- `seo`: title, description, canonical, Open Graph e regras de indexação calculadas por template.

Princípios para uma fase futura: gerar sitemap apenas de conteúdo publicado e indexável; nunca inventar `lastmod`; validar unicidade de slugs e canônicas; separar dados confirmados de rascunhos; manter páginas legais fora do sitemap enquanto estiverem em `noindex`.

## Validações finais

- Nu HTML Checker: 0 erros na home e nas três páginas legais.
- JavaScript: `node --check script.js` aprovado.
- JSON-LD: JSON válido, quatro tipos esperados, IDs internos resolvidos e nenhum tipo proibido.
- Links, assets e fragmentos locais: aprovados nas quatro páginas.
- URLs locais e públicas existentes: todas responderam HTTP 200; o domínio sem `www` redirecionou para `https://www.carolinebispo.com.br/`.
- Responsividade: testada em 1440 × 900 e 390 × 844; sem overflow horizontal; navegação desktop e barra móvel alternaram corretamente; os dois atalhos móveis mantiveram 48 px de altura.
- Cal.com: ausente da carga inicial, um único script carregado ao se aproximar da agenda, iframe criado, `aria-busy` removido e UTMs preservadas.
- Formulário: validação obrigatória testada sem POST real; a confirmação enganosa foi removida, mas a gravação em planilha permanece pendente de auditoria do backend.
- `git diff --check`: aprovado, sem erros de whitespace.

## Itens deliberadamente não alterados

- design, estrutura comercial, textos principais, oferta, páginas novas e conteúdo jurídico;
- URL ou lógica interna do Apps Script;
- CNAME, DNS, Search Console, contas de SEO e integrações externas;
- GA4, GTM, novos pixels ou novos eventos;
- imagem Open Graph existente;
- Eleventy, dependências, build, hospedagem e deploy;
- `llms.txt`, adiado até existirem páginas suficientes e definitivas para um arquivo útil.

## Arquivos alterados nesta fase

- `index.html`
- `politica-de-privacidade.html`
- `termos-de-servico.html`
- `exclusao-de-dados.html`
- `robots.txt`
- `sitemap.xml`
- `script.js`
- `style.css`

Arquivos novos: nove variantes responsivas de `images/caroline-bispo-perfil` em AVIF, WebP e JPEG, além deste relatório.

O `CNAME` e `images/.gitkeep` aparecem no estado do Git, mas já estavam modificados/não rastreados antes do início e não fazem parte da implementação desta fase.
