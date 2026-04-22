// --- CONFETTI LIBRARY ---
!function(t,e){!function t(e,a,n,r){var o=!!(e.Worker&&e.Blob&&e.Promise&&e.OffscreenCanvas&&e.OffscreenCanvasRenderingContext2D&&e.HTMLCanvasElement&&e.HTMLCanvasElement.prototype.transferControlToOffscreen&&e.URL&&e.URL.createObjectURL),i="function"==typeof Path2D&&"function"==typeof DOMMatrix,l=function(){if(!e.OffscreenCanvas)return!1;var t=new OffscreenCanvas(1,1),a=t.getContext("2d");a.fillRect(0,0,1,1);var n=t.transferToImageBitmap();try{a.createPattern(n,"no-repeat")}catch(t){return!1}return!0}();function s(){}function c(t){var n=a.exports.Promise,r=void 0!==n?n:e.Promise;return"function"==typeof r?new r(t):(t(s,s),null)}var h,f,u,d,m,g,p,b,M,v,y,w=(h=l,f=new Map,{transform:function(t){if(h)return t;if(f.has(t))return f.get(t);var e=new OffscreenCanvas(t.width,t.height);return e.getContext("2d").drawImage(t,0,0),f.set(t,e),e},clear:function(){f.clear()}}),x=(m=Math.floor(1e3/60),g={},p=0,"function"==typeof requestAnimationFrame&&"function"==typeof cancelAnimationFrame?(u=function(t){var e=Math.random();return g[e]=requestAnimationFrame((function a(n){p===n||p+m-1<n?(p=n,delete g[e],t()):g[e]=requestAnimationFrame(a)})),e},d=function(t){g[t]&&cancelAnimationFrame(g[t])}):(u=function(t){return setTimeout(t,m)},d=function(t){return clearTimeout(t)}),{frame:u,cancel:d}),C=(v={},function(){if(b)return b;if(!n&&o){var e=["var CONFETTI, SIZE = {}, module = {};","("+t.toString()+")(this, module, true, SIZE);","onmessage = function(msg) {","  if (msg.data.options) {","    CONFETTI(msg.data.options).then(function () {","      if (msg.data.callback) {","        postMessage({ callback: msg.data.callback });","      }","    });","  } else if (msg.data.reset) {","    CONFETTI && CONFETTI.reset();","  } else if (msg.data.resize) {","    SIZE.width = msg.data.resize.width;","    SIZE.height = msg.data.resize.height;","  } else if (msg.data.canvas) {","    SIZE.width = msg.data.canvas.width;","    SIZE.height = msg.data.canvas.height;","    CONFETTI = module.exports.create(msg.data.canvas);","  }","}"].join("\n");try{b=new Worker(URL.createObjectURL(new Blob([e])))}catch(t){return void 0!==typeof console&&"function"==typeof console.warn&&console.warn("🎊 Could not load worker",t),null}!function(t){function e(e,a){t.postMessage({options:e||{},callback:a})}t.init=function(e){var a=e.transferControlToOffscreen();t.postMessage({canvas:a},[a])},t.fire=function(a,n,r){if(M)return e(a,null),M;var o=Math.random().toString(36).slice(2);return M=c((function(n){function i(e){e.data.callback===o&&(delete v[o],t.removeEventListener("message",i),M=null,w.clear(),r(),n())}t.addEventListener("message",i),e(a,o),v[o]=i.bind(null,{data:{callback:o}})}))},t.reset=function(){for(var e in t.postMessage({reset:!0}),v)v[e](),delete v[e]}}(b)}return b}),I={particleCount:50,angle:90,spread:45,startVelocity:45,decay:.9,gravity:1,drift:0,ticks:200,x:.5,y:.5,shapes:["square","circle"],zIndex:100,colors:["#26ccff","#a25afd","#ff5e7e","#88ff5a","#fcff42","#ffa62d","#ff36ff"],disableForReducedMotion:!1,scalar:1};function T(t,e,a){return function(t,e){return e?e(t):t}(t&&null!=t[e]?t[e]:I[e],a)}function E(t){return t<0?0:Math.floor(t)}function P(t){return parseInt(t,16)}function S(t){return t.map(O)}function O(t){var e=String(t).replace(/[^0-9a-f]/gi,"");return e.length<6&&(e=e[0]+e[0]+e[1]+e[1]+e[2]+e[2]),{r:P(e.substring(0,2)),g:P(e.substring(2,4)),b:P(e.substring(4,6))}}function k(t){t.width=document.documentElement.clientWidth,t.height=document.documentElement.clientHeight}function B(t){var e=t.getBoundingClientRect();t.width=e.width,t.height=e.height}function F(t,e){e.x+=Math.cos(e.angle2D)*e.velocity+e.drift,e.y+=Math.sin(e.angle2D)*e.velocity+e.gravity,e.velocity*=e.decay,e.flat?(e.wobble=0,e.wobbleX=e.x+10*e.scalar,e.wobbleY=e.y+10*e.scalar,e.tiltSin=0,e.tiltCos=0,e.random=1):(e.wobble+=e.wobbleSpeed,e.wobbleX=e.x+10*e.scalar*Math.cos(e.wobble),e.wobbleY=e.y+10*e.scalar*Math.sin(e.wobble),e.tiltAngle+=.1,e.tiltSin=Math.sin(e.tiltAngle),e.tiltCos=Math.cos(e.tiltAngle),e.random=Math.random()+2);var a=e.tick++/e.totalTicks,n=e.x+e.random*e.tiltCos,r=e.y+e.random*e.tiltSin,o=e.wobbleX+e.random*e.tiltCos,l=e.wobbleY+e.random*e.tiltSin;if(t.fillStyle="rgba("+e.color.r+", "+e.color.g+", "+e.color.b+", "+(1-a)+")",t.beginPath(),i&&"path"===e.shape.type&&"string"==typeof e.shape.path&&Array.isArray(e.shape.matrix))t.fill(function(t,e,a,n,r,o,i){var l=new Path2D(t),s=new Path2D;s.addPath(l,new DOMMatrix(e));var c=new Path2D;return c.addPath(s,new DOMMatrix([Math.cos(i)*r,Math.sin(i)*r,-Math.sin(i)*o,Math.cos(i)*o,a,n])),c}(e.shape.path,e.shape.matrix,e.x,e.y,.1*Math.abs(o-n),.1*Math.abs(l-r),Math.PI/10*e.wobble));else if("bitmap"===e.shape.type){var s=Math.PI/10*e.wobble,c=.1*Math.abs(o-n),h=.1*Math.abs(l-r),f=e.shape.bitmap.width*e.scalar,u=e.shape.bitmap.height*e.scalar,d=new DOMMatrix([Math.cos(s)*c,Math.sin(s)*c,-Math.sin(s)*h,Math.cos(s)*h,e.x,e.y]);d.multiplySelf(new DOMMatrix(e.shape.matrix));var m=t.createPattern(w.transform(e.shape.bitmap),"no-repeat");m.setTransform(d),t.globalAlpha=1-a,t.fillStyle=m,t.fillRect(e.x-f/2,e.y-u/2,f,u),t.globalAlpha=1}else if("circle"===e.shape)t.ellipse?t.ellipse(e.x,e.y,Math.abs(o-n)*e.ovalScalar,Math.abs(l-r)*e.ovalScalar,Math.PI/10*e.wobble,0,2*Math.PI):function(t,e,a,n,r,o,i,l,s){t.save(),t.translate(e,a),t.rotate(o),t.scale(n,r),t.arc(0,0,1,i,l,s),t.restore()}(t,e.x,e.y,Math.abs(o-n)*e.ovalScalar,Math.abs(l-r)*e.ovalScalar,Math.PI/10*e.wobble,0,2*Math.PI);else if("star"===e.shape)for(var g=Math.PI/2*3,p=4*e.scalar,b=8*e.scalar,M=e.x,v=e.y,y=5,x=Math.PI/y;y--;)M=e.x+Math.cos(g)*b,v=e.y+Math.sin(g)*b,t.lineTo(M,v),g+=x,M=e.x+Math.cos(g)*p,v=e.y+Math.sin(g)*p,t.lineTo(M,v),g+=x;else t.moveTo(Math.floor(e.x),Math.floor(e.y)),t.lineTo(Math.floor(e.wobbleX),Math.floor(r)),t.lineTo(Math.floor(o),Math.floor(l)),t.lineTo(Math.floor(n),Math.floor(e.wobbleY));return t.closePath(),t.fill(),e.tick<e.totalTicks}function A(t,a){var i,l=!t,s=!!T(a||{},"resize"),h=!1,f=T(a,"disableForReducedMotion",Boolean),u=o&&!!T(a||{},"useWorker")?C():null,d=l?k:B,m=!(!t||!u)&&!!t.__confetti_initialized,g="function"==typeof matchMedia&&matchMedia("(prefers-reduced-motion)").matches;function p(e,a,o){for(var l,s,h,f,u,m=T(e,"particleCount",E),g=T(e,"angle",Number),p=T(e,"spread",Number),b=T(e,"startVelocity",Number),M=T(e,"decay",Number),v=T(e,"gravity",Number),y=T(e,"drift",Number),C=T(e,"colors",S),I=T(e,"ticks",Number),P=T(e,"shapes"),O=T(e,"scalar"),k=!!T(e,"flat"),B=function(t){var e=T(t,"origin",Object);return e.x=T(e,"x",Number),e.y=T(e,"y",Number),e}(e),A=m,R=[],N=t.width*B.x,z=t.height*B.y;A--;)R.push((l={x:N,y:z,angle:g,spread:p,startVelocity:b,color:C[A%C.length],shape:P[(f=0,u=P.length,Math.floor(Math.random()*(u-f))+f)],ticks:I,decay:M,gravity:v,drift:y,scalar:O,flat:k},s=void 0,h=void 0,s=l.angle*(Math.PI/180),h=l.spread*(Math.PI/180),{x:l.x,y:l.y,wobble:10*Math.random(),wobbleSpeed:Math.min(.11,.1*Math.random()+.05),velocity:.5*l.startVelocity+Math.random()*l.startVelocity,angle2D:-s+(.5*h-Math.random()*h),tiltAngle:(.5*Math.random()+.25)*Math.PI,color:l.color,shape:l.shape,tick:0,totalTicks:l.ticks,decay:l.decay,drift:l.drift,random:Math.random()+2,tiltSin:0,tiltCos:0,wobbleX:0,wobbleY:0,gravity:3*l.gravity,ovalScalar:.6,scalar:l.scalar,flat:l.flat}));return i?i.addFettis(R):(i=function(t,e,a,o,i){var l,s,h=e.slice(),f=t.getContext("2d"),u=c((function(e){function c(){l=s=null,f.clearRect(0,0,o.width,o.height),w.clear(),i(),e()}l=x.frame((function e(){!n||o.width===r.width&&o.height===r.height||(o.width=t.width=r.width,o.height=t.height=r.height),o.width||o.height||(a(t),o.width=t.width,o.height=t.height),f.clearRect(0,0,o.width,o.height),(h=h.filter((function(t){return F(f,t)}))).length?l=x.frame(e):c()})),s=c}));return{addFettis:function(t){return h=h.concat(t),u},canvas:t,promise:u,reset:function(){l&&x.cancel(l),s&&s()}}}(t,R,d,a,o),i.promise)}function b(a){var n=f||T(a,"disableForReducedMotion",Boolean),r=T(a,"zIndex",Number);if(n&&g)return c((function(t){t()}));l&&i?t=i.canvas:l&&!t&&(t=function(t){var e=document.createElement("canvas");return e.style.position="fixed",e.style.top="0px",e.style.left="0px",e.style.pointerEvents="none",e.style.zIndex=t,e}(r),document.body.appendChild(t)),s&&!m&&d(t);var o={width:t.width,height:t.height};function b(){if(u){var e={getBoundingClientRect:function(){if(!l)return t.getBoundingClientRect()}};return d(e),void u.postMessage({resize:{width:e.width,height:e.height}})}o.width=o.height=null}function M(){i=null,s&&(h=!1,e.removeEventListener("resize",b)),l&&t&&(document.body.contains(t)&&document.body.removeChild(t),t=null,m=!1)}return u&&!m&&u.init(t),m=!0,u&&(t.__confetti_initialized=!0),s&&!h&&(h=!0,e.addEventListener("resize",b,!1)),u?u.fire(a,o,M):p(a,o,M)}return b.reset=function(){u&&u.reset(),i&&i.reset()},b}function R(){return y||(y=A(null,{useWorker:!0,resize:!0})),y}a.exports=function(){return R().apply(this,arguments)},a.exports.reset=function(){R().reset()},a.exports.create=A,a.exports.shapeFromPath=function(t){if(!i)throw new Error("path confetti are not supported in this browser");var e,a;"string"==typeof t?e=t:(e=t.path,a=t.matrix);var n=new Path2D(e),r=document.createElement("canvas").getContext("2d");if(!a){for(var o,l,s=1e3,c=s,h=s,f=0,u=0,d=0;d<s;d+=2)for(var m=0;m<s;m+=2)r.isPointInPath(n,d,m,"nonzero")&&(c=Math.min(c,d),h=Math.min(h,m),f=Math.max(f,d),u=Math.max(u,m));o=f-c,l=u-h;var g=Math.min(10/o,10/l);a=[g,0,0,g,-Math.round(o/2+c)*g,-Math.round(l/2+h)*g]}return{type:"path",path:e,matrix:a}},a.exports.shapeFromText=function(t){var e,a=1,n="#000000",r='"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "EmojiOne Color", "Android Emoji", "Twemoji Mozilla", "system emoji", sans-serif';"string"==typeof t?e=t:(e=t.text,a="scalar"in t?t.scalar:a,r="fontFamily"in t?t.fontFamily:r,n="color"in t?t.color:n);var o=10*a,i=o+"px "+r,l=new OffscreenCanvas(o,o),s=l.getContext("2d");s.font=i;var c=s.measureText(e),h=Math.ceil(c.actualBoundingBoxRight+c.actualBoundingBoxLeft),f=Math.ceil(c.actualBoundingBoxAscent+c.actualBoundingBoxDescent),u=c.actualBoundingBoxLeft+2,d=c.actualBoundingBoxAscent+2;h+=4,f+=4,(s=(l=new OffscreenCanvas(h,f)).getContext("2d")).font=i,s.fillStyle=n,s.fillText(e,u,d);var m=1/a;return{type:"bitmap",bitmap:l.transferToImageBitmap(),matrix:[m,0,0,m,-h*m/2,-f*m/2]}}}(function(){return void 0!==t?t:"undefined"!=typeof self?self:this||{}}(),e,!1),t.confetti=e.exports}(window,{});

