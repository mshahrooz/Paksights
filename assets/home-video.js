/*
 * GTA VI official launch trailer is embedded from Rockstar's YouTube channel.
 * Autoplay is muted. On reduced motion / data saver, load only on user request.
 * Video controls interact through the documented YouTube iframe postMessage API.
 */
(()=>{
 'use strict';
 const root=document.getElementById('hp-video-hero');
 if(!root)return;
 const host=document.getElementById('hp-motion-player'),play=document.getElementById('hp-motion-play'),sound=document.getElementById('hp-motion-sound');
 const ytId=root.dataset.videoId||'rz1B4B2yBZY';
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true;
 const saveData=navigator.connection?.saveData===true;
 let frame=null,ready=false,playing=false,muted=true,userPaused=false,visible=true;
 const origins=new Set(['https://www.youtube-nocookie.com','https://www.youtube.com','https://youtube.com']);
 function command(func,args=[]){try{frame?.contentWindow?.postMessage(JSON.stringify({event:'command',func,args}),'*')}catch(e){}}
 function draw(){
   root.classList.toggle('hp-motion-playing',playing);
   play.setAttribute('aria-label',playing?'Pause background trailer':'Play background trailer');
   play.innerHTML=(playing?'❚❚':'▶')+' <span class="hp-motion-play-label">'+(playing?'Pause':'Play')+'</span>';
   sound.disabled=!ready;
   sound.setAttribute('aria-label',muted?'Turn on trailer sound':'Mute trailer');
   sound.innerHTML='♪ <span class="hp-motion-sound-label">'+(muted?'Sound off':'Sound on')+'</span>';
 }
 function mount(){
   if(frame)return;
   frame=document.createElement('iframe');
   frame.title='Grand Theft Auto VI official launch trailer by Rockstar Games (muted background video)';
   frame.id='hp-motion-youtube';
   frame.setAttribute('allow','autoplay; encrypted-media; picture-in-picture');
   frame.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
   frame.setAttribute('tabindex','-1');
   const query=new URLSearchParams({autoplay:'1',mute:'1',playsinline:'1',controls:'0',loop:'1',playlist:ytId,enablejsapi:'1',origin:location.origin,rel:'0',iv_load_policy:'3',disablekb:'1',fs:'0'});
   frame.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(ytId)+'?'+query.toString();
   frame.addEventListener('load',()=>command('listening'));
   host.appendChild(frame);
 }
 window.addEventListener('message',event=>{
  if(!frame||event.source!==frame.contentWindow||!origins.has(event.origin))return;
  let m;try{m=typeof event.data==='string'?JSON.parse(event.data):event.data}catch(e){return}
  if(m?.event==='onReady'){
    ready=true;command('mute');
    if(!userPaused&&visible&&!document.hidden)command('playVideo');
  }
  if(m?.event==='onStateChange'){
    const state=typeof m.info==='number'?m.info:m.info?.playerState;
    if(state===1)playing=true;
    if(state===0||state===2||state===5)playing=false;
  }
  if(m?.event==='onError')playing=false;
  draw();
 });
 play.addEventListener('click',()=>{
  if(!frame){userPaused=false;mount();return}
  if(playing){userPaused=true;playing=false;command('pauseVideo')}
  else{userPaused=false;command('playVideo')}
  draw();
 });
 sound.addEventListener('click',()=>{
   if(!ready)return;muted=!muted;command(muted?'mute':'unMute');if(!muted)command('setVolume',[65]);draw();
 });
 if('IntersectionObserver' in window){
  const obs=new IntersectionObserver(entries=>{
   visible=entries.some(e=>e.isIntersecting);
   if(!ready)return;
   if(!visible){playing=false;command('pauseVideo')}
   else if(!userPaused&&!document.hidden&&!reduced)command('playVideo');
   draw();
  },{threshold:.05});obs.observe(root);
 }
 document.addEventListener('visibilitychange',()=>{
  if(!ready)return;
  if(document.hidden){playing=false;command('pauseVideo')}
  else if(!userPaused&&visible&&!reduced)command('playVideo');
  draw();
 },{passive:true});
 draw();
 if(!reduced&&!saveData)mount();
})();