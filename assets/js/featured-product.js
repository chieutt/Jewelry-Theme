(() => {
  const views = [
    {
      caption:'Front study · 18K yellow gold',
      svg:`<svg class="line-art" viewBox="0 0 720 860" aria-label="Arc Ring front view">
        <circle cx="360" cy="470" r="220"/>
        <circle cx="360" cy="470" r="154"/>
        <path d="M266 204h188l48 104H218z"/>
        <circle cx="360" cy="205" r="70"/>
        <line x1="145" y1="738" x2="575" y2="738"/>
      </svg>`
    },
    {
      caption:'Setting detail · natural spinel',
      svg:`<svg class="line-art" viewBox="0 0 720 860" aria-label="Arc Ring setting detail">
        <circle cx="360" cy="430" r="176"/>
        <circle cx="360" cy="430" r="116"/>
        <path d="M286 206h148l42 92H244z"/>
        <circle cx="360" cy="430" r="34"/>
        <line x1="240" y1="648" x2="480" y2="648"/>
      </svg>`
    },
    {
      caption:'Profile study · hand finished',
      svg:`<svg class="line-art" viewBox="0 0 720 860" aria-label="Arc Ring profile view">
        <path d="M144 548c95-9 168-70 210-188 47 83 117 136 217 158l-33 79H179z"/>
        <line x1="275" y1="492" x2="444" y2="553"/>
        <circle cx="354" cy="356" r="44"/>
      </svg>`
    }
  ];

  const stage = document.getElementById('featuredMediaStage');
  const dotsWrap = document.getElementById('featuredMediaDots');
  let activeView = 0;

  if (stage && dotsWrap) {
    stage.innerHTML = views.map((view,i)=>`
      <figure class="featured-refined-view ${i===0?'active':''}" data-view="${i}">
        ${view.svg}
        <figcaption class="featured-refined-caption">${view.caption}</figcaption>
      </figure>
    `).join('');

    dotsWrap.innerHTML = views.map((_,i)=>`
      <button class="featured-media-dot ${i===0?'active':''}" type="button" data-view="${i}" aria-label="Show product image ${i+1}"></button>
    `).join('');

    const viewEls=[...stage.querySelectorAll('.featured-refined-view')];
    const dotEls=[...dotsWrap.querySelectorAll('.featured-media-dot')];

    function setView(index){
      activeView=(index+views.length)%views.length;
      viewEls.forEach((el,i)=>el.classList.toggle('active',i===activeView));
      dotEls.forEach((el,i)=>{const active=i===activeView;el.classList.toggle('active',active);el.setAttribute('aria-current',active?'true':'false');});
    }

    dotEls.forEach((dot,i)=>dot.addEventListener('click',()=>setView(i)));
    document.getElementById('featuredPrev')?.addEventListener('click',()=>setView(activeView-1));
    document.getElementById('featuredNext')?.addEventListener('click',()=>setView(activeView+1));
  }

  const metals=[...document.querySelectorAll('.featured-refined-metal')];
  const metalLabel=document.getElementById('featuredMetalLabel');
  metals.forEach(btn=>{
    btn.addEventListener('click',()=>{
      metals.forEach(b=>{
        const active=b===btn;
        b.classList.toggle('active',active);
        b.setAttribute('aria-pressed',active?'true':'false');
      });
      if(metalLabel) metalLabel.textContent=btn.dataset.metal;
    });
  });

  const sizes=[...document.querySelectorAll('.featured-refined-sizes button')];
  sizes.forEach(btn=>btn.addEventListener('click',()=>{
    sizes.forEach(b=>{const active=b===btn;b.classList.toggle('active',active);b.setAttribute('aria-pressed',active?'true':'false');});
  }));

  const add=document.getElementById('featuredAdd');
  add?.addEventListener('click',()=>{
    const label=add.querySelector('span:first-child');
    if(!label)return;
    label.textContent='Added ✓';
    setTimeout(()=>label.textContent='Add to bag',1200);
  });
})();
