# AGENTS.md — Cifra Tom (harness do projeto)

> Documento canônico para qualquer agente (Grok, Devin, Claude, Cursor). Ler **por inteiro**
> antes de agir. Método de trabalho: **SDD (Specification-Driven Development)** adaptado do
> scaffold Nemesis; domínio de produto: cifras para violão.

---

## 1. O que é este projeto

Site de **cifras para violão** (Cifra Tom).  
Stack: **Next.js App Router, React, TypeScript, Tailwind, Biome, Bun**.  
UI em **pt-BR**. Cifra brasileira: `C`, `Dm`, `F7M`, `G/B`, `Bm7(b5)`.

---

## 2. Mapa do harness (onde mora cada coisa)

| Mecanismo | Paths | Para quê |
|-----------|--------|----------|
| **Project rules** | `AGENTS.md` (este) | Invariantes sempre ativas |
| **Rules** | `.grok/rules/*`, `.devin/rules/*` | Epistêmica, **escopo**, perfil do repo, music-domain |
| **Scope integrity** | `.grok/rules/scope-integrity.md`, `.devin/rules/scope-integrity.md` | **Nunca cortar/MVP-izar escopo sem ordem literal** |
| **Skills de PROCESSO (SDD)** | `.grok/skills/nemesis-*`, `.devin/skills/nemesis-*` | Spec → plano → execução → testes |
| **Skills de CONHECIMENTO musical** | `.grok/skills/guitar-music-theory/`, `guitar-music-data/` | Teoria, UX musical, fontes de dados |
| **Skill de seguranca** | `.grok/skills/cifra-security-scan/`, `.devin/skills/cifra-security-scan/` | Varredura estatica (agente como scanner) |
| **Regras de seguranca** | `.devin/rules/cifra-security-rules.md`, `.grok/rules/cifra-security-rules.md` | 22 regras destiladas do Semgrep |
| **Workflow security scan** | `.devin/workflows/security-scan-pipeline.md`, `.grok/workflows/security-scan-pipeline.md` | Pipeline de varredura de seguranca |
| **Workflows SDD** | `.grok/workflows/sdd-pipeline-*.md`, `.devin/workflows/nemesis-sdd-pipeline-*.md` | Pipeline manual/auto |
| **Specs / Plans / PRs** | `Feature-Documentation/{SPECS,PLANS,PR,ISSUE}/` | Artefatos versionados do SDD |
| **Trust Ledger** | `.devin/ledger/trust-ledger.md` | Gates e vereditos |
| **Design tokens** | `tailwind.config.ts` | Única fonte de cor/tipo/sombra |
| **globals.css** | Só resets | Nunca inventar paleta em `:root` |

Grok descobre skills em: `.grok/skills/`, `.agents/skills/`, `~/.grok/skills/`.  
Devin usa `.devin/`. **As duas árvores devem permanecer alinhadas no método.**  
Skills de desenvolvimento do usuário em `~/.grok/skills` / Devin global: **INTOCÁVEIS**.

### Separação crítica

1. **Skills de processo (SDD / Nemesis-method):** como trabalhar (spec, plano, gates).  
2. **Skills de conhecimento musical:** o que é verdade de domínio (acordes, afinação, fontes).  
3. **Skills de desenvolvimento do usuário:** não editar, não sobrescrever.

---

## 3. Invariantes (antes de QUALQUER ação)

1. **Não executar ações destrutivas ou irreversíveis** sem confirmação do humano.  
2. **Git de escrita é exclusivamente do humano.** Evidência com `git diff` / `git log` reais.  
3. **Prove, não suponha.** Distinguir evidência observada de inferência.  
4. **Disciplina epistêmica** (anti-bajulação): ver `.grok/rules/nemesis-epistemic-safety.md`.  
5. **Nunca código antes de design validado** em features não-triviais (pipeline SDD).  
6. **Tokens só em `tailwind.config.ts`.**  
7. **Anúncios:** footer / outdoor home — **nunca no meio da cifra**.  
8. **Shape de acorde:** tooltip no hover da cifra (`ChordHover`), não no drawer Controles.  
9. **Motores musicais** (`src/lib/music/*`): não quebrar; tom original no JSON; transform no render.  
10. **Fontes de dados:** sem Spotify, Chordonomicon, scrape Cifra Club no catálogo (`guitar-music-data`).  
11. **Dados em `src/data/` apenas** — proibida pasta `data/` na raiz.  
12. **Leitura pública anônima:** navegar e ver cifra **sem login**. Login só para enviar/moderar/status.
13. **Security scan sob demanda:** o workflow `security-scan-pipeline` e a skill `cifra-security-scan` so executam quando o Fernando solicita explicitamente. O agente nunca inicia a varredura por conta propria. O relatorio de cada varredura e gravado em `Feature-Documentation/SECURITY/`.
14. **INTEGRIDADE DE ESCOPO (lei dura — nunca violar):**  
    - **PROIBIDO** reduzir, “MVP-izar”, fatiar, repriorizar, mover para backlog ou reescrever o escopo de ISSUE / SPEC / PLAN / pedido do Fernando **sem autorização explícita e literal** dele.  
    - Spec **grande** ≠ permissão para cortar.  
    - Escopo grande → **to-do list completa** + **execução parcial** (tarefas 1..N nesta sessão), **sem alterar a SPEC**.  
    - “Ajuste se a spec estiver errada” = corrigir fato/path/contradição — **não** remover features.  
    - Autorização de corte só com frases literais do tipo: “reduza o escopo”, “só o grupo A”, “corte B3–B7”.  
    - Regra canônica: `.grok/rules/scope-integrity.md` e `.devin/rules/scope-integrity.md` (espelhos).  
    - **Incidente de referência:** reescrita não autorizada da SPEC_006 como MVP — nunca repetir.

