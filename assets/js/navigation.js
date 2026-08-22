/* ============================================================
   v10.0 — Header / Navigation experience
   ============================================================ */
const siteHeader=document.getElementById('siteHeader');
const megaNavigation=document.getElementById('megaNavigation');
const megaTriggers=[...document.querySelectorAll('.nav-trigger')];
const megaPanels=[...document.querySelectorAll('[data-mega-panel]')];
const navBackdrop=document.getElementById('navBackdrop');
const searchTrigger=document.querySelector('.search-trigger');
const searchPlane=document.getElementById('searchPlane');
const searchClose=document.querySelector('.search-close');
const searchInput=document.getElementById('siteSearch');
const mobileMenu=document.getElementById('mobileMenu');
const mobileMenuTrigger=document.querySelector('.mobile-menu-trigger');
const mobileMenuClose=document.querySelector('.mobile-menu-close');

function setBackdrop(open){
  if(!navBackdrop)return;
  navBackdrop.hidden=!open;
}

function closeMega(){
  megaTriggers.forEach(btn=>btn.setAttribute('aria-expanded','false'));
  megaPanels.forEach(panel=>panel.hidden=true);
  if(megaNavigation)megaNavigation.hidden=true;
  setBackdrop(false);
}

function closeSearch(){
  if(searchPlane)searchPlane.hidden=true;
  if(searchTrigger)searchTrigger.setAttribute('aria-expanded','false');
  setBackdrop(false);
}

function openMega(name,trigger){
  closeSearch();
  const panel=megaPanels.find(item=>item.dataset.megaPanel===name);
  if(!panel || !megaNavigation)return;

  const alreadyOpen=!megaNavigation.hidden && !panel.hidden;
  closeMega();
  if(alreadyOpen)return;

  megaNavigation.hidden=false;
  panel.hidden=false;
  trigger?.setAttribute('aria-expanded','true');
  setBackdrop(true);
}

megaTriggers.forEach(trigger=>{
  trigger.addEventListener('click',()=>openMega(trigger.dataset.mega,trigger));
});

searchTrigger?.addEventListener('click',()=>{
  const opening=searchPlane?.hidden ?? true;
  closeMega();
  if(!searchPlane)return;
  searchPlane.hidden=!opening;
  searchTrigger.setAttribute('aria-expanded',opening?'true':'false');
  setBackdrop(opening);
  if(opening)window.setTimeout(()=>searchInput?.focus(),40);
});

searchClose?.addEventListener('click',closeSearch);
navBackdrop?.addEventListener('click',()=>{
  closeMega();
  closeSearch();
});

function openMobileMenu(){
  if(!mobileMenu)return;
  mobileMenu.hidden=false;
  mobileMenuTrigger?.setAttribute('aria-expanded','true');
  document.body.classList.add('nav-lock');
}
function closeMobileMenu(){
  if(!mobileMenu)return;
  mobileMenu.hidden=true;
  mobileMenuTrigger?.setAttribute('aria-expanded','false');
  document.body.classList.remove('nav-lock');
}
mobileMenuTrigger?.addEventListener('click',openMobileMenu);
mobileMenuClose?.addEventListener('click',closeMobileMenu);

document.addEventListener('keydown',event=>{
  if(event.key!=='Escape')return;
  closeMega();
  closeSearch();
  closeMobileMenu();
});

window.addEventListener('resize',()=>{
  if(window.innerWidth<=760){
    closeMega();
    closeSearch();
  }else{
    closeMobileMenu();
  }
});
