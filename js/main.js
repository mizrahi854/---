// Malachim Badrachim – interactions
(function () {
  // smooth page transitions – fade out before internal navigation (no fade-in-on-load, to avoid any risk of a stuck-invisible page if JS is delayed)
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (!href || href.charAt(0) === '#') return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    if (/^(tel:|mailto:|https?:)/i.test(href)) return;
    if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button !== 0) return;
    if (reduceMotion) return;
    ev.preventDefault();
    document.body.classList.add('page-leaving');
    setTimeout(function () { window.location.href = href; }, 220);
  });

  // count-up numbers (odometer-style, ascending, stops at final value)
  var counters = [].slice.call(document.querySelectorAll('.counter'));
  if (counters.length && !reduceMotion) {
    var runCounter = function (el) {
      var raw = el.textContent.trim();
      var m = raw.match(/^([^\d]*)([\d,]+)([^\d]*)$/);
      if (!m) return;
      var prefix = m[1], target = parseInt(m[2].replace(/,/g, ''), 10), suffix = m[3];
      if (isNaN(target)) return;
      var duration = 1500, start = null;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + Math.round(target * eased).toLocaleString('en-US') + suffix;
        if (p < 1) requestAnimationFrame(step); else el.textContent = raw;
      }
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window) {
      var cIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { cIO.unobserve(entry.target); runCounter(entry.target); }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { cIO.observe(el); });
    } else {
      counters.forEach(runCounter);
    }
  }

  var pre = document.getElementById('preloader');
  if (pre) {
    document.body.classList.add('loading');
    
    // מעניקים זמן מינימלי של 1.8 שניות כדי שרואים את האנימציה של הלוגו והרכב
    setTimeout(function () {
      pre.classList.add('done');
      document.body.classList.remove('loading');
      setTimeout(function () { 
        if (pre && pre.parentNode) pre.remove(); 
      }, 1100);
    }, 1800); // כאן אפשר לשלוט כמה זמן האנימציה תישאר (1800 = 1.8 שניות)
  }

  // mobile nav
  var burger = document.getElementById('burger');
  var nav = document.getElementById('mobileNav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
    });
  }

  // app-like bottom nav: highlight current page + "more" opens the mobile menu
  var page = (location.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index';
  [].slice.call(document.querySelectorAll('.app-nav-item[data-page]')).forEach(function (el) {
    if (el.getAttribute('data-page') === page) el.classList.add('is-active');
  });
  var navMore = document.getElementById('navMore');
  if (navMore && nav) {
    navMore.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      navMore.classList.toggle('is-active', open);
      if (burger) burger.setAttribute('aria-expanded', String(open));
      if (open) {
        var header = document.getElementById('siteHeader');
        if (header) header.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }
    });
  }

  // header shadow
  var header = document.getElementById('siteHeader');
  var parallax = [].slice.call(document.querySelectorAll('[data-parallax]'));
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 12);
    parallax.forEach(function (el) {
      var speed = parseFloat(el.getAttribute('data-parallax')) || 0.05;
      el.style.transform = 'translate3d(0,' + (window.scrollY * speed).toFixed(2) + 'px,0)';
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // scroll reveal
  var items = [].slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // 3D tilt
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if (fine) {
    [].slice.call(document.querySelectorAll('.tilt')).forEach(function (card) {
      card.addEventListener('mousemove', function (ev) {
        var r = card.getBoundingClientRect();
        var x = (ev.clientX - r.left) / r.width - 0.5;
        var y = (ev.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(900px) rotateY(' + (x * 7).toFixed(2) + 'deg) rotateX(' + (-y * 7).toFixed(2) + 'deg) translateY(-6px)';
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  }

  // FAQ accordion
  [].slice.call(document.querySelectorAll('.faq-q')).forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var wasOpen = item.classList.contains('open');
      [].slice.call(document.querySelectorAll('.faq-item')).forEach(function (i) { i.classList.remove('open'); });
      if (!wasOpen) item.classList.add('open');
    });
  });
})();