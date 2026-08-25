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
  let progress = 0.5;

  section.classList.add('is-marquee-parallax-ready');

  const getAmplitude = () => {
    if (window.innerWidth <= 760) {
      return clamp(window.innerWidth * 0.22, 58, 96);
    }
    return clamp(window.innerWidth * 0.18, 150, 320);
  };

  const render = () => {
    frame = 0;

    const rect = section.getBoundingClientRect();
    const viewport = window.innerHeight || document.documentElement.clientHeight;

    progress = reduceMotion.matches
      ? 0.5
      : clamp((viewport - rect.top) / (viewport + rect.height), 0, 1);

    const amplitude = getAmplitude();

    // Pure scroll mapping: no inertia. When scrolling stops, both tracks stop
    // on the exact same frame instead of easing toward a delayed target.
    const primaryX = lerp(-amplitude * 0.12, -amplitude * 1.18, progress);
    const secondaryX = lerp(-amplitude * 1.02, -amplitude * 0.16, progress);

    primary.style.transform = `translate3d(${primaryX.toFixed(2)}px, 0, 0)`;
    secondary.style.transform = `translate3d(${secondaryX.toFixed(2)}px, 0, 0)`;
  };

  const requestRender = () => {
    if (frame) return;
    frame = requestAnimationFrame(render);
  };

  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', requestRender);
  reduceMotion.addEventListener?.('change', requestRender);

  requestRender();
})();
