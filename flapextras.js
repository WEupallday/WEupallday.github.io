/* TheFlap Extras — Share-to-Story, on-demand Translate, compliant Rate/Feedback bonus.
   Self-contained add-on. Web-layer only. Guarded. v1 */
(function(){
  if(window.__flapExtras) return; window.__flapExtras=1;

  /* ---------- shared helpers ---------- */
  function sb(){ return window.sb; }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function toast(msg,ok){
    var t=document.createElement('div');
    t.textContent=msg;
    t.style.cssText='position:fixed;left:50%;bottom:86px;transform:translateX(-50%);z-index:2147483600;background:'+(ok===false?'#b3261e':'#1c1230')+';color:#fff;border:1px solid '+(ok===false?'#ff8a8a':'#7a5cff')+';border-radius:12px;padding:10px 16px;font:600 13px -apple-system,Segoe UI,Roboto,Arial;box-shadow:0 8px 26px rgba(0,0,0,.5);max-width:82%;text-align:center';
    document.body.appendChild(t);
    setTimeout(function(){ t.style.transition='opacity .4s'; t.style.opacity='0'; setTimeout(function(){ t.remove(); },400); }, 2600);
  }

  /* ---------- mood palette for the share card ---------- */
  var MOOD={
    happy:['😊',['#ffd75e','#ff9e00','#ff5e8a']], excited:['🤩',['#ffb14e','#ff5e8a','#a24bff']],
    pumped:['🔥',['#ffb14e','#ff5e8a','#a24bff']], sparkly:['✨',['#a6f0c6','#4fd1c5','#5b8def']],
    flappy:['🥁',['#ff9e00','#ff2e8b','#8a2be2']], hopeful:['🌟',['#a6f0c6','#4fd1c5','#5b8def']],
    funky:['🕺',['#ff9e00','#ff2e8b','#8a2be2']], styling:['😎',['#00c6ff','#0072ff','#00e5c0']],
    victorious:['🏆',['#ffd75e','#ff9e00','#e14e8e']], thinky:['🤔',['#7fdbff','#5b8def','#b06ab3']],
    confused:['😕',['#7fdbff','#5b8def','#b06ab3']], bored:['😩',['#9aa7c7','#6b7aa8','#4a5680']],
    tired:['😪',['#9aa7c7','#6b7aa8','#4a5680']], bleh:['😒',['#9aa7c7','#6b7aa8','#4a5680']],
    zonked:['😴',['#5b6dd8','#7048e8','#3a2b6e']], hangry:['😠',['#ff6a3d','#ff2e8b','#c0392b']],
    sad:['😢',['#5b6dd8','#7048e8','#3a2b6e']], weepy:['😭',['#5b6dd8','#7048e8','#3a2b6e']],
    unhappy:['☹️',['#5b6dd8','#7048e8','#3a2b6e']], uncomfortable:['😬',['#9aa7c7','#6b7aa8','#4a5680']],
    freaking:['😱',['#ff6a3d','#ffb14e','#ff2e8b']], angry:['😡',['#ff6a3d','#ff2e8b','#c0392b']],
    irritated:['😤',['#ff6a3d','#ff2e8b','#c0392b']], impatient:['🙃',['#ffb14e','#ff6a3d','#c0392b']],
    grossed:['🤢',['#a6f0c6','#4fd1c5','#3a7d5f']], evil:['😈',['#8a2be2','#5a2ee0','#3a2b6e']],
    dorky:['🤓',['#7fdbff','#5b8def','#b06ab3']], nxmood:['🥺',['#ffb14e','#ff5e8a','#a24bff']]
  };
  function moodOf(card){
    var e=card.querySelector('.emo'); if(!e) return 'happy';
    var t=e.className.replace('emo','').trim().split(/\s+/)[0];
    return MOOD[t]?t:'happy';
  }
  function readCard(card){
    var pn=card.querySelector('.pname'), mw=card.querySelector('.mword'), st=card.querySelector('.statustxt');
    var av=card.querySelector('.pava img');
    return {
      name:(pn?pn.textContent:'').trim()||'someone',
      moodKey:moodOf(card),
      moodWord:(mw?mw.textContent:'').trim(),
      text:(st?st.textContent:'').trim(),
      avatar:av?av.src:''
    };
  }

  /* ---------- SHARE TO STORY ---------- */
  function drawStory(d, cb){
    var W=1080,H=1920, cv=document.createElement('canvas'); cv.width=W; cv.height=H;
    var x=cv.getContext('2d');
    var m=MOOD[d.moodKey]||MOOD.happy, cols=m[1], emo=m[0];
    // gradient bg
    var g=x.createLinearGradient(0,0,W,H);
    g.addColorStop(0,cols[0]); g.addColorStop(.55,cols[1]); g.addColorStop(1,cols[2]);
    x.fillStyle=g; x.fillRect(0,0,W,H);
    // top light glow
    var rg=x.createRadialGradient(W*0.8,H*0.12,20,W*0.8,H*0.12,W*0.7);
    rg.addColorStop(0,'rgba(255,255,255,.28)'); rg.addColorStop(1,'rgba(255,255,255,0)');
    x.fillStyle=rg; x.fillRect(0,0,W,H);
    function round(cx,cy,w,h,r){ x.beginPath(); x.moveTo(cx+r,cy); x.arcTo(cx+w,cy,cx+w,cy+h,r); x.arcTo(cx+w,cy+h,cx,cy+h,r); x.arcTo(cx,cy+h,cx,cy,r); x.arcTo(cx,cy,cx+w,cy,r); x.closePath(); }
    // brand
    x.textBaseline='alphabetic';
    x.fillStyle='rgba(255,255,255,.95)'; x.font='800 44px -apple-system,Segoe UI,Roboto,Arial';
    x.fillText('🐦 theFLAP', 70, 120);
    // avatar circle
    var acx=W/2, acy=560, ar=120;
    function afterAvatar(){
      // name
      x.textAlign='center'; x.fillStyle='#fff';
      x.font='800 58px -apple-system,Segoe UI,Roboto,Arial';
      x.fillText('@'+d.name, W/2, acy+ar+96);
      // mood emoji big
      x.font='150px -apple-system,Segoe UI,Roboto,Arial';
      x.fillText(emo, W/2, acy+ar+300);
      // "feeling <mood>"
      if(d.moodWord){
        x.font='600 34px -apple-system,Segoe UI,Roboto,Arial'; x.fillStyle='rgba(255,255,255,.85)';
        x.fillText('feeling', W/2, acy+ar+360);
        x.font='800 56px -apple-system,Segoe UI,Roboto,Arial'; x.fillStyle='#fff';
        x.fillText(d.moodWord, W/2, acy+ar+424);
      }
      // text bubble
      if(d.text){
        x.textAlign='left';
        var pad=52, bx=90, bw=W-180, tx=bx+pad, tw=bw-pad*2, ty=acy+ar+520, lh=54;
        x.font='600 40px -apple-system,Segoe UI,Roboto,Arial';
        var words=d.text.split(/\s+/), line='', lines=[];
        for(var i=0;i<words.length;i++){ var test=line?line+' '+words[i]:words[i]; if(x.measureText(test).width>tw && line){ lines.push(line); line=words[i]; } else line=test; if(lines.length>=8){break;} }
        if(line&&lines.length<9) lines.push(line);
        var bh=pad*2+lines.length*lh;
        x.fillStyle='rgba(255,255,255,.95)'; round(bx,ty,bw,bh,34); x.fill();
        x.fillStyle='#211a2e';
        for(var j=0;j<lines.length;j++){ x.fillText(lines[j], tx, ty+pad+28+j*lh); }
      }
      // footer cta
      x.textAlign='center';
      var cw=520, ch=92, cxx=(W-cw)/2, cyy=H-220;
      x.fillStyle='rgba(0,0,0,.28)'; round(cxx,cyy,cw,ch,46); x.fill();
      x.lineWidth=2; x.strokeStyle='rgba(255,255,255,.4)'; round(cxx,cyy,cw,ch,46); x.stroke();
      x.fillStyle='#fff'; x.font='800 38px -apple-system,Segoe UI,Roboto,Arial';
      x.fillText('🐦 Get TheFlap — free', W/2, cyy+58);
      x.font='600 32px -apple-system,Segoe UI,Roboto,Arial'; x.fillStyle='rgba(255,255,255,.9)';
      x.fillText('theflap.app', W/2, H-96);
      cb(cv);
    }
    if(d.avatar){
      var img=new Image(); img.crossOrigin='anonymous';
      img.onload=function(){ try{ x.save(); x.beginPath(); x.arc(acx,acy,ar,0,7); x.closePath(); x.clip();
        var s=Math.min(img.width,img.height), sx=(img.width-s)/2, sy=(img.height-s)/2;
        x.drawImage(img,sx,sy,s,s,acx-ar,acy-ar,ar*2,ar*2); x.restore();
        x.lineWidth=6; x.strokeStyle='rgba(255,255,255,.75)'; x.beginPath(); x.arc(acx,acy,ar,0,7); x.stroke();
        afterAvatar();
      }catch(e){ drawEmojiAvatar(); } };
      img.onerror=function(){ drawEmojiAvatar(); };
      img.src=d.avatar;
    } else drawEmojiAvatar();
    function drawEmojiAvatar(){
      x.fillStyle='rgba(255,255,255,.9)'; x.beginPath(); x.arc(acx,acy,ar,0,7); x.fill();
      x.textAlign='center'; x.font='120px -apple-system,Segoe UI,Roboto,Arial'; x.fillStyle='#222';
      x.fillText(emo, acx, acy+42);
      afterAvatar();
    }
  }
  function shareCard(card){
    var d=readCard(card);
    toast('Building your Story card…');
    drawStory(d, function(cv){
      cv.toBlob(function(blob){
        if(!blob){ toast('Could not render image',false); return; }
        var file=new File([blob],'theflap-story.png',{type:'image/png'});
        var canFiles = navigator.canShare && navigator.canShare({files:[file]});
        if(navigator.share && canFiles){
          navigator.share({ files:[file], title:'TheFlap', text:'My flap on TheFlap 🐦 theflap.app' })
            .catch(function(){});
        } else {
          // desktop / no file-share: download
          var url=URL.createObjectURL(blob), a=document.createElement('a');
          a.href=url; a.download='theflap-story.png'; document.body.appendChild(a); a.click(); a.remove();
          setTimeout(function(){ URL.revokeObjectURL(url); },4000);
          toast('Saved image — post it to your Story!');
        }
      },'image/png');
    });
  }

  /* ---------- TRANSLATE (on-demand, near-zero cost) ---------- */
  var TGT=(navigator.language||'en').slice(0,2).toLowerCase();
  function detectSrc(t){
    if(/[Ѐ-ӿ]/.test(t)) return 'ru';
    if(/[一-鿿]/.test(t)) return 'zh';
    if(/[぀-ヿ]/.test(t)) return 'ja';
    if(/[가-힯]/.test(t)) return 'ko';
    if(/[؀-ۿ]/.test(t)) return 'ar';
    if(/[֐-׿]/.test(t)) return 'he';
    if(/[Ͱ-Ͽ]/.test(t)) return 'el';
    if(/[ऀ-ॿ]/.test(t)) return 'hi';
    if(/[฀-๿]/.test(t)) return 'th';
    var l=t.toLowerCase();
    if(/\b(que|los|las|una|con|para|pero|porque|muy|esto|gracias)\b/.test(l)) return 'es';
    if(/\b(você|não|obrigad|está|isso|muito|porque|também)\b/.test(l)) return 'pt';
    if(/\b(les|des|une|avec|pour|mais|parce|très|merci|bonjour)\b/.test(l)) return 'fr';
    if(/\b(und|nicht|das|ist|mit|für|aber|sehr|danke|guten)\b/.test(l)) return 'de';
    if(/\b(che|non|una|con|però|perché|molto|grazie|sono|questo)\b/.test(l)) return 'it';
    return 'es';
  }
  async function onDeviceTranslate(t, src){
    try{
      var API = self.Translator || (self.translation && self.translation);
      if(self.Translator && self.Translator.create){
        var tr=await self.Translator.create({sourceLanguage:src,targetLanguage:TGT});
        return await tr.translate(t);
      }
      if(self.translation && self.translation.createTranslator){
        var tr2=await self.translation.createTranslator({sourceLanguage:src,targetLanguage:TGT});
        return await tr2.translate(t);
      }
    }catch(e){}
    return null;
  }
  async function myMemory(t, src){
    var url='https://api.mymemory.translated.net/get?q='+encodeURIComponent(t.slice(0,480))+'&langpair='+src+'|'+TGT;
    var r=await fetch(url); var j=await r.json();
    if(j && j.responseData && j.responseData.translatedText) return j.responseData.translatedText;
    throw new Error('no translation');
  }
  async function translateCard(card, linkEl){
    var st=card.querySelector('.statustxt'); if(!st) return;
    if(card.querySelector('.fx-trans-out')){ card.querySelector('.fx-trans-out').remove(); linkEl.textContent='🌐'; return; }
    var t=st.textContent.trim(); if(!t){ return; }
    var src=detectSrc(t);
    if(src===TGT){ toast('Already in your language'); return; }
    linkEl.textContent='…';
    var out=null;
    try{ out=await onDeviceTranslate(t,src); }catch(e){}
    if(!out){ try{ out=await myMemory(t,src); }catch(e){ linkEl.textContent='🌐'; toast('Translate unavailable, try again',false); return; } }
    var box=document.createElement('div'); box.className='fx-trans-out';
    box.style.cssText='margin-top:6px;padding:8px 10px;background:rgba(122,92,255,.12);border-left:3px solid #7a5cff;border-radius:8px;font-size:13.5px;line-height:1.4;color:inherit';
    box.innerHTML='<span style="font-size:10px;font-weight:800;letter-spacing:.5px;opacity:.6;text-transform:uppercase">Translated · '+esc(src)+'→'+esc(TGT)+'</span><br>'+esc(out);
    st.parentNode.insertBefore(box, st.nextSibling);
    linkEl.textContent='✖';
  }

  /* ---------- decorate cards ---------- */
  function footBtn(label, title){
    var b=document.createElement('button'); b.textContent=label; b.title=title;
    b.style.cssText='background:none;border:none;cursor:pointer;font-size:16px;padding:2px 6px;opacity:.7;line-height:1';
    b.onmouseover=function(){b.style.opacity='1';}; b.onmouseout=function(){b.style.opacity='.7';};
    return b;
  }
  function decorate(){
    var cards=document.getElementsByClassName('card');
    for(var i=0;i<cards.length;i++){
      var card=cards[i];
      if(card.className.indexOf('composer')>=0) continue;
      var foot=card.querySelector('.card-foot');
      if(!foot || foot.querySelector('.fx-sharebtn')) continue;
      var hasText=!!(card.querySelector('.statustxt')&&card.querySelector('.statustxt').textContent.trim());
      // translate
      var tb=footBtn('🌐','Translate'); tb.className='fx-transbtn';
      if(hasText){ (function(c,el){ el.onclick=function(ev){ ev.stopPropagation(); translateCard(c,el); }; })(card,tb); foot.appendChild(tb); }
      // share
      var sbn=footBtn('','Share to Story'); sbn.className='fx-sharebtn'; sbn.setAttribute('aria-label','Share');
      sbn.innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#c9bdf0" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M12 14V4"/><path d="M8.5 7.5 12 4l3.5 3.5"/><path d="M6 12v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-6"/></svg>';
      (function(c){ sbn.onclick=function(ev){ ev.stopPropagation(); shareCard(c); }; })(card);
      foot.appendChild(sbn);
    }
  }
  setInterval(decorate, 1400);
  setTimeout(decorate, 800);

  /* ---------- compliant RATE + FEEDBACK bonus (one-time) ---------- */
  var STORE_URL_IOS='itms-apps://itunes.apple.com/app/id0'; // replaced by real link in report/config
  function openRate(){
    try{ if(window.Capacitor&&window.Capacitor.getPlatform&&window.Capacitor.getPlatform()==='ios') return; }catch(e){}
    if(document.getElementById('fxRateModal')) return;
    var wrap=document.createElement('div'); wrap.id='fxRateModal';
    wrap.style.cssText='position:fixed;inset:0;z-index:2147483601;background:rgba(6,4,12,.72);display:flex;align-items:center;justify-content:center;padding:18px';
    wrap.innerHTML=''
      +'<div style="width:100%;max-width:400px;background:#160f24;border:1px solid #33285c;border-radius:18px;padding:20px;color:#fff;font-family:-apple-system,Segoe UI,Roboto,Arial">'
      +'<div style="font-weight:800;font-size:18px;margin-bottom:4px">⭐ Rate TheFlap</div>'
      +'<div style="font-size:13px;color:#b9aee0;line-height:1.5;margin-bottom:14px">Love the app? Tap below to rate us on the store — totally optional, no strings. Then drop us any feedback and we’ll thank you with a one-time <b>+20 🪶 Feathers</b>. (The bonus is for your feedback, not for any specific rating.)</div>'
      +'<button id="fxRateStore" style="width:100%;background:#2a2140;color:#fff;border:1px solid #4a3a80;border-radius:10px;padding:11px;font-weight:700;font-size:14px;cursor:pointer;margin-bottom:12px">⭐ Rate us on the store</button>'
      +'<textarea id="fxFbText" placeholder="What do you love? What should we add or fix?" style="width:100%;min-height:84px;background:#0d0918;color:#fff;border:1px solid #33285c;border-radius:10px;padding:10px;font-size:13px;resize:vertical;font-family:inherit"></textarea>'
      +'<button id="fxFbSend" style="width:100%;margin-top:10px;background:linear-gradient(135deg,#ffd75e,#ff9e00);color:#241a00;border:0;border-radius:10px;padding:12px;font-weight:800;font-size:14px;cursor:pointer">Send feedback → +20 🪶</button>'
      +'<div id="fxFbMsg" style="font-size:12px;color:#b9aee0;margin-top:8px;min-height:16px"></div>'
      +'<button id="fxFbClose" style="width:100%;margin-top:6px;background:none;border:0;color:#8a7fb0;font-size:12px;cursor:pointer">Maybe later</button>'
      +'</div>';
    document.body.appendChild(wrap);
    var msg=wrap.querySelector('#fxFbMsg');
    wrap.querySelector('#fxFbClose').onclick=function(){ wrap.remove(); };
    wrap.onclick=function(e){ if(e.target===wrap) wrap.remove(); };
    wrap.querySelector('#fxRateStore').onclick=function(){
      var isIOS=!!(window.Capacitor&&window.Capacitor.getPlatform&&window.Capacitor.getPlatform()==='ios');
      // native review prompt bridge if present; else open store listing
      try{ if(window.flapRateNative){ window.flapRateNative(); return; } }catch(e){}
      var url = isIOS ? 'https://apps.apple.com/app/theflap/id0' : 'https://play.google.com/store/apps/details?id=com.leoneatelier.theflap';
      window.open(url,'_blank');
    };
    wrap.querySelector('#fxFbSend').onclick=function(){
      var txt=(wrap.querySelector('#fxFbText').value||'').trim();
      if(txt.length<4){ msg.style.color='#ffcf6a'; msg.textContent='Add a few words of feedback first.'; return; }
      var me=window.ME&&window.ME.name; if(!me){ msg.style.color='#ff8a8a'; msg.textContent='Please log in first.'; return; }
      msg.style.color='#b9aee0'; msg.textContent='Sending…';
      sb().rpc('claim_feedback_bonus',{p_name:me,p_feedback:txt.slice(0,1000)}).then(function(r){
        if(r.error){ msg.style.color='#ff8a8a'; msg.textContent='Error: '+r.error.message; return; }
        var d=r.data||{};
        if(d.ok===false && d.reason==='already'){ msg.style.color='#ffcf6a'; msg.textContent='Thanks! You’ve already claimed this bonus. Feedback received.'; localStorage.setItem('fx_rate_done','1'); return; }
        msg.style.color='#8affa0'; msg.textContent='🪶 +'+(d.granted!=null?d.granted:20)+' Feathers added! Thank you.';
        localStorage.setItem('fx_rate_done','1');
        setTimeout(function(){ var w=document.getElementById('fxRateModal'); if(w) w.remove(); },1800);
      },function(e){ msg.style.color='#ff8a8a'; msg.textContent='Error: '+e.message; });
    };
  }
  window.flapRate=openRate;
  // one-time subtle launcher, only until claimed
  function maybeNudge(){
    try{ if(window.Capacitor&&window.Capacitor.getPlatform&&window.Capacitor.getPlatform()==='ios') return; }catch(e){}
    if(localStorage.getItem('fx_rate_done')==='1') return;
    if(document.getElementById('fxRateNudge')) return;
    if(!window.ME||!window.ME.name) return;
    var b=document.createElement('button'); b.id='fxRateNudge';
    b.innerHTML='⭐ Rate & earn 20 🪶';
    b.style.cssText='position:fixed;left:12px;bottom:12px;z-index:2147483000;background:#160f24;color:#fff;border:1px solid #4a3a80;border-radius:999px;padding:8px 13px;font:700 12px -apple-system,Segoe UI,Roboto,Arial;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.4);opacity:.92';
    b.onclick=openRate;
    document.body.appendChild(b);
  }
  setTimeout(maybeNudge, 4000);

  /* ---------- LIVE AVATAR FIX ----------
     Each flap stores a frozen copy of the author's avatar (flaps.avatar_url). When someone
     changes their profile picture, old posts don't update, and the app's sync attempt can leave
     some blank — which reads as "my flaps reset." This resolves each post's avatar from the LIVE
     members map (window.USERS) by author name, so changing your picture instantly updates ALL your
     past posts everywhere. Display-only, no writes, no data risk. */
  function liveAvatar(name){
    try{
      var U=window.USERS; if(!U||!name) return null;
      var n=String(name).trim();
      var u=U[n]||U[n.toLowerCase()];
      if(u&&u.avatar_url){ var a=String(u.avatar_url).trim(); if(a) return a; }
    }catch(e){}
    return null;
  }
  function fixOneAvatar(nameEl, img){
    if(!nameEl||!img) return;
    var live=liveAvatar((nameEl.textContent||'').trim());
    if(live && img.getAttribute('data-fxav')!==live){ img.setAttribute('data-fxav',live); if(img.src!==live) img.src=live; }
  }
  function fixAvatars(){
    try{
      var cards=document.getElementsByClassName('card');
      for(var i=0;i<cards.length;i++){
        var c=cards[i];
        fixOneAvatar(c.querySelector('.pname'), c.querySelector('.pava img'));
        var reps=c.querySelectorAll('.reply');
        for(var j=0;j<reps.length;j++){
          fixOneAvatar(reps[j].querySelector('.rn-link, .rn'), reps[j].querySelector('.rava img'));
        }
      }
    }catch(e){}
  }
  setInterval(fixAvatars, 1500);
  setTimeout(fixAvatars, 900);

  /* ---------- STORE COSMETICS: Frames, VIP badge, Spotlight Boost ----------
     These were sold in the store but never wired to render. This connects them:
     - Frames: apply the equipped frame class (nx-fr-*) to the author's avatar.
     - VIP badge: show a VIP chip for anyone who owns badge_vip.
     - Spotlight Boost: pin the buyer's latest flap to the top of the feed with a
       "Spotlight" label for a few hours (activate_spotlight RPC). */
  var STCOS_CSS=false;
  function ensureStCss(){
    if(STCOS_CSS) return; STCOS_CSS=true;
    var st=document.createElement('style');
    st.textContent='.fx-vip{display:inline-flex;align-items:center;gap:3px;margin-left:5px;background:linear-gradient(135deg,#ffd75e,#ff9e00);color:#3a2600;font-weight:800;font-size:9px;letter-spacing:.4px;padding:2px 6px;border-radius:999px;vertical-align:middle;box-shadow:0 1px 3px rgba(0,0,0,.25)}'
      +'.fx-spot-wrap{border:1px solid #ffcf5a !important;box-shadow:0 0 0 2px rgba(255,207,90,.18)}'
      +'.fx-spot-ribbon{display:flex;align-items:center;gap:6px;background:linear-gradient(90deg,#ffd75e,#ff9e00);color:#241a00;font-weight:800;font-size:11px;letter-spacing:.4px;padding:5px 12px}'
      +'.fx-usespot{position:fixed;left:12px;bottom:52px;z-index:2147483000;background:linear-gradient(135deg,#ffd75e,#ff9e00);color:#241a00;border:0;border-radius:999px;padding:8px 13px;font:800 12px -apple-system,Segoe UI,Roboto,Arial;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.4)}';
    document.head.appendChild(st);
  }
  var FR_MAP={gold_frame:'nx-fr-gold',frame_galaxy:'nx-fr-galaxy'};
  var FR_ALL=['nx-fr-gold','nx-fr-galaxy'];
  var ST_FRAMES={}, ST_VIP={}, ST_SPOT={}, ST_LOADED=false;
  function loadStoreCos(){
    var c=sb(); if(!c) return;
    try{
      c.from('flap_equipped').select('name,item').eq('slot','Frames').then(function(r){ ST_FRAMES={}; (r.data||[]).forEach(function(x){ if(FR_MAP[x.item]){ var n=String(x.name); ST_FRAMES[n]=FR_MAP[x.item]; ST_FRAMES[n.toLowerCase()]=FR_MAP[x.item]; } }); },function(){});
      c.from('flap_store_owned').select('name').eq('item','badge_vip').then(function(r){ ST_VIP={}; (r.data||[]).forEach(function(x){ var n=String(x.name); ST_VIP[n]=1; ST_VIP[n.toLowerCase()]=1; }); },function(){});
      c.from('flap_spotlight').select('name,flap_id,until').then(function(r){ ST_SPOT={}; var now=Date.now(); (r.data||[]).forEach(function(x){ if(new Date(x.until).getTime()>now) ST_SPOT[String(x.flap_id)]={name:x.name,until:x.until}; }); ST_LOADED=true; },function(){});
    }catch(e){}
  }
  function applyStoreCos(){
    try{
      ensureStCss();
      var cards=document.getElementsByClassName('card');
      for(var i=0;i<cards.length;i++){
        var c=cards[i];
        var pn=c.querySelector('.pname'), pv=c.querySelector('.pava');
        var nm=pn?(pn.textContent||'').trim():'';
        if(pv && nm){
          var fr=ST_FRAMES[nm]||ST_FRAMES[nm.toLowerCase()];
          if(fr && !pv.classList.contains(fr)){ FR_ALL.forEach(function(k){pv.classList.remove(k);}); pv.classList.add(fr); }
        }
        if(pn && nm && (ST_VIP[nm]||ST_VIP[nm.toLowerCase()]) && !pn.querySelector('.fx-vip')){
          var b=document.createElement('span'); b.className='fx-vip'; b.textContent='★ VIP'; pn.appendChild(b);
        }
      }
      pinSpotlights();
    }catch(e){}
  }
  function pinSpotlights(){
    try{
      if(!ST_LOADED) return;
      var feed=document.getElementById('feed'); if(!feed) return;
      var likebtns=feed.querySelectorAll('.likebtn[data-id]');
      for(var i=0;i<likebtns.length;i++){
        var id=likebtns[i].getAttribute('data-id');
        if(!ST_SPOT[id]) continue;
        var card=likebtns[i].closest('.card'); if(!card || card.__fxspot) continue;
        card.__fxspot=1; card.classList.add('fx-spot-wrap');
        var rib=document.createElement('div'); rib.className='fx-spot-ribbon'; rib.innerHTML='✨ SPOTLIGHT';
        card.insertBefore(rib, card.firstChild);
        var composer=feed.querySelector('.card.composer');
        if(composer){ if(composer.nextSibling!==card) feed.insertBefore(card, composer.nextSibling); }
        else if(feed.firstChild!==card){ feed.insertBefore(card, feed.firstChild); }
      }
    }catch(e){}
  }
  loadStoreCos();
  setInterval(loadStoreCos, 60000);
  setInterval(applyStoreCos, 1600);
  setTimeout(applyStoreCos, 1000);

  /* "Use Spotlight" launcher — shown to owners of boost_spotlight */
  function maybeSpotBtn(){
    try{
      var me=window.ME&&window.ME.name; if(!me) return;
      if(document.getElementById('fxUseSpot')) return;
      var c=sb(); if(!c) return;
      c.from('flap_store_owned').select('item').eq('name',me).eq('item','boost_spotlight').then(function(r){
        if(!(r.data&&r.data.length)) return;
        if(document.getElementById('fxUseSpot')) return;
        ensureStCss();
        var b=document.createElement('button'); b.id='fxUseSpot'; b.className='fx-usespot'; b.innerHTML='✨ Use Spotlight';
        b.onclick=function(){
          if(!confirm('Spotlight your latest flap at the top of the feed for 3 hours?')) return;
          b.disabled=true; b.textContent='…';
          c.rpc('activate_spotlight',{p_name:me}).then(function(rr){
            var d=rr.data||{};
            if(d && d.ok){ toast('✨ Spotlight active for 3 hours!'); b.remove(); loadStoreCos(); }
            else { toast('Could not spotlight: '+((d&&d.error)||'error'),false); b.disabled=false; b.innerHTML='✨ Use Spotlight'; }
          },function(e){ toast('Error: '+e.message,false); b.disabled=false; b.innerHTML='✨ Use Spotlight'; });
        };
        document.body.appendChild(b);
      },function(){});
    }catch(e){}
  }
  setTimeout(maybeSpotBtn, 5000);
  setInterval(maybeSpotBtn, 30000);

  /* ---------- LONG THREADS: cap feed + real POST PAGE + reply-to-comment ----------
     Feed shows the first RCAP replies; the rest are hidden (display:none, so they don't
     paint or animate — the lag fix). "View N more replies" opens a full-screen post page
     with the whole thread (capped at PP_CAP with Load more). Every comment (feed + post
     page) gets a Reply action that opens the flap's own composer prefilled with @name —
     a flat tag that reuses the app's posting. No nested threads. */
  var RCAP=3, PP_CAP=20;
  var FX_DESKTOP=!!(window.matchMedia&&window.matchMedia('(hover:hover) and (pointer:fine)').matches);
  function realReplies(rc){ return rc.querySelectorAll(':scope > .reply:not(.reply-compose)'); }
  function ensureRcCss(){
    if(document.getElementById('fx-rc-css')) return;
    var s=document.createElement('style'); s.id='fx-rc-css';
    s.textContent=
      '.fx-morereplies{display:block;width:100%;text-align:center;background:rgba(124,92,255,.16);border:1px solid rgba(150,120,255,.55);color:#eae2ff;font:800 13px -apple-system,Segoe UI,Roboto,Arial;padding:9px 10px;margin-top:7px;border-radius:11px;cursor:pointer;letter-spacing:.2px}.fx-morereplies:active{filter:brightness(.9)}'
      +'.fx-pp{position:fixed;inset:0;z-index:2147483000;background:#241035;display:flex;flex-direction:column;overflow:hidden}'
      +'.fx-pp-hd{display:flex;align-items:center;gap:12px;padding:calc(env(safe-area-inset-top,0px) + 12px) 14px 12px;border-bottom:1px solid #372a55;color:#fff;font-weight:800;font-size:16px;flex:0 0 auto}'
      +'.fx-pp-back{background:none;border:none;color:#c9a4ff;font-size:22px;line-height:1;cursor:pointer;padding:0 2px}'
      +'.fx-pp-body{flex:1 1 auto;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px 14px calc(env(safe-area-inset-bottom,0px) + 28px)}'
      +'.fx-rreply{color:#b9a3ff;font-weight:700;font-size:11.5px;cursor:pointer;margin-left:9px;white-space:nowrap}'
      +'.fx-rreply:active{filter:brightness(.85)}'
      +'.fx-loadmore{display:block;width:100%;text-align:center;background:rgba(124,92,255,.16);border:1px solid rgba(150,120,255,.55);color:#eae2ff;font:800 13px -apple-system,Segoe UI,Roboto,Arial;padding:10px;margin-top:10px;border-radius:11px;cursor:pointer}';
    document.head.appendChild(s);
  }
  function replyName(row){ var n=row.querySelector('.rn-link')||row.querySelector('.rn'); return n?n.textContent.trim():''; }
  function openComposerPrefill(card,name){
    try{
      var had=!!card.querySelector('.reply-compose');
      if(!had){ var rb=card.querySelector('.replybtn'); if(rb) rb.click(); }
      setTimeout(function(){
        var c=card.querySelector('.reply-compose'); if(!c) return;
        var inp=c.querySelector('input,textarea'); if(!inp) return;
        var tag='@'+name+' ';
        if(name && inp.value.indexOf(tag)<0){ inp.value=tag+inp.value; }
        inp.dispatchEvent(new Event('input',{bubbles:true}));
        try{ inp.focus(); if(inp.setSelectionRange) inp.setSelectionRange(inp.value.length,inp.value.length); }catch(e){}
        try{ card.scrollIntoView({behavior:'smooth',block:'center'}); }catch(e){}
      }, had?0:190);
    }catch(e){}
  }
  function addReplyAction(row, origCard){
    if(row.querySelector('.fx-rreply')) return;
    var name=replyName(row);
    var a=document.createElement('span'); a.className='fx-rreply'; a.textContent='Reply';
    a.onclick=function(ev){ ev.stopPropagation(); closePP(); openComposerPrefill(origCard, name); };
    var rt=row.querySelector('.rtxt')||row;
    rt.appendChild(a);
  }
  function closePP(){ var p=document.getElementById('fx-pp'); if(p) p.remove(); document.documentElement.style.overflow=''; }
  function openPostPage(card){
    ensureRcCss(); closePP();
    var pp=document.createElement('div'); pp.className='fx-pp'; pp.id='fx-pp';
    var hd=document.createElement('div'); hd.className='fx-pp-hd';
    var bk=document.createElement('button'); bk.className='fx-pp-back'; bk.setAttribute('aria-label','Back'); bk.innerHTML='&#8592;';
    bk.onclick=closePP; hd.appendChild(bk);
    var ti=document.createElement('span'); ti.textContent='Post'; hd.appendChild(ti);
    pp.appendChild(hd);
    var body=document.createElement('div'); body.className='fx-pp-body';
    var clone=card.cloneNode(true);
    var foot=clone.querySelector('.card-foot'); if(foot) foot.remove();
    var cComp=clone.querySelector('.reply-compose'); if(cComp) cComp.remove();
    var cPill=clone.querySelector('.fx-morereplies'); if(cPill) cPill.remove();
    var cReplies=clone.querySelector('.replies');
    if(cReplies){
      cReplies.__fxrc=1;
      var rows=cReplies.querySelectorAll(':scope > .reply:not(.reply-compose)');
      for(var i=0;i<rows.length;i++){
        var row=rows[i]; row.style.display='';
        var del=row.querySelector('.reply-del'); if(del) del.remove();
        var ex=row.querySelector('.fx-rreply'); if(ex) ex.remove();
        if(i<PP_CAP){ addReplyAction(row, card); }
        else { row.style.display='none'; row.setAttribute('data-fxmore','1'); }
      }
      if(rows.length>PP_CAP){
        var lm=document.createElement('button'); lm.className='fx-loadmore';
        lm.textContent='Load more replies ('+(rows.length-PP_CAP)+')';
        lm.onclick=function(){
          var hidden=cReplies.querySelectorAll(':scope > .reply[data-fxmore="1"]');
          var n=0;
          for(var k=0;k<hidden.length && n<PP_CAP;k++){ hidden[k].style.display=''; hidden[k].removeAttribute('data-fxmore'); addReplyAction(hidden[k],card); n++; }
          var left=cReplies.querySelectorAll(':scope > .reply[data-fxmore="1"]').length;
          if(left>0){ lm.textContent='Load more replies ('+left+')'; } else { lm.remove(); }
        };
        cReplies.appendChild(lm);
      }
    }
    body.appendChild(clone);
    pp.appendChild(body);
    document.body.appendChild(pp);
    document.documentElement.style.overflow='hidden';
    body.scrollTop=0;
  }
  function collapseReplies(){
    try{
      ensureRcCss();
      var conts=document.querySelectorAll('.replies');
      for(var i=0;i<conts.length;i++){
        var rc=conts[i];
        if(rc.closest && rc.closest('.fx-pp')){ rc.__fxrc=1; continue; }
        if(rc.__fxrc) continue;
        var reps=realReplies(rc);
        rc.__fxrc=1;
        var card=rc.closest?rc.closest('.card'):null;
        var vis=Math.min(reps.length, RCAP);
        if(FX_DESKTOP){ for(var v=0; v<vis; v++){ addReplyAction(reps[v], card||rc); } }
        if(reps.length<=RCAP) continue;
        for(var j=RCAP;j<reps.length;j++){ reps[j].style.display='none'; }
        var extra=reps.length-RCAP;
        var link=document.createElement('button');
        link.type='button'; link.className='fx-morereplies';
        link.textContent='— View '+extra+' more repl'+(extra===1?'y':'ies')+' —';
        (function(c){ link.onclick=function(ev){ if(ev){ev.stopPropagation();} openPostPage(c); }; })(card||rc);
        var comp=rc.querySelector(':scope > .reply-compose');
        if(comp){ rc.insertBefore(link, comp); } else { rc.appendChild(link); }
      }
    }catch(e){}
  }
  setTimeout(collapseReplies, 700);
  setInterval(collapseReplies, 1400);

  /* ---------- Capture Google/Apple (OAuth) email onto the account ----------
     OAuth users already have a verified email in their Supabase session; this fills
     it onto their flap_users row when it's empty (never overwrites). Password-only
     users have no session email, so it's a no-op. Non-breaking. */
  var FX_OAUTH_EMAIL_DONE=false;
  function fxCaptureOauthEmail(){
    try{
      if(FX_OAUTH_EMAIL_DONE) return;
      var me=window.ME&&window.ME.name; if(!me) return;
      var c=sb(); if(!c||!c.auth||!c.auth.getUser) return;
      c.auth.getUser().then(function(r){
        var em=r&&r.data&&r.data.user&&r.data.user.email;
        if(!em) return;
        FX_OAUTH_EMAIL_DONE=true;
        c.from('flap_users').update({email:String(em).trim().toLowerCase()}).eq('name',me).is('email',null)
          .then(function(){},function(){});
      },function(){});
    }catch(e){}
  }
  setTimeout(fxCaptureOauthEmail, 6000);
  setInterval(function(){ if(!FX_OAUTH_EMAIL_DONE) fxCaptureOauthEmail(); }, 45000);
  /* ---------- FX_IOS_PURCHASE_HIDE: hide remaining Feather-purchase / Whop-redeem surfaces on iOS ---------- */
  (function(){
    var isIOS=false; try{ isIOS=!!(window.Capacitor&&window.Capacitor.getPlatform&&window.Capacitor.getPlatform()==='ios'); }catch(e){}
    if(!isIOS) return;
    try{ if(window.flapGetFeathers) window.flapGetFeathers=function(){}; }catch(e){}
    function hb(){
      try{
        ['gfX','fcGF'].forEach(function(id){ var e=document.getElementById(id); if(e) e.style.display='none'; });
        var clk=document.querySelectorAll('[onclick]');
        for(var i=0;i<clk.length;i++){ if(/flapgetfeathers/i.test(clk[i].getAttribute('onclick')||'')) clk[i].style.display='none'; }
        var all=document.querySelectorAll('button,a,div,span,section');
        for(var j=0;j<all.length;j++){ var el=all[j]; if(el.children.length>4) continue; var t=(el.textContent||''); if(t.length<160 && /(get feathers|buy a pack|bought on whop)/i.test(t)){ var box=el.closest('.gfc-foot,.gfc-box,[id^="gf"],[id^="fc"]')||el; box.style.display='none'; } }
      }catch(e){}
    }
    setTimeout(hb,800); setInterval(hb,1400);
  })();
})();
