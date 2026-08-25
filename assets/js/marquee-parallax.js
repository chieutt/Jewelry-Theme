(() => {
  const section = document.querySelector('[data-section="06 Scrolling Text"]');
  if (!section) return;

  const primary = section.querySelector('.marquee-primary');
  const secondary = section.querySelector('.marquee-secondary');
  if (!primary || !secondary) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const lerp = (from, to, progress) => from + (to - from) * progress;

  let frame = 0;
  let currentProgress = 0.5;
  let targetProgress = 0.5;
  let active = false;

  section.classList.add('is-marquee-parallax-ready');

  const getAmplitude = () => {
    if (window.innerWidth <= 760) {
      return clamp(window.innerWidth * 0.22, 58, 96);
    }
    return clamp(window.innerWidth * 0.18, 150, 320);
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
    active = rect.bottom > -viewport * 0.2 && rect.top < viewport * 1.2;

    if (active) requestTick();
  };

  const render = () => {
    frame = 0;

    if (reduceMotion.matches) {
      currentProgress = 0.5;
    } else {
      currentProgress += (targetProgress - currentProgress) * 0.14;
    }

    const amplitude = getAmplitude();

    // Opposing tracks create depth: the first row drifts left while the
    // second row drifts right, with a slightly shorter travel on row two.
    const primaryX = lerp(-amplitude * 0.12, -amplitude * 1.18, currentProgress);
    const secondaryX = lerp(-amplitude * 1.02, -amplitude * 0.16, currentProgress);

    primary.style.transform = `translate3d(${primaryX.toFixed(2)}px, 0, 0)`;
    secondary.style.transform = `translate3d(${secondaryX.toFixed(2)}px, 0, 0)`;

    if (!reduceMotion.matches && active && Math.abs(targetProgress - currentProgress) > 0.001) {
      frame = requestAnimationFrame(render);
    }
  };

  function requestTick() {
    if (frame) return;
    frame = requestAnimationFrame(render);
  }

  window.addEventListener('scroll', measure, { passive: true });
  window.addEventListener('resize', measure);
  reduceMotion.addEventListener?.('change', measure);

  measure();
})();
