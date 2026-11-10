#!/usr/bin/env python3
"""Rebuild the PakSights static site with a straightforward newspaper/blog visual layer.
Run: python editorial_rebuild.py
Requires: Python 3, beautifulsoup4. The existing build.py retains the original article research/data.
"""
import json, re, shutil, subprocess, sys
from pathlib import Path
from html import escape
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parent
subprocess.run([sys.executable, str(ROOT/'build.py')], cwd=ROOT, check=True)
A=json.loads((ROOT/'content/articles.json').read_text())
C=json.loads((ROOT/'content/categories.json').read_text())
article_by_title={a['title']:a for a in A}
article_by_slug={a['slug']:a for a in A}
# Free-to-use, real photographs from Unsplash (no staged identity or official document images).
# These are illustrative photographs, not depictions of the government services.
PHOTO={
 'travel':'photo-1488646953014-85cb44e25828',
 'documents':'photo-1554224155-6726b3ff858f',
 'property':'photo-1560518883-ce09059eeffa',
 'assistance':'photo-1521791136064-7986c2920216',
 'computer':'photo-1516321318423-f06f85e504b3',
 'buildings':'photo-1486406146926-c627a92ad1ab',
 'consultation':'photo-1551836022-d5d88e9218df',
 'analysis':'photo-1460925895917-afdab827c52f',
 'workspace':'photo-1497366811353-6870744d04b2',
 'payments':'photo-1556742049-0cfed4f6a45d',
}
IMAGE_KEYS={
 'renew-nicop-from-abroad':'travel',
 'nicop-vs-poc':'documents',
 'renew-pakistani-passport-online':'travel',
 'lost-identity-documents-abroad':'documents',
 'dual-nationality-pakistan':'travel',
 'online-power-of-attorney-pakistan':'assistance',
 'apostille-vs-attestation-pakistan':'documents',
 'find-pakistani-embassy-abroad':'buildings',
 'open-roshan-digital-account':'computer',
 'send-money-to-pakistan-safely':'payments',
 'complain-about-pakistan-bank-from-abroad':'consultation',
 'pakistan-tax-residency-overseas':'analysis',
 'overseas-pakistani-property-tax-filer-rate':'documents',
 'buying-property-in-pakistan-from-abroad':'property',
 'verify-land-record-punjab':'property',
 'verify-property-record-sindh':'buildings',
 'property-dispute-overseas-pakistani':'assistance',
 'child-born-abroad-pakistani-documents':'consultation',
 'nadra-frc-from-abroad':'documents',
 'succession-certificate-inheritance-abroad':'property',
 'hec-degree-attestation-overseas':'workspace',
 'ibcc-equivalence-foreign-school':'computer',
 'complain-to-opf-from-abroad':'assistance',
 'overseas-job-scam-warning':'consultation',
 'moving-back-to-pakistan-checklist':'travel'
}
ALT={
 'travel':'Travel planning materials on a map',
 'documents':'Paperwork and a calculator on a table',
 'property':'House keys beside a model home',
 'assistance':'People shaking hands during a meeting',
 'computer':'People working together at a laptop',
 'buildings':'Tall commercial buildings in a city',
 'consultation':'Two colleagues talking at a laptop',
 'analysis':'Financial information displayed on a laptop',
 'workspace':'Modern meeting room with a table',
 'payments':'Customer making a digital payment at a counter',
}

def img_src(a,width=900):
    key=IMAGE_KEYS.get(a['slug'],a['category'])
    return f'https://images.unsplash.com/{PHOTO[key]}?auto=format&fit=crop&w={width}&q=78'

def img_tag(a,width=900,eager=False):
    k=IMAGE_KEYS.get(a['slug'],a['category'])
    return f'<img src="{img_src(a,width)}" alt="{escape(ALT[k])}" loading="{"eager" if eager else "lazy"}" decoding="async" width="{width}" height="{round(width*.65)}" referrerpolicy="no-referrer" {"fetchpriority=\"high\"" if eager else ""}>'

def link(a,prefix=''):
    return f'{prefix}guides/{a["slug"]}.html'

def topic_label(a):return escape(C[a['category']]['name'])

def meta(a):return f'<span class="story-cat">{topic_label(a)}</span><span class="story-sep">·</span><span>{escape(a["reviewed"])}</span>'

