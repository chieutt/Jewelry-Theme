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
  const REVEAL_MS = 920;
  const SWIPE_SETTLE_MS = 360;
  const SWIPE_THRESHOLD = 0.22;

  if (!slides.length || !tabs.length) return;

  tabs.forEach((tab) => {
    if (tab.querySelector('.hero-rail-progress')) return;
    const progress = document.createElement('span');
    progress.className = 'hero-rail-progress';
    progress.setAttribute('aria-hidden', 'true');
    tab.appendChild(progress);
  });

  let activeIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains('active')));
  let desiredDirection = null;
  let dragCommitIndex = null;
  let transitionToken = 0;
  let progressAnimation = null;
  let autoplayTimer = null;
  let autoplayElapsed = 0;
  let autoplayStartedAt = 0;
  let parallaxFrame = 0;
  let parallaxX = 0;
  let parallaxY = 0;
  let parallaxTargetX = 0;
  let parallaxTargetY = 0;
  let drag = null;
  let isSettlingDrag = false;

  const wrapIndex = (index) => (index + slides.length) % slides.length;

  const getActiveIndex = () => {
    const index = slides.findIndex((slide) => slide.classList.contains('active'));
    return index < 0 ? 0 : index;
  };

  const directionBetween = (fromIndex, toIndex) => {
    if (toIndex === wrapIndex(fromIndex - 1)) return 'backward';
    if (toIndex === wrapIndex(fromIndex + 1)) return 'forward';
    return toIndex > fromIndex ? 'forward' : 'backward';
  };

  const hiddenClip = (direction) => (
    direction === 'backward'
      ? 'inset(0 100% 0 0)'
      : 'inset(0 0 0 100%)'
  );

  const progressClip = (direction, progress) => {
    const hidden = Math.max(0, Math.min(100, (1 - progress) * 100));
    return direction === 'backward'
      ? `inset(0 ${hidden}% 0 0)`
      : `inset(0 0 0 ${hidden}%)`;
  };

  const getProgressBar = () => tabs[getActiveIndex()]?.querySelector('.hero-rail-progress') || null;

  const clearAutoplayTimer = () => {
    if (!autoplayTimer) return;
    clearTimeout(autoplayTimer);
    autoplayTimer = null;
  };

  const cancelProgressAnimation = ({ reset = false } = {}) => {
    if (progressAnimation) {
      progressAnimation.cancel();
      progressAnimation = null;
    }

    if (reset) {
      tabs.forEach((tab) => {
        const bar = tab.querySelector('.hero-rail-progress');
        if (bar) bar.style.transform = 'scaleX(0)';
      });
    }
  };

  const shouldHoldAutoplay = () => (
    reduceMotion.matches ||
    document.hidden ||
    pauseButton?.getAttribute('aria-pressed') === 'true' ||
    drag !== null ||
    isSettlingDrag ||
    hero.matches(':hover') ||
    hero.contains(document.activeElement)
  );

  const syncElapsed = () => {
    if (!autoplayStartedAt) return;
    autoplayElapsed = Math.min(
      AUTOPLAY_MS,
      autoplayElapsed + Math.max(0, performance.now() - autoplayStartedAt)
    );
    autoplayStartedAt = 0;
  };

  const buildProgressAnimation = () => {
    cancelProgressAnimation();
    if (reduceMotion.matches) return;

    const bar = getProgressBar();
    if (!bar) return;

    const from = Math.max(0, Math.min(1, autoplayElapsed / AUTOPLAY_MS));
    const remaining = Math.max(0, AUTOPLAY_MS - autoplayElapsed);
    bar.style.transform = `scaleX(${from})`;

    if (remaining <= 0) return;

    progressAnimation = bar.animate(
      [{ transform: `scaleX(${from})` }, { transform: 'scaleX(1)' }],
      { duration: remaining, easing: 'linear', fill: 'forwards' }
    );
  };

  const pauseAutoplay = () => {
    syncElapsed();
    clearAutoplayTimer();
    progressAnimation?.pause();
  };

  const resumeAutoplay = () => {
    if (shouldHoldAutoplay()) return;

    const remaining = Math.max(0, AUTOPLAY_MS - autoplayElapsed);
    if (remaining <= 0) return;

    clearAutoplayTimer();
    autoplayStartedAt = performance.now();

    if (progressAnimation?.playState === 'paused') {
      progressAnimation.play();
    } else if (!progressAnimation || progressAnimation.playState === 'idle') {
      buildProgressAnimation();
    }

    autoplayTimer = window.setTimeout(() => {
      syncElapsed();
      clearAutoplayTimer();
      const nextIndex = wrapIndex(getActiveIndex() + 1);
      desiredDirection = 'forward';
      hero.dataset.heroDirection = 'forward';
      tabs[nextIndex]?.click();
    }, remaining);
  };

  const resetAutoplayCycle = ({ start = true } = {}) => {
    clearAutoplayTimer();
    autoplayElapsed = 0;
    autoplayStartedAt = 0;
    cancelProgressAnimation({ reset: true });
    buildProgressAnimation();

    if (start) {
      if (shouldHoldAutoplay()) progressAnimation?.pause();
      else resumeAutoplay();
    } else {
      progressAnimation?.pause();
    }
  };

  /*
    Homepage.js owns the basic slide state and registered hover/focus listeners
    before this motion layer loads. Retire its interval, then replace its global
    start/stop hooks with pause/resume semantics so all existing listeners keep
    working without resetting elapsed autoplay time.
  */
  const legacyStopAutoplay = window.stopHeroAutoplay;
  if (typeof legacyStopAutoplay === 'function') legacyStopAutoplay();
  window.stopHeroAutoplay = pauseAutoplay;
  window.startHeroAutoplay = resumeAutoplay;

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

  const clearPreview = (slide = drag?.previewSlide) => {
    if (!slide) return;
    const art = slide.querySelector('.slide-art');
    slide.classList.remove('hero-preview');
    if (art) {
      art.style.transition = '';
      art.style.clipPath = '';
      art.style.webkitClipPath = '';
    }
  };

  const preparePreview = (direction) => {
    if (!drag) return;

    if (drag.previewSlide) clearPreview(drag.previewSlide);

    const targetIndex = direction === 'forward'
      ? wrapIndex(activeIndex + 1)
      : wrapIndex(activeIndex - 1);
    const previewSlide = slides[targetIndex];
    const previewArt = previewSlide?.querySelector('.slide-art');
    if (!previewSlide || !previewArt) return;

    previewSlide.classList.remove('hero-reveal-complete');
    previewSlide.classList.add('hero-preview');
    previewArt.style.transition = 'none';
    previewArt.style.clipPath = hiddenClip(direction);
    previewArt.style.webkitClipPath = hiddenClip(direction);

    drag.direction = direction;
    drag.targetIndex = targetIndex;
    drag.previewSlide = previewSlide;
    drag.previewArt = previewArt;
    hero.dataset.heroDirection = direction;
  };

  const settleDrag = (commit) => {
    if (!drag || isSettlingDrag) return;

    const state = drag;
    isSettlingDrag = true;
    hero.classList.remove('is-hero-dragging');

    try {
      if (state.sourceArt?.hasPointerCapture?.(state.pointerId)) {
        state.sourceArt.releasePointerCapture(state.pointerId);
      }
    } catch (_) {}

    if (!state.previewSlide || !state.previewArt || !state.direction) {
      drag = null;
      isSettlingDrag = false;
      resumeAutoplay();
      return;
    }

    const settleDuration = reduceMotion.matches ? 0 : SWIPE_SETTLE_MS;
    state.previewArt.style.transition = settleDuration
      ? `clip-path ${settleDuration}ms cubic-bezier(.22,.74,.18,1)`
      : 'none';

    requestAnimationFrame(() => {
      const targetClip = commit ? 'inset(0 0 0 0)' : hiddenClip(state.direction);
      state.previewArt.style.clipPath = targetClip;
      state.previewArt.style.webkitClipPath = targetClip;
    });

    window.setTimeout(() => {
      if (commit) {
        dragCommitIndex = state.targetIndex;
        desiredDirection = state.direction;
        state.previewSlide.classList.add('hero-reveal-complete');

        /*
          Reuse the existing slideshow state engine by activating its tab.
          The preview stays above the old artwork until the active state is committed.
        */
        tabs[state.targetIndex]?.click();

        requestAnimationFrame(() => {
          clearPreview(state.previewSlide);
        });
      } else {
        clearPreview(state.previewSlide);
      }

      drag = null;
      isSettlingDrag = false;
      if (!commit) resumeAutoplay();
    }, settleDuration + 20);
  };

  /* Set direction before the existing tab click handler changes active slide. */
  hero.addEventListener('click', (event) => {
    const tab = event.target.closest('.hero-rail-tab[data-hero-slide]');
    if (!tab) return;

    const nextIndex = Number(tab.dataset.heroSlide);
    if (!Number.isInteger(nextIndex)) return;

    if (nextIndex === activeIndex) {
      requestAnimationFrame(() => resetAutoplayCycle());
      return;
    }

    desiredDirection = directionBetween(activeIndex, nextIndex);
    hero.dataset.heroDirection = desiredDirection;

    slides.forEach((slide, index) => {
      if (index !== activeIndex) slide.classList.remove('hero-outgoing');
    });
    slides[activeIndex]?.classList.add('hero-outgoing');

    if (nextIndex !== dragCommitIndex) {
      slides[nextIndex]?.classList.remove('hero-reveal-complete');
    }
  }, true);

  /*
    Homepage.js owns the canonical active state. This observer only layers the
    previous slide underneath the new one long enough for clip-path to reveal it.
  */
  const observer = new MutationObserver(() => {
    const nextIndex = getActiveIndex();
    if (nextIndex === activeIndex) return;

    const previousIndex = activeIndex;
    const direction = desiredDirection || directionBetween(previousIndex, nextIndex);
    const isDragCommit = dragCommitIndex === nextIndex;
    const token = ++transitionToken;

    hero.dataset.heroDirection = direction;

    slides.forEach((slide, index) => {
      if (index !== previousIndex) slide.classList.remove('hero-outgoing');
      if (index !== nextIndex) slide.classList.remove('hero-preview');
    });

    slides[previousIndex]?.classList.add('hero-outgoing');
    if (!isDragCommit) slides[nextIndex]?.classList.remove('hero-reveal-complete');

    const incomingArt = slides[nextIndex]?.querySelector('.slide-art');
    if (incomingArt) {
      incomingArt.style.transition = '';
      incomingArt.style.clipPath = '';
      incomingArt.style.webkitClipPath = '';
    }

    activeIndex = nextIndex;
    desiredDirection = null;
    dragCommitIndex = null;

    resetAutoplayCycle();
    animateRailMeta();

    const cleanupDelay = reduceMotion.matches ? 0 : REVEAL_MS + 80;
    window.setTimeout(() => {
      if (token !== transitionToken) return;
      slides[previousIndex]?.classList.remove('hero-outgoing');
    }, cleanupDelay);
  });

  slides.forEach((slide) => observer.observe(slide, { attributes: true, attributeFilter: ['class'] }));

  /* Direct drag/swipe interaction on the artwork plane. */
  hero.addEventListener('pointerdown', (event) => {
    if (isSettlingDrag || !event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;

    const sourceArt = slides[getActiveIndex()]?.querySelector('.slide-art');
    if (!sourceArt || !sourceArt.contains(event.target)) return;

    drag = {
      pointerId: event.pointerId,
      sourceArt,
      startX: event.clientX,
      startY: event.clientY,
      startTime: performance.now(),
      lastX: event.clientX,
      lastTime: performance.now(),
      isHorizontal: false,
      direction: null,
      targetIndex: null,
      previewSlide: null,
      previewArt: null
    };

    pauseAutoplay();
  });

  hero.addEventListener('pointermove', (event) => {
    if (!drag || drag.pointerId !== event.pointerId || isSettlingDrag) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (!drag.isHorizontal) {
      if (absX < 7 && absY < 7) return;
      if (absY > absX) return;

      drag.isHorizontal = true;
      hero.classList.add('is-hero-dragging');
      try { drag.sourceArt.setPointerCapture(event.pointerId); } catch (_) {}
    }

    event.preventDefault();

    const direction = dx < 0 ? 'forward' : 'backward';
    if (direction !== drag.direction) preparePreview(direction);
    if (!drag.previewArt) return;

    const width = Math.max(1, drag.sourceArt.getBoundingClientRect().width);
    const progress = Math.min(1, absX / width);
    const clip = progressClip(direction, progress);
    drag.previewArt.style.clipPath = clip;
    drag.previewArt.style.webkitClipPath = clip;
    drag.lastX = event.clientX;
    drag.lastTime = performance.now();
  });

  const finishPointerGesture = (event, cancelled = false) => {
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (!drag.isHorizontal || cancelled) {
      if (drag.previewSlide) clearPreview(drag.previewSlide);
      hero.classList.remove('is-hero-dragging');
      drag = null;
      resumeAutoplay();
      return;
    }

    const dx = event.clientX - drag.startX;
    const width = Math.max(1, drag.sourceArt.getBoundingClientRect().width);
    const progress = Math.min(1, Math.abs(dx) / width);
    const elapsed = Math.max(1, performance.now() - drag.startTime);
    const velocity = Math.abs(dx) / elapsed;
    const commit = progress >= SWIPE_THRESHOLD || (Math.abs(dx) >= 44 && velocity >= 0.55);

    settleDrag(commit);
  };

  hero.addEventListener('pointerup', (event) => finishPointerGesture(event));
  hero.addEventListener('pointercancel', (event) => finishPointerGesture(event, true));

  /*
    These listeners mirror the legacy behavior, but pause/resume the same clock.
    If hover/focus overlap, shouldHoldAutoplay prevents an early resume.
  */
  hero.addEventListener('mouseenter', pauseAutoplay);
  hero.addEventListener('mouseleave', () => {
    if (!drag) resumeAutoplay();
  });

  hero.addEventListener('focusin', pauseAutoplay);
  hero.addEventListener('focusout', () => {
    requestAnimationFrame(resumeAutoplay);
  });

  pauseButton?.addEventListener('click', () => {
    if (pauseButton.getAttribute('aria-pressed') === 'true') pauseAutoplay();
    else resumeAutoplay();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseAutoplay();
    else resumeAutoplay();
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
    if (drag?.isHorizontal || reduceMotion.matches || !finePointer.matches) return;
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

  hero.addEventListener('pointerleave', () => {
    if (!drag) resetParallax();
  });

  reduceMotion.addEventListener?.('change', () => {
    resetParallax();
    if (reduceMotion.matches) pauseAutoplay();
    else resetAutoplayCycle();
  });

  hero.dataset.heroDirection = 'forward';
  resetAutoplayCycle();
})();
