/* Toolkit PSP · course player · SCROLL VERSION (output/scroll)
 * Every module is one page: the sections (the slides of output/slides) follow each other down the page, the module navigation
 * (Anterior / Seguinte) closes the page, and Seguinte opens once everything on the page was explored.
 * Shared by every chapter. Extracted from the approved pilot (piloto-slides, 2.3) and generalised:
 *  - slide navigation, progress, menu drawer with chapter screens + course map, Apoio / Sair dialogs,
 *    captions + mute toggles, keyboard + swipe navigation;
 *  - generic components: [data-vtabs], [data-steps], [data-segtabs], [data-goto], .flip cards, PSP.flow() decision trees,
 *    [data-reveal] buttons, video placeholders, completion badge confetti, chapter prev/next links.
 * Chapter-specific code runs after this file, registers PSP.hooks[slideId] if needed, then calls PSP.start().
 * SCORM: progress lives in localStorage for now; the LMS adapter will replace `store`.
 */
window.PSP = (() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
/* reader preferences (Definições, see assets/js/prefs.js): larger text, more spacing, animations off */
const PREFS = (() => { try { return JSON.parse(localStorage.getItem('psp:prefs')) || {}; } catch (e) { return {}; } })();
const savePrefs = () => { try { localStorage.setItem('psp:prefs', JSON.stringify(PREFS)); } catch (e) {} };
const RM = matchMedia('(prefers-reduced-motion:reduce)').matches || !!PREFS.still;
const CH = document.body.dataset.chapter || 'x';
/* Language: the English course lives in en/ and is the same player. <html lang="en-GB"> switches every text below (L(pt, en)).
   Progress, sound, captions and the review switches are shared between the two languages. */
const EN = document.documentElement.lang.toLowerCase().startsWith('en');
const L = (pt, en) => EN ? en : pt;
const mk = p => ({ get(k){ try{ return JSON.parse(localStorage.getItem(p + k)); }catch(e){ return null; } }, set(k, v){ try{ localStorage.setItem(p + k, JSON.stringify(v)); }catch(e){} } });
/* every browser-storage key carries the course folder (the review tool serves all versions from one origin); en/ belongs to the folder above it */
const NS = (location.pathname.replace(/[^/]*$/, '').replace(/en\/$/, '').replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '')) || 'course';
/* progress used to be kept per language: what the English pages saved is folded into the shared keys, once */
(() => { try {
  const pre = 'psp:' + NS + ':en:';
  Object.keys(localStorage).filter(k => k.startsWith(pre)).forEach(k => {
    const to = 'psp:' + NS + ':' + k.slice(pre.length), a = JSON.parse(localStorage.getItem(k)), b = JSON.parse(localStorage.getItem(to));
    localStorage.setItem(to, JSON.stringify(Array.isArray(a) ? [...new Set([...(b || []), ...a])] : b === null ? a : a === true ? true : b));
    localStorage.removeItem(k);
  });
} catch (e) {} })();
const store = mk('psp:' + NS + ':' + CH + ':'), gstore = mk('psp:' + NS + ':'), dstore = gstore;
const pad = n => String(n).padStart(2, '0');
/* only write when the value changed (a write inside a section is a DOM mutation, and the gate re-checks on every mutation) */
const put = (node, prop, v) => { if (node && node[prop] !== v) node[prop] = v; };

/* ======================= Course map ======================= */
const COURSE = [
  { part: 'Início', items: [{ id: '0', n: '', t: 'Início do curso', f: 'index.html' }] },
  { part: 'Parte 1 · Introdução', items: [{ id: '1.1', n: '1.1', t: 'Como utilizar este Toolkit', f: '1-1-como-utilizar.html' }] },
  { part: 'Parte 2 · Primeiros Socorros Psicológicos no Local de Trabalho', items: [
    { id: '2.1', n: '2.1', t: 'Contextualização', f: '2-1-contextualizacao.html' },
    { id: '2.2', n: '2.2', t: 'Os Riscos Psicossociais', f: '2-2-riscos-psicossociais.html' },
    { id: '2.3', n: '2.3', t: 'Primeiros Socorros Psicológicos', f: '2-3-primeiros-socorros-psicologicos.html' }] },
  { part: 'Parte 3 · Se eu sou um Colaborador', items: [
    { id: '3.1', n: '3.1', t: 'Sinais de alerta: o que observar em mim', f: '3-1-sinais-de-alerta.html' },
    { id: '3.2', n: '3.2', t: 'Autorregulação: a base e o que fazer no momento', f: '3-2-autorregulacao.html' },
    { id: '3.3', n: '3.3', t: 'Um colega em sofrimento: reconhecer e aproximar', f: '3-3-reconhecer-e-aproximar.html' },
    { id: '3.4', n: '3.4', t: 'Apoiar durante a conversa', f: '3-4-apoiar-durante-a-conversa.html' },
    { id: '3.5', n: '3.5', t: 'Limites, confidencialidade e guia de conversa', f: '3-5-limites-e-guia-de-conversa.html' }] },
  { part: 'Parte 4 · Se eu sou um Líder', items: [
    { id: '4.1', n: '4.1', t: 'O papel do líder nos Primeiros Socorros Psicológicos', f: '4-1-o-papel-do-lider.html' },
    { id: '4.2', n: '4.2', t: 'Identificar sinais na equipa', f: '4-2-identificar-sinais-na-equipa.html' },
    { id: '4.3', n: '4.3', t: 'Devo intervir? Da dúvida à ação', f: '4-3-devo-intervir.html' },
    { id: '4.4', n: '4.4', t: 'Como abordar um colaborador', f: '4-4-como-abordar-um-colaborador.html' },
    { id: '4.5', n: '4.5', t: 'Liderar para a segurança psicológica', f: '4-5-liderar-para-a-seguranca-psicologica.html' }] },
  { part: 'Parte 5 · Situações Sensíveis', items: [
    { id: '5.0', n: '', t: 'As nove situações', f: '5-0-situacoes-sensiveis.html' },
    { id: '5.1', n: '5.1', t: 'Burnout', f: '5-1-burnout.html' },
    { id: '5.2', n: '5.2', t: 'Luto', f: '5-2-luto.html' },
    { id: '5.3', n: '5.3', t: 'Ataques de pânico', f: '5-3-ataques-de-panico.html' },
    { id: '5.4', n: '5.4', t: 'Situações de calamidade', f: '5-4-situacoes-de-calamidade.html' },
    { id: '5.5', n: '5.5', t: 'Comportamento agressivo', f: '5-5-comportamento-agressivo.html' },
    { id: '5.6', n: '5.6', t: 'Crise pessoal grave', f: '5-6-crise-pessoal-grave.html' },
    { id: '5.7', n: '5.7', t: 'Conflito na equipa', f: '5-7-conflito-na-equipa.html' },
    { id: '5.8', n: '5.8', t: 'Apoio a cliente em sofrimento', f: '5-8-apoio-a-cliente-em-sofrimento.html' },
    { id: '5.9', n: '5.9', t: 'Suicídio', f: '5-9-suicidio.html' }] },
  { part: 'Parte 6 · Encaminhamento e Recursos', items: [
    { id: '6.1', n: '6.1', t: 'Quando encaminhar', f: '6-1-quando-encaminhar.html' },
    { id: '6.2', n: '6.2', t: 'Recursos', f: '6-2-recursos.html' }] }
];
if (EN) {
  const PARTS = ['Home', 'Part 1 · Introduction', 'Part 2 · Psychological First Aid in the Workplace', 'Part 3 · If I am an Employee', 'Part 4 · If I am a Leader', 'Part 5 · Sensitive Situations', 'Part 6 · Referral and Resources'];
  const TITLES = {
    '0': 'Start of the course', '1.1': 'How to use this Toolkit', '2.1': 'Context', '2.2': 'Psychosocial Risks', '2.3': 'Psychological First Aid',
    '3.1': 'Warning signs: what to look for in myself', '3.2': 'Self-regulation: the foundation and what to do in the moment', '3.3': 'A colleague in distress: recognising and approaching',
    '3.4': 'Supporting during the conversation', '3.5': 'Limits, confidentiality and conversation guide',
    '4.1': 'The role of the leader in Psychological First Aid', '4.2': 'Identifying signs in the team', '4.3': 'Should I step in? From doubt to action', '4.4': 'How to approach an employee', '4.5': 'Leading for psychological safety',
    '5.0': 'The nine situations', '5.1': 'Burnout', '5.2': 'Grief', '5.3': 'Panic attacks', '5.4': 'Disaster situations', '5.5': 'Aggressive behaviour', '5.6': 'Serious personal crisis',
    '5.7': 'Conflict in the team', '5.8': 'Supporting a customer in distress', '5.9': 'Suicide', '6.1': 'When to refer', '6.2': 'Resources'
  };
  COURSE.forEach((pt, i) => { pt.part = PARTS[i]; pt.items.forEach(c => { c.t = TITLES[c.id]; }); });
}
/* Page names (portfolio demo): the f above are the source fragments; the pages have the short names of _src/pages.json (window.PAGES,
   written by build.py), in Portuguese at the root and in English in en/; index.html keeps its name. Online (http/https) the address leaves
   ".html" out (/contextualizacao, /en/context) and the home page is the folder itself; from disk (file://) the links keep it. */
