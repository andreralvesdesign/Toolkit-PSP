# Toolkit PSP · course build · VERSÃO SCROLL

## Versão de demonstração para portfólio (14 nov 2026)
Publicada em `sonaetoolkit.andrealvesdesign.com` (ficheiro `CNAME`). Diferenças em relação à versão do cliente:
- **Downloads:** os PDFs não fazem parte desta versão. Os botões ficam visíveis, mas ao clicar mostram "Ação não disponível nesta versão de demonstração." O mesmo vale para qualquer link com `href="#demo-indisponivel"` (código em `player.js`, `DEMO_BLOCK`).
- **Contactos internos ocultos:** Somos Sonae (800 100 025), Multicare (210 440 440 e site), link sonae.pt e o Manual no SharePoint passam a "Oculto" / "Hidden" ou ao aviso acima. As linhas públicas (112, SNS 24, 1411…) mantêm-se.
- **Sair / Terminar:** abrem `https://www.andrealvesdesign.com/sonae-toolkit-psp/` no mesmo separador (`closeCourse` em `player.js`).
- **Endereços curtos:** as páginas têm os nomes de `_src/pages.json` (`/contextualizacao`, `/en/context`…); o `index.html` mantém-se como ecrã de idioma + início. Online o `.html` sai do endereço. `idioma`/`inicio` (`en/language`, `en/start`) reencaminham para `index.html#m0-idioma` / `#m0-capa`. Os fragmentos em `_src/lessons/` mantêm os nomes numerados; é o `build.py` que dá os nomes curtos e apaga as páginas antigas.
- Todas as páginas levam `noindex, nofollow`.

Esta pasta (`output/scroll`) é a versão em scroll: cada módulo é uma página só. A versão em slides está guardada, sem alterações, em `output/slides` (cópia de `output/curso` de 23 out 2026). As secções "Escala e preenchimento dos ecrãs" e "Janelas baixas" mais abaixo só se aplicam à versão slides.

