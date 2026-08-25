(() => {
  const section = document.querySelector('[data-section="03B Text Highlight"]');
  if (!section) return;

  const lines = [...section.querySelectorAll('.text-highlight-line')];
  if (!lines.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const directions = [1, -1, 0.72];

  let frame = 0;
  let currentProgress = 0.5;
  let targetProgress = 0.5;
  let active = false;

  section.style.overflow = 'clip';
  lines.forEach((line) => {
    line.style.willChange = 'transform';
    line.style.transformOrigin = 'center center';
  });

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const getDistance = () => {
    if (window.innerWidth <= 760) {
      return clamp(window.innerWidth * 0.08, 22, 36);
    }
    return clamp(window.innerWidth * 0.075, 52, 128);
  };

  const measure = () => {
    if (reduceMotion.matches) {
      targetProgress = 0.5;
      active = true;
      requestTick();
      return;
    }

    const rect = section.getBoundingClientRect();
    const viewport = window.innerHeight || document.documentElement.clientHeight;
    targetProgress = clamp((viewport - rect.top) / (viewport + rect.height), 0, 1);
    active = rect.bottom > -viewport * 0.15 && rect.top < viewport * 1.15;
    if (active) requestTick();
  };

  const render = () => {
    frame = 0;

    if (reduceMotion.matches) {
      currentProgress = 0.5;
    } else {
      currentProgress += (targetProgress - currentProgress) * 0.16;
    }

    const normalized = (currentProgress - 0.5) * 2;
    const distance = getDistance();

    lines.forEach((line, index) => {
      const direction = directions[index] ?? (index % 2 === 0 ? 1 : -1);
      const x = normalized * distance * direction;
      line.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
    });

    if (!reduceMotion.matches && active && Math.abs(targetProgress - currentProgress) > 0.001) {
      frame = requestAnimationFrame(render);
    }
  };

  function requestTick() {
    if (frame) return;
    frame = requestAnimationFrame(render);
  }

  const requestMeasure = () => {
    measure();
  };

  window.addEventListener('scroll', requestMeasure, { passive: true });
  window.addEventListener('resize', requestMeasure);

  reduceMotion.addEventListener?.('change', () => {
    measure();
  });

  measure();
})();