const PG_ = window.PAGES || {};
const ONLINE = /^https?:$/.test(location.protocol);
const U = f => ONLINE ? f.replace(/^((?:\.\.\/)?(?:en\/)?)index\.html(?=[#?]|$)/, '$1').replace(/\.html(?=$|[#?])/, '') || './' : f;
const PG = (src, lang = EN ? 1 : 0) => U(PG_[src] ? PG_[src][lang] + '.html' : src);
COURSE.forEach(p => p.items.forEach(c => { c.f = PG(c.f); }));
if (ONLINE) {
  /* the address: no ".html", no "index" */
  const clean = location.pathname.replace(/index\.html$/, '').replace(/\.html$/, '');
  if (clean !== location.pathname) { try { history.replaceState(null, '', clean + location.search + location.hash); } catch (e) {} }
  /* links between pages: no ".html" (assets and other sites are left alone) */
  $$('a[href]').forEach(a => { const h = a.getAttribute('href'); if (/^(\.\.\/)?(en\/)?[\w-]+\.html(?=$|[#?])/.test(h)) a.setAttribute('href', U(h)); });
}
/* linear sequence for prev/next: chapters, plus one placeholder per part still in preparation */
const SEQ = COURSE.flatMap(p => p.items.length ? p.items : [{ id: null, n: '', t: p.part, f: null }]);
const CI = SEQ.findIndex(c => c.id === CH), PREV_CH = CI > 0 && SEQ[CI - 1].f ? SEQ[CI - 1] : null, NEXT_CH = CI > -1 && SEQ[CI + 1] && SEQ[CI + 1].f ? SEQ[CI + 1] : null, LAST = CI === SEQ.length - 1;
/* the modules carry no number on screen (only the six parts do) */
const chLabel = c => c.t;
/* Modules can be opened in any order, from the Índice or the Início. The only forced order is inside a module (the Seguinte gate).
   If the client ever wants a module to wait for another, list it here: { '2.2': '2.1' } locks 2.2 in the Índice until 2.1 is done
   (the Índice then shows a padlock). Review mode (?gate=off) unlocks everything. */
const PRE = {};

/* ======================= Player ======================= */
const slides = $$('.slide'), N = slides.length;
let cur = -1;
const visited = new Set(store.get('visited') || []);
const hooks = {};

slides.forEach((s, i) => {
  s.dataset.id = s.dataset.id || 's' + (i + 1);
  s.id = 'slide-' + (i + 1);
  /* one page: the headings carry the structure (no "diapositivo" role and no "1 de 9" name on the sections) */
  s.removeAttribute('aria-roledescription');
  let k = 0; $$('.a', s).forEach(el => el.style.setProperty('--i', k++));
  const h = $('h1,h2', s); if (h) h.tabIndex = -1;
});
$$('.not').forEach((el, i) => el.style.setProperty('--i', i + 2));
const idx = id => slides.findIndex(s => s.dataset.id === id);
/* index.html: the language screen (the section with data-noprev) is shown on its own, the rest of the page once a language is chosen */
const SOLO = slides.find(s => s.hasAttribute('data-noprev')) || null;
const shownIdx = () => slides.map((s, i) => s.hidden ? -1 : i).filter(i => i > -1);
/* Review tool (review.fullfill.pt): the URL hash is the slide's stable id, qualified by the module (m2-1-v01, m0-capa), and the page title says where we are.
   Ids come from data-id in the fragments and never change; a hash of another module opens that module (index.html#m2-1-v01 works from the root). */
const slug = c => 'm' + String(c).replace(/\./g, '-');
const hashOf = i => slug(CH) + '-' + slides[i].dataset.id;
function target() {
  let h; try { h = decodeURIComponent(location.hash.slice(1)); } catch (e) { return null; }
  if (!h) return null;
  const i = slides.findIndex((x, k) => hashOf(k) === h);
  if (i > -1) return { i };
  const c = SEQ.filter(c => c.id && c.f && h.startsWith(slug(c.id) + '-')).sort((a, b) => slug(b.id).length - slug(a.id).length)[0];
  if (c && c.id !== CH) return { to: c.f + '#' + h };
  const m = h.match(/^s(\d+)$/); if (m) return { i: Math.min(N - 1, +m[1] - 1) }; /* old position links; #s999 = last slide (back from the next module) */
  return null;
}
/* the browser tab always shows the course name, whatever page or section (user request, Nov 2026) */
const pageTitle = () => L('Sonae Toolkit PSP', 'Sonae Toolkit PFA');

/* jump to a section (Índice, data-goto, the hash): the page scrolls there and its heading takes the focus */
function go(n, focus = true, smooth = true) {
  n = Math.max(0, Math.min(N - 1, n)); const s = slides[n];
  if (s === SOLO) { solo(true); return; }
  if (SOLO && !SOLO.hidden) solo(false);
  s.scrollIntoView({ block: 'start', behavior: smooth && !RM ? 'smooth' : 'auto' });
  if (focus) { const h = $('h1,h2', s); h && h.focus({ preventScroll: true }); }
  setCur(n);
}
/* the section being read: its id goes into the hash and its title into the page title (review tool) */
function setCur(n) {
  if (n === cur || n < 0) return; cur = n; store.set('cur', n);
  if (location.hash !== '#' + hashOf(n)) history.replaceState(null, '', '#' + hashOf(n));
  document.title = pageTitle(n);
  (hooks[slides[n].dataset.id] || (() => {}))();
}
function solo(on) {
  if (!SOLO) return;
  slides.forEach(s => { s.hidden = on ? s !== SOLO : s === SOLO; });
  document.body.classList.toggle('is-solo', on);
  cur = -1; window.scrollTo(0, 0); track(); ui();
  if (!on) $$('.seg').forEach(glide);
}
function ui() {
  const pv = $('#prev'), nx = $('#next'), alone = !!SOLO && !SOLO.hidden;
  pv.hidden = alone || !PREV_CH; pv.disabled = !PREV_CH; nx.disabled = !alone && !NEXT_CH && !LAST;
  if (LAST) put($('#next .t'), 'textContent', L('Terminar', 'Finish'));
  [[pv, PREV_CH, L('Módulo anterior', 'Previous module')], [nx, alone ? null : NEXT_CH, L('Módulo seguinte', 'Next module')]].forEach(([b, c, lead]) => {
    if (c) { b.title = chLabel(c); b.setAttribute('aria-label', `${lead}: ${chLabel(c)}`); } else { b.removeAttribute('title'); b.removeAttribute('aria-label'); }
  });
  /* where Seguinte leads (in place of the "01 / 09" counter of the slides version) */
  /* "A seguir:" in bold, then the page name as plain text; rewritten only when the target changes (the gate observer watches every DOM change) */
  const ct = $('#cntT'), ctk = !alone && NEXT_CH ? chLabel(NEXT_CH) : '';
  if (ct && ct.dataset.nxt !== ctk) {
    ct.dataset.nxt = ctk; ct.textContent = '';
    if (ctk) { const s = document.createElement('strong'); s.textContent = L('A seguir:', 'Up next:'); ct.append(s, ' ' + ctk); }
  }
  gateUI(); courseMap();
}
/* the closing section says what is still missing, or where Seguinte goes */
function finText() {
  const fin = $('#finTxt'); if (!fin) return;
  const n = GATE ? todoUnits().length : 0;
  /* the title and the badge only say "done" once nothing is left (the originals are kept on the first pass) */
  const sec = fin.closest('.slide'), h = $('h2', sec), eb = $('.eyebrow', sec);
  if (h && !h.dataset.done) { h.dataset.done = h.textContent; if (eb) eb.dataset.done = eb.textContent; }
  if (h) put(h, 'textContent', n ? h.dataset.done.replace(/^Terminaste /, 'Ainda não terminaste ').replace(/^You have finished (.*)$/, 'You have not finished $1 yet') : LAST ? L('Parabéns! Chegaste ao fim deste Toolkit', 'Congratulations! You have reached the end of this Toolkit') : h.dataset.done);
  if (eb) put(eb, 'textContent', n ? L('Quase lá', 'Almost there') : eb.dataset.done);
  sec.classList.toggle('fin-open', !!n);
  put(fin, 'textContent', n
    ? L(`Para concluíres, falta explorar ${n === 1 ? '1 elemento' : `${n} elementos`} por abrir (marcados com um ponto vermelho) nesta página.`, `To finish, you still have ${n === 1 ? '1 element' : `${n} elements`} to open (marked with a red dot) on this page.`) : '');
  fin.hidden = !n;
  let nx = $('#finNext', sec);
  if (!nx) { nx = document.createElement('p'); nx.id = 'finNext'; nx.className = 'lede fin-next'; fin.closest('.head').parentElement.append(nx); }
  put(nx, 'textContent', n ? '' : NEXT_CH ? L('Utiliza o botão "Seguinte", logo abaixo, para avançar.', 'Use the "Next" button, just below, to continue.')
      : CI === SEQ.length - 1 ? L('Utiliza o botão "Terminar", logo abaixo, para fechar a página.', 'Use the "Finish" button, just below, to close the page.') : '');
  nx.hidden = !nx.textContent;
}
/* the module counts as done when every section was on screen and nothing is left to explore */
function checkDone() {
  if (SOLO && !SOLO.hidden) return;
  if (shownIdx().every(i => visited.has(i)) && !locked() && !dstore.get('done:' + CH)) { dstore.set('done:' + CH, true); courseMap(); }
}
const goPrev = () => { if (PREV_CH) location.href = PREV_CH.f; };
$('#prev').onclick = goPrev;
$('#next').onclick = () => (LAST && !locked() ? closeCourse() : tryNext());
document.addEventListener('click', e => {
  const b = e.target.closest('[data-go=next]');
  if (b) { const i = slides.indexOf(b.closest('.slide')), nx = shownIdx().find(k => k > i); if (i > -1 && nx !== undefined) go(nx); else tryNext(); return; }
  const g = e.target.closest('[data-goto]'); if (g) { e.preventDefault(); const i = idx(g.dataset.goto); if (i > -1) go(i); }
});
/* Review reset: wipes the saved progress (ecrãs vistos, módulos concluídos, ecrãs desbloqueados) and goes back to the start.
   Captions, sound and the ?gate=off review mode are kept. Triggers: triple-click on the MC logo (asks first) or Shift+Alt+R / Ctrl+Alt+R. */
function resetAll() {
  try { Object.keys(localStorage).filter(k => k.startsWith('psp:' + NS + ':') && !/:(muted|cc|gateoff|lang)$/.test(k)).forEach(k => localStorage.removeItem(k)); } catch (err) {}
  const onHome = CH === '0';
  location.href = PG('index.html') + '#m0-idioma'; if (onHome) location.reload();
}
document.addEventListener('keydown', e => {
  if (!(e.altKey && (e.shiftKey || e.ctrlKey) && e.code === 'KeyR')) return;
  e.preventDefault(); resetAll();
});
$('.hdr .logo').addEventListener('click', e => {
  if (e.detail === 3 && confirm(L('Apagar o progresso e voltar ao início do curso?', 'Delete your progress and go back to the start of the course?'))) resetAll();
});
/* ======================= Gate: "Seguinte" only opens after interacting with everything on the slide =======================
 * Units are found in the DOM when the chapter starts: every [role=tab] selected once, every button[aria-expanded] opened once,
 * every button[aria-pressed] pressed once, every .chat (decision tree) taken to an end, every [data-need] clicked once and every
 * [data-need-when="selector"] container where that selector has appeared. Units are sticky; cleared slides are remembered.
 * A slide with data-nogate is never locked. Videos are not part of the gate.
 * Review mode: open any chapter with ?gate=off (remembered in the browser) and ?gate=on to switch it back on. */
const GATE = (() => { const m = location.search.match(/[?&]gate=(on|off)\b/); if (m) gstore.set('gateoff', m[1] === 'off'); return !gstore.get('gateoff'); })();
const cleared = new Set(store.get('cleared') || []);
const units = slides.map(() => []);
const pending = i => units[i].filter(u => !u.ok);
/* one page, one gate: Seguinte stays locked while any section on show still has something to explore */
const todoUnits = () => slides.flatMap((s, i) => s.hidden || cleared.has(i) ? [] : pending(i));
const locked = () => GATE && todoUnits().length > 0;
const POINTER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 9l5 12 1.8-5.2L21 14 9 9z"/><path d="M16 16l4.2 4.2"/><path d="M7.2 2.2l.8 2.9M5.1 8l-2.9-.8M14 4l-2.1 2.1M6 11.2l-2.1 2.1"/></svg>';
/* click cues: a red dot (pulsing for a few seconds) on every element that is still to be opened, and one "Clica…" line per interactive slide.
   Slides with their own instruction (a .hint containing "Clica") keep it; the others get one built from what is on the slide (or from data-cta). */
const ctas = [];
const dotHost = el => el.matches('.flip button') ? el.closest('.flip') : el.matches('.vtab') ? ($('.tick', el) || el) : el.matches('.step') ? ($('.c', el) || el) : el;
const markTodo = (u, on) => {
  const h = u.host; if (!h) return;
  h.classList.toggle('todo', on);
  if (u.cls) return; /* containers (chat, exercise): CSS draws the dots on their buttons while the class is on */
  let d = $(':scope > .todo-dot', h);
  if (on) { if (getComputedStyle(h).position === 'static') h.classList.add('todo-rel'); if (!d) { d = document.createElement('i'); d.className = 'todo-dot'; d.setAttribute('aria-hidden', 'true'); h.append(d); } }
  else if (d) d.remove();
  /* screen readers do not see the dot: the control says "por abrir" until it has been opened */
  const ctl = h.closest('button,a,[role=tab]') || $('button', h) || h;
  let sr = $(':scope > .todo-sr', ctl);
  if (on && !sr) { sr = document.createElement('span'); sr.className = 'sr todo-sr'; sr.textContent = L(' (por abrir)', ' (not opened yet)'); ctl.append(sr); }
  else if (!on && sr) sr.remove();
};
function ctaText(s, el) {
  if (s.dataset.cta) return s.dataset.cta;
  if (el.length === 1 && el[0].matches('[data-reveal],[data-need]')) return L(`Clica em “${el[0].textContent.trim()}”${el[0].matches('[data-reveal]') ? ' para ver a resposta.' : '.'}`, `Click on “${el[0].textContent.trim()}”${el[0].matches('[data-reveal]') ? ' to see the answer.' : '.'}`);
  if (el.every(e => e.matches('[role=tab],.acc > button'))) return L('Clica em cada opção para abrires a informação. O ponto vermelho marca o que ainda não abriste.', 'Click on each option to open the information. The red dot marks what you have not opened yet.');
  if (el.every(e => e.matches('.flip button'))) return L('Clica em cada cartão para o virar. O ponto vermelho marca os que ainda não viraste.', 'Click on each card to turn it over. The red dot marks the ones you have not turned yet.');
  return L('Clica em cada elemento com ponto vermelho para abrires a informação.', 'Click on each element with a red dot to open the information.');
}
function ownCta(s) {
  $$('.hint', s).filter(h => /clica|click/i.test(h.textContent)).forEach(h => { h.classList.add('cta'); const v = $('svg', h); if (v) v.outerHTML = POINTER; });
}
function cta(s, i) {
  if ($('.hint.cta', s) || s.hasAttribute('data-nocta')) return;
  const p = document.createElement('p'); p.className = 'hint cta a';
  p.innerHTML = `${POINTER}<span>${ctaText(s, units[i].map(u => u.el))}</span> <b class="cta-n"></b>`;
  const head = $('.head', s); p.style.setProperty('--i', head ? $$('.a', head).length : 0); head ? head.append(p) : $('.in', s).prepend(p);
  ctas[i] = p;
}
/* only write when the text changed: a write is itself a DOM mutation, and sweep() runs on every mutation */
const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
function markDone(i) {
  $$('.hint.cta', slides[i]).forEach(h => { if (h.classList.contains('is-done')) return; h.classList.add('is-done'); h.insertAdjacentHTML('beforeend', `<b class="cta-ok">${CHECK}${L('Concluído', 'Completed')}</b>`); });
}
const ctaCount = i => {
  const c = ctas[i]; if (!c || units[i].length < 2) return;
  const n = $('.cta-n', c), t = `· ${units[i].filter(u => u.ok).length} ${L('de', 'of')} ${units[i].length}`;
  if (n.textContent !== t) n.textContent = t;
};
function discover(s, i) {
  const seen = new Set();
  const add = (el, test) => { if (seen.has(el)) return; seen.add(el); units[i].push({ el, test, ok: test() }); };
  $$('[role=tab]', s).forEach(t => add(t, () => t.getAttribute('aria-selected') === 'true'));
  $$('button[aria-expanded]', s).forEach(b => add(b, () => b.getAttribute('aria-expanded') === 'true'));
  $$('button[aria-pressed]:not([data-ng])', s).forEach(b => add(b, () => b.getAttribute('aria-pressed') === 'true'));
  $$('.chat', s).forEach(c => add(c, () => !!$('.endc', c)));
  $$('[data-need-when]', s).forEach(c => add(c, () => !!$(c.dataset.needWhen, c)));
  $$('[data-need]:not([data-need-when])', s).forEach(b => { let hit = false; b.addEventListener('click', () => { hit = true; sweep(i); }, true); add(b, () => hit); });
  /* what was already explored in a section that is not finished: kept by position, so it survives a reload and a change of language */
  const kept = (store.get('seen') || {})[i] || [];
  units[i].forEach((u, k) => { if (kept.includes(k)) u.ok = true; u.cls = u.el.matches('.chat,[data-need-when]'); u.host = u.cls ? u.el : dotHost(u.el); markTodo(u, !u.ok && !cleared.has(i)); });
  if (units[i].length) { cta(s, i); ctaCount(i); if (cleared.has(i)) markDone(i); }
}
function sweep(i) {
  const was = locked();
  let fresh = false;
  units[i].forEach(u => { if (!u.ok && (!u.el.isConnected || u.test())) { u.ok = true; fresh = true; markTodo(u, false); } });
  if (fresh) { const m = store.get('seen') || {}; m[i] = units[i].flatMap((u, k) => u.ok ? [k] : []); store.set('seen', m); }
  ctaCount(i);
  if (!pending(i).length && !cleared.has(i)) { cleared.add(i); store.set('cleared', [...cleared]); }
  if (!pending(i).length) markDone(i);
  gateUI();
  if (was && !locked()) {
    say(L('Já exploraste tudo nesta página. Podes avançar com o botão Seguinte, no fim da página.', 'You have explored everything on this page. You can move on with the Next button at the end of the page.'));
    checkDone();
  }
}
function gateUI() {
  const nx = $('#next'), lock = locked(), n = lock ? todoUnits().length : 0, h = $('#gateHint');
  nx.classList.toggle('locked', lock); if (lock) nx.setAttribute('aria-disabled', 'true'); else nx.removeAttribute('aria-disabled');
  h.hidden = !lock; if (lock) put($('#gateTxt'), 'textContent', n === 1 ? L('Falta 1', '1 left') : L(`Faltam ${n}`, `${n} left`));
  finText(); tabDots();
}
/* something still to explore inside a tab that is not open: the tab carries the dot, otherwise nothing on screen shows what is left */
function tabDots() {
  const todo = todoUnits();
  $$('[role=tab][aria-controls]').forEach(t => {
    const p = document.getElementById(t.getAttribute('aria-controls'));
    if (!p || todo.some(u => u.el === t)) return;
    markTodo({ host: dotHost(t) }, t.getAttribute('aria-selected') !== 'true' && todo.some(u => p.contains(u.el)));
  });
}
document.addEventListener('click', () => setTimeout(tabDots));
document.addEventListener('keyup', () => setTimeout(tabDots));
/* the single entry point for every "next" gesture: the next module, or (locked) the first thing still to explore */
function tryNext() {
  if (!locked()) {
    if (SOLO && !SOLO.hidden) { if (!langGo()) { solo(false); const h = $('h1', slides[shownIdx()[0]]); h && h.focus({ preventScroll: true }); } return; }
    if (NEXT_CH) location.href = NEXT_CH.f; return;
  }
  const todo = todoUnits(), n = todo.length;
  toast(L(`Explora todos os elementos desta página para avançar. ${n === 1 ? 'Falta 1.' : `Faltam ${n}.`}`, `Explore all the elements on this page to move on. ${n} left.`));
  const hiddenIn = $('[role=tab] .todo-dot');
  const el = todo.map(u => u.el).find(e => e.offsetParent) || (hiddenIn && hiddenIn.closest('[role=tab]'));
  say(L(`Ainda não podes avançar: faltam ${n} elementos por abrir nesta página. Vais para o primeiro.`, `You cannot move on yet: ${n} elements on this page are still to be opened. Going to the first one.`));
  if (el) { const f = el.matches('button,a,[role=tab],input,[tabindex]') ? el : $('button,a,[role=tab],input', el); if (f) setTimeout(() => f.focus({ preventScroll: true }), 350);
    el.scrollIntoView({ block: 'center', behavior: RM ? 'auto' : 'smooth' }); el.classList.remove('gate-pulse'); void el.offsetWidth; el.classList.add('gate-pulse'); setTimeout(() => el.classList.remove('gate-pulse'), 2400); }
}
function gateStart() {
  const mo = new MutationObserver(recs => {
    const hit = new Set();
    recs.forEach(r => { const s = (r.target.closest ? r.target : r.target.parentElement).closest('.slide'); if (s) hit.add(slides.indexOf(s)); });
    hit.forEach(sweep);
  });
  slides.forEach((s, i) => {
    ownCta(s);
    if (s.hasAttribute('data-nogate')) return;
    discover(s, i);
    mo.observe(s, { subtree: true, childList: true, attributes: true, attributeFilter: ['aria-selected', 'aria-pressed', 'aria-expanded', 'aria-checked'] });
  });
}

/* ======================= Scroll: one page per module =======================
 * The section crossing a line at about a third of the window is the one being read (hash + title). A section plays its entrance
 * animation (.on) and counts as seen the first time it comes into view. The red bar under the header shows how far down the page we are. */
const NARROW = matchMedia('(max-width:860px), (max-aspect-ratio:4/5)');
let trackF = 0;
function track() {
  trackF = 0;
  const on = shownIdx(); if (!on.length) return;
  const top = $('.hdr').offsetHeight, line = top + (innerHeight - top) * .35, doc = document.documentElement;
  let n = on[0];
  on.forEach(i => { if (slides[i].getBoundingClientRect().top <= line) n = i; });
  if (innerHeight + scrollY >= doc.scrollHeight - 4) n = on[on.length - 1];
  setCur(n);
  const p = doc.scrollHeight > innerHeight + 4 ? Math.round(scrollY / (doc.scrollHeight - innerHeight) * 100) : 100;
  $('#barFill').style.width = p + '%'; $('.bar').setAttribute('aria-valuenow', p);
}
const onScroll = () => { if (!trackF) trackF = requestAnimationFrame(track); };
function watchSections() {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const s = e.target, i = slides.indexOf(s);
    s.classList.add('on'); io.unobserve(s);
    visited.add(i); store.set('visited', [...visited]); checkDone(); courseMap();
  }), { rootMargin: '0px 0px -12% 0px' });
  slides.forEach(s => io.observe(s));
  /* narrow windows: sections are long, so everything below the fold would play off-screen or keep the reader waiting on a long stagger.
     There each block is held (.pend) until it reaches the screen; blocks arriving together keep a short stagger between them. */
  if (RM || !matchMedia('(max-width:860px),(max-aspect-ratio:4/5)').matches) return;
  const each = new IntersectionObserver(es => {
    let k = 0;
    es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.style.setProperty('--i', k++); e.target.classList.remove('pend'); each.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -5% 0px' });
  $$('.slide .a').forEach(el => { el.classList.add('pend'); each.observe(el); });
}
/* covers: a cue that the page goes on (also a button that moves to the next section) */
$$('.s-cover').forEach(c => {
  const b = document.createElement('button'); b.type = 'button'; b.className = 'scrollcue';
  b.innerHTML = `<span>${L('Desliza para continuar', 'Scroll down to continue')}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>`;
  b.addEventListener('click', () => { const i = slides.indexOf(c), nx = shownIdx().find(k => k > i); if (nx !== undefined) go(nx); });
  c.append(b);
});
/* videos alternate sides down the page (video on the left, then on the right, …) so that a run of videos does not read as one block */
$$('.vid').forEach((v, k) => {
  if (!(k % 2)) return;
  v.classList.add('vid--alt');
  const c = v.style.gridTemplateColumns; if (c) v.style.gridTemplateColumns = c.trim().split(/\s+/).reverse().join(' ');
});
/* one video at a time */
document.addEventListener('play', e => { if (e.target.matches('video')) $$('video').forEach(v => { if (v !== e.target) v.pause(); }); }, true);
/* the covers count sections, not screens */
$$('.s-cover .meta span').forEach(sp => { const t = sp.lastChild; if (t && t.nodeType === 3) t.textContent = t.textContent.replace(/(\d+) ecrãs/, '$1 secções').replace(/(\d+) screens/, '$1 sections'); });

/* ======================= Menu drawer ======================= */
const drawer = $('#drawer'), scrim = $('#scrim'), menuBtn = $('#menuBtn');
const openMenu = on => {
  drawer.classList.toggle('on', on); scrim.classList.toggle('on', on);
  drawer.setAttribute('aria-hidden', !on); menuBtn.setAttribute('aria-expanded', on);
  $('.app').inert = on;
  if (on) setTimeout(() => ($('#courseToc a[aria-current=page]') || $('#menuClose')).focus(), 60); else menuBtn.focus();
};
menuBtn.onclick = () => openMenu(true);
$('#courseToc').addEventListener('click', e => {
  const a = e.target.closest('a.lock'); if (!a) return;
  e.preventDefault(); toast(L(`Este módulo abre depois de concluíres “${ITEM[PRE[a.dataset.id]].t}”.`, `This module opens after you complete “${ITEM[PRE[a.dataset.id]].t}”.`));
});
$('#menuClose').onclick = () => openMenu(false);
scrim.onclick = () => openMenu(false);
/* Esc closes the Índice wherever the focus is (not only inside it), unless a dialog on top takes the Esc first */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && drawer.classList.contains('on') && !document.querySelector('dialog[open]') && ($('#setMenu') || {}).hidden !== false) openMenu(false);
});
drawer.addEventListener('keydown', e => {
  if (e.key === 'Tab') { const f = $$('button,a[href]', drawer), a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
});

/* Menu: the course structure only (Partes and chapters). The current Parte is open, the others fold; done chapters get a tick.
   Built once, then only the marks are updated (so folds the reader opened stay open). */
const ITEM = Object.fromEntries(COURSE.flatMap(p => p.items).map(c => [c.id, c]));
const isLocked = c => GATE && !!PRE[c.id] && c.id !== CH && !dstore.get('done:' + PRE[c.id]);
function courseMap() {
  const el = $('#courseToc'); if (!el) return;
  const done = c => !!dstore.get('done:' + c.id);
  if (!el.dataset.built) {
    el.dataset.built = '1';
    const link = (c, kick) => `<a href="${c.f}" data-id="${c.id}"${c.id === CH ? ' aria-current="page"' : ''}><span class="no" aria-hidden="true"></span><span class="tx">${kick ? `<span class="chip">${kick}</span>` : ''}${c.t}</span><span class="st"></span></a>`;
    el.innerHTML = COURSE.map((p, pi) => {
      /* every Parte, including Início and Parte 1, is the same kind of card: chip + title + counter, chapters inside */
      const [kick, ...rest] = p.part.split(' · ');
      return `<li class="cpart p${pi}"><details name="parts"${p.items.some(c => c.id === CH) ? ' open' : ''}><summary><span class="pt"><span class="chip">${kick}</span>${rest.join(' · ') || L('Apresentação do curso', 'Course introduction')}</span><span class="pc"></span></summary><ul>${p.items.map(c => `<li>${link(c)}</li>`).join('')}</ul></details></li>`;
    }).join('');
  }
  const put = (node, prop, v) => { if (node[prop] !== v) node[prop] = v; };
  $$('a[data-id]', el).forEach(a => {
    const c = ITEM[a.dataset.id], d = done(c), here = a.getAttribute('aria-current') === 'page', lk = isLocked(c);
    a.classList.toggle('done', d); a.classList.toggle('lock', lk);
    if (lk) { a.setAttribute('aria-disabled', 'true'); a.title = L(`Abre depois de concluíres o módulo “${ITEM[PRE[c.id]].t}”`, `Opens after you complete the module “${ITEM[PRE[c.id]].t}”`); } else { a.removeAttribute('aria-disabled'); a.removeAttribute('title'); }
    put($('.no', a), 'textContent', d ? '✓' : '');
    put($('.st', a), 'innerHTML', (d ? `<span class="sr">${L('concluído', 'completed')}</span>` : '') + (lk ? `<span class="sr">${L('bloqueado, abre depois de concluíres o módulo', 'locked, opens after you complete the module')} ${ITEM[PRE[c.id]].t}</span>` : '') + (here ? `<em>${L('Estás aqui', 'You are here')}</em>` : ''));
  });
  COURSE.forEach((p, i) => { const pc = $$('.cpart', el)[i]; if (pc) put($('.pc', pc), 'textContent', `${p.items.filter(done).length} ${L('de', 'of')} ${p.items.length}`); });
  const chapters = COURSE.flatMap(p => p.items).filter(c => c.id !== '0'), n = chapters.filter(done).length;
  $('#meter').style.width = (n / chapters.length * 100) + '%';
  put($('#meterTxt'), 'textContent', L(`${n} de ${chapters.length} módulos concluídos`, `${n} of ${chapters.length} modules completed`));
  const on = shownIdx(), sn = on.filter(i => visited.has(i)).length;
  put($('#meterChap'), 'textContent', L(`Neste módulo: ${sn} de ${on.length} secções vistas`, `In this module: ${sn} of ${on.length} sections seen`));
}

/* ======================= Sound, captions, exit, help ======================= */
const toastEl = $('#toast'); let toastT;
const toast = m => { toastEl.textContent = m; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('on'), 2600); };
/* Portfolio demo: the Toolkit PDFs (downloads/) and internal documents (#demo-indisponivel) are not shared; their buttons stay but only show a message */
const DEMO_BLOCK = a => /(^|\/)downloads\/|^#demo-/i.test(a.getAttribute('href') || '');
document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('a[href]');
  if (!a || !DEMO_BLOCK(a)) return;
  e.preventDefault(); e.stopPropagation();
  toast(L('Ação não disponível nesta versão de demonstração.', 'Action not available in this demo version.'));
}, true);
document.querySelectorAll('a[href]').forEach(a => {
  if (!DEMO_BLOCK(a)) return;
  a.removeAttribute('target'); a.removeAttribute('download'); a.setAttribute('aria-disabled', 'true');
  /* screen readers: the hidden "(abre numa nova janela…)" no longer holds; say what really happens */
  a.querySelectorAll('.sr').forEach(s => { if (/janela|window/i.test(s.textContent)) s.textContent = L(' (não disponível nesta versão de demonstração)', ' (not available in this demo version)'); });
});
const media = () => $$('video,audio');
let muted = !!gstore.get('muted'), cc = gstore.get('cc') !== false;
const applyMedia = () => media().forEach(m => {
  m.muted = muted;
  [...(m.textTracks || [])].forEach(t => { if (t.kind === 'captions' || t.kind === 'subtitles') t.mode = cc ? 'showing' : 'hidden'; });
});
/* captions come from captions.js (window.CAPS), not from <track src>: browsers refuse a track file when the course is opened from disk (file://) */
const vttSecs = s => { const p = s.split(':').map(parseFloat); return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1]; };
$$('video').forEach(v => {
  const t = v.querySelector('track'), m = t && t.src.match(/video-(\w+)\.vtt/), txt = m && window.CAPS && (window.CAPS[EN ? 'en' : 'pt'] || {})[m[1]];
  if (!txt) return;
  const tt = v.addTextTrack('captions', t.label, t.srclang); tt.mode = 'hidden';
  txt.replace(/\r/g, '').split(/\n\n+/).forEach(b => {
    const l = b.split('\n'), i = l.findIndex(x => x.includes('-->'));
    if (i < 0) return;
    const [a, e] = l[i].split('-->').map(x => vttSecs(x.trim()));
    tt.addCue(new VTTCue(a, e, l.slice(i + 1).join('\n')));
  });
  t.remove();
});
/* with the native controls visible the browser lifts the captions above the bar; once the controls hide they drop to the very edge of the picture,
   so lift them one line then. Controls show while paused or while the pointer moves over the video (they hide ~3 s after the last move). */
const capVideos = $$('video').map(v => ({ v, last: 0, lifted: false }));
const capLift = s => {
  const lift = !(s.v.paused || s.v.ended || Date.now() - s.last < 3300);   /* the controls hide ~3 s after the last pointer move OR after the pointer leaves */
  if (lift === s.lifted) return;
  s.lifted = lift;
  [...s.v.textTracks].forEach(t => {
    /* the line number counts to the cue's FIRST line, so a cue of n lines needs -(n + 1) to end one line above the edge */
    [...(t.cues || [])].forEach(c => { c.snapToLines = true; c.line = lift ? -(c.text.split('\n').length + 1) : 'auto'; });
    if (t.mode === 'showing') { t.mode = 'hidden'; t.mode = 'showing'; }   /* a cue already on screen is not laid out again by the change alone */
  });
};
capVideos.forEach(s => {
  ['mousemove', 'mouseenter', 'mouseleave', 'touchstart', 'keydown'].forEach(ev => s.v.addEventListener(ev, () => { s.last = Date.now(); capLift(s); }, { passive: true }));
  ['play', 'pause', 'ended', 'seeked', 'loadedmetadata'].forEach(ev => s.v.addEventListener(ev, () => capLift(s)));
});
setInterval(() => capVideos.forEach(s => { if (!s.v.paused) capLift(s); }), 500);
const muteBtn = $('#muteBtn'), ccBtn = $('#ccBtn');
const syncBtns = () => {
  muteBtn.setAttribute('aria-pressed', muted); muteBtn.dataset.tip = muted ? L('Ativar som', 'Turn sound on') : L('Desativar som', 'Turn sound off');
  ccBtn.setAttribute('aria-pressed', cc); ccBtn.dataset.tip = cc ? L('Desativar legendas', 'Turn captions off') : L('Ativar legendas', 'Turn captions on');
};
muteBtn.onclick = () => { muted = !muted; gstore.set('muted', muted); applyMedia(); syncBtns(); toast(muted ? L('Som desativado', 'Sound off') : L('Som ativo', 'Sound on')); };
ccBtn.onclick = () => {
  cc = !cc; gstore.set('cc', cc); applyMedia(); syncBtns();
  toast(cc ? L('Legendas ativas', 'Captions on') : L('Legendas desativadas', 'Captions off'));
};
media().forEach(m => { m.addEventListener('volumechange', () => { if (m.muted !== muted) { muted = m.muted; gstore.set('muted', muted); syncBtns(); } }); m.addEventListener('loadedmetadata', applyMedia); });
applyMedia(); syncBtns();

/* videos whose file is not in the package yet are marked data-pending and show a placeholder.
   Remove the attribute when the file is delivered. */
$$('.player video[data-pending]').forEach(v => {
  const p = v.closest('.player'); p.classList.add('missing');
  p.insertAdjacentHTML('beforeend', `<div class="vmiss"><b>${v.getAttribute('aria-label') || L('Vídeo', 'Video')}</b><span>${L('O vídeo entra aqui na versão final, com legendas em português.', 'The video will appear here in the final version, with English captions.')}</span></div>`);
  v.remove();
});

const exitDlg = $('#exit');
$('#exitBtn').onclick = () => exitDlg.showModal();
$('#exitCancel').onclick = () => exitDlg.close();
exitDlg.addEventListener('click', e => { if (e.target === exitDlg) exitDlg.close(); });
$('#exitOk').onclick = () => { exitDlg.close(); closeCourse(); };
function closeCourse() {
  media().forEach(m => m.pause());
  /* LMS: SCORM Terminate goes here */
  try { if (window.API && API.LMSFinish) API.LMSFinish(''); else if (window.API_1484_11 && API_1484_11.Terminate) API_1484_11.Terminate(''); } catch (e) {}
  /* portfolio version: leaving the course (Sair, or Terminar at the end) opens the project page of the portfolio, in the same tab */
  location.href = 'https://www.andrealvesdesign.com/sonae-toolkit-psp/';
}
const dlg = $('#help');
$('#helpBtn').onclick = () => dlg.showModal();
$$('[data-help]').forEach(b => b.addEventListener('click', () => dlg.showModal()));
$('#helpClose').onclick = () => dlg.close();
dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
$$('a[aria-disabled=true]').forEach(a => a.addEventListener('click', e => e.preventDefault()));

/* ======================= Generic helpers ======================= */
/* Headings: the panels use h4 under an h2, which skips a level for screen-reader users who navigate by heading.
   The level exposed to assistive technology follows the previous visible heading (+1 at most). The look does not change. */
function fixHeadings(s) {
  /* a stack of (level in the markup, level exposed): headings of the same markup level under the same parent get the same exposed level */
  const st = [];
  $$('h1,h2,h3,h4,h5,h6', s).forEach(h => {
    if (h.closest('[hidden]')) return;
    if (h.dataset.h1) { st.length = 0; st.push([1, 1]); return; }
    const l = +h.tagName[1];
    while (st.length && st[st.length - 1][0] >= l) st.pop();
    const e = st.length ? Math.min(l, st[st.length - 1][1] + 1) : l;
    if (e !== l) h.setAttribute('aria-level', e); else h.removeAttribute('aria-level');
    st.push([l, e]);
  });
}
const fixSoon = () => setTimeout(() => slides.forEach(s => { if (!s.hidden) fixHeadings(s); }), 80);
$('#stage').addEventListener('click', fixSoon); $('#stage').addEventListener('keyup', fixSoon);

const markSeen = t => { if (t.dataset.seen) return; t.dataset.seen = '1'; const lb = t.getAttribute('aria-label'); if (lb) t.setAttribute('aria-label', lb + L(', visto', ', seen')); else t.insertAdjacentHTML('beforeend', `<span class="sr"> (${L('visto', 'seen')})</span>`); };
/* Phones: a list of clickables (vertical tabs, checklist groups) becomes an accordion. The content opens right under the item that was
   tapped, and the same tap closes it again; opening another one closes the first. Decided once, when the page loads.
   Accessibility: the list is a plain group, every item a button with aria-expanded, every panel a region named by its button.
   Works for one panel per item (the panel moves under its button) and for one shared panel (it follows the open item). */
const ACC = NARROW.matches, ACC_SEL = '.vtabs,.chk-groups,.rtabs';
let accSeq = 0;
function disclosure(list, ts, onSelect) {
  const panelOf = t => document.getElementById(t.getAttribute('aria-controls'));
  const shared = new Set(ts.map(panelOf)).size < ts.length;
  list.classList.add('acc'); list.setAttribute('role', 'group'); list.removeAttribute('aria-orientation');
  ts.forEach(t => {
    const p = panelOf(t), on = t.getAttribute('aria-selected') === 'true';
    t.removeAttribute('role'); t.removeAttribute('aria-selected'); t.tabIndex = 0;
    if (!t.id) t.id = 'dt' + (++accSeq);
    t.setAttribute('aria-expanded', on); if (on) markSeen(t);
    if (!p) return;
    p.setAttribute('data-tp', ''); p.setAttribute('role', 'region'); p.removeAttribute('tabindex'); p.setAttribute('aria-labelledby', t.id);
    if (!shared || on) { const home = p.parentElement; t.after(p); if (home && !home.children.length && home !== list) home.hidden = true; }
  });
  const reveal = t => requestAnimationFrame(() => {
    const top = $('.hdr').getBoundingClientRect().bottom, tr = t.getBoundingClientRect(), p = panelOf(t), pb = p && !p.hidden ? p.getBoundingClientRect().bottom : tr.bottom;
    if (tr.top < top + 6 || pb > innerHeight - 6) window.scrollBy({ top: tr.top - top - 10, behavior: RM ? 'auto' : 'smooth' });
  });
  const open = (t, user) => {
    markSeen(t); onSelect(t, ts.indexOf(t), user);
    const p = panelOf(t);
    if (p) { if (p.previousElementSibling !== t) t.after(p); p.hidden = false; p.setAttribute('aria-labelledby', t.id); }
    ts.forEach(x => { const q = panelOf(x); x.setAttribute('aria-expanded', x === t || (!shared && !!q && !q.hidden)); });
    if (user) reveal(t);
  };
  const close = t => { const p = panelOf(t); if (p) p.hidden = true; t.setAttribute('aria-expanded', 'false'); };
  ts.forEach(t => t.addEventListener('click', () => (t.getAttribute('aria-expanded') === 'true' ? close(t) : open(t, true))));
  return { sel: open, ts };
}
function tabs(list, onSelect, vertical) {
  if (ACC && list.matches(ACC_SEL)) return disclosure(list, $$('[role=tab]', list), onSelect);
  const ts = $$('[role=tab]', list);
  const seen = markSeen;
  const sel = (t, user) => { ts.forEach(x => { const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; }); seen(t); onSelect(t, ts.indexOf(t), user); };
  ts.filter(t => t.getAttribute('aria-selected') === 'true').forEach(seen);
  ts.forEach((t, i) => {
    t.addEventListener('click', e => { sel(t, true); if (e.detail === 0) { const p = document.getElementById(t.getAttribute('aria-controls')); if (p && !p.hidden) { if (!p.hasAttribute('tabindex')) p.tabIndex = -1; setTimeout(() => p.focus({ preventScroll: false }), 60); } } });
    t.addEventListener('keydown', e => {
      const map = vertical ? { ArrowDown: 1, ArrowUp: -1, ArrowRight: 1, ArrowLeft: -1 } : { ArrowRight: 1, ArrowLeft: -1 };
      const k = map[e.key]; let n;
      if (k) n = ts[(i + k + ts.length) % ts.length]; else if (e.key === 'Home') n = ts[0]; else if (e.key === 'End') n = ts[ts.length - 1];
      if (n) { e.preventDefault(); sel(n, true); n.focus(); }
    });
  });
  return { sel, ts };
}
function glide(seg) {
  const g = $('.glide', seg), on = $('[aria-selected=true],[aria-pressed=true]', seg); if (!g || !on) return;
  g.style.left = on.offsetLeft + 'px'; g.style.top = on.offsetTop + 'px'; g.style.width = on.offsetWidth + 'px'; g.style.height = on.offsetHeight + 'px';
}
addEventListener('resize', () => $$('.seg').forEach(glide));
const showPanel = (root, t, cls) => $$('[role=tabpanel],[data-tp]', root).forEach(p => {
  if (p.closest('[data-vtabs],[data-steps],[data-segtabs]') !== root) return;
  const on = p.id === t.getAttribute('aria-controls'); p.hidden = !on;
  if (on && cls) { p.classList.remove(cls); void p.offsetWidth; p.classList.add(cls); }
});

/* vertical tabs with "seen" ticks and optional counter ([data-count] in the same slide) */
$$('[data-vtabs]').forEach(root => {
  const seen = new Set([0]), list = $('[role=tablist]', root), n = $$('[role=tab]', list).length, cnt = $('[data-count]', root.closest('.slide'));
  const mark = () => { $$('.vtab', root).forEach((t, i) => t.classList.toggle('seen', seen.has(i))); if (cnt) cnt.textContent = L(`${seen.size} de ${n} vistos`, `${seen.size} of ${n} seen`); };
  tabs(list, (t, i) => { seen.add(i); mark(); showPanel(root, t, 'anim'); }, true);
  mark();
});
/* numbered steps with progress line */
$$('[data-steps]').forEach(root => {
  const fill = $('.fill', root), seen = new Set([0]);
  const { ts } = tabs($('[role=tablist]', root), (t, i) => {
    seen.add(i); ts.forEach((x, j) => x.classList.toggle('seen', seen.has(j)));
    if (fill) fill.style.width = (i * 100 / ts.length) + '%';
    showPanel(root, t, 'swap');
  });
});
/* segmented tabs that switch panels */
$$('[data-segtabs]').forEach(root => {
  const seg = $('.seg', root);
  tabs(seg, t => { showPanel(root, t, 'swap'); glide(seg); });
});
/* reveal buttons: aria-controls target becomes visible */
$$('[data-reveal]').forEach(b => b.addEventListener('click', () => {
  const tg = document.getElementById(b.getAttribute('aria-controls')), o = b.getAttribute('aria-expanded') !== 'true';
  b.setAttribute('aria-expanded', o); tg.hidden = !o;
  if (o) { tg.classList.remove('swap'); void tg.offsetWidth; tg.classList.add('swap'); if (b.dataset.reveal === 'once') b.hidden = true; }
}));
/* video: a play / pause button before each player, visually hidden until it has the keyboard focus (screen readers and keyboard users) */
$$('.player video').forEach(v => {
  const name = (v.getAttribute('aria-label') || L('Vídeo', 'Video')).replace(/^(Vídeo|Video):\s*/, '');
  const b = document.createElement('button'); b.type = 'button'; b.className = 'vplay';
  const upd = () => { b.textContent = (v.paused ? L('Reproduzir o vídeo: ', 'Play the video: ') : L('Pausar o vídeo: ', 'Pause the video: ')) + name; };
  b.addEventListener('click', () => { if (v.paused) v.play().catch(() => {}); else v.pause(); });
  ['play', 'pause', 'ended'].forEach(ev => v.addEventListener(ev, upd)); upd();
  v.closest('.player').before(b);
});
/* sensitive-content note: "ou usa o botão Apoio, …" / "or use the Support button, …" starts on a new line */
$$('.cw > svg').forEach(g => { const b = document.createElement('span'); b.className = 'cw-ic'; b.setAttribute('aria-hidden', 'true'); g.before(b); b.append(g); });
$$('.cw > span:not(.cw-ic)').forEach(s => {
  const t = s.textContent, m = t.match(/,? (ou usa|or use) /);
  if (m) { const br = document.createElement('br'); br.className = 'cw-br'; s.textContent = t.slice(0, m.index) + ' '; s.append(br, t.slice(m.index + m[0].length - m[1].length - 1).trim()); }
  /* the button's name in bold ("Apoio" / "Support") */
  [...s.childNodes].forEach(n => {
    const k = n.nodeType === 3 ? n.textContent.search(/\b(Apoio|Support)\b/) : -1; if (k < 0) return;
    const w = n.textContent.match(/\b(Apoio|Support)\b/)[0], b = document.createElement('b'); b.textContent = w;
    n.replaceWith(n.textContent.slice(0, k), b, n.textContent.slice(k + w.length));
  });
});
/* transcript under every video, built from its captions (window.CAPS); each speaker turn ("– ") starts a paragraph */
$$('.player video').forEach(v => {
  const src = v.getAttribute('src') || ($('source', v) || {}).src || v.currentSrc || '';
  const m = src.match(/video-([\w]+)\.mp4/), caps = window.CAPS && window.CAPS[EN ? 'en' : 'pt'];
  if (!m || !caps || !caps[m[1]]) return;
  const paras = []; let cur = '', last = 0;
  caps[m[1]].split(/\n\s*\n/).forEach(b => {
    const ls = b.split('\n').filter(Boolean), ti = ls.findIndex(x => x.includes('-->')); if (ti < 0) return;
    const sec = x => { const [h, mi, se] = x.trim().split(' ')[0].split(':'); return +h * 3600 + +mi * 60 + parseFloat(se); };
    const [a, z] = ls[ti].split(' --> '), t = sec(a);
    ls.slice(ti + 1).forEach((line, k) => {
      const turn = /^[–-]\s/.test(line), txt = line.replace(/^[–-]\s*/, '').trim();
      /* new paragraph: a new speaker, or a finished sentence after a pause (or after a long paragraph) */
      const ends = /[.!?…»"]$/.test(cur);
      if (cur && (turn || (k === 0 && ends && (t - last > 1.2 || cur.length > 280)))) { paras.push(cur); cur = ''; }
      cur += (cur ? ' ' : '') + (turn ? '– ' : '') + txt;
    });
    last = sec(z);
  });
  if (cur) paras.push(cur);
  const d = document.createElement('details'); d.className = 'transcript';
  const sm = document.createElement('summary'); sm.textContent = L('Ver transcrição do vídeo', 'Show the video transcript');
  const body = document.createElement('div'); body.className = 'tr-body';
  paras.forEach(t => { const pp = document.createElement('p'); pp.textContent = t; body.append(pp); });
  d.append(sm, body); v.closest('.player').after(d);
});
/* "say": polite announcement for screen readers (same live region as the slide changes) */
const say = m => { const a = $('#announce'); a.textContent = ''; setTimeout(() => { a.textContent = m; }, 40); };
/* flip cards: <li class="flip"><button data-front="…" data-back="…"> + .face.front / .face.back (decorative).
   Accessible name = the front; the back is real text in a hidden paragraph that opens with the card and is announced.
   Every grid also gets a "Virar todos" button (pass { all: button } to use an existing one). */
let flipSeq = 0;
function flips(ul, onChange, o = {}) {
  const items = $$('.flip', ul), isOpen = li => li.classList.contains('open');
  items.forEach(li => {
    const b = $('button', li), id = 'fb' + (++flipSeq), r = document.createElement('p');
    li._front = b.dataset.front; li._back = b.dataset.back;
    r.className = 'sr'; r.id = id; r.hidden = true; r.textContent = li._back; li.append(r);
    b.setAttribute('aria-label', li._front); b.setAttribute('aria-controls', id);
  });
  const set = (li, open, quiet) => {
    li.classList.toggle('open', open); $('button', li).setAttribute('aria-expanded', open); $('p.sr', li).hidden = !open;
    if (open && !quiet) say(`${li._front}. ${li._back}`);
  };
  let all = o.all;
  if (!all) { const bar = document.createElement('div'); bar.className = 'flip-tools a'; bar.style.setProperty('--i', $$('.a', ul.closest('.slide')).length); all = document.createElement('button'); all.type = 'button'; all.className = 'pill'; bar.append(all); ul.after(bar); }
  const sync = () => { all.textContent = items.every(isOpen) ? L('Voltar a esconder', 'Hide all again') : L('Virar todos', 'Turn all'); };
  items.forEach(li => { set(li, false, true); $('button', li).addEventListener('click', () => { set(li, !isOpen(li)); sync(); onChange && onChange(); }); });
  all.onclick = () => {
    const open = !items.every(isOpen);
    items.forEach((li, i) => setTimeout(() => {
      set(li, open, true);
      if (i === items.length - 1) { sync(); onChange && onChange(); say(open ? L(`Todos os cartões virados. Lê as ${items.length} respostas, cartão a cartão.`, `All the cards are turned. Read the ${items.length} answers, card by card.`) : L('Os cartões voltaram à frente.', 'The cards are back at the front.')); }
    }, RM ? 0 : i * 90));
  };
  sync();
  return { items, set };
}
/* decision-tree walkthrough in chat form (same look as the pilot's Fluxograma 1).
   cfg = { log, chat, reset, map (selectors), first, nodes: { id: { n, q, opts: [[label, nextId, doHtml]] } },
           ends: { id: { t, html, done } }, auto: { nodeId: optionIndex } }.  `done: true` ticks the last node of the side map (its data-n is the end id).
   Adds, under the chat: "Reproduzir conversa" (the conversation plays by itself, first option unless `auto` says otherwise; pausable, and any
   click of yours pauses it) and "Ler o fluxograma completo em texto" (the whole tree as a list). The log is a role=log live region. */
function flow(cfg) {
  const log = $(cfg.log), chat = $(cfg.chat), reset = $(cfg.reset), map = $$(cfg.map + ' .mn'), T = cfg.nodes;
  let path = [], cur = null, timer = null, playing = false, from = 0, choices = [], quiet = false, endId = null;
  chat.setAttribute('role', 'log'); chat.setAttribute('aria-label', L('Conversa do fluxograma', 'Flowchart conversation')); log.removeAttribute('aria-live');
  const mapSet = (curId, done) => map.forEach(m => { m.classList.toggle('cur', m.dataset.n === curId); m.classList.toggle('done', done.includes(m.dataset.n)); });
  /* on desktop the chat scrolls; on small screens it grows and the slide scrolls, so bring the newest line into view either way */
  const scroll = () => { if (quiet) return; const b = RM ? 'auto' : 'smooth'; if (chat.scrollHeight > chat.clientHeight + 4) chat.scrollTo({ top: chat.scrollHeight, behavior: b }); else if (log.lastElementChild) log.lastElementChild.scrollIntoView({ block: 'nearest', behavior: b }); };
  const add = html => { const li = document.createElement('li'); li.innerHTML = html; log.append(li); return li; };
  function ask(id) {
    const n = T[id]; cur = id;
    add(`<div class="q"><span class="av" aria-hidden="true">${n.n}</span><p class="bub">${n.q}</p></div>`);
    const o = add(`<div class="opts" role="group" aria-label="${L('Respostas', 'Answers')}"></div>`);
    n.opts.forEach(([txt, next, doHtml], k) => {
      const b = document.createElement('button'); b.className = 'opt'; b.textContent = txt;
      b.onclick = () => {
        o.remove(); path.push(id); choices.push(k); back.hidden = false;
        if (n.opts.length > 1) add(`<div class="ans"><span><span class="sr">${L('A tua resposta: ', 'Your answer: ')}</span>${txt}</span></div>`);
        if (doHtml) add(`<div class="do"><b>${L('O que fazer', 'What to do')}</b>${doHtml}</div>`);
        reset.hidden = false;
        if (T[next]) { mapSet(next, path); ask(next); if (!playing && !quiet) $('.opt', log.lastElementChild).focus({ preventScroll: true }); }
        else {
          const e = cfg.ends[next], li = add(`<div class="endc" tabindex="-1"><b>${e.t}</b>${e.html}</div>`); endId = next;
          mapSet(e.done ? next : null, e.done ? [...path, next] : path);
          if (!playing && !quiet) $('.endc', li).focus({ preventScroll: true });
        }
        scroll(); paintMap();
      };
      $('.opts', o).append(b);
    });
  }

  /* automatic playback */
  const play = document.createElement('button'), back = document.createElement('button'), tools = document.createElement('div');
  back.type = 'button'; back.className = 'pill'; back.hidden = true;
  back.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>' + L('Voltar um passo', 'Go back one step');
  play.type = 'button'; play.className = 'pill'; tools.className = 'flow-tools';
  const IC = { play: '<path d="M8 5v14l11-7z" fill="currentColor"/>', pause: '<path d="M8 5v14M16 5v14"/>' };
  const paint = () => { play.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true">${playing ? IC.pause : IC.play}</svg>${playing ? L('Pausar a conversa', 'Pause the conversation') : L('Reproduzir a conversa', 'Play the conversation')}`; };
  const delay = () => Math.min(9000, Math.max(2500, 1300 + [...log.children].slice(from, -1).map(li => li.textContent).join(' ').trim().split(/\s+/).length * 320));
  const stopAuto = () => { playing = false; clearTimeout(timer); timer = null; paint(); };
  const step = () => {
    timer = null; if (!playing) return;
    const items = [...log.children], last = items[items.length - 1], opts = last ? $$('.opt', last) : [];
    if (!opts.length) return stopAuto();
    from = items.length - 1; opts[Math.min(opts.length - 1, (cfg.auto && cfg.auto[cur]) || 0)].click();
    if ($('.endc', log)) return stopAuto();
    timer = setTimeout(step, delay());
  };
  play.onclick = () => {
    if (playing) return stopAuto();
    if ($('.endc', log)) begin();
    from = Math.max(0, log.children.length - 2); playing = true; paint(); timer = setTimeout(step, delay());
  };
  log.addEventListener('click', e => { if (e.isTrusted && playing) stopAuto(); }, true);

  /* the whole tree as text */
  const ids = Object.keys(T), num = id => T[id].n || ids.indexOf(id) + 1;
  const alt = document.createElement('details'); alt.className = 'flowtext';
  alt.innerHTML = `<summary>${L('Ler o fluxograma completo em texto', 'Read the full flowchart as text')}</summary><ol>${ids.map(id => `<li><b>${T[id].q}</b><ul>${T[id].opts.map(([txt, next, d]) =>
    `<li>${T[id].opts.length > 1 ? `<i>${L(`Se responderes «${txt}»:`, `If you answer “${txt}”:`)}</i> ` : ''}${d ? `<div class="alt-do">${d}</div>` : ''}<div class="alt-next">${T[next] ? L(`Segue para a pergunta ${num(next)}.`, `Go to question ${num(next)}.`) : `${L('Fim', 'End')} · ${cfg.ends[next].t}: ${cfg.ends[next].html}`}</div></li>`).join('')}</ul></li>`).join('')}</ol>`;
  reset.before(tools); tools.append(play, back, reset); tools.after(alt);

  /* "Fluxograma visual": the same tree drawn as a flowchart (question box, answers, what to do, next question), like the PDF.
     The whole route is on screen at once; answered steps stay marked and any answer can be changed by clicking another one.
     Same state as the conversation; the two views swap with the buttons above. */
  const view = document.createElement('div'), fm = document.createElement('div');
  view.className = 'fview'; view.setAttribute('role', 'group'); view.setAttribute('aria-label', L('Ver o fluxograma como', 'View the flowchart as'));
  view.innerHTML = `<button type="button" aria-pressed="true" data-ng data-v="chat">${L('Conversa', 'Conversation')}</button><button type="button" aria-pressed="false" data-ng data-v="map">${L('Fluxograma visual', 'Visual flowchart')}</button>`;
  fm.className = 'fmap'; fm.hidden = true; fm.setAttribute('role', 'group'); fm.setAttribute('aria-label', L('Fluxograma visual', 'Visual flowchart'));
  const endBox = k => `<div class="fend" data-end="${k}"><b>${cfg.ends[k].t}</b>${cfg.ends[k].html}</div>`;
  fm.innerHTML = ids.map(id => {
    const n = T[id], first = n.opts[0][1], same = !T[first] && n.opts.every(o => o[1] === first), leads = n.opts.some(o => T[o[1]]);
    const col = n.opts.map(([txt, next, d], k) => `<li class="fo"><button type="button" class="fa" data-id="${id}" data-k="${k}">${txt}</button>${d ? `<div class="fdo"><b>${L('O que fazer', 'What to do')}</b>${d}</div>` : ''}${!T[next] && !same ? endBox(next) : ''}</li>`).join('');
    return `<div class="fn" data-id="${id}"><div class="fq"><i aria-hidden="true">${num(id)}</i><p>${n.q}</p></div><ol class="fopts" style="--c:${n.opts.length}">${col}</ol>${same ? endBox(first) : ''}${leads ? '<span class="farrow" aria-hidden="true"></span>' : ''}</div>`;
  }).join('');
  chat.before(view); chat.after(fm);
  function paintMap() {
    const ended = !!$('.endc', log);
    $$('.fn', fm).forEach(sec => {
      const id = sec.dataset.id, ix = path.indexOf(id), isCur = !ended && cur === id;
      sec.classList.toggle('is-done', ix > -1); sec.classList.toggle('is-cur', isCur); sec.classList.toggle('is-next', ix < 0 && !isCur);
      $$('.fa', sec).forEach(b => { const on = ix > -1 && choices[ix] === +b.dataset.k; b.classList.toggle('on', on); if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); b.disabled = !(ix > -1 || isCur); });
      $$('.fo', sec).forEach((li, k) => li.classList.toggle('on', ix > -1 && choices[ix] === k));
      $$('.fend', sec).forEach(e => e.classList.toggle('on', ended && e.dataset.end === endId));
    });
    const c = $('.fn.is-cur', fm) || $('.fend.on', fm); if (c && !fm.hidden && !quiet) c.scrollIntoView({ block: 'nearest', behavior: RM ? 'auto' : 'smooth' });
  }
  const begin = () => { log.innerHTML = ''; path = []; choices = []; endId = null; reset.hidden = true; back.hidden = true; mapSet(cfg.first, []); from = 0; ask(cfg.first); paint(); paintMap(); };
  /* the conversation is rebuilt from the start with the first answers kept, so another answer can be tried from there */
  const replay = keep => {
    quiet = true; begin();
    /* guarded: under very fast clicking the kept path can be longer than what the rebuilt conversation offers */
    for (const k of keep) { const last = log.lastElementChild, o = last && $$('.opt', last)[k]; if (!o) break; o.click(); }
    quiet = false; back.hidden = !keep.length; reset.hidden = !keep.length; paintMap();
  };
  reset.onclick = () => { stopAuto(); begin(); $('.opt', log).focus(); };
  back.onclick = () => {
    stopAuto(); replay(choices.slice(0, -1));
    const o = $$('.opt', log.lastElementChild); if (o[0] && fm.hidden) o[0].focus({ preventScroll: true });
    scroll(); say(L('Voltaste um passo. Escolhe outra resposta.', 'You went back one step. Choose another answer.'));
  };
  fm.addEventListener('click', e => {
    const b = e.target.closest('.fa'); if (!b || b.disabled) return;
    const k = +b.dataset.k, ix = path.indexOf(b.dataset.id); stopAuto();
    if (ix > -1) { if (choices[ix] === k) return; replay(choices.slice(0, ix)); }
    const o = $$('.opt', log.lastElementChild); if (o[k]) o[k].click();
  });
  view.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return; const m = b.dataset.v === 'map';
    $$('button', view).forEach(x => x.setAttribute('aria-pressed', x === b));
    chat.hidden = m; fm.hidden = !m; if (m) paintMap();
    say(m ? L('Fluxograma visual. Cada resposta é um botão.', 'Visual flowchart. Each answer is a button.') : L('Conversa.', 'Conversation.'));
  });
  begin();
}
/* completion badge confetti */
(() => { const el = $('#confetti'); if (!el) return; const C = ['#DC3228','#000F64','#00CD73','#0073FF','#FFB40F','#B45AF5','#FF41DC']; let h = '';
  for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2 + (i % 3) * .2, r = 150 + (i % 4) * 22;
    h += `<i style="--c:${C[i % C.length]};--s:${8 + (i % 3) * 5}px;--x:${Math.round(Math.cos(a) * r)}px;--y:${Math.round(Math.sin(a) * r)}px;--d:${(i % 5) * 40}ms"></i>`; }
  el.innerHTML = h; })();