---

## 4. Processo SDD (método harness)

Dois modos (ver workflows):

| Modo | Workflow | Comportamento |
|------|----------|----------------|
| **Manual (preferido para features grandes / UI)** | `.grok/workflows/sdd-pipeline-manual.md` | Para em cada skill; humano aprova |
| **Auto** | `.grok/workflows/sdd-pipeline-auto.md` | Gates automáticos; parada única no fim |

### Sequência (manual)

```
REQUEST → specification-design → critical-analysis (P1)
       → gravar SPEC → pre-writing-rule-control
       → writing-plans → critical-analysis (P2)
       → subagent-driven-development (tarefa a tarefa)
       → tests (typecheck, lint, test:engine/parsers, build)
       → doc-sync (se docs afetados)
       → finishing-branch (só com autorização)
       + VALIDACAO UI/UX HUMANA (browser) em features de interface
```

### Paths de artefatos

- Spec: `Feature-Documentation/SPECS/SPEC_NNN_nome.md`  
- Plan: `Feature-Documentation/PLANS/PLAN_NNN_nome.md`  
- Perfil de stack/comandos: `.devin/rules/nemesis-repo-profile.md` (Cifra Tom)

### Skills de processo (nomes legados `nemesis-*` = método, não o produto Nemesis)

| Skill | Função |
|-------|--------|
| `nemesis-specification-design` | Request → SPEC |
| `nemesis-critical-analysis` | Gate P1/P2 |
| `pre-writing-rule-control` | 6 regras do perfil |
| `nemesis-writing-plans` | SPEC → PLAN atômico |
| `nemesis-subagent-driven-development` | Executar PLAN |
| `nemesis-tests` | Validação |
| `nemesis-doc-sync` | Docs = código |
| `nemesis-finishing-branch` | Fechar / PR (humano decide git) |
| `cifra-security-scan` | Varredura de seguranca (agente le codigo, aplica regras) |

### Quando a tarefa é musical

Além do SDD, **ler e seguir**:

```
.grok/skills/guitar-music-theory/SKILL.md
.grok/skills/guitar-music-theory/references/*
.grok/skills/guitar-music-data/SKILL.md
.grok/rules/music-domain.md
```

---

## 5. UX musical obrigatória (cifra)

1. Hover no acorde da cifra → shape ao lado → some ao sair.  
2. Controles = tom, capo, afinação, notação, tamanho, auto-rolagem.  
3. Progressões de acordes = padrões repetidos (não lista crua).  
4. Componentes: `ChordHover.tsx`, `ChordDiagram.tsx`.

---

## 6. Comandos

```bash
bun install
bun run dev
bun run test:engine
bun run test:parsers
bun run lint
bun run typecheck
bun run build
```

---

## 7. Checklist de entrega

### Feature qualquer (SDD)

- [ ] SPEC em `Feature-Documentation/SPECS/` (se não-trivial)?  
- [ ] PLAN cobre **100%** dos REQUIREMENTS da SPEC (não um “MVP” inventado)?  
- [ ] Escopo da ISSUE/SPEC **não** foi reduzido sem ordem literal do Fernando?  
- [ ] To-do lista o escopo completo, mesmo se a sessão só executar parte?  
- [ ] Rule-control PASS no perfil Cifra?  
- [ ] `bun run typecheck` + `bun run lint` ok?  
- [ ] UI validada pelo humano no browser (quando houver UI)?  
- [ ] Não alterei skills de desenvolvimento do usuário?  
- [ ] Git write não foi feito pelo agente?

### Feature musical (extra)

- [ ] Consultei `guitar-music-theory` / `music-domain`?  
- [ ] Hover de shape correto?  
- [ ] Tokens só no Tailwind?  
- [ ] `bun run test:engine` ok se tocou motores?

---

## 8. Estado de produto relevante (baseline)

- Catálogo + parsers + admin **single-password** já existem.  
- Submissões em `src/data/store/submissions.json` (server file store).  
- `/adicionar` hoje grava local / fila sem conta de usuário final.  
- Auth de **usuário final** (email/OAuth) + versões de cifra + feedback de rejeição = feature planejada via SDD (não improvisar no código sem SPEC/PLAN).
