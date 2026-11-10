/* PakSights: no framework and no external request required. */
(()=>{'use strict';
 const $=(s,root=document)=>root.querySelector(s), $$=(s,root=document)=>Array.from(root.querySelectorAll(s));
 const dialog=$('#search-dialog'),search=$('#global-search'),results=$('#global-search-results'),articles=window.PS_ARTICLES||[];
 const base=(()=>{let p=location.pathname;return /\/(guides|topics|tools)\//.test(p)?'../':''})();
 function searchResults(q){if(!results)return;const query=q.toLocaleLowerCase().trim();const found=query?articles.filter(a=>a.search.includes(query)).slice(0,9):articles.slice(0,6);
  results.replaceChildren();if(!found.length){let el=document.createElement('p');el.className='search-empty';el.textContent='No matches. Try a broader term such as passport, property or tax.';results.append(el);return;}
  for(const a of found){let link=document.createElement('a');link.className='search-hit';link.href=base+a.url;let meta=document.createElement('div'),title=document.createElement('strong'),small=document.createElement('span');title.textContent=a.title;small.textContent=a.category;meta.append(title,small);link.append(meta);link.insertAdjacentHTML('beforeend','<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>');results.append(link);}}
 function openSearch(){if(!dialog)return;dialog.showModal();search.value='';searchResults('');setTimeout(()=>search.focus(),0)}
 $$('.search-launch').forEach(b=>b.addEventListener('click',openSearch));
 $('.dialog-close')?.addEventListener('click',()=>dialog.close());
 dialog?.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});search?.addEventListener('input',e=>searchResults(e.target.value));
 document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch()}if(e.key==='/'&&!/input|textarea|select/i.test(document.activeElement?.tagName)){e.preventDefault();openSearch()}});
 const menu=$('.mobile-toggle'),mobile=$('#mobile-nav');menu?.addEventListener('click',()=>{let expanded=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!expanded));mobile?.classList.toggle('is-open',!expanded)});
 const localSearch=$('#guide-search'),filterButtons=$$('[data-filter]'),cards=$$('[data-guide-card]');let filter='all';
 function filterGuides(){if(!cards.length)return;let q=(localSearch?.value||'').toLocaleLowerCase().trim(),count=0;for(const card of cards){let ok=(filter==='all'||card.dataset.category===filter)&&(!q||card.dataset.search.includes(q));card.hidden=!ok;if(ok)count++}const cnt=$('#result-count'),empty=$('#guide-empty');if(cnt)cnt.textContent=`Showing ${count} of ${cards.length} guides`;if(empty)empty.hidden=count!==0}
 localSearch?.addEventListener('input',filterGuides);filterButtons.forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;filterButtons.forEach(x=>{x.classList.toggle('is-active',x===b);x.setAttribute('aria-pressed',String(x===b))});filterGuides()}));
 $('.article-print')?.addEventListener('click',()=>window.print());
 $('.article-copy')?.addEventListener('click',async e=>{const b=e.currentTarget;try{await navigator.clipboard.writeText(b.dataset.copy);b.title='Link copied';setTimeout(()=>{b.title='Copy link'},1800)}catch{window.prompt('Copy the guide link:',b.dataset.copy)}});
 const config=window.PS_CONFIG||{};if(config.contactEmail&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.contactEmail)){const p=$('#contact-enabled'),link=$('#contact-address');if(p&&link){p.hidden=false;const unavailable=$('#contact-unavailable');if(unavailable)unavailable.hidden=true;link.href='mailto:'+encodeURIComponent(config.contactEmail).replace('%40','@')+'?subject=PakSights%20guide%20correction';link.textContent=config.contactEmail;}}
})();
