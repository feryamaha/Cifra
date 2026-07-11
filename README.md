# Cifra Tom

Protótipo de site de cifras focado em violão. Stack: Next.js 16 (App Router), React 19, TypeScript estrito, Bun, Biome, Tailwind CSS 3.

## Como rodar

```bash
bun install
bun run dev          # http://localhost:3000
bun run test:engine  # validação dos motores musicais
bun run build        # build de produção
bun run lint         # Biome
```

## 1. Arquitetura de UI

A UI foi refatorada para seguir um design system próprio, com tokens agnósticos no `tailwind.config.ts` e responsividade via breakpoints customizados (`@tablet`, `@Desktop`).

- **Biblioteca de componentes (`src/components/ui/`):** Button, Badge, FloatingLabelInput, Modal, Tooltip, Spinner, Card, Select, Stepper, Toggle, SegmentedControl, ControlLabel.
- **Fontes via `next/font`:** Chakra Petch (display), Inter (texto), JetBrains Mono (acordes e dados).
- **Layout responsivo:** Header com menu hamburguer mobile, Footer, SongView com grid 60/40 (cifra / tabela de sequências), home com catálogo em grid responsivo.
- **Telas de música:**
  - Cifra em coluna vertical na esquerda (60% da largura).
  - Tabela de sequências de acordes na direita (40% da largura).
  - Controles (tom, capo, afinação, visualização, tamanho) dentro de um drawer lateral direito, acionado por ícone de sliders abaixo do título.

## 2. Funcionalidades de leitura

- **Badges de grau:** número fixo (C=1, D=2, E=3, F=4, G=5, A=6, B=7) sobre cada botão de tom, como referência visual para transposição.
- **Sequência de acordes:** tabela que detecta progressões repetidas na música e agrupa por seções, facilitando identificar padrões (ex: 4 acordes repetidos).
- **Notação de números da escala:** toggle que exibe acordes como graus (`F7` no tom de C vira `47`).
- **Cifra simplificada:** reduz acordes à tríade (`C7M9 -> C`, `Bm7(11) -> Bm`).
- **Afinações (10):** Padrão, ½ tom abaixo, 1 tom abaixo, Drop D, Drop C, DADGAD, Open G, Open D, Open E, Open A. Shapes recalculados dinamicamente.
- **Diagramas interativos:** hover/focus/touch em qualquer acorde da cifra abre popover com diagrama (dedos + barre).
- **Faixa de acordes:** strip lateral com todos os shapes únicos da música.
- **Mapa de afinação:** ao trocar afinação, visualiza cordas soltas (antes → depois) e o shape recalculado.

## 3. Matemática dos motores (`src/lib/music/`)

Representação canônica: `PitchClass = 0..11` com C = 0. Tudo é aritmética modular.

**Parser (`chords.ts`).** Um símbolo `F#m7(11)/A` vira `{ root: 'F#', suffix: 'm7(11)', bass: 'A' }`. O sufixo é texto imutável; transposição e conversão para números recalculam só raiz e baixo.

