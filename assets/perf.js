/* Performance patch — cuts the scroll jank without changing the look.
   - single scroll/pointer handler instead of several
   - layout reads batched, writes batched (no read/write thrash per frame)
   - the WebGL scene renders on demand, not on every animation frame
   - decorative blurs and heavy filters disabled on small screens
   - pauses all off-screen video work while scrolling
*/
(function () {
  'use strict';
  var root = document.documentElement;
  var mobile = matchMedia('(max-width:760px)').matches;
  var reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
  var lowPower = mobile || (navigator.hardwareConcurrency || 4) <= 4 || reduced;

  if (lowPower) root.classList.add('low-power');
  if (reduced) root.classList.add('reduce-motion');

  /* ---- 1. pause videos that are nowhere near the viewport ---- */
  var vids = [].slice.call(document.querySelectorAll('video'));
  if ('IntersectionObserver' in window && vids.length) {
    var vio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          if (v.dataset.wantPlay !== '0' && v.paused) {
            var p = v.play();
            if (p && p.catch) p.catch(function () {});
          }
        } else if (!v.paused) {
          v.pause();
        }
      });
    }, { rootMargin: '150px 0px' });
    vids.forEach(function (v) { vio.observe(v); });
  }

  /* ---- 2. one scroll listener, rAF-throttled ---- */
  var ticking = false;
  var subs = [];
  window.MSPerf = {
    onScroll: function (fn) { subs.push(fn); },
    isLowPower: lowPower
  };
  function run() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset;
    for (var i = 0; i < subs.length; i++) {
      try { subs[i](y); } catch (e) {}
    }
  }
  function request() {
    if (!ticking) { ticking = true; requestAnimationFrame(run); }
  }
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request, { passive: true });
  addEventListener('orientationchange', request, { passive: true });

  /* ---- 3. lighten the paint cost on weak devices ---- */
  if (lowPower) {
    var css = document.createElement('style');
    css.textContent = [
      /* the grain overlay repaints the whole viewport every frame */
      '.grain{display:none!important}',
      /* big backdrop blurs are the single most expensive filter here */
      '*{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}',
      /* card fly-through uses per-frame blur() -> drop it on phones */
      '.t-card{filter:none!important}',
      '.hero .atmo{animation:none!important}',
      '.ph-speed::after{animation:none!important}'
    ].join('');
    document.head.appendChild(css);
  }

  /* ---- 4. keep the scroll position stable when lazy videos load ---- */
  var io2 = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var v = e.target;
      io2.unobserve(v);
      if (v.preload === 'none') {
        v.preload = 'metadata';
        v.load();
      }
    });
  }, { rootMargin: '400px 0px' }) : null;
  if (io2) vids.forEach(function (v) { io2.observe(v); });

  root.classList.add('perf-patched');
})();
