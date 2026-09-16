# Fase 3.6 — Integração do Google Analytics 4

Data da implementação e validação local: 16 de setembro de 2026, horário de Brasília.

Origem canônica: `https://www.carolinebispo.com.br/`

ID de medição: `G-N5H2J8S9GL`

## Escopo e estado da entrega

O Google Analytics 4 foi integrado localmente à arquitetura Eleventy existente, com configuração centralizada e consentimento básico por finalidade. A tag do Google não é carregada e nenhuma requisição do GA4 é enviada antes de uma autorização explícita para **Analytics**.

A implementação está apenas no diretório de trabalho. Não houve commit, push ou deploy. DNS, Search Console, Apps Script, backend, arquitetura editorial, páginas de serviço, textos comerciais, Schema.org, sitemap, `llms.txt` e identidade visual não foram alterados. Google Tag Manager não foi instalado e a Fase 4 não foi iniciada.

## Diagnóstico anterior à implementação

A revisão do projeto encontrou:

- um consentimento binário legado, salvo como `caroline_meta_consent_v1`, específico para a integração existente com a Meta;
- o Pixel da Meta carregado dinamicamente em `script.js` somente depois do aceite legado;
- `dataLayer` usado como fila interna para eventos de interação já existentes, sem Google tag, GA4 ou GTM instalado; como esse nome também é reservado pela tag do Google, a fila interna precisava ser separada antes da integração;
- nenhum `gtag.js`, ID `G-...`, contêiner `GTM-...` ou requisição do Google Analytics no HTML gerado;
- o `<head>` compartilhado em `src/_includes/partials/head.njk` e as integrações globais em `src/_data/site.js`, adequados para uma configuração única;
- nove páginas indexáveis que compartilham a mesma base Eleventy e três páginas legais não indexáveis.

O modelo binário não distinguia Analytics de marketing. Antes da alteração da interface, foi definido o ajuste adotado: categorias separadas para **Essenciais**, **Analytics** e **Marketing**, com ações para recusar opcionais, salvar escolhas granulares e aceitar todas. O aceite legado da Meta não é convertido em aceite do GA4.

## Implementação

### Configuração centralizada

O ID `G-N5H2J8S9GL` foi adicionado uma única vez aos dados globais do site. O `<head>` compartilhado emite nas nove páginas indexáveis uma metatag inerte com esse ID. Essa metatag não faz requisições; o JavaScript global a lê somente quando precisa iniciar o GA4 após consentimento.

O carregador dinâmico:

1. confirma que a preferência de Analytics é `true`;
2. impede uma segunda configuração com `window.__carolineGa4Configured`;
3. cria um único `script` assíncrono para `https://www.googletagmanager.com/gtag/js?id=G-N5H2J8S9GL`;
4. registra o estado padrão de consentimento como negado;
5. concede somente `analytics_storage`;
6. mantém `ad_storage`, `ad_user_data` e `ad_personalization` negados;
7. executa uma única configuração do ID com `send_page_view: true`;
8. desativa sinais do Google e personalização de anúncios nesta fase;
9. ativa `debug_mode` apenas em `localhost` e `127.0.0.1`.

Não há snippet repetido nos templates, GTM, `generate_lead` ou evento personalizado novo do GA4.

Os eventos internos de clique existentes agora usam `window.carolineDataLayer` e continuam emitindo o evento de navegador `caroline:conversion`. O `window.dataLayer` ficou reservado exclusivamente aos comandos oficiais do Google. Isso evita misturar cliques ocorridos antes do consentimento com a fila que o GA4 passa a processar depois de autorizado.

### Consentimento e preferências

As escolhas são salvas em `caroline_cookie_preferences_v2` com `version: 2` e dois valores independentes:

| Preferência | Tecnologia autorizada |
|---|---|
| `analytics` | Google Analytics 4 |
| `marketing` | Pixel da Meta |

Comportamentos confirmados:

- sem preferência válida, o painel é exibido e nenhuma tecnologia opcional é carregada;
- **Recusar opcionais** salva ambas as categorias como `false`;
- **Salvar preferências** respeita a combinação selecionada;
- **Aceitar todos** salva ambas como `true`;
- o botão **Preferências de cookies** no rodapé reabre o painel;
- uma categoria autorizada volta a carregar automaticamente em novas páginas;
- revogar uma categoria já carregada atualiza o consentimento e recarrega a página para remover os recursos opcionais daquela navegação;
- a navegação e o formulário continuam disponíveis quando as categorias opcionais são recusadas.

Migração conservadora do consentimento legado:

| Valor legado | Analytics | Marketing | Resultado |
|---|---:|---:|---|
| `accepted` | indefinido | autorizado | Meta preservada e nova decisão solicitada para Analytics |
| `rejected` | recusado | recusado | recusa preservada |
| ausente ou inválido | indefinido | indefinido | painel exibido |

O valor legado é removido somente quando a pessoa salva uma preferência no novo formato. Assim, uma autorização específica para anúncios nunca é inferida como autorização para Analytics.

### Privacidade