## Versão scroll (23 out 2026)
- Os ecrãs de cada módulo são secções seguidas na mesma página; o cabeçalho fica fixo no topo e a barra vermelha por baixo dele mostra quanto da página já foi percorrido.
- No fim da página: "A seguir: <módulo>", o aviso "Faltam N" e os botões Anterior / Seguinte, que passam de módulo em módulo. O contador "01 / 07" desapareceu.
- Gate: o Seguinte só abre quando tudo o que há para explorar na página estiver feito (mesmas regras de antes, agora por página). Clicar no Seguinte bloqueado leva ao primeiro elemento que falta. A secção final diz o que falta ou para onde segue.
- As animações de entrada de cada secção correm quando ela aparece no ecrã. Os pontos vermelhos pulsam nessa altura.
- Vídeos: alternam de lado ao longo do módulo (1.º vídeo à esquerda com o texto à direita, 2.º à direita com o texto à esquerda, …). Só um vídeo toca de cada vez. Em telemóvel o vídeo fica sempre por cima.
- Capas: ocupam a janela e têm o indicador "Desliza para continuar".
- `index.html`: o ecrã de idioma aparece sozinho; depois de escolher e carregar em Seguinte surge a capa e as seis partes.
- Ferramenta de revisão: o hash e o título da página acompanham a secção que está a ser lida (`#m2-1-v12`); abrir um hash leva a página até essa secção (também entre módulos).
- Ao voltar a um módulo por acabar (sem hash, p. ex. pelo Índice), a página abre na secção onde se estava.
- Textos que falavam em "ecrãs" e nas setas foram adaptados (PT em `_src/lessons` e `_src/shell.html`, EN em `_src/i18n/en/c33.json`).
- Secção final: enquanto falta explorar algo, o título passa a "Quase lá · Ainda não terminaste o módulo…" e o selo fica esbatido, sem confetis.
- Janelas estreitas (telemóvel, tablet ao alto): a aquarela da capa fica pequena ao lado do título; os confetis do selo ficam junto dele; as abas segmentadas passam para duas linhas em vez de deslizarem para o lado; as etiquetas da escala de níveis (4.3) cabem na coluna.
- Em janelas estreitas a capa começa logo abaixo do cabeçalho (sem a altura da janela inteira com o conteúdo centrado), tal como o ecrã de idioma.
- "Desliza para continuar": em janelas largas fica fixo no fundo da capa; em janelas estreitas vem a seguir ao conteúdo da capa (nunca por cima dele). Verificado nas 25 capas, PT e EN, em 360×640, 390×844, 768×1024, 1280×600, 1366×680 e 1920×1000.
- Janelas estreitas com mais ar: margens laterais de 24 px, mais espaço entre secções, entre título e texto, entre itens de listas e cartões, linhas um pouco mais altas; o contador "1 de 6 vistos" passa para baixo da instrução. Verificado em 360, 390 e 768 px, PT e EN, sem sobreposições nem scroll lateral (o cabeçalho também cabe em 360 px).
- O botão Anterior não aparece onde não há módulo anterior (Início).
- Revisão global (23 out 2026): todas as páginas, PT e EN, em 390×844, 768×1024, 1366×680 e 1920×1000, sem textos ou imagens sobrepostos, texto cortado nem scroll horizontal (teste automático com as animações no estado final).
- Feedback do cliente (nov 2026): botão redondo de idioma com a bandeira ao lado do som (`#langBtn`; não aparece no ecrã de idioma, que também deixa de ter barra de progresso); capa normal na ficha 5.9 e contactos no fim de cada secção; último ecrã com "Parabéns!" e botão Terminar; legendas e vídeos EN ligados; pontos das listas desenhados com gradiente (`--dot` define a cor).
- Margens (nov 2026): menu, conteúdo e rodapé usam a mesma margem (`--gut` no CSS: `--pad`, com largura máxima `--maxw`). Não voltar a limitar a largura só ao conteúdo.
- Toque: os `:hover` estão dentro de `@media (hover:hover)`; regras de hover novas devem ir para aí. Em toque há um retorno breve em `:active`.
- Janelas estreitas: cada bloco `.a` anima quando chega ao ecrã (`.pend` em `player.js`), em vez de a secção inteira animar de uma vez.
- Secções brancas: classe `s-white` (troca `--white` e `--warm`, por isso os cartões ficam cinza sem mais regras). Cerca de 1 em cada 3 secções normais.
- Fotos: capas `assets/img/foto-capa-<módulo>.webp` (5:4), secções `foto-sec-<módulo>-<id>.webp` (`.sph`, texto + foto). Nas fichas sensíveis só há espaços sem pessoas.
- Capas: texto e foto começam a 10vh em todas as páginas (janelas largas); em janelas estreitas a foto vem depois do texto.
- Círculos de fundo: classes `circ circ-t|circ-b circ-<cor>-<a|b|c>` na secção (Circle Expressions, cor da parte, muito ténues, à direita e cortados). Também no ecrã de idioma, em todas as capas e nas secções de fim de módulo (`circ-fin`). Dentro dos módulos, nunca na ficha 5.9 nem atrás de vídeos, fotos ou ilustrações.
- Código: `assets/js/player.js` (blocos "Scroll" e "Player (scroll)") e o fim de `assets/css/course.css` ("SCROLL VERSION").

Slide-format course built on the approved pilot (`../piloto-slides`, chapter 2.3). Plain HTML/CSS/JS, no framework.

## Open it
Double-click any `.html` file. Works from disk (`file://`) and from a web server/LMS. `index.html` is the course home.

## Layout
```
index.html                                   course home
1-1-como-utilizar.html                       Parte 1
2-1-contextualizacao.html                    Parte 2 · cap. 1
2-2-riscos-psicossociais.html                Parte 2 · cap. 2
2-3-primeiros-socorros-psicologicos.html     Parte 2 · cap. 3 (approved pilot, ported to the shared shell)
3-1 … 3-5-*.html                             Parte 3 (five chapters: 3A = 3.1–3.2, 3B = 3.3–3.5)
4-1 … 4-5-*.html                             Parte 4 (five chapters)
5-0 … 5-9-*.html                             Parte 5 (entry page + nine sheets; 5.9 uses .s-plain: no entrance motion, contacts strip on every screen)
6-1, 6-2-*.html                              Parte 6 (referral criteria; resources and helplines, all tel: links)
assets/css/course.css   pilot CSS (unchanged) + "Course additions" section; font embedded as data URI
assets/js/player.js     shared player: navigation, menu + course map, Apoio/Sair, CC/mute, generic components
assets/img, assets/video
downloads/              PDF extracts of the original Toolkit (unchanged content and layout)
_src/                   sources: edit these, never the built .html files
```

