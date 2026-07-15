/* FORMA Kitchens — header state, mobile nav, reveals, estimator, sticky CTA */
(function () {
  'use strict';

  /* ---- Header: transparent over hero, solid after ---- */
  var header = document.getElementById('site-header');
  var onScroll = function () {
    header.classList.toggle('is-solid', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Hero video: nudge autoplay; retry on first interaction if blocked
   * (iOS Low-Power Mode / data-saver block muted autoplay; poster covers the gap) ---- */
  var heroVid = document.querySelector('.hero-media video');
  if (heroVid) {
    var tryPlay = function () {
      var p = heroVid.play();
      if (p && p.catch) p.catch(function () {});
    };
    var onFirstTouch = function () {
      if (heroVid.paused) tryPlay();
      window.removeEventListener('pointerdown', onFirstTouch);
      window.removeEventListener('scroll', onFirstTouch);
    };
    heroVid.addEventListener('canplay', tryPlay, { once: true });
    tryPlay();
    window.addEventListener('pointerdown', onFirstTouch, { passive: true });
    window.addEventListener('scroll', onFirstTouch, { passive: true });
  }

  /* ---- Hero: pinned two-stage crossfade driven by scroll ---- */
  var track = document.querySelector('.hero-track');
  var s1 = document.getElementById('hero-s1');
  var s2 = document.getElementById('hero-s2');
  var hint = document.getElementById('hero-hint');
  var bar = document.getElementById('hero-progress');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp01 = function (n) { return Math.min(1, Math.max(0, n)); };
  var heroStages = function () {
    if (!track || reduced) return;
    var r = track.getBoundingClientRect();
    var span = track.offsetHeight - window.innerHeight;
    var t = span > 0 ? clamp01(-r.top / span) : 0;
    /* stage 1: hold, then fade/lift away */
    var o1 = t < 0.2 ? 1 : clamp01(1 - (t - 0.2) / 0.2);
    s1.style.opacity = o1;
    s1.style.transform = 'translateY(' + (-t * 140) + 'px)';
    /* stage 2: rise in, then hold */
    var o2 = t > 0.48 ? clamp01((t - 0.48) / 0.2) : 0;
    s2.style.opacity = o2;
    s2.style.transform = 'translateY(' + ((1 - o2) * 36) + 'px)';
    s2.style.pointerEvents = o2 > 0.5 ? 'auto' : 'none';
    if (hint) hint.style.opacity = t < 0.02 ? 1 : clamp01(1 - (t - 0.02) / 0.05);
    if (bar) bar.style.width = (t * 100) + '%';
  };
  window.addEventListener('scroll', heroStages, { passive: true });
  window.addEventListener('resize', heroStages, { passive: true });
  heroStages();

  /* ---- Mobile nav drawer ---- */
  var toggle = document.getElementById('nav-toggle');
  var drawer = document.getElementById('mobile-nav');
  var setDrawer = function (open) {
    drawer.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.innerHTML = open ? '&#10005;' : '&#9776;';
    document.body.style.overflow = open ? 'hidden' : '';
  };
  toggle.addEventListener('click', function () {
    setDrawer(!drawer.classList.contains('is-open'));
  });
  drawer.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') setDrawer(false);
  });

  /* ---- Reveal on scroll ---- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var groups = new Map();
    revealEls.forEach(function (el) {
      var p = el.parentElement;
      var n = groups.get(p) || 0;
      el.style.transitionDelay = (n * 100) + 'ms';
      groups.set(p, n + 1);
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---- Estimator ----
   * Indicative AUD pricing per linear metre of cabinetry.
   * Tune these rates to your real cost model. */
  var RATES = { lume: 760, nera: 890, officina: 980 };
  var LAYOUT_FACTOR = { galley: 1.0, l: 1.05, u: 1.1, island: 1.05 };
  var ISLAND_FLAT = 2900; /* island module, flat add-on */

  var form = document.getElementById('estimator');
  var metres = document.getElementById('metres');
  var metresVal = document.getElementById('metres-val');
  var estimate = document.getElementById('estimate');

  var money = function (n) {
    return '$' + (Math.round(n / 100) * 100).toLocaleString('en-AU');
  };

  var recalc = function () {
    var lm = parseFloat(metres.value);
    var collection = form.querySelector('input[name="collection"]:checked').value;
    var layout = form.querySelector('input[name="layout"]:checked').value;
    var base = RATES[collection] * lm * LAYOUT_FACTOR[layout];
    if (layout === 'island') base += ISLAND_FLAT;
    metresVal.textContent = lm.toFixed(1) + ' m';
    estimate.innerHTML = money(base * 0.9) + ' &ndash; ' + money(base * 1.12);
  };
  form.addEventListener('input', recalc);
  recalc();

  /* Collection cards preselect their collection in the estimator */
  document.querySelectorAll('[data-collection]').forEach(function (card) {
    card.addEventListener('click', function () {
      var input = form.querySelector('input[name="collection"][value="' + card.dataset.collection + '"]');
      if (input) { input.checked = true; recalc(); }
    });
  });

  /* Submit → Netlify Forms (form name "quote").
   * Submissions appear under Forms in the Netlify dashboard; set up an
   * email notification there. On localhost there is no Netlify backend,
   * so dev mode skips the POST and shows the success state directly. */
  var showSuccess = function () {
    form.hidden = true;
    var success = document.getElementById('quote-success');
    success.hidden = false;
    success.classList.add('is-in');
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var required = form.querySelectorAll('input[required]');
    var ok = true;
    required.forEach(function (f) {
      f.style.borderColor = '';
      if (!f.value.trim()) { f.style.borderColor = '#FFC000'; ok = false; }
    });
    if (!ok) return;

    document.getElementById('estimate-field').value = estimate.textContent;
    var isLocal = /^(localhost|127\.|192\.168\.)/.test(window.location.hostname);
    if (isLocal) { showSuccess(); return; }

    var btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString()
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      showSuccess();
    }).catch(function () {
      btn.disabled = false;
      btn.textContent = 'Send me my itemised quote';
      var err = document.getElementById('quote-error');
      if (!err) {
        err = document.createElement('p');
        err.id = 'quote-error';
        err.className = 'quote-fine';
        err.style.color = '#FFC000';
        form.appendChild(err);
      }
      err.textContent = 'Something went wrong sending your request — please try again, or email hello@formakitchens.com.au directly.';
    });
  });

  /* ---- Sticky mobile CTA: show after hero, hide over quote section ---- */
  var sticky = document.getElementById('sticky-cta');
  var hero = document.getElementById('top');
  var quote = document.getElementById('quote');
  var onStickyScroll = function () {
    var pastHero = window.scrollY > hero.offsetHeight - window.innerHeight;
    var q = quote.getBoundingClientRect();
    var overQuote = q.top < window.innerHeight && q.bottom > 0;
    sticky.classList.toggle('is-visible', pastHero && !overQuote);
  };
  window.addEventListener('scroll', onStickyScroll, { passive: true });
  onStickyScroll();
}());
