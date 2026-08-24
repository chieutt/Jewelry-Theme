const productSVGs=[
`<svg class="line-art" viewBox="0 0 300 360"><circle cx="150" cy="190" r="74"/><circle cx="150" cy="190" r="51"/><circle cx="150" cy="103" r="25"/></svg>`,
`<svg class="line-art" viewBox="0 0 300 360"><path d="M67 220c33-2 58-23 74-64 18 32 45 52 84 61l-13 31H78z"/><line x1="114" y1="193" x2="180" y2="221"/></svg>`,
`<svg class="line-art" viewBox="0 0 300 360"><circle cx="105" cy="180" r="47"/><circle cx="195" cy="180" r="47"/><line x1="152" y1="180" x2="148" y2="180"/></svg>`,
`<svg class="line-art" viewBox="0 0 300 360"><path d="M70 135h160v125H70z"/><path d="M105 135c6-61 82-61 90 0"/><circle cx="150" cy="197" r="22"/></svg>`
];
const productCatalog={
  'Arc Ring':{material:'18K recycled gold · Natural spinel',price:2480,badge:'House signature',art:0},
  'Halo Earrings':{material:'18K yellow gold · Spinel pair',price:1680,badge:'New',art:2},
  'Arc Hoops':{material:'18K yellow gold · Sculpted pair',price:1780,art:2},
  'Linea Chain':{material:'18K recycled gold · 42 cm',price:1420,art:1},
  'Form Cuff':{material:'18K yellow gold · Hand finished',price:2100,art:0},
  'Linea Bag':{material:'Calf leather · Gold hardware',price:980,art:3},
  'Vesper Frame':{material:'Acetate · Gold-tone detail',price:420,art:2},
  'Midnight Watch':{material:'Steel · Black lacquer dial',price:1200,art:0},
  'Signet 01':{material:'18K yellow gold · Onyx',price:1860,art:0},
  'Linea Cuff':{material:'18K recycled gold · Hand finished',price:1980,art:1}
};

function productCardMarkup(name,options={}){
  const product=productCatalog[name] || {
    material:'House object',
    price:0,
    art:0
  };

  const variant=options.variant || 'grid';
  const actionLabel=options.actionLabel || 'Quick add';
  const indexMarkup=Number.isInteger(options.index)
    ? `<div class="product-card-index" aria-hidden="true">
        <span>${String(options.index+1).padStart(2,'0')}</span>
        <span>/ ${String(options.total || 1).padStart(2,'0')}</span>
      </div>`
    : '';

  const detailLink=variant==='look'
    ? `<div class="product-card-footer">
        <a class="product-card-link" href="#">View piece →</a>
      </div>`
    : '';

  return `<article class="product-card product-card--${variant}" data-product="${name}">
    <div class="media product-card-media">
      ${product.badge?`<span class="product-badge">${product.badge}</span>`:''}
      ${indexMarkup}
      ${productSVGs[product.art]}
      <button class="product-quick-add product-card-action" type="button" aria-label="${actionLabel} ${name}">
        <span>${actionLabel}</span><span>+</span>
      </button>
    </div>
    <div class="product-meta product-card-info">
      <div class="product-card-copy">
        <strong>${name}</strong>
        <small>${product.material}</small>
      </div>
      <div class="price">$${product.price.toLocaleString()}</div>
    </div>
    ${detailLink}
  </article>`;
}

const makeProducts=(target,names)=>{
  const el=document.getElementById(target);
  if(!el)return;
  el.innerHTML=names.map(name=>productCardMarkup(name)).join('');
};

makeProducts('collectionA',['Arc Ring','Halo Earrings','Linea Chain','Form Cuff']);
makeProducts('collectionHer',['Arc Ring','Halo Earrings','Linea Chain','Form Cuff']);
makeProducts('collectionHim',['Signet 01','Vesper Frame','Midnight Watch','Linea Cuff']);
makeProducts('collectionSelf',['Arc Ring','Form Cuff','Vesper Frame','Linea Chain']);
makeProducts('collectionGift',['Halo Earrings','Linea Chain','Arc Ring','Form Cuff']);

const featuredEditData={
  her:{
    index:'01 / 04', eyebrow:'Current edit · For her', title:'Chosen around gesture.',
    description:'Four pieces selected for proportion, movement and the quiet confidence of everyday wear.',
    products:['Arc Ring','Halo Earrings','Linea Chain','Form Cuff'], art:0
  },
  him:{
    index:'02 / 04', eyebrow:'Current edit · For him', title:'Weight, line, restraint.',
    description:'Objects with quiet weight and strong geometry, selected to settle naturally into a daily uniform.',
    products:['Signet 01','Vesper Frame','Midnight Watch','Linea Cuff'], art:3
  },
  self:{
    index:'03 / 04', eyebrow:'Current edit · For yourself', title:'No occasion required.',
    description:'A personal edit of pieces chosen without ceremony—only proportion, instinct and the desire to keep them close.',
    products:['Arc Ring','Form Cuff','Vesper Frame','Linea Chain'], art:1
  },
  gift:{
    index:'04 / 04', eyebrow:'Current edit · For someone', title:'Something worth marking.',
    description:'Four objects with enough presence to hold a moment and enough restraint to live beyond it.',
    products:['Halo Earrings','Linea Chain','Arc Ring','Form Cuff'], art:2
  }
};