Partes 4 and 5 were first generated by scripts, but the fragments in `_src/lessons/` are the source of truth: edit them directly.

## Editing workflow
1. Edit `_src/lessons/<chapter>.html` (slides + optional `<script>`) or `_src/shell.html` (header, footer, menu, dialogs).
2. Run `python3 _src/build.py` from this folder. It rewrites the root `.html` files.
3. New chapter: add the fragment in `_src/lessons/`, then register it in `COURSE` at the top of `assets/js/player.js` (drives the menu course map and the prev/next links on the closing screen).

## Conventions
- Every slide: `<section class="slide" data-id="…" data-title="…" data-k="…">`. Elements with class `a` animate in, in DOM order.
- Generic components handled by `player.js`: `[data-vtabs]`, `[data-steps]`, `[data-segtabs]`, `[data-reveal]`, `[data-goto="slideId"]`, `[data-help]` (opens Apoio), `#confetti`, `PSP.flips()`.
- Decision trees (Fluxogramas 2 and 4): `PSP.flow({ nodes, ends, … })`, documented above the function in `player.js`. Fluxograma 1 (2.3) keeps the pilot's own code.
- Steps with more than three stops: `<div class="steps steps--n" style="--n:6">`.
- Videos not yet delivered carry `data-pending` on the `<video>` and render a placeholder. When the file arrives: drop it in `assets/video/video-NN.mp4`, add the `.vtt` track, remove `data-pending`.
- Interactive checklists keep answers in memory only (nothing stored, nothing sent to the LMS).
- Progress is in `localStorage` (`psp:<chapter>:visited`, `psp:done:<chapter>`). The SCORM adapter will replace `store`/`gstore` in `player.js`.

## Verified
- Chapter 2.3 renders pixel-identical to the approved pilot at 1366×768 and 390×844 (only the closing-screen chapter links differ).
- No JS errors in any chapter (Partes 3 to 6 included), desktop and mobile; no horizontal overflow.

## Navegação
- A barra inferior (Anterior / Seguinte) é a única navegação entre ecrãs e capítulos. No primeiro ecrã, Anterior vai para o último ecrã do capítulo anterior; no último ecrã, Seguinte vai para o capítulo seguinte (a ordem é `COURSE` em `player.js`). Só o primeiro (Início) e o último capítulo (6.2) ficam com um dos botões inativo.
- Nenhum ecrã tem botões próprios de "Começar", "capítulo anterior/seguinte" ou "Voltar a…". Os botões `data-goto` que sobram são escolhas de conteúdo dentro do capítulo (ex.: as duas situações da ficha 5.9).

## Recomeçar do zero (revisão)
**Clicar 3 vezes no logótipo MC** (canto superior esquerdo, pede confirmação) ou **Shift+Alt+R** / **Ctrl+Alt+R**, em qualquer ecrã: apaga o progresso guardado (ecrãs vistos, capítulos concluídos, ecrãs desbloqueados) e volta ao início do curso. Mantém as legendas, o som e o modo `?gate=off`.

