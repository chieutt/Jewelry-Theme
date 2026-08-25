(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const sections = [];

  const addSection = (selector, targets, options = {}) => {
    const section = document.querySelector(selector);
    if (!section) return;

    const resolvedTargets = targets
      .map(({ selector: targetSelector, amount, mobileAmount, desktopOnly = false }) => ({
        node: section.querySelector(targetSelector),
        amount,
        mobileAmount,
        desktopOnly
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

  // Atelier collage: opposing speeds make the three frames feel physically layered.
  addSection('[data-section="11 Image with Text"]', [
    { selector: '.atelier-editorial-frame--a', amount: -42, mobileAmount: -20 },
    { selector: '.atelier-editorial-frame--b', amount: 62, mobileAmount: 28 },
    { selector: '.atelier-editorial-frame--c', amount: -28, mobileAmount: -14 },
    { selector: '.atelier-editorial-caption', amount: 16, mobileAmount: 8 }
  ]);

  // Social collage: desktop only, because mobile is already a horizontal swipe rail.
  const socialSection = document.querySelector('[data-section="17 Instagram gallery"]');
  if (socialSection) {
    const socialItems = [...socialSection.querySelectorAll('.social-runway-item')];
    const socialAmounts = [-28, 54, -36, 68, -42];

    const targets = socialItems.map((node, index) => ({
      node,
      amount: socialAmounts[index] ?? (index % 2 === 0 ? -32 : 48),
      desktopOnly: true
    }));

    if (targets.length) {
      targets.forEach(({ node }) => {
        node.style.willChange = 'translate';
      });
      sections.push({ section: socialSection, targets, mobileScale: 0 });
    }
  }

  if (!sections.length) return;

  let frame = 0;

  const reset = () => {
    sections.forEach(({ targets }) => {
      targets.forEach(({ node }) => {
        node.style.translate = 'none';
      });
    });
  };

  const render = () => {
    frame = 0;

    if (reduceMotion.matches) {
      reset();
      return;
    }

    const viewport = window.innerHeight || document.documentElement.clientHeight;
    const isMobile = window.innerWidth <= 760;

    sections.forEach(({ section, targets, mobileScale }) => {
      const rect = section.getBoundingClientRect();

      // Skip work far outside the viewport while preserving the last visual state.
      if (rect.bottom < -viewport * 0.35 || rect.top > viewport * 1.35) return;

      const progress = clamp((viewport - rect.top) / (viewport + rect.height), 0, 1);
      const normalized = (progress - 0.5) * 2;

      targets.forEach(({ node, amount, mobileAmount, desktopOnly }) => {
        if (desktopOnly && isMobile) {
          node.style.translate = 'none';
          return;
        }

        const effectiveAmount = isMobile
          ? (Number.isFinite(mobileAmount) ? mobileAmount : amount * mobileScale)
          : amount;
        const y = normalized * effectiveAmount;
        node.style.translate = `0 ${y.toFixed(2)}px`;
      });
    });
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
