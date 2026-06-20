const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const progress=document.querySelector('.progress');
const head=document.querySelector('.site-head');
let lastY=0,ticking=false;
const update=()=>{
  const y=scrollY,max=document.documentElement.scrollHeight-innerHeight;
  if(progress) progress.style.width=`${Math.min(100,y/max*100)}%`;
  if(head){head.classList.toggle('is-hidden',y>lastY&&y>180);lastY=y}
  if(!reduce){document.querySelectorAll('[data-parallax]').forEach(el=>{const r=el.getBoundingClientRect(),speed=Number(el.dataset.parallax||.08);el.style.transform=`translate3d(0,${(r.top-innerHeight/2)*speed}px,0) scale(1.04)`})}
  ticking=false;
};
addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(update);ticking=true}},{passive:true});
const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
document.querySelectorAll('.final-cta').forEach(area=>area.addEventListener('pointermove',e=>{const r=area.getBoundingClientRect();area.style.setProperty('--mx',`${(e.clientX-r.left-r.width/2)*.16}px`);area.style.setProperty('--my',`${(e.clientY-r.top-r.height/2)*.16}px`)}));
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const t=document.querySelector(a.getAttribute('href'));if(t){e.preventDefault();t.scrollIntoView({behavior:reduce?'auto':'smooth'})}}));
update();