def story_card(a, cls='', prefix='', pic=True):
    h=escape(a['title']);u=link(a,prefix)
    return f'''<article class="news-card {cls}">{f'<a href="{u}" class="news-image">{img_tag(a,740)}</a>' if pic else ''}
    <div class="news-copy"><div class="news-meta">{meta(a)}</div><h3><a href="{u}">{h}</a></h3>
    <p>{escape(a['deck'])}</p></div></article>'''

def mini_card(a):
    return f'''<article class="news-mini"><a class="mini-photo" href="{link(a)}">{img_tag(a,360)}</a>
    <div><div class="news-meta"><span class="story-cat">{topic_label(a)}</span></div><h3><a href="{link(a)}">{escape(a['title'])}</a></h3>
    <span class="mini-date">Reviewed {escape(a['reviewed'])}</span></div></article>'''

def titlebar(title,kicker='',more='',url='guides/index.html'):
    return f'''<div class="news-heading"><div><span class="news-kicker">{escape(kicker)}</span><h2>{escape(title)}</h2></div>{f'<a href="{url}" class="view-all">{escape(more)} <span aria-hidden="true">→</span></a>' if more else ''}</div>'''

def homepage():
    lead=article_by_slug['renew-nicop-from-abroad']
    sidenames=['buying-property-in-pakistan-from-abroad','send-money-to-pakistan-safely','open-roshan-digital-account']
    sided=[article_by_slug[x] for x in sidenames]
    latest=[a for a in A if a['slug'] not in {lead['slug'],*[x['slug'] for x in sided]}]
    picks=[article_by_slug[x] for x in ['overseas-pakistani-property-tax-filer-rate','child-born-abroad-pakistani-documents','apostille-vs-attestation-pakistan','online-power-of-attorney-pakistan','renew-pakistani-passport-online','complain-to-opf-from-abroad']]
    topics=''.join(f'<a href="topics/{cid}.html">{escape(v["name"])} <small>({sum(a["category"]==cid for a in A)})</small></a>' for cid,v in C.items())
    official=''.join(f'<li><a target="_blank" rel="noopener noreferrer" href="{u}">{t}<span aria-hidden="true">↗</span></a></li>' for t,u in [
      ('NADRA','https://www.nadra.gov.pk/'),('Pakistan passport services','https://dgip.gov.pk/'),('State Bank of Pakistan','https://www.sbp.org.pk/'),('Federal Board of Revenue','https://www.fbr.gov.pk/'),('Ministry of Foreign Affairs','https://mofa.gov.pk/')])
    return f'''<div class="container editorial-home">
      <div class="home-intro"><div><div class="news-kicker">An independent information blog</div>
      <h1>Useful guides for Pakistanis living abroad.</h1>
      <p>NICOP, passports, banking, property, taxes and family paperwork—explained in plain English, with links to the relevant official websites.</p></div>
      <button class="home-search search-launch" aria-label="Search all PakSights guides"><span aria-hidden="true">⌕</span> Search articles</button></div>
      <nav class="category-browse" aria-label="Explore categories"><strong>Browse:</strong>{topics}</nav>
      <section class="front-section" aria-label="Featured articles">
       <div class="feature-story"><a class="lead-image" href="{link(lead)}">{img_tag(lead,1200,True)}</a>
         <div class="news-meta">{meta(lead)}</div><h2><a href="{link(lead)}">{escape(lead['title'])}</a></h2><p>{escape(lead['deck'])}</p><a class="simple-link" href="{link(lead)}">Read article →</a></div>
       <div class="right-stories"><div class="news-heading right-heading"><div><span class="news-kicker">Start here</span><h2>Helpful reads</h2></div></div>{''.join(mini_card(a) for a in sided)}
       <div class="editor-note"><strong>Before you apply or pay</strong><p>Always confirm current requirements on the official service website. PakSights is not a government service.</p></div></div>
      </section>
      <div class="news-section">{titlebar('Latest practical guides','Read next',f'Browse all {len(A)} articles')}
       <div class="news-grid">{''.join(story_card(a) for a in picks)}</div></div>
      <div class="home-columns">
       <div><div class="news-section">{titlebar('Identity, documents & travel','Most requested','View identity guides','topics/identity.html')}
       <div class="compact-articles">{''.join(mini_card(a) for a in A if a['category']=='identity' and a['slug'] !=lead['slug'])}</div></div></div>
       <aside class="front-sidebar"><div class="news-heading"><div><span class="news-kicker">Useful websites</span><h2>Official links</h2></div></div>
       <ul class="official-simple">{official}</ul><p class="small-note">We link to these services for independent verification; none endorses PakSights.</p>
       <div class="side-topic"><strong>Need a calculator or checklist?</strong><p>Try the free remittance comparison and property purchase checklist.</p><a href="tools/index.html">Browse tools →</a></div></aside>
      </div>
      <div class="news-section final-news">{titlebar('More articles','From the archive','All guides')}
       <div class="text-article-grid">{''.join(f'<a href="{link(a)}"><span>{topic_label(a)}</span><strong>{escape(a["title"])}</strong><small>Updated {escape(a["reviewed"])}</small></a>' for a in latest[:12])}</div></div>
      <div class="bottom-editorial-note">Information is for general guidance and not individual legal, tax or financial advice. Every detailed article contains official reference links.</div>
    </div>'''

