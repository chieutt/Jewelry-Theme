(() => {
  const hero = document.querySelector('[data-section="01 Editorial slideshow"]');
  if (!hero) return;

  const slides = [...hero.querySelectorAll('.slide')];
  const tabs = [...hero.querySelectorAll('.hero-rail-tab[data-hero-slide]')];
  const pauseButton = hero.querySelector('#heroPause');
  const railObject = hero.querySelector('.hero-rail-object');
  const railCount = hero.querySelector('.hero-rail-count');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const AUTOPLAY_MS = 6500;

  if (!slides.length || !tabs.length) return;

  tabs.forEach((tab) => {
    if (tab.querySelector('.hero-rail-progress')) return;
    const progress = document.createElement('span');
    progress.className = 'hero-rail-progress';
    progress.setAttribute('aria-hidden', 'true');
    tab.appendChild(progress);
  });

  let activeIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains('active')));
  let progressAnimation = null;
  let parallaxFrame = 0;
  let parallaxX = 0;
  let parallaxY = 0;
  let parallaxTargetX = 0;
  let parallaxTargetY = 0;

  const getActiveIndex = () => {
    const index = slides.findIndex((slide) => slide.classList.contains('active'));
    return index < 0 ? 0 : index;
  };

  const setDirection = (nextIndex) => {
    if (nextIndex === activeIndex) return;
    const forwardIndex = (activeIndex + 1) % slides.length;
    const backwardIndex = (activeIndex - 1 + slides.length) % slides.length;

    if (nextIndex === backwardIndex) {
      hero.dataset.heroDirection = 'backward';
    } else if (nextIndex === forwardIndex) {
      hero.dataset.heroDirection = 'forward';
    } else {
      hero.dataset.heroDirection = nextIndex > activeIndex ? 'forward' : 'backward';
    }
  };

  const clearProgress = () => {
    if (progressAnimation) {
      progressAnimation.cancel();
      progressAnimation = null;
    }
    tabs.forEach((tab) => {
      const bar = tab.querySelector('.hero-rail-progress');
      if (bar) bar.style.transform = 'scaleX(0)';
    });
  };

  const restartProgress = () => {
    clearProgress();
    if (reduceMotion.matches || document.hidden || pauseButton?.getAttribute('aria-pressed') === 'true') return;

    const activeTab = tabs[getActiveIndex()];
    const bar = activeTab?.querySelector('.hero-rail-progress');
    if (!bar) return;

    progressAnimation = bar.animate(
      [
        { transform: 'scaleX(0)' },
        { transform: 'scaleX(1)' }
      ],
      {
        duration: AUTOPLAY_MS,
        easing: 'linear',
        fill: 'forwards'
      }
    );
  };

  const pauseProgress = () => {
    progressAnimation?.pause();
  };

  const animateRailMeta = () => {
    if (reduceMotion.matches) return;
    const keyframes = [
      { opacity: 0, transform: 'translate3d(0,6px,0)' },
      { opacity: 1, transform: 'translate3d(0,0,0)' }
    ];
    const options = { duration: 420, easing: 'cubic-bezier(.22,.74,.18,1)' };
    railObject?.animate(keyframes, options);
    railCount?.animate(keyframes, { ...options, delay: 45 });
  };

  hero.addEventListener('click', (event) => {
    const tab = event.target.closest('.hero-rail-tab[data-hero-slide]');
    if (!tab) return;
    const nextIndex = Number(tab.dataset.heroSlide);
    if (Number.isInteger(nextIndex)) setDirection(nextIndex);
  }, true);

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      requestAnimationFrame(restartProgress);
    });
  });

  const observer = new MutationObserver(() => {
    const nextIndex = getActiveIndex();
    if (nextIndex === activeIndex) return;

    setDirection(nextIndex);
    activeIndex = nextIndex;
    restartProgress();
    animateRailMeta();
  });

  slides.forEach((slide) => observer.observe(slide, { attributes: true, attributeFilter: ['class'] }));

  hero.addEventListener('mouseenter', pauseProgress);
  hero.addEventListener('mouseleave', () => {
    if (pauseButton?.getAttribute('aria-pressed') !== 'true') restartProgress();
  });

  hero.addEventListener('focusin', pauseProgress);
  hero.addEventListener('focusout', () => {
    requestAnimationFrame(() => {
      if (!hero.contains(document.activeElement) && pauseButton?.getAttribute('aria-pressed') !== 'true') {
        restartProgress();
      }
    });
  });

  pauseButton?.addEventListener('click', () => {
    if (pauseButton.getAttribute('aria-pressed') === 'true') {
      pauseProgress();
    } else {
      restartProgress();
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseProgress();
    else if (pauseButton?.getAttribute('aria-pressed') !== 'true') restartProgress();
  });

  const renderParallax = () => {
    parallaxX += (parallaxTargetX - parallaxX) * 0.14;
    parallaxY += (parallaxTargetY - parallaxY) * 0.14;

    hero.style.setProperty('--hero-parallax-x', `${parallaxX.toFixed(2)}px`);
    hero.style.setProperty('--hero-parallax-y', `${parallaxY.toFixed(2)}px`);

    if (Math.abs(parallaxTargetX - parallaxX) > 0.05 || Math.abs(parallaxTargetY - parallaxY) > 0.05) {
      parallaxFrame = requestAnimationFrame(renderParallax);
    } else {
      parallaxFrame = 0;
    }
  };

  const requestParallaxFrame = () => {
    if (!parallaxFrame) parallaxFrame = requestAnimationFrame(renderParallax);
  };

  const resetParallax = () => {
    parallaxTargetX = 0;
    parallaxTargetY = 0;
    requestParallaxFrame();
  };

  hero.addEventListener('pointermove', (event) => {
    if (reduceMotion.matches || !finePointer.matches) return;
    const art = slides[getActiveIndex()]?.querySelector('.slide-art');
    if (!art) return;

    const rect = art.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
      resetParallax();
      return;
    }

    const x = ((event.clientX - rect.left) / rect.width) - 0.5;
    const y = ((event.clientY - rect.top) / rect.height) - 0.5;
    parallaxTargetX = x * 12;
    parallaxTargetY = y * 8;
    requestParallaxFrame();
  });

  hero.addEventListener('pointerleave', resetParallax);

  reduceMotion.addEventListener?.('change', () => {
    resetParallax();
    restartProgress();
  });

  hero.dataset.heroDirection = 'forward';
  restartProgress();
})();