function renderFeaturedEdit(key='her'){
  const edit=featuredEditData[key] || featuredEditData.her;
  const target=document.getElementById('collectionEditA');
  if(target){
    target.innerHTML=edit.products.map(name=>productCardMarkup(name)).join('');
  }
  const art=document.getElementById('featuredEditArt');
  if(art)art.innerHTML=productSVGs[edit.art];
  const fields={
    featuredEditIndex:edit.index,
    featuredEditEyebrow:edit.eyebrow,
    featuredEditTitle:edit.title,
    featuredEditDescription:edit.description
  };
  Object.entries(fields).forEach(([id,value])=>{
    const el=document.getElementById(id); if(el)el.textContent=value;
  });
}

const featuredEditTabs=[...document.querySelectorAll('.featured-edit-tab')];
featuredEditTabs.forEach((btn,index)=>{
  btn.addEventListener('click',()=>{
    featuredEditTabs.forEach(item=>{
      const active=item===btn;
      item.classList.toggle('active',active);
      item.setAttribute('aria-selected',active?'true':'false');
      item.tabIndex=active?0:-1;
    });
    renderFeaturedEdit(btn.dataset.edit);
  });
  btn.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();
    let next=index;
    if(event.key==='ArrowRight')next=(index+1)%featuredEditTabs.length;
    if(event.key==='ArrowLeft')next=(index-1+featuredEditTabs.length)%featuredEditTabs.length;
    if(event.key==='Home')next=0;
    if(event.key==='End')next=featuredEditTabs.length-1;
    featuredEditTabs[next].focus();
    featuredEditTabs[next].click();
  });
});
renderFeaturedEdit('her');

document.addEventListener('click',event=>{
  const btn=event.target.closest('.product-quick-add');
  if(!btn)return;

  const original=btn.innerHTML;
  btn.classList.add('added');
  btn.innerHTML='<span>Added</span><span>✓</span>';

  window.setTimeout(()=>{
    btn.classList.remove('added');
    btn.innerHTML=original;
  },1200);
});

const lookProductNames=['Arc Hoops','Linea Chain','Form Cuff'];
const lookStage=document.getElementById('lookProductStage');
const lookPins=[...document.querySelectorAll('.look-pin')];

function renderLookProduct(index){
  const name=lookProductNames[index];
  if(!lookStage || !name)return;

  lookPins.forEach((pin,i)=>{
    const active=i===index;
    pin.classList.toggle('active',active);
    pin.setAttribute('aria-pressed',active?'true':'false');
  });

  lookStage.innerHTML=productCardMarkup(name,{
    variant:'look',
    index,
    total:lookProductNames.length,
    actionLabel:'Add to bag'
  });
}

lookPins.forEach((pin,index)=>{
  pin.addEventListener('click',()=>renderLookProduct(index));
});

renderLookProduct(0);

document.getElementById('blogGrid').innerHTML=[
['Material studies','Why warm gold is returning','4 min read · Aug 2026'],
['Atelier notes','What makes a stone worth keeping?','6 min read · Aug 2026'],
['How to wear','Layering without symmetry','3 min read · Jul 2026'],
['Object study','The weight of a signet','5 min read · Jul 2026'],
['House notes','Why we finish every edge by hand','4 min read · Jun 2026']
].map((a,i)=>`<article class="journal-modern-card ${i===0?'journal-modern-card--feature':'journal-modern-card--side journal-modern-card--side-'+i}">
  <a href="#" class="journal-modern-media">${productSVGs[i%productSVGs.length]}</a>
  <div class="journal-modern-copy">
    <div class="journal-modern-meta"><span>${a[0]}</span><span>${a[2]}</span></div>
    <h3><a href="#">${a[1]}</a></h3>
    ${i===0?'<a class="journal-modern-read" href="#">Read story →</a>':''}
  </div>
</article>`).join('');

document.getElementById('instaGrid').innerHTML=Array.from({length:5},(_,i)=>`
<a class="social-runway-item social-runway-item--${i+1}" href="#" aria-label="View @spinel atelier post ${i+1}">
  <div class="social-runway-media">${productSVGs[(i+1)%4]}</div>
  <div class="social-runway-caption"><span>${String(i+1).padStart(2,'0')}</span><span>${i===0?'Campaign study':'@spinel.atelier'}</span></div>
</a>`).join('');

const slides=[...document.querySelectorAll('[data-section="01 Editorial slideshow"] .slide')];
const heroSlideshow=document.querySelector('[data-section="01 Editorial slideshow"]');
const heroTabs=[...document.querySelectorAll('.hero-rail-tab[data-hero-slide]')];
const heroPause=document.getElementById('heroPause');
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let current=0;
let heroTimer=null;
let heroPaused=false;

