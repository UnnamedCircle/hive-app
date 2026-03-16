import { useState, useEffect, useRef, useCallback } from "react";
import { db } from './firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

// ─────────────────────────────────────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────────────────────────────────────
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    :root {
      --cream:#FAF7F2; --cream-dark:#F0EAE0; --warm-white:#FFFDF9;
      --brown-light:#C4A882; --brown:#9B7B5A; --brown-dark:#6B5040;
      --espresso:#3D2B1F; --sage:#A8B89A; --blush:#E8C4B0; --blush-light:#F5DDD1;
      --gold:#C9A84C; --gold-light:#F0D98A;
      --text-dark:#2C1A0E; --text-mid:#6B5040; --text-light:#9B8B7A;
      --shadow-warm:rgba(61,43,31,0.12); --shadow-strong:rgba(61,43,31,0.22);
      --urgent:#C0392B; --moderate:#D4850A; --friendly:#5A8A5A;
    }
    html,body,#root{height:100%;}
    body{font-family:'DM Sans',sans-serif;background:var(--cream);color:var(--text-dark);}
    h1,h2,h3{font-family:'Playfair Display',serif;}

    @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
    @keyframes popIn{0%{transform:scale(0.82);opacity:0}70%{transform:scale(1.04)}100%{transform:scale(1);opacity:1}}
    @keyframes floatUp{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-70px) scale(1.3)}}
    @keyframes confettiFall{0%{opacity:1;transform:translateY(-10px) rotate(0deg)}100%{opacity:0;transform:translateY(100px) rotate(540deg)}}
    @keyframes checkBounce{0%{transform:scale(0)}60%{transform:scale(1.25)}100%{transform:scale(1)}}
    @keyframes slideRight{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}
    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}

    .fade-up{animation:fadeUp 0.4s ease both;}
    .pop-in{animation:popIn 0.35s cubic-bezier(.34,1.56,.64,1) both;}

    ::-webkit-scrollbar{width:5px;}
    ::-webkit-scrollbar-track{background:var(--cream-dark);}
    ::-webkit-scrollbar-thumb{background:var(--brown-light);border-radius:3px;}

    .app-shell{display:flex;flex-direction:column;height:100vh;overflow:hidden;}

    .topbar{
      background:var(--espresso);padding:0 16px;
      display:flex;align-items:center;justify-content:space-between;
      height:54px;flex-shrink:0;box-shadow:0 2px 12px var(--shadow-strong);
    }

    .tab-nav{
      background:var(--warm-white);border-bottom:1.5px solid var(--cream-dark);
      display:flex;overflow-x:auto;flex-shrink:0;padding:0 12px;
    }
    .tab-nav::-webkit-scrollbar{display:none;}
    .tab-nav-item{
      display:flex;align-items:center;gap:5px;
      padding:12px 14px;border:none;background:transparent;
      font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;
      color:var(--text-light);cursor:pointer;white-space:nowrap;
      border-bottom:2.5px solid transparent;margin-bottom:-1.5px;transition:all 0.18s ease;
    }
    .tab-nav-item:hover{color:var(--brown);}
    .tab-nav-item.active{color:var(--espresso);border-bottom-color:var(--brown);}

    .content-area{flex:1;overflow-y:auto;padding:22px 18px;}

    .card{background:var(--warm-white);border-radius:18px;box-shadow:0 2px 16px var(--shadow-warm);border:1px solid rgba(196,168,130,0.15);}

    .input-field{
      width:100%;padding:11px 14px;
      border:1.5px solid var(--cream-dark);border-radius:11px;
      background:var(--warm-white);font-family:'DM Sans',sans-serif;
      font-size:14px;color:var(--text-dark);outline:none;transition:border-color 0.2s;
    }
    .input-field:focus{border-color:var(--brown-light);}
    .input-field::placeholder{color:var(--text-light);}
    select.input-field{appearance:none;cursor:pointer;}
    textarea.input-field{resize:vertical;min-height:72px;}

    .btn-primary{
      background:var(--espresso);color:var(--cream);border:none;cursor:pointer;
      font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;
      padding:11px 22px;border-radius:50px;transition:all 0.2s;
    }
    .btn-primary:hover{background:var(--brown-dark);transform:translateY(-1px);box-shadow:0 4px 14px var(--shadow-warm);}
    .btn-primary:disabled{opacity:0.5;cursor:not-allowed;transform:none;}

    .btn-ghost{
      background:transparent;border:1.5px solid var(--brown-light);color:var(--brown-dark);
      cursor:pointer;font-family:'DM Sans',sans-serif;font-size:14px;
      padding:10px 20px;border-radius:50px;transition:all 0.2s;
    }
    .btn-ghost:hover{background:var(--cream-dark);}

    .btn-gold{
      background:linear-gradient(135deg,var(--gold),#B8903C);color:white;
      border:none;cursor:pointer;font-family:'DM Sans',sans-serif;
      font-size:14px;font-weight:500;padding:11px 22px;border-radius:50px;transition:all 0.2s;
    }
    .btn-gold:hover{transform:translateY(-1px);box-shadow:0 4px 18px rgba(201,168,76,0.35);}

    .btn-sm{padding:7px 14px;font-size:12px;}

    .badge{display:inline-flex;align-items:center;gap:3px;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:500;}
    .badge-gold{background:rgba(201,168,76,0.15);color:#7A6010;}
    .badge-sage{background:rgba(168,184,154,0.2);color:#3A5B30;}
    .badge-blush{background:rgba(232,196,176,0.3);color:#7A3020;}
    .badge-brown{background:rgba(155,123,90,0.15);color:var(--brown-dark);}
    .badge-friendly{background:rgba(90,138,90,0.15);color:var(--friendly);}
    .badge-moderate{background:rgba(212,133,10,0.15);color:var(--moderate);}
    .badge-urgent{background:rgba(192,57,43,0.12);color:var(--urgent);}

    .inner-tabs{display:flex;background:var(--cream-dark);border-radius:50px;padding:3px;gap:2px;}
    .inner-tab{
      flex:1;padding:7px 12px;border:none;border-radius:50px;cursor:pointer;
      font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;
      background:transparent;color:var(--text-mid);transition:all 0.18s;
    }
    .inner-tab.active{background:var(--warm-white);color:var(--espresso);box-shadow:0 2px 8px var(--shadow-warm);}

    .task-card{
      background:var(--warm-white);border-radius:14px;
      border:1.5px solid rgba(196,168,130,0.18);padding:14px 16px;
      margin-bottom:9px;display:flex;align-items:center;gap:12px;
      transition:all 0.22s ease;
    }
    .task-card:hover{transform:translateY(-2px);box-shadow:0 6px 20px var(--shadow-warm);}
    .task-card.done-card{opacity:0.5;}

    .check-circle{
      width:27px;height:27px;border-radius:50%;border:2px solid var(--brown-light);
      background:transparent;display:flex;align-items:center;justify-content:center;
      cursor:pointer;transition:all 0.22s;flex-shrink:0;
    }
    .check-circle.checked{background:var(--sage);border-color:var(--sage);animation:checkBounce 0.38s cubic-bezier(.34,1.56,.64,1);}

    .modal-overlay{
      position:fixed;inset:0;z-index:999;
      background:rgba(61,43,31,0.38);backdrop-filter:blur(4px);
      display:flex;align-items:center;justify-content:center;padding:14px;
    }
    .modal-box{
      background:var(--warm-white);border-radius:22px;padding:26px;
      width:100%;max-width:480px;max-height:92vh;overflow-y:auto;
      box-shadow:0 20px 50px var(--shadow-strong);
      animation:popIn 0.3s cubic-bezier(.34,1.56,.64,1);
    }
    .form-label{display:block;font-size:11px;font-weight:500;color:var(--text-mid);margin-bottom:5px;text-transform:uppercase;letter-spacing:0.5px;}

    .store-card{
      background:var(--warm-white);border-radius:16px;
      border:1.5px solid rgba(196,168,130,0.18);overflow:hidden;transition:all 0.22s;
    }
    .store-card:hover{transform:translateY(-3px);box-shadow:0 10px 28px var(--shadow-warm);}

    .lb-row{display:flex;align-items:center;gap:12px;padding:12px 0;}
    .lb-row+.lb-row{border-top:1px solid var(--cream-dark);}

    .avatar-circle{
      border-radius:50%;display:flex;align-items:center;justify-content:center;
      font-weight:700;color:white;flex-shrink:0;
    }

    .pts-float{
      position:fixed;pointer-events:none;z-index:9997;
      font-family:'Playfair Display',serif;font-size:20px;font-weight:700;
      color:var(--gold);text-shadow:0 2px 8px rgba(201,168,76,0.5);
      animation:floatUp 1.4s ease forwards;
    }
    .confetti-bit{
      position:fixed;pointer-events:none;z-index:9998;
      width:7px;height:7px;border-radius:2px;animation:confettiFall 1s ease forwards;
    }
    .toast{
      position:fixed;top:14px;right:14px;z-index:9999;
      background:var(--espresso);color:var(--cream);padding:12px 16px;
      border-radius:12px;font-size:13px;font-weight:500;
      box-shadow:0 8px 28px var(--shadow-strong);animation:slideRight 0.3s ease;max-width:260px;
    }
    .recur-btn{
      flex:1;padding:9px;border:1.5px solid var(--cream-dark);border-radius:9px;
      cursor:pointer;text-align:center;font-size:13px;font-weight:500;
      color:var(--text-mid);background:transparent;transition:all 0.15s;font-family:'DM Sans',sans-serif;
    }
    .recur-btn.sel{border-color:var(--brown);background:rgba(155,123,90,0.1);color:var(--brown-dark);}

    .icon-btn{
      width:34px;height:34px;border:2px solid transparent;border-radius:8px;
      cursor:pointer;background:var(--cream-dark);font-size:17px;
      display:flex;align-items:center;justify-content:center;transition:all 0.12s;
    }
    .icon-btn.sel{border-color:var(--brown);background:rgba(155,123,90,0.12);}
    .icon-btn-gold.sel{border-color:var(--gold);background:rgba(201,168,76,0.15);}

    .chore-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;max-height:230px;overflow-y:auto;}
    .chore-chip{
      padding:9px 10px;border:1.5px solid var(--cream-dark);border-radius:10px;cursor:pointer;
      display:flex;align-items:center;gap:7px;font-size:12px;font-weight:500;
      color:var(--text-dark);background:transparent;transition:all 0.14s;font-family:'DM Sans',sans-serif;
    }
    .chore-chip:hover{border-color:var(--brown-light);}
    .chore-chip.sel{border-color:var(--brown);background:rgba(155,123,90,0.1);}

    .member-card{
      background:var(--warm-white);border-radius:14px;
      border:1.5px solid rgba(196,168,130,0.18);padding:15px 16px;
      display:flex;align-items:center;gap:13px;margin-bottom:9px;transition:box-shadow 0.2s;
    }
    .member-card:hover{box-shadow:0 4px 16px var(--shadow-warm);}

    .progress-track{background:var(--cream-dark);border-radius:50px;height:5px;overflow:hidden;margin-bottom:18px;}
    .progress-fill{height:100%;background:linear-gradient(90deg,var(--sage),var(--brown-light));border-radius:50px;transition:width 0.7s ease;}

    .empty-state{text-align:center;padding:46px 20px;color:var(--text-light);}
    .empty-emoji{font-size:42px;margin-bottom:9px;}
    .empty-title{font-family:'Playfair Display',serif;font-size:19px;color:var(--brown);margin-bottom:5px;}

    /* ── Notification-specific styles ── */
    .notif-status-dot{
      width:9px;height:9px;border-radius:50%;flex-shrink:0;
    }
    .dot-granted{background:#5A8A5A;}
    .dot-denied{background:var(--urgent);}
    .dot-default{background:var(--text-light);}

    .tier-card{
      border:2px solid var(--cream-dark);border-radius:14px;padding:14px 16px;
      cursor:pointer;transition:all 0.18s;background:transparent;width:100%;text-align:left;
      font-family:'DM Sans',sans-serif;
    }
    .tier-card:hover{border-color:var(--brown-light);}
    .tier-card.sel-friendly{border-color:var(--friendly);background:rgba(90,138,90,0.06);}
    .tier-card.sel-moderate{border-color:var(--moderate);background:rgba(212,133,10,0.06);}
    .tier-card.sel-urgent{border-color:var(--urgent);background:rgba(192,57,43,0.05);}

    .notif-log-item{
      padding:12px 0;border-bottom:1px solid var(--cream-dark);
      display:flex;align-items:flex-start;gap:10px;
    }
    .notif-log-item:last-child{border-bottom:none;}

    .toggle-switch{
      position:relative;width:44px;height:24px;flex-shrink:0;
    }
    .toggle-switch input{opacity:0;width:0;height:0;}
    .toggle-slider{
      position:absolute;inset:0;background:var(--cream-dark);
      border-radius:24px;cursor:pointer;transition:background 0.2s;
    }
    .toggle-slider::before{
      content:'';position:absolute;width:18px;height:18px;
      left:3px;top:3px;background:white;border-radius:50%;
      transition:transform 0.2s;box-shadow:0 1px 4px rgba(0,0,0,0.15);
    }
    .toggle-switch input:checked + .toggle-slider{background:var(--sage);}
    .toggle-switch input:checked + .toggle-slider::before{transform:translateX(20px);}

    .auto-notif-row{
      display:flex;align-items:center;justify-content:space-between;gap:12px;
      padding:13px 0;border-bottom:1px solid var(--cream-dark);
    }
    .auto-notif-row:last-child{border-bottom:none;}

    .spinner{
      width:16px;height:16px;border:2px solid rgba(250,247,242,0.3);
      border-top-color:var(--cream);border-radius:50%;
      animation:spin 0.7s linear infinite;display:inline-block;
    }

    .notif-preview{
      background:var(--espresso);border-radius:14px;padding:14px 16px;
      color:var(--cream);display:flex;align-items:flex-start;gap:12px;
    }
  `}</style>
);

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const COMMON_CHORES=[
  {name:"Mow the lawns",icon:"🌿",pts:30},{name:"Vacuum living areas",icon:"🧹",pts:15},
  {name:"Clean the kitchen",icon:"🍽️",pts:20},{name:"Wipe down bathrooms",icon:"🚿",pts:20},
  {name:"Do the laundry",icon:"👕",pts:15},{name:"Fold & put away clothes",icon:"🧺",pts:10},
  {name:"Wash the dishes",icon:"🫧",pts:10},{name:"Take out rubbish",icon:"🗑️",pts:10},
  {name:"Clean the toilets",icon:"🪣",pts:15},{name:"Sweep & mop floors",icon:"🧽",pts:20},
  {name:"Feed the pets",icon:"🐾",pts:8},{name:"Water the plants",icon:"🌱",pts:8},
  {name:"Wipe benchtops",icon:"✨",pts:10},{name:"Empty dishwasher",icon:"💧",pts:8},
  {name:"Clean the windows",icon:"🪟",pts:25},{name:"Tidy the lounge",icon:"🛋️",pts:12},
  {name:"Make the beds",icon:"🛏️",pts:10},{name:"Clean the fridge",icon:"❄️",pts:20},
  {name:"Weed the garden",icon:"🌸",pts:25},{name:"Clean the oven",icon:"🔥",pts:25},
];
const TASK_ICONS=['📌','🏠','✨','🌿','🧹','🍽️','🚿','👕','🧺','🫧','🗑️','🪣','🧽','🐾','🌱','🪟','🛋️','🛏️','❄️','🌸','⭐','💎','🔥','🎯'];
const STORE_EMOJIS=['🎁','🍕','🎮','📱','🍦','🎬','👟','🏖️','🎨','📚','🧁','🎠','💅','🎪','⭐','🏅','🍰','🎉','🛍️','🌟'];
const AVATAR_COLS=['#9B7B5A','#A8B89A','#C4A882','#8B6F5A','#7A9B8A','#B89070','#6B8B7A','#C07070'];
const CONFETTI=['#C9A84C','#A8B89A','#E8C4B0','#9B7B5A','#F0D98A','#C4A882'];

const TIERS = {
  friendly: {
    label:'Friendly',icon:'🌿',color:'var(--friendly)',
    desc:'A gentle nudge — calm and encouraging.',
    vibrate:[100], requireInteraction:false,
    templates:[
      'Hey! A few tasks are waiting for you when you get a chance 🌿',
      'Just a friendly reminder — the home could use a little love today ✨',
      'No rush, but a couple of chores are on the list! 💛',
    ]
  },
  moderate: {
    label:'Moderate',icon:'⚠️',color:'var(--moderate)',
    desc:'A clear reminder — direct but kind.',
    vibrate:[100,50,100], requireInteraction:false,
    templates:[
      'Reminder: some tasks still need to be done today 📋',
      'Tasks are piling up — let\'s get through them together! 💪',
      'A few chores are overdue. Time to get it done! ⏰',
    ]
  },
  urgent: {
    label:'Urgent',icon:'🚨',color:'var(--urgent)',
    desc:'A strong alert — important and immediate.',
    vibrate:[200,100,200,100,200], requireInteraction:true,
    templates:[
      '🚨 Tasks MUST be completed today. Please take action now!',
      'URGENT: Important chores are severely overdue. Action needed immediately.',
      'Last warning — these tasks need to be done RIGHT NOW! 🚨',
    ]
  }
};

const AUTO_TRIGGERS = [
  { id:'morning',    label:'Morning reminder',    desc:'Sent at 8am daily if tasks are pending',         icon:'☀️', defaultTier:'friendly'  },
  { id:'afternoon',  label:'Afternoon check-in',  desc:'Sent at 2pm if tasks still unfinished',          icon:'🌤', defaultTier:'moderate'  },
  { id:'evening',    label:'Evening push',        desc:'Sent at 6pm for anything not done by end of day',icon:'🌙', defaultTier:'moderate'  },
  { id:'overdue',    label:'Overdue alert',       desc:'Sent when a task is 24+ hrs overdue',            icon:'⏰', defaultTier:'urgent'    },
  { id:'completion', label:'Completion cheer',    desc:'Celebrate when all tasks are done!',             icon:'🎉', defaultTier:'friendly'  },
];

let _n=1;
const uid=()=>`u${_n++}`;
const ini=n=>n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
const fmtTime=d=>new Date(d).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
const fmtDate=d=>new Date(d).toLocaleDateString([],{month:'short',day:'numeric'});

// ─────────────────────────────────────────────────────────────────────────────
//  NOTIFICATION ENGINE
// ─────────────────────────────────────────────────────────────────────────────
async function registerSW() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    // In production, point to '/hive-sw.js'
    // In this demo we register an inline SW via blob URL
    const swCode = `
      self.addEventListener('install',()=>self.skipWaiting());
      self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
      self.addEventListener('notificationclick',function(e){
        e.notification.close();
        e.waitUntil(self.clients.matchAll({type:'window'}).then(c=>{
          if(c.length)c[0].focus(); else self.clients.openWindow('/');
        }));
      });
      self.addEventListener('message',function(e){
        if(e.data&&e.data.type==='SHOW_NOTIFICATION'){
          const{title,body,tier,tag}=e.data;
          const vibrate={friendly:[100],moderate:[100,50,100],urgent:[200,100,200,100,200]};
          const req={friendly:false,moderate:false,urgent:true};
          e.waitUntil(self.registration.showNotification(title,{
            body,tag:tag||'hive',
            requireInteraction:req[tier]||false,
            vibrate:vibrate[tier]||[100],
            icon:'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🏡</text></svg>',
          }));
        }
      });
    `;
    const blob = new Blob([swCode], {type:'application/javascript'});
    const url = URL.createObjectURL(blob);
    const reg = await navigator.serviceWorker.register(url, {scope:'/'});
    await navigator.serviceWorker.ready;
    return reg;
  } catch(e) {
    console.warn('SW registration failed:', e);
    return null;
  }
}

async function requestNotifPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  const result = await Notification.requestPermission();
  return result;
}

async function sendNotification(swReg, {title, body, tier, tag}) {
  if (Notification.permission !== 'granted') return false;
  try {
    if (swReg && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({type:'SHOW_NOTIFICATION',title,body,tier,tag});
    } else if (swReg) {
      await swReg.showNotification(title, {
        body, tag: tag||'hive',
        requireInteraction: tier==='urgent',
        vibrate: TIERS[tier]?.vibrate||[100],
        icon:'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🏡</text></svg>',
      });
    } else {
      new Notification(title, {body, tag});
    }
    return true;
  } catch(e) {
    // Fallback: basic Notification API
    try { new Notification(title, {body}); return true; } catch(_) { return false; }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  TINY SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function Toast({msg,onDone}){
  useEffect(()=>{const t=setTimeout(onDone,2800);return()=>clearTimeout(t)},[]);
  return <div className="toast">{msg}</div>;
}
function Av({name,color,size=40}){
  return <div className="avatar-circle" style={{background:color,width:size,height:size,fontSize:size*0.34}}>{ini(name)}</div>;
}
function PtsCount({pts}){
  const [d,setD]=useState(pts);const prev=useRef(pts);
  useEffect(()=>{
    if(pts===prev.current)return;
    const diff=pts-prev.current,steps=18;let s=0;
    const iv=setInterval(()=>{s++;setD(Math.round(prev.current+diff*s/steps));
      if(s>=steps){clearInterval(iv);setD(pts);prev.current=pts;}},35);
    return()=>clearInterval(iv);
  },[pts]);
  return <span>{d.toLocaleString()}</span>;
}
function Toggle({checked,onChange}){
  return (
    <label className="toggle-switch">
      <input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)}/>
      <span className="toggle-slider"/>
    </label>
  );
}

function boom(x,y){
  for(let i=0;i<16;i++){
    const e=document.createElement('div');e.className='confetti-bit';
    e.style.cssText=`left:${x+(Math.random()-.5)*60}px;top:${y}px;background:${CONFETTI[i%CONFETTI.length]};animation-duration:${0.6+Math.random()*0.7}s;animation-delay:${Math.random()*0.2}s`;
    document.body.appendChild(e);setTimeout(()=>e.remove(),1800);
  }
}
function floatPts(x,y,p){
  const e=document.createElement('div');e.className='pts-float';
  e.textContent=`+${p}pts`;e.style.cssText=`left:${x-25}px;top:${y-10}px`;
  document.body.appendChild(e);setTimeout(()=>e.remove(),1500);
}

// ─────────────────────────────────────────────────────────────────────────────
//  MODALS
// ─────────────────────────────────────────────────────────────────────────────
function AddTaskModal({members,onSave,onClose}){
  const [tab,setTab]=useState('common');
  const [selC,setSelC]=useState(null);
  const [name,setName]=useState('');const [icon,setIcon]=useState('📌');
  const [pts,setPts]=useState(15);const [assignTo,setAssignTo]=useState('');
  const [repeats,setRepeats]=useState(false);
  const [every,setEvery]=useState(1);const [unit,setUnit]=useState('days');

  function pickChore(c){setSelC(c);setName(c.name);setIcon(c.icon);setPts(c.pts);setTab('custom');}
  function save(){
    if(!name.trim())return;
    onSave({id:uid(),name:name.trim(),icon,points:Number(pts),assignedTo:assignTo||null,
      recurrence:repeats?`Every ${every} ${unit}`:null,completedBy:[],createdAt:Date.now()});
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
          <h2 style={{fontSize:'20px',color:'var(--espresso)'}}>Add a task</h2>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:'20px',cursor:'pointer',color:'var(--text-light)'}}>✕</button>
        </div>
        <div className="inner-tabs" style={{marginBottom:'16px'}}>
          <button className={`inner-tab ${tab==='common'?'active':''}`} onClick={()=>setTab('common')}>Common chores</button>
          <button className={`inner-tab ${tab==='custom'?'active':''}`} onClick={()=>setTab('custom')}>Custom</button>
        </div>
        {tab==='common'&&(
          <div>
            <p style={{fontSize:'13px',color:'var(--text-light)',marginBottom:'11px'}}>Tap a chore to pre-fill it.</p>
            <div className="chore-grid">
              {COMMON_CHORES.map(c=>(
                <button key={c.name} className={`chore-chip ${selC?.name===c.name?'sel':''}`} onClick={()=>pickChore(c)}>
                  <span>{c.icon}</span>{c.name}
                </button>
              ))}
            </div>
          </div>
        )}
        {tab==='custom'&&(
          <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
            <div><label className="form-label">Task name</label><input className="input-field" placeholder="e.g. Clean the patio" value={name} onChange={e=>setName(e.target.value)}/></div>
            <div>
              <label className="form-label">Icon</label>
              <div style={{display:'flex',flexWrap:'wrap',gap:'5px',marginTop:'2px'}}>
                {TASK_ICONS.map(ic=><button key={ic} className={`icon-btn ${icon===ic?'sel':''}`} onClick={()=>setIcon(ic)}>{ic}</button>)}
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'11px'}}>
              <div><label className="form-label">Points</label><input className="input-field" type="number" min="1" max="999" value={pts} onChange={e=>setPts(e.target.value)}/></div>
              <div>
                <label className="form-label">Assign to</label>
                <select className="input-field" value={assignTo} onChange={e=>setAssignTo(e.target.value)}>
                  <option value="">Anyone</option>
                  {members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="form-label">Repeat</label>
              <div style={{display:'flex',gap:'8px',marginBottom:'8px'}}>
                <button className={`recur-btn ${!repeats?'sel':''}`} onClick={()=>setRepeats(false)}>One-off</button>
                <button className={`recur-btn ${repeats?'sel':''}`} onClick={()=>setRepeats(true)}>Repeating</button>
              </div>
              {repeats&&(
                <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                  <span style={{fontSize:'13px',color:'var(--text-mid)',whiteSpace:'nowrap'}}>Every</span>
                  <input className="input-field" type="number" min="1" value={every} onChange={e=>setEvery(e.target.value)} style={{width:'62px'}}/>
                  <select className="input-field" value={unit} onChange={e=>setUnit(e.target.value)}>
                    <option value="days">Days</option><option value="weeks">Weeks</option><option value="months">Months</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}
        <div style={{display:'flex',gap:'10px',marginTop:'20px'}}>
          <button className="btn-ghost" onClick={onClose} style={{flex:1}}>Cancel</button>
          <button className="btn-primary" onClick={save} style={{flex:2}}>Add task</button>
        </div>
      </div>
    </div>
  );
}

function InviteModal({onSave,onClose}){
  const [name,setName]=useState('');const [email,setEmail]=useState('');
  const [pass,setPass]=useState('');const [role,setRole]=useState('family');
  function save(){if(!name.trim()||!email.trim()||!pass)return;onSave({name:name.trim(),email:email.trim(),pass,role});onClose();}
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
          <h2 style={{fontSize:'20px',color:'var(--espresso)'}}>Invite a member</h2>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:'20px',cursor:'pointer',color:'var(--text-light)'}}>✕</button>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'13px'}}>
          <div><label className="form-label">Name</label><input className="input-field" placeholder="e.g. Jake" value={name} onChange={e=>setName(e.target.value)}/></div>
          <div><label className="form-label">Email</label><input className="input-field" type="email" placeholder="jake@email.com" value={email} onChange={e=>setEmail(e.target.value)}/></div>
          <div><label className="form-label">Temp password</label><input className="input-field" type="password" placeholder="Set a password for them" value={pass} onChange={e=>setPass(e.target.value)}/></div>
          <div>
            <label className="form-label">Role</label>
            <select className="input-field" value={role} onChange={e=>setRole(e.target.value)}>
              <option value="family">Partner / Family</option><option value="teen">Teen</option><option value="kid">Kid</option>
            </select>
          </div>
          <p style={{fontSize:'12px',color:'var(--text-light)',lineHeight:1.6}}>They sign in with this email & password. Role is set automatically on login.</p>
          <div style={{display:'flex',gap:'10px',marginTop:'4px'}}>
            <button className="btn-ghost" onClick={onClose} style={{flex:1}}>Cancel</button>
            <button className="btn-primary" onClick={save} style={{flex:2}}>Invite member</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddRewardModal({onSave,onClose}){
  const [name,setName]=useState('');const [cost,setCost]=useState(50);
  const [emoji,setEmoji]=useState('🎁');const [img,setImg]=useState('');
  function handleFile(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>setImg(r.result);r.readAsDataURL(f);}
  function save(){if(!name.trim())return;onSave({id:uid(),name:name.trim(),cost:Number(cost),emoji,image:img});onClose();}
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
          <h2 style={{fontSize:'20px',color:'var(--espresso)'}}>Add reward</h2>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:'20px',cursor:'pointer',color:'var(--text-light)'}}>✕</button>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'13px'}}>
          <div><label className="form-label">Reward name</label><input className="input-field" placeholder="e.g. Pizza night" value={name} onChange={e=>setName(e.target.value)}/></div>
          <div><label className="form-label">Point cost</label><input className="input-field" type="number" min="1" value={cost} onChange={e=>setCost(e.target.value)}/></div>
          <div>
            <label className="form-label">Icon</label>
            <div style={{display:'flex',flexWrap:'wrap',gap:'5px',marginTop:'2px'}}>
              {STORE_EMOJIS.map(em=><button key={em} className={`icon-btn icon-btn-gold ${emoji===em?'sel':''}`} style={{borderColor:emoji===em?'var(--gold)':undefined,background:emoji===em?'rgba(201,168,76,0.15)':undefined}} onClick={()=>setEmoji(em)}>{em}</button>)}
            </div>
          </div>
          <div>
            <label className="form-label">Upload image (optional)</label>
            <input type="file" accept="image/*" onChange={handleFile} style={{fontSize:'13px',color:'var(--text-mid)'}}/>
            {img&&<img src={img} alt="" style={{width:'100%',height:'100px',objectFit:'cover',borderRadius:'9px',marginTop:'8px'}}/>}
          </div>
          <div style={{display:'flex',gap:'10px',marginTop:'4px'}}>
            <button className="btn-ghost" onClick={onClose} style={{flex:1}}>Cancel</button>
            <button className="btn-gold" onClick={save} style={{flex:2}}>Add reward</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  TASK CARD
// ─────────────────────────────────────────────────────────────────────────────
function TaskCard({task,userId,members,onComplete,canDelete,onDelete}){
  const done=task.completedBy.includes(userId);
  const ref=useRef(null);
  function check(){
    if(done)return;
    const r=ref.current.getBoundingClientRect();
    boom(r.left+r.width/2,r.top+r.height/2);
    floatPts(r.left+r.width/2,r.top+r.height/2,task.points);
    onComplete(task.id,userId,task.points);
  }
  const assignee=task.assignedTo?members.find(m=>m.id===task.assignedTo):null;
  return (
    <div className={`task-card ${done?'done-card':''}`}>
      <div ref={ref} className={`check-circle ${done?'checked':''}`} onClick={check}>
        {done&&<span style={{color:'white',fontSize:'13px',fontWeight:700}}>✓</span>}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:'flex',alignItems:'center',gap:'6px',flexWrap:'wrap'}}>
          <span style={{fontSize:'15px'}}>{task.icon}</span>
          <span style={{fontWeight:500,fontSize:'14px',color:'var(--text-dark)',textDecoration:done?'line-through':'none'}}>{task.name}</span>
        </div>
        <div style={{display:'flex',gap:'6px',marginTop:'5px',flexWrap:'wrap',alignItems:'center'}}>
          <span className="badge badge-gold">✦ {task.points} pts</span>
          {task.recurrence&&<span className="badge badge-sage">{task.recurrence}</span>}
          {assignee&&<span className="badge badge-blush">👤 {assignee.name.split(' ')[0]}</span>}
          {!task.assignedTo&&<span style={{fontSize:'11px',color:'var(--text-light)'}}>Anyone</span>}
        </div>
      </div>
      {canDelete&&<button onClick={()=>onDelete(task.id)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-light)',fontSize:'18px',padding:'2px 6px'}}>×</button>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  NOTIFICATION PANEL (admin)
// ─────────────────────────────────────────────────────────────────────────────
function NotificationsPanel({swReg, notifPermission, onRequestPermission, notifLog, onSendNotif, autoConfig, onAutoConfig}){
  const [tab,setTab]=useState('manual');
  const [tier,setTier]=useState('friendly');
  const [customMsg,setCustomMsg]=useState('');
  const [useTemplate,setUseTemplate]=useState(true);
  const [selTemplate,setSelTemplate]=useState(0);
  const [sending,setSending]=useState(false);

  const tierInfo=TIERS[tier];

  async function handleSend(){
    const body=useTemplate?tierInfo.templates[selTemplate]:customMsg.trim();
    if(!body)return;
    setSending(true);
    const ok=await onSendNotif({title:'🏡 Hive',body,tier,tag:`hive-manual-${Date.now()}`});
    setSending(false);
    if(!ok)alert('Notification failed. Make sure permissions are granted and you\'re on a supported browser.');
  }

  const permColor = notifPermission==='granted'?'var(--friendly)':notifPermission==='denied'?'var(--urgent)':'var(--text-light)';
  const permLabel = notifPermission==='granted'?'Granted':notifPermission==='denied'?'Blocked':notifPermission==='unsupported'?'Not supported':'Not yet granted';

  return (
    <div className="fade-up">
      <h2 style={{fontSize:'24px',color:'var(--espresso)',letterSpacing:'-0.3px',marginBottom:'5px'}}>Notifications</h2>
      <p style={{color:'var(--text-light)',fontSize:'13px',marginBottom:'20px'}}>Manage push notifications for your household.</p>

      {/* Permission status card */}
      <div className="card" style={{padding:'18px',marginBottom:'16px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px',flexWrap:'wrap'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <div className="notif-status-dot" style={{background:permColor}}/>
            <div>
              <div style={{fontWeight:600,fontSize:'14px',color:'var(--espresso)'}}>Push notifications</div>
              <div style={{fontSize:'12px',color:'var(--text-light)',marginTop:'2px'}}>Status: <span style={{color:permColor,fontWeight:500}}>{permLabel}</span></div>
            </div>
          </div>
          {notifPermission!=='granted'&&notifPermission!=='denied'&&notifPermission!=='unsupported'&&(
            <button className="btn-primary btn-sm" onClick={onRequestPermission}>Enable</button>
          )}
          {notifPermission==='denied'&&(
            <span style={{fontSize:'12px',color:'var(--urgent)'}}>Unblock in browser settings</span>
          )}
          {notifPermission==='unsupported'&&(
            <span style={{fontSize:'12px',color:'var(--text-light)'}}>Add to Home Screen for push support</span>
          )}
        </div>
        {notifPermission!=='granted'&&(
          <div style={{marginTop:'12px',padding:'11px',background:'var(--cream)',borderRadius:'10px',fontSize:'12px',color:'var(--text-mid)',lineHeight:1.6}}>
            💡 <strong>How to enable:</strong> Click "Enable" above and allow notifications in the browser prompt. 
            For full push support when the app is closed, add Hive to your Home Screen (Safari → Share → Add to Home Screen on iOS; Chrome → Install App on Android).
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="inner-tabs" style={{marginBottom:'18px'}}>
        <button className={`inner-tab ${tab==='manual'?'active':''}`} onClick={()=>setTab('manual')}>Manual send</button>
        <button className={`inner-tab ${tab==='auto'?'active':''}`} onClick={()=>setTab('auto')}>Auto triggers</button>
        <button className={`inner-tab ${tab==='log'?'active':''}`} onClick={()=>setTab('log')}>Log</button>
      </div>

      {/* ── MANUAL SEND ── */}
      {tab==='manual'&&(
        <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
          {/* Tier selector */}
          <div>
            <label className="form-label">Notification tier</label>
            <div style={{display:'flex',flexDirection:'column',gap:'8px',marginTop:'4px'}}>
              {Object.entries(TIERS).map(([key,t])=>(
                <button key={key} className={`tier-card sel-${tier===key?key:''}`} onClick={()=>{setTier(key);setSelTemplate(0);}}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                    <span style={{fontSize:'20px'}}>{t.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                        <span style={{fontWeight:600,fontSize:'14px',color:tier===key?t.color:'var(--text-dark)'}}>{t.label}</span>
                        {tier===key&&<span className={`badge badge-${key}`}>Selected</span>}
                      </div>
                      <div style={{fontSize:'12px',color:'var(--text-light)',marginTop:'2px'}}>{t.desc}</div>
                    </div>
                    <div style={{width:'18px',height:'18px',borderRadius:'50%',border:`2px solid ${tier===key?t.color:'var(--cream-dark)'}`,background:tier===key?t.color:'transparent',transition:'all 0.15s'}}/>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="form-label">Message</label>
            <div style={{display:'flex',gap:'8px',marginBottom:'10px'}}>
              <button className={`recur-btn ${useTemplate?'sel':''}`} onClick={()=>setUseTemplate(true)}>Use template</button>
              <button className={`recur-btn ${!useTemplate?'sel':''}`} onClick={()=>setUseTemplate(false)}>Custom message</button>
            </div>
            {useTemplate?(
              <div style={{display:'flex',flexDirection:'column',gap:'7px'}}>
                {tierInfo.templates.map((t,i)=>(
                  <button key={i} onClick={()=>setSelTemplate(i)}
                    style={{textAlign:'left',padding:'11px 14px',borderRadius:'11px',cursor:'pointer',fontSize:'13px',lineHeight:1.5,fontFamily:'DM Sans,sans-serif',
                      border:`1.5px solid ${selTemplate===i?tierInfo.color:'var(--cream-dark)'}`,
                      background:selTemplate===i?`rgba(${tierInfo.color==='var(--friendly)'?'90,138,90':tierInfo.color==='var(--moderate)'?'212,133,10':'192,57,43'},0.05)`:'transparent',
                      color:'var(--text-dark)',transition:'all 0.15s'}}>
                    {t}
                  </button>
                ))}
              </div>
            ):(
              <textarea className="input-field" placeholder="Type your custom notification message…" value={customMsg} onChange={e=>setCustomMsg(e.target.value)} style={{minHeight:'80px'}}/>
            )}
          </div>

          {/* Preview */}
          <div>
            <label className="form-label">Preview</label>
            <div className="notif-preview">
              <span style={{fontSize:'22px'}}>🏡</span>
              <div>
                <div style={{fontWeight:600,fontSize:'13px',marginBottom:'3px'}}>Hive</div>
                <div style={{fontSize:'13px',opacity:0.85,lineHeight:1.5}}>
                  {useTemplate?tierInfo.templates[selTemplate]:customMsg||'Your message will appear here…'}
                </div>
                <div style={{fontSize:'11px',opacity:0.5,marginTop:'5px'}}>
                  {tierInfo.icon} {tierInfo.label} · now
                </div>
              </div>
            </div>
          </div>

          <button
            className="btn-primary"
            disabled={notifPermission!=='granted'||sending}
            onClick={handleSend}
            style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}
          >
            {sending&&<span className="spinner"/>}
            {sending?'Sending…':'Send notification now'}
          </button>
          {notifPermission!=='granted'&&<p style={{fontSize:'12px',color:'var(--text-light)',textAlign:'center'}}>Enable notifications above to send.</p>}
        </div>
      )}

      {/* ── AUTO TRIGGERS ── */}
      {tab==='auto'&&(
        <div>
          <p style={{fontSize:'13px',color:'var(--text-light)',marginBottom:'16px',lineHeight:1.6}}>
            Set up automatic notifications that fire based on task activity. Toggle each one on/off and choose the tier.
          </p>
          <div className="card" style={{padding:'18px'}}>
            {AUTO_TRIGGERS.map((trigger,i)=>{
              const cfg=autoConfig[trigger.id]||{enabled:false,tier:trigger.defaultTier};
              return (
                <div key={trigger.id} className="auto-notif-row">
                  <span style={{fontSize:'20px'}}>{trigger.icon}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:500,fontSize:'14px',color:'var(--espresso)'}}>{trigger.label}</div>
                    <div style={{fontSize:'12px',color:'var(--text-light)',marginTop:'2px'}}>{trigger.desc}</div>
                    {cfg.enabled&&(
                      <div style={{display:'flex',alignItems:'center',gap:'6px',marginTop:'7px',flexWrap:'wrap'}}>
                        <span style={{fontSize:'12px',color:'var(--text-mid)'}}>Tier:</span>
                        {Object.entries(TIERS).map(([key,t])=>(
                          <button key={key} onClick={()=>onAutoConfig(trigger.id,{...cfg,tier:key})}
                            style={{padding:'3px 10px',border:`1.5px solid ${cfg.tier===key?t.color:'var(--cream-dark)'}`,borderRadius:'20px',cursor:'pointer',fontSize:'11px',fontWeight:500,fontFamily:'DM Sans,sans-serif',
                              background:cfg.tier===key?`rgba(${key==='friendly'?'90,138,90':key==='moderate'?'212,133,10':'192,57,43'},0.08)`:'transparent',
                              color:cfg.tier===key?t.color:'var(--text-light)',transition:'all 0.15s'}}>
                            {t.icon} {t.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Toggle checked={cfg.enabled} onChange={v=>onAutoConfig(trigger.id,{...cfg,enabled:v})}/>
                </div>
              );
            })}
          </div>
          <p style={{fontSize:'12px',color:'var(--text-light)',marginTop:'12px',lineHeight:1.6,padding:'0 4px'}}>
            ⚠️ Auto triggers simulate timing logic. For true scheduled pushes when the app is closed, connect a backend with a VAPID server (see <em>hive-sw.js</em>).
          </p>
        </div>
      )}

      {/* ── LOG ── */}
      {tab==='log'&&(
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
            <p style={{fontSize:'13px',color:'var(--text-light)'}}>{notifLog.length} notification{notifLog.length!==1?'s':''} sent</p>
          </div>
          {notifLog.length===0&&(
            <div className="empty-state"><div className="empty-emoji">🔔</div><div className="empty-title">No notifications yet</div><p style={{fontSize:'13px'}}>Send one manually or enable auto triggers.</p></div>
          )}
          <div className="card" style={{padding:'16px 18px'}}>
            {[...notifLog].reverse().map((n,i)=>(
              <div key={i} className="notif-log-item">
                <span style={{fontSize:'18px'}}>{TIERS[n.tier]?.icon||'🔔'}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:'7px',flexWrap:'wrap',marginBottom:'3px'}}>
                    <span style={{fontWeight:500,fontSize:'13px',color:'var(--espresso)'}}>{n.title}</span>
                    <span className={`badge badge-${n.tier}`}>{TIERS[n.tier]?.label}</span>
                    <span style={{fontSize:'11px',color:'var(--text-light)'}}>{n.auto?'Auto':'Manual'}</span>
                  </div>
                  <div style={{fontSize:'12px',color:'var(--text-mid)',lineHeight:1.5}}>{n.body}</div>
                  <div style={{fontSize:'11px',color:'var(--text-light)',marginTop:'4px'}}>{fmtDate(n.sentAt)} at {fmtTime(n.sentAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  LOGIN
// ─────────────────────────────────────────────────────────────────────────────
function Login({users,onLogin,onRegister}){
  const [tab,setTab]=useState('login');
  const [email,setEmail]=useState('');const [pass,setPass]=useState('');
  const [name,setName]=useState('');const [err,setErr]=useState('');

  function doLogin(){
    const u=users.find(u=>u.email.toLowerCase()===email.trim().toLowerCase()&&u.pass===pass);
    if(!u){setErr('Incorrect email or password.');return;}onLogin(u);
  }
  function doReg(){
    if(!email.trim()||!pass||!name.trim()){setErr('Please fill in all fields.');return;}
    if(users.some(u=>u.email.toLowerCase()===email.trim().toLowerCase())){setErr('Email already in use.');return;}
    onRegister(email.trim(),pass,name.trim());
  }

  return (
    <div style={{minHeight:'100vh',background:'var(--cream)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div style={{width:'100%',maxWidth:'390px'}} className="fade-up">
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <div style={{fontSize:'44px',marginBottom:'10px'}}>🏡</div>
          <h1 style={{fontSize:'34px',color:'var(--espresso)',letterSpacing:'-1px',lineHeight:1}}>Hive</h1>
          <p style={{color:'var(--text-light)',fontSize:'14px',marginTop:'7px',fontStyle:'italic'}}>Your home, beautifully organised.</p>
        </div>
        <div className="card" style={{padding:'26px'}}>
          <div className="inner-tabs" style={{marginBottom:'20px'}}>
            <button className={`inner-tab ${tab==='login'?'active':''}`} onClick={()=>{setTab('login');setErr('')}}>Sign in</button>
            <button className={`inner-tab ${tab==='register'?'active':''}`} onClick={()=>{setTab('register');setErr('')}}>Create home</button>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'13px'}}>
            {tab==='register'&&<div><label className="form-label">Your name</label><input className="input-field" placeholder="e.g. Sarah" value={name} onChange={e=>setName(e.target.value)}/></div>}
            <div><label className="form-label">Email</label><input className="input-field" type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(tab==='login'?doLogin():doReg())}/></div>
            <div><label className="form-label">Password</label><input className="input-field" type="password" placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(tab==='login'?doLogin():doReg())}/></div>
            {err&&<p style={{color:'#c0392b',fontSize:'13px'}}>{err}</p>}
            {tab==='register'&&<p style={{fontSize:'12px',color:'var(--text-light)',lineHeight:1.6}}>Registering makes you the <strong>Admin</strong> — you manage the home, invite members, and control tasks & notifications.</p>}
            <button className="btn-primary" style={{width:'100%',padding:'13px',marginTop:'4px'}} onClick={tab==='login'?doLogin:doReg}>
              {tab==='login'?'Sign in':'Create my home'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
// ── localStorage helper (session only) ────────────────────────────────────────
function lsGet(key, fallback) {
  try { const v=localStorage.getItem(key); return v?JSON.parse(v):fallback; } catch{ return fallback; }
}
function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch(e){ console.warn('localStorage full',e); }
}

const DEFAULT_TASKS = [
  {id:uid(),name:'Vacuum living areas',icon:'🧹',points:15,assignedTo:null,recurrence:'Every 2 days',completedBy:[],createdAt:1},
  {id:uid(),name:'Clean the kitchen',icon:'🍽️',points:20,assignedTo:null,recurrence:'Every 1 days',completedBy:[],createdAt:2},
  {id:uid(),name:'Mow the lawns',icon:'🌿',points:30,assignedTo:null,recurrence:'Every 2 weeks',completedBy:[],createdAt:3},
  {id:uid(),name:'Take out rubbish',icon:'🗑️',points:10,assignedTo:null,recurrence:'Every 1 weeks',completedBy:[],createdAt:4},
];
const DEFAULT_STORE = [
  {id:uid(),name:'Pizza night',emoji:'🍕',image:'',cost:60},
  {id:uid(),name:'Movie pick',emoji:'🎬',image:'',cost:40},
  {id:uid(),name:'Ice cream run',emoji:'🍦',image:'',cost:25},
];
const DEFAULT_AUTO = Object.fromEntries(AUTO_TRIGGERS.map(t=>[t.id,{enabled:false,tier:t.defaultTier}]));

const HIVE_DOC = doc(db, 'hive', 'data');

export default function App(){
  // ── Firestore-backed shared state ──
  const [loading,  setLoading]   = useState(true);
  const [users,    setUsersRaw]  = useState([]);
  const [tasks,    setTasksRaw]  = useState(DEFAULT_TASKS);
  const [store,    setStoreRaw]  = useState(DEFAULT_STORE);
  const [notifLog, setNotifLogRaw]= useState([]);
  const [autoConfig,setAutoConfigRaw]= useState(DEFAULT_AUTO);

  // ── Device-local session ──
  const [curId,    setCurIdRaw]  = useState(()=>lsGet('hive_session', null));
  const setCurId = v=>{ const n=typeof v==='function'?v(curId):v; setCurIdRaw(n); lsSet('hive_session',n); };

  // Track whether the initial snapshot has been received (suppress writes before then)
  const firestoreReady = useRef(false);

  // Listen for real-time Firestore updates
  useEffect(()=>{
    const unsub = onSnapshot(HIVE_DOC, snap => {
      if(snap.exists()){
        const d = snap.data();
        if(d.users      !== undefined) setUsersRaw(d.users);
        if(d.tasks      !== undefined) setTasksRaw(d.tasks);
        if(d.store      !== undefined) setStoreRaw(d.store);
        if(d.notifLog   !== undefined) setNotifLogRaw(d.notifLog);
        if(d.autoConfig !== undefined) setAutoConfigRaw(d.autoConfig);
      } else {
        // First time — seed the document with defaults
        setDoc(HIVE_DOC, {
          users: [],
          tasks: DEFAULT_TASKS,
          store: DEFAULT_STORE,
          notifLog: [],
          autoConfig: DEFAULT_AUTO,
        });
      }
      firestoreReady.current = true;
      setLoading(false);
    }, err => {
      console.error('Firestore snapshot error:', err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Helpers to update state + write back to Firestore atomically
  const fsWrite = useCallback((patch) => {
    if(!firestoreReady.current) return;
    setDoc(HIVE_DOC, patch, { merge: true });
  }, []);

  const setUsers = v => {
    setUsersRaw(prev => {
      const n = typeof v==='function' ? v(prev) : v;
      fsWrite({ users: n });
      return n;
    });
  };
  const setTasks = v => {
    setTasksRaw(prev => {
      const n = typeof v==='function' ? v(prev) : v;
      fsWrite({ tasks: n });
      return n;
    });
  };
  const setStore = v => {
    setStoreRaw(prev => {
      const n = typeof v==='function' ? v(prev) : v;
      fsWrite({ store: n });
      return n;
    });
  };
  const setNotifLog = v => {
    setNotifLogRaw(prev => {
      const n = typeof v==='function' ? v(prev) : v;
      fsWrite({ notifLog: n });
      return n;
    });
  };
  const setAutoConfig = v => {
    setAutoConfigRaw(prev => {
      const n = typeof v==='function' ? v(prev) : v;
      fsWrite({ autoConfig: n });
      return n;
    });
  };

  if(loading) return (
    <>
      <FontLoader/>
      <div style={{
        minHeight:'100vh', background:'var(--cream)',
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        gap:'16px',
      }}>
        <div style={{fontSize:'52px'}}>🏡</div>
        <h2 style={{
          fontFamily:"'Playfair Display',serif",
          fontSize:'22px', color:'var(--espresso)',
          fontWeight:400,
        }}>Loading your home…</h2>
      </div>
    </>
  );

  const [notifPermission,setNotifPermission]=useState(
    typeof Notification!=='undefined'?Notification.permission:'unsupported'
  );
  const swRegRef=useRef(null);

  const [view,setView]=useState('tasks');
  const [toast,setToast]=useState(null);
  const [modal,setModal]=useState(null);

  const cu=users.find(u=>u.id===curId)||null;
  const isAdmin=cu?.role==='admin';

  // Register service worker on mount
  useEffect(()=>{
    registerSW().then(reg=>{ swRegRef.current=reg; });
    // Re-check notification permission (may have changed since last visit)
    if(typeof Notification!=='undefined') setNotifPermission(Notification.permission);
  },[]);

  // Auto-trigger simulation: check every 60s when app is open
  useEffect(()=>{
    if(!isAdmin||notifPermission!=='granted')return;
    const iv=setInterval(()=>{
      const pendingCount=tasks.filter(t=>t.completedBy.length===0).length;
      const hour=new Date().getHours();
      // Morning: 8am
      if(hour===8&&autoConfig.morning?.enabled&&pendingCount>0){
        triggerAutoNotif('morning',`☀️ Good morning! You have ${pendingCount} task${pendingCount>1?'s':''} waiting today.`);
      }
      // Afternoon: 14
      if(hour===14&&autoConfig.afternoon?.enabled&&pendingCount>0){
        triggerAutoNotif('afternoon',`🌤 Afternoon check-in — ${pendingCount} task${pendingCount>1?'s still need':' still needs'} attention.`);
      }
      // Evening: 18
      if(hour===18&&autoConfig.evening?.enabled&&pendingCount>0){
        triggerAutoNotif('evening',`🌙 Evening reminder — ${pendingCount} task${pendingCount>1?'s aren\'t':'isn\'t'} done yet!`);
      }
      // All done
      if(autoConfig.completion?.enabled&&pendingCount===0&&tasks.length>0){
        triggerAutoNotif('completion','🎉 Amazing work — all tasks are done! The home is sparkling.');
      }
    }, 60000);
    return()=>clearInterval(iv);
  },[isAdmin,notifPermission,tasks,autoConfig]);

  async function triggerAutoNotif(triggerId, body){
    const tier=autoConfig[triggerId]?.tier||'friendly';
    const title='🏡 Hive';
    await sendNotification(swRegRef.current,{title,body,tier,tag:`hive-auto-${triggerId}`});
    setNotifLog(prev=>[...prev,{title,body,tier,sentAt:Date.now(),auto:true,triggerId}]);
  }

  async function handleSendNotif({title,body,tier,tag}){
    const ok=await sendNotification(swRegRef.current,{title,body,tier,tag});
    if(ok) setNotifLog(prev=>[...prev,{title,body,tier,sentAt:Date.now(),auto:false}]);
    return ok;
  }

  async function handleRequestPermission(){
    const result=await requestNotifPermission();
    setNotifPermission(result);
    if(result==='granted') toastMsg('Notifications enabled! ✓');
    else if(result==='denied') toastMsg('Notifications blocked. Check browser settings.');
  }

  function handleAutoConfig(triggerId,cfg){
    setAutoConfig(prev=>({...prev,[triggerId]:cfg}));
  }

  function toastMsg(m){setToast(m);}
  function handleLogin(u){setCurId(u.id);}
  function handleRegister(email,pass,name){
    const u={id:uid(),email,pass,name,role:'admin',points:0,color:AVATAR_COLS[0]};
    setUsers(p=>[...p,u]);setCurId(u.id);
  }
  function handleInvite({name,email,pass,role}){
    const u={id:uid(),email,pass,name,role,points:0,color:AVATAR_COLS[users.length%AVATAR_COLS.length]};
    setUsers(p=>[...p,u]);toastMsg(`${name} added! ✓`);
  }
  function handleLogout(){
    setCurId(null);   // clears persisted session ID — all other data stays
    setView('tasks');
  }
  function handleAddTask(task){setTasks(p=>[task,...p]);setModal(null);toastMsg('Task added ✓');}
  function handleComplete(taskId,userId,pts){
    setTasks(p=>p.map(t=>t.id===taskId?{...t,completedBy:[...t.completedBy,userId]}:t));
    setUsers(p=>p.map(u=>u.id===userId?{...u,points:u.points+pts}:u));
    setTimeout(()=>toastMsg(`🎉 +${pts} points earned!`),220);
  }
  function handleDeleteTask(id){setTasks(p=>p.filter(t=>t.id!==id));}
  function handleAddReward(item){setStore(p=>[...p,item]);setModal(null);toastMsg('Reward added ✓');}
  function handleBuy(item){
    if(!cu||cu.points<item.cost){toastMsg('Not enough points! Keep going 💪');return;}
    setUsers(p=>p.map(u=>u.id===cu.id?{...u,points:u.points-item.cost}:u));
    toastMsg(`🎁 ${item.name} redeemed!`);
  }

  const NAV=[
    {id:'tasks',label:'✓  Tasks'},
    {id:'store',label:'✦  Store'},
    ...(isAdmin?[
      {id:'members',label:'👥  Members'},
      {id:'admin',label:'⚙️  Admin'},
      {id:'notifications',label:'🔔  Notifications'},
    ]:[]),
    {id:'leaderboard',label:'🏅  Leaderboard'},
  ];

  if(!cu) return <><FontLoader/><Login users={users} onLogin={handleLogin} onRegister={handleRegister}/></>;

  const myTasks=isAdmin?tasks:tasks.filter(t=>!t.assignedTo||t.assignedTo===cu.id);
  const pending=myTasks.filter(t=>!t.completedBy.includes(cu.id));
  const doneT=myTasks.filter(t=>t.completedBy.includes(cu.id));
  const pct=myTasks.length?Math.round(doneT.length/myTasks.length*100):0;

  return (
    <>
      <FontLoader/>
      {toast&&<Toast msg={toast} onDone={()=>setToast(null)}/>}
      {modal==='addTask'&&<AddTaskModal members={users.filter(u=>u.role!=='admin')} onSave={handleAddTask} onClose={()=>setModal(null)}/>}
      {modal==='invite'&&<InviteModal onSave={handleInvite} onClose={()=>setModal(null)}/>}
      {modal==='addReward'&&<AddRewardModal onSave={handleAddReward} onClose={()=>setModal(null)}/>}

      <div className="app-shell">
        {/* TOP BAR */}
        <div className="topbar">
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <span style={{fontSize:'20px'}}>🏡</span>
            <h1 style={{fontSize:'21px',color:'var(--cream)',letterSpacing:'-0.4px'}}>Hive</h1>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            {/* Notif indicator for admin */}
            {isAdmin&&(
              <button onClick={()=>setView('notifications')} title="Notifications"
                style={{background:'none',border:'none',cursor:'pointer',fontSize:'18px',position:'relative',padding:'4px'}}>
                🔔
                {notifPermission!=='granted'&&<span style={{position:'absolute',top:2,right:2,width:7,height:7,background:'var(--urgent)',borderRadius:'50%',display:'block'}}/>}
              </button>
            )}
            <div style={{background:'rgba(201,168,76,0.2)',border:'1px solid rgba(201,168,76,0.3)',borderRadius:'50px',padding:'5px 12px',display:'flex',alignItems:'center',gap:'5px'}}>
              <span style={{color:'var(--gold-light)',fontSize:'11px'}}>✦</span>
              <span style={{color:'var(--gold-light)',fontWeight:600,fontSize:'14px',fontFamily:'Playfair Display,serif'}}>
                <PtsCount pts={cu.points}/>
              </span>
            </div>
            <div style={{cursor:'pointer'}} onClick={handleLogout} title="Sign out">
              <Av name={cu.name} color={cu.color} size={32}/>
            </div>
          </div>
        </div>

        {/* TAB NAV */}
        <div className="tab-nav">
          {NAV.map(n=>(
            <button key={n.id} className={`tab-nav-item ${view===n.id?'active':''}`} onClick={()=>setView(n.id)}>{n.label}</button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="content-area">

          {/* TASKS */}
          {view==='tasks'&&(
            <div className="fade-up">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'16px',flexWrap:'wrap',gap:'10px'}}>
                <div>
                  <h2 style={{fontSize:'24px',color:'var(--espresso)',letterSpacing:'-0.3px'}}>{isAdmin?'All tasks':'My tasks'}</h2>
                  <p style={{color:'var(--text-light)',fontSize:'13px',marginTop:'3px'}}>{doneT.length}/{myTasks.length} completed</p>
                </div>
                {isAdmin&&<button className="btn-primary" onClick={()=>setModal('addTask')}>+ Add task</button>}
              </div>
              {myTasks.length>0&&<div className="progress-track"><div className="progress-fill" style={{width:`${pct}%`}}/></div>}
              {myTasks.length===0&&<div className="empty-state"><div className="empty-emoji">🌿</div><div className="empty-title">No tasks yet</div><p style={{fontSize:'13px'}}>{isAdmin?'Add some tasks above!':'Check back soon.'}</p></div>}
              {pending.map((t,i)=>(
                <div key={t.id} style={{animation:`fadeUp 0.3s ease ${i*0.05}s both`}}>
                  <TaskCard task={t} userId={cu.id} members={users} onComplete={handleComplete} canDelete={isAdmin} onDelete={handleDeleteTask}/>
                </div>
              ))}
              {doneT.length>0&&(
                <>
                  <div style={{display:'flex',alignItems:'center',gap:'8px',margin:'16px 0 10px'}}>
                    <div style={{flex:1,height:'1px',background:'var(--cream-dark)'}}/>
                    <span style={{fontSize:'11px',color:'var(--text-light)',fontWeight:500,whiteSpace:'nowrap'}}>Completed ✓</span>
                    <div style={{flex:1,height:'1px',background:'var(--cream-dark)'}}/>
                  </div>
                  {doneT.map(t=><TaskCard key={t.id} task={t} userId={cu.id} members={users} onComplete={()=>{}} canDelete={isAdmin} onDelete={handleDeleteTask}/>)}
                </>
              )}
            </div>
          )}

          {/* STORE */}
          {view==='store'&&(
            <div className="fade-up">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'16px',flexWrap:'wrap',gap:'10px'}}>
                <div>
                  <h2 style={{fontSize:'24px',color:'var(--espresso)',letterSpacing:'-0.3px'}}>Reward store</h2>
                  <p style={{color:'var(--text-light)',fontSize:'13px',marginTop:'3px'}}>Spend your hard-earned points ✨</p>
                </div>
                {isAdmin&&<button className="btn-gold" onClick={()=>setModal('addReward')}>+ Add reward</button>}
              </div>
              <div style={{background:'linear-gradient(135deg,var(--espresso),var(--brown-dark))',borderRadius:'16px',padding:'20px',marginBottom:'20px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div>
                  <div style={{color:'rgba(250,247,242,0.55)',fontSize:'12px',marginBottom:'3px'}}>Your balance</div>
                  <div style={{color:'var(--gold-light)',fontSize:'34px',fontFamily:'Playfair Display,serif',fontWeight:700,lineHeight:1}}>
                    <PtsCount pts={cu.points}/><span style={{fontSize:'15px',marginLeft:'5px',color:'rgba(240,217,138,0.6)'}}>pts</span>
                  </div>
                </div>
                <span style={{fontSize:'32px',opacity:0.35}}>✦</span>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))',gap:'13px'}}>
                {store.map((item,i)=>(
                  <div key={item.id} className="store-card" style={{animation:`fadeUp 0.35s ease ${i*0.07}s both`}}>
                    <div style={{height:'105px',background:item.image?`url(${item.image}) center/cover`:'linear-gradient(135deg,var(--cream-dark),var(--blush-light))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'42px'}}>
                      {!item.image&&item.emoji}
                    </div>
                    <div style={{padding:'13px'}}>
                      <div style={{fontWeight:600,fontSize:'13px',marginBottom:'9px',color:'var(--espresso)'}}>{item.name}</div>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'5px',flexWrap:'wrap'}}>
                        <span className="badge badge-gold">✦ {item.cost}</span>
                        <button onClick={()=>handleBuy(item)}
                          style={{padding:'6px 11px',borderRadius:'50px',border:'none',cursor:'pointer',
                            fontFamily:'DM Sans,sans-serif',fontSize:'12px',fontWeight:500,
                            background:cu.points>=item.cost?'var(--espresso)':'var(--cream-dark)',
                            color:cu.points>=item.cost?'var(--cream)':'var(--text-light)',transition:'all 0.2s'}}>
                          {cu.points>=item.cost?'Redeem':'Need more'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {store.length===0&&<p style={{color:'var(--text-light)',fontSize:'14px',gridColumn:'1/-1'}}>No rewards yet.</p>}
              </div>
            </div>
          )}

          {/* MEMBERS */}
          {view==='members'&&isAdmin&&(
            <div className="fade-up">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'18px',flexWrap:'wrap',gap:'10px'}}>
                <div>
                  <h2 style={{fontSize:'24px',color:'var(--espresso)',letterSpacing:'-0.3px'}}>Members</h2>
                  <p style={{color:'var(--text-light)',fontSize:'13px',marginTop:'3px'}}>{users.length} {users.length===1?'person':'people'} in your home</p>
                </div>
                <button className="btn-primary" onClick={()=>setModal('invite')}>+ Invite member</button>
              </div>
              {users.map((u,i)=>(
                <div key={u.id} className="member-card" style={{animation:`fadeUp 0.3s ease ${i*0.07}s both`}}>
                  <Av name={u.name} color={u.color} size={42}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:'7px',flexWrap:'wrap',marginBottom:'3px'}}>
                      <span style={{fontWeight:600,fontSize:'14px',color:'var(--espresso)'}}>{u.name}</span>
                      <span className={`badge ${u.role==='admin'?'badge-brown':u.role==='kid'?'badge-blush':'badge-sage'}`}>{u.role}</span>
                      {u.id===cu.id&&<span style={{fontSize:'11px',color:'var(--text-light)'}}>(you)</span>}
                    </div>
                    <span style={{fontSize:'12px',color:'var(--text-light)'}}>{u.email}</span>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{fontFamily:'Playfair Display,serif',fontWeight:700,fontSize:'19px',color:'var(--brown)'}}>{u.points.toLocaleString()}</div>
                    <div style={{fontSize:'11px',color:'var(--text-light)'}}>pts</div>
                  </div>
                </div>
              ))}
              {users.length===0&&<div className="empty-state"><div className="empty-emoji">👨‍👩‍👧‍👦</div><div className="empty-title">Your home is empty</div><p style={{fontSize:'13px'}}>Invite family members above.</p></div>}
            </div>
          )}

          {/* ADMIN */}
          {view==='admin'&&isAdmin&&(
            <div className="fade-up">
              <h2 style={{fontSize:'24px',color:'var(--espresso)',letterSpacing:'-0.3px',marginBottom:'5px'}}>Admin panel</h2>
              <p style={{color:'var(--text-light)',fontSize:'13px',marginBottom:'20px'}}>Manage everything from here.</p>
              <div style={{display:'grid',gap:'13px',marginBottom:'20px'}}>
                <div className="card" style={{padding:'20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'10px'}}>
                  <div><div style={{fontWeight:600,fontSize:'15px',color:'var(--espresso)',marginBottom:'3px'}}>Tasks</div><div style={{fontSize:'12px',color:'var(--text-light)'}}>{tasks.length} total · {tasks.filter(t=>t.recurrence).length} repeating</div></div>
                  <button className="btn-primary" onClick={()=>setModal('addTask')}>+ Add task</button>
                </div>
                <div className="card" style={{padding:'20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'10px'}}>
                  <div><div style={{fontWeight:600,fontSize:'15px',color:'var(--espresso)',marginBottom:'3px'}}>Members</div><div style={{fontSize:'12px',color:'var(--text-light)'}}>{users.length} in your home</div></div>
                  <button className="btn-primary" onClick={()=>setModal('invite')}>+ Invite</button>
                </div>
                <div className="card" style={{padding:'20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'10px'}}>
                  <div><div style={{fontWeight:600,fontSize:'15px',color:'var(--espresso)',marginBottom:'3px'}}>Reward store</div><div style={{fontSize:'12px',color:'var(--text-light)'}}>{store.length} rewards available</div></div>
                  <button className="btn-gold" onClick={()=>setModal('addReward')}>+ Add reward</button>
                </div>
                <div className="card" style={{padding:'20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'10px'}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:'15px',color:'var(--espresso)',marginBottom:'3px'}}>Notifications</div>
                    <div style={{fontSize:'12px',color:notifPermission==='granted'?'var(--friendly)':'var(--text-light)'}}>
                      {notifPermission==='granted'?`✓ Active · ${notifLog.length} sent`:'Not yet enabled'}
                    </div>
                  </div>
                  <button className="btn-primary" onClick={()=>setView('notifications')}>Manage</button>
                </div>
              </div>
              <div className="card" style={{padding:'20px'}}>
                <div style={{fontWeight:600,fontSize:'15px',color:'var(--espresso)',marginBottom:'13px'}}>All tasks</div>
                {tasks.length===0&&<p style={{fontSize:'13px',color:'var(--text-light)'}}>No tasks yet.</p>}
                {tasks.map((t,i)=>(
                  <div key={t.id} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 0',borderTop:i>0?'1px solid var(--cream-dark)':'none'}}>
                    <span style={{fontSize:'16px'}}>{t.icon}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:500,fontSize:'13px',color:'var(--text-dark)'}}>{t.name}</div>
                      <div style={{fontSize:'11px',color:'var(--text-light)',marginTop:'2px'}}>
                        {t.points} pts · {t.recurrence||'One-off'} · {t.assignedTo?users.find(u=>u.id===t.assignedTo)?.name||'Unknown':'Anyone'}
                      </div>
                    </div>
                    <button onClick={()=>handleDeleteTask(t.id)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-light)',fontSize:'18px',padding:'2px 6px'}}>×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {view==='notifications'&&isAdmin&&(
            <NotificationsPanel
              swReg={swRegRef.current}
              notifPermission={notifPermission}
              onRequestPermission={handleRequestPermission}
              notifLog={notifLog}
              onSendNotif={handleSendNotif}
              autoConfig={autoConfig}
              onAutoConfig={handleAutoConfig}
            />
          )}

          {/* LEADERBOARD */}
          {view==='leaderboard'&&(
            <div className="fade-up">
              <h2 style={{fontSize:'24px',color:'var(--espresso)',letterSpacing:'-0.3px',marginBottom:'5px'}}>Leaderboard</h2>
              <p style={{color:'var(--text-light)',fontSize:'13px',marginBottom:'20px'}}>Who's crushing it? 🏅</p>
              <div className="card" style={{padding:'18px'}}>
                {[...users].sort((a,b)=>b.points-a.points).map((u,i)=>(
                  <div key={u.id} className="lb-row" style={{animation:`fadeUp 0.3s ease ${i*0.07}s both`}}>
                    <div style={{width:'26px',textAlign:'center',fontFamily:'Playfair Display,serif',fontWeight:700,fontSize:i===0?'19px':'14px',color:i===0?'var(--gold)':i===1?'var(--brown-light)':i===2?'var(--brown)':'var(--text-light)'}}>
                      {i===0?'👑':i===1?'🥈':i===2?'🥉':i+1}
                    </div>
                    <Av name={u.name} color={u.color} size={36}/>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:500,fontSize:'14px',color:'var(--espresso)'}}>{u.name}{u.id===cu.id&&<span style={{fontSize:'11px',color:'var(--text-light)',marginLeft:'5px'}}>(you)</span>}</div>
                      <div style={{fontSize:'11px',color:'var(--text-light)'}}>{u.role}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontFamily:'Playfair Display,serif',fontWeight:700,fontSize:'18px',color:i===0?'var(--gold)':'var(--brown)'}}>{u.points.toLocaleString()}</div>
                      <div style={{fontSize:'11px',color:'var(--text-light)'}}>pts</div>
                    </div>
                  </div>
                ))}
                {users.length===0&&<p style={{textAlign:'center',color:'var(--text-light)',padding:'20px'}}>Complete tasks to earn points!</p>}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
