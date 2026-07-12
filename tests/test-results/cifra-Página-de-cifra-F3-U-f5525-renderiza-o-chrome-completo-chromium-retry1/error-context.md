# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cifra.spec.ts >> Página de cifra >> F3: URL direta da demo renderiza o chrome completo
- Location: tests/e2e/cifra.spec.ts:6:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: 'Auto-rolagem' })
Expected: visible
Error: strict mode violation: getByRole('button', { name: 'Auto-rolagem' }) resolved to 4 elements:
    1) <button type="button" aria-pressed="true" aria-label="Desligar auto-rolagem" class="rounded px-2 py-1 font-chakra text-xs transition-colors duration-fast focus-visible:outline-2 focus-visible:outline-primary-400 bg-primary-400 font-semibold text-secondary-950">Off</button> aka getByRole('button', { name: 'Desligar auto-rolagem' })
    2) <button type="button" aria-pressed="false" aria-label="Auto-rolagem Low" class="rounded px-2 py-1 font-chakra text-xs transition-colors duration-fast focus-visible:outline-2 focus-visible:outline-primary-400 text-neutral-700 hover:bg-secondary-800 hover:text-neutral-900">Low</button> aka getByRole('button', { name: 'Auto-rolagem Low' })
    3) <button type="button" aria-pressed="false" aria-label="Auto-rolagem Mid" class="rounded px-2 py-1 font-chakra text-xs transition-colors duration-fast focus-visible:outline-2 focus-visible:outline-primary-400 text-neutral-700 hover:bg-secondary-800 hover:text-neutral-900">Mid</button> aka getByRole('button', { name: 'Auto-rolagem Mid' })
    4) <button type="button" aria-pressed="false" aria-label="Auto-rolagem High" class="rounded px-2 py-1 font-chakra text-xs transition-colors duration-fast focus-visible:outline-2 focus-visible:outline-primary-400 text-neutral-700 hover:bg-secondary-800 hover:text-neutral-900">High</button> aka getByRole('button', { name: 'Auto-rolagem High' })

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for getByRole('button', { name: 'Auto-rolagem' })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "CifraTom" [ref=e4] [cursor=pointer]:
        - /url: /
        - generic [ref=e5]:
          - img [ref=e6]
          - generic [ref=e7]: CifraTom
      - button "Menu" [ref=e8] [cursor=pointer]:
        - img [ref=e9]
  - main [ref=e11]:
    - link "Mais de Cifra Tom Demo" [ref=e13] [cursor=pointer]:
      - /url: /artista/cifra-tom-demo
    - generic [ref=e14]:
      - generic [ref=e15]:
        - generic [ref=e16]:
          - paragraph [ref=e17]: Cifra Tom
          - heading "Estrada de Terra" [level=1] [ref=e18]
          - paragraph [ref=e19]: Cifra Tom Demo
          - generic [ref=e20]:
            - generic [ref=e21]: "Tom: C"
            - generic [ref=e22]: 4/4
            - generic [ref=e23]: Padrão (EADGBE)
            - generic [ref=e24]: "BPM: 72"
        - generic [ref=e25]:
          - button "Controles" [ref=e26] [cursor=pointer]:
            - img [ref=e27]
          - button "Imprimir" [ref=e31] [cursor=pointer]:
            - img [ref=e32]
          - button "Baixar" [ref=e37] [cursor=pointer]:
            - img [ref=e38]
          - button "Compartilhar" [ref=e41] [cursor=pointer]:
            - img [ref=e42]
          - group "Auto-rolagem da cifra" [ref=e48]:
            - generic [ref=e49]: Auto-rolagem da cifra
            - generic [ref=e50]: Auto-rolagem
            - generic [ref=e51]:
              - button "Desligar auto-rolagem" [pressed] [ref=e52] [cursor=pointer]: "Off"
              - button "Auto-rolagem Low" [ref=e53] [cursor=pointer]: Low
              - button "Auto-rolagem Mid" [ref=e54] [cursor=pointer]: Mid
              - button "Auto-rolagem High" [ref=e55] [cursor=pointer]: High
        - generic [ref=e56]:
          - generic [ref=e57]:
            - generic [ref=e58]:
              - generic [ref=e59]: I
              - heading "Introdução" [level=2] [ref=e60]
              - generic [ref=e61]: Violão dedilhado, só voz e cordas
            - generic [ref=e63]:
              - button "Acorde C7M. Passe o mouse para ver o shape." [ref=e66] [cursor=pointer]: C7M
              - button "Acorde G/B. Passe o mouse para ver o shape." [ref=e70] [cursor=pointer]: G/B
              - button "Acorde Am7. Passe o mouse para ver o shape." [ref=e74] [cursor=pointer]: Am7
              - button "Acorde F7M. Passe o mouse para ver o shape." [ref=e78] [cursor=pointer]: F7M
          - generic [ref=e80]:
            - generic [ref=e81]:
              - generic [ref=e82]: V1
              - heading "Verso 1" [level=2] [ref=e83]
            - generic [ref=e84]:
              - generic [ref=e85]:
                - generic [ref=e86]:
                  - button "Acorde C. Passe o mouse para ver o shape." [ref=e88] [cursor=pointer]: C
                  - generic [ref=e89]: Saí de casa
                - generic [ref=e90]:
                  - button "Acorde G/B. Passe o mouse para ver o shape." [ref=e92] [cursor=pointer]: G/B
                  - generic [ref=e93]: quando o sol nasceu
              - generic [ref=e94]:
                - generic [ref=e95]:
                  - button "Acorde Am. Passe o mouse para ver o shape." [ref=e97] [cursor=pointer]: Am
                  - generic [ref=e98]: Levei no bolso
                - generic [ref=e99]:
                  - button "Acorde Em7. Passe o mouse para ver o shape." [ref=e101] [cursor=pointer]: Em7
                  - generic [ref=e102]: um mapa que envelheceu
              - generic [ref=e103]:
                - generic [ref=e104]:
                  - button "Acorde F7M. Passe o mouse para ver o shape." [ref=e106] [cursor=pointer]: F7M
                  - generic [ref=e107]: A poeira sobe,
                - generic [ref=e108]:
                  - button "Acorde C/E. Passe o mouse para ver o shape." [ref=e110] [cursor=pointer]: C/E
                  - generic [ref=e111]: o vento leva
                - generic [ref=e112]:
                  - button "Acorde Dm7. Passe o mouse para ver o shape." [ref=e114] [cursor=pointer]: Dm7
                  - generic [ref=e115]: o meu chapéu
              - generic [ref=e116]:
                - generic [ref=e117]:
                  - button "Acorde G7. Passe o mouse para ver o shape." [ref=e119] [cursor=pointer]: G7
                  - generic [ref=e120]: E a estrada segue
                - generic [ref=e121]:
                  - button "Acorde G#dim. Passe o mouse para ver o shape." [ref=e123] [cursor=pointer]: G#dim
                  - generic [ref=e124]: riscando
                - generic [ref=e125]:
                  - button "Acorde Am. Passe o mouse para ver o shape." [ref=e127] [cursor=pointer]: Am
                  - generic [ref=e128]: o céu
          - generic [ref=e129]:
            - generic [ref=e130]:
              - generic [ref=e131]: Pr
              - heading "Pré-Refrão" [level=2] [ref=e132]
              - generic [ref=e133]: Entra percussão leve
            - generic [ref=e134]:
              - generic [ref=e135]:
                - generic [ref=e136]:
                  - button "Acorde Dm7. Passe o mouse para ver o shape." [ref=e138] [cursor=pointer]: Dm7
                  - generic [ref=e139]: Cada curva
                - generic [ref=e140]:
                  - button "Acorde Em7. Passe o mouse para ver o shape." [ref=e142] [cursor=pointer]: Em7
                  - generic [ref=e143]: é uma lição
              - generic [ref=e144]:
                - generic [ref=e145]:
                  - button "Acorde F7M. Passe o mouse para ver o shape." [ref=e147] [cursor=pointer]: F7M
                  - generic [ref=e148]: Cada pedra,
                - generic [ref=e149]:
                  - button "Acorde Gsus4. Passe o mouse para ver o shape." [ref=e151] [cursor=pointer]: Gsus4
                  - generic [ref=e152]: uma can
                - generic [ref=e153]:
                  - button "Acorde G. Passe o mouse para ver o shape." [ref=e155] [cursor=pointer]: G
                  - generic [ref=e156]: ção
          - generic [ref=e157]:
            - generic [ref=e158]:
              - generic [ref=e159]: R1
              - heading "Refrão 1" [level=2] [ref=e160]
              - generic [ref=e161]: Toda banda, dinâmica média
            - generic [ref=e162]:
              - generic [ref=e163]:
                - generic [ref=e164]:
                  - button "Acorde C7M9. Passe o mouse para ver o shape." [ref=e166] [cursor=pointer]: C7M9
                  - generic [ref=e167]: Estrada de terra,
                - generic [ref=e168]:
                  - button "Acorde Am7. Passe o mouse para ver o shape." [ref=e170] [cursor=pointer]: Am7
                  - generic [ref=e171]: me leva pra longe
              - generic [ref=e172]:
                - generic [ref=e173]:
                  - button "Acorde F7M. Passe o mouse para ver o shape." [ref=e175] [cursor=pointer]: F7M
                  - generic [ref=e176]: Onde o horizonte
                - generic [ref=e177]:
                  - button "Acorde G. Passe o mouse para ver o shape." [ref=e179] [cursor=pointer]: G
                  - generic [ref=e180]: não se esconde
              - generic [ref=e181]:
                - generic [ref=e182]:
                  - button "Acorde Em7. Passe o mouse para ver o shape." [ref=e184] [cursor=pointer]: Em7
                  - generic [ref=e185]: Debaixo da lona,
                - generic [ref=e186]:
                  - button "Acorde Am7. Passe o mouse para ver o shape." [ref=e188] [cursor=pointer]: Am7
                  - generic [ref=e189]: conto as estrelas
              - generic [ref=e190]:
                - generic [ref=e191]:
                  - button "Acorde Dm7. Passe o mouse para ver o shape." [ref=e193] [cursor=pointer]: Dm7
                  - generic [ref=e194]: E durmo sonhando
                - generic [ref=e195]:
                  - button "Acorde G7. Passe o mouse para ver o shape." [ref=e197] [cursor=pointer]: G7
                  - generic [ref=e198]: com todas
                - generic [ref=e199]:
                  - button "Acorde C. Passe o mouse para ver o shape." [ref=e201] [cursor=pointer]: C
                  - generic [ref=e202]: elas
          - generic [ref=e203]:
            - generic [ref=e204]:
              - generic [ref=e205]: V2
              - heading "Verso 2" [level=2] [ref=e206]
            - generic [ref=e207]:
              - generic [ref=e208]:
                - generic [ref=e209]:
                  - button "Acorde C. Passe o mouse para ver o shape." [ref=e211] [cursor=pointer]: C
                  - generic [ref=e212]: Parei num rancho
                - generic [ref=e213]:
                  - button "Acorde G/B. Passe o mouse para ver o shape." [ref=e215] [cursor=pointer]: G/B
                  - generic [ref=e216]: pra pedir um café
              - generic [ref=e217]:
                - generic [ref=e218]:
                  - button "Acorde Am. Passe o mouse para ver o shape." [ref=e220] [cursor=pointer]: Am
                  - generic [ref=e221]: Um velho contou
                - generic [ref=e222]:
                  - button "Acorde Em7. Passe o mouse para ver o shape." [ref=e224] [cursor=pointer]: Em7
                  - generic [ref=e225]: causos de fé
              - generic [ref=e226]:
                - generic [ref=e227]:
                  - button "Acorde F7M. Passe o mouse para ver o shape." [ref=e229] [cursor=pointer]: F7M
                  - generic [ref=e230]: Disse que a pressa
                - generic [ref=e231]:
                  - button "Acorde C/E. Passe o mouse para ver o shape." [ref=e233] [cursor=pointer]: C/E
                  - generic [ref=e234]: mata a viagem
              - generic [ref=e235]:
                - generic [ref=e236]:
                  - button "Acorde Dm7. Passe o mouse para ver o shape." [ref=e238] [cursor=pointer]: Dm7
                  - generic [ref=e239]: Que o destino é só
                - generic [ref=e240]:
                  - button "Acorde G7. Passe o mouse para ver o shape." [ref=e242] [cursor=pointer]: G7
                  - generic [ref=e243]: metade da paisa
                - generic [ref=e244]:
                  - button "Acorde C. Passe o mouse para ver o shape." [ref=e246] [cursor=pointer]: C
                  - generic [ref=e247]: gem
          - generic [ref=e248]:
            - generic [ref=e249]:
              - generic [ref=e250]: P
              - heading "Ponte" [level=2] [ref=e251]
              - generic [ref=e252]: Grande pausa, volta só o violão
            - generic [ref=e253]:
              - generic [ref=e254]:
                - generic [ref=e255]:
                  - button "Acorde Am7. Passe o mouse para ver o shape." [ref=e257] [cursor=pointer]: Am7
                  - generic [ref=e258]: E se a chuva vier,
                - generic [ref=e259]:
                  - button "Acorde Bm7(11). Passe o mouse para ver o shape." [ref=e261] [cursor=pointer]: Bm7(11)
                  - generic [ref=e262]: deixa molhar
              - generic [ref=e263]:
                - generic [ref=e264]:
                  - button "Acorde F7M. Passe o mouse para ver o shape." [ref=e266] [cursor=pointer]: F7M
                  - generic [ref=e267]: Barro no pé
                - generic [ref=e268]:
                  - button "Acorde Gsus4. Passe o mouse para ver o shape." [ref=e270] [cursor=pointer]: Gsus4
                  - generic [ref=e271]: também é lu
                - generic [ref=e272]:
                  - button "Acorde G. Passe o mouse para ver o shape." [ref=e274] [cursor=pointer]: G
                  - generic [ref=e275]: gar
          - generic [ref=e276]:
            - generic [ref=e277]:
              - generic [ref=e278]: R2
              - heading "Refrão 2" [level=2] [ref=e279]
              - generic [ref=e280]: Crescendo, ataque no último compasso
            - generic [ref=e281]:
              - generic [ref=e282]:
                - generic [ref=e283]:
                  - button "Acorde C7M9. Passe o mouse para ver o shape." [ref=e285] [cursor=pointer]: C7M9
                  - generic [ref=e286]: Estrada de terra,
                - generic [ref=e287]:
                  - button "Acorde Am7. Passe o mouse para ver o shape." [ref=e289] [cursor=pointer]: Am7
                  - generic [ref=e290]: me leva pra longe
              - generic [ref=e291]:
                - generic [ref=e292]:
                  - button "Acorde F7M. Passe o mouse para ver o shape." [ref=e294] [cursor=pointer]: F7M
                  - generic [ref=e295]: Onde o horizonte
                - generic [ref=e296]:
                  - button "Acorde G. Passe o mouse para ver o shape." [ref=e298] [cursor=pointer]: G
                  - generic [ref=e299]: não se esconde
              - generic [ref=e300]:
                - generic [ref=e301]:
                  - button "Acorde F7. Passe o mouse para ver o shape." [ref=e303] [cursor=pointer]: F7
                  - generic [ref=e304]: E quando eu chegar,
                - generic [ref=e305]:
                  - button "Acorde Em7. Passe o mouse para ver o shape." [ref=e307] [cursor=pointer]: Em7
                  - generic [ref=e308]: seja onde for
              - generic [ref=e309]:
                - generic [ref=e310]:
                  - button "Acorde Dm7. Passe o mouse para ver o shape." [ref=e312] [cursor=pointer]: Dm7
                  - generic [ref=e313]: A estrada que fica
                - generic [ref=e314]:
                  - button "Acorde G7. Passe o mouse para ver o shape." [ref=e316] [cursor=pointer]: G7
                  - generic [ref=e317]: é a que eu
                - generic [ref=e318]:
                  - button "Acorde C. Passe o mouse para ver o shape." [ref=e320] [cursor=pointer]: C
                  - generic [ref=e321]: vou
          - generic [ref=e322]:
            - generic [ref=e323]:
              - generic [ref=e324]: F
              - heading "Final" [level=2] [ref=e325]
              - generic [ref=e326]: Ritardando, termina no 17M
            - generic [ref=e328]:
              - button "Acorde F7M. Passe o mouse para ver o shape." [ref=e331] [cursor=pointer]: F7M
              - button "Acorde G/B. Passe o mouse para ver o shape." [ref=e335] [cursor=pointer]: G/B
              - button "Acorde C7M. Passe o mouse para ver o shape." [ref=e339] [cursor=pointer]: C7M
      - complementary [ref=e341]:
        - generic [ref=e342]:
          - generic [ref=e343]:
            - paragraph [ref=e344]: Progressões de acordes
            - paragraph [ref=e345]: Padrões que se repetem na música (ciclo harmônico por seção).
          - generic [ref=e346]:
            - generic [ref=e347]:
              - generic [ref=e348]: Progressão principal
              - generic [ref=e349]: I
            - generic [ref=e350]:
              - button "Acorde C7M. Passe o mouse para ver o shape." [ref=e352] [cursor=pointer]: C7M
              - button "Acorde G/B. Passe o mouse para ver o shape." [ref=e354] [cursor=pointer]: G/B
              - button "Acorde Am7. Passe o mouse para ver o shape." [ref=e356] [cursor=pointer]: Am7
              - button "Acorde F7M. Passe o mouse para ver o shape." [ref=e358] [cursor=pointer]: F7M
          - generic [ref=e359]:
            - generic [ref=e360]:
              - generic [ref=e361]: Progressão 2
              - generic [ref=e362]: V1
            - generic [ref=e363]:
              - button "Acorde C. Passe o mouse para ver o shape." [ref=e365] [cursor=pointer]: C
              - button "Acorde G/B. Passe o mouse para ver o shape." [ref=e367] [cursor=pointer]: G/B
              - button "Acorde Am. Passe o mouse para ver o shape." [ref=e369] [cursor=pointer]: Am
              - button "Acorde Em7. Passe o mouse para ver o shape." [ref=e371] [cursor=pointer]: Em7
              - button "Acorde F7M. Passe o mouse para ver o shape." [ref=e373] [cursor=pointer]: F7M
              - button "Acorde C/E. Passe o mouse para ver o shape." [ref=e375] [cursor=pointer]: C/E
              - button "Acorde Dm7. Passe o mouse para ver o shape." [ref=e377] [cursor=pointer]: Dm7
              - button "Acorde G7. Passe o mouse para ver o shape." [ref=e379] [cursor=pointer]: G7
              - button "Acorde G#dim. Passe o mouse para ver o shape." [ref=e381] [cursor=pointer]: G#dim
              - button "Acorde Am. Passe o mouse para ver o shape." [ref=e383] [cursor=pointer]: Am
          - generic [ref=e384]:
            - generic [ref=e385]:
              - generic [ref=e386]: Progressão 3
              - generic [ref=e387]: Pr
            - generic [ref=e388]:
              - button "Acorde Dm7. Passe o mouse para ver o shape." [ref=e390] [cursor=pointer]: Dm7
              - button "Acorde Em7. Passe o mouse para ver o shape." [ref=e392] [cursor=pointer]: Em7
              - button "Acorde F7M. Passe o mouse para ver o shape." [ref=e394] [cursor=pointer]: F7M
              - button "Acorde Gsus4. Passe o mouse para ver o shape." [ref=e396] [cursor=pointer]: Gsus4
              - button "Acorde G. Passe o mouse para ver o shape." [ref=e398] [cursor=pointer]: G
          - generic [ref=e399]:
            - generic [ref=e400]:
              - generic [ref=e401]: Progressão 4
              - generic [ref=e402]: R1
            - generic [ref=e403]:
              - button "Acorde C7M9. Passe o mouse para ver o shape." [ref=e405] [cursor=pointer]: C7M9
              - button "Acorde Am7. Passe o mouse para ver o shape." [ref=e407] [cursor=pointer]: Am7
              - button "Acorde F7M. Passe o mouse para ver o shape." [ref=e409] [cursor=pointer]: F7M
              - button "Acorde G. Passe o mouse para ver o shape." [ref=e411] [cursor=pointer]: G
              - button "Acorde Em7. Passe o mouse para ver o shape." [ref=e413] [cursor=pointer]: Em7
              - button "Acorde Am7. Passe o mouse para ver o shape." [ref=e415] [cursor=pointer]: Am7
              - button "Acorde Dm7. Passe o mouse para ver o shape." [ref=e417] [cursor=pointer]: Dm7
              - button "Acorde G7. Passe o mouse para ver o shape." [ref=e419] [cursor=pointer]: G7
              - button "Acorde C. Passe o mouse para ver o shape." [ref=e421] [cursor=pointer]: C
          - generic [ref=e422]:
            - generic [ref=e423]:
              - generic [ref=e424]: Progressão 5
              - generic [ref=e425]: V2
            - generic [ref=e426]:
              - button "Acorde C. Passe o mouse para ver o shape." [ref=e428] [cursor=pointer]: C
              - button "Acorde G/B. Passe o mouse para ver o shape." [ref=e430] [cursor=pointer]: G/B
              - button "Acorde Am. Passe o mouse para ver o shape." [ref=e432] [cursor=pointer]: Am
              - button "Acorde Em7. Passe o mouse para ver o shape." [ref=e434] [cursor=pointer]: Em7
              - button "Acorde F7M. Passe o mouse para ver o shape." [ref=e436] [cursor=pointer]: F7M
              - button "Acorde C/E. Passe o mouse para ver o shape." [ref=e438] [cursor=pointer]: C/E
              - button "Acorde Dm7. Passe o mouse para ver o shape." [ref=e440] [cursor=pointer]: Dm7
              - button "Acorde G7. Passe o mouse para ver o shape." [ref=e442] [cursor=pointer]: G7
              - button "Acorde C. Passe o mouse para ver o shape." [ref=e444] [cursor=pointer]: C
          - generic [ref=e445]:
            - generic [ref=e446]:
              - generic [ref=e447]: Progressão 6
              - generic [ref=e448]: P
            - generic [ref=e449]:
              - button "Acorde Am7. Passe o mouse para ver o shape." [ref=e451] [cursor=pointer]: Am7
              - button "Acorde Bm7(11). Passe o mouse para ver o shape." [ref=e453] [cursor=pointer]: Bm7(11)
              - button "Acorde F7M. Passe o mouse para ver o shape." [ref=e455] [cursor=pointer]: F7M
              - button "Acorde Gsus4. Passe o mouse para ver o shape." [ref=e457] [cursor=pointer]: Gsus4
              - button "Acorde G. Passe o mouse para ver o shape." [ref=e459] [cursor=pointer]: G
          - generic [ref=e460]:
            - generic [ref=e461]:
              - generic [ref=e462]: Progressão 7
              - generic [ref=e463]: R2
            - generic [ref=e464]:
              - button "Acorde C7M9. Passe o mouse para ver o shape." [ref=e466] [cursor=pointer]: C7M9
              - button "Acorde Am7. Passe o mouse para ver o shape." [ref=e468] [cursor=pointer]: Am7
              - button "Acorde F7M. Passe o mouse para ver o shape." [ref=e470] [cursor=pointer]: F7M
              - button "Acorde G. Passe o mouse para ver o shape." [ref=e472] [cursor=pointer]: G
              - button "Acorde F7. Passe o mouse para ver o shape." [ref=e474] [cursor=pointer]: F7
              - button "Acorde Em7. Passe o mouse para ver o shape." [ref=e476] [cursor=pointer]: Em7
              - button "Acorde Dm7. Passe o mouse para ver o shape." [ref=e478] [cursor=pointer]: Dm7
              - button "Acorde G7. Passe o mouse para ver o shape." [ref=e480] [cursor=pointer]: G7
              - button "Acorde C. Passe o mouse para ver o shape." [ref=e482] [cursor=pointer]: C
          - generic [ref=e483]:
            - generic [ref=e484]:
              - generic [ref=e485]: Progressão 8
              - generic [ref=e486]: F
            - generic [ref=e487]:
              - button "Acorde F7M. Passe o mouse para ver o shape." [ref=e489] [cursor=pointer]: F7M
              - button "Acorde G/B. Passe o mouse para ver o shape." [ref=e491] [cursor=pointer]: G/B
              - button "Acorde C7M. Passe o mouse para ver o shape." [ref=e493] [cursor=pointer]: C7M
    - generic [ref=e495]:
      - heading "Comentários" [level=2] [ref=e496]
      - paragraph [ref=e497]: Entre para comentar.
      - list
  - contentinfo [ref=e498]:
    - generic [ref=e499]:
      - generic [ref=e500]: Espaço publicitário (rodapé)
      - generic [ref=e501]:
        - complementary "Publicidade" [ref=e502]:
          - generic [ref=e503]:
            - paragraph [ref=e504]: Publicidade
            - paragraph [ref=e505]: 1/5
          - region "Anúncios de parceiros" [ref=e506]:
            - 'link "Coluna 1 · Slide 1: Cifra Tom, cifras sem interrupção. (abre em nova aba)" [ref=e507] [cursor=pointer]':
              - /url: /
              - paragraph [ref=e511]: "Coluna 1 · Slide 1: Cifra Tom, cifras sem interrupção."
            - tablist "Escolher anúncio" [ref=e512]:
              - 'tab "Anúncio 1: Coluna 1 · Slide 1: Cifra Tom, cifras sem interrupção." [selected] [ref=e513] [cursor=pointer]'
              - 'tab "Anúncio 2: Coluna 1 · Slide 2: espaço para parceiro." [ref=e514] [cursor=pointer]'
              - 'tab "Anúncio 3: Coluna 1 · Slide 3: anuncie no rodapé." [ref=e515] [cursor=pointer]'
              - 'tab "Anúncio 4: Coluna 1 · Slide 4: outdoor digital." [ref=e516] [cursor=pointer]'
              - 'tab "Anúncio 5: Coluna 1 · Slide 5: troque imagem, texto e link no JSON." [ref=e517] [cursor=pointer]'
          - paragraph [ref=e519]: © Cifra Tom · Parceiros
        - complementary "Publicidade" [ref=e520]:
          - generic [ref=e521]:
            - paragraph [ref=e522]: Publicidade
            - paragraph [ref=e523]: 1/5
          - region "Anúncios de parceiros" [ref=e524]:
            - 'link "Coluna 2 · Slide 1: alcance músicos que tocam de verdade. (abre em nova aba)" [ref=e525] [cursor=pointer]':
              - /url: /
              - paragraph [ref=e529]: "Coluna 2 · Slide 1: alcance músicos que tocam de verdade."
            - tablist "Escolher anúncio" [ref=e530]:
              - 'tab "Anúncio 1: Coluna 2 · Slide 1: alcance músicos que tocam de verdade." [selected] [ref=e531] [cursor=pointer]'
              - 'tab "Anúncio 2: Coluna 2 · Slide 2: espaço para parceiro." [ref=e532] [cursor=pointer]'
              - 'tab "Anúncio 3: Coluna 2 · Slide 3: anuncie no rodapé." [ref=e533] [cursor=pointer]'
              - 'tab "Anúncio 4: Coluna 2 · Slide 4: outdoor digital." [ref=e534] [cursor=pointer]'
              - 'tab "Anúncio 5: Coluna 2 · Slide 5: troque imagem, texto e link no JSON." [ref=e535] [cursor=pointer]'
          - paragraph [ref=e537]: © Cifra Tom · Parceiros
        - complementary "Publicidade" [ref=e538]:
          - generic [ref=e539]:
            - paragraph [ref=e540]: Publicidade
            - paragraph [ref=e541]: 1/5
          - region "Anúncios de parceiros" [ref=e542]:
            - 'link "Coluna 3 · Slide 1: marketing para lojas e marcas. (abre em nova aba)" [ref=e543] [cursor=pointer]':
              - /url: /
              - paragraph [ref=e547]: "Coluna 3 · Slide 1: marketing para lojas e marcas."
            - tablist "Escolher anúncio" [ref=e548]:
              - 'tab "Anúncio 1: Coluna 3 · Slide 1: marketing para lojas e marcas." [selected] [ref=e549] [cursor=pointer]'
              - 'tab "Anúncio 2: Coluna 3 · Slide 2: espaço para parceiro." [ref=e550] [cursor=pointer]'
              - 'tab "Anúncio 3: Coluna 3 · Slide 3: anuncie no rodapé." [ref=e551] [cursor=pointer]'
              - 'tab "Anúncio 4: Coluna 3 · Slide 4: outdoor digital." [ref=e552] [cursor=pointer]'
              - 'tab "Anúncio 5: Coluna 3 · Slide 5: troque imagem, texto e link no JSON." [ref=e553] [cursor=pointer]'
          - paragraph [ref=e555]: © Cifra Tom · Parceiros
      - generic [ref=e556]:
        - generic [ref=e557]:
          - paragraph [ref=e558]: Músicas
          - list [ref=e559]:
            - listitem [ref=e560]:
              - link "Catálogo" [ref=e561] [cursor=pointer]:
                - /url: /
            - listitem [ref=e562]:
              - link "Histórico" [ref=e563] [cursor=pointer]:
                - /url: /historico
            - listitem [ref=e564]:
              - link "Enviar cifra" [ref=e565] [cursor=pointer]:
                - /url: /adicionar
        - generic [ref=e566]:
          - paragraph [ref=e567]: Ferramentas
          - list [ref=e568]:
            - listitem [ref=e569]:
              - link "Dicionário de acordes" [ref=e570] [cursor=pointer]:
                - /url: /acordes
            - listitem [ref=e571]:
              - link "Metrônomo" [ref=e572] [cursor=pointer]:
                - /url: /metronomo
            - listitem [ref=e573]:
              - link "Afinador" [ref=e574] [cursor=pointer]:
                - /url: /afinador
        - generic [ref=e575]:
          - paragraph [ref=e576]: Comunidade
          - list [ref=e577]:
            - listitem [ref=e578]:
              - link "Entrar" [ref=e579] [cursor=pointer]:
                - /url: /entrar
            - listitem [ref=e580]:
              - link "Cadastrar" [ref=e581] [cursor=pointer]:
                - /url: /cadastrar
            - listitem [ref=e582]:
              - link "Meus envios" [ref=e583] [cursor=pointer]:
                - /url: /conta/envios
            - listitem [ref=e584]:
              - link "Favoritos" [ref=e585] [cursor=pointer]:
                - /url: /conta/favoritos
        - generic [ref=e586]:
          - paragraph [ref=e587]: Sobre
          - list [ref=e588]:
            - listitem [ref=e589]:
              - link "FAQ" [ref=e590] [cursor=pointer]:
                - /url: /faq
            - listitem [ref=e591]:
              - link "Privacidade" [ref=e592] [cursor=pointer]:
                - /url: /privacidade
            - listitem [ref=e593]:
              - link "Termos de uso" [ref=e594] [cursor=pointer]:
                - /url: /termos
            - listitem [ref=e595]:
              - link "Premium" [ref=e596] [cursor=pointer]:
                - /url: /premium
        - generic [ref=e597]:
          - paragraph [ref=e598]: Social
          - list [ref=e599]:
            - listitem [ref=e600]:
              - link "YouTube" [ref=e601] [cursor=pointer]:
                - /url: https://youtube.com
            - listitem [ref=e602]:
              - link "Instagram" [ref=e603] [cursor=pointer]:
                - /url: https://instagram.com
            - listitem [ref=e604]:
              - link "X" [ref=e605] [cursor=pointer]:
                - /url: https://x.com
      - generic [ref=e606]:
        - paragraph [ref=e607]: © 2026 Cifra Tom. Todos os direitos reservados. Cifras 100% focadas em violão, sem anúncio no meio da música.
        - paragraph [ref=e608]:
          - link "Termos de Uso" [ref=e609] [cursor=pointer]:
            - /url: /termos
          - link "Privacidade" [ref=e610] [cursor=pointer]:
            - /url: /privacidade
          - generic [ref=e611]: v0.2.0
  - button "Open Next.js Dev Tools" [ref=e617] [cursor=pointer]:
    - img [ref=e618]
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | 
  3  | /** F3: demo URL direta; F4: cifra do Neon; F5: hover de shape; F16: deep-link. */
  4  | 
  5  | test.describe('Página de cifra', () => {
  6  |   test('F3: URL direta da demo renderiza o chrome completo', async ({ page }) => {
  7  |     await page.goto('/musica/estrada-de-terra');
  8  | 
  9  |     await expect(page.getByRole('heading', { level: 1 })).toHaveText('Estrada de Terra');
  10 |     await expect(page.getByText('Tom: C').first()).toBeVisible();
  11 | 
  12 |     for (const nome of ['Controles', 'Imprimir', 'Baixar', 'Compartilhar', 'Auto-rolagem']) {
> 13 |       await expect(page.getByRole('button', { name: nome })).toBeVisible();
     |                                                              ^ Error: expect(locator).toBeVisible() failed
  14 |     }
  15 | 
  16 |     await expect(page.getByText('INTRODUÇÃO')).toBeVisible();
  17 |     await expect(page.getByText('VERSO 1')).toBeVisible();
  18 |     await expect(page.getByText('PROGRESSÕES DE ACORDES')).toBeVisible();
  19 |     await expect(page.locator('header')).toBeVisible();
  20 |     await expect(page.locator('footer')).toBeVisible();
  21 |   });
  22 | 
  23 |   test('F4: cifra publicada no Neon abre por URL direta', async ({ page }) => {
  24 |     await page.goto('/musica/bruna-olly-gratidao-005e9c');
  25 |     const naoEncontrada = await page
  26 |       .getByText('Música não encontrada')
  27 |       .isVisible()
  28 |       .catch(() => false);
  29 |     test.skip(naoEncontrada, 'DB indisponível ou cifra não publicada neste ambiente');
  30 | 
  31 |     await expect(page.getByRole('heading', { level: 1 })).toHaveText('Gratidão');
  32 |     await expect(page.getByText('INTRO', { exact: false }).first()).toBeVisible();
  33 |   });
  34 | 
  35 |   test('F5: hover no acorde mostra o shape e sair esconde', async ({ page }) => {
  36 |     await page.goto('/musica/estrada-de-terra');
  37 |     const acorde = page.getByRole('button', { name: /^Acorde C7M\./ }).first();
  38 |     await expect(acorde).toBeVisible();
  39 | 
  40 |     await acorde.hover();
  41 |     const tooltip = page.getByRole('tooltip');
  42 |     await expect(tooltip).toBeVisible();
  43 |     await expect(tooltip.locator('svg').first()).toBeVisible();
  44 | 
  45 |     await page.getByRole('heading', { level: 1 }).hover();
  46 |     await expect(tooltip).toBeHidden();
  47 |   });
  48 | 
  49 |   test('F16: deep-link ?tom=2 abre a cifra já transposta (C → D)', async ({ page }) => {
  50 |     await page.goto('/musica/estrada-de-terra?tom=2');
  51 |     await expect(page.getByRole('button', { name: /^Acorde D7M\./ }).first()).toBeVisible();
  52 |     await expect(page.getByText('Tom: D').first()).toBeVisible();
  53 |   });
  54 | });
  55 | 
```