// --- SHARED CONFIG ---
const SOUND_VOLUME = 0.2;
let CURRENT_MODE = 'pb'; // 'pb' or 'rpg'
let CURRENT_DAILY_SCORE_MEM = 0; // Tracks the daily score memory for projection math

let PB_CONFIG = {};

function initPBConfig(tierCount) {
  const baseTiers = [
    { min: 0, max: 19, name: "Pathetic", color: '#0e4429' },          // Very dark green
    { min: 20, max: 29, name: "Underwhelming", color: '#006d32' },   // Dark green
    { min: 30, max: 39, name: "Solid", color: '#26a641' },           // Medium green
    { min: 40, max: 49, name: "Masterful", color: '#39d353' }        // Bright green
  ];

  if (tierCount === 5) {
    PB_CONFIG = {
      DEFAULT_POINTS: 2,
      MAX_BAR_SCORE: 50,
      TIERS: [
        ...baseTiers,
        { min: 50, max: Infinity, name: "God-Like", color: '#6bff82', isGodLike: true }
      ]
    };
  } else if (tierCount === 6) {
    PB_CONFIG = {
      DEFAULT_POINTS: 2,
      MAX_BAR_SCORE: 60,
      TIERS: [
        ...baseTiers,
        { min: 50, max: 59, name: "Unstoppable", color: '#4ae564' },
        { min: 60, max: Infinity, name: "God-Like", color: '#6bff82', isGodLike: true }
      ]
    };
  } else {
    // 7 Tiers (Default)
    PB_CONFIG = {
      DEFAULT_POINTS: 2,
      MAX_BAR_SCORE: 70,
      TIERS: [
        ...baseTiers,
        { min: 50, max: 59, name: "Unstoppable", color: '#4ae564' },
        { min: 60, max: 69, name: "Legendary", color: '#5cf575' },
        { min: 70, max: Infinity, name: "God-Like", color: '#6bff82', isGodLike: true }
      ]
    };
  }
}

