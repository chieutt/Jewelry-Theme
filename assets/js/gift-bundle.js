(() => {
  const giftEdits = {
    mum: [
      {name:'Halo Pendant', meta:'18K yellow gold · Spinel', price:1180, art:0},
      {name:'Arc Studs', meta:'18K yellow gold · Pair', price:680, art:2},
      {name:'Linea Bracelet', meta:'18K yellow gold', price:920, art:1},
      {name:'Nocturne Charm', meta:'Limited gift edition', price:440, art:3}
    ],
    friend: [
      {name:'Vesper Studs', meta:'Silver · Pair', price:460, art:2},
      {name:'Linea Chain', meta:'18K vermeil', price:720, art:1},
      {name:'Spinel Signet', meta:'Sterling silver · Stone', price:810, art:0}
    ],
    partner: [
      {name:'Arc Ring', meta:'18K yellow gold · Spinel', price:2480, art:0},
      {name:'Halo Earrings', meta:'18K yellow gold · Pair', price:1280, art:2},
      {name:'Nocturne Chain', meta:'18K yellow gold', price:1620, art:1},
      {name:'Midnight Object', meta:'House edition', price:980, art:3}
    ],
    myself: [
      {name:'Form Cuff', meta:'18K yellow gold', price:1240, art:1},
      {name:'Arc Ring', meta:'18K yellow gold · Spinel', price:2480, art:0},
      {name:'Vesper Frame', meta:'Nocturne acetate', price:420, art:2}
    ]
  };

  const art = [
    `<svg class="line-art" viewBox="0 0 220 220"><circle cx="110" cy="118" r="55"/><circle cx="110" cy="118" r="36"/><circle cx="110" cy="54" r="17"/></svg>`,
    `<svg class="line-art" viewBox="0 0 220 220"><path d="M42 146c25-1 44-18 56-50 14 25 35 41 65 47l-10 23H51z"/><line x1="80" y1="127" x2="132" y2="148"/></svg>`,
    `<svg class="line-art" viewBox="0 0 220 220"><circle cx="78" cy="110" r="35"/><circle cx="142" cy="110" r="35"/><line x1="113" y1="110" x2="107" y2="110"/></svg>`,
    `<svg class="line-art" viewBox="0 0 220 220"><rect x="55" y="70" width="110" height="92"/><path d="M80 70c5-38 55-38 60 0"/><circle cx="110" cy="116" r="20"/></svg>`
  ];

  const list = document.getElementById('giftProducts');
  const totalEl = document.getElementById('giftBundleTotal');
  const saveEl = document.getElementById('giftBundleSave');
  const addAll = document.getElementById('giftAddAll');
  let active = 'mum';

  const money = n => '$' + n.toLocaleString();

  function renderGiftEdit(key){
    active = key;
    const items = giftEdits[key];
    list.innerHTML = items.map((item,i)=>`
      <article class="gift-product">
        <div class="gift-product-thumb">${art[item.art]}</div>
        <div class="gift-product-info">
          <div class="gift-product-title-row">
            <strong>${item.name}</strong>
            <span class="gift-product-price">${money(item.price)}</span>
          </div>
          <span class="gift-product-meta">${item.meta}</span>
        </div>
        <button class="gift-product-add" type="button" aria-label="Add ${item.name} to bag" data-index="${i}">+</button>
      </article>
    `).join('');

    const subtotal = items.reduce((sum,item)=>sum+item.price,0);
    const bundleTotal = Math.round(subtotal * .9);
    totalEl.textContent = money(bundleTotal);
    saveEl.textContent = money(subtotal-bundleTotal);

    list.querySelectorAll('.gift-product-add').forEach(btn=>{
      btn.addEventListener('click',()=>{
        btn.classList.toggle('added');
        btn.textContent = btn.classList.contains('added') ? '✓' : '+';
      });
    });
  }

  document.querySelectorAll('.gift-tab').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.gift-tab').forEach(b=>{
        b.classList.toggle('active',b===btn);
        b.setAttribute('aria-selected',b===btn ? 'true':'false');
      });
      renderGiftEdit(btn.dataset.giftTab);
    });
  });

  addAll.addEventListener('click',()=>{
    list.querySelectorAll('.gift-product-add').forEach(btn=>{
      btn.classList.add('added');
      btn.textContent='✓';
    });
    const label = addAll.querySelector('.gift-add-all-label');
    label.textContent='Bundle added';
    setTimeout(()=>label.textContent='Add all to bag',1300);
  });

  renderGiftEdit(active);
})();
