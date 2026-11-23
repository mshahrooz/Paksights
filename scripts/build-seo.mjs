#!/usr/bin/env node
/**
 * Leonida Ledger SEO & news-feed build.
 * Run: node scripts/build-seo.mjs public
 *
 * Builds on every GitHub Pages deployment from the checked-in, sourced HTML.
 * Safe to re-run. Never changes article publication dates, invents dates,
 * or implies membership in a news platform.
 */
import fs from 'node:fs';
import path from 'node:path';

const cwd=process.cwd();
const root=path.resolve(process.argv[2]||'.');
const cfg=JSON.parse(fs.readFileSync(path.join(cwd,'scripts/seo-page-data.json'),'utf8'));
const DOMAIN=cfg.domain,NEWS_NAME=cfg.publication;
const orgId=DOMAIN+'/#publisher',webId=DOMAIN+'/#website';
const now=new Date();
const videoGame={'@type':'VideoGame','name':'Grand Theft Auto VI','url':'https://www.rockstargames.com/VI'};
const localFallback='/assets/original-gta6-fanart/hero-outlaws.webp';
const pictureChoices={
  neon:'/assets/original-gta6-fanart/vice-city-skyline.webp',
  coast:'/assets/original-gta6-fanart/leonida-coast.webp',
  chase:'/assets/original-gta6-fanart/neon-chase.webp',
  sunset:localFallback,
  night:'/assets/original-gta6-fanart/port-night.webp'
};
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
function dec(s){
 return String(s??'').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)))
 .replace(/&#x([a-f0-9]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16)))
 .replace(/&(amp|lt|gt|quot|apos|nbsp|rsquo|lsquo|mdash|ndash);/gi,(_,n)=>({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ',rsquo:'’',lsquo:'‘',mdash:'—',ndash:'–'}[n.toLowerCase()]));
}
function textOnly(raw){return dec(String(raw||'').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim();}
function attr(tag,key){
 const m=String(tag||'').match(new RegExp('\\b'+key+'\\s*=\\s*(?:"([^"]*)"|\\x27([^\\x27]*)\\x27)','i'));
 return dec(m?.[1]||m?.[2]||'');
}
function readTag(html,tagName,attrName,key){
 const all=[...html.matchAll(new RegExp('<'+tagName+'\\b[^>]*>','gi'))];
 return all.map(x=>x[0]).find(x=>attr(x,attrName).toLowerCase()===key.toLowerCase())||'';
}
function setMeta(h,name,val,kind='name'){
 const tag='<meta '+kind+'="'+esc(name)+'" content="'+esc(val)+'">';
 const found=readTag(h,'meta',kind,name);
 return found?h.replace(found,tag):h+tag;
}
function setLink(h,rel,href,extra=''){
 const token='<link rel="'+rel+'" href="'+esc(href)+'"'+extra+'>';
 const exists=[...h.matchAll(/<link\b[^>]*>/gi)].some(x=>attr(x[0],'rel')===rel&&attr(x[0],'href')===href);
 return exists?h:h+token;
}
function pathUrl(p){return DOMAIN+(p==='index.html'?'/':'/'+p)}
function isExcluded(p){return p==='404.html'||p==='articles/gta6-deep-sea-fishing-100-screenshots.html'}
function chooseImage(p,head){
 const original=attr(readTag(head,'meta','property','og:image'),'content');
 if(original.startsWith(DOMAIN+'/assets/')&&!original.includes('visual-fallback.svg'))return original;
 const hint=p.toLowerCase();
 const fallback=/coast|leonida|map|keys|world|cascara|fishing/.test(hint)?pictureChoices.coast:
   /glitch|patch|chase|fps|cheat|safe|kingpin/.test(hint)?pictureChoices.chase:
   /pc|night|noir|privacy/.test(hint)?pictureChoices.night:
   /character|ai-photo|trailer/.test(hint)?pictureChoices.neon:pictureChoices.sunset;
 return DOMAIN+fallback;
}
function parseJsonLd(h){
 const nodes=[];
 const re=/<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>/gi;
 const stripped=h.replace(re,block=>{
   try{
     const data=JSON.parse(block.slice(block.indexOf('>')+1,block.lastIndexOf('</script>')));
     for(const n of data['@graph']||[data]) if(n&&typeof n==='object')nodes.push(n);
   }catch(err){console.warn('Skipped unreadable JSON-LD');}
   return '';
 });
 return {stripped,nodes};
}
function isoDate(x){
 if(!x)return'';
 const d=new Date(x);
 return Number.isNaN(+d)?'':d.toISOString();
}
function dateLabel(x){return isoDate(x).slice(0,10)}
function findMeta(h,kind,key){return attr(readTag(h,'meta',kind,key),'content')}
function truncate(s,n=155){const x=textOnly(s);if(x.length<=n)return x;return x.slice(0,n-1).replace(/\s+\S*$/,'')+'…'}
function archiveLinks(html){
 return [...new Set([...html.matchAll(/href=["'](\/articles\/[^"'?#]+\.html)["']/gi)].map(x=>x[1]))].slice(0,35);
}
function makeBreadcrumb(p,name){
 const parts=p.split('/');
 let base=[{'@type':'ListItem',position:1,name:'Home',item:DOMAIN+'/'}];
 if(parts.length>1 && parts[1]!=='index.html'){
  const groups={news:'News',articles:'Articles',guides:'Guides',features:'Features',tools:'Player Tools',world:'Leonida World'};
  if(groups[parts[0]])base.push({'@type':'ListItem',position:2,name:groups[parts[0]],item:DOMAIN+'/'+parts[0]+'/index.html'});
 }
 base.push({'@type':'ListItem',position:base.length+1,name:name.split(' | ')[0],item:pathUrl(p)});
 return {'@type':'BreadcrumbList','@id':pathUrl(p)+'#breadcrumbs',itemListElement:base};
}
const organization={'@type':'Organization','@id':orgId,'name':'Leonida Ledger','alternateName':'PakSights GTA VI News','url':DOMAIN+'/','description':'Independent GTA VI news, commentary and source-checked guides published on PakSights.','logo':{'@type':'ImageObject','url':DOMAIN+'/assets/publisher-logo.svg','width':512,'height':512},'contactPoint':{'@type':'ContactPoint','contactType':'editorial corrections and news tips','url':DOMAIN+'/contact.html'}};
const website={'@type':'WebSite','@id':webId,'name':'Leonida Ledger','alternateName':'PakSights','url':DOMAIN+'/','publisher':{'@id':orgId},'inLanguage':'en'};

const records=[],allPaths=Object.keys(cfg.pages);
for(const p of allPaths){
 const file=path.join(root,p);
 if(!fs.existsSync(file)){console.warn('Not found:',p);continue;}
 const orig=fs.readFileSync(file,'utf8');
 const end=orig.search(/<\/head>/i);
 if(end<0){console.warn('Missing head:',p);continue;}
 let h=orig.slice(0,end),rest=orig.slice(end);
 const config=cfg.pages[p];
 const url=pathUrl(p), title=config.title,description=config.description, image=chooseImage(p,h);
 const ld=parseJsonLd(h);h=ld.stripped;
 const oldArticle=ld.nodes.find(n=>['NewsArticle','BlogPosting','Article'].includes(n['@type']));
 const dated=oldArticle||{};
 const pub=findMeta(h,'property','article:published_time')||dated.datePublished||'';
 const mod=findMeta(h,'property','article:modified_time')||dated.dateModified||pub;
 const publishDate=isoDate(pub),modifiedDate=isoDate(mod)||publishDate;
 const isArticle=p.startsWith('articles/')&&!isExcluded(p);
 const isArticleWithDate=isArticle&&!!publishDate;
 const isNews=isArticleWithDate&&config.category==='News';
 const isTool=p.startsWith('tools/')&&p!=='tools/index.html';
 const collection=/^(news|articles|guides|tools|features|world)\/index\.html$/.test(p);
 const excluded=isExcluded(p);
 h=h.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i,'<title>'+esc(title)+'</title>');
 h=setMeta(h,'description',description);
 h=setMeta(h,'keywords',config.keywords||'Grand Theft Auto VI, GTA 6');
 h=setMeta(h,'robots',excluded?'noindex,follow':'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1');
 h=setMeta(h,'theme-color','#ffffff');
 h=setMeta(h,'og:type',isArticle?'article':'website','property');
 h=setMeta(h,'og:site_name',NEWS_NAME,'property');
 h=setMeta(h,'og:locale','en_US','property');
 h=setMeta(h,'og:title',title.replace(/\s*\|\s*Leonida Ledger$/,'').replace(/\s*\|\s*Independent GTA VI News$/,''),'property');
 h=setMeta(h,'og:description',description,'property');
 h=setMeta(h,'og:url',url,'property');
 h=setMeta(h,'og:image',image,'property');
 h=setMeta(h,'og:image:alt','Independent GTA VI editorial imagery. See article credits for official images versus original AI fan art.','property');
 h=setMeta(h,'twitter:card','summary_large_image');
 h=setMeta(h,'twitter:title',title.replace(/\s*\|\s*Leonida Ledger$/,''));
 h=setMeta(h,'twitter:description',description);
 h=setMeta(h,'twitter:image',image);
 h=setMeta(h,'twitter:image:alt','GTA VI coverage by Leonida Ledger');
 h=setMeta(h,'author',isArticle?'Leonida Ledger Research Desk':'Leonida Ledger');
 if(isArticleWithDate){
   h=setMeta(h,'article:published_time',pub,'property');
   h=setMeta(h,'article:modified_time',mod,'property');
   h=setMeta(h,'article:section',config.category||'Features','property');
 }
 if(!excluded){
   const feeds=[
    ['application/rss+xml','GTA VI Latest News','/feed-news.xml'],
    ['application/atom+xml','Leonida Ledger Atom Feed','/atom.xml']
   ];
   for(const [type,label,href] of feeds){
    if(!h.includes('href="'+href+'"'))h+='<link rel="alternate" type="'+type+'" title="'+esc(label)+'" href="'+href+'">';
   }
   h=setLink(h,'manifest','/site.webmanifest');
 }
 const pageType=p==='about.html'?'AboutPage':p==='contact.html'?'ContactPage':collection?'CollectionPage':'WebPage';
 const graph=[];
 if(p==='index.html')graph.push(organization,website);
 const page={'@type':pageType,'@id':url+'#webpage','url':url,'name':title.split(' | ')[0],
  'description':description,'inLanguage':'en','isPartOf':{'@id':webId},
  'primaryImageOfPage':{'@type':'ImageObject','url':image}};
 if(isArticleWithDate)page['mainEntity']={'@id':url+'#article'};
 graph.push(page);
 if(p!=='index.html'&&!excluded)graph.push(makeBreadcrumb(p,title));
 if(collection){
  const refs=archiveLinks(orig);
  if(refs.length)graph.push({'@type':'ItemList','@id':url+'#list','itemListElement':refs.map((link,i)=>({'@type':'ListItem',position:i+1,url:DOMAIN+link}))});
 }
 if(isArticleWithDate){
  const article={'@type':isNews?'NewsArticle':'BlogPosting','@id':url+'#article','mainEntityOfPage':{'@id':url+'#webpage'},
   headline:oldArticle?.headline||title.split(' | ')[0],description,image:[image],
   datePublished:pub,dateModified:mod,inLanguage:'en',
   author:{'@type':'Organization','name':'Leonida Ledger Research Desk','url':DOMAIN+'/about.html'},
   publisher:{'@id':orgId},isAccessibleForFree:true,articleSection:config.category||'Features',
   keywords:config.keywords,about:videoGame};
  graph.push(article);
 }
 if(isTool){
  graph.push({'@type':'WebApplication','@id':url+'#application','name':title.split(' | ')[0],url,
   description,applicationCategory:'EntertainmentApplication',operatingSystem:'Any',publisher:{'@id':orgId},
   isAccessibleForFree:true,offers:{'@type':'Offer',price:'0',priceCurrency:'USD'}});
 }
 for(const old of ld.nodes){
  if(['FAQPage','VideoObject','ImageGallery'].includes(old['@type']))graph.push(old);
 }
 h+='<script type="application/ld+json">'+JSON.stringify({'@context':'https://schema.org','@graph':graph}).replace(/</g,'\\u003c')+'</script>';
 // Keep the exact Search Console ownership tag, body copy, dates and page design.
 let updated=h+rest;
 // Restore logical heading hierarchy while keeping visible headings/visual design.
 // The repeated footer labels are navigation captions, not sections of the story.
 const footerStart=updated.indexOf('<footer class="site-footer"');
 const footerEnd=footerStart>=0?updated.indexOf('</footer>',footerStart):-1;
 if(footerStart>=0&&footerEnd>footerStart){
  const oldFooter=updated.slice(footerStart,footerEnd);
  const footer=oldFooter.replace(/<h4>EXPLORE<\/h4>/g,'<p class="footer-col-caption">EXPLORE</p>')
   .replace(/<h4>THE PUBLICATION<\/h4>/g,'<p class="footer-col-caption">THE PUBLICATION</p>');
  updated=updated.slice(0,footerStart)+footer+updated.slice(footerEnd);
 }
 if(collection && updated.includes('<div id="story-grid" class="card-grid archive-grid">')){
  const names={'news/index.html':'Latest verified news','articles/index.html':'Browse all GTA VI articles',
   'guides/index.html':'Find a walkthrough','features/index.html':'Latest analysis','world/index.html':'Explore the world'};
  const name=names[p]||'Browse stories';
  updated=updated.replace('<div id="story-grid" class="card-grid archive-grid">',
   '<h2 class="archive-content-heading">'+esc(name)+'</h2><div id="story-grid" class="card-grid archive-grid">');
 }
 if(p==='articles/gta-vi-all-missions.html')
  updated=updated.replace(/(<div class="gta-mission-title">)<h4>([\s\S]*?)<\/h4>/g,'$1<h3>$2</h3>');
 fs.writeFileSync(file,updated);
 if(excluded)continue;
 records.push({path:p,url,title,description,keywords:config.keywords,category:config.category,
   published:publishDate,modified:modifiedDate,image,news:isNews,article:isArticleWithDate,
   original:orig});
}
const xmlDate=(s)=>s||'';
function xmlWrite(file,body){fs.writeFileSync(path.join(root,file),body+'\n');}
function lastmodMap(){
 const old=path.join(root,'sitemap.xml');
 const list=new Map();
 if(fs.existsSync(old)){
  const content=fs.readFileSync(old,'utf8');
  for(const m of content.matchAll(/<url>\s*<loc>(.*?)<\/loc>[\s\S]*?<lastmod>(.*?)<\/lastmod>[\s\S]*?<\/url>/gi))
    list.set(dec(m[1]),m[2]);
 }return list;
}
const lm=lastmodMap();
const ordered=records.slice().sort((a,b)=>a.url.localeCompare(b.url));
const imageLocal=r=>r.image.startsWith(DOMAIN+'/assets/')?r.image:'';
const urls=ordered.map(r=>{
 const last=r.modified?.slice(0,10)||lm.get(r.url)||'2026-11-21';
 const photo=imageLocal(r);
 return '<url><loc>'+esc(r.url)+'</loc><lastmod>'+esc(last)+'</lastmod>'+
  (photo?'<image:image><image:loc>'+esc(photo)+'</image:loc></image:image>':'')+'</url>';
}).join('\n');
xmlWrite('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'+urls+'\n</urlset>');

const fresh=records.filter(r=>r.news&&r.published&&Number.isFinite(Date.parse(r.published))&&
  (now-new Date(r.published))>=0&&(now-new Date(r.published))<=48*60*60*1000).sort((a,b)=>Date.parse(b.published)-Date.parse(a.published));
xmlWrite('sitemap-news.xml','<?xml version="1.0" encoding="UTF-8"?>\n'+
 '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n'+
 fresh.map(r=>'<url><loc>'+esc(r.url)+'</loc><news:news><news:publication><news:name>'+esc(NEWS_NAME)+'</news:name><news:language>en</news:language></news:publication><news:publication_date>'+esc(r.published)+'</news:publication_date><news:title>'+esc(r.title.split(' | ')[0])+'</news:title></news:news></url>').join('\n')+
 '\n</urlset>');

xmlWrite('sitemap-index.xml','<?xml version="1.0" encoding="UTF-8"?>\n'+
 '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+
 '<sitemap><loc>'+DOMAIN+'/sitemap.xml</loc></sitemap>\n'+
 '<sitemap><loc>'+DOMAIN+'/sitemap-news.xml</loc></sitemap>\n</sitemapindex>');

const ranked=records.filter(r=>r.article&&r.published).sort((a,b)=>Date.parse(b.published)-Date.parse(a.published));
function shortContent(r){
 const start=r.original.indexOf('class="article-content"');
 let inner=start>=0?r.original.slice(start):r.original.slice(r.original.indexOf('<main'));
 inner=inner.split(/class="article-end"|class="related-section"|id="sources"/)[0];
 const parts=[...inner.matchAll(/<(h2|h3|p)\b[^>]*>([\s\S]*?)<\/\1>/gi)].slice(0,150)
   .map(m=>({tag:m[1].toLowerCase(),text:textOnly(m[2])})).filter(z=>z.text.length>15);
 return parts.map(p=>'<'+p.tag+'>'+esc(p.text)+'</'+p.tag+'>').join('').slice(0,45000)||
   '<p>'+esc(r.description)+'</p>';
}
function rfc(x){const d=new Date(x);return Number.isNaN(+d)?now.toUTCString():d.toUTCString()}
function rss(records,file,title,summary){
 const channel='<title>'+esc(title)+'</title><link>'+DOMAIN+'/</link><description>'+esc(summary)+'</description>'+
 '<language>en-us</language><lastBuildDate>'+now.toUTCString()+'</lastBuildDate>'+
 '<atom:link href="'+DOMAIN+'/'+file+'" rel="self" type="application/rss+xml"/>'+
 '<copyright>'+esc('Copyright 2026 Leonida Ledger / PakSights')+'</copyright>';
 const entries=records.slice(0,50).map(r=>{
  const content=shortContent(r).replace(/\]\]>/g,']]&gt;');
  return '<item><title>'+esc(r.title.split(' | ')[0])+'</title><link>'+esc(r.url)+'</link>'+
   '<guid isPermaLink="true">'+esc(r.url)+'</guid><pubDate>'+rfc(r.published)+'</pubDate>'+
   '<dc:creator>'+esc('Leonida Ledger Research Desk')+'</dc:creator>'+
   '<category>'+esc(r.category||'Features')+'</category>'+
   '<category><![CDATA[AI-Assisted]]></category>'+ 
   '<description>'+esc(r.description)+'</description>'+
   '<content:encoded><![CDATA['+content+']]></content:encoded>'+
   (imageLocal(r)?'<media:content url="'+esc(r.image)+'" medium="image" />':'')+
   '</item>';
 });
 xmlWrite(file,'<?xml version="1.0" encoding="UTF-8"?>\n'+
  '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/" xmlns:content="http://purl.org/rss/1.0/modules/content/">'+
  '<channel>'+channel+entries.join('')+'</channel></rss>');
}
rss(ranked,'feed.xml','Leonida Ledger - GTA VI Articles','Independent, source-checked GTA VI news, features, guides and player updates.');
rss(ranked.filter(r=>r.news),'feed-news.xml','Leonida Ledger - GTA VI Breaking News','Latest GTA VI news reports, dated updates and original editorial coverage.');

const atomEntries=ranked.slice(0,50).map(r=>'<entry><id>'+esc(r.url)+'</id><title>'+esc(r.title.split(' | ')[0])+'</title>'+
 '<link href="'+esc(r.url)+'"/><published>'+esc(r.published)+'</published>'+
 '<updated>'+esc(r.modified||r.published)+'</updated>'+
 '<author><name>Leonida Ledger Research Desk</name></author><category term="AI-Assisted"/><summary>'+esc(r.description)+'</summary>'+
 '<content type="html">'+esc(shortContent(r))+'</content></entry>').join('\n');
xmlWrite('atom.xml','<?xml version="1.0" encoding="UTF-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom">'+
 '<id>'+DOMAIN+'/</id><title>Leonida Ledger - GTA VI</title><subtitle>Independent GTA VI news and guides</subtitle>'+
 '<link href="'+DOMAIN+'/atom.xml" rel="self"/><link href="'+DOMAIN+'/"/>'+
 '<updated>'+now.toISOString()+'</updated>'+atomEntries+'</feed>');

const jf={'version':'https://jsonfeed.org/version/1.1','title':'Leonida Ledger - GTA VI Articles',
 'home_page_url':DOMAIN+'/','feed_url':DOMAIN+'/feed.json','description':'Independent GTA VI news, reviews, and guides',
 'items':ranked.slice(0,50).map(r=>({id:r.url,url:r.url,title:r.title.split(' | ')[0],
   summary:r.description,content_html:shortContent(r),image:r.image,tags:[r.category||'Features','AI-Assisted'],date_published:r.published,
   date_modified:r.modified||r.published,authors:[{name:'Leonida Ledger Research Desk',url:DOMAIN+'/about.html'}]}))};
fs.writeFileSync(path.join(root,'feed.json'),JSON.stringify(jf,null,2)+'\n');
fs.writeFileSync(path.join(root,'robots.txt'),
 'User-agent: *\nAllow: /\n\nSitemap: '+DOMAIN+'/sitemap-index.xml\nSitemap: '+DOMAIN+'/sitemap.xml\nSitemap: '+DOMAIN+'/sitemap-news.xml\n');
fs.writeFileSync(path.join(root,'site.webmanifest'),JSON.stringify({
 name:'Leonida Ledger - GTA VI News & Guides',short_name:'Leonida Ledger',
 description:'Independent GTA VI news and free player tools',
 id:'/',start_url:'/',scope:'/',display:'browser',background_color:'#ffffff',theme_color:'#ffffff',
 icons:[{src:'/assets/publisher-logo.svg',sizes:'any',type:'image/svg+xml',purpose:'any'}]
},null,2)+'\n');

const issues=[];
for(const r of records){
 if(r.title.length>70)issues.push(r.path+': long title');
 if(r.description.length>165)issues.push(r.path+': long description');
 if(!r.url.startsWith(DOMAIN))issues.push(r.path+': broken canonical');
}
console.log(JSON.stringify({pageCount:records.length,articleCount:ranked.length,newsSitemapEntries:fresh.length,
 totalFeeds:{all:ranked.length,news:ranked.filter(r=>r.news).length},
 generated:['sitemap.xml','sitemap-news.xml','sitemap-index.xml','feed.xml','feed-news.xml','atom.xml','feed.json','robots.txt','site.webmanifest'],
 warnings:issues},null,2));
if(issues.length)process.exitCode=1;
