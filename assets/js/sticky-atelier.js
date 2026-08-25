(() => {
  const section = document.querySelector('.atelier-scroll');
  if (!section) return;

  const steps = [...section.querySelectorAll('.atelier-scroll-step')];
  const images = [...section.querySelectorAll('.atelier-scroll-image')];
  const dots = [...section.querySelectorAll('.atelier-scroll-dots span')];
  const current = section.querySelector('.atelier-scroll-current');
  const sticky = section.querySelector('.atelier-scroll-sticky');

  let activeIndex = -1;
  let ticking = false;

  function setActive(index){
    index = Math.max(0, Math.min(steps.length - 1, index));
    if (index === activeIndex) return;
    activeIndex = index;

    steps.forEach((el,i)=>el.classList.toggle('active',i===index));
    images.forEach((el,i)=>el.classList.toggle('active',i===index));
    dots.forEach((el,i)=>el.classList.toggle('active',i===index));

    if (current) current.textContent = String(index + 1).padStart(2,'0');
    if (sticky) sticky.style.setProperty('--atelier-progress', ((index + 1) / steps.length).toFixed(4));
  }

  function update(){
    ticking = false;

    if (window.innerWidth <= 760){
      setActive(0);
      return;
    }

    const rect = section.getBoundingClientRect();

    // Keep the original 3-screen story timing, while reserving the final
    // viewport for the next section to slide over the sticky atelier frame.
    const overlapDistance = window.innerHeight;
    const scrollable = section.offsetHeight - window.innerHeight - overlapDistance;
    if (scrollable <= 0) return;

    const progress = Math.max(0, Math.min(0.9999, -rect.top / scrollable));
    const index = Math.floor(progress * steps.length);
    setActive(index);
  }

  function requestUpdate(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  setActive(0);
  window.addEventListener('scroll', requestUpdate, {passive:true});
  window.addEventListener('resize', requestUpdate);
  requestUpdate();
})();
