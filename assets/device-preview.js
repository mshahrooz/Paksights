/* PakSights Device Preview · browser-only viewport testing */
(()=>{
"use strict";
const $=id=>document.getElementById(id),app=$("dp-app");if(!app)return;
const PRESETS=[
["iphone-se","phone","Compact iPhone",375,667],["iphone-14","phone","iPhone 14",390,844],
["iphone-15","phone","iPhone 15 Pro",393,852],["iphone-16","phone","iPhone 16 Pro",402,874],
["iphone-max","phone","Large iPhone",440,956],["galaxy","phone","Galaxy S",360,780],
["galaxy-plus","phone","Galaxy Plus",384,854],["galaxy-ultra","phone","Galaxy Ultra",412,915],
["pixel","phone","Google Pixel",412,915],["fold","phone","Foldable cover",280,653],
["small-phone","phone","Small Android",320,568],["standard-phone","phone","Standard phone",360,800],
["ipad-mini","tablet","iPad mini",768,1024],["ipad-air","tablet","iPad Air",820,1180],
["ipad-pro","tablet","iPad Pro 11-inch",834,1194],["large-ipad","tablet","Large iPad Pro",1024,1366],
["android-tablet","tablet","Android tablet",800,1280],["tab-landscape","tablet","Tablet landscape",1180,820],
["laptop-1280","laptop","Small laptop",1280,800],["laptop-1366","laptop","Laptop 1366",1366,768],
["laptop-1440","laptop","Laptop 1440",1440,900],["laptop-1536","laptop","Laptop 1536",1536,960],
["desktop-hd","desktop","Desktop HD",1600,900],["desktop-fhd","desktop","Full HD",1920,1080],
["desktop-qhd","desktop","QHD desktop",2560,1440],["desktop-ultra","desktop","Ultrawide",3440,1440]
].map(([id,cat,name,w,h])=>({id,cat,name,w,h}));
const demo='<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}body{margin:0;color:#1e293b;background:#f8faf9;font-family:Arial,sans-serif}header{display:flex;align-items:center;justify-content:space-between;background:white;padding:20px 5%;border-bottom:1px solid #e2e8f0}header strong{font-size:24px;color:#16695e}nav{display:flex;gap:24px;font-size:13px;color:#64748b;font-weight:bold}.hero{max-width:1160px;display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:36px;margin:auto;padding:65px 5%}.tag{color:#0f766e;font-size:11px;font-weight:bold;letter-spacing:2px}.hero h1{font-size:clamp(31px,4.6vw,66px);line-height:1.06;letter-spacing:-1px;margin:13px 0}.hero p{color:#64748b;line-height:1.75}.button{display:inline-block;padding:13px 22px;background:#0f766e;border-radius:7px;color:white;font-size:13px;font-weight:bold}.art{min-height:330px;border-radius:25px;background:linear-gradient(135deg,#a7f3d0,#5eead4);display:grid;place-items:center;font-size:100px;color:#047857}.cards{max-width:1160px;margin:auto;padding:0 5% 50px;display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.cards>div{background:white;padding:23px;border:1px solid #e2e8f0;border-radius:12px}.cards p{color:#64748b;font-size:13px}@media(max-width:700px){nav{display:none}.hero{grid-template-columns:1fr;padding:39px 6%}.hero h1{font-size:34px}.art{min-height:190px;font-size:62px}.cards{grid-template-columns:1fr;padding:0 6% 32px}}</style></head><body><header><strong>northstar.</strong><nav><span>Shop</span><span>Collections</span><span>About</span></nav><span>☰</span></header><section class="hero"><div><span class="tag">RESPONSIVE DEMO</span><h1>Designed for every screen.</h1><p>Switch between phones, tablets and desktops in PakSights. The page rearranges itself using ordinary CSS media queries.</p><span class="button">Explore the collection →</span></div><div class="art">✦</div></section><section class="cards"><div><strong>Thoughtful layouts</strong><p>Flexible content on every screen.</p></div><div><strong>Easy reading</strong><p>Spacing adapts automatically.</p></div><div><strong>Responsive by design</strong><p>Media queries change the layout.</p></div></section></body></html>';
const store=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch(e){}};
const read=(key,fallback)=>{try{const x=JSON.parse(localStorage.getItem(key)||"null");return x===null?fallback:x}catch(e){return fallback}};
let custom=read("ps_device_custom",[]);
if(!Array.isArray(custom))custom=[];
custom=custom.filter(d=>d&&d.id&&d.name&&Number.isFinite(d.w)&&Number.isFinite(d.h)).slice(0,12);
let recent=read("ps_device_recent",[]);
if(!Array.isArray(recent))recent=[];
const all=()=>[...PRESETS,...custom];
const device=id=>all().find(d=>d.id===id)||PRESETS[0];
let state={source:"demo",url:"",html:"",allowJs:false,mode:"single",single:"iphone-16",
 compare:["iphone-14","ipad-air","laptop-1366"],rotation:{},zoom:"fit",cat:"all",search:""};
let frames=[],syncTimer=0;
function report(msg,kind="neutral"){$("dp-status").textContent=msg;$("dp-status").dataset.kind=kind}
function normalize(raw){
 let x=String(raw||"").trim();
 if(!x)throw Error("Enter a website address to preview.");
 if(!/^https?:\/\//i.test(x))x="https://"+x;
 let u;try{u=new URL(x)}catch(e){throw Error("That address is not valid. Try example.com.")}
 if(!["https:","http:"].includes(u.protocol)||!u.hostname)throw Error("Only HTTP and HTTPS website addresses are supported.");
 if(u.username||u.password)throw Error("Remove usernames and passwords from the URL.");
 return u.href;
}
function showSource(html){
 $("dp-url-panel").hidden=html;$("dp-html-panel").hidden=!html;
 $("dp-source-url").setAttribute("aria-pressed",String(!html));
 $("dp-source-html").setAttribute("aria-pressed",String(html));
}
function sourceStatus(){
 $("dp-target-label").textContent=state.source==="demo"?"Interactive demo":state.source==="html"?"Your local HTML":new URL(state.url).host;
 $("dp-open").disabled=state.source!=="url";
}
function loadUrl(){
 try{
  const url=normalize($("dp-url").value);
  state.url=url;state.source="url";
  recent=[url,...recent.filter(v=>v!==url)].slice(0,6);store("ps_device_recent",recent);renderRecent();
  build();sourceStatus();
  report(url.startsWith("http:")&&location.protocol==="https:"?"HTTP may be blocked as mixed content here. Try HTTPS or open the website directly.":"Preview requested. If the screen stays blank, the website may block embedding.","warn");
 }catch(e){report(e.message,"error")}
}
function loadHtml(){
 const html=$("dp-html-input").value;if(!html.trim()){report("Paste HTML or select a local .html file.","error");return}
 if(html.length>1500000){report("Your HTML exceeds the 1.5 MB limit.","error");return}
 state.source="html";state.html=html;state.allowJs=$("dp-allow-js").checked;
 build();sourceStatus();report("Local HTML preview loaded. The file has not been uploaded.","success");
}
function renderRecent(){
 const el=$("dp-recent");el.replaceChildren();$("dp-recent-wrap").hidden=!recent.length;
 recent.forEach(u=>{const b=document.createElement("button");b.type="button";b.className="dp-recent";b.textContent=new URL(u).host;b.title=u;b.onclick=()=>{$("dp-url").value=u;loadUrl()};el.append(b)});
}
function renderPresets(){
 const el=$("dp-presets");el.replaceChildren();
 const available=all().filter(d=>(state.cat==="all"||d.cat===state.cat)&&
 (!state.search||(d.name+" "+d.cat+" "+d.w+" "+d.h).toLowerCase().includes(state.search)));
 $("dp-device-count").textContent=available.length+" sizes";
 available.forEach(d=>{
  const chosen=state.mode==="single"?state.single===d.id:state.compare.includes(d.id);
  const b=document.createElement("button");b.type="button";b.className="dp-preset"+(chosen?" active":"");
  b.setAttribute("aria-pressed",String(chosen));
  const icon=document.createElement("span");icon.className="dp-preset-icon";icon.textContent={phone:"▯",tablet:"▢",laptop:"▱",desktop:"▭"}[d.cat];
  const text=document.createElement("span");text.className="dp-preset-body";
  const name=document.createElement("strong");name.textContent=d.name;
  const size=document.createElement("small");size.textContent=d.w+" × "+d.h+" CSS px";text.append(name,size);
  const tick=document.createElement("span");tick.className="dp-preset-tick";tick.textContent=chosen?"✓":"";
  b.append(icon,text,tick);
  b.onclick=()=>{
   if(state.mode==="single"){state.single=d.id;state.rotation.single=false}
   else if(state.compare.includes(d.id)){if(state.compare.length===1){report("Select at least one comparison device.","warn");return}state.compare=state.compare.filter(x=>x!==d.id)}
   else if(state.compare.length>=4){report("Compare up to four devices at once. Remove one to add another.","warn");return}
   else state.compare.push(d.id);
   renderPresets();build();
  };
  el.append(b);
 });
 if(!available.length){const p=document.createElement("p");p.textContent="No matching devices.";p.className="dp-no-results";el.append(p)}
 $("dp-cats").querySelectorAll("[data-cat]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.cat===state.cat)));
}
function setMode(mode){
 state.mode=mode;
 $("dp-view-single").setAttribute("aria-pressed",String(mode==="single"));
 $("dp-view-compare").setAttribute("aria-pressed",String(mode==="compare"));
 $("dp-preview-grid").classList.toggle("compare",mode==="compare");
 $("dp-mode-label").textContent=mode==="single"?"One viewport":"Compare up to 4 viewports";
 renderPresets();build();
}
const button=(txt,title,fn)=>{
 const b=document.createElement("button");b.type="button";b.textContent=txt;b.title=title;b.setAttribute("aria-label",title);b.onclick=fn;return b;
};
function build(){
 const grid=$("dp-preview-grid");grid.replaceChildren();frames=[];
 const ids=state.mode==="single"?[state.single]:state.compare;
 ids.forEach((id,i)=>{
  const slot=state.mode==="single"?"single":String(i),d=device(id),rot=!!state.rotation[slot];
  const w=rot?d.h:d.w,h=rot?d.w:d.h,kind=d.cat,chrome=kind==="phone"?22:kind==="tablet"?19:31,pad=kind==="phone"?12:kind==="tablet"?13:9,foot=kind==="phone"?17:kind==="tablet"?14:9;
  const outerW=w+pad*2,outerH=h+chrome+foot;
  const card=document.createElement("section");card.className="dp-preview-card type-"+kind;
  const heading=document.createElement("div");heading.className="dp-card-head";
  const title=document.createElement("div");title.className="dp-card-title";
  const strong=document.createElement("strong");strong.textContent=d.name;
  const small=document.createElement("span");small.textContent=w+" × "+h+" CSS px";
  title.append(strong,small);
  const actions=document.createElement("div");actions.className="dp-card-actions";
  actions.append(button("↻","Rotate "+d.name,()=>{state.rotation[slot]=!state.rotation[slot];build()}),button("⟳","Reload "+d.name,()=>reload(card)));
  heading.append(title,actions);
  const stage=document.createElement("div");stage.className="dp-stage";
  const wrapper=document.createElement("div");wrapper.className="dp-scale";
  const frame=document.createElement("div");frame.className="dp-frame";
  frame.style.width=outerW+"px";frame.style.height=outerH+"px";
  frame.style.setProperty("--dp-pad",pad+"px");frame.style.setProperty("--dp-chrome",chrome+"px");frame.style.setProperty("--dp-foot",foot+"px");
  const chromeEl=document.createElement("div");chromeEl.className="dp-frame-chrome";chromeEl.textContent=kind==="phone"?"●  ▬  ▮":kind==="tablet"?"●":"● ● ●  preview";
  const iframe=document.createElement("iframe");iframe.title=d.name+" website preview";iframe.className="dp-iframe";
  iframe.width=w;iframe.height=h;iframe.style.width=w+"px";iframe.style.height=h+"px";iframe.style.top=chrome+"px";iframe.style.left=pad+"px";
  iframe.referrerPolicy="no-referrer";
  iframe.setAttribute("sandbox",state.source==="url"?"allow-scripts allow-forms allow-same-origin allow-popups":"allow-forms"+(state.allowJs?" allow-scripts":""));
  const bottom=document.createElement("div");bottom.className="dp-frame-bottom";
  frame.append(chromeEl,iframe,bottom);wrapper.append(frame);stage.append(wrapper);
  const footer=document.createElement("div");footer.className="dp-card-footer";
  const label=document.createElement("span");label.textContent=w+" × "+h;
  const open=button("Open ↗","Open original website",()=>openUrl());open.disabled=state.source!=="url";
  footer.append(label,open);card.append(heading,stage,footer);grid.append(card);
  frames.push({card,stage,wrapper,frame,iframe,outerW,outerH,w,h,slot});
  if(state.source==="url")iframe.src=state.url;else iframe.srcdoc=state.source==="html"?state.html:demo;
 });
 requestAnimationFrame(scale);
}
function reload(card){
 const item=frames.find(f=>f.card===card);if(!item)return;
 if(state.source==="url"){item.iframe.removeAttribute("src");setTimeout(()=>{if(item.iframe.isConnected)item.iframe.src=state.url},0)}
 else item.iframe.srcdoc=state.source==="html"?state.html:demo;
 report("Preview refreshed. The website's embedding rules still apply.");
}
function scale(){
 for(const v of frames){
  let zoom;
  if(state.zoom==="fit")zoom=Math.min(1,Math.max(230,v.stage.clientWidth-26)/v.outerW,(state.mode==="single"?720:480)/v.outerH);
  else zoom=Number(state.zoom);
  zoom=Math.max(.13,Math.min(1.5,zoom||1));
  v.wrapper.style.width=(v.outerW*zoom)+"px";v.wrapper.style.height=(v.outerH*zoom)+"px";
  v.frame.style.transform="scale("+zoom+")";
  v.card.querySelector(".dp-card-footer span").textContent=v.w+" × "+v.h+" · "+Math.round(zoom*100)+"%";
 }
}
function rotateAll(){
 if(state.mode==="single")state.rotation.single=!state.rotation.single;
 else state.compare.forEach((_,i)=>state.rotation[String(i)]=!state.rotation[String(i)]);
 build();
}
function openUrl(){if(state.source!=="url")return;window.open(state.url,"_blank","noopener,noreferrer")}
function customDims(save){
 const w=Number($("dp-width").value),h=Number($("dp-height").value);
 if(!Number.isInteger(w)||!Number.isInteger(h)||w<240||w>4000||h<240||h>3000){report("Width must be 240–4000 and height 240–3000 CSS pixels.","error");return}
 const id=save?"saved-"+Date.now().toString(36):"custom-temp";
 const name=save?($("dp-device-name").value.trim().slice(0,35)||"My device "+w+" × "+h):"Custom "+w+" × "+h;
 const d={id,name,w,h,cat:w>=1200?"desktop":w>=700?"tablet":"phone"};
 if(save){custom=custom.filter(x=>x.id!=="custom-temp").slice(0,11);custom.push(d);store("ps_device_custom",custom);}
 else {custom=custom.filter(x=>x.id!=="custom-temp");custom.unshift(d)}
 if(state.mode==="single"){state.single=id;state.rotation.single=false}
 else{const old=state.compare.indexOf("custom-temp");if(old>=0)state.compare[old]=id;else if(state.compare.length>=4)state.compare[3]=id;else state.compare.push(id)}
 state.search="";$("dp-search").value="";state.cat="all";
 renderPresets();build();report(save?"Your custom device was saved in this browser.":"Custom size applied.","success");
}
function share(){
 const u=new URL(location.href);u.search="";
 if(state.source==="url")u.searchParams.set("url",state.url);
 u.searchParams.set("view",state.mode);u.searchParams.set("device",state.single);
 u.searchParams.set("compare",state.compare.join(","));u.searchParams.set("zoom",state.zoom);
 const text=u.href;
 const fallback=()=>{const a=document.createElement("textarea");a.value=text;a.style.position="fixed";a.style.opacity="0";document.body.append(a);a.select();const ok=document.execCommand("copy");a.remove();if(!ok)throw Error("Copy denied")};
 Promise.resolve(navigator.clipboard?.writeText?navigator.clipboard.writeText(text):Promise.reject()).catch(fallback).then(()=>{
  report(state.source==="html"?"Share link copied (local HTML is excluded for privacy).":"Shareable preview link copied.","success")
 }).catch(()=>report("Copy was blocked. You can copy the browser address manually.","error"));
}
function initFromLink(){
 const p=new URLSearchParams(location.search);
 if(all().some(x=>x.id===p.get("device")))state.single=p.get("device");
 if(p.get("view")==="compare")state.mode="compare";
 if(p.has("compare")){
  const ids=p.get("compare").split(",").filter((x,i,a)=>all().some(d=>d.id===x)&&a.indexOf(x)===i).slice(0,4);
  if(ids.length)state.compare=ids;
 }
 if(["fit","0.5","0.75","1","1.25"].includes(p.get("zoom")))state.zoom=p.get("zoom");
 if(p.has("url")){try{state.url=normalize(p.get("url"));state.source="url";$("dp-url").value=state.url}catch(e){}}
}
function init(){
 initFromLink();
 $("dp-url-form").onsubmit=e=>{e.preventDefault();loadUrl()};
 $("dp-source-url").onclick=()=>showSource(false);
 $("dp-source-html").onclick=()=>showSource(true);
 $("dp-html-load").onclick=loadHtml;
 $("dp-demo").onclick=()=>{state.source="demo";state.html="";state.url="";showSource(false);build();sourceStatus();report("Demo loaded. Switch device sizes to test responsive behavior.","success")};
 $("dp-html-file").onchange=async e=>{const file=e.target.files?.[0];if(!file)return;
  if(file.size>1500000){report("File too large (1.5 MB maximum).","error");return}
  $("dp-html-input").value=await file.text();loadHtml();e.target.value=""};
 $("dp-allow-js").onchange=e=>{state.allowJs=e.target.checked;if(state.source==="html")build()};
 $("dp-cats").onclick=e=>{const b=e.target.closest("[data-cat]");if(!b)return;state.cat=b.dataset.cat;renderPresets()};
 $("dp-search").oninput=e=>{state.search=e.target.value.toLowerCase().trim();renderPresets()};
 $("dp-view-single").onclick=()=>setMode("single");$("dp-view-compare").onclick=()=>setMode("compare");
 $("dp-rotate").onclick=rotateAll;
 $("dp-reload").onclick=()=>frames.forEach(v=>reload(v.card));
 $("dp-zoom").onchange=e=>{state.zoom=e.target.value;scale()};
 $("dp-apply").onclick=()=>customDims(false);$("dp-save").onclick=()=>customDims(true);
 $("dp-open").onclick=openUrl;$("dp-share").onclick=share;
 $("dp-shortcuts").onclick=()=>{$("dp-shortcut-panel").hidden=!$("dp-shortcut-panel").hidden};
 window.addEventListener("resize",()=>requestAnimationFrame(scale));
 if("ResizeObserver"in window)new ResizeObserver(()=>requestAnimationFrame(scale)).observe($("dp-preview-grid"));
 document.addEventListener("keydown",e=>{if(e.target.closest("input,textarea,select")||e.ctrlKey||e.altKey||e.metaKey)return;
  if(e.key.toLowerCase()==="r")rotateAll();
  if(e.key.toLowerCase()==="g")setMode(state.mode==="single"?"compare":"single");
 });
 state.mode=state.mode==="compare"?"single":"compare";
 setMode(state.mode==="compare"?"single":"compare");
 $("dp-zoom").value=state.zoom;renderRecent();sourceStatus();
 report(state.source==="url"?"URL preview requested. Some websites restrict embedding.":"Try the interactive demo, or paste a URL and press Preview.");
}
init();
})();