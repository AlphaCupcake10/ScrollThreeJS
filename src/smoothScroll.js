import Lenis from '@studio-freight/lenis';
export const lenis = new Lenis({
  direction:'horizontal'
})

// lenis.on('scroll', (e) => {
//   console.log(e)
// })

function raf(time)
{
  lenis.raf(time)
  requestAnimationFrame(raf);
  // console.log(lenis.targetScroll)
}

requestAnimationFrame(raf);


document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    console.log(anchor);
    lenis.scrollTo(anchor.getAttribute('href'));
  });
});

const snapThreshold = 10;
const velocityInfluence = 40;

let snapPoints = [];
document.querySelectorAll('[scroll-snap-align]').forEach(
  (Element,key,parent)=>{
    snapPoints.push(Element.offsetTop);
  }
)
lenis.on("scroll",(e)=>{
  if(Math.abs(lenis.velocity) <= snapThreshold)
  {
    let res = 0;
    let dist = Infinity;
    for(const val of snapPoints)
    {
      let diff = Math.abs(Math.round(val - (lenis.actualScroll + lenis.velocity * velocityInfluence)));
      if(diff<dist)
      {
        res = val;
        dist = diff;
      }
    }
    lenis.scrollTo(res,{
      lock:false,
      duration:1.5,
      easing:(t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    });
  }
})