def site_header(prefix=''):
    nav=''.join(f'<a href="{prefix}topics/{cat}.html">{name}</a>' for cat,name in [('identity','Documents'),('money','Banking & money'),('property','Property'),('family','Family'),('support','Help & support')])
    return f'''<a class="skip-link" href="#main">Skip to content</a>
    <div class="topline"><div class="container">Independent guidance for overseas Pakistanis <span>Articles checked against official sources</span></div></div>
    <header class="site-header"><div class="container masthead">
    <a class="brand plain-brand" href="{prefix}index.html" aria-label="PakSights homepage"><span class="wordmark">Pak<span>Sights</span><b>.</b></span><span class="brand-tag">Information for Pakistanis abroad</span></a>
    <div class="mast-actions"><a href="{prefix}guides/index.html" class="all-guides-link">All articles</a><button class="search-launch search-mast" title="Search articles" aria-label="Search articles">⌕ <span>Search</span></button>
    <button class="mobile-toggle" aria-expanded="false" aria-controls="mobile-nav" aria-label="Open navigation"><span aria-hidden="true">☰</span></button></div></div>
    <nav class="primary-nav"><div class="container navlinks">{nav}<a href="{prefix}tools/index.html">Free tools</a><a href="{prefix}sources.html">Official sources</a></div></nav>
    <nav id="mobile-nav" class="mobile-nav container" aria-label="Mobile navigation">{nav}<a href="{prefix}guides/index.html">All articles</a><a href="{prefix}tools/index.html">Free tools</a><a href="{prefix}sources.html">Official sources</a></nav>
    </header>'''