**Transposição (`transform.ts`).** `novoPc = (pc + n) mod 12`. A ortografia (F# vs Gb) é decidida pela armadura do tom de destino (`FLAT_KEY_PCS` em `notes.ts`).

**Letras para números (`transform.ts`).** Matriz intervalo para grau:

| semitons | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| grau (bemol) | 1 | b2 | 2 | b3 | 3 | 4 | b5 | 5 | b6 | 6 | b7 | 7 |
| grau (sustenido) | 1 | #1 | 2 | #2 | 3 | 4 | #4 | 5 | #5 | 6 | #6 | 7 |

`grau = MATRIZ[(pcAcorde - pcTom) mod 12]`, sufixo anexado sem alteração.

**Capotraste (`transform.ts`).** Capo no traste N sobe as cordas N semitons, então o shape desce N semitons para o som permanecer: `shape = transpose(acordeQueSoa, -N)`.

**Simplificação (`transform.ts`).** Reduz à tríade: maior, m, dim, aug.

## 4. Motor de shapes por afinação (`src/lib/music/voicing.ts`)

O shape é calculado, não consultado em dicionário:

1. O acorde vira um conjunto de pitch classes com notas obrigatórias (fundamental, terça, sétima quando houver) e opcionais (quinta, tensões).
2. A afinação é uma matriz de 6 pitch classes de cordas soltas (`tunings.ts`). Nota soada = `(cordaSolta + traste) mod 12`.
3. Para cada janela de 4 trastes, busca em profundidade combina soltas, trastes do acorde ou cordas mudas.
4. Cada combinação recebe pontuação de tocabilidade: cobrir obrigatórias pesa 30 por nota, baixo correto +12, cordas soltas e posições baixas somam, cordas mudas no meio e aberturas acima de 3 trastes penalizam.
5. O melhor shape vence e é memoizado por (afinação, acorde).

Validado por `bun run test:engine`: D maior gera `x-x-0-2-3-2` na padrão, `0-0-0-0-0-0` em Open D, shapes corretos em DADGAD, Open G e Drop D.

## 5. Modelo de dados (`src/types/song/`)

Os acordes ficam gravados sempre no tom original. Transposição, capo, simplificação e notação são 100% derivados no render, nada é mutado no dado. Isso torna o banco trivial.

Contratos principais:

- `Song`: metadados, `sections` e `map` (ordem de execução).
- `SongSection`: tag, nome, anotação e `lines`.
- `SongLine`: lista de `parts` com `{ chord, text }`, ancorando o acorde na sílaba.
- `SongViewModel`: estado derivado da tela de música (cifra renderizada, mapa, sequências, badges de grau, controle de transposição).

## 6. Publicidade

Anúncio existe em uma posição: rodapé. O componente `src/components/ads/AdSlot.tsx` é a única porta de entrada de publicidade, com a regra documentada no arquivo: nunca no header, nunca no topo, nunca entre seções da cifra.

## 7. Estrutura de pastas

```
public/                 assets estáticos
src/app/                rotas (home, /musica/[slug])
src/components/ads/     AdSlot
src/components/layout/  Header, Footer
src/components/song/    SongView, SongHeader, SectionCard, SongMap, SongControls, ChordSequencesPanel, ChordDiagram
src/components/ui/      biblioteca própria (Button, Badge, Modal, Tooltip, Spinner, etc.)
src/data/               músicas (JSON) e dados estáticos (afinações, controles)
src/hooks/              hooks de UI e de música (useSongView)
src/lib/music/          motores: notes, chords, transform, tunings, voicing
src/lib/utils.ts        cn = twMerge(clsx(...))
src/types/              contratos TypeScript
scripts/test-engine.ts  validação dos motores
```

## 8. Evolução premium (destaques)

- **Design tokens** só em `tailwind.config.ts` (root de estilo). `globals.css` = resets.
- **ChordHover**: diagrama no hover **em cima do acorde da cifra**; some ao tirar o mouse (portal fixed).
- **Controles** sem shape enterrado — só tom/capo/afinação + mapa de cordas.
- **ChordDiagram** redesenhado: dedos, barre, 3 tamanhos.
- **Adapter chords-db** pronto; skill em `.devin/skills/guitar-music-theory/`.
- **Fontes de dados** em `docs/DATA_SOURCES.md`.

## 9. Limitações conhecidas

1. O parser cobre o vocabulário usual de cifra popular (m, dim, aug, sus, 6, 7, 7M, 9, add9, 11, 13, b5, #5). Sufixos exóticos degradam com segurança para a tríade no motor de shapes, mas o texto exibido permanece exato.
2. O motor de shapes retorna 1 shape (o melhor pontuado). Retornar os top N é extensão direta da mesma busca.
3. Graus são calculados sobre a escala maior do tom. Tons menores usam o relativo maior por convenção.
4. Uma música de exemplo com letra original (sem letra de terceiros por direitos autorais).
5. O JSON do chords-db ainda não está vendored — o adapter está pronto; próximo passo é importar `guitar.json` (MIT).

## 10. Controle de versão

As pastas `.devin/` e `.claude/` são locais e não devem ser comitadas. O `.gitignore` já as exclui, assim como `.env`, `.next/`, `node_modules/` e outros artefatos de build.
