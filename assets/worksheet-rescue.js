/* PakSights Worksheet Rescue v1 — fully local, no image upload or telemetry. */
(()=>{
"use strict";
const $=id=>document.getElementById(id);
const input=$("wr-files"), drop=$("wr-drop"), list=$("wr-pages"), viewer=$("wr-viewer");
if(!input||!drop||!list||!viewer)return;
const before=$("wr-original"), after=$("wr-cleaned"), handles=$("wr-handles");
const status=$("wr-status"), pages=[], MAX_PAGES=20, MAX_BYTES=25*1024*1024;
let selected=-1, nextId=1, renderTicket=0, renderTimer=0, busy=false;
let editingCorners=false, erasing=false, showingOriginal=false, activeStroke=null, resizing=false;
const defaults=()=>({mode:"gray",clean:75,contrast:20,threshold:175,removeRed:false,removeBlue:false,turn:0,tilt:0,quad:[[0,0],[1,0],[1,1],[0,1]],strokes:[]});
const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
const say=(msg,error=false)=>{status.textContent=msg;status.dataset.error=error?"true":"false"};
const current=()=>pages[selected]||null;
const loadImage=file=>new Promise((resolve,reject)=>{
 const u=URL.createObjectURL(file), im=new Image();
 im.onload=()=>resolve({image:im,url:u});
 im.onerror=()=>{URL.revokeObjectURL(u);reject(new Error("This image could not be opened."))};
 im.src=u;
});
function thumbSrc(canvas){const c=document.createElement("canvas");let ratio=Math.min(1,100/Math.max(canvas.width,canvas.height));c.width=Math.round(canvas.width*ratio);c.height=Math.round(canvas.height*ratio);c.getContext("2d").drawImage(canvas,0,0,c.width,c.height);return c.toDataURL("image/jpeg",.7)}
async function addFiles(files){
 const accepted=Array.from(files).filter(f=>f.type.startsWith("image/"));
 if(!accepted.length){say("Choose JPG, PNG, WebP or another browser-supported image.",true);return}
 let added=0;
 for(const file of accepted){
  if(pages.length>=MAX_PAGES){say("Maximum "+MAX_PAGES+" pages. Export this batch before adding more.",true);break}
  if(file.size>MAX_BYTES){say(file.name+" is larger than 25 MB and was skipped.",true);continue}
  try{
   const loaded=await loadImage(file), im=loaded.image;
   const scale=Math.min(1,2600/Math.max(im.naturalWidth,im.naturalHeight));
   const c=document.createElement("canvas");c.width=Math.max(1,Math.round(im.naturalWidth*scale));c.height=Math.max(1,Math.round(im.naturalHeight*scale));
   const ctx=c.getContext("2d",{willReadFrequently:true});ctx.fillStyle="#fff";ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(im,0,0,c.width,c.height);
   URL.revokeObjectURL(loaded.url);
   pages.push({id:nextId++,name:file.name,source:c,thumb:thumbSrc(c),settings:defaults(),cache:null});
   added++;
  }catch(e){say("Skipped "+file.name+": "+e.message,true)}
 }
 if(added){selected=pages.length-added;drawList();syncControls();scheduleRender();say(added+" page(s) added. Adjust the current page or export all as one PDF.")}
}
input.addEventListener("change",()=>{addFiles(input.files);input.value=""});
drop.addEventListener("dragover",e=>{e.preventDefault();drop.classList.add("dragging")});
drop.addEventListener("dragleave",()=>drop.classList.remove("dragging"));
drop.addEventListener("drop",e=>{e.preventDefault();drop.classList.remove("dragging");addFiles(e.dataTransfer.files)});
drop.addEventListener("click",()=>input.click());
drop.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();input.click()}});
function drawList(){
 list.innerHTML="";
 pages.forEach((p,i)=>{
  const row=document.createElement("div");row.className="wr-page"+(i===selected?" is-selected":"");row.dataset.id=p.id;
  const choose=document.createElement("button");choose.type="button";choose.className="wr-page-select";choose.setAttribute("aria-label","Edit "+p.name);
  const img=document.createElement("img");img.src=p.thumb;img.alt="Page "+(i+1)+" thumbnail";img.width=50;img.height=65;
  const meta=document.createElement("span");meta.className="wr-page-info";
  const name=document.createElement("strong");name.textContent="Page "+(i+1);
  const filename=document.createElement("small");filename.textContent=p.name;
  meta.append(name,filename);choose.append(img,meta);choose.onclick=()=>select(i);
  const actions=document.createElement("div");actions.className="wr-page-actions";
  [["↑","Move up",()=>movePage(i,-1),i===0],["↓","Move down",()=>movePage(i,1),i===pages.length-1],["×","Remove",()=>removePage(i),false]].forEach(([label,tip,fn,disabled])=>{
   let b=document.createElement("button");b.type="button";b.textContent=label;b.title=tip;b.setAttribute("aria-label",tip+" page "+(i+1));b.disabled=disabled;b.onclick=fn;actions.appendChild(b)
  });
  row.append(choose,actions);list.appendChild(row);
 });
 $("wr-count").textContent=pages.length+" / "+MAX_PAGES+" pages";
 $("wr-empty").hidden=pages.length>0;
 $("wr-workspace").hidden=pages.length===0;
 $("wr-download-pdf").disabled=pages.length===0||busy;
 $("wr-download-png").disabled=pages.length===0||busy;
 $("wr-pages-panel").hidden=pages.length===0;
}
function select(i){selected=i;editingCorners=false;erasing=false;showingOriginal=false;syncControls();drawList();scheduleRender();}
function movePage(i,d){const j=i+d;if(j<0||j>=pages.length)return;[pages[i],pages[j]]=[pages[j],pages[i]];if(selected===i)selected=j;else if(selected===j)selected=i;drawList();syncControls();scheduleRender()}
function removePage(i){pages.splice(i,1);if(!pages.length)selected=-1;else selected=clamp(selected>i?selected-1:selected,0,pages.length-1);drawList();syncControls();scheduleRender();}
function syncControls(){
 const p=current();if(!p)return;const s=p.settings;
 ["clean","contrast","threshold","tilt"].forEach(k=>{const el=$("wr-"+k);if(el)el.value=s[k];$("wr-"+k+"-value").textContent=s[k]+(k==="tilt"?"°":k==="threshold"?"":"%")});
 $("wr-mode").value=s.mode;$("wr-remove-red").checked=s.removeRed;$("wr-remove-blue").checked=s.removeBlue;
 $("wr-editor-name").textContent=p.name;$("wr-undo").disabled=!s.strokes.length;
 $("wr-corners").setAttribute("aria-pressed",String(editingCorners));$("wr-erase").setAttribute("aria-pressed",String(erasing));
 $("wr-toggle").textContent=showingOriginal?"Show cleaned":"Show original";
 $("wr-corner-help").hidden=!editingCorners;
}
function scheduleRender(){clearTimeout(renderTimer);renderTimer=setTimeout(renderPreview,75)}
function rotatedImage(p){
 const src=p.source,s=p.settings,ang=(s.turn*90+s.tilt)*Math.PI/180,co=Math.cos(ang),si=Math.sin(ang);
 const w=Math.max(1,Math.ceil(Math.abs(src.width*co)+Math.abs(src.height*si)));
 const h=Math.max(1,Math.ceil(Math.abs(src.width*si)+Math.abs(src.height*co)));
 const c=document.createElement("canvas");c.width=w;c.height=h;
 const ctx=c.getContext("2d",{willReadFrequently:true});ctx.fillStyle="white";ctx.fillRect(0,0,w,h);
 ctx.translate(w/2,h/2);ctx.rotate(ang);ctx.drawImage(src,-src.width/2,-src.height/2);return c;
}
function findHomography(quad,w,h){
 const src=quad.map(([x,y])=>[clamp(x,0,1)*w,clamp(y,0,1)*h]),uv=[[0,0],[1,0],[1,1],[0,1]],mat=[];
 for(let i=0;i<4;i++){
  let [u,v]=uv[i],[x,y]=src[i];
  mat.push([u,v,1,0,0,0,-x*u,-x*v,x]);
  mat.push([0,0,0,u,v,1,-y*u,-y*v,y]);
 }
 for(let j=0;j<8;j++){
  let best=j;for(let i=j+1;i<8;i++)if(Math.abs(mat[i][j])>Math.abs(mat[best][j]))best=i;
  [mat[j],mat[best]]=[mat[best],mat[j]];
  let m=mat[j][j];if(Math.abs(m)<1e-10)throw new Error("Crop corners overlap. Move them apart.");
  for(let c=j;c<9;c++)mat[j][c]/=m;
  for(let i=0;i<8;i++){if(i===j)continue;let factor=mat[i][j];for(let c=j;c<9;c++)mat[i][c]-=factor*mat[j][c]}
 }
 return mat.map(r=>r[8]);
}
function targetDimensions(p,rot,maxWidth){
 const q=p.settings.quad,dist=(a,b)=>Math.hypot((q[a][0]-q[b][0])*rot.width,(q[a][1]-q[b][1])*rot.height);
 const width=(dist(0,1)+dist(2,3))/2, height=(dist(1,2)+dist(3,0))/2;
 const ratio=clamp(width/Math.max(1,height),.40,2.2);
 const outW=Math.min(maxWidth,Math.round(Math.max(400,width)));
 const outH=Math.round(clamp(outW/ratio,250,maxWidth*2.3));
 return [outW,outH];
}
function warp(rot,p,w,h){
 const source=rot.getContext("2d",{willReadFrequently:true}).getImageData(0,0,rot.width,rot.height).data;
 const result=new ImageData(w,h),out=result.data,coef=findHomography(p.settings.quad,rot.width,rot.height);
 const [a,b,c,d,e,f,g,k]=coef,W=rot.width,H=rot.height;
 for(let y=0;y<h;y++){
  const v=y/(h-1);
  for(let x=0;x<w;x++){
   const u=x/(w-1),base=(y*w+x)*4,div=g*u+k*v+1;
   const xx=(a*u+b*v+c)/div, yy=(d*u+e*v+f)/div;
   if(!Number.isFinite(xx)||!Number.isFinite(yy)||xx<0||yy<0||xx>=W-1||yy>=H-1){out[base]=out[base+1]=out[base+2]=255;out[base+3]=255;continue}
   const ix=xx|0,iy=yy|0,dx=xx-ix,dy=yy-iy;
   const p0=(iy*W+ix)*4,p1=p0+4,p2=p0+W*4,p3=p2+4;
   for(let ch=0;ch<3;ch++){
    out[base+ch]=source[p0+ch]*(1-dx)*(1-dy)+source[p1+ch]*dx*(1-dy)+source[p2+ch]*(1-dx)*dy+source[p3+ch]*dx*dy;
   }out[base+3]=255;
  }
 }
 const cv=document.createElement("canvas");cv.width=w;cv.height=h;cv.getContext("2d",{willReadFrequently:true}).putImageData(result,0,0);return cv;
}
function enhance(canvas,s){
 const w=canvas.width,h=canvas.height,ctx=canvas.getContext("2d",{willReadFrequently:true});
 const data=ctx.getImageData(0,0,w,h),a=data.data;
 const local=document.createElement("canvas");local.width=w;local.height=h;
 const bg=local.getContext("2d",{willReadFrequently:true});bg.fillStyle="#fff";bg.fillRect(0,0,w,h);
 bg.filter="blur("+Math.max(12,Math.round(w/22))+"px)";bg.drawImage(canvas,0,0);bg.filter="none";
 const ba=bg.getImageData(0,0,w,h).data;
 const amount=s.clean/100,contrast=1+(s.contrast/100)*1.6,cut=s.threshold;
 for(let i=0;i<a.length;i+=4){
  let r=a[i],g=a[i+1],b=a[i+2];
  if(s.removeRed&&r>g*1.22&&r>b*1.15&&r-g>40){r=g=b=255}
  if(s.removeBlue&&b>r*1.22&&b>g*1.10&&b-r>35){r=g=b=255}
  const localLum=.2126*ba[i]+.7152*ba[i+1]+.0722*ba[i+2],boost=clamp((250-localLum)*amount,0,95);
  r=clamp((r+boost-128)*contrast+128,0,255);
  g=clamp((g+boost-128)*contrast+128,0,255);
  b=clamp((b+boost-128)*contrast+128,0,255);
  if(s.mode!=="color"){
   const lum=clamp(.2126*r+.7152*g+.0722*b,0,255);
   r=g=b=(s.mode==="ink"?(lum>cut?255:0):lum);
  }
  a[i]=r;a[i+1]=g;a[i+2]=b;
 }
 ctx.putImageData(data,0,0);return canvas;
}
function applyErasing(canvas,p){
 const ctx=canvas.getContext("2d");ctx.save();ctx.strokeStyle="#fff";ctx.fillStyle="#fff";
 p.settings.strokes.forEach(st=>{
  ctx.lineWidth=Math.max(2,st.radius*canvas.width);ctx.lineCap="round";ctx.lineJoin="round";
  if(!st.points.length)return;
  ctx.beginPath();st.points.forEach((pt,i)=>{const x=pt[0]*canvas.width,y=pt[1]*canvas.height;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)});
  if(st.points.length===1){ctx.arc(st.points[0][0]*canvas.width,st.points[0][1]*canvas.height,ctx.lineWidth/2,0,Math.PI*2);ctx.fill()}
  else ctx.stroke();
 });ctx.restore();return canvas;
}
function processing(p,maxW,includeErasing=true){
 const rot=rotatedImage(p),[w,h]=targetDimensions(p,rot,maxW);
 const warped=enhance(warp(rot,p,w,h),p.settings);
 if(includeErasing)applyErasing(warped,p);
 return {rot,canvas:warped};
}
function drawCanvasTo(target,source){
 target.width=source.width;target.height=source.height;
 const ctx=target.getContext("2d");ctx.clearRect(0,0,target.width,target.height);ctx.drawImage(source,0,0);
}
async function renderPreview(){
 const p=current();if(!p)return;
 const ticket=++renderTicket;
 say("Rendering preview…");
 try{
  const result=processing(p,880,false);
  if(ticket!==renderTicket||p!==current())return;
  p.cache=result.canvas;
  drawCanvasTo(before,result.rot);redrawCleaned();
  $("wr-original").hidden=!(showingOriginal||editingCorners);
  $("wr-cleaned").hidden=(showingOriginal||editingCorners);
  updateCornerHandles();
  say("Ready. All processing stays in this browser.");
 }catch(e){say("Could not process image: "+e.message,true)}
}
function redrawCleaned(){
 const p=current();if(!p||!p.cache)return;
 drawCanvasTo(after,p.cache);
 applyErasing(after,p);
 $("wr-undo").disabled=!p.settings.strokes.length;
}
function updateCornerHandles(){
 const p=current();if(!p)return;
 handles.hidden=!editingCorners;
 const bounds=before.getBoundingClientRect(), vw=viewer.getBoundingClientRect();
 if(!bounds.width||!bounds.height)return;
 handles.style.left=(bounds.left-vw.left)+"px";
 handles.style.top=(bounds.top-vw.top)+"px";
 handles.style.width=bounds.width+"px";handles.style.height=bounds.height+"px";
 const points=p.settings.quad;
 $("wr-polygon").setAttribute("points",points.map(q=>q[0]*100+","+q[1]*100).join(" "));
 handles.querySelectorAll("[data-corner]").forEach((node,i)=>{node.style.left=(points[i][0]*100)+"%";node.style.top=(points[i][1]*100)+"%"});
}
handles.querySelectorAll("[data-corner]").forEach(b=>{
 b.addEventListener("pointerdown",e=>{if(!editingCorners)return;e.preventDefault();b.setPointerCapture(e.pointerId);resizing=true});
 b.addEventListener("pointermove",e=>{
  if(!resizing||!b.hasPointerCapture(e.pointerId))return;
  const bounds=handles.getBoundingClientRect(),x=clamp((e.clientX-bounds.left)/bounds.width,0,1),y=clamp((e.clientY-bounds.top)/bounds.height,0,1);
  current().settings.quad[Number(b.dataset.corner)]=[x,y];updateCornerHandles();
 });
 b.addEventListener("pointerup",()=>{resizing=false;scheduleRender()});
 b.addEventListener("pointercancel",()=>{resizing=false});
});
after.addEventListener("pointerdown",e=>{
 if(!erasing||!current()||!current().cache)return;
 e.preventDefault();after.setPointerCapture(e.pointerId);
 const rect=after.getBoundingClientRect(),coord=()=>[clamp((e.clientX-rect.left)/rect.width,0,1),clamp((e.clientY-rect.top)/rect.height,0,1)];
 activeStroke={radius:Number($("wr-brush").value)/100,points:[coord()]};
 current().settings.strokes.push(activeStroke);redrawCleaned();
});
after.addEventListener("pointermove",e=>{
 if(!erasing||!activeStroke)return;
 const rect=after.getBoundingClientRect();
 activeStroke.points.push([clamp((e.clientX-rect.left)/rect.width,0,1),clamp((e.clientY-rect.top)/rect.height,0,1)]);
 redrawCleaned();
});
["pointerup","pointercancel","lostpointercapture"].forEach(name=>after.addEventListener(name,()=>activeStroke=null));
window.addEventListener("resize",()=>{if(current())updateCornerHandles()});
function setMode(newMode){
 editingCorners=newMode==="corners";erasing=newMode==="erase";showingOriginal=false;
 $("wr-corners").setAttribute("aria-pressed",String(editingCorners));
 $("wr-erase").setAttribute("aria-pressed",String(erasing));
 $("wr-original").hidden=!editingCorners;
 $("wr-cleaned").hidden=editingCorners;after.style.cursor=erasing?"crosshair":"default";after.style.touchAction=erasing?"none":"auto";
 $("wr-corner-help").hidden=!editingCorners;updateCornerHandles();$("wr-toggle").textContent="Show original";
}
$("wr-corners").onclick=()=>setMode(editingCorners?"normal":"corners");
$("wr-erase").onclick=()=>setMode(erasing?"normal":"erase");
$("wr-toggle").onclick=()=>{
 if(editingCorners)setMode("normal");
 showingOriginal=!showingOriginal;$("wr-original").hidden=!showingOriginal;$("wr-cleaned").hidden=showingOriginal;
 $("wr-toggle").textContent=showingOriginal?"Show cleaned":"Show original";updateCornerHandles();
};
$("wr-turn-left").onclick=()=>{let p=current();if(!p)return;p.settings.turn--;scheduleRender()};
$("wr-turn-right").onclick=()=>{let p=current();if(!p)return;p.settings.turn++;scheduleRender()};
$("wr-undo").onclick=()=>{let p=current();if(!p)return;p.settings.strokes.pop();redrawCleaned()};
$("wr-reset").onclick=()=>{let p=current();if(!p)return;p.settings=defaults();setMode("normal");syncControls();scheduleRender()};
["clean","contrast","threshold","tilt"].forEach(k=>{const node=$("wr-"+k);node.addEventListener("input",()=>{if(!current())return;current().settings[k]=Number(node.value);$("wr-"+k+"-value").textContent=node.value+(k==="tilt"?"°":k==="threshold"?"":"%");scheduleRender()})});
$("wr-mode").addEventListener("change",e=>{if(current()){current().settings.mode=e.target.value;scheduleRender()}});
["removeRed","removeBlue"].forEach(k=>{$("wr-"+(k==="removeRed"?"remove-red":"remove-blue")).addEventListener("change",e=>{if(current()){current().settings[k]=e.target.checked;scheduleRender()}})});
function download(blob,name){
 const u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),30000);
}
function yieldBrowser(){return new Promise(r=>setTimeout(r,0))}
function toJpegBytes(canvas){
 const uri=canvas.toDataURL("image/jpeg",.87),binary=atob(uri.slice(uri.indexOf(",")+1));
 const data=new Uint8Array(binary.length);
 for(let i=0;i<binary.length;i++)data[i]=binary.charCodeAt(i);
 return data;
}
function buildPdf(pagesData,format){
 const [PW,PH]=format==="letter"?[612,792]:[595.28,841.89];
 const enc=new TextEncoder(),pieces=[],offset=[0];let length=0;
 const write=v=>{const bytes=typeof v==="string"?enc.encode(v):v;pieces.push(bytes);length+=bytes.length};
 const obj=(id,contents)=>{offset[id]=length;write(id+" 0 obj\n");write(contents);write("\nendobj\n")};
 write("%PDF-1.4\n%\xC3\xA2\xC3\xA3\xC3\x8F\xC3\x93\n");
 obj(1,"<< /Type /Catalog /Pages 2 0 R >>");
 obj(2,"<< /Type /Pages /Kids [ "+pagesData.map((_,i)=>(3+i*3)+" 0 R").join(" ")+" ] /Count "+pagesData.length+" >>");
 pagesData.forEach((page,i)=>{
  const ID=3+i*3, CONTENT=ID+1, IMG=ID+2, jpeg=page.jpeg;
  const scale=Math.min((PW-46)/page.width,(PH-46)/page.height);
  const dw=page.width*scale,dh=page.height*scale,x=(PW-dw)/2,y=(PH-dh)/2;
  const commands="q\n"+[dw,0,0,dh,x,y].map(n=>n.toFixed(3)).join(" ")+" cm\n/Im0 Do\nQ\n";
  obj(ID,"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 "+PW+" "+PH+"] /Resources << /XObject << /Im0 "+IMG+" 0 R >> >> /Contents "+CONTENT+" 0 R >>");
  const byteCommands=enc.encode(commands);
  offset[CONTENT]=length;write(CONTENT+" 0 obj\n<< /Length "+byteCommands.length+" >>\nstream\n");write(byteCommands);write("endstream\nendobj\n");
  offset[IMG]=length;write(IMG+" 0 obj\n<< /Type /XObject /Subtype /Image /Width "+page.width+" /Height "+page.height+" /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length "+jpeg.length+" >>\nstream\n");
  write(jpeg);write("\nendstream\nendobj\n");
 });
 const end=length;const total=2+pagesData.length*3;
 write("xref\n0 "+(total+1)+"\n0000000000 65535 f \n");
 for(let i=1;i<=total;i++)write(String(offset[i]).padStart(10,"0")+" 00000 n \n");
 write("trailer\n<< /Size "+(total+1)+" /Root 1 0 R >>\nstartxref\n"+end+"\n%%EOF\n");
 return new Blob(pieces,{type:"application/pdf"});
}
async function setBusy(flag){
 busy=flag;$("wr-download-pdf").disabled=flag||!pages.length;$("wr-download-png").disabled=flag||!pages.length;
 $("wr-progress").hidden=!flag;
}
$("wr-download-pdf").onclick=async()=>{
 if(!pages.length||busy)return;
 await setBusy(true);
 try{
  const result=[];
  for(let i=0;i<pages.length;i++){
   say("Preparing PDF page "+(i+1)+" of "+pages.length+"…");
   $("wr-progress").value=(i/pages.length)*100;
   await yieldBrowser();
   const c=processing(pages[i],Number($("wr-quality").value)).canvas;
   result.push({jpeg:toJpegBytes(c),width:c.width,height:c.height});
  }
  const blob=buildPdf(result,$("wr-paper").value);
  download(blob,"paksights-restored-worksheets.pdf");say("PDF downloaded: "+pages.length+" page(s).");
 }catch(e){say("PDF export failed: "+e.message,true)}
 finally{$("wr-progress").value=0;await setBusy(false)}
};
$("wr-download-png").onclick=async()=>{
 const p=current();if(!p||busy)return;
 await setBusy(true);say("Preparing a high-quality PNG…");
 try{
  await yieldBrowser();
  const c=processing(p,Number($("wr-quality").value)).canvas;
  const blob=await new Promise(r=>c.toBlob(r,"image/png"));
  if(!blob)throw Error("PNG encoding failed");
  download(blob,"paksights-restored-page-"+(selected+1)+".png");say("PNG downloaded.");
 }catch(e){say("PNG export failed: "+e.message,true)}
 finally{await setBusy(false)}
};
drawList();say("Choose one or more worksheet photos to begin.");
})();
