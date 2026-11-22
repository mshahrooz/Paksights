(()=>{'use strict';document.querySelectorAll('.desktop-nav,.mobile-nav').forEach(nav=>{if(!nav.querySelector('a[href="/tools/index.html"]')){const link=document.createElement('a');link.href='/tools/index.html';link.textContent='Player Tools';nav.appendChild(link)}});document.querySelectorAll('.footer-links').forEach(group=>{if(group.querySelector('h4')?.textContent?.trim()==='EXPLORE'&&!group.querySelector('a[href="/tools/index.html"]')){const link=document.createElement('a');link.href='/tools/index.html';link.textContent='Player tools';group.appendChild(link)}});const menu=document.querySelector('.menu-toggle'),nav=document.getElementById('mobile-menu');if(menu&&nav){menu.addEventListener('click',()=>{const next=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(next));nav.hidden=!next});}document.querySelectorAll('[data-share]').forEach(btn=>btn.addEventListener('click',async()=>{const url=btn.getAttribute('data-share');try{await navigator.clipboard.writeText(url);const old=btn.textContent;btn.textContent='LINK COPIED ✓';setTimeout(()=>btn.textContent=old,1800)}catch(e){window.prompt('Copy article link:',url)}}));const search=document.getElementById('story-search'),grid=document.getElementById('story-grid'),empty=document.getElementById('empty-search');if(search&&grid){const filter=()=>{const q=search.value.toLowerCase().trim();let shown=0;[...grid.querySelectorAll('.story-card')].forEach(card=>{const hit=card.textContent.toLowerCase().includes(q);card.hidden=!hit;if(hit)shown++});if(empty)empty.hidden=shown>0};search.addEventListener('input',filter);const q=new URLSearchParams(location.search).get('q');if(q){search.value=q;filter();search.focus()}}const bar=document.querySelector('.reading-progress');if(bar){let pending=false;const update=()=>{const max=document.documentElement.scrollHeight-innerHeight;bar.style.width=(max>0?Math.min(100,scrollY/max*100):0)+'%';pending=false};addEventListener('scroll',()=>{if(!pending){requestAnimationFrame(update);pending=true}},{passive:true});update()}})();

/* Rockstar Games official GTA VI editorial imagery: hero + contextual galleries.
   Each asset is named exactly as supplied by Rockstar's public VI media collection.
   No AI recreation, guessed game location, or unauthorized third-party image host. */
