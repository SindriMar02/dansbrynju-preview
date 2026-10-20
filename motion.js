/* DANS BRYNJU PÉTURS: motion layer (GSAP 3.13 + ScrollTrigger + Lenis, vendored).
   Rules carried from earlier builds:
   - Lenis is desktop only (guarded on the same line as `new Lenis(`).
   - ScrollTrigger ignores mobile resize, and touch scrubs use a small lerp (iOS momentum).
   - A trigger never moves: moving layers sit inside a still frame.
   - Masks keep headroom so Icelandic accents (Á Í Ó Ö) are never clipped.
   - The header never hides.
   - Everything is visible without JS, and reduced motion gets fades only.
   app.js calls the hooks below through window.DBPMotion once `ready` is true. */
(function () {
  'use strict';
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  var root = document.documentElement;
  var M = window.DBPMotion = { lenis: null, ready: false };
  function lift() { root.classList.remove('js-pre', 'is-intro'); }
  if (!window.gsap || !window.ScrollTrigger || /[?&]static=1/.test(location.search)) { root.classList.add('motion-off'); lift(); return; }

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  gsap.ticker.lagSmoothing(0);
  var SCRUB = isTouch ? 0.35 : true;
  var EASE = 'expo.out';
  root.classList.add('motion-on');
  function $(s) { return document.querySelector(s); }
  function $$(s) { return [].slice.call(document.querySelectorAll(s)); }

  /* ---------- smooth scroll: desktop only ---------- */
  if (!isTouch && !RM && window.Lenis) { M.lenis = new Lenis({ lerp: 0.1, autoRaf: false }); M.lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(function (t) { M.lenis.raf(t * 1000); }); root.classList.add('has-lenis'); }
  function headerH() { var t = $('.top'); return t ? t.getBoundingClientRect().height : 72; }
  M.scrollTo = function (el) {
    var y = Math.max(0, el.getBoundingClientRect().top + window.scrollY - headerH());
    if (M.lenis) M.lenis.scrollTo(y, { duration: 1.1, easing: function (x) { return 1 - Math.pow(1 - x, 4); } });
    else window.scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' });
  };
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || a.closest('#menu') || a.classList.contains('skip') || e.defaultPrevented) return;
    var el = document.getElementById(a.getAttribute('href').slice(1)); if (!el) return;
    e.preventDefault(); M.scrollTo(el);
  });

  /* ---------- masks: each line of a heading rises out of its own window ---------- */
  function mask(el) {
    if (!el || el.dataset.masked) return [];
    el.dataset.masked = '1';
    var parts = el.children.length && [].every.call(el.children, function (c) { return c.tagName === 'SPAN'; }) ? [].slice.call(el.children) : [el];
    return parts.map(function (p) {
      var inner = document.createElement('span'); inner.className = 'mask__in';
      while (p.firstChild) inner.appendChild(p.firstChild);
      var m = document.createElement('span'); m.className = 'mask'; m.appendChild(inner); p.appendChild(m);
      return inner;
    });
  }

  /* headings split into letters inside one window per word; screen readers get the plain text */
  function chars(h) {
    if (h.dataset.masked) return [];
    h.dataset.masked = '1';
    var text = h.textContent.trim(), out = [];
    h.setAttribute('aria-label', text); h.textContent = '';
    text.split(/\s+/).forEach(function (w, i) {
      if (i) h.appendChild(document.createTextNode(' '));
      var m = document.createElement('span'), inner = document.createElement('span');
      m.className = 'mask mask--word'; m.setAttribute('aria-hidden', 'true'); inner.className = 'mask__in';
      w.split('').forEach(function (c) { var sp = document.createElement('span'); sp.className = 'ch'; sp.textContent = c; inner.appendChild(sp); out.push(sp); });
      m.appendChild(inner); h.appendChild(m);
    });
    return out;
  }

  /* ---------- 1. entrance: the stacked name on blue, then the stage (once per visit) ---------- */
  var heroLines = mask($('.hero h1'));
  var seen = false; try { seen = sessionStorage.getItem('dbp.intro') === '1'; sessionStorage.setItem('dbp.intro', '1'); } catch (e) {}
  var intro = gsap.timeline({ defaults: { ease: EASE } });
  if (!RM && !seen) {
    var cur = document.createElement('div'); cur.className = 'curtain'; cur.setAttribute('aria-hidden', 'true');
    cur.innerHTML = '<span class="curtain__mark"><span class="mask"><b class="mask__in">DANS</b></span><span class="mask"><b class="mask__in">BRYNJU</b></span><span class="mask"><b class="mask__in">PETURS</b></span></span>';
    document.body.appendChild(cur);
    root.classList.remove('is-intro');
    var words = cur.querySelectorAll('.mask__in');
    intro.from(words, { yPercent: 110, duration: 0.6, stagger: 0.06 })
      .to(words, { yPercent: -110, duration: 0.4, stagger: 0.04, ease: 'expo.in' }, '+=0.15')
      .to(cur, { clipPath: 'inset(0 0 100% 0)', duration: 0.6, ease: 'expo.inOut' }, '-=0.12')
      .add(function () { cur.remove(); });
  }
  root.classList.remove('is-intro');
  var at = RM || seen ? 0 : '-=0.4';
  if (RM) {
    intro.from('.hero__panel', { opacity: 0, duration: 0.4, ease: 'none' });
  } else {
    intro.from('.top__row > *', { y: -12, opacity: 0, duration: 0.6, stagger: 0.05 }, at)
      .from('.hero__img', { scale: 1.1, duration: 1.6 }, '<')
      .from(heroLines, { yPercent: 110, duration: 1, stagger: 0.08 }, '<0.05')
      .from('.hero__sub, .hero__panel .btn', { y: 18, opacity: 0, duration: 0.8, stagger: 0.08 }, '<0.25');
  }
  root.classList.remove('js-pre');

  if (!RM) {
    /* ---------- 2. hero photo drifts slower than the page (trigger = the section) ---------- */
    gsap.to('.hero__img', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: SCRUB } });

    /* hero copy lifts away faster than the photo as the stage scrolls off (trigger = the section) */
    gsap.to('.hero h1', { y: -70, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: SCRUB } });
    gsap.to('.hero__sub, .hero__panel .btn', { y: -35, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: SCRUB } });

    /* ---------- 3. headings: letters rise out of each word, one after another, then drift with the scroll ----------
       Reveals start at 82% of the screen and use power ease (not expo) so the move is still happening where the eye is. */
    $$('.sec-head h2, .tt__title').forEach(function (h) {
      var sec = h.closest('section') || h.parentNode;
      var tl = gsap.timeline({ scrollTrigger: { trigger: h.parentNode, start: 'top 82%' } });
      tl.from(chars(h), { yPercent: 120, rotate: 6, duration: 0.95, ease: 'power4.out', stagger: 0.03 });
      var p = h.parentNode.querySelector('p'); if (p) tl.from(p, { y: 34, opacity: 0, duration: 0.9, ease: 'power3.out' }, '<0.25');
      /* glides in from the right while the section approaches and settles on the grid exactly when the section reaches the top (where anchor links land) */
      gsap.fromTo(h, { x: isTouch ? 28 : 48 }, { x: 0, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top top+=' + Math.round(headerH()), scrub: SCRUB } });
    });

    /* ---------- 4. rows and cards: a longer travel and a slower ease, so the arrival is seen ---------- */
    [
      ['.pricelist > div, .lvlist > div, .fine li, .evlist .ev', { y: 60, opacity: 0 }],
      ['#classes .cls', { y: 50, opacity: 0 }],
      ['.roster li', { x: -40, opacity: 0 }],
      ['.evcard', { y: 90, scale: 0.94, opacity: 0 }],
      ['.plist .place', { y: 80, opacity: 0 }],
      ['.foot__grid > div', { y: 40, opacity: 0 }]
    ].forEach(function (g) {
      var els = $$(g[0]); if (!els.length) return;
      gsap.set(els, g[1]);
      /* never `once` in this file: a trigger that kills itself while an earlier one refreshes (before load) throws inside ScrollTrigger 3.13 */
      ScrollTrigger.batch(els, { start: 'top 88%', onEnter: function (b) { b = b.filter(function (n) { return !n.dataset.shown && (n.dataset.shown = '1'); }); if (b.length) gsap.to(b, { x: 0, y: 0, scale: 1, opacity: 1, duration: 1.05, ease: 'power3.out', stagger: Math.min(0.09, 0.6 / b.length), overwrite: true, clearProps: 'transform,opacity' }); } });
    });

    /* prices count up from zero when the list arrives */
    var dds = $$('.pricelist dd').filter(function (d) { return /^\d{1,3}(\.\d{3})+\s*kr\.$/.test(d.textContent.trim()); });
    if (dds.length) ScrollTrigger.create({ trigger: '.pricelist', start: 'top 82%', onEnter: function () {
      dds.forEach(function (d, i) {
        if (d.dataset.counted) return; d.dataset.counted = '1';
        var end = parseInt(d.textContent.replace(/\D/g, ''), 10), o = { v: 0 };
        gsap.to(o, { v: end, duration: 1.4, delay: 0.15 + i * 0.09, ease: 'power3.out', onUpdate: function () { d.textContent = (Math.round(o.v / 100) * 100).toLocaleString('de-DE') + ' kr.'; }, onComplete: function () { d.textContent = end.toLocaleString('de-DE') + ' kr.'; } });
      });
    } });

    /* the big footer name stacks up */
    gsap.from('.foot .mark--big b', { yPercent: 100, opacity: 0, duration: 1, ease: 'power4.out', stagger: 0.1, scrollTrigger: { trigger: '.foot', start: 'top 85%' } });

    /* ---------- 5. photographs: the frame opens wide from a small window, the photo settles inside it ---------- */
    [['.band', '.band img'], ['.team__frame', '.team__frame img']].forEach(function (p) {
      var frame = $(p[0]), img = $(p[1]); if (!frame || !img) return;
      gsap.fromTo(frame, { clipPath: 'inset(20% 14% 20% 14%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: frame, start: 'top 100%', end: 'top 25%', scrub: SCRUB } });
      gsap.fromTo(img, { yPercent: -6, scale: 1.35 }, { yPercent: 6, scale: 1.08, ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: SCRUB } });
    });
    $$('.evcard__img img').forEach(function (img) { gsap.fromTo(img, { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: img.parentNode, start: 'top bottom', end: 'center 40%', scrub: SCRUB } }); });

    /* ---------- 5b. the style names run across the page, faster and in the direction you scroll ---------- */
    var track = $('.marquee__track');
    if (track) {
      var loop = gsap.to(track, { xPercent: -50, duration: 26, ease: 'none', repeat: -1 }), dir = 1;
      ScrollTrigger.create({ trigger: '.marquee', start: 'top bottom', end: 'bottom top', onUpdate: function (st) {
        dir = st.direction; var v = Math.min(Math.abs(st.getVelocity()) / 220, 7);
        gsap.to(loop, { timeScale: dir * (1 + v), duration: 0.15, overwrite: true, onComplete: function () { gsap.to(loop, { timeScale: dir, duration: 0.9, ease: 'power2.out' }); } });
      } });
    }
    gsap.fromTo('.tt__bg', { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.tt__head', start: 'top bottom', end: 'bottom top', scrub: SCRUB } });
  } else {
    $$('.sec-head, .tt__headin').forEach(function (h) { gsap.from(h, { opacity: 0, duration: 0.5, ease: 'none', scrollTrigger: { trigger: h, start: 'top 90%' } }); });
  }

  /* ---------- 6a. the nav marks the section on screen ---------- */
  $$('.nav a[href^="#"]').forEach(function (a) {
    var sec = document.getElementById(a.getAttribute('href').slice(1)); if (!sec) return;
    ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: function (s) { a.classList.toggle('is-here', s.isActive); } });
  });

  /* ---------- 6b. the sticky filter bar casts a shadow while it is stuck ---------- */
  ScrollTrigger.create({ trigger: '.tt__head', start: function () { return 'bottom top+=' + Math.round(headerH()); }, endTrigger: '.tt', end: function () { return 'bottom top+=' + Math.round(headerH() + 80); }, toggleClass: { targets: '.tt__bar', className: 'is-stuck' }, invalidateOnRefresh: true });

  /* ---------- 7. timetable hooks ---------- */
  var pending = null;
  M.listSwap = function (list, dir, render) {
    if (pending) { gsap.killTweensOf(list.children); pending = null; }
    if (RM || !list.children.length) { render(); M.listIn(list); return; }
    pending = render;
    gsap.to(list.children, { x: -12 * dir, opacity: 0, duration: 0.12, ease: 'power2.out', onComplete: function () {
      if (pending !== render) return; pending = null; render();
      gsap.fromTo(first(list), { x: 18 * dir, opacity: 0 }, { x: 0, opacity: 1, duration: 0.28, ease: EASE, stagger: 0.02, clearProps: 'transform,opacity' });
    } });
  };
  /* a frequent action: only the rows on screen move, the rest are simply there */
  function first(list) { return [].slice.call(list.children, 0, 8); }
  M.listIn = function (list) {
    if (RM) { gsap.fromTo(list.children, { opacity: 0 }, { opacity: 1, duration: 0.25, clearProps: 'opacity' }); return; }
    gsap.fromTo(first(list), { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.28, ease: EASE, stagger: 0.02, clearProps: 'transform,opacity' });
  };
  /* grows out of the chip that opened it */
  M.popIn = function (pop, chip) {
    if (RM) return;
    var ox = chip ? chip.getBoundingClientRect().left + chip.offsetWidth / 2 - pop.getBoundingClientRect().left : pop.offsetWidth / 2;
    gsap.fromTo(pop, { opacity: 0, y: -6, scale: 0.97, transformOrigin: Math.round(ox) + 'px 0px' }, { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: EASE, clearProps: 'transform,opacity,transformOrigin' });
  };
  M.count = function (el, text) {
    if (RM || el.textContent === text) { el.textContent = text; return; }
    gsap.killTweensOf(el);
    gsap.to(el, { yPercent: -40, opacity: 0, duration: 0.1, ease: 'power2.out', onComplete: function () { el.textContent = text; gsap.fromTo(el, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.22, ease: EASE, clearProps: 'transform,opacity' }); } });
  };
  /* the selected day: a "selected" copy of the strip sits on top, clipped to one cell; the clip window slides
     between days, so the white block and the dark text flip exactly where it passes (never dark-on-dark) */
  M.indicator = function (strip, now) {
    var on = strip.querySelector(':scope > .day[aria-pressed="true"]'), lay = strip.querySelector(':scope > .days__on');
    if (!lay) { lay = document.createElement('div'); lay.className = 'days__on'; lay.setAttribute('aria-hidden', 'true'); strip.appendChild(lay); now = true; }
    lay.innerHTML = '';
    [].forEach.call(strip.querySelectorAll(':scope > .day'), function (d) { var c = d.cloneNode(true); c.removeAttribute('aria-label'); c.setAttribute('aria-pressed', 'true'); c.setAttribute('tabindex', '-1'); lay.appendChild(c); });
    if (!on) { gsap.set(lay, { opacity: 0 }); return; }
    var W = strip.offsetWidth, H = strip.offsetHeight, l = on.offsetLeft, t = on.offsetTop;
    var clip = 'inset(' + t + 'px ' + (W - l - on.offsetWidth) + 'px ' + (H - t - on.offsetHeight) + 'px ' + l + 'px)';
    gsap.set(lay, { opacity: 1 });
    gsap.to(lay, { clipPath: clip, duration: now || RM || !lay.dataset.ready ? 0 : 0.28, ease: EASE, overwrite: true });
    lay.dataset.ready = '1';
  };
  var strip = $('#days');
  if (strip) {
    M.indicator(strip, true);
    if (window.ResizeObserver) new ResizeObserver(function () { M.indicator(strip, true); }).observe(strip);
  }

  /* ---------- 8. menu: the panel drops in, the links follow; the icon morphs in CSS ---------- */
  M.menuOpen = function (menu) {
    if (M.lenis) M.lenis.stop();
    if (RM) { gsap.fromTo(menu, { opacity: 0 }, { opacity: 1, duration: 0.2, clearProps: 'opacity' }); return; }
    gsap.fromTo(menu, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.42, ease: EASE, clearProps: 'clipPath' });
    gsap.fromTo(menu.querySelectorAll('a'), { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.4, ease: EASE, stagger: 0.035, delay: 0.08, clearProps: 'transform,opacity' });
  };
  M.menuClose = function (menu, done) {
    gsap.killTweensOf(menu); gsap.killTweensOf(menu.querySelectorAll('a'));
    if (RM) { gsap.to(menu, { opacity: 0, duration: 0.15, onComplete: function () { gsap.set(menu, { clearProps: 'opacity' }); done(); } }); return; }
    gsap.fromTo(menu, { clipPath: 'inset(0 0 0% 0)' }, { clipPath: 'inset(0 0 100% 0)', duration: 0.26, ease: 'power2.out', onComplete: function () { gsap.set(menu, { clearProps: 'clipPath' }); gsap.set(menu.querySelectorAll('a'), { clearProps: 'transform,opacity' }); done(); } });
  };
  M.menuClosed = function (y) { if (M.lenis) { M.lenis.start(); M.lenis.scrollTo(y, { immediate: true, force: true }); } ScrollTrigger.update(); if (Math.abs(document.body.scrollHeight - lastH) > 2) { lastH = document.body.scrollHeight; soonRefresh(); } };

  /* ---------- keep measurements honest: fonts, images, and the timetable growing or shrinking ---------- */
  var refT = 0, lastH = 0;
  function soonRefresh() { clearTimeout(refT); refT = setTimeout(function () { if (document.body.classList.contains('is-menu-open')) return; ScrollTrigger.refresh(); }, 180); }
  if (window.ResizeObserver) new ResizeObserver(function () { var h = document.body.scrollHeight; if (Math.abs(h - lastH) > 2 && !document.body.classList.contains('is-menu-open')) { lastH = h; soonRefresh(); } }).observe(document.body);
  var lastW = window.innerWidth;
  window.addEventListener('resize', function () { if (isTouch && window.innerWidth === lastW) return; lastW = window.innerWidth; ScrollTrigger.refresh(); });
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); if (strip) M.indicator(strip, true); });
  M.ready = true;
})();
