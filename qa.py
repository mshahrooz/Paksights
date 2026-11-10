#!/usr/bin/env python3
"""Basic internal-link & content audit, no external network access."""
from pathlib import Path
from html.parser import HTMLParser
import json,re,sys
root=Path(__file__).parent.resolve()
class Checker(HTMLParser):
 def __init__(self):super().__init__();self.urls=[];self.ids=set();self.headings=[];self.canonicals=[]
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if tag in ('a','script','img','link'):
   key='href' if tag in ('a','link') else 'src'
   if d.get(key):self.urls.append((tag,d[key]))
  if d.get('id'):self.ids.add(d['id'])
  if tag in ('h1','h2'):self.headings.append(tag)
  if tag=='link' and d.get('rel')=='canonical':self.canonicals.append(d.get('href'))
files=list(root.rglob('*.html'));issues=[]
for f in files:
 if '.git/' in str(f):continue
 s=f.read_text(encoding='utf-8');c=Checker();c.feed(s)
 for tag,url in c.urls:
  if url.startswith(('https://','http://','mailto:','#','tel:','javascript:','data:')):continue
  path=url.split('#')[0].split('?')[0]
  if not (f.parent/path).exists():issues.append(f'{f.relative_to(root)}: missing {tag}: {url}')
 if not c.headings or 'h1' not in c.headings:issues.append(f'{f.relative_to(root)}: missing H1')
 if f.name!='404.html' and len(c.canonicals)!=1:issues.append(f'{f.relative_to(root)}: canonical count {len(c.canonicals)}')
 if 'Lorem ipsum' in s:issues.append(f'{f.relative_to(root)}: placeholder content')
arts=json.loads((root/'content/articles.json').read_text())
for a in arts:
 length=len(re.findall(r'\w+',str(a)))
 if length<300:issues.append(f'{a["slug"]}: thin article {length} words')
 if not a['sources']:issues.append(f'{a["slug"]}: no official sources')
print('HTML pages:',len(files),'Articles:',len(arts),'Minimum words:',min(len(re.findall(r'\w+',str(a))) for a in arts),'Internal link errors:',len(issues))
for i in issues:print('ERROR',i)
sys.exit(bool(issues))
