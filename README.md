# PIC Verifica — aplicativo do consumidor

Aplicativo móvel da Plataforma de Inteligência de Combustíveis (PIC): busca de
postos e ficha com o que as fontes públicas registram, cada informação com
**data e fonte visíveis**.

Este repositório é o gate **G6-A** do produto PIC Verifica (consulta pública,
mapa e ficha). “Verificar abastecimento” e “Relatar ocorrência” são gates
posteriores e não aparecem no app. O portal web mantém a marca dele
(“Combustível em Dia”); os links compartilhados pelo app abrem o portal.

Feito com React Native (Expo 58, Expo Router, TypeScript).

> **O app é um canal de entrega, não uma extensão do banco.** Ele não tem regra
> de negócio própria: tudo o que mostra vem da API pública da plataforma. O que
> ainda não existe na API não é simulado no app — aparece como indisponível e
> está registrado no
> [backlog do app](https://github.com/joaopaulomirandamatias/plataforma-inteligencia-combustiveis-docs/blob/main/docs/backlog-app-mobile.md),
> no repositório de docs.

## Rodar

```bash
npm install
```

```bash
cp .env.example .env
```

```bash
npx expo start
```

O `.env` aponta para a API e para o portal de produção por padrão. Para usar
outro ambiente, troque `EXPO_PUBLIC_PIC_API_URL` e `EXPO_PUBLIC_PIC_SITE_URL`.

Instalar um pacote novo: use sempre `npx expo install <pacote>`, que resolve a
versão compatível com o SDK.

## Ver o app no navegador

```bash
npm run previa
```

```bash
npm run previa:amostra
```

O primeiro comando liga a prévia à API real; o segundo usa dados fictícios
(`scripts/amostra.mjs`) e mostra uma faixa “DADOS DE AMOSTRA” no topo. A prévia
abre em `http://localhost:8080`.

A prévia tem um servidor próprio (`scripts/previa-web.mjs`) porque a API
pública não aceita chamadas diretas de navegador: ele repassa `/_pic/*` para a
API, na mesma origem da página. Em Android e iOS o app fala com a API direto.

## Conferir antes de enviar

```bash
npx tsc --noEmit
```

```bash
npx expo lint
```

```bash
npx jest
```

```bash
npx expo export --platform web
```

A exportação web usa o mesmo código das telas nativas (react-native-web). É o
que permite abrir o app num navegador e conferir as telas sem aparelho.

## O que está implementado

| Tela | Rota | Operação da API |
|---|---|---|
| Boas-vindas | `/boas-vindas` | — |
| Início e busca | `/` | `GET /saude` |
| Resultados | `/postos?q=&uf=&municipio=` | `GET /v1/postos` |
| Ficha do posto (6 abas) | `/postos/{posto_id}?as_of=` | `GET /v1/postos/{id}` e `…/contexto-regional` |
| Perto de mim (lista e mapa) | `/mapa` | `GET /v1/postos/mapa` (modo raio) |
| Favoritos | `/favoritos` | — (guardado no aparelho) |
| Alertas | `/alertas` | — (depende de serviço ainda inexistente) |
| Conta e privacidade | `/conta` | — |
| Sobre os dados | `/sobre` | — |
| Canais oficiais | `/guia/canais?posto=` | — (lê a ficha já guardada) |
| Como ler um resultado | `/guia/qualidade` | — |

O app só chama operações marcadas `x-estado: implemented` no
[`openapi.yaml`](https://github.com/joaopaulomirandamatias/plataforma-inteligencia-combustiveis-docs/blob/main/docs/api/openapi.yaml).
A lista em `src/api/cliente.ts` é a allowlist.

A rota da ficha é a mesma do portal (`/postos/{posto_id}`), então o link
compartilhado abre no navegador de quem não tem o app.

## Como o código está organizado

```text
src/
  app/            telas (Expo Router: cada arquivo é uma rota)
  api/            tipos, borda (lista de permissão), cliente HTTP, hooks de consulta
  offline/        cache de consultas em disco e estado de rede
  armazenamento/  favoritos, consultas recentes e preferências (só no aparelho)
  ficha/          as seções da ficha do posto
  lib/            formatação, política de linguagem, mensagens, links
  tema/           tokens visuais (os mesmos do portal e do console de gestão)
  ui/             componentes de interface
  testes/         testes e respostas de amostra na forma do contrato
```

## Regras que o código faz valer

1. **Borda com lista de permissão** (`src/api/borda.ts`). A resposta da API é
   convertida campo a campo. `localizador`, hashes e ids de evidência são dado
   de auditoria e não atravessam para a tela **nem para o cache em disco**.
   Campo novo na API não aparece no app até ser incluído ali de propósito.
2. **Triestado sem coerção.** `conforme` é `true`, `false` ou `null`; qualquer
   outro valor é resposta fora do contrato. A classificação exibida deriva do
   triestado, não do texto recebido.
3. **Ausência nunca vira zero nem aprovação.** Preço ausente é “—”; ficha sem
   ensaio diz “sem resultado público vinculado”, com a explicação ao lado.
4. **Sem nota, ranking ou semáforo.** As listas não têm ordem por preço nem por
   resultado. A classificação de um ensaio usa rótulo e ícone, sem verde e
   vermelho, e vale para o ensaio — nunca para o posto.
5. **Política de linguagem** (`src/lib/politica.ts`). Espelho do
   [léxico bloqueado](https://github.com/joaopaulomirandamatias/plataforma-inteligencia-combustiveis-docs/blob/main/docs/agentes/lexico-bloqueado.json).
   Um teste varre toda a cópia e todo o código de tela; outro falha quando o
   espelho diverge da fonte.
6. **Localização só por ação do usuário.** A permissão é pedida ao tocar em
   “Usar minha localização”, a coordenada é arredondada a cerca de 1 km antes
   de ir à API e nunca é gravada.

## Movimento

O app tem pouca animação, e toda ela tem função (`src/ui/Movimento.tsx`):

- conteúdo que chega entra subindo 10 pt e aparecendo em 240 ms — listas entram
  em sequência e cada aba da ficha anuncia a troca assim;
- os blocos de carregamento pulsam enquanto a consulta não volta;
- a estrela do favorito cresce e volta quando é tocada;
- folhas inferiores sobem; telas deslizam com a transição padrão do sistema.

Com “reduzir movimento” ligado no aparelho, nada desliza nem pulsa: o conteúdo
simplesmente aparece.

## Funcionamento offline

- Toda resposta bem-sucedida da API fica guardada no aparelho por até 7 dias,
  já depois da borda. Ficha aberta uma vez abre de novo sem internet.
- Quando o que está na tela é uma cópia guardada (sem rede ou com a
  revalidação falhando), a ficha mostra a data em que a cópia foi salva.
- Favoritos, consultas recentes e preferências ficam só no aparelho. A tela
  Conta mostra o que está guardado e apaga tudo.
- A consulta de postos próximos é a única que não vai para o disco: a chave
  dela contém a coordenada do usuário.

## Mapa

A aba Perto tem lista e mapa (`react-native-maps`). O mapa existe só em Android
e iOS; no navegador a aba mostra a lista.

- **iOS:** usa o mapa do sistema, sem chave.
- **Android:** o SDK do Google fecha o app se o build não tiver chave. Por isso
  o modo mapa só aparece quando há chave em `app.json`
  (`android.config.googleMaps.apiKey`) ou dentro do Expo Go. A chave não está no
  repositório: precisa ser criada e configurada antes do build de Android.
- O marcador é igual para todos os postos. Cheio quer dizer posição publicada
  pela ANP; contorno tracejado, posição estimada pelo endereço.
- O mapa não mostra a posição exata do usuário: mostra o círculo do raio
  consultado, em volta do centro já arredondado.

O mapa foi conferido por teste do componente (com o SDK simulado) e pelo
empacotamento para iOS e Android. **Ainda não foi aberto num aparelho.**

## O que ainda não está aqui

Os testes que o consumidor pode pedir no posto e o
que conferir no local (dependem de conteúdo com referência jurídica revisada),
calculadora etanol × gasolina e as telas que dependem de backend novo (dados
declarados pelo posto, alertas, conta com sincronização). O detalhe e a ordem
estão no backlog do app, no repositório de docs.

A ficha abre em outra data pelo seletor no cabeçalho ou pelo parâmetro `as_of`
do link. Quem decide o que existia naquele instante é a API: o app só envia a
data e mostra o que voltar.

Os identificadores de loja (`ios.bundleIdentifier`, `android.package`) ainda não
estão definidos em `app.json`: precisam ser escolhidos antes do primeiro build
com EAS.
