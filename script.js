(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Header shadow on scroll
  const header = $('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', scrollY > 10);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Hamburger menu
  const burger = $('#burger'), menu = $('#menu');
  const setMenu = open => {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  $$('#menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  // Scroll reveal (staggered within each group)
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.12 });
  $$('.cards, .gallery, .vm, .cols, .split').forEach(g =>
    $$('.reveal', g).forEach((el, i) => el.style.transitionDelay = (i % 3) * 90 + 'ms'));
  $$('.reveal').forEach(el => io.observe(el));

  // Active nav link
  const links = $$('nav ul a');
  const sio = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.hash === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => sio.observe(s));

  // Contact form: validate, then open the visitor's mail app
  const form = $('#form'), note = $('#note');
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    $$('[required]', form).forEach(f => {
      const bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle('bad', bad); if (bad) ok = false;
    });
    if (!ok) { note.style.color = '#d93025'; note.textContent = 'Please complete the highlighted fields.'; return; }
    const d = new FormData(form);
    const body = `Name: ${d.get('name')}\nEmail: ${d.get('email')}\nService: ${d.get('svc')}\n\n${d.get('msg')}`;
    location.href = `mailto:Marketing@marenova.co.id?subject=${encodeURIComponent('Survey request: ' + d.get('svc'))}&body=${encodeURIComponent(body)}`;
    note.style.color = '#0b7a5a'; note.textContent = 'Opening your email app. Thank you.';
    form.reset();
  });

  $('#yr').textContent = new Date().getFullYear();
})();

/* Hero slider – vanilla JS, tanpa library */
(function () {
  var hero = document.getElementById('home');
  if (!hero) return;

  var DURATION = 7000; // ms per slide
  var slides = [].slice.call(hero.querySelectorAll('.hero-slide'));
  var dots   = [].slice.call(hero.querySelectorAll('.hero-dot'));
  var fills  = dots.map(function (d) { return d.querySelector('i'); });
  var pauseBtn = document.getElementById('heroPause');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var index = 0, elapsed = 0, last = performance.now();
  var userPaused = false, hoverPaused = false;

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach(function (s, n) {
      s.classList.toggle('is-active', n === index);
      s.setAttribute('aria-hidden', n === index ? 'false' : 'true');
    });
    dots.forEach(function (d, n) {
      d.classList.toggle('is-active', n === index);
      d.setAttribute('aria-selected', n === index ? 'true' : 'false');
    });
    fills.forEach(function (f, n) { f.style.transform = 'scaleX(' + (n < index ? 1 : 0) + ')'; });
    elapsed = 0;
  }

  function tick(now) {
    var dt = now - last; last = now;
    if (!userPaused && !hoverPaused && !document.hidden && !reduce) {
      elapsed += dt;
      fills[index].style.transform = 'scaleX(' + Math.min(elapsed / DURATION, 1) + ')';
      if (elapsed >= DURATION) goTo(index + 1);
    }
    requestAnimationFrame(tick);
  }

  document.getElementById('heroNext').addEventListener('click', function () { goTo(index + 1); });
  document.getElementById('heroPrev').addEventListener('click', function () { goTo(index - 1); });
  dots.forEach(function (d, n) { d.addEventListener('click', function () { goTo(n); }); });

  pauseBtn.addEventListener('click', function () {
    userPaused = !userPaused;
    pauseBtn.classList.toggle('is-paused', userPaused);
    pauseBtn.setAttribute('aria-label', userPaused ? 'Play slideshow' : 'Pause slideshow');
  });

  // pause saat hover / fokus
  hero.addEventListener('mouseenter', function () { hoverPaused = true; });
  hero.addEventListener('mouseleave', function () { hoverPaused = false; });
  hero.addEventListener('focusin',    function () { hoverPaused = true; });
  hero.addEventListener('focusout',   function () { hoverPaused = false; });

  // keyboard (hanya saat hero terlihat di layar)
  document.addEventListener('keydown', function (e) {
    var r = hero.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    if (e.key === 'ArrowRight') goTo(index + 1);
    if (e.key === 'ArrowLeft')  goTo(index - 1);
  });

  // swipe
  var startX = null;
  hero.addEventListener('pointerdown', function (e) { if (!e.target.closest('a,button')) startX = e.clientX; });
  hero.addEventListener('pointerup', function (e) {
    if (startX === null) return;
    var dx = e.clientX - startX; startX = null;
    if (Math.abs(dx) > 50) goTo(index + (dx < 0 ? 1 : -1));
  });

  goTo(0);
  requestAnimationFrame(tick);
})();


