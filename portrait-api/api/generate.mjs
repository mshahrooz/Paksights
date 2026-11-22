import { generateText } from 'ai';

/*
 * PakSights AI portrait image-to-image endpoint.
 * Secrets exist only inside Vercel. Uploaded photos are kept in request memory;
 * neither the original photo nor the result is written to a database or disk.
 * Upstream Google / AI Gateway processes the photo under their own policies.
 *
 * Security notes: these in-memory guards are a baseline, NOT a distributed
 * rate limiter. Add Vercel WAF/edge rate limiting before heavily promoting.
 */
export const config = { maxDuration: 60 };
const origins = new Set([
  'https://paksights.com',
  'https://www.paksights.com',
  'https://mshahrooz.github.io',
]);
const presets = Object.freeze({
  'neon-nights':'a rain-washed coastal nightlife boulevard with cyan-and-magenta neon, pink palms, wet reflections and discreet sports cars',
  'sunset-poster':'a vibrant tropical city at golden hour with pastel orange-pink sunset, iconic palms, a glossy classic convertible, painterly skyline and warm dramatic light',
  'beach-days':'a bright turquoise beach, art-deco hotels, gently swaying palm trees and colourful parasols at sunny golden hour',
  'street-racer':'a dramatic downtown car-culture scene with striking streetlights, parked performance cars, glossy asphalt and cinematic perspective',
  'coastal-keys':'a sweeping tropical coastal overlook with bright aquamarine water, mangrove islands, bridge and distant towers',
  'wanted-noir':'a moody fictional crime-film character poster with expressive hard shadows, dark navy palette, vivid coral rim light, stylized city alley and gritty cinematic texture',
});
const frames = Object.freeze({
  portrait:'Vertical 4:5 character poster composition, person large and central, head and shoulders fully inside frame',
  story:'Vertical 9:16 phone-story composition, place person at middle or upper middle with attractive scenery',
  square:'Square 1:1 profile-photo composition, central head/shoulders and clean readable background',
  landscape:'Wide 16:9 cinematic landscape poster, place person in left/central third with rich environment',
});
const attempts = new Map();
let active = 0;
const WINDOW = 24 * 3600_000, MAX_PER_IP = 3, MAX_ACTIVE = 2;
function respond(res,status,obj) {
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store, private');
  return res.status(status).json(obj);
}
function trimRecords(now){
  for(const [ip,state] of attempts) if(now-state.since > WINDOW) attempts.delete(ip);
  if(attempts.size>15000) attempts.clear();
}
export default async function handler(req,res) {
  const origin=req.headers.origin;
  if(origin && origins.has(origin)){
    res.setHeader('Access-Control-Allow-Origin',origin);
    res.setHeader('Vary','Origin');
    res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers','Content-Type');
  }
  if(req.method==='OPTIONS'){
    return origin && origins.has(origin) ? res.status(204).end() : respond(res,403,{error:'This origin is not allowed.'});
  }
  if(req.method!=='POST') return respond(res,405,{error:'Use POST with a portrait photo.'});
  if(!origin || !origins.has(origin)) return respond(res,403,{error:'Open the tool from PakSights.com.'});
  const rawlen=Number(req.headers['content-length']||0);
  if(rawlen > 3_000_000) return respond(res,413,{error:'Photo is too large. Please use a smaller photo.'});
  const token=process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || req.headers['x-vercel-oidc-token'];
  if(!token)return respond(res,503,{error:'AI service has not yet been enabled by the site owner. The prompt-export option is available meanwhile.'});
  if(active>=MAX_ACTIVE) return respond(res,429,{error:'The generator is busy. Please retry shortly.'});
  const body=req.body && typeof req.body==='object' ? req.body : {};
  if(body.consent!==true)return respond(res,400,{error:'Confirm you own this photograph or have permission to use it.'});
  const style=presets[body.style] ? body.style:'sunset-poster';
  const frame=frames[body.frame] ? body.frame:'portrait';
  const notes=typeof body.notes==='string'?body.notes.slice(0,180).replace(/[<>]/g,''):'';
  const photo=body.photo;
  if(typeof photo!=='string'||!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(photo)){
    return respond(res,400,{error:'Please upload a valid JPG, PNG or WebP photo.'});
  }
  const [,mime,data]=photo.match(/^data:(image\/(?:jpeg|png|webp));base64,(.*)$/);
  if(data.length>2_700_000)return respond(res,413,{error:'Image upload is too large. Please try a smaller photo.'});
  const binary=Buffer.from(data,'base64');
  if(binary.length>1_900_000||binary.length<1024)return respond(res,413,{error:'Photo size is outside the supported range (1KB–1.9MB).'});
  const now=Date.now();
  if(attempts.size>500)trimRecords(now);
  const ip=String(req.headers['x-real-ip']||req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].slice(0,80);
  let state=attempts.get(ip);
  if(!state||now-state.since>WINDOW) state={since:now,count:0};
  if(state.count>=MAX_PER_IP)return respond(res,429,{error:'Daily demo limit reached. You can still copy the prompt and generate in ChatGPT or Gemini.'});
  attempts.set(ip,state);
  state.count++;
  active++;
  try{
    const instruction=[
      'Create exactly ONE new high-quality original illustrated character portrait based on the attached reference photo.',
      'This is a dramatic, tropical open-world crime-fiction videogame editorial illustration, evocative of late-2020s neon coastal nightlife;',
      'not a screenshot, no game logo, no trademarked title, no existing game characters, no watermark, no on-image text.',
      'Faithfully preserve the same individual and face identity from the uploaded photo: facial structure, skin tone, eye shape, hairline, hairstyle,',
      'facial hair if any, eyewear if any, and overall recognizable likeness. Keep the pose and age appropriate.',
      'Style: premium semi-realistic painterly character key art, expressive fine outlines, luminous color grading, cinematic ambient light, sharp detailed eyes.',
      'Scene:',presets[style]+'.',
      'Composition:',frames[frame]+'.',
      'Outfit: tasteful casual streetwear adapted to the scene. Do not introduce violence or nudity.',
      notes?'Visitor customization: '+notes+'.':'',
      'Return the rendered image, not a description.'
    ].filter(Boolean).join(' ');
    const result=await generateText({
      model:'google/gemini-3.1-flash-image',
      prompt:[{role:'user',content:[
        {type:'text',text:instruction},
        {type:'image',image:binary,mediaType:mime},
      ]}],
      providerOptions:{google:{responseModalities:['TEXT','IMAGE']}},
      maxOutputTokens:2048,
      abortSignal:AbortSignal.timeout(55_000),
    });
    const file=(result.files||[]).find(f=>f.mediaType?.startsWith('image/'))||
      (result.content||[]).filter(x=>x.type==='file'&&x.file?.mediaType?.startsWith('image/')).map(x=>x.file)[0];
    if(!file)return respond(res,502,{error:'The AI did not return an image. Try another photo or preset.'});
    const outMime=file.mediaType||'image/png';
    const output=file.base64||(file.uint8Array?Buffer.from(file.uint8Array).toString('base64'):null);
    if(!output)return respond(res,502,{error:'The image provider returned an unreadable result.'});
    return respond(res,200,{image:'data:'+outMime+';base64,'+output,style,frame,notice:'Original AI-generated fan art, not GTA VI gameplay.'});
  }catch(err){
    const message=String(err?.message||'');
    if(/credit|quota|budget|balance|payment/i.test(message))
      return respond(res,503,{error:'AI generation credits are currently unavailable. Use the free prompt export below.'});
    if(/abort|timed out|timeout/i.test(message))
      return respond(res,504,{error:'Image generation took too long. Please try again.'});
    if(/rate limit|429/i.test(message))
      return respond(res,429,{error:'The image service is busy. Please try again later.'});
    console.error('AI request failed:',String(err?.name||'GatewayError'),String(err?.statusCode||err?.status||'')); // no photo, prompt or response logged
    return respond(res,502,{error:'The image service could not complete this request. Please try again or use prompt export.'});
  }finally{active--;}
}
