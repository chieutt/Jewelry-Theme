(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const main = document.querySelector('main');
  if (!main) return;

  const excludedSections = new Set([
    '01 Editorial slideshow',
    '03B Text Highlight',
    '12 Image Stack'
  ]);

  const sections = [...main.querySelectorAll('[data-section]')]
    .filter((section) => !excludedSections.has(section.dataset.section));

  const revealNodes = new Set();

  const addReveal = (node, options = {}) => {
    if (!(node instanceof HTMLElement) || revealNodes.has(node)) return;
    revealNodes.add(node);
    node.classList.add('motion-reveal');
    if (options.section) node.classList.add('motion-reveal--section');
    if (options.soft) node.classList.add('motion-reveal--soft');
    if (Number.isFinite(options.delay)) {
      node.style.setProperty('--motion-delay', `${Math.max(0, options.delay)}ms`);
    }
  };

  const staggerChildren = (container, selector = ':scope > *', step = 70, maxDelay = 280) => {
    if (!(container instanceof HTMLElement)) return;
    [...container.querySelectorAll(selector)].forEach((node, index) => {
      addReveal(node, { delay: Math.min(index * step, maxDelay) });
    });
  };

  sections.forEach((section) => {
    addReveal(section, { section: true });

    section.querySelectorAll('.section-head').forEach((node) => addReveal(node, { soft: true }));

    [
      '.product-grid',
      '.collection-studies-mosaic',
      '.journal-modern-grid',
      '.social-offset-strip',
      '.social-runway',
      '.service-strip-grid',
      '.authority-numbers-inner'
    ].forEach((selector) => {
      section.querySelectorAll(selector).forEach((group) => staggerChildren(group));
    });

    [
      '.featured-edit-promo',
      '.look-image',
      '.look-media',
      '.look-side',
      '.look-product-stage',
      '.featured-refined-media',
      '.featured-refined-info',
      '.highlight-image',
      '.highlight-copy',
      '.banner-copy',
      '.video-copy',
      '.gift-bundle-copy',
      '.gift-bundle-products',
      '.image-text-copy',
      '.image-text-media',
      '.testimonial-copy',
      '.launch-ledger-inner'
    ].forEach((selector) => {
      section.querySelectorAll(selector).forEach((node, index) => addReveal(node, {
        soft: true,
        delay: Math.min(index * 80, 240)
      }));
    });

    /* Generic cards/articles that are not already captured by a structural grid. */
    section.querySelectorAll('article:not(.slide), .product-card, .service-item').forEach((node) => {
      if (!revealNodes.has(node)) addReveal(node, { soft: true });
    });
  });

  const counters = [...document.querySelectorAll('[data-section="01A Authority Numbers"] [data-counter]')];
  const counterStates = new WeakMap();

  const formatCounter = (value, node) => {
    const decimals = Number(node.dataset.counterDecimals || 0);
    const suffix = node.dataset.counterSuffix || '';
    const prefix = node.dataset.counterPrefix || '';
    const formatted = Number(value).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
    return `${prefix}${formatted}${suffix}`;
  };

  const setCounterFinal = (node) => {
    const target = Number(node.dataset.counter || 0);
    node.textContent = formatCounter(target, node);
    node.dataset.counterComplete = 'true';
  };

  const animateCounter = (node) => {
    if (node.dataset.counterComplete === 'true') return;
    if (reduceMotion.matches) {
      setCounterFinal(node);
      return;
    }

    const target = Number(node.dataset.counter || 0);
    const duration = Number(node.dataset.counterDuration || 1350);
    const start = performance.now();

    const state = { frame: 0 };
    counterStates.set(node, state);

    const tick = (now) => {
      const elapsed = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - elapsed, 4);
      const value = target * eased;
      node.textContent = formatCounter(value, node);

      if (elapsed < 1) {
        state.frame = requestAnimationFrame(tick);
      } else {
        setCounterFinal(node);
      }
    };

    node.textContent = formatCounter(0, node);
    state.frame = requestAnimationFrame(tick);
  };

  if (reduceMotion.matches) {
    revealNodes.forEach((node) => node.classList.add('motion-visible', 'motion-complete'));
    counters.forEach(setCounterFinal);
    document.documentElement.classList.add('motion-ready');
    return;
  }

  document.documentElement.classList.add('motion-ready');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const node = entry.target;
      node.classList.add('motion-visible');
      window.setTimeout(() => node.classList.add('motion-complete'), 1100);
      observer.unobserve(node);
    });
  }, {
    threshold:0.08,
    rootMargin:'0px 0px -7% 0px'
  });

  revealNodes.forEach((node) => revealObserver.observe(node));

  const authoritySection = document.querySelector('[data-section="01A Authority Numbers"]');
  if (authoritySection && counters.length) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        counters.forEach((node, index) => {
          window.setTimeout(() => animateCounter(node), index * 90);
        });
        observer.unobserve(entry.target);
      });
    }, {
      threshold:0.32,
      rootMargin:'0px 0px -6% 0px'
    });

    counterObserver.observe(authoritySection);
  }

  reduceMotion.addEventListener?.('change', (event) => {
    if (!event.matches) return;
    revealNodes.forEach((node) => node.classList.add('motion-visible', 'motion-complete'));
    counters.forEach((node) => {
      const state = counterStates.get(node);
      if (state?.frame) cancelAnimationFrame(state.frame);
      setCounterFinal(node);
    });
  });
})();
