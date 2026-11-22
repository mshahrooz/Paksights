(()=>{
'use strict';
const API='https://paksights-gta-portrait-api.vercel.app/api/generate';
const fileInput=document.getElementById('portrait-file');
if(!fileInput)return;
const upload=document.getElementById('portrait-upload');
const preview=document.getElementById('portrait-upload-preview');
const generate=document.getElementById('portrait-generate');
const consent=document.getElementById('portrait-consent');
const message=document.getElementById('portrait-error');
const progress=document.getElementById('portrait-progress');
const previewPanel=document.getElementById('portrait-stage-empty');
const resultPanel=document.getElementById('portrait-result');
const resultImg=document.getElementById('portrait-result-image');
const resultTools=document.getElementById('portrait-result-tools');
const download=document.getElementById('portrait-download');
const copy=document.getElementById('portrait-copy-prompt');
const promptBox=document.getElementById('portrait-prompt-box');
const notes=document.getElementById('portrait-notes');
const frame=()=>document.querySelector('input[name="portrait-frame"]:checked')?.value||'portrait';
const styleLabels={
 'sunset-poster':'Warm sunset key art with palm trees and a coastal city skyline',
 'neon-nights':'Neon night street with pink-blue lights and wet reflections',
 'beach-days':'Vibrant beachside palm trees and sunny tropical street',
 'street-racer':'Stylish street racing scene with sports cars and cinematic lights',
 'coastal-keys':'Bright teal ocean, islands, mangroves and coastal bridges',
 'wanted-noir':'Dark, moody crime-drama movie character poster'
};
const frameLabels={portrait:'4:5 vertical poster',story:'9:16 Instagram Story',square:'1:1 profile photo',landscape:'16:9 widescreen'};
let selected='sunset-poster', photoData='', requestActive=false;
function error(text){message.textContent=text;message.hidden=false;progress.setAttribute('aria-hidden','true');requestActive=false;generate.disabled=false;}
function buildPrompt(){
 return 'Transform the attached photo into original semi-realistic hand-painted tropical open-world crime videogame character art. Preserve the exact recognizable facial features, hairstyle, skin tone and age of the person in the photo. Background: '+styleLabels[selected]+'. Framing: '+frameLabels[frame()]+'. Add expressive cinematic lighting, polished fine outlines, detailed eyes, and confident natural pose. Do not add game logos, trademarks, text, weapons, or watermarks.'+(notes.value.trim()?' Additional details: '+notes.value.trim().slice(0,180):'');
}
async function loadPhoto(file){
 message.hidden=true;promptBox.hidden=true;
 if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type))return error('Please choose a JPG, PNG or WebP image.');
 if(file.size>12000000)return error('Please upload a photo smaller than 12 MB.');
 try{
  const img=await createImageBitmap(file);
  let w=img.width,h=img.height;
  if(Math.max(w,h)<200){img.close();return error('Please upload a clearer photo at least 200 pixels wide.');}
  const ratio=Math.min(1,1400/Math.max(w,h));w=Math.max(1,Math.round(w*ratio));h=Math.max(1,Math.round(h*ratio));
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext('2d',{alpha:false});ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);ctx.drawImage(img,0,0,w,h);img.close();
  let q=.85;photoData=canvas.toDataURL('image/jpeg',q);
  while(photoData.length>2_500_000&&q>.45){q-=.1;photoData=canvas.toDataURL('image/jpeg',q);}
  if(photoData.length>2_500_000)return error('This photo is still too large after compression. Please use a smaller one.');
  preview.src=photoData;preview.hidden=false;upload.classList.add('has-photo');upload.querySelector('.portrait-upload-change').textContent=file.name+' · Click or drag to change';
  resultPanel.hidden=true;resultTools.hidden=true;previewPanel.hidden=false;
 }catch(e){error('Could not read this photo. Please try JPG, PNG or WebP.');}
}
fileInput.addEventListener('change',()=>{if(fileInput.files[0])loadPhoto(fileInput.files[0]);});
for(const e of ['dragenter','dragover'])upload.addEventListener(e,ev=>{ev.preventDefault();upload.classList.add('is-dragover');});
for(const e of ['dragleave','drop'])upload.addEventListener(e,ev=>{ev.preventDefault();upload.classList.remove('is-dragover');});
upload.addEventListener('drop',ev=>{const file=ev.dataTransfer.files?.[0];if(file)loadPhoto(file);});
document.querySelectorAll('.portrait-preset').forEach(btn=>btn.addEventListener('click',()=>{
 document.querySelectorAll('.portrait-preset').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
 selected=btn.dataset.style;
}));
copy.addEventListener('click',async()=>{
 const value=buildPrompt();promptBox.textContent=value;promptBox.hidden=false;
 try{await navigator.clipboard.writeText(value);copy.textContent='Prompt copied ✓';setTimeout(()=>copy.textContent='Copy my AI prompt',2000)}
 catch(e){copy.textContent='Select and copy the prompt below';}
});
generate.addEventListener('click',async()=>{
 if(requestActive)return;
 if(!photoData)return error('Upload your photograph first.');
 if(!consent.checked)return error('Please confirm that you own this photo or have the person’s permission.');
 requestActive=true;generate.disabled=true;message.hidden=true;progress.setAttribute('aria-hidden','false');progress.querySelector('span:last-child').textContent='Creating your portrait with AI…';
 resultPanel.hidden=true;resultTools.hidden=true;previewPanel.hidden=false;
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),75000);
 try{
  const response=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({photo:photoData,consent:true,style:selected,frame:frame(),notes:notes.value.trim().slice(0,180)}),signal:controller.signal,cache:'no-store',mode:'cors'});
  const data=await response.json();
  if(!response.ok||!data.image||!data.image.startsWith('data:image/'))throw new Error(data.error||'The service did not return an image.');
  resultImg.src=data.image;
  download.href=data.image;
  download.download='paksights-original-gta-inspired-portrait.'+(data.image.startsWith('data:image/jpeg')?'jpg':'png');
  previewPanel.hidden=true;resultPanel.hidden=false;resultTools.hidden=false;
  resultPanel.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});
 }catch(e){error(e.name==='AbortError'?'The image service timed out. Please try again.':e.message||'Could not generate. Use the prompt option below.');}
 finally{clearTimeout(timer);requestActive=false;generate.disabled=false;progress.setAttribute('aria-hidden','true');}
});
})();