// --- SOUNDS ---
function playSound(type) {
  let file = 'assets/plinker.mp3';
  if (type === 'levelup') file = 'assets/level_up.mp3';
  if (type === 'major') file = 'assets/10-levels.mp3';

  const soundUrl = chrome.runtime.getURL(file);
  const audio = new Audio(soundUrl);
  audio.volume = SOUND_VOLUME;
  audio.play().catch(e => {});
}

function triggerConfetti() {
  if (typeof window.confetti === 'function') {
    window.confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, zIndex: 10000 });
  } else if (typeof confetti === 'function') {
    confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, zIndex: 10000 });
  }
}

// ==========================================
//           SYSTEM 1: DAILY PB CHASER
// ==========================================

function initPBMode() {
  console.log(`Daily PB Chaser Mode Activated 🏆 (Max Tiers: ${PB_CONFIG.TIERS.length})`);
  injectPBStyles();
  createPBTracker();
  loadAndResetPBIfNeeded();
  
  // Start the projection loop
  setInterval(updateDailyProjections, 2000);

  // INSTANT UPDATE: Use MutationObserver to instantly detect when tasks are added/removed/edited 
  let debounceTimer;
  const observer = new MutationObserver(() => {
      clearTimeout(debounceTimer);
      // Wait 300ms after DOM settles to run the scrape to avoid lag
      debounceTimer = setTimeout(() => {
        updateDailyProjections();
      }, 300); 
  });
  
  // Start observing the whole body for UI changes
  observer.observe(document.body, { childList: true, subtree: true });
}

