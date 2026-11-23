/*
 * PakSights cinematic GTA VI homepage hero.
 * Official Rockstar Games Launch Trailer (YouTube embed, not rehosted).
 * Muted autoplay only when the browser permits it. Always preserve a still
 * thumbnail, manual playback, and a direct link to the official video.
 */
(()=>{
  'use strict';
  const hero=document.getElementById('hp-video-hero');
  if(!hero)return;
  const host=document.getElementById('hp-motion-player');
  const playButton=document.getElementById('hp-motion-play');
  const soundButton=document.getElementById('hp-motion-sound');
  const id=hero.dataset.videoId||'rz1B4B2yBZY';
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true;
  const saveData=navigator.connection?.saveData===true;
  let player=null,ready=false,playing=false,muted=true,mounted=false;
  let userPaused=false,userRequestedPlayback=false,visible=true,error=false;

  function paint(){
    hero.classList.toggle('hp-motion-playing',playing);
    playButton.setAttribute('aria-label',playing?'Pause background trailer':'Play background trailer');
    playButton.title=playing?'Pause official GTA VI trailer':'Play official GTA VI trailer';
    playButton.innerHTML=(playing?'❚❚':'▶')+' <span class="hp-motion-play-label">'+(playing?'Pause':'Play')+'</span>';
    soundButton.disabled=!ready||error;
    soundButton.setAttribute('aria-label',muted?'Turn on trailer sound':'Mute trailer');
    soundButton.innerHTML='♪ <span class="hp-motion-sound-label">'+(muted?'Sound off':'Sound on')+'</span>';
  }
  function shouldPlay(){return !userPaused && visible && !document.hidden && (!reduced||userRequestedPlayback)}
  function onReady(ev){
    player=ev.target;
    ready=true;
    try{
      const iframe=player.getIframe();
      iframe.title='Official GTA VI launch trailer by Rockstar Games: muted background footage';
      iframe.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
      iframe.setAttribute('tabindex','-1');
      player.mute();
      if(shouldPlay())player.playVideo();
    }catch(e){error=true;}
    paint();
  }
  function onStateChange(ev){
    const states=window.YT?.PlayerState;
    if(ev.data===(states?.PLAYING??1)){
      playing=true;error=false;
      if(!visible||document.hidden||userPaused){
        playing=false;
        try{player.pauseVideo()}catch(_){}
      }
    }else if(ev.data===(states?.PAUSED??2)||ev.data===(states?.ENDED??0)||ev.data===(states?.CUED??5)){
      playing=false;
      if(ev.data===(states?.ENDED??0) && shouldPlay()){
        try{player.playVideo()}catch(_){}
      }
    }
    paint();
  }
  function onError(){error=true;playing=false;paint();}
  function instantiate(){
    if(!window.YT?.Player)return;
    const element=document.createElement('div');
    element.id='hp-motion-yt-inner';
    host.appendChild(element);
    new window.YT.Player(element.id,{
      host:'https://www.youtube-nocookie.com',
      height:'100%',width:'100%',videoId:id,
      playerVars:{
        autoplay:1,mute:1,playsinline:1,controls:0,
        loop:1,playlist:id,rel:0,iv_load_policy:3,fs:0,
        disablekb:1,origin:location.origin
      },
      events:{onReady,onStateChange,onError}
    });
  }
  function loadPlayer(){
    if(mounted)return;
    mounted=true;
    if(window.YT?.Player){instantiate();return;}
    const previous=window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady=()=>{
      if(typeof previous==='function')previous();
      instantiate();
    };
    const script=document.createElement('script');
    script.async=true;
    script.src='https://www.youtube.com/iframe_api';
    script.onerror=()=>{error=true;paint();};
    document.head.appendChild(script);
  }

  playButton.addEventListener('click',()=>{
    if(error&&ready===false){
      // An embedded trailer may be disallowed on some networks. The visible
      // "Watch full trailer" link is always available without this player.
      error=false;
    }
    if(!mounted){userRequestedPlayback=true;userPaused=false;loadPlayer();return;}
    if(!ready)return;
    try{
      if(playing){userPaused=true;userRequestedPlayback=false;playing=false;player.pauseVideo();}
      else{userPaused=false;userRequestedPlayback=true;player.playVideo();}
    }catch(e){error=true;}
    paint();
  });
  soundButton.addEventListener('click',()=>{
    if(!ready||error)return;
    try{
      muted=!muted;
      if(muted)player.mute();
      else{player.unMute();player.setVolume(65);}
    }catch(e){muted=true;}
    paint();
  });
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{
      visible=entries.some(e=>e.isIntersecting);
      if(ready){
        try{
          if(!visible){playing=false;player.pauseVideo();}
          else if(shouldPlay())player.playVideo();
        }catch(e){}
      }
      paint();
    },{threshold:0.06});
    observer.observe(hero);
  }
  document.addEventListener('visibilitychange',()=>{
    if(!ready)return;
    try{
      if(document.hidden){playing=false;player.pauseVideo();}
      else if(shouldPlay())player.playVideo();
    }catch(e){}
    paint();
  },{passive:true});
  paint();
  // Honor motion accessibility and data-saving preferences.
  if(!reduced&&!saveData)loadPlayer();
})();