## Escala e preenchimento dos ecrãs
- **Escala:** `html{font-size:clamp(16px,min(1.171vw,2.083vh),24px)}` e todos os comprimentos de layout em `rem`. A 1366×768 (a referência) 1 rem = 16 px e nada muda; em ecrãs maiores o texto e os espaços crescem em conjunto (a 1920×1080, 1 rem = 22,5 px), por isso o curso tem o mesmo aspeto em qualquer monitor. Para novas regras, usar `rem` (não `px`) em margens, `padding`, `gap`, larguras e alturas; `px` só em bordas, sombras e pontos de rutura dos `@media`.
- **Texto:** os tamanhos pequenos subiram cerca de 1 px (os rótulos mais minúsculos, 1,5 a 2 px).
- **Preenchimento:** em `player.js` (`fillSlide`), nos ecrãs alinhados ao topo o título fica onde estava e o conteúdo por baixo é ampliado (até 1,08×, com 10% de folga em baixo) para ocupar a altura livre; se o ecrã estiver cheio demais é reduzido um pouco (mínimo 0,86×) para não aparecer scroll. Capas, ecrãs centrados (vídeos, finais), ecrãs escuros e ecrãs estreitos (telemóvel) ficam como estavam. Recalcula-se ao abrir o ecrã, ao redimensionar a janela e depois de cada clique: se o conteúdo crescer (uma lista aberta, um separador mais alto) a escala baixa até caber, e volta a subir quando encolhe, por isso nunca passa por baixo da barra inferior.

## Menu (Índice)
Só mostra a estrutura do curso, não os ecrãs. Topo em fundo branco com o progresso (capítulos concluídos e ecrãs vistos neste capítulo). Depois, um cartão branco por grupo, todos do mesmo tipo: Início, Parte 1, Partes 2 a 6, com etiqueta "PARTE N", título, contador ("0 de 3") e seta. A cor só aparece em pormenores pequenos: a etiqueta de cada Parte (`.p0` a `.p6` no CSS, variáveis `--pc` e `--pt`), a barra e o "Aqui" do capítulo atual. O fundo ao passar o rato (azul muito claro) e o do capítulo atual são diferentes do cinzento do menu, para não se confundirem. Os números dos capítulos são círculos cinzentos (✓ verde nos concluídos; o atual em azul-escuro). O grupo do capítulo atual vem aberto e só um fica aberto de cada vez. Construído por `courseMap()` em `player.js` a partir de `COURSE`. A lista de ecrãs foi retirada: dentro do capítulo usam-se Anterior e Seguinte.

## Barra superior
Fundo branco com uma sombra suave (`.hdr`), para se distinguir do fundo dos ecrãs (cinzento quente). Os botões de legendas e som têm fundo cinzento claro; quando estão ativos ficam azul-escuros.

## Gate
- **Gate ("Seguinte" só abre depois de explorar o ecrã):** automático, em `player.js` (secção *Gate*). Conta como interação: cada `[role=tab]` selecionado, cada `button[aria-expanded]` aberto (cartões que viram, "O que faz a diferença?", "Outras reações"), cada `button[aria-pressed]` premido, cada árvore de decisão (`.chat`) levada até ao fim, `[data-need]` (botão clicado: respiração, "Ver leitura") e `[data-need-when="seletor"]` (contentor onde o seletor aparece: exercício "Ajuda / Não ajuda"). Caixas de seleção (checklists) e vídeos não contam. `data-nogate` num `<section class="slide">` isenta o ecrã. Vale para o botão, as setas, o gesto de deslizar e o "Começar"; o Índice continua livre. Ecrãs já concluídos ficam desbloqueados (`psp:<capítulo>:cleared`).
- **Modo revisão:** abrir qualquer capítulo com `?gate=off` desliga o bloqueio (fica memorizado no browser); `?gate=on` volta a ligar.