function injectPBStyles() {
  const style = document.createElement("style");
  style.id = "pb-styles";
  style.innerText = `
    .pb-tracker-container {
      position: fixed; top: 0; left: 50%; transform: translateX(-50%);
      width: 480px; background-color: #202124; color: white;
      border-radius: 0 0 12px 12px; z-index: 9999;
      box-shadow: 0 5px 20px rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.1);
      border-top: none; padding: 15px; font-family: 'Google Sans', Roboto, sans-serif;
      display: flex; flex-direction: column; gap: 8px; transition: all 0.3s ease;
    }
    .pb-tracker-header { display: flex; justify-content: space-between; align-items: flex-end; }
    .pb-score-wrapper { display: flex; align-items: center; gap: 8px; }
    .pb-score-area { font-size: 20px; font-weight: bold; color: #e8eaed; transition: color 0.3s, text-shadow 0.3s; }

    .god-like-text {
      color: #6bff82 !important; 
      text-shadow: 0 0 10px rgba(107, 255, 130, 0.4);
    }

    .pb-icon-btn {
      font-size: 14px; color: #9aa0a6; background: transparent;
      border: 1px solid #5f6368; border-radius: 4px; width: 24px; height: 24px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.2s; padding: 0;
    }
    .pb-icon-btn:hover { color: #e8eaed; border-color: #bdc1c6; background-color: rgba(255,255,255,0.1); transform: scale(1.05); }

    .pb-target-area { font-size: 13px; color: #bdc1c6; text-transform: uppercase; letter-spacing: 0.5px; transition: color 0.3s, text-shadow 0.3s; }
    
    .pb-bar-bg {
      width: 100%; height: 10px; background: #161b22; border-radius: 5px;
      overflow: hidden; position: relative; border: 1px solid #30363d;
      box-shadow: inset 0 1px 3px rgba(0,0,0,0.5);
    }
    .pb-bar-fill {
      height: 100%; width: 0%; border-radius: 5px 0 0 5px; /* Square end on the right side */
      transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.6s ease, box-shadow 0.6s ease, border-radius 0.1s;
    }
    
    .god-like-bar { 
      box-shadow: 0 0 12px rgba(107, 255, 130, 0.8); 
    }

    /* Milestone Lines */
    .pb-milestone {
      position: absolute; top: 0; bottom: 0; width: 2px;
      background: rgba(255, 255, 255, 0.3); z-index: 10;
    }

    /* Calendar Grid Projected Points Badge - Absolute Positioned to far left edge */
    .pb-day-badge {
      position: absolute;
      left: 8px;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(92, 146, 247, 0.15);
      color: #5c92f7;
      font-size: 11px;
      font-weight: bold;
      padding: 3px 6px;
      border-radius: 6px;
      white-space: nowrap;
      pointer-events: none;
      border: 1px solid rgba(92, 146, 247, 0.3);
      line-height: 1;
      font-family: 'Google Sans', sans-serif;
      z-index: 10;
    }
  `;
  document.head.appendChild(style);
}

