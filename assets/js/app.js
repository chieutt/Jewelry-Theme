const scriptQueue = [
  'assets/js/homepage.js',
  'assets/js/hero-motion.js',
  'assets/js/gift-bundle.js',
  'assets/js/sticky-atelier.js',
  'assets/js/featured-product.js',
  'assets/js/navigation.js'
];

async function hydrateIncludes(root = document) {
  const nodes = [...root.querySelectorAll('[data-include]')];
  await Promise.all(nodes.map(async (node) => {
    const path = node.dataset.include;
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Unable to load ${path}: ${response.status}`);

    const template = document.createElement('template');
    template.innerHTML = (await response.text()).trim();
    await hydrateIncludes(template.content);
    node.replaceWith(template.content);
  }));
}

function loadClassicScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.defer = false;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Unable to load ${src}`));
    document.body.appendChild(script);
  });
}

try {
  await hydrateIncludes();
  for (const src of scriptQueue) await loadClassicScript(src);
  document.documentElement.classList.remove('is-loading');
  document.documentElement.classList.add('is-ready');
  window.dispatchEvent(new CustomEvent('spinel:ready'));
} catch (error) {
  console.error(error);
  document.documentElement.classList.remove('is-loading');
  document.documentElement.classList.add('is-error');
}
