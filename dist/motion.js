(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const states = new Map();
  const videos = [...document.querySelectorAll('video')];
  function sync(video) {
    const button = video.closest('.vc-motion')?.querySelector('[data-motion-toggle]');
    if (button) {
      button.textContent = video.paused ? 'Play' : 'Pause';
      button.setAttribute('aria-label', video.paused ? 'Play studio animation' : 'Pause studio animation');
      button.setAttribute('aria-pressed', String(!video.paused));
    }
  }
  function pause(video) {
    const state = states.get(video);
    state.automaticPause = true;
    video.pause();
    sync(video);
  }
  function start(video, manual = false) {
    const state = states.get(video);
    if (!state || document.hidden || (!manual && (!state.visible || state.userPaused || reduced.matches))) return;
    if (manual) state.userPaused = false;
    state.automaticPause = false;
    video.muted = true;
    video.defaultMuted = true;
    const pending = video.play();
    if (pending) pending.then(() => { video.removeAttribute('data-autoplay-blocked'); sync(video); }).catch(() => {
      video.dataset.autoplayBlocked = 'true';
      sync(video);
    });
  }
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    const state = states.get(entry.target);
    state.visible = entry.isIntersecting;
    if (state.visible) start(entry.target); else pause(entry.target);
  }), { rootMargin: '100px 0px', threshold: 0 });
  videos.forEach(video => {
    states.set(video, { visible: false, userPaused: false, automaticPause: false });
    video.loop = true;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.autoplay = !reduced.matches;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    ['loadedmetadata', 'loadeddata', 'canplay'].forEach(event => video.addEventListener(event, () => start(video)));
    video.addEventListener('playing', () => { states.get(video).userPaused = false; sync(video); });
    video.addEventListener('pause', () => {
      const state = states.get(video);
      if (!state.automaticPause && !video.ended && state.visible && !document.hidden) state.userPaused = true;
      sync(video);
    });
    video.addEventListener('ended', () => { video.currentTime = 0; start(video); });
    observer.observe(video);
    if (reduced.matches) pause(video);
    video.closest('.vc-motion')?.querySelector('[data-motion-toggle]')?.addEventListener('click', () => {
      const state = states.get(video);
      if (video.paused) start(video, true);
      else { state.userPaused = true; pause(video); }
    });
    sync(video);
  });
  function resumeVisible() { videos.forEach(video => start(video)); }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) videos.forEach(pause); else resumeVisible();
  });
  addEventListener('pageshow', resumeVisible);
  // In app browsers may permit playback only after the first direct gesture.
  document.addEventListener('touchend', event => {
    if (!event.target.closest('button, a, video, input, textarea, select')) resumeVisible();
  }, { passive: true });
  document.addEventListener('pointerdown', event => {
    if (!event.target.closest('button, a, video, input, textarea, select')) resumeVisible();
  }, { passive: true });
  setTimeout(resumeVisible, 250);
  setTimeout(resumeVisible, 1200);
  reduced.addEventListener('change', () => {
    if (reduced.matches) videos.forEach(pause); else resumeVisible();
  });

  const elements = [...document.querySelectorAll('.hero-copy > *, .page-hero .wrap > *, .section-head > *, .manifesto .wrap > *, .project-copy, .project-media, .capability-list a, .film-copy > *, .film-pair > figure, .process-track li, .related-band .wrap > *, .closing .wrap > *, .insight-list article, .service-editorial .wrap > *')];
  if (!reduced.matches) {
    document.documentElement.classList.add('vc-motion-enabled');
    const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('motion-visible');
        reveal.unobserve(entry.target);
      }
    }), { threshold: 0, rootMargin: '0px 0px -40px 0px' });
    elements.forEach((element, index) => {
      element.classList.add('motion-reveal');
      element.style.setProperty('--reveal-delay', (index % 3) * 65 + 'ms');
      reveal.observe(element);
    });
    reduced.addEventListener('change', () => {
      if (reduced.matches) {
        document.documentElement.classList.remove('vc-motion-enabled');
        elements.forEach(element => element.classList.add('motion-visible'));
        reveal.disconnect();
      }
    });
  }
})();
