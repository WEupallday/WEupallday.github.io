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
      var sbn=footBtn('↪️','Share to Story'); sbn.className='fx-sharebtn';
      (function(c){ sbn.onclick=function(ev){ ev.stopPropagation(); shareCard(c); }; })(card);
      foot.appendChild(sbn);
    }
  }
  setInterval(decorate, 1400);
  setTimeout(decorate, 800);

  /* ---------- compliant RATE + FEEDBACK bonus (one-time) ---------- */
  var STORE_URL_IOS='itms-apps://itunes.apple.com/app/id0'; // replaced by real link in report/config
  function openRate(){
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
})();