## Indicações de clicável
- **Ponto vermelho** em tudo o que ainda falta abrir (separadores, passos, cartões, botões "ver resposta", roda, exercícios): pulsa durante uns 5 s ao entrar no ecrã, fica fixo e desaparece quando o elemento é aberto. Os mesmos elementos que bloqueiam o Seguinte (ver *Gate*). O que não se clica nunca pisca: tirámos a pulsação dos pontos da linha temporal do 2.3.
- **Linha "Clica…"** em todos os ecrãs interativos, com ícone de cursor: as instruções que já existiam passaram a começar por "Clica" (`.hint.cta`); nos ecrãs que não tinham, o `player.js` cria uma a partir do que lá está (separadores, cartões, botão), com a contagem "· 2 de 5". Para um texto próprio: `data-cta="…"` na `<section class="slide">`.
- Respostas do chat e botões do exercício "Ajuda / Não ajuda" têm sempre um ponto; os cartões de atalho (`data-goto`, `.topic`, `a.partc`) têm uma seta no canto.
- O ecrã "Como navegar" (1.1) explica o ponto vermelho. O Seguinte desbloqueado pulsa duas vezes, não para sempre. Com "movimento reduzido" nada pulsa, os pontos ficam fixos.
- As cues funcionam também com `?gate=off`.
- Onde fica o ponto: no círculo dos passos (`.step .c`), dentro do círculo vazio dos separadores verticais (`.vtab .tick`), no canto superior esquerdo dos nós da roda (o número fica à direita), na margem esquerda dos separadores em barra (`.seg`), no canto superior direito dos restantes. Ver `dotHost()` em `player.js` e a secção *dot positions* do CSS.
- Quando o ecrã fica completo, a linha "Clica…" ganha "✓ Concluído" (borda verde) e os pontos desaparecem.

## Acessibilidade das interações
- **Cartões que viram** (`PSP.flips(ul, onChange, { all })`): o nome do botão é a frente do cartão e não muda; o verso é texto real num parágrafo escondido (`p.sr`, ligado por `aria-controls`) que abre com o cartão e é anunciado (`PSP.say`). Cada grelha tem o botão **Virar todos / Voltar a esconder**. As duas faces ficam sobrepostas numa célula de grelha, por isso o cartão cresce com o texto (zoom, textos longos) em vez de o cortar. Cada cartão precisa de `data-front` e `data-back`.
- **Conversas (fluxogramas)** (`PSP.flow`): o chat é uma região `role="log"`; por baixo há **Reproduzir a conversa** (corre sozinha, ao ritmo de leitura, escolhendo a 1.ª opção ou a de `auto: { nó: índice }`; pausa com o mesmo botão e qualquer clique teu pausa-a; em reprodução o foco não salta) e **Ler o fluxograma completo em texto** (`<details>` gerado a partir da configuração). O Fluxograma 1 (2.3) e o Cartão de Bolso passaram a usar o mesmo código.
- **Abas e passos:** quando uma aba é aberta pela primeira vez, o leitor de ecrã passa a ouvir "visto" (acompanha o visto visual).
- **Títulos:** os `h4` dos painéis ficam com `aria-level` ajustado ao título anterior (sem saltar níveis). O aspeto não muda.
- **Cor:** os rótulos pequenos a vermelho (`.eyebrow`) usam `--red-dark` para cumprir o contraste 4,5:1.
- Já existiam: abas com setas, `aria-live` nos resultados, foco visível, texto alternativo das ilustrações, movimento reduzido, botões com área mínima de 44 px.
- Ainda por fazer: legendas e transcrição dos vídeos; rever o texto alternativo se as ilustrações forem trocadas.

## Ilustrações
- Só não se usam Alphavector-02, -15 e -28 (tons de pele realistas). A 28 estava em 6 sítios e foi trocada por 01 (2.2, nível 1), 04 (1.1), 32 (2.3), 34, 21 e 25 (3.2), com texto alternativo novo. As imagens do curso são `assets/img/av-NN.webp`, com NN = número do Alphavector.

## Vídeos
Os 15 vídeos estão no curso, em `assets/video/video-NN.mp4` (NN = 01, 12, 13, 21, 24, 36, 4a a 4i) com um fotograma de capa `video-NN-poster.jpg`. São as versões comprimidas (H.264, 1080p, 402 MB no total) de `Videos/low_size`, cujos ficheiros têm o prefixo `LOW_` no nome para não se confundirem com os originais. Para trocar um vídeo, substituir o ficheiro com o mesmo nome. Um vídeo ainda por entregar leva `data-pending` no `<video>` e mostra um aviso no lugar.

## Documentos
Os 43 PDFs de `downloads/` (extratos do Toolkit original, sem alterações, e o Toolkit completo) são ligados por 44 botões. Todos abrem numa janela nova (`target="_blank"`, sem `download`) e o leitor de ecrã ouve "abre numa nova janela". O texto "PDF · N páginas" de cada botão confere com o ficheiro.

