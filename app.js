/* DANS BRYNJU PÉTURS v3: the timetable is visible at once (pattern A from the 21st.dev and
   Pinterest research: day strip + class list, filters optional, never a questionnaire).
   Filters (aldur, staður, stíll, getustig) live in one sticky bar and are remembered. */
(function () {
  'use strict';

  var CLASSES = window.DBP_CLASSES || [];
  var ABLER = 'https://www.sportabler.com/shop/dansbrynjupeturs';
  var NB = ' ';

  /* ---------------- their facts (brynjapeturs.is, fetched 2026-10-20) ---------------- */
  var VENUES = {
    ir:            { area: 'Breiðholt', name: 'ÍR heimilið', addr: 'Skógarseli 12', note: 'Danssalurinn er ekki í nýju byggingunni, heldur í eldra húsinu til vinstri. Gengið er inn um aðalinngang, við dönsum á efri hæð.' },
    gerduberg:     { area: 'Breiðholt', name: 'Gerðuberg', long: 'Menningarmiðstöðin Gerðuberg', addr: 'Gerðubergi 1', note: 'Gengið inn á torgið og inn um dyr að bókasafni eða inn um inngang á neðri hæð, aðkeyrsla á móti sundlaug. Kennt í speglasalnum á jarðhæð.' },
    herinn:        { area: 'Laugardalur', name: 'Hjálpræðisherinn', long: 'Hús Hjálpræðishersins', addr: 'Suðurlandsbraut 72', note: 'Stóri salurinn til vinstri við inngang.' },
    fylkissel:     { area: 'Árbær', name: 'Fylkissel', addr: 'Norðlingabraut 12', note: 'Gengið inn um þungar stáldyr hægra megin við aðalinngang, kennt í sal á 2. hæð.' },
    sjaland:       { area: 'Garðabær', name: 'Sjálandsskóli', addr: 'Löngulínu 8, Garðabæ', note: 'Gengið inn um aðalinngang. Kennt í frístundaheimilinu í danssal á 2. hæð.' },
    korinn:        { area: 'Kópavogur', name: 'Kórinn', addr: 'Vallakór 12–14, Kópavogi', note: 'Kennt í minni hátíðarsalnum á 2. hæð.' },
    grotta:        { area: 'Seltjarnarnes', name: 'Grótta', long: 'Íþróttahús Gróttu', addr: 'við Suðurströnd, Seltjarnarnesi', note: 'Kennt í samkomusalnum á 2. hæð í „gamla húsinu“.' },
    grafarvogur:   { area: 'Grafarvogur', name: 'Dalhús', long: 'Íþróttahús Grafarvogs', addr: 'Dalhúsum 2', note: 'Gengið inn um inngang á móti útivellinum, ekki sundlaugarmegin. Salur er á 2. hæð.' },
    hafnarfjordur: { area: 'Hafnarfjörður', name: 'Strandgata', long: 'Íþróttahúsið við Strandgötu', addr: 'Strandgötu, Hafnarfirði', note: 'Salur er beint til hægri hjá „nýja“ aðalinngangnum.' },
    vesturbaer:    { area: 'Vesturbær', name: 'Dansverkstæðið', addr: 'Hjarðarhaga 47', note: 'Gengið inn bakatil, við dönsum í sal 1.', isNew: true }
  };
  var VK = ['ir', 'gerduberg', 'herinn', 'fylkissel', 'sjaland', 'korinn', 'grotta', 'grafarvogur', 'hafnarfjordur', 'vesturbaer'];
  var STYLE = { hiphop: 'Hiphop', toprock: 'Top Rock', locking: 'Locking', choreo: 'Choreo', freestyle: 'Freestyle', party: 'Partýtími' };
  var SK = ['hiphop', 'toprock', 'locking', 'choreo', 'freestyle', 'party'];
  var LEVEL = { all: 'All levels', byr: 'Byrjendur', mid: 'Miðstig', fram: 'Framhald' };
  var LVPICK = [
    { k: 'byr', name: 'Byrjandi', sub: '0 til 2 ára reynsla. Byrjenda- og All levels hópar.' },
    { k: 'mid', name: 'Miðstig', sub: '3 ára + reynsla. Miðstigs- og All levels hópar.' },
    { k: 'fram', name: 'Framhald', sub: '5 til 8 ára + reynsla. Háð samþykki kennara.' }
  ];
  var DOW = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  var DSHORT = ['Sun', 'Mán', 'Þri', 'Mið', 'Fim', 'Fös', 'Lau'];
  var DFULL = ['sunnudagur', 'mánudagur', 'þriðjudagur', 'miðvikudagur', 'fimmtudagur', 'föstudagur', 'laugardagur'];
  var DPL = { mon: 'mánudaga', tue: 'þriðjudaga', wed: 'miðvikudaga', thu: 'fimmtudaga', fri: 'föstudaga' };
  var MONTHS = ['janúar', 'febrúar', 'mars', 'apríl', 'maí', 'júní', 'júlí', 'ágúst', 'september', 'október', 'nóvember', 'desember'];
  var AGES = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

  /* their 2026 calendar (autumn) */
  var TERM_START = new Date(2026, 7, 31), TERM_END = new Date(2026, 11, 4), LAST = new Date(2026, 11, 8);
  var CAL = [
    { date: new Date(2026, 9, 27), title: 'Street Dans Einvígið', where: 'Iðnó' },
    { date: new Date(2026, 10, 1), title: 'Unglist', where: 'Borgarleikhúsið' },
    { date: new Date(2026, 10, 21), title: 'Nemendasýningar', where: 'Seljaskóli' },
    { date: new Date(2026, 11, 4), title: 'Síðasti kennsludagur haustannar', where: '' },
    { date: new Date(2026, 11, 7), title: 'Uppbótartímar', where: 'ÍR 13 + miðstig og Herinn 20 +' },
    { date: new Date(2026, 11, 8), title: 'Uppbótartímar', where: 'ÍR 12 + og 16 + framhald' }
  ];
  var NEXT = [
    { date: new Date(2026, 9, 27), title: 'Street Dans Einvígið', where: 'Iðnó', sub: 'Eina Street dans battl landsins fyrir dansara á framhaldsstigi, óháð landamærum. Haldið síðan 2012.' },
    { date: new Date(2026, 10, 1), title: 'Unglist', where: 'Borgarleikhúsið', sub: '' },
    { date: new Date(2026, 10, 21), title: 'Nemendasýningar', where: 'Seljaskóli', sub: 'Hóparnir sýna það sem þeir hafa unnið að á önninni.' },
    { date: new Date(2026, 11, 4), title: 'Haustönn lýkur', where: '', sub: '' }
  ];
  var PAST = [
    { when: 'Ágúst 2026', img: 'ev-udo', alt: 'Hluti kennarateymisins saman í Blackpool', title: 'UDO World Championships' },
    { when: '22. ágúst 2026', img: 'ev-menning', alt: 'Dansarar Dans Brynju Péturs í Hörpu á Menningarnótt 2026', title: 'Menningarnótt' },
    { when: '17. júní 2026', img: 'ev-17juni', alt: 'Dansari á sviði fyrir framan fullt svæði á 17. júní 2026', title: '17. júní í Reykjavík' },
    { when: 'Malmö 2025', img: 'ev-malmo', alt: 'Hópurinn á Hip Hop Weekend í Malmö, úrslit í Showcase flokki', title: 'Sigur á Hip Hop Weekend' }
  ];

  /* ---------------- dates ---------------- */
  var q = /[?&]today=(\d{4})-(\d{2})-(\d{2})/.exec(location.search);
  var NOW = q ? new Date(+q[1], +q[2] - 1, +q[3], 14, 0) : new Date();
  function dayOnly(d) { var x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
  var TODAY = dayOnly(NOW);
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function monday(d) { var x = dayOnly(d); return addDays(x, -((x.getDay() + 6) % 7)); }
  function same(a, b) { return a.getTime() === b.getTime(); }
  function mins(t) { var p = t.split(':'); return +p[0] * 60 + +p[1]; }
  var WEEKS = [];
  for (var w = monday(TODAY < TERM_START ? TERM_START : (TODAY > LAST ? LAST : TODAY)); w <= LAST; w = addDays(w, 7)) WEEKS.push(w);
  function teaching(d) { return d >= TERM_START && d <= TERM_END && d.getDay() >= 1 && d.getDay() <= 5; }

  /* ---------------- state ---------------- */
  var KEY = 'dbp.v3';
  var st = { age: null, venue: null, style: null, level: null, week: 0, day: null };
  try { var sv = JSON.parse(localStorage.getItem(KEY) || 'null'); if (sv) { if (AGES.indexOf(sv.age) > -1) st.age = sv.age; if (VENUES[sv.venue]) st.venue = sv.venue; if (STYLE[sv.style]) st.style = sv.style; if (LEVEL[sv.level]) st.level = sv.level; } } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify({ age: st.age, venue: st.venue, style: st.style, level: st.level })); } catch (e) {} }
  function any() { return st.age != null || st.venue || st.style || st.level; }

  function ageOk(a) { return st.age == null || (a[0] <= st.age && st.age <= a[1]); }
  function lvOk(l) { if (!st.level) return true; if (st.level === 'fram') return l === 'fram'; return l === st.level || l === 'all'; }
  function fits(c) { return ageOk(c.a) && lvOk(c.l) && (!st.venue || c.v === st.venue) && (!st.style || c.s === st.style); }
  function on(d) { var k = DOW[d.getDay()]; return teaching(d) ? CLASSES.filter(function (c) { return c.d === k; }) : []; }
  function ageText(al) { return al.replace('+', NB + '+') + NB + 'ára'; }
  function timar(n) { return n === 1 ? 'tími' : 'tímar'; }

  var $ = function (s) { return document.querySelector(s); };
  function el(tag, cls, txt) { var n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; }

  /* ---------------- filter bar + popover ---------------- */
  var pop = $('#pop'), popOpts = $('#popOpts'), popTitle = $('#popTitle'), openChip = null;
  var VALUE = {
    age: function () { return st.age == null ? 'Allir' : st.age === 18 ? '18+' : st.age + NB + 'ára'; },
    venue: function () { return st.venue ? VENUES[st.venue].area + (st.venue === 'ir' || st.venue === 'gerduberg' ? ' · ' + VENUES[st.venue].name : '') : 'Allir'; },
    style: function () { return st.style ? STYLE[st.style] : 'Allir'; },
    level: function () { return st.level ? LVPICK.filter(function (l) { return l.k === st.level; })[0].name : 'Öll'; }
  };
  function renderBar() {
    document.querySelectorAll('.fchip').forEach(function (b) {
      var f = b.dataset.f; b.querySelector('.fchip__v').textContent = VALUE[f]();
      b.classList.toggle('is-set', f === 'age' ? st.age != null : !!st[f]);
    });
    $('#fClear').hidden = !any();
    var n = CLASSES.filter(fits).length, cnt = $('#fCount');
    if (!cnt) { cnt = el('p', 'fcount'); cnt.id = 'fCount'; cnt.setAttribute('aria-live', 'polite'); $('.filters').appendChild(cnt); }
    var txt = any() ? n + NB + timar(n) + ' á viku passa' : CLASSES.length + ' tímar á viku';
    if (MO()) MO().count(cnt, txt); else cnt.textContent = txt;
  }
  function option(label, sub, pressed, onPick, cls) {
    var b = el('button', 'opt' + (cls ? ' ' + cls : '')); b.type = 'button'; b.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    b.appendChild(el('span', 'opt__l', label)); if (sub) b.appendChild(el('span', 'opt__s', sub));
    b.addEventListener('click', function () { onPick(); closePop(true); afterChange(); });
    popOpts.appendChild(b); return b;
  }
  function countIf(patch) {
    var keep = { age: st.age, venue: st.venue, style: st.style, level: st.level };
    Object.keys(patch).forEach(function (k) { st[k] = patch[k]; });
    var n = CLASSES.filter(fits).length;
    Object.keys(keep).forEach(function (k) { st[k] = keep[k]; });
    return n;
  }
  function fillPop(f) {
    popOpts.innerHTML = ''; popOpts.className = 'pop__opts pop__opts--' + f;
    if (f === 'age') {
      popTitle.textContent = 'Aldur dansarans';
      option('Allur aldur', null, st.age == null, function () { st.age = null; }, 'opt--wide');
      AGES.forEach(function (a) { var n = countIf({ age: a }); var b = option(a === 18 ? '18+' : String(a), n + NB + timar(n), st.age === a, function () { st.age = a; }); if (!n) b.disabled = true; });
    } else if (f === 'venue') {
      popTitle.textContent = 'Staður';
      option('Allir staðir', countIf({ venue: null }) + ' tímar', !st.venue, function () { st.venue = null; }, 'opt--wide');
      VK.forEach(function (k) { var v = VENUES[k], n = countIf({ venue: k }); var b = option(v.area, v.name + ' · ' + n + NB + timar(n), st.venue === k, function () { st.venue = k; }); if (!n) b.disabled = true; });
    } else if (f === 'style') {
      popTitle.textContent = 'Dansstíll';
      option('Allir stílar', null, !st.style, function () { st.style = null; }, 'opt--wide');
      SK.forEach(function (k) { var n = countIf({ style: k }); var b = option(STYLE[k], n + NB + timar(n), st.style === k, function () { st.style = k; }); if (!n) b.disabled = true; });
    } else {
      popTitle.textContent = 'Getustig';
      option('Öll getustig', null, !st.level, function () { st.level = null; }, 'opt--wide');
      LVPICK.forEach(function (l) { option(l.name, l.sub, st.level === l.k, function () { st.level = l.k; }, 'opt--wide'); });
    }
  }
  function placePop(chip) {
    var bar = $('.tt__barin').getBoundingClientRect(), r = chip.getBoundingClientRect();
    if (window.matchMedia('(max-width:640px)').matches) { pop.style.left = ''; return; }
    var left = Math.min(r.left - bar.left, bar.width - pop.offsetWidth);
    pop.style.left = Math.max(0, left) + 'px';
  }
  function openPop(chip, viaKey) {
    if (openChip === chip) { closePop(viaKey); return; }
    if (openChip) openChip.setAttribute('aria-expanded', 'false');
    openChip = chip; chip.setAttribute('aria-expanded', 'true');
    fillPop(chip.dataset.f); pop.hidden = false; placePop(chip); if (MO()) MO().popIn(pop, chip);
    var first = popOpts.querySelector('[aria-pressed="true"]') || popOpts.querySelector('button:not(:disabled)');
    (viaKey ? first : pop).focus({ preventScroll: true });
  }
  function closePop(returnFocus) {
    if (!openChip) return;
    var chip = openChip; openChip = null; chip.setAttribute('aria-expanded', 'false'); pop.hidden = true;
    if (returnFocus && document.documentElement.getAttribute('data-input') === 'key') chip.focus({ preventScroll: true });
  }
  document.querySelectorAll('.fchip').forEach(function (b) { b.addEventListener('click', function (e) { openPop(b, e.detail === 0); }); });
  $('#fClear').addEventListener('click', function () { st.age = st.venue = st.style = st.level = null; closePop(false); afterChange(); });
  document.addEventListener('click', function (e) { if (openChip && !pop.contains(e.target) && !e.target.closest('.fchip')) closePop(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (openChip) closePop(true); else closeMenu(true); } });
  window.addEventListener('resize', function () { if (openChip) placePop(openChip); });

  /* ---------------- day strip ---------------- */
  function pickDefaultDay() {
    var mon = WEEKS[st.week], d;
    for (var i = 0; i < 5; i++) { d = addDays(mon, i); if (d >= TODAY && on(d).length) return d; }
    for (i = 0; i < 5; i++) { d = addDays(mon, i); if (on(d).length || CAL.some(function (e) { return same(e.date, d); })) return d; }
    return mon;
  }
  function renderDays() {
    var mon = WEEKS[st.week], strip = $('#days'); strip.querySelectorAll(':scope > .day').forEach(function (n) { n.remove(); });
    if (!st.day || st.day < mon || st.day > addDays(mon, 4)) st.day = pickDefaultDay();
    for (var i = 0; i < 5; i++) {
      (function (d) {
        var n = on(d).filter(fits).length, ev = CAL.some(function (e) { return same(e.date, d); });
        var b = el('button', 'day' + (same(d, TODAY) ? ' is-today' : '') + (d < TODAY ? ' is-past' : '')); b.type = 'button';
        b.setAttribute('aria-pressed', same(d, st.day) ? 'true' : 'false');
        b.setAttribute('aria-label', DFULL[d.getDay()] + ' ' + d.getDate() + '. ' + MONTHS[d.getMonth()] + ', ' + n + ' ' + timar(n));
        b.appendChild(el('span', 'day__name', same(d, TODAY) ? 'Í dag' : DSHORT[d.getDay()]));
        b.appendChild(el('span', 'day__num', String(d.getDate())));
        b.appendChild(el('span', 'day__n', teaching(d) ? (n ? n + NB + timar(n) : 'Enginn') : (ev ? 'Viðburður' : 'Frí')));
        b.addEventListener('click', function () { if (same(d, st.day)) return; var dir = d > st.day ? 1 : -1; swap(function () { st.day = d; }, dir); });
        strip.appendChild(b);
      })(addDays(mon, i));
    }
    var end = addDays(mon, 4);
    var label = mon.getDate() + '.' + (mon.getMonth() !== end.getMonth() ? ' ' + MONTHS[mon.getMonth()] : '') + '–' + end.getDate() + '. ' + MONTHS[end.getMonth()];
    var wkend = CAL.filter(function (e) { return e.date > end && e.date < addDays(mon, 7); });
    $('#wkLabel').textContent = 'Vikan ' + label + (wkend.length ? '. Um helgina: ' + wkend.map(function (e) { return e.title + (e.where ? ' í ' + e.where : '') + ', ' + DFULL[e.date.getDay()] + ' ' + e.date.getDate() + '. ' + MONTHS[e.date.getMonth()].slice(0, 3) + '.'; }).join(' ') : '');
    $('#wkPrev').disabled = st.week <= 0; $('#wkNext').disabled = st.week >= WEEKS.length - 1;
    if (MO()) MO().indicator(strip);
  }
  /* change the day or week: the strip updates at once, the list leaves and arrives in the direction of travel */
  function swap(apply, dir) {
    apply(); renderDays();
    if (MO()) MO().listSwap($('#classes'), dir, function () { renderList(false); }); else renderList(true);
  }
  $('#wkPrev').addEventListener('click', function () { if (st.week > 0) swap(function () { st.week--; st.day = null; }, -1); });
  $('#wkNext').addEventListener('click', function () { if (st.week < WEEKS.length - 1) swap(function () { st.week++; st.day = null; }, 1); });

  /* ---------------- the class list ---------------- */
  function renderList(animate) {
    var d = st.day, list = $('#classes'), evBox = $('#ttEvent');
    list.innerHTML = '';
    var evs = CAL.filter(function (e) { return same(e.date, d); });
    evBox.hidden = !evs.length; evBox.textContent = evs.map(function (e) { return e.title + (e.where ? ', ' + e.where : ''); }).join(' · ');
    if (!teaching(d)) {
      list.appendChild(el('li', 'empty', d > TERM_END ? 'Haustönn lauk 4. desember. Skráning á vorönn verður auglýst hér og á Instagram.' : 'Engin kennsla þennan dag.'));
      return;
    }
    var all = on(d), mine = all.filter(fits).sort(function (a, b) { return mins(a.f) - mins(b.f) || VK.indexOf(a.v) - VK.indexOf(b.v); });
    if (!mine.length) {
      var li = el('li', 'empty');
      li.appendChild(document.createTextNode('Enginn tími passar þennan dag. '));
      var alt = null;
      for (var i = 0; i < 5; i++) { var x = addDays(WEEKS[st.week], i); if (!same(x, d) && on(x).filter(fits).length) { alt = x; break; } }
      if (alt) { var b = el('button', 'linkish', 'Sjá ' + DFULL[alt.getDay()] + ' (' + on(alt).filter(fits).length + ')'); b.type = 'button'; b.addEventListener('click', function () { swap(function () { st.day = alt; }, alt > d ? 1 : -1); }); li.appendChild(b); }
      else if (any()) { var c = el('button', 'linkish', 'Hreinsa síur'); c.type = 'button'; c.addEventListener('click', function () { $('#fClear').click(); }); li.appendChild(c); }
      list.appendChild(li); return;
    }
    var nowM = same(d, TODAY) ? NOW.getHours() * 60 + NOW.getMinutes() : -1;
    mine.forEach(function (c, i) {
      var v = VENUES[c.v], li = el('li', 'cls' + (nowM >= mins(c.t) ? ' is-past' : ''));
      var t = el('div', 'cls__time'); t.appendChild(el('b', null, c.f)); t.appendChild(el('span', null, 'til ' + c.t)); li.appendChild(t);
      var m = el('div', 'cls__main');
      var h = el('h3', null, STYLE[c.s]);
      h.appendChild(el('span', 'chip', ageText(c.al)));
      if (c.l !== 'all') h.appendChild(el('span', 'chip chip--' + c.l, LEVEL[c.l])); else h.appendChild(el('span', 'chip chip--all', 'All levels'));
      m.appendChild(h);
      m.appendChild(el('p', 'cls__where', v.name + ', ' + v.area + ' · ' + c.k));
      if (c.n === 2) {
        var other = CLASSES.filter(function (x) { return x.g === c.g && x !== c; })[0];
        var tw = el('p', 'cls__twice'); tw.appendChild(el('span', 'tag tag--2x', '2x'));
        tw.appendChild(document.createTextNode('Hópurinn hittist líka ' + DPL[other.d] + ' kl. ' + other.f + (other.s !== c.s ? ' (' + STYLE[other.s] + ')' : '')));
        m.appendChild(tw);
      }
      li.appendChild(m);
      var go = el('div', 'cls__go');
      go.appendChild(el('p', 'cls__price', (c.n === 2 ? '65.900' : '39.900') + NB + 'kr. önnin'));
      var a = el('a', 'btn btn--blue', 'Skrá'); a.href = ABLER; a.target = '_blank'; a.rel = 'noopener';
      a.setAttribute('aria-label', 'Skrá í ' + STYLE[c.s] + ', ' + ageText(c.al) + ', ' + v.name + ', á Abler');
      go.appendChild(a); li.appendChild(go);
      if (animate && !REDUCE && !MO() && i < 14) { li.classList.add('is-in'); li.style.transitionDelay = (i * 25) + 'ms'; }
      list.appendChild(li);
    });
    if (animate && MO()) MO().listIn(list);
    else if (animate && !REDUCE) requestAnimationFrame(function () { requestAnimationFrame(function () { list.querySelectorAll('.is-in').forEach(function (n) { n.classList.remove('is-in'); }); }); });
  }

  /* ---------------- levels, events, team, places ---------------- */
  function renderLevels() {
    var yours = !st.level ? [] : st.level === 'fram' ? ['Framhald'] : [st.level === 'byr' ? 'Byrjendur' : 'Miðstig', 'All levels'];
    document.querySelectorAll('.lvlist div').forEach(function (d) { d.classList.toggle('is-yours', yours.indexOf(d.querySelector('dt').textContent) > -1); });
  }
  function renderEvents() {
    var n = $('#evNext'); n.innerHTML = '';
    NEXT.filter(function (e) { return e.date >= TODAY; }).forEach(function (e) {
      var li = el('li', 'ev');
      var t = el('time', null, e.date.getDate() + '. ' + MONTHS[e.date.getMonth()].slice(0, 3) + '.'); t.dateTime = e.date.getFullYear() + '-' + String(e.date.getMonth() + 1).padStart(2, '0') + '-' + String(e.date.getDate()).padStart(2, '0');
      li.appendChild(t);
      var body = el('div'); body.appendChild(el('h3', null, e.title + (e.where ? ', ' + e.where : ''))); if (e.sub) body.appendChild(el('p', null, e.sub));
      li.appendChild(body);
      var days = Math.round((e.date - TODAY) / 86400000);
      li.appendChild(el('span', 'ev__soon', days === 0 ? 'Í dag' : days === 1 ? 'Á morgun' : 'Eftir ' + days + ' daga'));
      n.appendChild(li);
    });
    var p = $('#evPast'); p.innerHTML = '';
    PAST.forEach(function (e) {
      var c = el('article', 'evcard');
      var im = el('img'); im.src = 'assets/img/' + e.img + '.jpg'; im.alt = e.alt; im.loading = 'lazy'; im.width = 576; im.height = 720;
      var fr = el('div', 'evcard__img'); fr.appendChild(im); c.appendChild(fr); c.appendChild(el('p', null, e.when)); c.appendChild(el('h3', null, e.title));
      p.appendChild(c);
    });
  }
  function renderTeam() {
    var map = {};
    CLASSES.forEach(function (c) {
      c.k.split(' og ').forEach(function (nm) {
        var r = map[nm] || (map[nm] = { name: nm, places: [], mine: false });
        var a = VENUES[c.v].area; if (r.places.indexOf(a) < 0) r.places.push(a);
        if (any() && fits(c)) r.mine = true;
      });
    });
    var ul = $('#roster'); ul.innerHTML = '';
    Object.keys(map).sort(function (a, b) { return a.localeCompare(b, 'is'); }).forEach(function (k) {
      var r = map[k], li = el('li', (r.mine ? 'is-yours' : '') + (any() && !r.mine ? ' is-off' : ''));
      li.appendChild(el('b', null, r.name)); li.appendChild(el('span', null, r.places.join(', ')));
      ul.appendChild(li);
    });
  }
  function renderPlaces() {
    var ul = $('#places'); ul.innerHTML = '';
    VK.forEach(function (k) {
      var v = VENUES[k], li = el('li', 'place' + (st.venue === k ? ' is-yours' : ''));
      li.appendChild(el('p', 'place__area', v.area + (v.isNew ? ' · nýtt' : '')));
      li.appendChild(el('h3', null, v.long || v.name));
      li.appendChild(el('p', 'place__addr', v.addr));
      li.appendChild(el('p', 'place__note', v.note));
      var a = el('a', 'place__go', 'Leiðarlýsing'); a.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent((v.long || v.name) + ', ' + v.addr); a.target = '_blank'; a.rel = 'noopener';
      li.appendChild(a); ul.appendChild(li);
    });
  }

  var REDUCE = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  function MO() { var m = window.DBPMotion; return m && m.ready ? m : null; }
  function afterChange() { save(); renderBar(); renderDays(); renderList(true); renderLevels(); renderTeam(); renderPlaces(); }

  /* ---------------- menu (focus-guard: pointer → panel, keyboard → first link) ---------------- */
  var btn = $('#menuBtn'), menu = $('#menu'), lbl = btn.querySelector('.top__menu-l'), keepY = 0, closing = false;
  function openMenu(viaKey) {
    if (closing) return;
    keepY = window.scrollY;
    document.body.style.top = -keepY + 'px'; document.body.classList.add('is-menu-open');
    menu.hidden = false; btn.setAttribute('aria-expanded', 'true'); lbl.textContent = 'Loka';
    if (MO()) MO().menuOpen(menu);
    (viaKey ? menu.querySelector('a') : menu).focus({ preventScroll: true });
  }
  function closeMenu(returnFocus, then) {
    if (menu.hidden || closing) return;
    closing = true; btn.setAttribute('aria-expanded', 'false'); lbl.textContent = 'Valmynd';
    function finish() {
      closing = false; menu.hidden = true;
      document.body.classList.remove('is-menu-open'); document.body.style.top = '';
      window.scrollTo({ top: keepY, behavior: 'instant' });
      if (MO()) MO().menuClosed(keepY);
      if (returnFocus) btn.focus({ preventScroll: true });
      if (then) then();
    }
    if (MO()) MO().menuClose(menu, finish); else finish();
  }
  btn.addEventListener('click', function (e) { if (menu.hidden) openMenu(e.detail === 0); else closeMenu(e.detail === 0); });
  menu.addEventListener('click', function (e) {
    var a = e.target.closest('a'); if (!a) return;
    var h = a.getAttribute('href');
    if (h && h.charAt(0) === '#') {
      e.preventDefault(); var t = document.querySelector(h);
      closeMenu(false, function () { if (!t) return; if (MO()) MO().scrollTo(t); else t.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth', block: 'start' }); });
    }
    else closeMenu(false);
  });

  /* ---------------- boot ---------------- */
  renderEvents();
  save(); renderBar(); renderDays(); renderList(false); renderLevels(); renderTeam(); renderPlaces();
})();
