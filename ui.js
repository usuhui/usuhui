// UI templates, modals, and chimes
function openModal(){document.getElementById('modalOverlay').classList.remove('hidden')}
function closeModal(){document.getElementById('modalOverlay').classList.add('hidden');document.getElementById('modalBox').innerHTML=''}

function chime(type){
 try{
  const A=window.AudioContext||window.webkitAudioContext;if(!A)return;const c=new A(),o=c.createOscillator(),g=c.createGain();
  o.connect(g);g.connect(c.destination);o.type="sine";o.frequency.value=type==="achievement"?660:520;g.gain.setValueAtTime(.0001,c.currentTime);g.gain.exponentialRampToValueAtTime(.07,c.currentTime+.02);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.22);o.start();o.stop(c.currentTime+.24);
 }catch(e){}
}

function toast(t){
 const e=document.getElementById("toast");e.textContent=t;e.classList.add("show");
 setTimeout(()=>e.classList.remove("show"),2200);
}