(()=>{'use strict';
const ROOT='https://www.rockstargames.com/VI/_next/static/media/';
const ASSETS={
  motel:['Jason_and_Lucia_Motel_landscape.08edvuwtm-20v.jpg','Official GTA VI illustrated artwork of Jason and Lucia together'],
  together:['Jason_and_Lucia_03_landscape.0419q._86ukpt.jpg','Official GTA VI promotional artwork featuring Jason and Lucia'],
  cover:['Official_Cover_Art_landscape.12.uu2irr.2_a.jpg','Official Grand Theft Auto VI cover artwork'],
  jason:['Jason_Duval_01.07m377xeb6jhq.jpg','Rockstar GTA VI screenshot of Jason alongside a motorcycle'],
  jasoncar:['Jason_Duval_02.1486~7_v40cn..jpg','Rockstar GTA VI screenshot of Jason inside a vehicle'],
  lucia:['Lucia_Caminos_01.0a7yqvewctkfp.jpg','Rockstar GTA VI screenshot of Lucia training at a boxing gym'],
  lucianight:['Lucia_Caminos_03.14xgd2y_ymmeg.jpg','Rockstar GTA VI screenshot of Lucia outside a neon-lit bar'],
  vicesign:['Vice_City_01.135x56yoeu.6t.jpg','Rockstar GTA VI screenshot showing the illuminated Vice City sign'],
  city:['Vice_City_04.06evqutgh7624.jpg','Official GTA VI panoramic image of Vice City'],
  citycoast:['Vice_City_02.0c5.7qx17u9kl.jpg','Official GTA VI image of the Vice City coastal skyline'],
  citynight:['Vice_City_06.0_tdmr3u9w84x.jpg','Official GTA VI screenshot of neon nightlife and police in Vice City'],
  citystreets:['Vice_City_09.0~ng.c8ack3fp.jpg','Official GTA VI screenshot of vibrant street art and traffic in Vice City'],
  cityday:['Vice_City_08.0bbg_xp4hqdvz.jpg','Official Grand Theft Auto VI image of the Vice City environment'],
  keys:['Leonida_Keys_01.0zgz7tveur6y8.jpg','Official GTA VI aerial image of the Leonida Keys coastline'],
  coral:['Leonida_Keys_04.0hce1rw1s8pd9.jpg','Official GTA VI underwater scene with divers and a sea turtle in the Leonida Keys'],
  port:['Port_Gellhorn_01.0fmisvza-5-cq.jpg','Official GTA VI image of the Starlet Motel in Port Gellhorn'],
  portnight:['Port_Gellhorn_04.0hd-7kzfi51q..jpg','Official GTA VI screenshot of neon night streets in Port Gellhorn'],
  portstory:['Port_Gellhorn_03.00c2b0eh7sm~q.jpg','Official GTA VI scene of two characters in Port Gellhorn'],
  grass:['Grassrivers_03.14cuv-vg9orw4.jpg','Official GTA VI screenshot of an airboat in the Grassrivers wetlands'],
  grasscoast:['Grassrivers_02.0teqs5xe2pem1.jpg','Official GTA VI screenshot of waterfront buildings in Grassrivers'],
  mountain:['Mount_Kalaga_National_Park_02.0f24dhopdprvx.jpg','Official GTA VI screenshot of a helicopter above the Mount Kalaga hills'],
  motocross:['Mount_Kalaga_National_Park_01.0v5fl0f83hjv_.jpg','Official GTA VI screenshot of motocross riders in Mount Kalaga National Park'],
  ambrosia:['Ambrosia_01.0rqphs0gazkm..jpg','Official GTA VI screenshot showing motorcycle riders in Ambrosia'],
  ambrosianight:['Ambrosia_02.0wtqs05ozl.ym.jpg','Official GTA VI screenshot of the Ambrosia industrial skyline at night']
};
const THEMES={
  'index.html':['together','citynight','keys','citystreets'],
  'articles/index.html':['citystreets','together','mountain','keys'],
  'news/index.html':['citynight','together','vicesign','lucianight'],
  'guides/index.html':['jason','port','keys','citynight'],
  'world/index.html':['keys','coral','grass','mountain'],
  'features/index.html':['citystreets','citynight','lucia','motocross'],
  'tools/index.html':['citynight','keys','portnight','jason'],
  'tools/leonida-map.html':['keys','grass','mountain','city'],
  'tools/safe-codes.html':['portnight','port','portstory','lucianight'],
  'tools/mission-tracker.html':['lucianight','jason','citystreets','motocross'],
  'tools/cheat-codes.html':['motocross','jason','citynight','lucia'],
  'guides/kingpin-bowling-safe-code.html':['portnight','port','citystreets','portstory'],
  'guides/brooks-boatworks-safe-code.html':['port','portstory','portnight','jason'],
  'guides/la-cascara-motel-safe-code.html':['portstory','port','portnight','citynight'],
  'articles/gta-6-prologue-mission-1-walkthrough.html':['lucia','together','citynight','vicesign'],
  'articles/gta-vi-all-missions.html':['together','citynight','keys','portstory'],
  'articles/gta-6-out-now-release-date.html':['citynight','together','citystreets','cover'],
  'articles/gta-6-pc-release-status.html':['jasoncar','citycoast','citystreets','mountain'],
  'articles/gta-6-price-editions-standard-ultimate.html':['cover','motel','jason','citynight'],
  'articles/gta-6-leonida-map-locations.html':['keys','coral','grass','mountain'],
  'articles/gta-6-jason-lucia-characters.html':['together','jason','lucia','motel'],
  'articles/gta-6-trailers-watch-order.html':['vicesign','citynight','citystreets','together'],
  'articles/gta-6-gameplay-confirmed-features.html':['motocross','citystreets','coral','grass'],
  'articles/gta-6-beginner-settings-guide.html':['jason','lucia','mountain','city'],
  'articles/gta-6-install-code-in-box-guide.html':['port','cover','jasoncar','citystreets'],
  'articles/gta-6-faq-release-pc-price-map.html':['city','keys','citynight','motel'],
  'articles/gta-6-rumors-fact-check.html':['grass','vicesign','citystreets','portnight'],
  'articles/gta-6-first-day-sales-record.html':['together','citynight','lucianight','vicesign'],
  'articles/gta-6-accessibility-settings.html':['lucia','coral','mountain','keys'],
  'about.html':['motel','citynight','jason','lucia'],
  'editorial-policy.html':['citystreets','jasoncar','vicesign','citynight'],
  'privacy.html':['citycoast','keys','port','grass'],
  'contact.html':['lucianight','citynight','citystreets','vicesign'],
  'media-credits.html':['city','coral','motocross','lucia'],
  '404.html':['vicesign','citynight','port','jason']
};
const raw=decodeURI(location.pathname).replace(/^\/+/,'');
const path=raw===''?'index.html':(raw.endsWith('/')?raw+'index.html':raw);
// This one editorial report uses its own original AI-generated illustrations.
if(path==='articles/gta-6-news-today-november-22-2026.html')return;
const images=THEMES[path]||['city','keys','citynight','together'];
const makeSrc=(key,width)=>ROOT+ASSETS[key][0]+'?akim=1&imwidth='+width;
const makeImg=(key,critical=false)=>{if(!ASSETS[key])key='city';const img=document.createElement('img');img.src=makeSrc(key,critical?1920:1200);img.srcset=[640,960,1200,1920].map(n=>makeSrc(key,n)+' '+n+'w').join(', ');img.sizes=critical?'100vw':'(max-width:700px) 100vw, 720px';img.alt=ASSETS[key][1];img.width=1600;img.height=900;img.loading=critical?'eager':'lazy';img.decoding='async';if(critical)img.setAttribute('fetchpriority','high');img.addEventListener('error',()=>{if(img.dataset.fallback)return;img.dataset.fallback='1';img.removeAttribute('srcset');img.removeAttribute('sizes');img.src='/assets/visual-fallback.svg'});return img};
const credit=()=>{const link=document.createElement('a');link.href='https://www.rockstargames.com/VI/media/screenshots';link.target='_blank';link.rel='noopener noreferrer';link.textContent='OFFICIAL GTA VI IMAGE © ROCKSTAR GAMES ↗';return link};
function makeHero(node,key){if(!node||node.querySelector('.gta-hero-media'))return;node.classList.add('gta-with-hero');const figure=document.createElement('div');figure.className='gta-hero-media';figure.setAttribute('aria-hidden','true');const img=makeImg(key,true);img.alt='';figure.append(img);const cap=document.createElement('span');cap.className='gta-hero-credit';cap.textContent='OFFICIAL GTA VI IMAGE © ROCKSTAR GAMES';figure.append(cap);node.insertBefore(figure,node.firstChild)}
const hero=document.querySelector('.masthead, .archive-head, .pt-hero, .simple-hero, .error-box, .article-header');
makeHero(hero,images[0]);
function makeGallery(keys,compact=false){const fig=document.createElement('figure');fig.className='gta-imagery-gallery'+(compact?' gta-imagery-gallery--compact':'');const row=document.createElement('div');row.className='gta-imagery-gallery-grid';keys.forEach(k=>{const frame=document.createElement('div');frame.className='gta-imagery-frame';frame.append(makeImg(k));row.append(frame)});const cap=document.createElement('figcaption');cap.append('OFFICIAL GRAND THEFT AUTO VI MEDIA · ',credit());fig.append(row,cap);return fig}
const articleContent=document.querySelector('.article-content');
if(articleContent&&!articleContent.querySelector('.gta-imagery-gallery')){const sections=[...articleContent.querySelectorAll(':scope > section')];if(sections.length){sections[Math.min(1,sections.length-1)].after(makeGallery([images[1],images[2]],false));if(sections.length>=5)sections[sections.length-2].after(makeGallery([images[3]],true))}}
const archive=document.querySelector('.archive-head');
if(archive&&archive.nextElementSibling&&!document.querySelector('.gta-archive-visuals')){const gallery=makeGallery([images[1],images[2],images[3]],true);gallery.classList.add('gta-archive-visuals','container');archive.insertAdjacentElement('afterend',gallery)}
const simpleMain=document.querySelector('.simple-main');
if(simpleMain&&!simpleMain.querySelector('.gta-imagery-gallery')){const gallery=makeGallery([images[1],images[2]],false);const children=[...simpleMain.children];(children.find(x=>x.tagName==='H2')||children[0])?.insertAdjacentElement('afterend',gallery)}
const toolMain=document.querySelector('.pt-main');
if(toolMain&&!toolMain.querySelector('.gta-imagery-gallery')){const gallery=makeGallery([images[1],images[2],images[3]],false);gallery.classList.add('gta-tool-gallery');const section=toolMain.querySelector('.pt-section');const disclaimer=toolMain.querySelector('.pt-disclosure');if(section)section.insertAdjacentElement('afterend',gallery);else if(disclaimer)disclaimer.insertAdjacentElement('beforebegin',gallery);else toolMain.append(gallery)}
const guideMain=document.querySelector('.pt-article-main');
if(guideMain&&!guideMain.querySelector('.gta-imagery-gallery')){const gallery=makeGallery([images[1],images[2]],false);const feature=guideMain.querySelector('.pt-code-feature');if(feature)feature.insertAdjacentElement('afterend',gallery);else guideMain.append(gallery)}
document.querySelectorAll('.pt-tile').forEach((tile,i)=>{if(tile.querySelector('.gta-tool-tile-photo'))return;const image=makeImg(['keys','portnight','lucianight','motocross'][i%4]);image.classList.add('gta-tool-tile-photo');const before=tile.querySelector('h2');if(before)before.insertAdjacentElement('beforebegin',image)});
document.querySelectorAll('[data-region].pt-card').forEach(card=>{if(card.querySelector('.gta-card-photo'))return;const assoc={vice:'citystreets',keys:'keys',grass:'grass',port:'port',ambrosia:'ambrosia',kalaga:'mountain'};const image=makeImg(assoc[card.dataset.region]||'city');image.classList.add('gta-card-photo');const head=card.querySelector('.pt-card-top');if(head)head.insertAdjacentElement('afterend',image)});
document.querySelectorAll('.pt-safe.pt-card').forEach(card=>{if(card.querySelector('.gta-card-photo'))return;const query=card.dataset.search||'';const key=query.includes('Port Gellhorn')?'portnight':query.includes('Keys')?'keys':'citystreets';const image=makeImg(key);image.classList.add('gta-card-photo');const head=card.querySelector('.pt-card-top');if(head)head.insertAdjacentElement('afterend',image)});
/* Maintain the original video and card imagery; update only first-party image semantics. */
})();

