let children, activeChildId, child, goals, achievements, cycle;

function initAppAfterAuth(){
 try{
  children = JSON.parse(storage.getItem("ltChildren") || "[]");
  activeChildId = storage.getItem("ltActiveChildId") || (children[0] ? children[0].id : null);
  child = children.find(c => c.id === activeChildId) || children[0] || null;
  loadChildData();
 }catch(e){children=[];child=null;}
 
 updateChildSelector();
 if(children.length === 0){
  openAddChildFlow();
 } else {
  render();
 }
 
 // Auto-save trigger every 1 minute with visual toast message
 setInterval(() => {
  if(child) {
   saveAllChildren();
   saveChildData();
   toast("Автоматаар хадгалагдлаа");
  }
 }, 60000);
}

function getWeekKey(){
 const d=new Date();const onejan=new Date(d.getFullYear(),0,1);
 return d.getFullYear()+"-"+Math.ceil((((d-onejan)/86400000)+onejan.getDay()+1)/7);
}

function updateChildSelector(){
 const sel = document.getElementById("childSelect");
 const noLabel = document.getElementById("noChildLabel");
 if(!children.length){
  sel.innerHTML = ""; sel.classList.add("hidden"); noLabel.classList.remove("hidden"); return;
 }
 sel.classList.remove("hidden"); noLabel.classList.add("hidden");
 sel.innerHTML = children.map(c => `<option value="${c.id}" ${child && c.id === child.id ? 'selected' : ''}>${c.name} (${c.age} настай)</option>`).join("");
}

function switchChild(id){
 const found = children.find(c => c.id === id);
 if(found){
  child = found; activeChildId = child.id;
  storage.setItem("ltActiveChildId", activeChildId);
  loadChildData(); render();
  toast(`${child.name} руу шилжлээ`);
 }
}

function loadChildData(){
 if(!child) return;
 goals = JSON.parse(storage.getItem(`ltGoals_${child.id}`) || "[]");
 achievements = JSON.parse(storage.getItem(`ltAchievements_${child.id}`) || "[]");
 cycle = storage.getItem(`ltCycle_${child.id}`) || getWeekKey();
}

function openAddChildFlow(){
 if(children.length >= MAX_FREE_CHILDREN){renderPaywallModal();return}
 renderAddChildModal();
}

let pendingChildGender = 'neutral';
let pendingFocusSelection = [];

function renderPaywallModal(){
 document.getElementById('modalBox').innerHTML = `
  <button class="modalClose" onclick="closeModal()">✕</button>
  <h2>Төлбөртэй багц шаардлагатай</h2>
  <p class="muted">Та 6 сарын хязгаартаа хүрсэн байна. 12 сарын эрх нээхийн тулд 5 оронтой код бүхий багц ашиглана уу.</p>
  <button class="primary" onclick="closeModal()">Хаах</button>`;
 openModal();
}

function renderAddChildModal(){
 pendingChildGender = 'neutral';
 document.getElementById('modalBox').innerHTML = `
  <button class="modalClose" onclick="closeModal()">✕</button>
  <h2>Хүүхэд нэмэх</h2>
  <label>Нэр</label><input id="nc_name" placeholder="Хүүхдийн нэр">
  <label>Нас</label><input id="nc_age" type="number" min="5" max="16" value="8">
  <label>Хүйс</label>
  <div class="genderChoices">
   <button type="button" class="genderBtn" id="nc_genderBoy" onclick="selectNewChildGender('boy')">Хүү</button>
   <button type="button" class="genderBtn" id="nc_genderGirl" onclick="selectNewChildGender('girl')">Охин</button>
   <button type="button" class="genderBtn sel-neutral" id="nc_genderNeutral" onclick="selectNewChildGender('neutral')">Ерөнхий</button>
  </div>
  <br><button class="primary" onclick="submitNewChild()">Үргэлжлүүлэх</button>`;
 openModal();
}

function selectNewChildGender(val){
 pendingChildGender = val;
 ['Boy','Girl','Neutral'].forEach(g=>{
  const btn=document.getElementById('nc_gender'+g);
  if(btn) btn.className = 'genderBtn' + (g.toLowerCase()===val ? ' sel-'+val : '');
 });
}

