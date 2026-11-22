(()=>{
'use strict';
const serviceConfigured=true; // Fully local, no paid API or credentials.
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
document.getElementById('portrait-service-status').textContent='100% FREE · AI runs in your browser · No payments, API keys, photo uploads or per-image charges. First model load needs internet.';
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
function error(text){message.textContent=text;message.hidden=false;progress.setAttribute('aria-hidden','true');requestActive=false;generate.disabled=serviceConfigured===false;}
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

/* Free browser portrait renderer: Magenta neural art + MediaPipe segmentation.
   Neither a user photo nor the result leaves this browser. */
const ART={
 'sunset-poster':{src:'/assets/original-gta6-fanart/hero-outlaws.webp',title:'SUNSET CITY',sub:'COASTAL NIGHTS · ORIGINAL FAN ART',accent:'#ffacc1',power:.66},
 'neon-nights':{src:'/assets/original-gta6-fanart/vice-city-skyline.webp',title:'NEON AFTER DARK',sub:'ELECTRIC CITY · ORIGINAL FAN ART',accent:'#83e7f4',power:.76},
 'beach-days':{src:'/assets/original-gta6-fanart/leonida-coast.webp',title:'COASTAL DREAM',sub:'TROPICAL LIGHT · ORIGINAL FAN ART',accent:'#ffe3aa',power:.58},
 'street-racer':{src:'/assets/original-gta6-fanart/neon-chase.webp',title:'STREET LEGEND',sub:'MIDNIGHT RUN · ORIGINAL FAN ART',accent:'#ff94bb',power:.78},
 'coastal-keys':{src:'/assets/original-gta6-fanart/leonida-coast.webp',title:'BLUE HORIZON',sub:'WILD COAST · ORIGINAL FAN ART',accent:'#9ef8e0',power:.60},
 'wanted-noir':{src:'/assets/original-gta6-fanart/port-night.webp',title:'AFTER DARK',sub:'CRIME NOIR · ORIGINAL FAN ART',accent:'#f6ae8a',power:.77}
};
const SIZES={portrait:[900,1125],story:[810,1440],square:[1080,1080],landscape:[1440,810]};
let neuralModelPromise=null,segmenterPromise=null,lastObjectURL=null;
const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
const image=(src)=>new Promise((resolve,reject)=>{
 const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('Illustration resources could not load.'));i.src=src;
});
function cover(ctx,i,w,h){const iw=i.naturalWidth||i.width,ih=i.naturalHeight||i.height;const s=Math.max(w/iw,h/ih),dw=iw*s,dh=ih*s;ctx.drawImage(i,(w-dw)/2,(h-dh)/2,dw,dh);}
function getMagenta(){
 if(neuralModelPromise)return neuralModelPromise;
 neuralModelPromise=(async()=>{
  if(!window.mi?.ArbitraryStyleTransferNetwork){
   await new Promise((ok,no)=>{
    const s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/@magenta/image@0.2.1';s.async=true;
    s.onload=ok;s.onerror=()=>no(new Error('Model download blocked'));
    document.head.appendChild(s);
   });
  }
  if(!window.mi?.ArbitraryStyleTransferNetwork)throw Error('Neural model unavailable');
  const model=new window.mi.ArbitraryStyleTransferNetwork();
  await model.initialize();return model;
 })().catch(e=>{neuralModelPromise=null;throw e;});
 return neuralModelPromise;
}
function getSegmenter(){
 if(segmenterPromise)return segmenterPromise;
 segmenterPromise=(async()=>{
  const module=await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/vision_bundle.mjs');
  const files=await module.FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm');
  return module.ImageSegmenter.createFromOptions(files,{
   baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite',delegate:'CPU'},
   runningMode:'IMAGE',outputCategoryMask:false,outputConfidenceMasks:true
  });
 })().catch(e=>{segmenterPromise=null;throw e;});
 return segmenterPromise;
}
function fallbackIllustrate(source){
 const c=canvas(source.width,source.height),g=c.getContext('2d');
 g.filter='contrast(1.25) saturate(1.48)';g.drawImage(source,0,0);g.filter='none';
 const im=g.getImageData(0,0,c.width,c.height);
 for(let k=0;k<im.data.length;k+=4){for(let z=0;z<3;z++){im.data[k+z]=Math.min(255,Math.round(im.data[k+z]/23)*23);}}
 g.putImageData(im,0,0);return c;
}
async function stylePhoto(source,styleRef,power){
 const model=await getMagenta();
 const style=canvas(300,300);cover(style.getContext('2d'),styleRef,300,300);
 const out=await model.stylize(source,style,power);
 if(!out||!out.width||!out.height)throw Error('AI did not output an image.');
 const c=canvas(out.width,out.height);c.getContext('2d').putImageData(out,0,0);return c;
}
async function maskedPerson(source){
 const engine=await getSegmenter();let found=null;
 const cb=(r)=>{
   const m=r?.confidenceMasks?.[1]||r?.confidenceMasks?.[0];
   if(m)found={mask:new Float32Array(m.getAsFloat32Array()),width:m.width,height:m.height};
 };
 const ret=engine.segment(source,cb);if(!found&&ret)cb(ret);
 if(!found)throw Error('Person separation unavailable.');
 const g=canvas(found.width,found.height),ctx=g.getContext('2d'),im=ctx.createImageData(g.width,g.height);
 let minX=g.width,minY=g.height,maxX=0,maxY=0,count=0;
 for(let i=0;i<found.mask.length;i++){
   const confidence=Math.max(0,Math.min(1,(found.mask[i]-.20)/.66));
   const a=Math.round(255*confidence*confidence*(3-2*confidence));
   const idx=i*4;im.data[idx]=255;im.data[idx+1]=255;im.data[idx+2]=255;im.data[idx+3]=a;
   if(confidence>.42){
    const x=i%g.width,y=(i/g.width)|0;
    minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);count++;
   }
 }
 if(count<g.width*g.height*.024)return null;
 ctx.putImageData(im,0,0);
 return {mask:g,bounds:{x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1}};
}
function compose(background,source,stylized,segmented,ref,size,usedNeural){
 const [W,H]=SIZES[size]||SIZES.portrait,out=canvas(W,H),g=out.getContext('2d');
 g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
 cover(g,background,W,H);
 const dim=g.createLinearGradient(0,0,0,H);
 dim.addColorStop(0,'rgba(12,18,36,.37)');dim.addColorStop(.52,'rgba(7,12,27,.05)');dim.addColorStop(1,'rgba(8,13,29,.68)');
 g.fillStyle=dim;g.fillRect(0,0,W,H);
 const mix=canvas(source.width,source.height),mx=mix.getContext('2d');
 mx.drawImage(stylized,0,0,mix.width,mix.height);
 mx.globalAlpha=.17;mx.drawImage(source,0,0);mx.globalAlpha=1;
 if(segmented?.mask){
  const cut=canvas(mix.width,mix.height),cx=cut.getContext('2d');
  cx.drawImage(mix,0,0);cx.globalCompositeOperation='destination-in';cx.filter='blur(1px)';
  cx.drawImage(segmented.mask,0,0,mix.width,mix.height);cx.filter='none';cx.globalCompositeOperation='source-over';
  const b=segmented.bounds,scaleX=mix.width/segmented.mask.width,scaleY=mix.height/segmented.mask.height;
  const px=mix.width*.045,py=mix.height*.03;
  const sx=Math.max(0,b.x*scaleX-px),sy=Math.max(0,b.y*scaleY-py);
  const sw=Math.min(mix.width-sx,b.w*scaleX+px*2),sh=Math.min(mix.height-sy,b.h*scaleY+py*2);
  const zoom=Math.min(W*.90/sw,H*.84/sh,2.8);
  const dw=sw*zoom,dh=sh*zoom;
  g.save();g.shadowColor='rgba(9,14,26,.6)';g.shadowBlur=W*.035;g.shadowOffsetY=10;
  g.drawImage(cut,sx,sy,sw,sh,(W-dw)/2,H-dh+H*.04,dw,dh);g.restore();
 }else{
  const scale=Math.min(W*.79/mix.width,H*.72/mix.height);
  const dw=mix.width*scale,dh=mix.height*scale;
  const x=(W-dw)/2,y=(H-dh)/2;
  g.fillStyle='#0e142eaa';g.fillRect(x-9,y-9,dw+18,dh+18);
  g.drawImage(mix,x,y,dw,dh);
  g.strokeStyle=ref.accent;g.lineWidth=Math.max(3,W*.004);g.strokeRect(x-9,y-9,dw+18,dh+18);
 }
 const m=W*.055;
 g.textAlign='left';g.textBaseline='alphabetic';g.shadowColor='rgba(0,0,0,.65)';g.shadowBlur=10;
 g.font='900 '+Math.round(W*.027)+'px Arial,sans-serif';g.fillStyle='#fff';
 g.fillText('PAKSIGHTS  /  CHARACTER STUDIO',m,m*1.24);
 g.shadowBlur=0;g.fillStyle=ref.accent;g.fillRect(m,m*1.42,W*.13,Math.max(4,W*.005));
 g.font='900 '+Math.round(W*.088)+'px Impact,Arial Black,sans-serif';
 if(g.measureText(ref.title).width>W-m*2)g.font='900 '+Math.round(W*.066)+'px Impact,Arial Black,sans-serif';
 g.fillStyle='#fff';g.shadowBlur=12;g.fillText(ref.title,m,H-m*1.75);g.shadowBlur=0;
 g.font='800 '+Math.round(W*.017)+'px Arial,sans-serif';g.fillStyle=ref.accent;g.fillText(ref.sub,m,H-m);
 g.textAlign='right';g.font='700 '+Math.max(11,Math.round(W*.012))+'px Arial,sans-serif';
 g.fillStyle='#f1f4f8';g.fillText('AI-ASSISTED FAN ART · NOT GAMEPLAY',W-m,H-m*.52);
 return out;
}
generate.addEventListener('click',async()=>{
 if(requestActive)return;
 message.hidden=true;
 if(!photoData)return error('Please upload your photograph first.');
 if(!consent.checked)return error('Confirm that this photograph is yours or that you have permission.');
 requestActive=true;generate.disabled=true;resultPanel.hidden=true;resultTools.hidden=true;previewPanel.hidden=false;
 const progressText=t=>{progress.setAttribute('aria-hidden','false');progress.querySelector('span:last-child').textContent=t;};
 try{
  const ref=ART[selected];progressText('Loading free AI models on your device…');
  const [src,bg]=await Promise.all([image(photoData),image(ref.src)]);
  const ratio=Math.min(1,520/Math.max(src.naturalWidth,src.naturalHeight));
  const photo=canvas(Math.max(1,Math.round(src.naturalWidth*ratio)),Math.max(1,Math.round(src.naturalHeight*ratio)));
  photo.getContext('2d').drawImage(src,0,0,photo.width,photo.height);
  const outcomes=await Promise.allSettled([stylePhoto(photo,bg,ref.power),maskedPerson(photo)]);
  const aiWorked=outcomes[0].status==='fulfilled';
  const painted=aiWorked?outcomes[0].value:fallbackIllustrate(photo);
  const segmentation=outcomes[1].status==='fulfilled'?outcomes[1].value:null;
  progressText('Creating your original illustrated character poster…');
  const result=compose(bg,photo,painted,segmentation,ref,frame(),aiWorked);
  const blob=await new Promise((ok,no)=>result.toBlob(b=>b?ok(b):no(Error('Could not export the picture.')),'image/png'));
  if(lastObjectURL)URL.revokeObjectURL(lastObjectURL);
  lastObjectURL=URL.createObjectURL(blob);
  resultImg.src=lastObjectURL;download.href=lastObjectURL;download.download='paksights-'+selected+'-free.png';
  resultPanel.querySelector('span').textContent=aiWorked
     ?'ON-DEVICE NEURAL ART · ORIGINAL FAN CREATION · NOT GAMEPLAY'
     :'BASIC ILLUSTRATION FALLBACK · NEURAL MODEL UNAVAILABLE · NOT GAMEPLAY';
  previewPanel.hidden=true;resultPanel.hidden=false;resultTools.hidden=false;
  document.getElementById('portrait-service-status').textContent=aiWorked
   ?'Your artwork was created locally using neural style transfer. No photo was uploaded.'
   :'Your free poster is ready. The AI model was unavailable, so a basic graphic effect was used.';
  resultPanel.scrollIntoView({behavior:'smooth',block:'nearest'});
 }catch(e){error(e?.message||'Unable to finish this illustration. Try another photo.');}
 finally{requestActive=false;generate.disabled=false;progress.setAttribute('aria-hidden','true');}
});
window.addEventListener('pagehide',()=>{if(lastObjectURL)URL.revokeObjectURL(lastObjectURL)},{once:true});
})();