function createPBTracker() {
  const container = document.createElement('div');
  container.className = 'pb-tracker-container';
  container.id = 'pb-ui-root';

  // Dynamically generate the milestone divs based on settings
  let milestonesHTML = '';
  PB_CONFIG.TIERS.forEach((tier, index) => {
      // Don't draw a line at 0 (Pathetic) or at the very end boundary (God-Like)
      if (index > 0 && index < PB_CONFIG.TIERS.length - 1) { 
          const pct = (tier.min / PB_CONFIG.MAX_BAR_SCORE) * 100;
          const pctRounded = pct.toFixed(2);
          milestonesHTML += `<div class="pb-milestone" style="left: ${pctRounded}%;" title="${tier.name} (${tier.min})"></div>\n        `;
      }
  });

  container.innerHTML = `
    <div class="pb-tracker-header">
      <div class="pb-score-wrapper">
        <div class="pb-score-area" id="pb-score">0 pts</div>
        <button class="pb-icon-btn" id="pb-stats" title="Statistics">📊</button>
        <button class="pb-icon-btn" id="pb-reset" title="Reset Daily">↺</button>
      </div>
      <div class="pb-target-area" id="pb-target">Pathetic</div>
    </div>
    <div class="pb-bar-bg">
        <div class="pb-bar-fill" id="pb-bar"></div>
        ${milestonesHTML}
    </div>
  `;

  document.body.appendChild(container);

  // Listeners
  document.getElementById('pb-stats').onclick = (e) => { e.stopPropagation(); window.open(chrome.runtime.getURL('statistics.html'), '_blank'); };
  document.getElementById('pb-reset').onclick = (e) => {
    e.stopPropagation();
    if(confirm("Reset daily points?")) {
      chrome.storage.sync.set({dailyScore: 0}, () => {
         updatePBUI(0);
      });
    }
  };
}

