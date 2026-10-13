# Rocket Guild Ranking

Aplicação React + Vite para calcular automaticamente o ranking semanal da Guild Rocket a partir do JSON exportado pelo jogo.

## O que a aplicação faz

- Importa um arquivo `.json` no formato da guild.
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

## Configurar o Supabase

1. Crie um projeto no Supabase.
2. Execute [`supabase/schema.sql`](supabase/schema.sql) no SQL Editor do projeto.
3. Copie `.env.example` para `.env.local` e preencha a URL do projeto e a chave publishable/anon.
4. Configure as mesmas variáveis no ambiente de deploy e reinicie o Vite após alterar `.env.local`.

O app usa a tabela `guild_imports` com o registro fixo `latest`. O JSON importado fica disponível para leitura pública porque alimenta o ranking público. A sequência de teclado apenas oculta o botão na interface: como o site e a chave publishable são públicos, ela não é autenticação nem impede alguém de chamar a API diretamente. Para restringir gravações de verdade, proteja as gravações com Supabase Auth e políticas RLS para usuários autorizados, ou com um backend/Edge Function.

## Rodar localmente

Recomendado: Node.js 22.12+ (o Vite 8 exige uma versão moderna do Node).

```bash
npm install
npm run dev
```

Para validar a versão de produção:

```bash
npm run build
npm run preview
```

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
src/rules.js
```

Isso evita espalhar a regra de negócio pela interface e facilita futuras mudanças.