/* ======================= Language =======================
 * Portuguese lives at the root, English in en/ (same file names). The cover has a chooser (.langpick): the link of the current language is
 * the one thing the cover asks for (it opens the gate), the other one opens the same page in the other language.
 * Every page also gets a small switch in the Índice, which keeps the slide the reader is on. The last language used is remembered (psp:lang). */
const HERE = EN ? 'en' : 'pt';
/* this page's source fragment, found from its name in the address (with or without .html; the folder itself is index.html) */
const pageSrc = () => {
  const n = decodeURIComponent(location.pathname.split('/').pop() || '').replace(/\.html$/, '');
  return Object.keys(PG_).find(k => PG_[k][EN ? 1 : 0] === n) || 'index.html';
};
/* the same page in language l */
const langHref = l => (l === HERE ? '' : l === 'en' ? 'en/' : '../') + PG(pageSrc(), l === 'en' ? 1 : 0);
gstore.set('lang', HERE);
/* the language screen is the first slide of index.html; once a language was picked in this tab the home page opens on the cover */
const LANG_KEY = 'psp:' + NS + ':lang-ok';
const langDone = () => { try { sessionStorage.setItem(LANG_KEY, '1'); } catch (e) {} };
if ($('.langpick') && !location.hash) { try { if (sessionStorage.getItem(LANG_KEY)) history.replaceState(null, '', '#m0-capa'); } catch (e) {} }
/* choosing only marks a language (radio buttons); "Seguinte" then moves on: next slide in the same language, or the other language's cover */
const langBtns = $$('.langpick .lbtn');
/* the "Seguinte"/"Next" button follows the language that was just picked, before the page itself changes */
const NEXT_TXT = { pt: 'Seguinte', en: 'Next' };
/* picking the other language switches the whole screen at once (header, Índice, buttons): the same language screen opens in that
   language with the card already chosen, so only "Seguinte" is left to press */