function updatePBUI(dailyScore) {
  CURRENT_DAILY_SCORE_MEM = dailyScore; // Update Memory for projections
  
  const scoreDisplay = document.getElementById('pb-score');
  const targetDisplay = document.getElementById('pb-target');
  const barFill = document.getElementById('pb-bar');
  if(!scoreDisplay) return;

  scoreDisplay.innerText = `${dailyScore} pts`;
  
  // Find Current Tier
  const currentTierIndex = PB_CONFIG.TIERS.findIndex(t => dailyScore >= t.min && dailyScore <= t.max);
  const currentTier = PB_CONFIG.TIERS[currentTierIndex] || PB_CONFIG.TIERS[PB_CONFIG.TIERS.length - 1];
  
  targetDisplay.innerText = currentTier.name;
  
  // Reset classes
  scoreDisplay.classList.remove('god-like-text');
  targetDisplay.classList.remove('god-like-text');
  barFill.classList.remove('god-like-bar');

  // Apply specific colors based on tier
  if (currentTier.isGodLike) {
      scoreDisplay.classList.add('god-like-text');
      targetDisplay.classList.add('god-like-text');
      barFill.classList.add('god-like-bar');
  } else if (dailyScore >= 30) {
      scoreDisplay.style.color = '#ffffff';
      targetDisplay.style.color = '#e8eaed';
  } else {
      scoreDisplay.style.color = '#e8eaed';
      targetDisplay.style.color = '#bdc1c6';
  }
  
  // Calculate Bar Width
  const percentage = Math.min((dailyScore / PB_CONFIG.MAX_BAR_SCORE) * 100, 100);
  barFill.style.width = `${percentage}%`;
  barFill.style.backgroundColor = currentTier.color;

  // Handle corner rounding: square until it reaches the end
  if (percentage >= 100) {
      barFill.style.borderRadius = '5px';
  } else {
      barFill.style.borderRadius = '5px 0 0 5px';
  }

  updateDailyProjections();
}

// Core function uses exact native midnight so it aligns perfectly with Google Calendar
function getBusinessDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Unified Date Rollover ensures no points are lost or overridden when leaving PC on overnight
function checkAndApplyDateRollover(data, callback) {
  const todayStr = getBusinessDateString();
  let score = data.dailyScore || 0;
  let history = data.history || [];
  const lastDate = data.lastActiveDate || todayStr;

  if (lastDate !== todayStr) {
    // It's a new day! Save previous day's score accurately.
    const exists = history.find(h => h.date === lastDate);
    if (!exists) {
      history.push({ date: lastDate, score: score });
    }
    score = 0; // Reset score for the actual new day
  }

  chrome.storage.sync.set({
    dailyScore: score,
    lastActiveDate: todayStr,
    history: history
  }, () => {
    if (callback) callback(score);
  });
}

function loadAndResetPBIfNeeded() {
  chrome.storage.sync.get(['dailyScore', 'personalBest', 'lastActiveDate', 'history'], (data) => {
    checkAndApplyDateRollover(data, (safeScore) => {
        updatePBUI(safeScore);
    });
  });
}

