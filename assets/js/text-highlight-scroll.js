(() => {
  const section = document.querySelector('[data-section="03B Text Highlight"]');
  if (!section) return;

  const lines = [...section.querySelectorAll('.text-highlight-line')];
  if (!lines.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const shouldSkipTextNode = (node) => {
    const parent = node.parentElement;
    if (!parent) return true;
    return Boolean(parent.closest('.text-highlight-thumb, svg, script, style'));
  };

  const tokenizeLine = (line) => {
    const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
    const textNodes = [];

    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.nodeValue?.trim() || shouldSkipTextNode(node)) continue;
      textNodes.push(node);
    }

    textNodes.forEach((node) => {
      const fragment = document.createDocumentFragment();
      const parts = node.nodeValue.split(/(\s+)/);

      parts.forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          fragment.appendChild(document.createTextNode(part));
          return;
        }

        const token = document.createElement('span');
        token.className = 'text-highlight-token';
        token.textContent = part;
        token.style.setProperty('--highlight-fill-stop', '0%');
        fragment.appendChild(token);
      });

      node.replaceWith(fragment);
    });
  };

  lines.forEach((line) => {
    line.style.removeProperty('transform');
    line.style.removeProperty('will-change');
    line.style.removeProperty('transform-origin');
    tokenizeLine(line);
  });

  const tokens = [...section.querySelectorAll('.text-highlight-token')];
  if (!tokens.length) return;

  section.classList.add('is-scroll-highlight-ready');

  let frame = 0;

  const render = () => {
    frame = 0;

    if (reduceMotion.matches) {
      tokens.forEach((token) => token.style.setProperty('--highlight-fill-stop', '100%'));
      return;
    }

    const rect = section.getBoundingClientRect();
    const viewport = window.innerHeight || document.documentElement.clientHeight;

    // Start filling when the section reaches ~80% of the viewport and finish
    // when its bottom reaches ~25%, giving the text a long scroll-driven sweep.
    const startY = viewport * 0.8;
    const endBottomY = viewport * 0.25;
    const travel = rect.height + startY - endBottomY;
    const progress = clamp((startY - rect.top) / Math.max(1, travel), 0, 1);

    // Let neighboring words overlap slightly so the fill reads as one continuous
    // left-to-right / top-to-bottom sweep instead of discrete word jumps.
    const overlap = 1.35;
    const cursor = progress * (tokens.length - 1 + overlap);

    tokens.forEach((token, index) => {
      const localProgress = clamp((cursor - index) / overlap, 0, 1);
      token.style.setProperty('--highlight-fill-stop', `${(localProgress * 100).toFixed(2)}%`);
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
