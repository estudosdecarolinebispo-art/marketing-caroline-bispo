# Fase 2 — Migração Eleventy com paridade visual e funcional

Relatório de implementação e validação em 10 de setembro de 2026. A migração foi concluída somente no repositório local. Não houve commit, push, publicação no GitHub Pages, alteração de DNS, mudança em contas externas nem envio real do formulário.

O documento `docs/fase-1-fundacao-tecnica.md` permanece como registro oficial e não foi alterado nesta fase.

## Resultado

O site passou a usar Eleventy 3.1.6 como camada de geração e manutenção, mantendo HTML estático como artefato final. As quatro URLs existentes, o conteúdo, o design, os assets e as integrações aprovadas na Fase 1 foram preservados.

O build final foi aprovado por validação estrutural, `html-validate`, Nu HTML Checker do W3C, comparação semântica antes/depois e inspeção real em navegador desktop e mobile. A pasta publicada será exclusivamente `_site`.

## Estrutura implementada

```text
.
├── .github/
│   └── workflows/
│       └── pages.yml
├── docs/
│   ├── fase-1-fundacao-tecnica.md
│   └── fase-2-migracao-eleventy.md
├── scripts/
│   ├── compare-phase1.mjs
│   └── validate-build.mjs
├── src/
│   ├── _data/
│   │   ├── navigation.json
│   │   └── site.js
│   ├── _includes/
│   │   ├── components/
│   │   │   ├── cal-embed.njk
│   │   │   ├── lead-form.njk
│   │   │   └── profile-picture.njk
│   │   ├── content/
│   │   │   ├── exclusao-de-dados.njk
│   │   │   ├── home.njk
│   │   │   ├── politica-de-privacidade.njk
│   │   │   └── termos-de-servico.njk
│   │   ├── layouts/
│   │   │   └── base.njk
│   │   └── partials/
│   │       ├── cookie-consent.njk
│   │       ├── footer.njk
│   │       ├── head.njk
│   │       ├── header.njk
│   │       ├── mobile-actions.njk
│   │       └── schema.njk
│   ├── assets/
│   │   ├── css/
│   │   │   ├── legal.css
│   │   │   └── style.css
│   │   └── js/
│   │       └── script.js
│   ├── images/
│   │   └── [imagens originais e variantes responsivas aprovadas]
│   ├── static/
│   │   ├── .nojekyll
│   │   ├── CNAME
│   │   ├── site.webmanifest
│   │   └── [favicons e ícones]
│   ├── exclusao-de-dados.njk
│   ├── index.njk
│   ├── politica-de-privacidade.njk
│   ├── robots.njk
│   ├── sitemap.xml.njk
│   └── termos-de-servico.njk
├── .gitignore
├── .htmlvalidate.json
├── eleventy.config.js
├── package.json
└── pnpm-lock.yaml
```

`_site/` e `node_modules/` são gerados localmente e ignorados pelo Git.

## Função de cada parte

- `src/_data/site.js`: domínio canônico, identidade, contato, redes, URL exata do WhatsApp, endpoint existente do formulário, IDs das integrações e metadados da home.
- `src/_data/navigation.json`: navegação principal e links legais.
- `layouts/base.njk`: documento HTML comum, skip link, cabeçalho, conteúdo, rodapé, componentes exclusivos da home e JavaScript.
- `partials/head.njk`: title, description, robots, canonical, ícones, Open Graph, Twitter, CSS e inclusão do Schema.
- `partials/header.njk` e `partials/footer.njk`: estrutura compartilhada das quatro páginas, com variações controladas entre home e páginas legais.
- `partials/cookie-consent.njk`: banner e controles de consentimento aprovados na Fase 1.
- `partials/mobile-actions.njk`: barra de ações móvel com a correção semântica já aprovada.
- `partials/schema.njk`: grafo factual `Person`, `WebSite`, `WebPage` e `ImageObject`.
- `components/lead-form.njk`: formulário da Fase 1, sem alteração de endpoint, campos ou backend.
- `components/cal-embed.njk`: região acessível e fallback do Cal.com.
- `components/profile-picture.njk`: `picture`, AVIF/WebP/JPEG e `srcset` responsivo.
- `content/*.njk`: conteúdo editorial existente, separado da moldura compartilhada.
- arquivos `.njk` na raiz de `src`: definição de URL, metadata e composição de cada página.
- `robots.njk` e `sitemap.xml.njk`: geração a partir do domínio centralizado.
- `src/static`: arquivos copiados sem transformação para a raiz do artefato.
- `eleventy.config.js`: diretórios, passthrough de assets e exclusão de drafts e arquivos auxiliares.
- `scripts/validate-build.mjs`: contrato automatizado do artefato, URLs, integrações, SEO, Schema, assets e ausência de fontes/drafts.
- `scripts/compare-phase1.mjs`: comparação semântica entre uma linha de base e o build gerado.
- `.github/workflows/pages.yml`: build, validação e publicação preparada para GitHub Pages.