for f in sorted(ROOT.rglob('*.html')):
    if '.github' in f.parts:continue
    html=f.read_text(encoding='utf-8')
    soup=BeautifulSoup(html,'html.parser')
    depth=len(f.relative_to(ROOT).parts)-1
    prefix='../'*depth
    original_header=soup.select_one('.utility-bar')
    if original_header:original_header.decompose()
    h=soup.select_one('header.site-header')
    if h:h.replace_with(BeautifulSoup(site_header(prefix),'html.parser'))
    # Keep a single keyboard skip link and point home links at the canonical root URL.
    skip_links=soup.select('a.skip-link[href="#main"]')
    for duplicate in skip_links[1:]:
        duplicate.decompose()
    for home_link in soup.find_all('a',href=True):
        if home_link['href']==prefix+'index.html':
            home_link['href']=prefix or './'
    # Ads: Auto Ads script is loaded by Google; don't hardcode ad slots or fake placements.
    script=soup.new_tag('script',async_=None)
    script.attrs={'async':'','src':'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9019132490898610','crossorigin':'anonymous'}
    soup.head.append(script)
    theme=soup.head.find('meta',attrs={'name':'theme-color'})
    if theme:theme['content']='#ffffff'
    style=soup.new_tag('link',rel='stylesheet',href=prefix+'assets/css/editorial.css')
    soup.head.append(style)
    if f.name=='index.html' and depth==0:
        main=soup.select_one('main#main')
        main.clear()
        main.append(BeautifulSoup(homepage(),'html.parser'))
    # Rebuild guide cards with photo thumbnails, still preserving JS filtering wrappers.
    for card in soup.select('.guide-card'):
        title=card.select_one('h3')
        if not title:continue
        a=article_by_title.get(title.get_text(' ',strip=True))
        if not a:continue
        anchor=soup.new_tag('a',href=link(a,prefix))
        anchor['class']='guide-photo'
        anchor.append(BeautifulSoup(img_tag(a,660),'html.parser'))
        card.insert(0,anchor)
        card['class']=[*card.get('class',[]),'editorial-guide-card']
    # Articles: add documentary-style lead photo and avoid inflated editorial aesthetics.
    if depth==1 and f.parent.name=='guides' and f.name!='index.html':
        slug=f.stem;a=article_by_slug.get(slug)
        if a:
            top=soup.select_one('.article-top')
            if top:
                fig=soup.new_tag('figure',attrs={'class':'article-photo container'})
                fig.append(BeautifulSoup(img_tag(a,1260,True),'html.parser'))
                cap=soup.new_tag('figcaption');cap.string='Illustrative photograph (Unsplash). Not an image of the named government service.'
                fig.append(cap)
                top.insert_after(fig)
            ah=soup.select_one('.answer-heading')
            if ah:ah.clear();ah.string='In brief'
            # Links to photo in social preview: all thumbnails are from general nonofficial scenes.
            op=soup.head.find('meta',attrs={'property':'og:image'})
            if op:op['content']=img_src(a,1200)
            # Match the visible research-desk byline and add the article's actual hero
            # illustration to the existing structured data (not a generic site logo).
            for ldscript in soup.head.find_all('script',attrs={'type':'application/ld+json'}):
                try:
                    ld=json.loads(ldscript.string or ldscript.get_text())
                except (ValueError,TypeError):
                    continue
                objects=ld if isinstance(ld,list) else [ld]
                modified=False
                for obj in objects:
                    if isinstance(obj,dict) and obj.get('@type') in ('Article','BlogPosting','NewsArticle'):
                        obj['image']=[img_src(a,1200)]
                        obj['author']={'@type':'Organization','name':'PakSights research desk','url':'https://paksights.com/about.html'}
                        modified=True
                if modified:
                    ldscript.string=json.dumps(ld,ensure_ascii=False).replace('</','<\\/')
    if depth==1 and f.parent.name=='guides' and f.name=='index.html':
        ph=soup.select_one('.page-hero h1')
        if ph:ph.string='Guides for Pakistanis living abroad'
    # Make dates describe source review, not fictitious staff writers.
    for s in soup.select('.byline-mark'):
        s.decompose()
    for strong in soup.select('.article-byline strong'):
        strong.string='PakSights research desk'
    # Disclosure and privacy should accurately describe active advertising.
    if f.name=='privacy.html' and depth==0:
        for p in soup.select('.prose-page p'):
            if 'No advertising identifier is included in this launch package.' in p.get_text():
                p.clear()
                p.append(BeautifulSoup('PakSights uses Google AdSense Auto Ads (publisher ID <code>ca-pub-9019132490898610</code>). Google and its partners may use cookies and similar technology for advertising, measurement and fraud prevention, subject to their policies and applicable law. Visitors in regions requiring consent must be shown a suitable consent interface before cookies or personalized ads are used. See <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">Google advertising technologies</a> and <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>.', 'html.parser'))
    # Footer attribution/ads statement without claiming endorsements.
    bottom=soup.select_one('.footer-bottom')
    if bottom:
        credit=soup.new_tag('p',attrs={'class':'footer-photo-credit'})
        credit.string='Editorial illustrations: photographs from Unsplash. Ads may appear via Google AdSense.'
        bottom.insert_after(credit)
    # Establish the connection to the photographic CDN early without making
    # editorial content or core navigation dependent on any third-party script.
    if soup.select_one('img[src*="images.unsplash.com"]'):
        if not soup.head.find('link',attrs={'rel':'preconnect','href':'https://images.unsplash.com'}):
            hint=soup.new_tag('link',rel='preconnect',href='https://images.unsplash.com')
            soup.head.append(hint)
    f.write_text(str(soup),encoding='utf-8')
assert (ROOT/'ads.txt').is_file(), 'Missing root ads.txt; keep the uploaded file in the repository.'
print('Applied classic editorial blog layout, real photographic thumbnails, Adsense Auto Ads and ads.txt')
