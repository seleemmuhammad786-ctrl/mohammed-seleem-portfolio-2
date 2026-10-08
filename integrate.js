(function(){
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const videos = Array.from(document.querySelectorAll('video'));
  if (!videos.length) return;

  // Only decode/play videos while they are actually near the viewport.
  // This prevents the portfolio from decoding every project simultaneously.
  videos.forEach(v => {
    v.muted = true;
    v.playsInline = true;
    v.pause();
    v.addEventListener('loadeddata', () => v.classList.add('ready'), {once:true});
  });

  if (reduce) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const v = entry.target;
      if (entry.isIntersecting) {
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, {rootMargin:'280px 0px', threshold:0.05});

  videos.forEach(v => io.observe(v));
})();