const PICK_KEY = 'psp:lang-pick';
const pick = (b, kb) => {
  if (b.dataset.lang !== HERE) {
    try { sessionStorage.setItem(PICK_KEY, b.dataset.lang + (kb ? ':k' : '')); } catch (e) {}
    gstore.set('lang', b.dataset.lang); location.replace(langHref(b.dataset.lang) + '#m0-idioma'); return;
  }
  langBtns.forEach(x => { x.setAttribute('aria-checked', x === b); x.tabIndex = x === b ? 0 : -1; }); const t = $('#next .t'); if (t) t.textContent = NEXT_TXT[b.dataset.lang]; langDone();
};
(() => {
  let p = null; try { p = sessionStorage.getItem(PICK_KEY); sessionStorage.removeItem(PICK_KEY); } catch (e) {}
  const [l, kb] = (p || '').split(':'), b = l && langBtns.find(x => x.dataset.lang === l);
  /* the card gets the keyboard focus back only when it was chosen with the keyboard (a click shows no focus ring) */
  if (b && l === HERE) { pick(b); if (kb) requestAnimationFrame(() => b.focus({ preventScroll: true })); }
})();
langBtns.forEach((b, i) => {
  b.addEventListener('click', e => pick(b, e.detail === 0));
  b.addEventListener('keydown', e => {
    const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!k) return;
    e.preventDefault(); e.stopPropagation(); const n = langBtns[(i + k + langBtns.length) % langBtns.length]; pick(n, true); n.focus();
  });
});
const langGo = () => {
  const sel = $('.lbtn[aria-checked=true]'); if (!sel || sel.dataset.lang === HERE) return false;
  gstore.set('lang', sel.dataset.lang); location.href = langHref(sel.dataset.lang) + '#m0-capa'; return true;
};
/* language button in the header, beside the sound button: the flag of the language in use; a click opens the same section in the other language.
   Not on the language screen (.is-solo). */
