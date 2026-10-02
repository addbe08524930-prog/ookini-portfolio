/* Numachan craft layer (progressive enhancement). Relies on <html class="aw"> set in <head>. */
(()=>{
'use strict';
const root=document.documentElement;
if(!root.classList.contains('aw'))return;
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const mk=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;};

/* ---- Split a heading into masked lines (optionally per character) ---- */
function charWrap(node,counter){
  [...node.childNodes].forEach(n=>{
    if(n.nodeType===3){
      const f=document.createDocumentFragment();
      [...n.textContent].forEach(c=>{const s=mk('span','ch');s.setAttribute('aria-hidden','true');s.style.setProperty('--c',counter.n++);s.textContent=c;f.appendChild(s);});
      n.replaceWith(f);
    }else if(n.nodeType===1)charWrap(n,counter);
  });
}
function splitLines(el,chars){
  const small=$('small',el);
  if(small)small.remove();
  const label=el.textContent.replace(/\s+/g,'');
  const lines=[[]];
  [...el.childNodes].forEach(n=>{if(n.nodeName==='BR')lines.push([]);else lines[lines.length-1].push(n);});
  el.textContent='';
  const counter={n:0};
  lines.forEach((nodes,i)=>{
    const ln=mk('span','ln'),inn=mk('span','ln-in');
    inn.style.setProperty('--i',i);
    nodes.forEach(n=>inn.appendChild(n));
    if(chars)charWrap(inn,counter);
    ln.appendChild(inn);el.appendChild(ln);
  });
  if(small)el.appendChild(small);
  el.setAttribute('aria-label',label);
  $$('.ln,small',el).forEach(x=>x.setAttribute('aria-hidden','true'));
  if(small)small.removeAttribute('aria-hidden');
}

/* ---- Hero ---- */
const h1=$('.hero h1');
if(h1&&!reduce)splitLines(h1,true);

/* ---- Heading line masks ---- */
const splitTargets=[];
if(!reduce){
  $$('.title,.story h2,.final h2').forEach(el=>{splitLines(el,false);el.classList.add('split');splitTargets.push(el);});
}

/* ---- Image reveal targets ---- */
const imgTargets=[];
if(!reduce){
  $$('.portrait,.food-main,.food-card figure,.use-card,.space-main,.space-copy figure,.photo-strip figure').forEach((el,i)=>{
    if(!$('img',el))return;
    el.classList.add('ir');
    const sib=el.parentElement?[...el.parentElement.children].indexOf(el):0;
    el.style.setProperty('--d',(sib*0.12).toFixed(2)+'s');
    imgTargets.push(el);
  });
}

/* ---- Reveal triggers are polled in the frame loop (clip-path on the target breaks IntersectionObserver) ---- */
let pending=[...splitTargets,...imgTargets];
function checkReveals(vh){
  if(!pending.length)return;
  pending=pending.filter(el=>{
    const r=el.getBoundingClientRect();
    const top=r.top,h=Math.min(r.height,vh*.5);
    if(top<vh-Math.min(h*.3,vh*.12)-Math.max(0,0)&&r.bottom>0){
      el.classList.add(el.classList.contains('ir')?'ir-in':'sp-in');
      return false;
    }
    return true;
  });
}
/* ---- Scroll-lit quote: characters light up as the line travels up the screen ---- */
const quote=$('.quote');
let quoteChars=[];
if(quote&&!reduce){
  const walk=n=>[...n.childNodes].forEach(c=>{
    if(c.nodeType===3){
      const f=document.createDocumentFragment();
      [...c.textContent].forEach(ch=>{const s=mk('span','sc');s.textContent=ch;f.appendChild(s);quoteChars.push(s);});
      c.replaceWith(f);
    }else if(c.nodeType===1)walk(c);
  });
  walk(quote);
}

/* ---- Marquee band ---- */
const band=$('.intro-band');
let mq=null;
if(band){
  const items=[['また、ふらっと。',''],['KYOTO · NISHIOJI','sm'],['また、ふらっと。','out'],['沼ちゃんとこ','sm']];
  const seq=items.map(([t,c])=>`<span class="mq-i ${c}">${t}</span><i class="mq-d"></i>`).join('');
  const track=mk('div','mq-track',seq+seq+seq+seq);
  band.textContent='';band.appendChild(track);
  mq={track,x:0,half:0};
  const measure=()=>{mq.half=track.scrollWidth/2;};
  measure();addEventListener('resize',measure);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(measure);
}

/* ---- Nav: text roll + active section ---- */
$$('.nav a').forEach(a=>{const t=a.textContent;a.innerHTML=`<span class="rl" data-t="${t}">${t}</span>`;});
const navMap=new Map($$('.nav a').map(a=>[a.getAttribute('href').slice(1),a]));
if('IntersectionObserver' in window){
  const so=new IntersectionObserver(es=>es.forEach(e=>{
    const a=navMap.get(e.target.id);
    if(a&&e.isIntersecting){navMap.forEach(x=>x.classList.remove('on'));a.classList.add('on');}
  }),{rootMargin:'-45% 0px -50% 0px'});
  navMap.forEach((a,id)=>{const s=document.getElementById(id);if(s)so.observe(s);});
}

/* ---- Cursor ---- */
let cur=null,cx=-100,cy=-100,tx=-100,ty=-100;
if(fine&&!reduce){
  cur=mk('div','cur');cur.setAttribute('aria-hidden','true');document.body.appendChild(cur);
  addEventListener('mousemove',e=>{tx=e.clientX;ty=e.clientY;cur.classList.add('on');cur.classList.remove('hide');},{passive:true});
  document.addEventListener('mouseleave',()=>cur.classList.add('hide'));
  document.addEventListener('mouseover',e=>{
    const t=e.target;
    const link=t.closest&&t.closest('a,button,.btn');
    const img=!link&&t.closest&&t.closest('.ir');
    cur.classList.toggle('link',!!link);
    cur.classList.toggle('img',!!img);
    cur.classList.toggle('hide',!!(t.closest&&t.closest('iframe,.map-panel')));
  });
}

/* ---- Magnetic buttons ---- */
if(fine&&!reduce){
  $$('.btn').forEach(b=>{
    b.addEventListener('mousemove',e=>{
      const r=b.getBoundingClientRect();
      const dx=(e.clientX-(r.left+r.width/2))/r.width,dy=(e.clientY-(r.top+r.height/2))/r.height;
      b.style.translate=`${(dx*14).toFixed(1)}px ${(dy*10).toFixed(1)}px`;
    });
    b.addEventListener('mouseleave',()=>{b.style.translate='';});
  });
}

/* ---- Hero mouse parallax ---- */
let mx=0,mxT=0;
const hero=$('.hero');
if(hero&&fine&&!reduce){
  hero.addEventListener('mousemove',e=>{mxT=(e.clientX/innerWidth-.5)*2;},{passive:true});
  hero.addEventListener('mouseleave',()=>{mxT=0;});
}

/* ---- Scroll loop: parallax, header, marquee, watermark ---- */
const heroImg=$('.hero-bg img');
const heroCopy=$('.hero-copy');
const par=imgTargets.map(f=>({f,img:$('img',f)}));
const final=$('.final');
const header=$('.header');
let lastY=scrollY,vel=0,dirY=1;
function frame(){
  const y=scrollY,vh=innerHeight;
  vel=lerp(vel,y-lastY,.12);
  if(Math.abs(y-lastY)>1)dirY=y>lastY?1:-1;
  /* header hides on scroll down, returns on scroll up */
  if(header){
    if(y<260)header.classList.remove('hdr-hide');
    else if(y>lastY+4)header.classList.add('hdr-hide');
    else if(y<lastY-4)header.classList.remove('hdr-hide');
  }
  lastY=y;
  checkReveals(vh);
  if(!reduce){
    par.forEach(p=>{
      const r=p.f.getBoundingClientRect();
      if(r.bottom<-80||r.top>vh+80)return;
      const k=clamp((r.top+r.height/2-vh/2)/(vh/2+r.height/2),-1,1);
      p.img.style.setProperty('--py',(k*-5.2).toFixed(2)+'%');
    });
    if(quoteChars.length){const r=quote.getBoundingClientRect();const pr=clamp((vh*.88-r.top)/(vh*.42),0,1);const n=Math.round(pr*quoteChars.length);quoteChars.forEach((s,i)=>s.classList.toggle('lit',i<n));}
    if(heroCopy){const hs=clamp(y/(vh*.9),0,1);heroCopy.style.setProperty('--hs',hs.toFixed(3));}
    if(heroImg&&y<vh*1.2)heroImg.style.setProperty('--py',(clamp(y/vh,0,1)*4).toFixed(2)+'%');
    mx=lerp(mx,mxT,.06);
    if(heroImg)heroImg.style.setProperty('--mx',mx.toFixed(3));
    if(final){const r=final.getBoundingClientRect();if(r.bottom>0&&r.top<vh)final.style.setProperty('--wy',(clamp((vh-r.top)/(vh+r.height),0,1)*-110+55).toFixed(1)+'px');}
    if(mq&&mq.half){
      mq.x-=0.7+Math.min(Math.abs(vel)*0.18,7);
      if(mq.x<=-mq.half)mq.x+=mq.half;
      mq.track.style.transform=`translate3d(${mq.x.toFixed(2)}px,0,0)`;
    }
  }
  if(cur){cx=lerp(cx,tx,.2);cy=lerp(cy,ty,.2);cur.style.transform=`translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0)`;}
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();