A implementação não lê nem envia ao GA4 nome, telefone, e-mail ou conteúdo dos campos do formulário. O GA4 recebe a mensuração básica fornecida pela tag oficial: visualização e identificação da página, origem/mídia, parâmetros UTM presentes na URL, informações técnicas de dispositivo e navegação.

A Política de Privacidade foi atualizada para explicar separadamente Analytics e marketing e para informar que os campos do formulário não são enviados por esta implementação ao GA4 ou ao Pixel da Meta.

A data de atualização da política foi ajustada para 16 de setembro de 2026. A descrição técnica corresponde ao comportamento implementado, mas a suficiência jurídica da política — incluindo bases legais, prazos de retenção e detalhamento dos fornecedores — depende de confirmação da proprietária ou de revisão jurídica profissional. Essa ressalva não altera o resultado dos testes técnicos.

As referências oficiais usadas foram:

- [Configurar o modo de consentimento em sites](https://developers.google.com/tag-platform/security/guides/consent);
- [Visão geral e modos básico e avançado de consentimento](https://developers.google.com/tag-platform/security/concepts/consent-mode);
- [Adicionar a tag do Google ao site](https://support.google.com/analytics/answer/9304153);
- [Eventos de visualização de página](https://developers.google.com/analytics/devguides/collection/ga4/views);
- [Evitar o envio de informações de identificação pessoal](https://support.google.com/analytics/answer/6366371);
- [Validar com o Tag Assistant](https://support.google.com/tagmanager/answer/10039345).

## Compatibilidade com o Meta Pixel

O carregador, o ID e os eventos existentes da Meta não foram alterados. A única mudança funcional foi vinculá-los à categoria **Marketing** em vez do antigo aceite binário.

Os testes confirmaram:

- Analytics autorizado e Marketing recusado: `gtag.js` presente, `fbevents.js` ausente;
- Marketing autorizado e Analytics recusado: `fbevents.js` e `PageView` da Meta presentes, GA4 ausente;
- ambas autorizadas: um carregador principal de cada integração;
- ambas recusadas: nenhuma integração opcional presente;
- os eventos de conversão existentes da Meta não foram renomeados, removidos ou ampliados.

O segundo script `connect.facebook.net/signals/config/...` observado depois de carregar o Pixel é criado pela própria biblioteca da Meta. Não representa uma segunda instalação manual do Pixel.

## Formulário e futura conversão `generate_lead`

O formulário continua usando o mesmo Apps Script, o mesmo `POST`, `FormData` e `mode: "no-cors"`. O frontend continua exibindo um aviso de encaminhamento, sem afirmar que houve gravação verificável. Nenhuma alteração foi feita no Apps Script ou no backend.

`generate_lead` não foi implementado. Quando existir uma resposta verificável do backend, o evento deverá ser emitido somente depois de todos estes critérios:

1. resposta HTTP legível e bem-sucedida;
2. JSON validado com `ok: true` e um identificador de submissão ou confirmação equivalente;
3. proteção contra emissão duplicada na mesma submissão;
4. consentimento de Analytics ainda autorizado;
5. parâmetros sem nome, telefone, e-mail, texto livre ou outro dado pessoal;
6. nenhuma emissão baseada apenas no clique, na validação dos campos ou na resolução de um `fetch` opaco.

Essa mudança exige uma fase própria e aprovação do contrato verificável do backend.

## Validação obrigatória

| Nº | Teste | Resultado local |
|---:|---|---|
| 1 | Build Eleventy | Aprovado. Quinze arquivos gerados e 26 copiados. |
| 2 | `pnpm run verify` | Aprovado: build, `html-validate` e validação estrutural. |
| 3 | ID correto | As nove páginas indexáveis contêm exatamente uma referência inerte a `G-N5H2J8S9GL`; as três legais não contêm a integração. |
| 4 | Ausência de duplicação | Um `gtag.js`, uma configuração e um `page_view` por carregamento. Nenhum ID `GTM-...`. |
| 5 | Nenhuma coleta antes do consentimento | Em origem limpa, painel visível, zero script/recurso de GA4 e zero recurso da Meta. |
| 6 | Respeito à recusa | Após recusar e após recarregar, GA4 e Meta permaneceram ausentes. |
| 7 | Carregamento após aceite | Analytics isolado carregou o `gtag.js` oficial e enviou um `page_view`; aceite total carregou GA4 e Meta. |
| 8 | Persistência e revisão | Escolha persistiu após recarga; painel reabriu com os valores corretos; revogação removeu o GA4 após recarga. |
| 9 | Uma visualização por carregamento | Inventário de rede encontrou exatamente uma requisição `en=page_view` para o ID correto em cada cenário medido. |
| 10 | Nove páginas | As nove rotas indexáveis carregaram uma tag e produziram exatamente um `page_view`, com o título correspondente. |
| 11 | Meta Pixel | Funcionou independentemente sob Marketing; o cenário somente Analytics não carregou a Meta. |
| 12 | Formulário | Destino e método preservados; cinco campos obrigatórios bloquearam o envio vazio; nenhum dado foi enviado no teste. |
| 13 | Cal.com | O acionamento sob demanda criou um `embed.js` e um iframe oficial, sem erro de console. O conteúdo remoto permaneceu em `Loading` no navegador isolado; não foi criado agendamento. |
| 14 | UTMs | `utm_source=codex_validation`, `utm_medium=qa` e `utm_campaign=fase_3_6` permaneceram no `document_location` do `page_view`; resolução e plataforma também foram observadas. |
| 15 | Erros de navegador | Zero erro ou aviso nas sessões local com aceite e recusa; o Tag Assistant mostrou `Console (0)`. |
| 16 | Layout e responsividade | Em 390 × 844, conteúdo sem overflow horizontal; painel e três ações ficaram integralmente dentro da área útil. |

O contrato estrutural também falha se encontrar `generate_lead`, ID `GTM-...`, Google tag estática antes do consentimento, ID ausente/duplicado, controles de preferência ausentes ou GA4 nas páginas legais.

## Evidência do Google Tag Assistant

O Tag Assistant oficial foi conectado ao site local e encontrou **uma** Google tag. A sessão mostrou:

- ID de destino `G-N5H2J8S9GL`;
- origem `gtag('config') na página`;
- eventos de consentimento-padrão, atualização de consentimento e configuração;
- uma saída “Visualização de página” para `G-N5H2J8S9GL`;
- estado padrão negado para as quatro categorias do Google;
- atualização de `analytics_storage` para concedido;
- `ad_storage`, `ad_user_data` e `ad_personalization` mantidos como negados;
- nenhum erro no console do Tag Assistant.

O detalhe também exibiu `GT-55B9QDSB`, o identificador da Google tag associada ao mesmo destino do GA4. O próprio Tag Assistant contou uma única tag encontrada; não há um segundo snippet instalado no projeto.

## O que ainda depende da publicação

A tela oficial do fluxo do GA4 ainda informava “Nenhum dado foi recebido nas últimas 48 horas” durante esta validação. Isso é esperado porque o código não foi publicado e não autoriza declarar coleta em produção. O Tag Assistant comprovou o carregamento e o `page_view` local, mas o relatório de Tempo real e o DebugView da propriedade não foram usados como prova de produção.

Depois de um deploy autorizado:

1. abrir `https://www.carolinebispo.com.br/` em uma sessão limpa;
2. antes da escolha, confirmar no Tag Assistant que a Google tag não foi carregada;
3. aceitar somente Analytics;
4. confirmar uma única tag `G-N5H2J8S9GL`, um único `page_view` e ausência da Meta;
5. no GA4, abrir **Relatórios → Tempo real** e confirmar a visita, a página e a origem;
6. para DebugView, iniciar uma sessão do Tag Assistant no domínio publicado e abrir **Administrador → Exibição de dados → DebugView**;
7. repetir com uma URL de teste que use UTMs não pessoais e confirmar origem, mídia e campanha;
8. recusar/revogar Analytics e confirmar que novos carregamentos não produzem requisições;
9. verificar as nove páginas e registrar horário, rota e resultado observado.

Parâmetros UTM nunca devem conter nome, e-mail, telefone ou outro identificador pessoal.

## Arquivos alterados nesta fase

- `src/_data/site.js`: ID global do GA4;
- `src/_includes/partials/head.njk`: referência inerte centralizada nas páginas indexáveis;
- `src/_includes/partials/cookie-consent.njk`: preferências separadas e controles do painel;
- `src/assets/js/script.js`: armazenamento versionado, Consent Mode, carregamento condicional e separação da Meta;
- `src/assets/css/style.css`: layout responsivo do painel de preferências;
- `src/_includes/content/politica-de-privacidade.njk`: transparência sobre GA4 e Meta;
- `scripts/validate-build.mjs`: contrato automatizado da integração;
- `docs/fase-3-6-google-analytics.md`: este relatório.

`docs/fase-3-5-publicacao-validacao.md` já estava modificado antes desta fase e não foi alterado pela implementação do GA4.

## Conclusão

### Comprovado localmente

- GA4 centralizado com o ID correto nas nove páginas indexáveis;
- modelo básico sem carregamento ou coleta antes do consentimento;
- consentimentos independentes para Analytics e Marketing;
- persistência, reabertura e revogação das preferências;
- um único `page_view` por carregamento nas nove rotas;
- UTMs e informações técnicas básicas presentes na requisição;
- integração oficial reconhecida pelo Tag Assistant;
- Meta Pixel preservado e condicionado somente a Marketing;
- formulário preservado e sem conversão falsa;
- build, validações, console e responsividade aprovados;
- ausência de GTM, `generate_lead`, dados pessoais novos e mudanças fora do escopo.
- separação entre a fila interna de interações e o `dataLayer` reservado ao Google.

### Pendente

- revisão da proprietária;
- commit, push e deploy, todos não autorizados nesta etapa;
- confirmação no Tempo real/DebugView e no domínio publicado depois do deploy;
- confirmação completa do conteúdo remoto do Cal.com em nova rodada pós-deploy, embora script e iframe tenham sido criados sem erros locais;
- futura especificação do backend verificável antes de qualquer `generate_lead`.

A Fase 4 permanece não iniciada.