function handlePBTaskComplete(points) {
  chrome.storage.sync.get(['dailyScore', 'personalBest', 'lastActiveDate', 'history'], (data) => {
    checkAndApplyDateRollover(data, (safeScore) => {
        let allTimePB = data.personalBest || 5; 
        
        const oldScore = safeScore;
        let newScore = safeScore + points;

        if (newScore > allTimePB) allTimePB = newScore;

        // --- TIER & SOUND LOGIC ---
        const oldTierIndex = PB_CONFIG.TIERS.findIndex(t => oldScore >= t.min && oldScore <= t.max);
        const newTierIndex = PB_CONFIG.TIERS.findIndex(t => newScore >= t.min && newScore <= t.max);

        if (newTierIndex > oldTierIndex && newTierIndex > 0) {
            // Reached the ultimate tier for the current config
            if (PB_CONFIG.TIERS[newTierIndex].isGodLike) playSound('major');
            else playSound('levelup');
            triggerConfetti();
        } else {
            playSound('success');
        }

        chrome.storage.sync.set({
          dailyScore: newScore,
          personalBest: allTimePB 
        }, () => {
          updatePBUI(newScore);
        });
    });
  });
}

// -----------------------------------------------------
// HIGHLY ROBUST PROJECTION LOGIC 
// Uses data-datekey to prevent missing completed tasks
// -----------------------------------------------------
function updateDailyProjections() {
  if (CURRENT_MODE !== 'pb') return;

  const now = new Date(); // Native midnight rollover
  
  // 1. Setup target arrays for Today, Tomorrow, and Day After Tomorrow
  const datesInfo = [0, 1, 2].map(offset => {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    
    const mLong = d.toLocaleDateString('en-US', { month: 'long' }).toLowerCase();
    const mShort = d.toLocaleDateString('en-US', { month: 'short' }).toLowerCase();
    const dayNum = d.getDate();
    
    return {
      offset: offset,
      matchStrings: [
          `${mLong} ${dayNum}`, // "march 24"
          `${mShort} ${dayNum}`  // "mar 24"
      ],
      isToday: offset === 0,
      isTomorrow: offset === 1,
      uncompletedPoints: 0,
      completedPoints: 0,
      targetH2: null
    };
  });

  // 2. Discover Google Calendar's internal 'data-datekey' maps from the headers
  const dateKeyMap = {};
  const headers = document.querySelectorAll('h2');
  
  headers.forEach(h2 => {
      const btn = h2.querySelector('button[data-datekey]');
      const ariaLabel = h2.getAttribute('aria-label') || (btn ? btn.getAttribute('aria-label') : '');
      if (!ariaLabel) return;
      
      const labelLower = ariaLabel.toLowerCase();
      
      // Find which of our 3 tracked days this header belongs to
      const matchedDay = datesInfo.find(d => 
        d.matchStrings.some(str => labelLower.includes(str)) ||
        (d.isToday && labelLower.includes('today')) ||
        (d.isTomorrow && labelLower.includes('tomorrow'))
      );

      if (matchedDay) {
          matchedDay.targetH2 = h2; // Save reference for injecting the badge
          if (btn) {
              const key = btn.getAttribute('data-datekey');
              dateKeyMap[key] = matchedDay.offset; // Map Google's internal ID to our day array offset
          }
      }
  });

  // 3. Parse DOM Task Elements
  const seenTasks = new Set();
  const taskChips = document.querySelectorAll('[data-eventid^="tasks_"]');

  taskChips.forEach(chip => {
    const eventId = chip.getAttribute('data-eventid');
    if (seenTasks.has(eventId)) return;

    let targetDayInfo = null;

    // Strategy A: Bulletproof `data-datekey` tracking
    // This perfectly catches completed tasks that have lost their standard text identifiers
    const containerWithKey = chip.closest('[data-datekey]');
    if (containerWithKey) {
        const key = containerWithKey.getAttribute('data-datekey');
        if (dateKeyMap[key] !== undefined) {
            targetDayInfo = datesInfo.find(d => d.offset === dateKeyMap[key]);
        }
    }

    // Strategy B: ARIA labels and Hidden Embedded Strings (Fallback)
    if (!targetDayInfo) {
        const hiddenSpan = chip.querySelector('.XuJrye');
        const hiddenText = hiddenSpan ? hiddenSpan.textContent.toLowerCase() : "";
        
        const gridcell = chip.closest('[role="gridcell"]');
        let labelText = "";
        if (gridcell) {
            const labelId = gridcell.getAttribute('aria-labelledby');
            const labelEl = labelId ? document.getElementById(labelId) : null;
            if (labelEl) labelText = labelEl.textContent.toLowerCase();
        }

        targetDayInfo = datesInfo.find(d => 
            d.matchStrings.some(str => labelText.includes(str) || hiddenText.includes(str)) || 
            (d.isToday && (labelText.includes('today') || hiddenText.includes('today'))) ||
            (d.isTomorrow && (labelText.includes('tomorrow') || hiddenText.includes('tomorrow')))
        );
    }

    // Only process it if we successfully tied it to Today, Tomorrow, or Day After
    if (targetDayInfo) {
      seenTasks.add(eventId);

      let title = "";
      const titleSpan = chip.querySelector('.WBi6vc');
      const hiddenSpan = chip.querySelector('.XuJrye');
      
      if (titleSpan) title = titleSpan.textContent;
      else if (hiddenSpan) title = hiddenSpan.textContent;
      else title = chip.innerText;

      const points = extractPoints(title);

      // Highly Aggressive Completion Check
      let isCompleted = false;
      if (chip.querySelector('button[aria-label*="uncomplet"]')) isCompleted = true;
      else if (chip.querySelector('button[aria-label*="complete"]')) isCompleted = false;
      else if (chip.querySelector('s, strike, del, [style*="line-through"]')) isCompleted = true;
      else if (hiddenSpan && hiddenSpan.textContent.toLowerCase().includes('not completed')) isCompleted = false;
      else if (hiddenSpan && hiddenSpan.textContent.toLowerCase().includes('completed')) isCompleted = true;

      if (isCompleted) targetDayInfo.completedPoints += points;
      else targetDayInfo.uncompletedPoints += points;
    }
  });

  // 4. Inject Badges into the respective Calendar Headers
  datesInfo.forEach(dayInfo => {
    let projPts = dayInfo.uncompletedPoints;
    
    // Always combine uncompleted with verified completed totals.
    // For "Today", we merge the DOM's completed state with the Extension's memory safely.
    if (dayInfo.isToday) {
      projPts += Math.max(CURRENT_DAILY_SCORE_MEM, dayInfo.completedPoints);
    } else {
      projPts += dayInfo.completedPoints;
    }

    if (dayInfo.targetH2) {
      let badge = dayInfo.targetH2.querySelector('.pb-day-badge');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'pb-day-badge';
        dayInfo.targetH2.style.position = 'relative';
        dayInfo.targetH2.appendChild(badge);
      }
      badge.innerText = `Proj: ${projPts}`;
    }
  });
}