## Dependências e runtime

- Node.js: `>=24.8.0`; validação local executada com 24.19.0.
- pnpm: 11.19.0, fixado em `packageManager` e no workflow.
- `@11ty/eleventy`: 3.1.6.
- `html-validate`: 11.15.0.

As versões estão travadas no `pnpm-lock.yaml`. A versão do Eleventy e o requisito geral de runtime foram conferidos na [documentação oficial do Eleventy](https://www.11ty.dev/).

## Comandos

```bash
pnpm install --frozen-lockfile
pnpm run dev
pnpm run build
pnpm run validate
pnpm run verify
```

- `pnpm run dev`: servidor local com rebuild automático em `http://localhost:4173/`.
- `pnpm run build`: gera `_site`.
- `pnpm run validate`: executa validação HTML e contrato estrutural do build.
- `pnpm run verify`: gera e valida em uma única operação; é o comando usado no CI.

Comparação manual com uma cópia da versão anterior:

```bash
node scripts/compare-phase1.mjs <diretorio-da-linha-de-base> _site
```

## GitHub Pages

O workflow usa o fluxo oficial de artefato do GitHub Pages:

1. em pull requests, instala dependências, gera e valida sem publicar;
2. em push para `main` ou execução manual, repete build e validação;
3. configura Pages e envia somente `_site` como artefato;
4. o job de deploy usa o ambiente `github-pages` e permissões mínimas `pages: write` e `id-token: write`.

A configuração segue a [documentação oficial de workflows personalizados do GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). Antes do primeiro push autorizado, o repositório deve estar configurado para usar **GitHub Actions** como origem de publicação. Nenhuma configuração remota foi alterada nesta fase.

O `CNAME` é mantido em `src/static/CNAME`, copiado para `_site/CNAME` e verificado no build. Seu conteúdo continua exatamente `www.carolinebispo.com.br`.

## Arquivos migrados e substituídos

- `index.html` → `src/index.njk`, conteúdo da home e componentes.
- `politica-de-privacidade.html` → `src/politica-de-privacidade.njk` e conteúdo correspondente.
- `termos-de-servico.html` → `src/termos-de-servico.njk` e conteúdo correspondente.
- `exclusao-de-dados.html` → `src/exclusao-de-dados.njk` e conteúdo correspondente.
- `robots.txt` → `src/robots.njk`.
- `sitemap.xml` → `src/sitemap.xml.njk`.
- `style.css` e `legal.css` → `src/assets/css/`, sem alteração de bytes.
- `script.js` → `src/assets/js/`, sem alteração de bytes.
- `images/` → `src/images/`, preservando originais e nove variantes responsivas da Fase 1.
- `CNAME`, manifest e ícones → `src/static/`, copiados sem transformação.

Os HTMLs e arquivos técnicos antigos da raiz foram removidos porque agora são artefatos gerados. Isso evita duas fontes concorrentes para a mesma página.

## Paridade — checklist de aceite

| # | Critério | Resultado e evidência |
|---:|---|---|
| 1 | Mesmas URLs | Aprovado: `/`, `/politica-de-privacidade.html`, `/termos-de-servico.html` e `/exclusao-de-dados.html`; todas responderam HTTP 200 no preview. |
| 2 | Mesmo layout | Aprovado: CSS idêntico por SHA-256 e medidas desktop coincidentes. |
| 3 | Mesma hierarquia visual | Aprovado: sequência de headings e conteúdo comparada nas quatro páginas. |
| 4 | Mesmas funcionalidades | Aprovado: navegação, FAQ, CTAs, consentimento, formulário e agenda exercitados. |
| 5 | Mesmo formulário | Aprovado: action, POST, 12 campos, limites, autocomplete, honeypot e consentimento idênticos; `script.js` idêntico. |
| 6 | Mesmo Cal.com | Aprovado: carregamento sob demanda, uma instância, iframe, `aria-busy` e fallback preservados. |
| 7 | Mesmas UTMs | Aprovado: código de captura do formulário idêntico; iframe do Cal.com recebeu `utm_source`, `utm_medium` e `utm_campaign` no teste. |
| 8 | Mesmo Meta Pixel | Aprovado: ID `2429202777490521` e implementação idênticos; scripts externos carregaram após aceite. |
| 9 | Mesmo consentimento | Aprovado: recusa manteve formulário disponível e nova navegação sem scripts do Meta; aceite carregou o Pixel. |
| 10 | Mesmo mobile | Aprovado em 390 × 844: viewport útil 375 × 844, hero em uma coluna, nav desktop oculta, barra móvel em grid e botões com 48 px. |
| 11 | Mesmos links legais | Aprovado por comparação e navegação; as três páginas permanecem acessíveis. |
| 12 | Canonical correto | Aprovado nas quatro páginas, sempre em `https://www.carolinebispo.com.br`. |
| 13 | Sitemap correto | Aprovado: somente a home canônica; sem `lastmod`, `priority` ou `changefreq` inventados. |
| 14 | Robots correto | Aprovado: OAI-SearchBot permitido, GPTBot bloqueado, demais robôs permitidos e sitemap em `www`. |
| 15 | Schema válido | Aprovado: JSON válido e somente `Person`, `WebSite`, `WebPage` e `ImageObject`. |
| 16 | Sem novos erros HTML | Aprovado: zero erros nas quatro páginas no Nu HTML Checker e no `html-validate`. |
| 17 | Sem regressões ARIA | Aprovado: IDs, roles e atributos ARIA comparados; região da agenda e `nav` móvel preservados. |
| 18 | Sem overflow | Aprovado na home desktop/mobile e em página legal mobile. |
| 19 | Sem perda de imagens/assets | Aprovado por referências locais, lista obrigatória, passthrough e hashes. O `.gitkeep` preexistente é preservado na fonte, mas deliberadamente excluído do artefato. |
| 20 | CNAME preservado | Aprovado por conteúdo e SHA-256 idênticos. |

## Comparação antes/depois

A linha de base foi copiada antes da migração e comparada com `_site` após o build.

O comparador confirmou equivalência nas quatro páginas para:

- texto e headings;
- idioma, title, description, robots, canonical, Open Graph e Twitter;
- links e destinos;
- estrutura e atributos do formulário;
- imagens, `srcset`, dimensões, lazy loading e formatos;
- IDs, roles, `tabindex` e atributos ARIA;
- JSON-LD;
- scripts e folhas de estilo referenciados.

Os hashes SHA-256 de `style.css`, `legal.css`, `script.js`, `CNAME` e `site.webmanifest` são idênticos aos da versão aprovada na Fase 1.

Os HTMLs gerados têm entre 171 e 175 bytes adicionais por página. A diferença é apenas whitespace introduzido pelas quebras entre layout, partials e conteúdo Nunjucks; não houve diferença semântica, visual ou funcional. No modo `dev`, o Eleventy injeta seu cliente de live reload; esse script não existe no build estático usado pelo Pages.

## Validações executadas

- `pnpm run verify`: aprovado.
- `html-validate`: zero erros nas quatro páginas.
- Nu HTML Checker: zero erros na home e nas três páginas legais.
- Nu HTML Checker: zero avisos na home; dois avisos informativos preexistentes em cada página legal, relativos a `article` e `section` sem heading próprio. Eles foram mantidos para não reescrever a estrutura jurídica aprovada.
- `node --check`: aprovado para configuração, dados, JavaScript do site e scripts de validação.
- validação estrutural: 28 arquivos obrigatórios, quatro páginas, integrações, canônicas, Schema, robots, sitemap, CNAME e assets aprovados.
- verificação do artefato: nenhum template Nunjucks, Markdown, pasta de fontes, script de build, dependência, draft ou `.gitkeep` publicado.
- comparação semântica: aprovada nas quatro páginas.
- URLs locais: quatro respostas HTTP 200.
- desktop 1440 × 900: hero com as mesmas colunas calculadas (`712.328px 371.672px`), nav visível e sem overflow.
- mobile 390 × 844: métricas idênticas à linha de base e sem overflow.
- formulário vazio: envio bloqueado pelo navegador, foco em `nome`, nenhum status de sucesso e nenhum POST real.
- FAQ: abertura do primeiro item confirmada.
- Cal.com: ausente da carga inicial; um script e um iframe após aproximação; UTMs preservadas e `aria-busy="false"`.
- consentimento/Meta: recusa sem Pixel em nova navegação; aceite com carregamento dos scripts do Meta; formulário disponível nos dois estados.
- `git diff --check`: aprovado.

As regras `tel-non-breaking` e `prefer-native-element` do `html-validate` foram desativadas localmente porque exigiriam mudanças no telefone visível e na região de embed já aprovada. O validador oficial do W3C não reporta erro nesses pontos. `no-inline-style` também permanece desativada para não rejeitar detalhes visuais existentes. As demais regras recomendadas continuam ativas.

## Problemas encontrados e corrigidos

1. Na primeira geração, `encodeURIComponent` deixou o caractere `!` do texto do WhatsApp sem percent-encoding, enquanto a versão aprovada usava `%21`. A centralização foi ajustada para codificação estrita, e os links voltaram a ser byte a byte equivalentes em seu valor.
2. O instalador auxiliar do ambiente não encontrou `pnpm` pelo PATH. A instalação foi concluída com o binário pnpm fornecido pelo próprio runtime, na mesma versão fixada no projeto. Não há impacto no repositório ou no workflow.
3. O `.gitkeep` preexistente dentro de `images` seria copiado pelo passthrough de diretório. A configuração passou a copiar apenas arquivos de imagem não ocultos; o arquivo continua preservado na fonte e não entra em `_site`.

Nenhuma regressão visual, editorial, funcional, de URL, SEO técnico ou acessibilidade permaneceu após as correções.

## Itens deliberadamente não alterados

- textos comerciais e jurídicos;
- layout, identidade, paleta e tipografia;
- Apps Script, endpoint, backend e comportamento de confirmação do formulário;
- GA4, GTM, novos pixels ou novos eventos;
- URLs públicas e arquitetura editorial;
- DNS, domínio, Search Console ou configurações remotas;
- `llms.txt`;
- homepage institucional, `/sobre/`, `/servicos/`, páginas de serviço, `/contato/`, `/resultados/`, artigos, clusters, páginas geográficas e estudos de caso.

## Pendências e riscos

- A limitação do formulário descrita na Fase 1 permanece: com `mode: "no-cors"`, o cliente não consegue confirmar a gravação na planilha. A migração não modificou essa solução.
- Cal.com e Meta Pixel dependem de serviços externos; mudanças nesses provedores continuam sendo risco operacional fora do build.
- A primeira publicação exige que GitHub Pages esteja configurado para usar GitHub Actions. O workflow publicará automaticamente um push autorizado para `main`; portanto, esse push só deve ocorrer após revisão do diff.
- O domínio personalizado deve continuar configurado no repositório e no DNS. O build preserva o arquivo `CNAME`, mas não altera essas configurações externas.
- Atualizações futuras de dependências devem manter `pnpm-lock.yaml` e repetir `pnpm run verify` e o checklist visual.

## Recomendação antes da Fase 3

1. Revisar o diff completo da migração e executar `pnpm run verify` em um clone limpo ou em pull request.
2. Confirmar no repositório que Pages usa GitHub Actions e que o domínio personalizado continua registrado, sem publicar antes da autorização correspondente.
3. Após uma publicação autorizada, fazer uma checagem curta de produção das quatro URLs, CNAME, HTTPS, canonical, formulário sem POST real, consentimento e Cal.com.
4. Manter a auditoria do Apps Script como trabalho separado caso se deseje confirmação verificável do formulário.
5. Definir conteúdo, slugs e critérios de indexação da nova arquitetura antes de iniciar templates institucionais ou de serviços.

A Fase 3 continua bloqueada até nova autorização explícita.