## Versão do documento base (20 out 2026)
O Toolkit passou a `MC Sonae_Toolkit Primeiros Socorros Psicológicos no Trabalho v20261020.pdf` (em `Guiões/`). Comparado com o V1, só mudou a pág. 131 (ficha do suicídio, lista "O que evitar?"); a paginação é a mesma, por isso as remissões "páginas X a Y" continuam certas. Foram substituídos `ficha-9-suicidio.pdf`, `toolkit-psp-parte-5-situacoes-sensiveis.pdf` e `toolkit-psp-completo.pdf` (este também continha a pág. 131).
Reposições pedidas pela MC: introdução de 3.1 (p. 27), princípios da abordagem informada pelo trauma em 4.4 (p. 94), ecrã novo "Segurança psicológica no dia a dia" em 4.5 (p. 107, o capítulo passa a 10 ecrãs). O Fluxograma 3 continua só em PDF e o ecrã "Depois do momento" (3.2) di-lo e liga ao ficheiro.

## Revisão do cliente (20 out 2026)
Lista completa de pontos e estado em `REVISAO-2026-10-20.md`. O que mudou no código:
- **Acordeão no telemóvel.** `disclosure()` em `player.js`: em ecrãs estreitos, `.vtabs` e `.chk-groups` deixam de ser separadores e passam a botões com `aria-expanded` (abrir/fechar), com o painel logo a seguir ao botão. Decidido quando a página abre.
- **Navegação.** Módulos livres no Índice; ordem obrigatória só entre os ecrãs de cada módulo (gate). `PRE` em `player.js` (vazio) permite bloquear um módulo até outro estar concluído, com cadeado no Índice.
- **Fluxogramas.** `PSP.flow()` ganhou "Voltar um passo" e a vista "Fluxograma visual" (`.fmap`), que partilha o estado com a conversa. Em 3.4 ("Ajuda ou não ajuda?") há "Frase anterior".
- **Verde para "o que fazer".** Classes `.ok` / `.g` e regras no fim de `course.css`.
- **Tratamento por tu e "módulo".** Texto das lições; o termo "capítulo" já não existe.
- **Atalhos** na tabela de ferramentas (1.1), links para o Manual de Prevenção do Suicídio (5.9) e para o Somos Sonae (6.2).

## Versão em inglês (en/)
O curso em inglês é o mesmo leitor e a mesma estrutura, em `en/` (mesmos nomes de ficheiro; `assets/` e `downloads/` são partilhados). Texto do ecrã traduzido por Claude a partir do Toolkit já traduzido pelo DeepL (glossário: PFA, "employee", "leader", "Sheet 1–9", "We Are Sonae"). **Documentos em inglês:** as páginas em inglês abrem os 43 extratos de `downloads/en/` (nomes em inglês, mesmos intervalos de páginas que os portugueses; o completo tem 145 págs.). Saem do Toolkit traduzido pelo DeepL (`Guiões/…V1_EN-draft.pdf`) com `python _src/i18n/build_docs.py`, que também escreve `_src/i18n/en/downloads.json`; o `apply.py` usa-o para trocar os links e o "PDF · N pages". É um rascunho: o DeepL reorganizou as páginas (pág. 6 e 26 da parte 2 e 16 da parte 4 do original são páginas extra/em branco, ignoradas; a tabela da pág. 53 foi redesenhada à mão) e há tabelas e fluxogramas com texto desalinhado, e imagens com texto em português (logótipo "Saúde Ocupacional", fotogramas dos vídeos). A pág. 131 já é a da versão v20261020.
- **Escolha de idioma.** O primeiro ecrã de `index.html` (PT e EN) é só a escolha de idioma, com bandeiras (`.langpick`, radio buttons): clicar apenas seleciona; o Seguinte (bloqueado até haver escolha) avança na capa do idioma escolhido (outro idioma: abre `en/index.html#s2` ou `../index.html#s2`). Sem botão Anterior (`data-noprev`) nem linha de instrução (`data-nocta`). Todas as páginas têm também um botão no Índice que mantém o ecrã onde o leitor está. O último idioma fica em `psp:lang`.
- **Progresso por idioma** (`psp:en:…`); som, legendas e modo de revisão são comuns. "Recomeçar do zero" apaga os dois.
- **Como se constrói.** As traduções ficam em `_src/i18n/en/c00…c30.json`, por número de frase (`pt_list.json` é só de acrescentar: nunca reordenar). `python3 _src/build.py` corre `i18n/apply.py` (troca o texto nos fragmentos PT por posição, confere etiquetas, atributos e código JS, e escreve `_src/lessons-en/` e `_src/shell.en.html`) e depois constrói `en/`. Se uma frase PT mudar, o `extract.py` (corrido pelo `apply.py`) junta-a ao fim da lista e o build pára até haver tradução. `i18n/en/overrides.json` serve para a mesma palavra PT com outro inglês num ficheiro (ex.: os passos de 3.5).
- **Textos do `player.js`** (menu, avisos, fluxogramas…) usam `L('pt', 'en')`; os títulos do Índice estão em `COURSE` e, para inglês, em `TITLES`.
- **Pendente:** legendas em inglês dos vídeos (as de português também estão pendentes), revisão do layout dos PDFs em inglês e revisão por pessoa nativa.

