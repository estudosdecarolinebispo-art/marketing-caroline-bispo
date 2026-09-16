# Fase 3.5 — Publicação controlada e validação em produção

Data da validação: 15 de setembro de 2026, horário de Brasília.

Origem canônica: `https://www.carolinebispo.com.br/`

Repositório: `estudosdecarolinebispo-art/marketing-caroline-bispo`

## Escopo e resultado

A arquitetura aprovada na Fase 3 foi publicada pelo workflow existente do GitHub Pages e validada no domínio real. A Fase 4 não foi iniciada. Não foram criadas páginas, conteúdos, estudos de caso, resultados, integrações de analytics ou alterações de backend fora do escopo.

O site está publicado e navegável no domínio canônico. Há uma correção externa de DNS recomendada para o registro `www`, descrita neste relatório, mas ela não impediu a validação atual depois que o domínio personalizado foi associado corretamente ao GitHub Pages.

## Revisão pré-publicação

Antes do primeiro push foram executadas as seguintes verificações:

- `pnpm run verify`: aprovado;
- build Eleventy: 15 arquivos gerados e 26 copiados;
- `html-validate`: aprovado;
- validação estrutural: 41 arquivos obrigatórios, 9 páginas indexáveis, 3 páginas legais e integrações críticas preservadas;
- `git diff --check`: aprovado;
- conferência do diff completo e dos arquivos versionados;
- confirmação de que `_site/` é saída gerada e está ignorado pelo Git;
- confirmação de que o workflow instala dependências com lockfile, executa `pnpm run verify`, envia `_site/` como artefato e publica com `actions/deploy-pages`;
- confirmação de `src/static/CNAME` com `www.carolinebispo.com.br`;
- busca por chaves privadas, tokens do GitHub, AWS, Google, OpenAI e nomes de arquivos suspeitos: nenhum segredo encontrado;
- nenhuma alteração alheia ao site foi incluída.

As alterações preexistentes eram o conjunto aprovado das Fases 1, 2 e 3 ainda não versionado: fundação Eleventy, workflow, templates, conteúdo, estilos, scripts, imagens otimizadas e documentação dessas fases.

## Commits, push e deploy

### Commits de implementação e correção

1. `a10663ccf75834518bfdd6bca246f026a3e3e256` — `Implementa arquitetura editorial com Eleventy`;
2. `1817ef3caa9563343fa57fd8efeeb773d95f5da8` — `Corrige validação de produção e semântica legal`.

Os dois commits foram enviados para `origin/main`.

### GitHub Pages