(() => {
  const o = HERE === 'en' ? 'pt' : 'en', b = document.createElement('button');
  b.type = 'button'; b.id = 'langBtn'; b.className = 'ibtn ibtn--flag';
  b.setAttribute('aria-label', L('Idioma: português. Mudar para inglês', 'Language: English. Switch to Portuguese'));
  b.dataset.tip = L('Mudar para inglês', 'Switch to Portuguese');
  b.innerHTML = `<img src="${EN ? '../' : ''}assets/img/flag-${HERE}.svg" alt="">`;
  b.addEventListener('click', () => { gstore.set('lang', o); langDone(); location.href = langHref(o) + location.hash; });
  $('#muteBtn').after(b);
})();
/* phones and tablets: captions, sound, language and exit live in one settings button (the real buttons stay in the page, hidden, and keep doing the work).
   Apoio stays on the bar: it must always be one touch away. */
(() => {
  const icon = sel => { const i = $(sel); return i ? i.cloneNode(true).outerHTML : ''; };
  const btn = document.createElement('button');
  btn.type = 'button'; btn.id = 'setBtn'; btn.className = 'ibtn'; btn.dataset.tip = L('Definições', 'Settings');
  btn.setAttribute('aria-label', L('Definições', 'Settings')); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'setMenu');
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h9M19 7h1M4 17h1M11 17h9"/><circle cx="16" cy="7" r="2.6"/><circle cx="8" cy="17" r="2.6"/></svg>';
  const over = document.createElement('div'); over.id = 'setOver'; over.hidden = true;
  const m = document.createElement('div');
  m.id = 'setMenu'; m.hidden = true; m.tabIndex = -1; m.setAttribute('role', 'group'); m.setAttribute('aria-label', L('Definições', 'Settings'));
  const row = (id, ic, t, sw) => `<button type="button" class="setrow" id="${id}"${sw ? ' aria-pressed="false"' : ''}><span class="seti" aria-hidden="true">${ic}</span><span class="sett">${t}</span>${sw ? '<span class="setsw" aria-hidden="true"></span>' : ''}</button>`;
  m.innerHTML = row('setCc', '<span class="cc">CC</span>', L('Legendas', 'Captions'), true)
    + row('setMute', icon('#muteBtn .on'), L('Som', 'Sound'), true)
    + `<button type="button" class="setrow" id="setLang" aria-label="${L('Idioma: português. Mudar para inglês', 'Language: English. Switch to Portuguese')}"><span class="seti" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.500 5.500 12 3z"/></svg></span><span class="sett">${L('Idioma', 'Language')}</span><span class="setseg" data-on="${HERE}" aria-hidden="true"><i>PT</i><i>EN</i></span></button>`
    + row('setText', '<b class="aa">Aa</b>', L('Texto maior', 'Larger text'), true)
    + row('setMotion', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h3l2-6 4 12 2-6h3"/></svg>', L('Animações', 'Animations'), true)
    + row('setExit', icon('#exitBtn svg'), L('Sair do curso', 'Leave the course'));
  $('.hdr').append(over, m);
  /* the button sits where it is seen, so Tab goes left to right: on computers right after the language flag (before Apoio / Sair),
     on phones and tablets at the end of the bar (after Apoio) */
  const DESK = matchMedia('(min-width:861px) and (min-aspect-ratio:4/5) and (min-height:501px)');
  const place = () => { if (DESK.matches && $('#langBtn')) $('#langBtn').after(btn); else $('.tools').append(btn); };
  place(); DESK.addEventListener('change', place);
  const sync = () => {
    $('#setCc').setAttribute('aria-pressed', $('#ccBtn').getAttribute('aria-pressed') === 'true');
    $('#setMute').setAttribute('aria-pressed', $('#muteBtn').getAttribute('aria-pressed') !== 'true');
    $('#setText').setAttribute('aria-pressed', !!PREFS.text); $('#setMotion').setAttribute('aria-pressed', !PREFS.still);
  };
  const open = on => {
    if (on) { sync(); /* the menu opens under its button, right edges aligned */ m.style.right = Math.max(0, $('.hdr').getBoundingClientRect().right - btn.getBoundingClientRect().right) + 'px'; }
    m.hidden = over.hidden = !on; btn.setAttribute('aria-expanded', on); document.body.classList.toggle('set-open', on);
    if (on) m.focus({ preventScroll: true });
  };
  btn.addEventListener('click', () => open(m.hidden));
  over.addEventListener('click', () => open(false));
  $('#setCc').addEventListener('click', () => { $('#ccBtn').click(); sync(); });
  $('#setMute').addEventListener('click', () => { $('#muteBtn').click(); sync(); });
  const pref = (k, cls, on, msg) => { PREFS[k] = on; savePrefs(); cls.split(' ').forEach(c => document.documentElement.classList.toggle(c, on)); sync(); say(msg); };
  $('#setText').addEventListener('click', () => pref('text', 'txt-lg txt-sp', !PREFS.text, PREFS.text ? L('Texto normal', 'Normal text') : L('Texto maior', 'Larger text')));
  $('#setMotion').addEventListener('click', () => pref('still', 'no-motion', !PREFS.still, PREFS.still ? L('Animações ativas', 'Animations on') : L('Animações desativadas', 'Animations off')));
  /* same behaviour as the two switches: the control moves and the menu stays open, also after the page reloads in the other language */
  const SET_OPEN = 'psp:' + NS + ':set-open';
  $('#setLang').addEventListener('click', () => {
    $('.setseg').dataset.on = HERE === 'en' ? 'pt' : 'en';
    try { sessionStorage.setItem(SET_OPEN, '1'); } catch (e) {}
    setTimeout(() => $('#langBtn').click(), RM ? 0 : 220);
  });
  $('#setExit').addEventListener('click', () => { open(false); $('#exitBtn').click(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !m.hidden) { open(false); btn.focus(); } });
  addEventListener('resize', () => { if (!m.hidden && !btn.offsetParent) open(false); });
  try { if (sessionStorage.getItem(SET_OPEN)) { sessionStorage.removeItem(SET_OPEN); if (btn.offsetParent) open(true); } } catch (e) {}
})();
/* the skip link must not touch the hash (it belongs to the slide id) */
$('.skip').addEventListener('click', e => { e.preventDefault(); $('#stage').focus(); });
const langOk = () => { try { return !!sessionStorage.getItem(LANG_KEY); } catch (e) { return false; } };
/* back in a module that is not finished (opened without a hash, e.g. from the Índice): open on the section where the reader was */
const resume = () => { const c = store.get('cur'); return !location.hash && c > 0 && c < N && !dstore.get('done:' + CH) ? { i: c } : null; };
function start() {
  /* a page without an h1 (Parte 5 · the nine sheets): its first heading is exposed as the level-1 heading */
  if (!$('h1')) { const h = $$('.stage h2')[0]; if (h) { h.setAttribute('role', 'heading'); h.setAttribute('aria-level', '1'); h.dataset.h1 = '1'; } }
  { const x = target(); if (x && x.to) { location.replace(x.to); return; } }
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  gateStart(); watchSections();
  const t = target() || resume();
  if (SOLO) solo(t ? slides[t.i] === SOLO : !langOk());
  addEventListener('hashchange', () => { const x = target(); if (!x) return; if (x.to) location.replace(x.to); else go(x.i); });
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  if (t && !slides[t.i].hidden && t.i !== shownIdx()[0]) {
    go(t.i, false, false);
    /* pictures above the section can still change its position while they load */
    addEventListener('load', () => { if (cur === t.i) slides[t.i].scrollIntoView({ block: 'start' }); }, { once: true });
  } else { window.scrollTo(0, 0); track(); }
  ui(); fixSoon(); $$('.seg').forEach(glide);
}
return { $, $$, RM, pad, store, hooks, go, idx, tabs, glide, flips, flow, toast, say, start, tryNext, gate: { on: GATE, pending, locked, units, cleared }, get cur() { return cur; } };
})();