// ==========================================
//           MAIN CONTROLLER
// ==========================================

function extractPoints(text) {
  if (!text) return 2; // Updated to default to 2
  // Robust global regex to catch points anywhere in title without relying on strictly end-of-string
  let match = text.match(/\{(\d+)\}/g);
  if (match && match.length > 0) {
      const lastMatch = match[match.length - 1];
      const num = lastMatch.match(/\d+/)[0];
      return parseInt(num, 10);
  }
  return 2; // Updated to default to 2
}

// Global Click Listener
document.body.addEventListener('click', function(event) {
  const target = event.target;
  const isCheckbox = target.closest('[role="checkbox"]');
  const isListBtn = target.closest('button[data-completed="false"]');
  const isDetailBtn = target.closest('button[aria-label="Mark complete"]');
  const isTextMatch = target.closest('button') && target.closest('button').innerText.includes("Mark completed");

  const element = isListBtn || isCheckbox || isDetailBtn || (isTextMatch ? target.closest('button') : null);
  if (!element) return;

  // Find Title
  let title = "";
  let source = element.closest('[data-taskid]') || element.closest('[role="listitem"]') || element.closest('.kma42e');
  
  if(!source) {
    let candidate = element.parentElement;
    for(let i=0; i<4; i++) {
      if(candidate && candidate.innerText && candidate.innerText.length > 3) { source = candidate; break; }
      if(candidate) candidate = candidate.parentElement;
    }
  }

  if(source) {
    const h = source.querySelector('[role="heading"]');
    title = h ? h.innerText : source.innerText;
  }

  const points = extractPoints(title);
  console.log(`Task done. Mode: ${CURRENT_MODE}. Points: ${points}`);

  if (CURRENT_MODE === 'pb') {
    handlePBTaskComplete(points);
  }
}, true);

// Init
chrome.storage.sync.get(['extensionMode', 'pbTierCount'], (data) => {
  CURRENT_MODE = data.extensionMode || 'pb';
  const tierCount = data.pbTierCount || 7; // Default to 7 tiers

  if (CURRENT_MODE === 'pb') {
    initPBConfig(tierCount);
    initPBMode();
  } else {
    document.getElementById('pb-ui-root')?.remove();
    document.getElementById('pb-styles')?.remove();
  }
});