## Janelas baixas (portátil, ~1366×657)
`fillSlide()` nunca reduz o texto abaixo de 0,8× (`FILL_MIN`). Se um ecrã não cabe, tenta por ordem: encolher só o conteúdo, encolher também o título, e por fim aplicar a classe `.compact` (espaçamento mais apertado, sem o rótulo de cima; regras no fim de `course.css`). A procura é de cima para baixo porque a altura não é monótona (as colunas reorganizam-se com o zoom). Abaixo de 720 px de altura o cabeçalho, a barra inferior e o padding dos ecrãs ficam mais finos; os vídeos têm altura máxima (`.vid .player`) e as capas (`.s-cover`) não fazem scroll em desktop. Testado em PT e EN a 1366×657: nenhum ecrã passa da barra inferior (2.1 tem 3 px de folga a menos em 2 ecrãs); 10–14 ecrãs usam `.compact`.

## Ferramenta de revisão (review.fullfill.pt)
Cumpre `COURSE_REVIEW_REQUIREMENTS.md`:
- **Hash = id estável do slide, com o módulo à frente:** `#m2-3-s14`, `#m0-capa`. O id vem de `data-id` em cada `<section class="slide">` dos fragmentos e **nunca muda nem se reutiliza**: um slide novo recebe um id novo (não renumerar). Qualquer hash abre o slide certo, mesmo vindo de outro módulo (`index.html#m3-2-fluxo` salta para `3-2-autorregulacao.html`), e o hash manual/`hashchange` funciona. Links antigos `#sN` (posição) ainda funcionam e são trocados pelo id.
- **`document.title`:** `Módulo 2.3 Primeiros Socorros Psicológicos – Cartão de Bolso – Toolkit PSP` (EN: `Module … – PFA Toolkit`), mudado na mesma função que o hash (`go()`).
- **`slides.json`** (raiz e `en/`), gerado pelo `build.py`: `{id, module, title, order}` com `order` global. Os ids do json são os do hash.
- **Chaves de localStorage/sessionStorage** levam a pasta do curso (`psp:<pasta>:…`; `en/` conta como a pasta de cima).
- Corre fora de LMS (o código SCORM está em try/catch, sem alertas), funciona dentro de iframe (sem `window.top`), o hash só leva o id do slide (a ligação "Saltar para o conteúdo" já não mexe nele).
- Os ids dos slides que não tinham `data-id` ficaram `s<posição atual>` (ex.: 2.3 → `s1…s15`); estão em `_src/lessons`.

## Pending
- All `.vtt` captions (the `<track>` lines are commented out in the slides; video 36 points to `video-36.vtt`, which does not exist yet).
- SCORM 2004 packaging (manifest + API adapter), completion rules from the client.
- `downloads/toolkit-psp-completo.pdf` is the 49 MB original (now the v20261020 version); compress before packaging.