function submitNewChild(){
 const name = document.getElementById('nc_name').value.trim();
 if(!name){alert("Нэр оруулна уу.");return}
 let age = +document.getElementById('nc_age').value || 8;
 const newChild = {id:'c_'+Date.now(), name, age, gender:pendingChildGender, focusAreas:[]};
 children.push(newChild);
 saveAllChildren();
 switchChild(newChild.id);
 closeModal();
 render();
}

function toggleGoal(id){
 const g=goals.find(x=>x.id===id);if(!g)return;g.done=!g.done;saveChildData();
 if(g.done){chime("goal");}
 renderGoals();renderGrowth();renderDashboard();
}

function addAchievement(){
 const text=document.getElementById("achievementText").value.trim();if(!text)return;
 achievements.unshift({id:Date.now(),text,cat:+document.getElementById("achievementCat").value,score:+document.getElementById("achievementScore").value,date:new Date().toLocaleDateString(),cycle:getWeekKey()});
 saveChildData();document.getElementById("achievementText").value="";renderAchievements();renderGrowth();renderDashboard();toast("Амжилт тэмдэглэгдлээ!");chime("achievement");
}

function weeklyPercent(){
 const currentGoals=goals.filter(g=>g.cycle===getWeekKey()||!g.cycle);
 const currentAch=achievements.filter(a=>a.cycle===getWeekKey()||!a.cycle);
 const gp=currentGoals.length?currentGoals.filter(g=>g.done).length/currentGoals.length:0;
 const ap=currentAch.length?currentAch.reduce((s,a)=>s+a.score,0)/(currentAch.length*5):0;
 let p=Math.round((gp*.6+ap*.4)*100);
 return Math.min(100,p);
}

function renderGrowth(){
 const p=weeklyPercent();
 document.getElementById("homePercent").textContent=p+"%";
 document.getElementById("homeBar").style.width=p+"%";
}

function renderGoals(){
 document.getElementById("goalList").innerHTML=goals.length?goals.map(g=>`<div class="goalRow">
 <div style="display:flex;gap:12px;align-items:center"><input class="check" type="checkbox" ${g.done?"checked":""} onchange="toggleGoal(${g.id})"><div><b>${g.text}</b><br><span class="small muted">${categories[g.cat].icon} ${categories[g.cat].name} • ${g.freq}</span></div></div>
 <span class="badge">${g.done?"Биелсэн":"Хийгдэж байгаа"}</span></div>`).join(""):"<p class='muted'>Зорилго байхгүй байна.</p>";
}

function renderAchievements(){
 document.getElementById("achievementList").innerHTML=achievements.length?achievements.map(a=>`<div class="achievementRow"><div><b>${a.text}</b><br><span class="small muted">${categories[a.cat].icon} ${categories[a.cat].name} • ${a.date}</span></div></div>`).join(""):"<p class='muted'>Амжилт байхгүй байна.</p>";
}

function renderDashboard(){
 const p=weeklyPercent();
 document.getElementById("dashboardContent").innerHTML=`<div class="weekBanner"><div class="weekTop"><b>Гэр бүлийн өсөлт</b><b class="percent">${p}%</b></div><div class="progress"><i style="width:${p}%"></i></div></div>`;
}

function render(){
 if(!child) return;
 updateChildSelector();
 document.getElementById("welcome").textContent=`${child.name}-ийн Бяцхан Мод`;
 document.getElementById("ageBadge").textContent=`${child.age} НАСТАЙ`;
 renderGoals(); renderAchievements(); renderDashboard(); renderGrowth();
}

function saveAllChildren(){
 storage.setItem("ltChildren", JSON.stringify(children));
 storage.setItem("ltActiveChildId", activeChildId);
}

function saveChildData(){
 storage.setItem(`ltGoals_${child.id}`,JSON.stringify(goals));
 storage.setItem(`ltAchievements_${child.id}`,JSON.stringify(achievements));
}

function show(id,btn){
 document.querySelectorAll("section").forEach(s=>s.classList.add("hidden"));
 document.getElementById(id).classList.remove("hidden");
 document.querySelectorAll(".nav button").forEach(b=>b.classList.remove("active"));
 if(btn) btn.classList.add("active");
}
