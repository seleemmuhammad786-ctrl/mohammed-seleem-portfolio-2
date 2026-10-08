
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const map = (v, a, b) => clamp((v - a) / (b - a));
  const ease = t => 1 - Math.pow(1 - t, 3);
  const io = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const lerp = (a, b, t) => a + (b - a) * t;
  const mobile = () => matchMedia('(max-width:760px)').matches;
  const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const root = document.documentElement;
  const S = window.MSScene;
  let lenis = null;
  try { if (window.Lenis && !reduced) lenis = new Lenis({ duration: 1.25, smoothWheel: true, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) }); } catch (e) { lenis = null; }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const t = $(a.getAttribute('href')); if (!t) return;
    e.preventDefault(); $('#menu').classList.remove('open');
    const y = t.getBoundingClientRect().top + scrollY + (t.dataset.offset ? innerHeight * +t.dataset.offset : 0);
    lenis ? lenis.scrollTo(y, { duration: 2 }) : scrollTo({ top: y, behavior: 'smooth' });
  }));
  $('#menuBtn').addEventListener('click', () => $('#menu').classList.toggle('open'));
  setTimeout(() => root.classList.add('loaded'), 1300);
  setTimeout(() => $$('.hero .rv, .hero .fade').forEach(el => el.classList.add('in')), 1700);
  const ob = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); ob.unobserve(e.target); } }), { threshold: .2 });
  $$('.rv, .fade').forEach(el => { if (!el.closest('.hero')) ob.observe(el); });
  const specBtn = $('#specToggle');
  if (localStorage.getItem('ms-spec') === '1') root.classList.add('show-spec');
  specBtn.addEventListener('click', () => { root.classList.toggle('show-spec'); localStorage.setItem('ms-spec', root.classList.contains('show-spec') ? '1' : '0'); });
  addEventListener('pointermove', e => {
    if (S) { S.mouse.x = (e.clientX / innerWidth - .5) * 2; S.mouse.y = (e.clientY / innerHeight - .5) * 2; }
  });
  const progress = el => { const r = el.getBoundingClientRect(); return clamp(-r.top / (r.height - innerHeight)); };
  const inView = el => { const r = el.getBoundingClientRect(); return r.bottom > -50 && r.top < innerHeight + 50; };
  const hero = $('#top'), heroSlot = $('#heroSlot'), contactSlot = $('#contactSlot');
  const hTitle = $('.hero-title'), hSub = $('.hero-sub'), hTop = $('.hero-top'), ghost = $('.ghost'), atmo = $('.hero .atmo'), hNext = $('.hero-next');
  const projects = $$('.project').map(el => ({
    el, frame: $('.p-frame', el), media: $('.p-media', el), num: $('.p-num', el),
    t1: $('.pt1', el), t2: $('.pt2', el), meta: $('.p-meta', el), head: $('.p-head', el)
  }));
  const tunnel = $('#tunnel'), tCards = $$('.t-card'), tTitle = $('.t-title');
  const reel = $('#showreel'), reelFrame = $('.reel-frame'), reelMedia = $('.reel-media'), rw1 = $('.reel-w1'), rw2 = $('.reel-w2'), rMeta = $('.reel-meta'), rUi = $('.reel-ui');
  const words = $$('.about-statement .w');
  const portrait = $('.portrait .ph');
  const cvDoc = $('.cv-doc'), cvSec = $('#cv');
  const contact = $('#contact'), cBig = $('.c-big'), cSub = $('.c-sub'), cLinks = $('.c-links');
  const tc = $('#tc'), tcChapter = $('#tcChapter'), bar = $('.nav-progress i');
  const chapters = $$('[data-chapter]');
  const navA = $$('.nav-links a');
  const split = $('.ai-split');
  split.addEventListener('pointermove', e => {
    if (mobile()) return;
    const r = split.getBoundingClientRect();
    split.style.setProperty('--split', clamp((e.clientX - r.left) / r.width, .14, .86).toFixed(3));
  });
  split.addEventListener('pointerleave', () => split.style.setProperty('--split', .5));
  const prev = $('.svc-preview'), prevLabel = $('.svc-preview .await');
  let px = 0, py = 0, tx = 0, ty = 0, frameCount = 0, lastUiTick = 0;
  $$('.svc').forEach(s => {
    s.addEventListener('pointerenter', () => { prev.classList.add('on'); prevLabel.textContent = 'Media slot · ' + s.dataset.name; });
    s.addEventListener('pointerleave', () => prev.classList.remove('on'));
  });
  addEventListener('pointermove', e => { tx = e.clientX + 200; ty = e.clientY; });
  function frame(t) {
    if (lenis) lenis.raf(t);
    frameCount++;
    const uiTick = frameCount % 3 === 0;

    const vh = innerHeight, m = mobile();
    const hp = progress(hero);
    const glOwner = inView(contact) ? 'contact' : (inView(hero) ? 'hero' : null);
    if (inView(hero)) {
      const a = io(map(hp, 0, .7));
      hTitle.style.transform = `translate3d(0,${-a * 34}vh,0)`;
      hTitle.style.opacity = 1 - map(hp, .32, .62);
      hSub.style.transform = `translate3d(0,${-a * 22}vh,0)`;
      hSub.style.opacity = 1 - map(hp, .18, .42);
      hTop.style.opacity = 1 - map(hp, .05, .25);
      ghost.style.transform = `translate3d(${-a * 12}vw,${a * 10}vh,0) rotate(${a * -6}deg)`;
      atmo.style.transform = `translate3d(0,${a * 8}vh,0) scale(${1 + a * .15})`;
      const n = map(hp, .5, .82);
      hNext.style.opacity = ease(n) * (1 - map(hp, .93, 1));
      hNext.style.transform = `translate(-50%,-50%) scale(${lerp(1.18, 1, ease(n))})`;
      hNext.style.filter = `blur(${(1 - n) * 10}px)`;
      heroSlot.style.opacity = 1 - map(hp, .82, 1);
    }
    if (S && S.ready) {
      if (glOwner === 'hero') {
        S.mount(heroSlot);
        const a = io(map(hp, 0, .85));
        Object.assign(S.target, m
          ? { x: 0, y: lerp(1.15, .2, a), s: lerp(.82, .36, a), rx: a * 1.2, ry: a * 2.6, strips: a }
          : { x: lerp(1.85, 0, a), y: lerp(-.05, .05, a), s: lerp(1.12, .42, a), rx: a * 1.1, ry: a * 3.2, strips: a });
      } else if (glOwner === 'contact') {
        S.mount(contactSlot);
        const cp = progress(contact), a = io(map(cp, 0, .6));
        Object.assign(S.target, { x: 0, y: m ? lerp(.3, .55, a) : lerp(-.2, .1, a), s: m ? lerp(.3, .62, a) : lerp(.35, 1.05, a), rx: 4 + a * 1.4, ry: 7 + a * 2.4, strips: 1 - a });
      }
      if (glOwner) S.render(t);
    }
    projects.forEach(p => {
      if (!inView(p.el)) { p.el.classList.remove('active'); return; }
      p.el.classList.add('active');
      const q = progress(p.el);
      const open = io(map(q, 0, .48));
      const exit = io(map(q, .82, 1));
      const ins = m ? [lerp(26, 0, open), lerp(10, 0, open), lerp(30, 0, open), lerp(10, 0, open)]
                    : [lerp(20, 0, open), lerp(14, 0, open), lerp(20, 0, open), lerp(46, 0, open)];
      p.frame.style.clipPath = `inset(${ins[0]}% ${ins[1]}% ${ins[2]}% ${ins[3]}%)`;
      p.frame.style.transform = `scale(${lerp(.86, 1, open) * lerp(1, .9, exit)}) translate3d(0,${exit * -6}vh,0)`;
      p.frame.style.opacity = 1 - exit * .85;
      p.media.style.transform = `scale(${lerp(1.35, 1.04, open)}) translate3d(0,${(q - .5) * -6}vh,0)`;
      p.num.style.transform = `translate3d(0,${(q - .3) * -40}vh,0)`;
      p.t1.style.transform = `translate3d(${lerp(-14, 0, ease(map(q, .1, .55)))}vw,0,0)`;
      p.t2.style.transform = `translate3d(${lerp(22, 0, ease(map(q, .16, .62))) - exit * 10}vw,0,0)`;
      p.t1.parentElement.style.opacity = map(q, .06, .3) * (1 - exit);
      p.meta.style.opacity = ease(map(q, .48, .66)) * (1 - exit);
      p.meta.style.transform = `translate3d(0,${(1 - ease(map(q, .48, .66))) * 30}px,0)`;
      p.head.style.opacity = map(q, .02, .2) * (1 - exit);
    });
    if (!m && inView(tunnel)) {
      const q = progress(tunnel), gap = 1500, total = gap * (tCards.length + 1);
      tCards.forEach((c, i) => {
        const z = -total + q * (total + 900) + (tCards.length - i) * gap - gap * .2;
        const x = +c.dataset.x, y = +c.dataset.y;
        const o = z < -3600 ? 0 : z < -2400 ? map(z, -3600, -2400) : z > 500 ? 1 - map(z, 500, 900) : 1;
        c.style.opacity = o;
        c.style.transform = `translate(-50%,-50%) translate3d(${x}vw,${y}vh,${z}px) rotateY(${x * -.25}deg)`;
        c.style.filter = z < -1400 ? `blur(${map(z, -1400, -3200) * 6}px)` : 'none';
      });
      tTitle.style.opacity = 1 - map(q, .04, .14) + map(q, .9, 1);
      tTitle.style.transform = `scale(${lerp(1, .8, map(q, 0, .14))})`;
    }
    if (inView(reel)) {
      const q = progress(reel), o = io(map(q, .05, .55));
      reelFrame.style.clipPath = m ? `inset(${lerp(30, 0, o)}% ${lerp(12, 0, o)}% round ${lerp(2, 0, o)}px)` : `inset(${lerp(30, 0, o)}% ${lerp(30, 0, o)}%)`;
      reelMedia.style.transform = `scale(${lerp(1.4, 1, o)})`;
      rw1.style.transform = `translate3d(${-o * 40}vw,${-o * 12}vh,0)`;
      rw2.style.transform = `translate3d(${o * 40}vw,${o * 12}vh,0)`;
      rw1.style.opacity = rw2.style.opacity = 1 - map(q, .3, .5);
      rMeta.style.opacity = 1 - map(q, .05, .25);
      rUi.style.opacity = map(q, .5, .65);
      rUi.style.pointerEvents = q > .5 ? 'auto' : 'none';
    }
    if (uiTick) words.forEach(w => { const r = w.getBoundingClientRect(); w.classList.toggle('lit', r.top < vh * .72); });
    if (portrait && inView(portrait.parentElement)) {
      const r = portrait.parentElement.getBoundingClientRect();
      portrait.style.transform = `translate3d(0,${((r.top + r.height / 2) / vh - .5) * -10}%,0)`;
    }
    if (inView(cvSec)) {
      const r = cvSec.getBoundingClientRect(), k = clamp((r.top + r.height / 2) / vh - .5, -1, 1);
      cvDoc.style.transform = `rotateY(${-18 + k * 22}deg) rotateX(${8 + k * -10}deg) rotateZ(${-2 + k * 3}deg) translate3d(0,${k * 6}vh,0)`;
    }
    if (inView(contact)) {
      const q = progress(contact), a = io(map(q, .05, .55));
      cBig.style.transform = `translate3d(0,${lerp(18, 0, a)}vh,0) scale(${lerp(1.25, 1, a)})`;
      cBig.style.opacity = map(q, 0, .3);
      cBig.style.filter = `blur(${(1 - map(q, 0, .35)) * 12}px)`;
      cSub.style.opacity = map(q, .45, .62);
      cSub.style.transform = `translate3d(0,${(1 - map(q, .45, .62)) * 24}px,0)`;
      cLinks.style.opacity = map(q, .6, .78);
    }
    if (prev.classList.contains('on')) {
      px += (tx - px) * .12; py += (ty - py) * .12;
      prev.style.left = px + 'px'; prev.style.top = py + 'px';
    }
    const docP = clamp(scrollY / (document.documentElement.scrollHeight - vh));
    bar.style.transform = `scaleX(${docP})`;
    if (uiTick) {
      const fr = Math.round(docP * 180 * 24), pad = v => String(v).padStart(2, '0');
      tc.textContent = `${pad(Math.floor(fr / 86400))}:${pad(Math.floor(fr / 1440) % 60)}:${pad(Math.floor(fr / 24) % 60)}:${pad(fr % 24)}`;
      let cur = chapters[0];
      chapters.forEach(c => { if (c.getBoundingClientRect().top < vh * .5) cur = c; });
      tcChapter.textContent = cur.dataset.chapter;
      navA.forEach(a => a.classList.toggle('on', a.dataset.ch === cur.dataset.nav));
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
