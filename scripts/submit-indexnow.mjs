#!/usr/bin/env node
/**
 * Notify IndexNow-participating search engines about NEW or CHANGED URLs.
 * Requires our public root key file; no account, billing, or private key.
 * This requests discovery only. It does not promise ranking/indexing.
 */
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const domain='https://paksights.com';
const key='3bc8f9e7696f0c83a10f3b98f98c3c95';
let paths=[];
try{
 const changed=execFileSync('git',['diff','--name-only','HEAD^','HEAD'],{encoding:'utf8'}).trim().split('\n');
 if(changed.includes(key+'.txt')||changed.includes('scripts/build-seo.mjs')){
   const cfg=JSON.parse(fs.readFileSync('scripts/seo-page-data.json','utf8'));
   paths=Object.keys(cfg.pages).filter(p=>p!=='404.html'&&!p.endsWith('100-screenshots.html'));
 }else{
   paths=changed.filter(p=>p.endsWith('.html')&&fs.existsSync(p)&&p!=='404.html'&&!p.endsWith('100-screenshots.html'));
 }
}catch(e){console.log('No comparable parent commit; skip IndexNow notification.');process.exit(0);}
const urls=[...new Set(paths.map(p=>domain+(p==='index.html'?'/':'/'+p)))];
if(urls.length===0){console.log('No new or changed HTML URLs to notify.');process.exit(0);}
const payload={host:'paksights.com',key,keyLocation:domain+'/'+key+'.txt',urlList:urls};
try{
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),15000);
 let response;
 try{
  response=await fetch('https://api.indexnow.org/indexnow',{
   method:'POST',headers:{'Content-Type':'application/json; charset=utf-8'},
   body:JSON.stringify(payload),signal:controller.signal
  });
 }finally{clearTimeout(timeout)}
 console.log(JSON.stringify({status:response.status,urlsSubmitted:urls.length,accepted:response.status===200||response.status===202}));
 if(!response.ok)process.exitCode=1;
}catch(error){console.error('IndexNow notification unavailable:',String(error.message||error));process.exitCode=1;}
