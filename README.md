# Rocket Guild Ranking

Aplicação React + Vite + TypeScript para calcular automaticamente o ranking semanal da Guild Rocket a partir do JSON exportado pelo jogo.

## O que a aplicação faz

- Importa o `.json` mais recente da pasta de exports do PokeAlliance ou um arquivo escolhido manualmente.
- Calcula Rocket Points automaticamente.
- Mostra pódio visual com 1º, 2º e 3º lugares.
- Mostra tabela detalhada com dailies, contribuição, bônus e total.
- Exibe as regras e exemplos diretamente na página.
- Calcula a data do domingo da semana do arquivo importado e exibe o fechamento às 21h.
- Carrega o último JSON importado a partir do Supabase e salva cada nova importação.
- Mantém o controle de importação oculto até a sequência de teclado configurada no app.

## Fórmula

```txt
Rocket Points = (dailies consideradas / 3)
              + (contribuição considerada / 1000)
              + bônus cumulativos de checkpoints
```

### Tetos para a competição

- Máximo de 41 dailies consideradas.
- Máximo de 12.000 de contribuição considerada.

A pessoa pode contribuir acima de 12.000 e isso continua ajudando a guild, porém não aumenta os pontos do ranking semanal.

### Checkpoints cumulativos

| Requisito | Bônus |
| --- | ---: |
| 10 dailies + 3.000 contribuição | +1 RP |
| 20 dailies + 6.000 contribuição | +2 RP |
| 30 dailies + 9.000 contribuição | +3 RP |
| 40 dailies + 12.000 contribuição | +4 RP |

Quem chega ao último checkpoint recebe `1 + 2 + 3 + 4 = 10 RP` de bônus.

### Exemplo

40 dailies + 12.000 contribuição:

- Dailies: `40 / 3 = 13,33 RP`
- Contribuição: `12.000 / 1.000 = 12 RP`
- Checkpoints: `+10 RP`
- Total: `35,33 RP`

## Premiação

- 1º lugar: 20 diamonds
- 2º lugar: 15 diamonds
- 3º lugar: 10 diamonds
- Fechamento: domingo às 21h, horário de Brasília.
- Presença no boss das 21h é obrigatória para receber.
- Se o vencedor de uma colocação estiver ausente, o prêmio daquela posição acumula para a mesma colocação na semana seguinte.

Exemplo: 3º lugar ausente → 10D acumulam → na semana seguinte o 3º lugar vale 20D.

## Desempate

1. Maior Rocket Points.
2. Mais dailies.
3. Maior contribuição.
4. Ordem alfabética.

## Formato esperado do JSON

A aplicação ignora campos extras. Os três campos obrigatórios de cada membro são `name`, `dailiesCompleted` e `contribution`.

```json
{
  "guild": "Rocket",
  "exportedAt": "2026-10-09 15:25:50",
  "members": [
    {
      "name": "Jogador",
      "dailiesCompleted": 20,
      "contribution": 6000,
      "level": 350,
      "status": "online",
      "rank": "a Member"
    }
  ]
}
```

## Importar o export mais recente

O botão **Importar JSON mais recente** consulta um leitor local no computador de quem está fazendo o upload. O leitor resolve a variável de ambiente `APPDATA` do usuário Windows atual e procura os arquivos em:

```txt
%APPDATA%\PokeAlliance\PokeAllianceV3\exports
```

Isso suporta usuários, discos e perfis diferentes sem fixar um nome no código. Sem `APPDATA`, o leitor usa a pasta pessoal obtida do sistema operacional e acrescenta `AppData/Roaming`.

Para usar em qualquer computador Windows:

1. Tenha Node.js 22.13+ na linha 22, ou Node.js 24+.
2. No site, clique em **Baixar leitor local**. Extraia todo o conteúdo do ZIP.
3. Abra `start-local-exports.cmd` e mantenha a janela aberta.
4. Acesse https://rocket-guild-ranking.vercel.app, desbloqueie a importação e clique em **Importar JSON mais recente**.
5. Se o navegador solicitar, permita o acesso à rede local.

No checkout do projeto, também é possível iniciar o leitor com `npm run local:exports`. O ZIP em `public/rocket-export-helper.zip` contém somente o leitor, seu utilitário de seleção e as instruções; não exige instalar as dependências React nem configurar Supabase no computador do uploader.

A cada clique, o site captura `Date.now()`. O leitor consulta novamente os arquivos `.json` diretamente na pasta e escolhe aquele com a última modificação mais recente até esse instante. Arquivos futuros e subpastas são ignorados; em empate, o nome em ordem decrescente desempata. O arquivo é verificado durante a leitura para não importar um export alterado no meio da operação. JSON inválido continua passando pela validação original do app, sem recorrer silenciosamente a um export antigo.

O leitor atende somente em `127.0.0.1:47631`, não modifica os exports e aceita `https://rocket-guild-ranking.vercel.app` e localhost nas portas 5173/4173. Ele entrega somente nome, data e conteúdo do último arquivo. A validação, o ranking e a gravação no Supabase continuam no site. Outros domínios HTTPS podem ser configurados ao iniciar com `--origin https://seu-site.example`; nenhum caminho de arquivo é aceito pela API.