/* GTA VI fan counter: transparent illustrative model, not a live API feed.
   Source anchors (Nov 19 2026): Take-Two retail sales $3.79B and
   Sensor Tower estimated ~24.6M digital copies sold.
   Post-launch rate: explicitly hypothetical 150k digital copies/day x $96.
   This is NOT a count of completed downloads, publisher net receipts or profit. */
(() => {
  'use strict';
  const ID = 'gta-vi-sales-counter';
  if (!document.body || document.getElementById(ID)) return;
  const BASE_UTC = Date.UTC(2026, 10, 19, 23, 59, 59);
  const BASE_DIGITAL_COPIES = 24600000;
  const BASE_RETAIL_USD = 3790000000;
  const MODEL_COPIES_PER_DAY = 150000; // Illustrative, not measured.
  const MODEL_PRICE_USD = 96; // Rounded from Sensor Tower's $2.36B / 24.6M estimate.
  const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
  const root = document.createElement('aside');
  root.id = ID;
  root.className = 'gc-widget';
  root.setAttribute('aria-label', 'GTA VI illustrative downloads and sales tracker');
  root.innerHTML = [
    '<div class="gc-panel">',
      '<div class="gc-top">',
        '<div class="gc-mark" aria-hidden="true"><span>VI</span><i>✦</i></div>',
        '<div class="gc-heading"><strong>GTA VI <em>SALES PULSE</em></strong>',
          '<small><span class="gc-pulse" aria-hidden="true"></span> LIVE-ANIMATED FAN ESTIMATE</small>',
        '</div>',
        '<button class="gc-close" type="button" aria-label="Minimize GTA VI counter" title="Minimize counter">×</button>',
      '</div>',
      '<div class="gc-metrics">',
        '<div class="gc-metric">',
          '<span>EST. DIGITAL COPIES <span class="gc-star">*</span></span>',
          '<strong class="gc-dl" aria-label="Modeled digital copies sold">24,600,000</strong>',
          '<small>Download-sales proxy, not verified installs</small>',
        '</div>',
        '<div class="gc-metric">',
          '<span>PROJECTED GROSS SALES <span class="gc-star">*</span></span>',
          '<strong class="gc-rev" aria-label="Projected gross retail revenue">$3,790,000,000</strong>',
          '<small>Retail value in USD · not profit</small>',
        '</div>',
      '</div>',
      '<div class="gc-bottom">',
        '<span>Illustrative model · not Rockstar live data</span>',
        '<button type="button" class="gc-method-toggle" aria-expanded="false" aria-controls="gc-method">How calculated <span aria-hidden="true">⌄</span></button>',
      '</div>',
      '<div id="gc-method" class="gc-method" hidden>',
        '<p><b>Reference points (Nov 19, 2026):</b> Take-Two reported $3.79 billion in estimated day-one <em>retail sales</em>. Sensor Tower separately estimated about 24.6 million <em>digital copies sold</em> (including preorders), not confirmed file downloads.</p>',
        '<p><b>Animation method:</b> adds an <em>assumed</em> 150,000 digital purchases per day after Nov 19 and $96 gross retail value per additional copy. These are illustrative assumptions, not an observed sales rate. The model continues with time and may diverge from reality. It is not an official revenue, profit, download or player count.</p>',
        '<p><a href="https://www.take2games.com/ir/news/grand-theft-auto-vi-shatters-entertainment-box-office-records" target="_blank" rel="noopener noreferrer">Take-Two sales statement ↗</a><a href="https://apnews.com/article/15c69f76548ab5659bc3fe44a69756d8" target="_blank" rel="noopener noreferrer">AP / Sensor Tower estimate ↗</a></p>',
        '<p class="gc-stamp">Model established Nov 22, 2026 · Leonida Ledger, independent fan publication.</p>',
      '</div>',
    '</div>',
    '<button class="gc-minimized" type="button" aria-label="Show GTA VI sales counter" hidden><span class="gc-pulse" aria-hidden="true"></span> GTA VI <b>SALES PULSE</b> <span aria-hidden="true">↗</span></button>'
  ].join('');
  document.body.appendChild(root);
  const panel = root.querySelector('.gc-panel');
  const minimized = root.querySelector('.gc-minimized');
  const minimizeButton = root.querySelector('.gc-close');
  const toggleButton = root.querySelector('.gc-method-toggle');
  const details = root.querySelector('.gc-method');
  const digitalEl = root.querySelector('.gc-dl');
  const grossEl = root.querySelector('.gc-rev');
  const STATE_KEY = 'leonida-sales-counter-minimized-v1';
  function setMinimized(yes) {
    panel.hidden = yes;
    minimized.hidden = !yes;
    try { localStorage.setItem(STATE_KEY, yes ? '1' : '0'); } catch (_) {}
  }
  minimizeButton.addEventListener('click', () => setMinimized(true));
  minimized.addEventListener('click', () => setMinimized(false));
  toggleButton.addEventListener('click', () => {
    const showing = details.hidden;
    details.hidden = !showing;
    toggleButton.setAttribute('aria-expanded', String(showing));
  });
  try { if (localStorage.getItem(STATE_KEY) === '1') setMinimized(true); } catch (_) {}
  function render() {
    if (panel.hidden || document.hidden) return;
    const daysSince = Math.max(0, (Date.now() - BASE_UTC) / 86400000);
    const modeledDigital = Math.floor(BASE_DIGITAL_COPIES + daysSince * MODEL_COPIES_PER_DAY);
    const modeledRetail = Math.floor(BASE_RETAIL_USD + (modeledDigital - BASE_DIGITAL_COPIES) * MODEL_PRICE_USD);
    digitalEl.textContent = formatter.format(modeledDigital);
    grossEl.textContent = '$' + formatter.format(modeledRetail);
  }
  render();
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  setInterval(render, reduced ? 15000 : 750);
  document.addEventListener('visibilitychange', render, { passive: true });
})();
