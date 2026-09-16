# Fase 3.6 — Integração do Google Analytics 4

Data da implementação, publicação e validação: 16 de setembro de 2026, horário de Brasília.

Origem canônica: `https://www.carolinebispo.com.br/`

ID de medição: `G-N5H2J8S9GL`

## Escopo e estado da entrega

O Google Analytics 4 foi integrado à arquitetura Eleventy existente, com configuração centralizada e consentimento básico por finalidade. A tag do Google não é carregada e nenhuma requisição do GA4 é enviada antes de uma autorização explícita para **Analytics**.

A implementação foi publicada de forma controlada no domínio canônico e validada em produção. DNS, Search Console, Apps Script, backend, arquitetura editorial, páginas de serviço, textos comerciais, Schema.org, sitemap, `llms.txt` e identidade visual não foram alterados. Google Tag Manager não foi instalado e a Fase 4 não foi iniciada.

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

## Publicação controlada

### Commit, push e workflow

- commit de implementação: `3ba17e82b05bc1abf47ee4b2bbe79305133ffa18` — `Integra Google Analytics 4 com consentimento`;
- destino do push: `origin/main` no repositório `estudosdecarolinebispo-art/marketing-caroline-bispo`;
- workflow: [Build and deploy Eleventy to GitHub Pages — execução 35105404679](https://github.com/estudosdecarolinebispo-art/marketing-caroline-bispo/actions/runs/35105404679);
- job `build`: concluído com sucesso;
- job `deploy`: concluído com sucesso;
- commit implantado pelo workflow: `3ba17e82b05bc1abf47ee4b2bbe79305133ffa18`.

Antes do commit, `pnpm run verify`, o build Eleventy, a revisão do diff, `git diff --check` e a busca por padrões de credenciais foram aprovados. Nenhuma credencial foi encontrada. O arquivo `docs/fase-3-5-publicacao-validacao.md`, já modificado antes da Fase 3.6, foi preservado localmente e excluído do commit.

### Domínio e artefato publicado

- as nove páginas indexáveis responderam HTTP 200 em HTTPS;
- o HTML da home contém uma referência inerte a `G-N5H2J8S9GL` e nenhum carregador estático do Google;
- `script.js` contém o loader oficial, a preferência versionada e nenhuma ocorrência de `generate_lead` ou ID `GTM-...`;
- `/CNAME` continua servindo `www.carolinebispo.com.br`;
- o CNAME consultado no resolvedor público `1.1.1.1` continua apontando para `estudosdecarolinebispo-art.github.io`, com TTL de 3.600 segundos.

Nenhuma alteração foi feita no DNS ou nas configurações do Search Console.

## Validação em produção

### Consentimento

Em uma sessão limpa:

- o painel apareceu antes de qualquer escolha;
- havia zero recurso do Google Analytics e zero recurso do Pixel da Meta;
- **Recusar opcionais** manteve as duas integrações ausentes;
- somente Analytics carregou um `gtag.js`, enviou um `page_view` e não carregou a Meta;
- somente Marketing carregou um `fbevents.js` e um `PageView` da Meta, sem recurso do GA4;
- aceitar todas carregou um loader principal de cada integração e um `PageView` de cada fornecedor;
- reabrir o painel mostrou as escolhas corretas;
- recarregar preservou as escolhas;
- revogar Analytics ou Marketing recarregou a página e removeu os recursos da categoria revogada.

A lógica publicada preserva a migração conservadora: `accepted` legado mantém somente Marketing e deixa Analytics indefinido; `rejected` mantém ambas recusadas. O perfil antigo disponível no Chrome já continha uma escolha atual com ambas autorizadas, portanto o armazenamento não foi adulterado para fabricar um estado legado em produção.

### Nove páginas e parâmetros

Cada uma das nove páginas indexáveis carregou exatamente um `gtag.js` e enviou exatamente um `page_view` com título e `document_location` correspondentes:

| Rota | `page_view` | Duplicação |
|---|---:|---:|
| `/` | 1 | não |
| `/sobre/` | 1 | não |
| `/servicos/` | 1 | não |
| `/servicos/perfil-da-empresa-no-google/` | 1 | não |
| `/servicos/seo-local-google-maps/` | 1 | não |
| `/servicos/gestao-trafego-pago/` | 1 | não |
| `/servicos/automacao-atendimento-whatsapp/` | 1 | não |
| `/diagnostico-google-meu-negocio/` | 1 | não |
| `/contato/` | 1 | não |

A URL de teste usou somente valores não pessoais: `utm_source=codex_validation`, `utm_medium=qa` e `utm_campaign=fase_3_6_producao`. Os três valores permaneceram no `document_location` enviado ao GA4. O pedido também continha título, resolução e plataforma; não foram encontrados parâmetros com chaves de nome, e-mail, telefone, WhatsApp, formulário ou lead. A atribuição final de origem, mídia e campanha nos relatórios padrão ainda depende do processamento do GA4.

### Google Tag Assistant

O Tag Assistant oficial foi conectado ao domínio publicado com uma campanha de teste não pessoal. O resultado foi:

- uma Google tag encontrada;
- ID de destino `G-N5H2J8S9GL`;
- origem `gtag('config') na página`;
- um `page_view` por carregamento observado;
- `analytics_storage` alterado de negado para concedido;
- `ad_storage`, `ad_user_data` e `ad_personalization` mantidos negados;
- `Console (0)`;
- `GT-55B9QDSB` exibido como ID da mesma Google tag, não como segunda instalação.

A sessão exibiu dois `page_view` no total porque houve dois carregamentos separados — conexão inicial e recarga controlada —, com um evento em cada carregamento.

### Propriedade oficial do GA4

As evidências foram separadas por estágio:

| Estágio | Evidência |
|---|---|
| Tag instalada | Tag Assistant encontrou uma tag com destino `G-N5H2J8S9GL`. |
| Requisição enviada | Inventário de rede observou `g/collect` com `en=page_view` e o ID correto. |
| Evento recebido pela propriedade | O fluxo oficial mudou para “Recebendo tráfego nas últimas 48 horas”. |
| Sinal em relatório | A página inicial do GA4 mostrou 1 usuário ativo nos últimos 30 minutos, no Brasil. |

O relatório detalhado **Relatórios → Tempo real** e o DebugView não foram usados como evidência adicional. O GA4 apresentou antes da navegação um modal obrigatório de preferências de comunicações por e-mail, com quatro opções desmarcadas. Salvar ou alterar essas preferências depende da proprietária e não foi feito silenciosamente. O card de tempo real e o estado do fluxo já comprovam recebimento pela propriedade, mas páginas, eventos e campanha no relatório detalhado continuam pendentes de inspeção.

### Cal.com

Em produção:

- antes de aproximar a agenda do viewport: zero script e zero iframe;
- depois do acionamento sob demanda: um `embed.js` e um iframe;
- `aria-busy` terminou em `false`;
- o iframe exibiu mês, datas disponíveis e horários no desktop;
- os parâmetros `utm_source=codex_validation`, `utm_medium=qa` e `utm_campaign=fase_3_6_cal` foram preservados no iframe;
- em viewport de 390 × 844, a área útil ficou em 375 px, sem overflow horizontal; o iframe ficou dentro da largura e exibiu os controles do mês e as datas;
- nenhum agendamento foi criado;
- não houve erro ou aviso no console.

O estado `Loading` observado localmente não se repetiu em produção e não exigiu correção de código.

### Formulário

O destino Apps Script, o método `POST` e os cinco campos obrigatórios permaneceram inalterados. Um clique com os campos vazios focou `nome`, manteve cinco controles inválidos e não alterou a URL. Nenhum POST adicional foi feito. `generate_lead` continua ausente.

## Problemas e correções

1. A Política de Privacidade ainda mostrava a data de 4 de setembro. A data foi corrigida para 16 de setembro de 2026 antes do commit. A descrição técnica corresponde à implementação; a suficiência jurídica continua sujeita à confirmação da proprietária ou revisão profissional.
2. O primeiro inventário das nove páginas aguardou 4,5 segundos e terminou antes do envio agrupado pelo navegador. A medição foi repetida com 5,7 segundos, confirmando um `page_view` em cada rota.
3. O primeiro teste móvel do Cal.com ocorreu no navegador Chrome, cujo controle de viewport não alterou a janela existente. O teste foi repetido no navegador isolado com 390 × 844 e confirmou o layout móvel.
4. O acesso ao relatório detalhado do GA4 ficou bloqueado pelo modal de comunicações por e-mail. Nenhuma preferência foi salva ou alterada sem autorização.

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

### Comprovado em produção

- commit, push, build e deploy do código autorizado;
- domínio, HTTPS, CNAME e nove rotas preservados;
- GA4 centralizado com o ID correto nas nove páginas indexáveis;
- modelo básico sem carregamento ou coleta antes do consentimento;
- consentimentos independentes para Analytics e Marketing;
- recusa, aceite granular, aceite total, revisão, persistência e revogação;
- um `page_view` por carregamento nas nove rotas, sem instalação duplicada;
- UTMs presentes na requisição e ausência de parâmetros pessoais indevidos;
- Tag Assistant reconhecendo uma tag, o consentimento correto e os hits;
- fluxo GA4 recebendo tráfego e card de tempo real com um usuário ativo no Brasil;
- Meta Pixel preservado e condicionado somente a Marketing;
- Cal.com renderizado e utilizável em desktop e mobile, sob demanda e com UTMs;
- formulário preservado e sem conversão falsa;
- ausência de GTM, `generate_lead`, erros de console e mudanças fora do escopo.

### Pendente de validação

- decidir e salvar as preferências de comunicações por e-mail exigidas pelo GA4 para liberar a inspeção do relatório detalhado;
- depois disso, conferir no relatório detalhado de Tempo real ou DebugView os nomes dos eventos, páginas e campanha;
- aguardar o processamento dos relatórios padrão para confirmar a atribuição final de origem, mídia e campanha;
- confirmação da proprietária ou revisão profissional sobre a suficiência jurídica da Política de Privacidade.

### Reservado para fases futuras

- `generate_lead` somente depois de uma resposta verificável do backend;
- eventual mudança do Apps Script ou do backend;
- GTM e eventos personalizados adicionais;
- artigos, estudos de caso, novas páginas e demais itens da Fase 4.

Não há regressão crítica de consentimento, rastreamento básico ou agendamento. A Fase 3.6 está publicada e tecnicamente operacional, com as pendências de inspeção detalhada acima. A Fase 4 permanece não iniciada.
