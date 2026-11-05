// 飲食LP試作の動き（控えめ）：出現・ヘッダー・FV写真の視差・スマホ予約ボタン
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const head=document.querySelector('.site-head');
const hero=document.querySelector('.hero');
const mcta=document.querySelector('.mobile-cta');
const para=[...document.querySelectorAll('[data-parallax]')];
let lastY=0,ticking=false;
const update=()=>{
  const y=scrollY,heroEnd=hero?hero.offsetHeight-80:300;
  if(head){head.classList.toggle('is-solid',y>heroEnd);head.classList.toggle('is-hidden',y>lastY&&y>heroEnd+200);lastY=y}
  if(mcta) mcta.classList.toggle('is-on',y>heroEnd);
  if(!reduce) para.forEach(el=>{const r=el.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)el.style.transform=`translate3d(0,${(r.top)*-Number(el.dataset.parallax||.08)}px,0) scale(1.06)`});
  // 下端まで来たら、出そびれた要素をすべて出す（観測が遅れた時の保険）
  if(y+innerHeight>=document.documentElement.scrollHeight-4) document.querySelectorAll('.reveal:not(.in)').forEach(el=>el.classList.add('in'));
  ticking=false;
};
addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(update);ticking=true}},{passive:true});
if('IntersectionObserver' in window){
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.08,rootMargin:'0px 0px -6% 0px'});
  document.querySelectorAll('.reveal,.media').forEach(el=>io.observe(el));
}else document.querySelectorAll('.reveal,.media').forEach(el=>el.classList.add('in'));
// FV写真が読み込めてから見出しの演出を始める（写真より先に文字だけ動かない）
const first=document.querySelector('.hero img');
const go=()=>document.documentElement.classList.add('go');
if(!first||first.complete) go(); else {first.addEventListener('load',go);first.addEventListener('error',go);setTimeout(go,2500)}
update();
