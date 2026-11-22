(()=>{
'use strict';
/*
  Puter.js image-editing layer for PakSights (2026-11-22)
  - REAL hosted image-to-image using a signed-in visitor's Puter account.
  - Site owner never provides a provider API key or pays for requests.
  - Each visitor starts with their own free allowance; usage beyond it
    may require payment to Puter, by the visitor's choice.
  - User's photo is sent ONLY on explicit click of cloud generation.
  - No image, prompt or user identity stored in PakSights.
  Docs: https://docs.puter.com/AI/txt2img/
*/
const id=x=>document.getElementById(x);
const submit=id('portrait-generate');
if(!submit)return;
const photo=id('portrait-upload-preview'),userFile=id('portrait-file'),consent=id('portrait-consent');
const notes=id('portrait-notes'),status=id('portrait-service-status'),err=id('portrait-error');
const wait=id('portrait-progress'),result=id('portrait-result'),image=id('portrait-result-image');
const empty=id('portrait-stage-empty'),tools=id('portrait-result-tools'),download=id('portrait-download');
const local=id('portrait-local-generate'),imageLabel=result?.querySelector('span');
const size=()=>document.querySelector('input[name="portrait-frame"]:checked')?.value||'portrait';
const picked=()=>document.querySelector('.portrait-preset[aria-pressed="true"]')?.dataset.style||'sunset-poster';
const scenes={
 'sunset-poster':'a dazzling tropical city at pink-gold sunset, palm-lined boulevards, glossy convertible, warm sunset and pastel skies',
 'neon-nights':'an electric neon coastal city at night with pink and cyan light, wet streets, colorful hotels and palm trees',
 'beach-days':'sunny turquoise beach beside pastel art-deco hotels, lush palms, warm daytime atmosphere and sea breeze',
 'street-racer':'a vibrant coastal city street after dark, tasteful sports car, glossy road reflections, colorful racing-culture mood',
 'coastal-keys':'tropical blue water, mangrove islands, distant causeway bridge and adventurous coastal sunshine',
 'wanted-noir':'moody cinematic crime-drama poster environment, dark navy street, warm orange rim light and textured film-noir atmosphere'
};
const ratios={portrait:{w:4,h:5},story:{w:9,h:16},square:{w:1,h:1},landscape:{w:16,h:9}};
let busy=false,lastOutput='',generationCount=0;
function update(text,level='neutral'){
 status.textContent=text;status.className='portrait-service-status '+(level==='bad'?'portrait-service-paused':level==='ok'?'portrait-service-ready':'portrait-service-unknown');
}
function fail(text){err.hidden=false;err.textContent=text;wait.setAttribute('aria-hidden','true');update('You can try cloud AI again or use the free on-device alternative below.','bad');}
function promptFor(style,form){
 let p='Image edit request using the attached photograph as identity reference. '
 +'Transform the person into a completely NEW original illustrated protagonist for a polished tropical open-world crime videogame character poster. '
 +'Preserve this very same recognizable face with the same facial structure, eyes, skin tone, age, hair, facial hair and glasses, if present. Do not substitute another model or celebrity. '
 +'Premium semi-realistic illustrated key art, carefully rendered face, controlled graphic ink contours, beautiful expressive lighting, mature creative direction. '
 +'Place the character in '+scenes[style]+'. '
 +'Pose: natural confident waist-up character, face sharply visible in foreground, stylish appropriate casual clothing. '
 +'The portrait should resemble authored professional key art rather than a photo filter, pasted cut-out, or screenshot. '
 +'Avoid excessive color tint on skin. Avoid any existing game character, violence, guns, trademarks, logos, headlines, watermarks or visible text. '
 +'Composition: '+({portrait:'4:5 vertical poster',story:'9:16 social story',square:'square profile portrait',landscape:'16:9 landscape cinematic poster'}[form])+'.';
 const extra=notes?.value?.trim()?.slice(0,180);
 if(extra)p+=' Additional creative preferences: '+extra+'.';
 return p;
}
function readable(e){
 const message=String(e?.message||e?.msg||e?.error||e||'').slice(0,450);
 if(/balance|credit|budget|quota|payment|insufficient|exceeded|limit/i.test(message))
   return 'Your free Puter AI allowance may have run out. Do not purchase credits unless you choose to. Try the no-account local portrait mode below.';
 if(/auth|login|sign.?in|user|popup|closed|permission|consent/i.test(message))
   return 'Puter sign-in was cancelled or blocked. Allow the Puter sign-in popup if you want to use cloud AI, or use the on-device option.';
 if(/model|unavailable|unsupported|503|overloaded|429|too many|timed out/i.test(message))
   return 'The cloud image-editing service is currently unavailable or busy. Try again later or use the local option.';
 return 'Cloud image editing could not finish. Try another photo or the local option. '+(message?'Details: '+message:'');
}
function renderCloud(output,style){
 const src=output?.src||output?.url||(typeof output==='string'?output:'');
 if(typeof src!=='string'||!(src.startsWith('data:image/')||src.startsWith('https://')||src.startsWith('blob:')))
   throw Error('Puter did not return an image that can be downloaded.');
 lastOutput=src;image.src=src;
 download.href=src;download.download='paksights-cloud-'+style+'-'+Date.now()+'.png';
 if(imageLabel)imageLabel.textContent='GENERATIVE AI CHARACTER ART · VIA PUTER · NOT OFFICIAL GAMEPLAY';
 empty.hidden=true;result.hidden=false;tools.hidden=false;
 result.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});
 update('Generated with genuine cloud image-editing AI. Your free Puter account allowance was used. Save your portrait before leaving this page.','ok');
}
submit.addEventListener('click',async()=>{
 if(busy)return;
 err.hidden=true;
 if(!userFile?.files?.[0]||photo.hidden||!photo.complete||!photo.src.startsWith('data:image/'))return fail('Choose a clear photo first and let its preview finish loading.');
 if(!consent?.checked)return fail('Please confirm that this photo belongs to you or that you have permission to edit it.');
 if(!window.puter?.ai?.txt2img)return fail('The Puter AI service did not load. Please refresh the page and retry, or use local mode.');
 if(generationCount>=5)return fail('You have made several cloud generations this session. Refresh later or use the local mode to avoid unnecessary usage.');
 busy=true;generationCount++;submit.disabled=true;if(local)local.disabled=true;
 result.hidden=true;tools.hidden=true;empty.hidden=false;
 wait.setAttribute('aria-hidden','false');wait.querySelector('span:last-child').textContent='Connecting to Puter and generating your illustrated portrait…';
 update('Puter may open a sign-in window. The cloud service processes your photo only after you click Generate. Free allowance is limited.');
 try{
   const style=picked(),form=size(),base64=photo.src;
   const opts={model:'gemini-3.1-flash-image-preview',input_images:[base64],quality:'1K',ratio:ratios[form]};
   // Crucially, start the promise within the click handler so Puter can
   // display any needed sign-in popup during the browser user gesture.
   const pending=window.puter.ai.txt2img(promptFor(style,form),opts);
   const edited=await pending;
   renderCloud(edited,style);
 }catch(e){fail(readable(e));}
 finally{busy=false;submit.disabled=false;if(local)local.disabled=false;wait.setAttribute('aria-hidden','true');}
});
// Keep changes to prompts and presets visible to both modes; no hidden
// telemetry and no network requests before the visitor intentionally clicks.
update('REAL CLOUD AI · Free Puter allowance per visitor; sign-in may be required. Nothing is billed to PakSights. If Puter asks for payment, cancel and use the local option.');
})();