- workflow principal do primeiro push: [execução 35027130498](https://github.com/estudosdecarolinebispo-art/marketing-caroline-bispo/actions/runs/35027130498), concluída com sucesso;
- o repositório ainda estava configurado no modo legado, publicando a raiz de `main`; isso gerou um workflow dinâmico legado com falha e o domínio retornou 404 inicialmente;
- correção necessária aplicada nas configurações do GitHub Pages: `build_type=workflow` e domínio personalizado `www.carolinebispo.com.br`;
- novo deploy após a correção: [execução 35027884488](https://github.com/estudosdecarolinebispo-art/marketing-caroline-bispo/actions/runs/35027884488), concluída com sucesso;
- deploy do commit corretivo: [execução 35029097521](https://github.com/estudosdecarolinebispo-art/marketing-caroline-bispo/actions/runs/35029097521), concluída com sucesso.

Na consulta final, o GitHub Pages reportou `status=built`, publicação por `workflow`, `cname=www.carolinebispo.com.br`, HTTPS obrigatório e certificado aprovado para o domínio com e sem `www`.

## URLs publicadas e HTTP

Todas as URLs abaixo responderam HTTP 200 em HTTPS no host canônico:

| Tipo | URL |
|---|---|
| Indexável | `https://www.carolinebispo.com.br/` |
| Indexável | `https://www.carolinebispo.com.br/sobre/` |
| Indexável | `https://www.carolinebispo.com.br/servicos/` |
| Indexável | `https://www.carolinebispo.com.br/servicos/perfil-da-empresa-no-google/` |
| Indexável | `https://www.carolinebispo.com.br/servicos/seo-local-google-maps/` |
| Indexável | `https://www.carolinebispo.com.br/servicos/gestao-trafego-pago/` |
| Indexável | `https://www.carolinebispo.com.br/servicos/automacao-atendimento-whatsapp/` |
| Indexável | `https://www.carolinebispo.com.br/diagnostico-google-meu-negocio/` |
| Indexável | `https://www.carolinebispo.com.br/contato/` |
| Legal | `https://www.carolinebispo.com.br/politica-de-privacidade.html` |
| Legal | `https://www.carolinebispo.com.br/termos-de-servico.html` |
| Legal | `https://www.carolinebispo.com.br/exclusao-de-dados.html` |
| Técnico | `https://www.carolinebispo.com.br/sitemap.xml` |
| Técnico | `https://www.carolinebispo.com.br/robots.txt` |
| Técnico | `https://www.carolinebispo.com.br/llms.txt` |

As oito rotas de diretório sem barra final responderam 301 para a versão canônica com barra. O domínio raiz `https://carolinebispo.com.br/` respondeu 301 e terminou em `https://www.carolinebispo.com.br/` com HTTP 200.

Links internos, breadcrumbs, navegação, imagens e assets foram conferidos pelo contrato estrutural local e pela auditoria no navegador em produção. Os principais assets públicos (`style.css`, `script.js`, manifesto, favicon e imagens responsivas) responderam HTTP 200.

## SEO e Schema.org em produção

O auditor `scripts/validate-production.mjs` conferiu individualmente as doze páginas HTML e terminou sem falhas. Foram validados:

- title e meta description aprovados;
- um H1 por página indexável;
- canonical absoluto no domínio com `www`;
- `index, follow, max-image-preview:large` nas nove páginas indexáveis;
- `noindex, follow` nas três páginas legais;
- Open Graph e Twitter metadata nas páginas indexáveis;
- `rel="describedby" href="/llms.txt"` nas nove páginas indexáveis;
- um JSON-LD válido por página indexável;
- tipos `Person`, `WebSite`, `WebPage`, `ProfilePage`, `Service`, `CollectionPage`, `ContactPage`, `BreadcrumbList` e `ImageObject` conforme a função de cada rota;
- ausência de `BreadcrumbList` na home e presença nas demais páginas indexáveis;
- quantidade correta de `Service` nas quatro páginas de serviço e no hub.

A validação W3C Nu das doze páginas terminou com zero erro. Os seis avisos iniciais das páginas legais foram eliminados trocando wrappers sem título de `section`/`article` por `div`, sem alteração visual ou editorial. A nova validação das páginas legais terminou com zero erro e zero aviso.

## Sitemap, robots.txt e llms.txt

### sitemap.xml

O sitemap contém exatamente as nove URLs indexáveis aprovadas, na origem `https://www.carolinebispo.com.br/`. Páginas legais, arquivos técnicos, drafts, `_site/` e rotas futuras não estão presentes.

### robots.txt

A política publicada corresponde ao texto aprovado:

```txt
User-agent: OAI-SearchBot
Allow: /

User-agent: GPTBot
Disallow: /

User-agent: *
Allow: /

Sitemap: https://www.carolinebispo.com.br/sitemap.xml
```

As páginas legais não estão bloqueadas no `robots.txt`; o controle permanece em `noindex, follow` no HTML.

### llms.txt

O arquivo respondeu HTTP 200 em texto e contém exatamente as oito páginas aprovadas: Home, Sobre, quatro serviços, Diagnóstico e Contato. O hub `/servicos/` não faz parte da lista adotada na Fase 3. Não há páginas legais, rotas futuras ou URLs inexistentes.

## Responsividade e navegação

As nove páginas principais foram abertas em produção em 27 combinações:

- desktop: 1440 × 900;
- tablet: 820 × 1180;
- mobile: 390 × 844.

Em todas as combinações houve exatamente um H1, nenhum overflow horizontal e nenhuma imagem visível quebrada. O cabeçalho desktop, o menu recolhido de tablet/mobile e a barra móvel alternaram nos breakpoints previstos. Menu, cards, CTAs, breadcrumbs, footer, links, formulário e agenda permaneceram utilizáveis. O menu mobile abriu com os links Serviços, Sobre, Diagnóstico e Contato.

O console do navegador terminou sem erros ou avisos durante a auditoria.

## Formulário e WhatsApp

O formulário do diagnóstico mantém o `POST` para o Apps Script aprovado. Foram confirmados como obrigatórios:

- nome;
- WhatsApp;
- Perfil da Empresa no Google;
- motivo do contato;
- consentimento.

Com os campos vazios, os controles permaneceram inválidos e exibiram mensagens nativas de preenchimento. Nenhum lead real foi enviado e nenhuma resposta de sucesso foi simulada. O código continua interrompendo o envio quando `reportValidity()` falha e só dispara a conversão de lead depois de uma resposta verificável do backend.

Os links de fallback do WhatsApp apontam para `wa.me/5511980569539` com a mensagem aprovada e foram apenas inspecionados; nenhuma conversa foi aberta ou enviada.

## Cal.com

Antes de aproximar a agenda do viewport, havia zero script e zero iframe do Cal.com. Após acionar “Prefiro agendar”:

- foi carregado um único `embed.js`;
- foi criado um único iframe;
- a agenda abriu corretamente em mobile;
- não houve overflow;
- `aria-busy` terminou em `false`;
- os parâmetros `utm_source=qa`, `utm_medium=production` e `utm_campaign=fase35` foram encaminhados ao iframe;
- o fallback permaneceu disponível no código, mas não precisou ser exibido.

Nenhum agendamento foi criado.

## Consentimento e Meta Pixel

Em uma sessão sem preferência registrada:

- antes da escolha: zero script do Meta Pixel;
- após recusar: banner oculto e zero script do Meta Pixel;
- o botão “Preferências de cookies” reabriu o painel;
- após aceitar: o script `fbevents.js` e a configuração do Pixel `2429202777490521` foram carregados;
- a preferência permaneceu entre navegações conforme a lógica atual;
- não foram encontrados scripts ou eventos duplicados no fluxo testado.

GA4 e GTM não foram adicionados.

## Performance básica

Verificações realizadas no domínio real:

| Recurso | Tamanho transferido | TTFB observado |
|---|---:|---:|
| Home HTML | 23.765 bytes | 0,234 s |
| CSS principal | 43.885 bytes | 0,208 s |
| JavaScript principal | 14.608 bytes | 0,172 s |
| Imagem AVIF 480 px | 24.548 bytes | 0,191 s |
| Imagem AVIF 800 px | 50.447 bytes | 0,045 s |
| Imagem AVIF 1200 px | 80.940 bytes | 0,193 s |

A imagem principal mantém `picture`, AVIF/WebP/JPEG, `srcset`, dimensões explícitas e carregamento responsivo. Não foi observado deslocamento visual relevante nas capturas dos três viewports. O Cal.com não participa do carregamento inicial e o Pixel permanece condicionado ao consentimento. Esta foi uma avaliação técnica básica, não uma medição laboratorial de Core Web Vitals.

## Problemas encontrados e correções realizadas

1. O GitHub Pages estava configurado para build legado a partir da raiz de `main`. A configuração foi corrigida para publicação por workflow e o domínio personalizado foi associado; um novo deploy confirmou o funcionamento.
2. O domínio canônico retornou 404 enquanto a configuração anterior e o cache do Pages ainda estavam ativos. Após a correção e o novo deploy, todas as URLs previstas passaram a responder 200.
3. O auditor de produção tinha uma expressão regular excessivamente escapada e exigia JSON-LD nas páginas legais, embora elas não façam parte do contrato de Schema. O script foi corrigido e ampliado para verificar metadados sociais, todos os tipos Schema esperados e os conjuntos exatos do sitemap e do `llms.txt`.
4. O W3C apontou wrappers sem heading nas três páginas legais. Os elementos foram ajustados sem mudança visual; o resultado final é zero erro e zero aviso.

## Google Search Console

Não foi possível confirmar nem criar propriedades pela conexão disponível:

- GSC Wizard: acesso bloqueado porque o trial terminou ou não há assinatura ativa;
- Ahrefs: consulta de projetos bloqueada por plano insuficiente;
- SE Ranking: nenhuma propriedade/projeto conectado foi retornado.

Nenhuma propriedade, sitemap ou inspeção foi criada silenciosamente. Um HTTP 200 confirma publicação e rastreabilidade técnica, mas não confirma descoberta, indexação ou exibição em resultados.

### Passos exatos para a proprietária

1. Entrar no Google Search Console com a conta Google que será proprietária.
2. Adicionar `carolinebispo.com.br` como propriedade do tipo **Domínio**.
3. Copiar o valor TXT fornecido pelo Google, no formato `google-site-verification=...`.
4. No provedor DNS, criar esse TXT no host raiz (`@`) sem remover os registros existentes.
5. Aguardar a propagação e clicar em **Verificar** no Search Console.
6. Adicionar `https://www.carolinebispo.com.br/` como propriedade complementar do tipo **Prefixo de URL**. A propriedade pode ser verificada automaticamente pela propriedade de domínio; se o Google pedir outro método, concluir a confirmação na mesma conta.
7. Na propriedade principal, enviar apenas `https://www.carolinebispo.com.br/sitemap.xml`.
8. Depois da conexão, inspecionar nesta ordem:
   1. Home;
   2. Perfil da Empresa no Google;
   3. SEO Local e Google Maps;
   4. Diagnóstico;
   5. Gestão de Tráfego Pago;
   6. Automação de Atendimento;
   7. Sobre;
   8. Serviços;
   9. Contato.

O estado de cada URL deverá ser relatado separando: publicada, rastreável, descoberta, indexada e exibida em resultados.

## DNS pendente

A consulta DNS identificou:

- domínio raiz: os quatro registros A do GitHub Pages estão corretos (`185.199.108.153`, `185.199.109.153`, `185.199.110.153` e `185.199.111.153`);
- `www`: o CNAME ainda aponta para o placeholder `seu-usuario.github.io`.

O site funciona neste momento porque o domínio foi associado ao repositório no GitHub Pages e o alvo atual também resolve para a infraestrutura do Pages. Mesmo assim, o registro deve ser corrigido no provedor DNS:

1. localizar o registro CNAME do host `www`;
2. substituir somente o destino `seu-usuario.github.io` por `estudosdecarolinebispo-art.github.io`;
3. manter o host como `www` e preservar os registros A do domínio raiz;
4. salvar e aguardar a propagação do TTL, observado em aproximadamente 3.600 segundos;
5. depois, conferir o domínio em **GitHub → repositório → Settings → Pages**.

Nenhuma alteração DNS foi executada nesta fase.

## Conclusão

### Validado em produção

- commits, push e workflows concluídos;
- GitHub Pages publicando pelo workflow aprovado;
- domínio canônico com HTTPS e redirecionamento do domínio raiz;
- nove páginas indexáveis, três páginas legais e três arquivos técnicos respondendo corretamente;
- canonical, barra final, SEO on-page, Open Graph, Twitter e indexabilidade;
- Schema.org e breadcrumbs conforme cada rota;
- sitemap com nove URLs e páginas legais fora dele;
- `robots.txt`, `llms.txt` e `rel="describedby"`;
- responsividade das nove páginas em desktop, tablet e mobile;
- formulário, validação nativa, consentimento e fallback de WhatsApp;
- Cal.com sob demanda, sem duplicação e com UTMs;
- consentimento e carregamento condicional do Meta Pixel;
- assets, imagens responsivas, console e avaliação técnica básica de performance;
- W3C sem erros e, após a correção, sem avisos.

### Pendente de configuração externa

- substituir o CNAME de `www` pelo destino correto da conta do GitHub;
- reativar/assinar uma conexão que permita operar o Search Console, ou realizar a configuração diretamente na conta Google;
- criar e verificar a propriedade de domínio `carolinebispo.com.br`;
- adicionar a propriedade complementar `https://www.carolinebispo.com.br/`;
- enviar o sitemap e executar a inspeção prioritária depois da verificação.

### Pendente para fases futuras

- Fase 4 continua bloqueada;
- resultados e estudos de caso;
- artigos, conteúdos, clusters e páginas por cidade;
- novas páginas de serviço;
- GA4 e GTM;
- mudanças de backend;
- avaliações ou resultados reais que ainda não tenham evidência verificável.
