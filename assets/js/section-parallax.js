(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const sections = [];

  const addSection = (selector, targets, options = {}) => {
    const section = document.querySelector(selector);
    if (!section) return;

    const resolvedTargets = targets
      .map(({ selector: targetSelector, amount, mobileAmount, minWidth = 0, liveFactor = 0 }) => ({
        node: section.querySelector(targetSelector),
        amount,
        mobileAmount,
        minWidth,
        liveFactor
      }))
      .filter((item) => item.node instanceof HTMLElement || item.node instanceof SVGElement);

    if (!resolvedTargets.length) return;

    resolvedTargets.forEach(({ node }) => {
      node.style.willChange = 'translate';
    });

    sections.push({
      section,
      targets: resolvedTargets,
      mobileScale: options.mobileScale ?? 0.5
    });
  };

  // Campaign banners: move only the artwork so the copy remains crisp and calm.
  addSection('[data-section="03 Image Banner"]', [
    { selector: ':scope > svg', amount: 72, mobileAmount: 28 }
  ]);

  addSection('[data-section="08 Video banner"]', [
    { selector: ':scope > svg', amount: -82, mobileAmount: -32 }
  ]);

  // Editorial pair: keep both background panels locked to the grid and move only
  // the artwork/copy inside them so the box edges always stay perfectly aligned.
  addSection('[data-section="04 Highlight text with image"]', [
    { selector: '.highlight-image svg', amount: 30, mobileAmount: 10 },
    { selector: '.highlight-copy blockquote', amount: -22, mobileAmount: -7 },
    { selector: '.highlight-copy > p', amount: -14, mobileAmount: -5 },
    { selector: '.highlight-copy .highlight-action', amount: -8, mobileAmount: -3 }
  ]);

  // Collection studies: keep the mosaic geometry fixed while the header and each
  // artwork plane drift at different speeds. SVG hover transforms remain independent.
  addSection('[data-section="05 Collection list split promotions"]', [
    { selector: '.collection-studies-head > div:first-child', amount: -18, mobileAmount: -7 },
    { selector: '.collection-studies-aside', amount: 14, mobileAmount: 5 },
    { selector: '.collection-study--nocturne .collection-study-art svg', amount: -34, mobileAmount: -11 },
    { selector: '.collection-study--arc .collection-study-art svg', amount: 20, mobileAmount: 7 },
    { selector: '.collection-study--linea .collection-study-art svg', amount: -24, mobileAmount: -8 },
    { selector: '.collection-study--daily .collection-study-art svg', amount: 28, mobileAmount: 9 },
    { selector: '.collection-study--form .collection-study-art svg', amount: -38, mobileAmount: -12 }
  ]);

  // Countdown: split the editorial copy, numerals and footer into three depth planes.
  addSection('[data-section="10 Countdown timer"]', [
    { selector: '.launch-ledger-top', amount: -28, mobileAmount: -12 },
    { selector: '.launch-ledger-clock', amount: 46, mobileAmount: 18 },
    { selector: '.launch-ledger-bottom', amount: -16, mobileAmount: -7 }
  ]);

  // Atelier editorial: drift the full media/copy columns, then add secondary motion
  // to the individual image frames so the collage retains multiple depth levels.
  addSection('[data-section="11 Image with Text"]', [
    { selector: '.atelier-editorial-media', amount: 18, mobileAmount: 8 },
    { selector: '.atelier-editorial-copy', amount: -30, mobileAmount: -12 },
    { selector: '.atelier-editorial-frame--a', amount: -42, mobileAmount: -20 },
    { selector: '.atelier-editorial-frame--b', amount: 62, mobileAmount: 28 },
    { selector: '.atelier-editorial-frame--c', amount: -28, mobileAmount: -14 },
    { selector: '.atelier-editorial-caption', amount: 16, mobileAmount: 8 }
  ]);

  // Image Stack: preserve sticky/step geometry while letting both story copy and
  // artwork drift inside the pinned scene. Disabled on the stacked mobile layout.
  addSection('[data-section="12 Image Stack"]', [
    { selector: '.atelier-scroll-copy-stage', amount: -20, minWidth: 761 },
    { selector: '.atelier-scroll-dots', amount: -8, minWidth: 761 },
    { selector: '.atelier-scroll-media', amount: 10, minWidth: 761 },
    { selector: '.atelier-scroll-image[data-step="0"] svg', amount: 28, minWidth: 761 },
    { selector: '.atelier-scroll-image[data-step="1"] svg', amount: -22, minWidth: 761 },
    { selector: '.atelier-scroll-image[data-step="2"] svg', amount: 26, minWidth: 761 },
    { selector: '.atelier-scroll-image[data-step="0"] figcaption', amount: -7, minWidth: 761 },
    { selector: '.atelier-scroll-image[data-step="1"] figcaption', amount: 6, minWidth: 761 },
    { selector: '.atelier-scroll-image[data-step="2"] figcaption', amount: -7, minWidth: 761 }
  ]);

  // Testimonial: restrained typography parallax so the quote remains the focal point.
  addSection('[data-section="16 Testimonials"]', [
    { selector: '.testimonial-feature-top', amount: -14, mobileAmount: -5 },
    { selector: '.testimonial-feature-quote', amount: 28, mobileAmount: 9 },
    { selector: '.testimonial-feature-meta', amount: -12, mobileAmount: -4 }
  ]);

  // Instagram: desktop cards get position parallax plus a small live velocity response.
  // The liveFactor makes the offset visible while the wheel/trackpad is actively moving,
  // then it decays quickly back into the normal scroll-position parallax.
  addSection('[data-section="17 Instagram gallery"]', [
    { selector: '.social-runway-item--1', amount: -24, minWidth: 1001, liveFactor: -0.95 },
    { selector: '.social-runway-item--2', amount: 38, minWidth: 1001, liveFactor: 1.15 },
    { selector: '.social-runway-item--3', amount: -30, minWidth: 1001, liveFactor: -1.05 },
    { selector: '.social-runway-item--4', amount: 46, minWidth: 1001, liveFactor: 1.3 },
    { selector: '.social-runway-item--5', amount: -34, minWidth: 1001, liveFactor: -1.15 },
    { selector: '.social-runway-item--1 .social-runway-media svg', amount: -34, minWidth: 1001, liveFactor: -0.45 },
    { selector: '.social-runway-item--2 .social-runway-media svg', amount: 50, minWidth: 1001, liveFactor: 0.55 },
    { selector: '.social-runway-item--3 .social-runway-media svg', amount: -42, minWidth: 1001, liveFactor: -0.5 },
    { selector: '.social-runway-item--4 .social-runway-media svg', amount: 62, minWidth: 1001, liveFactor: 0.62 },
    { selector: '.social-runway-item--5 .social-runway-media svg', amount: -48, minWidth: 1001, liveFactor: -0.55 }
  ]);

  if (!sections.length) return;

  let frame = 0;
  let lastScrollY = window.scrollY || window.pageYOffset || 0;
  let liveVelocity = 0;
  let liveTarget = 0;
  let activeUntil = 0;

  const reset = () => {
    liveVelocity = 0;
    liveTarget = 0;
    sections.forEach(({ targets }) => {
      targets.forEach(({ node }) => {
        node.style.translate = 'none';
      });
    });
  };

  const render = (now = performance.now()) => {
    frame = 0;

    if (reduceMotion.matches) {
      reset();
      return;
    }

    const viewport = window.innerHeight || document.documentElement.clientHeight;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const isMobile = viewportWidth <= 760;

    // Follow the current scroll impulse while scrolling, then settle quickly.
    liveVelocity += (liveTarget - liveVelocity) * 0.34;
    if (now > activeUntil) liveTarget *= 0.72;
    if (Math.abs(liveTarget) < 0.02) liveTarget = 0;
    if (Math.abs(liveVelocity) < 0.02 && liveTarget === 0) liveVelocity = 0;

    sections.forEach(({ section, targets, mobileScale }) => {
      const rect = section.getBoundingClientRect();

      if (rect.bottom < -viewport * 0.35 || rect.top > viewport * 1.35) return;

      const progress = clamp((viewport - rect.top) / (viewport + rect.height), 0, 1);
      const normalized = (progress - 0.5) * 2;

      targets.forEach(({ node, amount, mobileAmount, minWidth, liveFactor }) => {
        if (viewportWidth < minWidth) {
          node.style.translate = 'none';
          return;
        }

        const effectiveAmount = isMobile
          ? (Number.isFinite(mobileAmount) ? mobileAmount : amount * mobileScale)
          : amount;
        const liveOffset = liveFactor ? liveVelocity * liveFactor : 0;
        const y = normalized * effectiveAmount + liveOffset;
        node.style.translate = `0 ${y.toFixed(2)}px`;
      });
    });

    if (now <= activeUntil || liveTarget !== 0 || liveVelocity !== 0) {
      frame = requestAnimationFrame(render);
    }
  };

  const requestRender = () => {
    if (frame) return;
    frame = requestAnimationFrame(render);
  };

  const handleScroll = () => {
    const currentScrollY = window.scrollY || window.pageYOffset || 0;
    const delta = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;

    liveTarget = clamp(delta * 1.8, -22, 22);
    activeUntil = performance.now() + 110;
    requestRender();
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', requestRender);
  reduceMotion.addEventListener?.('change', requestRender);

  requestRender();
})();