O leitor é necessário porque o navegador não pode resolver variáveis Windows nem ler silenciosamente os arquivos do usuário; o Chromium também bloqueia acesso persistente a `AppData` e suas subpastas. Consulte as [restrições de diretórios do Chromium](https://chromium.googlesource.com/chromium/src/+/refs/heads/main/chrome/browser/file_system_access/chrome_file_system_access_permission_context.cc) e o [acesso à rede local no Chrome](https://developer.chrome.com/blog/local-network-access). Caso o navegador não permita a conexão, **Escolher arquivo** mantém a importação manual existente.

Ao alterar o leitor, atualize também o ZIP distribuído, preservando a estrutura `scripts/local-exports` e `src/utils` para os imports relativos. A raiz do pacote deve conter o launcher, `package.json` com `type: module` e as instruções.

## Configurar o Supabase

1. Crie um projeto no Supabase.
2. Execute [`supabase/schema.sql`](supabase/schema.sql) no SQL Editor do projeto.
3. Copie `.env.example` para `.env.local` e preencha a URL do projeto e a chave publishable/anon.
4. Na Vercel, abra **Project Settings → Environment Variables** e cadastre `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` para Production (e Preview, se necessário).
5. Faça um novo deploy após salvar as variáveis. Variáveis `VITE_*` são incorporadas durante o build.

O app usa a tabela `guild_imports` com o registro fixo `latest`. O JSON importado fica disponível para leitura pública porque alimenta o ranking público. A sequência de teclado apenas oculta o botão na interface: como o site e a chave publishable são públicos, ela não é autenticação nem impede alguém de chamar a API diretamente. Para restringir gravações de verdade, proteja as gravações com Supabase Auth e políticas RLS para usuários autorizados, ou com um backend/Edge Function.

## Rodar localmente

Use Node.js 22.13+ na linha 22, ou Node.js 24+. A versão em `.nvmrc` atende aos requisitos do Vite e do ESLint.

```bash
npm install
npm run dev
```

Para validar a versão de produção:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run preview
```

## Estrutura da aplicação

- `src/main.tsx`: inicialização do React; `src/App.tsx`: estrutura raiz.
- `src/pages/RankingPage`: composição da página.
- `src/components/ranking`, `podium` e `admin`: interface de cada domínio.
- `src/components/ui`: componentes shadcn/ui instalados pelo CLI.
- `src/hooks`: estado da importação, ranking derivado e desbloqueio por teclado.
- `src/services/supabase`: leitura e gravação do último JSON.
- `src/services/localFiles`: conexão com o leitor local dos exports.
- `src/lib`: cliente Supabase e dados do exemplo.
- `src/utils`: cálculos, validação, datas e formatação.
- `src/types`: contratos dos dados da guild, ranking e esquema Supabase.

Tailwind está integrado ao Vite. O tema e os tratamentos visuais compartilhados ficam em `src/styles.css`; os componentes usam classes utilitárias. Novos componentes shadcn podem ser instalados com `npx shadcn@latest add <componente>`.

A identidade Rocket usa fundos preto/grafite, vermelho para ações e destaques, e ouro/prata/bronze no pódio. O logo fica em `src/assets/rocket-logo.jpg`. A fonte Inter é servida localmente em `src/assets/fonts`; o arquivo original vem do [projeto Inter](https://github.com/rsms/inter), e sua licença acompanha o asset em `Inter-LICENSE.txt`.

O comando `npm test` executa os testes existentes e os testes de regressão de checkpoints, tetos, desempates, JSON, datas, formatação e seleção do export mais recente. O desbloqueio por teclado continua sendo o controle de interface original; a refatoração não adiciona autenticação nem muda as políticas do Supabase.

O projeto usa TypeScript em modo estrito. `npm run typecheck` verifica a aplicação, os testes e as configurações sem gerar arquivos JavaScript; `npm run build` executa essa verificação antes do Vite. Os testes `.ts` usam o suporte nativo do Node com `--experimental-strip-types`, também compatível com a versão em `.nvmrc`. O shadcn está configurado para gerar componentes `.tsx`.

## Versionar com Git

```bash
git init
git add .
git commit -m "feat: ranking semanal Rocket"
git branch -M main
git remote add origin SEU_REPOSITORIO_GIT
git push -u origin main
```

Depois disso, cada alteração pode seguir o fluxo normal:

```bash
git add .
git commit -m "descrição da alteração"
git push
```

## Publicar na Vercel

A maneira mais simples é:

1. Subir este projeto para um repositório GitHub/GitLab/Bitbucket.
2. Na Vercel, criar um novo projeto e importar o repositório.
3. A Vercel deve reconhecer o framework como **Vite**.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Fazer o deploy.

Cada push para a branch principal pode gerar uma nova versão de produção, enquanto branches e pull requests podem ser usadas para versões de teste/preview.

## Onde mudar as regras

Todas as constantes principais ficam em:

```txt
src/utils/ranking.ts
```

Isso evita espalhar a regra de negócio pela interface e facilita futuras mudanças.