function showSlide(i){
  if(!slides.length)return;
  current=(i+slides.length)%slides.length;
  slides.forEach((slide,index)=>{
    const active=index===current;
    slide.classList.toggle('active',active);
    slide.setAttribute('aria-hidden',active?'false':'true');
  });
  heroTabs.forEach((tab,index)=>{
    const active=index===current;
    tab.classList.toggle('active',active);
    tab.setAttribute('aria-selected',active?'true':'false');
    tab.tabIndex=active?0:-1;
  });

  const activeSlide=slides[current];
  const title=document.getElementById('heroRailTitle');
  const meta=document.getElementById('heroRailMeta');
  const counter=document.getElementById('heroRailIndex');
  if(title)title.textContent=activeSlide?.dataset.heroName || '';
  if(meta)meta.textContent=activeSlide?.dataset.heroMeta || '';
  if(counter)counter.textContent=`${String(current+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
}

function stopHeroAutoplay(){
  if(heroTimer){clearInterval(heroTimer);heroTimer=null;}
}

function startHeroAutoplay(){
  stopHeroAutoplay();
  if(heroPaused || reduceMotion.matches || document.hidden || slides.length<2)return;
  heroTimer=setInterval(()=>showSlide(current+1),6500);
}

heroTabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>{
    showSlide(index);
    startHeroAutoplay();
  });
  tab.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();
    let next=index;
    if(event.key==='ArrowRight')next=(index+1)%heroTabs.length;
    if(event.key==='ArrowLeft')next=(index-1+heroTabs.length)%heroTabs.length;
    if(event.key==='Home')next=0;
    if(event.key==='End')next=heroTabs.length-1;
    heroTabs[next].focus();
    heroTabs[next].click();
  });
});

heroPause?.addEventListener('click',()=>{
  heroPaused=!heroPaused;
  heroPause.setAttribute('aria-pressed',heroPaused?'true':'false');
  heroPause.setAttribute('aria-label',heroPaused?'Resume slideshow':'Pause slideshow');
  const icon=heroPause.querySelector('span');
  if(icon)icon.textContent=heroPaused?'▶':'Ⅱ';
  heroPaused?stopHeroAutoplay():startHeroAutoplay();
});

heroSlideshow?.addEventListener('mouseenter',stopHeroAutoplay);
heroSlideshow?.addEventListener('mouseleave',()=>{if(!heroPaused)startHeroAutoplay();});
heroSlideshow?.addEventListener('focusin',stopHeroAutoplay);
heroSlideshow?.addEventListener('focusout',()=>{
  if(!heroPaused && !heroSlideshow.contains(document.activeElement))startHeroAutoplay();
});
document.addEventListener('visibilitychange',()=>document.hidden?stopHeroAutoplay():startHeroAutoplay());
reduceMotion.addEventListener?.('change',startHeroAutoplay);
showSlide(0);
startHeroAutoplay();

document.querySelectorAll('.tab-btn').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.tab-btn').forEach(b=>{
    const active=b===btn;
    b.classList.toggle('active',active);
    b.setAttribute('aria-selected',active?'true':'false');
  });
  document.querySelectorAll('.tab-panel').forEach(panel=>{
    const active=panel.id===btn.dataset.tab;
    panel.classList.toggle('active',active);
    panel.hidden=!active;
  });
  const narrative=document.getElementById('tabNarrative');
  if(narrative && btn.dataset.copy)narrative.textContent=btn.dataset.copy;
}));

const playBtn=document.getElementById('playBtn');
if(playBtn){
  playBtn.onclick=e=>{
    const btn=e.currentTarget;
    const playing=btn.classList.toggle('is-playing');
    btn.setAttribute('aria-pressed',playing?'true':'false');
    btn.setAttribute('aria-label',playing?'Pause film':'Play film');
    const label=btn.querySelector('.video-play-label');
    if(label)label.textContent=playing?'Pause film':'Play film';
  };
}

function tick(){
  const diff=Math.max(0,new Date('2026-09-01T00:00:00').getTime()-Date.now());
  const d=Math.floor(diff/86400000),h=Math.floor(diff/3600000)%24,m=Math.floor(diff/60000)%60,s=Math.floor(diff/1000)%60;
  document.getElementById('d').textContent=String(d).padStart(2,'0');document.getElementById('h').textContent=String(h).padStart(2,'0');document.getElementById('m').textContent=String(m).padStart(2,'0');document.getElementById('s').textContent=String(s).padStart(2,'0');
}
tick();setInterval(tick,1000);

const footerSignup=document.getElementById('footerSignup');
footerSignup?.addEventListener('submit',event=>{
  event.preventDefault();
  const button=footerSignup.querySelector('button');
  const input=footerSignup.querySelector('input');
  button.textContent='✓';
  input.value='Thank you.';
  input.setAttribute('disabled','');
});
