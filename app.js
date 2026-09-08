// app.js - Contains embedded storage, categories, authorization, and application logic

// --- Embedded Data & Storage ---
const memoryStore = {};
const storage = {
 getItem(key){try{return localStorage.getItem(key)}catch(e){return memoryStore[key]||null}},
 setItem(key,val){try{localStorage.setItem(key,val)}catch(e){memoryStore[key]=val}},
 removeItem(key){try{localStorage.removeItem(key)}catch(e){delete memoryStore[key]}}
};

const categories = [
 {name:"Хэл яриа ба харилцаа",icon:"💬"},
 {name:"Унших ба бичиг үсэг",icon:"📚"},
 {name:"Математик сэтгэлгээ",icon:"🔢"},
 {name:"Шинжлэх ухаан ба туршилт",icon:"🔬"},
 {name:"Бие бялдрын хөгжил",icon:"⚽"},
 {name:"Нийгэм ба сэтгэл хөдлөл",icon:"❤️"},
 {name:"Бүтээлч урлаг ба гар урлал",icon:"🎨"},
 {name:"Амьдрах ухаан ба бие даадал",icon:"🌟"},
 {name:"Логик ба асуудал шийдвэрлэх",icon:"🧩"},
 {name:"Тэсвэр хатуужил ба зорилго",icon:"🛡️"},
 {name:"Санхүүгийн суурь боловсрол",icon:"💰"},
 {name:"Дижитал зөв боловсрол",icon:"💻"}
];

// --- Embedded Authorization ---
const VALID_USERS = {
  "99112233": "48291",
  "88994455": "71356",
  "99001122": "19483"
};

function verifyCredentials(phone, code) {
  if (!VALID_USERS[phone]) {
    return { success: false, message: "Энэ утасны дугаар системд бүртгэгдээгүй байна." };
  }
  if (VALID_USERS[phone] !== code) {
    return { success: false, message: "Нэвтрэх код буруу байна. Зөвхөн тухайн дугаарт олгогдсон 5 оронтой кодыг оруулна уу." };
  }
  return { success: true };
}

function showGeneratedCodeHint() {
 const phone = document.getElementById('loginPhone').value.trim();
 if(phone.length !== 8) {
  alert("Эхлээд 8 оронтой утасны дугаараа оруулна уу.");
  return;
 }
 alert(VALID_USERS[phone] ? `Энэ дугаарын нууц код: ${VALID_USERS[phone]}` : "Энэ дугаар бүртгэлгүй байна.");
}

// --- Application Logic & State ---
let currentUserPhone = null;
let children = [];
let activeChildId = null;
let child = null;
let goals = [];
let achievements = [];
let tempOnboardFocus = [];

function handleLogin() {
 const phone = document.getElementById('loginPhone').value.trim();
 const code = document.getElementById('loginCode').value.trim();
 
 const authResult = verifyCredentials(phone, code);
 if (!authResult.success) {
  alert(authResult.message);
  return;
 }

 currentUserPhone = phone;
 storage.setItem("ltActiveUserPhone", currentUserPhone);
 document.getElementById('authScreen').classList.add('hidden');

 const savedChildren = storage.getItem(`ltChildren_${currentUserPhone}`);
 if(!savedChildren) {
  initOnboardingFlow();
 } else {
  initAppAfterAuth();
 }
}

function initOnboardingFlow(){
 tempOnboardFocus = [];
 const grid = document.getElementById('onboardFocusGrid');
 grid.innerHTML = categories.map((cat, idx) => `
  <div class="focusPill" id="onboard_cat_${idx}" onclick="toggleOnboardFocus(${idx})">
   <span>${cat.icon}</span> ${cat.name}
  </div>
 `).join("");
 document.getElementById('onboardScreen').classList.remove('hidden');
}

function toggleOnboardFocus(idx){
 const index = tempOnboardFocus.indexOf(idx);
 if(index > -1){
  tempOnboardFocus.splice(index, 1);
 } else {
  if(tempOnboardFocus.length >= 4){
   alert("Та яг 4 чиглэл сонгох боломжтой.");
   return;
  }
  tempOnboardFocus.push(idx);
 }
 categories.forEach((_, i) => {
  const el = document.getElementById(`onboard_cat_${i}`);
  if(el){
   if(tempOnboardFocus.includes(i)) el.classList.add('chosen');
   else el.classList.remove('chosen');
  }
 });
}

function completeOnboarding(){
 if(tempOnboardFocus.length !== 4){
  alert("Үргэлжлүүлэхийн тулд яг 4 чиглэл сонгоно уу.");
  return;
 }
 document.getElementById('onboardScreen').classList.add('hidden');
 
 const defaultChild = {
  id: 'c_' + Date.now(),
  name: 'Таны хүүхэд',
  age: 7,
  gender: 'neutral',
  focusAreas: tempOnboardFocus
 };
 children = [defaultChild];
 activeChildId = defaultChild.id;
 storage.setItem(`ltCreated_${currentUserPhone}`, Date.now());
 saveAllChildren();
 initAppAfterAuth();
}

function initAppAfterAuth(){
 currentUserPhone = storage.getItem("ltActiveUserPhone");
 if(!currentUserPhone){
  document.getElementById('authScreen').classList.remove('hidden');
  return;
 }
 
 try{
  children = JSON.parse(storage.getItem(`ltChildren_${currentUserPhone}`) || "[]");
  activeChildId = storage.getItem(`ltActiveChildId_${currentUserPhone}`) || (children[0] ? children[0].id : null);
  child = children.find(c => c.id === activeChildId) || children[0] || null;
  loadChildData();
 }catch(e){children=[];child=null;}
 
 document.getElementById('app').classList.remove('hidden');
 updateChildSelector();
 populateDropdowns();
 
 if(children.length === 0){
  initOnboardingFlow();
 } else {
  render();
 }
}

function populateDropdowns(){
 const catOpts = categories.map((c, i) => `<option value="${i}">${c.icon} ${c.name}</option>`).join("");
 const goalCat = document.getElementById('goalCat');
 const achCat = document.getElementById('achievementCat');
 if(goalCat) goalCat.innerHTML = catOpts;
 if(achCat) achCat.innerHTML = catOpts;
}

function getWeekKey(){
 const d = new Date(); const onejan = new Date(d.getFullYear(),0,1);
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
  storage.setItem(`ltActiveChildId_${currentUserPhone}`, activeChildId);
  loadChildData(); render();
  toast(`${child.name} руу шилжлээ`);
 }
}

function loadChildData(){
 if(!child) return;
 goals = JSON.parse(storage.getItem(`ltGoals_${currentUserPhone}_${child.id}`) || "[]");
 achievements = JSON.parse(storage.getItem(`ltAchievements_${currentUserPhone}_${child.id}`) || "[]");
}

function openAddChildFlow(){
 const accountCreationTime = parseInt(storage.getItem(`ltCreated_${currentUserPhone}`) || Date.now(), 10);
 storage.setItem(`ltCreated_${currentUserPhone}`, accountCreationTime);
 
 const monthsElapsed = (Date.now() - accountCreationTime) / (1000 * 60 * 60 * 24 * 30);
 if(monthsElapsed > 12){
  alert("Таны 12 сарын эрх дууссан байна. Шинэ хүүхэд нэмэхийн тулд эрхээ сунжина уу.");
  return;
 }
 renderAddChildModal();
}

let pendingChildGender = 'neutral';
function renderAddChildModal(){
 pendingChildGender = 'neutral';
 document.getElementById('modalBox').innerHTML = `
  <button class="modalClose" onclick="closeModal()">✕</button>
  <h2>Шинэ хүүхэд нэмэх</h2>
  <label>Нэр</label><input id="nc_name" placeholder="Хүүхдийн нэр">
  <label>Нас</label><input id="nc_age" type="number" min="2" max="18" value="7">
  <label>Хүйс</label>
  <div class="genderChoices">
   <button type="button" class="genderBtn" id="nc_genderBoy" onclick="selectNewChildGender('boy')">Хүү</button>
   <button type="button" class="genderBtn" id="nc_genderGirl" onclick="selectNewChildGender('girl')">Охин</button>
   <button type="button" class="genderBtn sel-neutral" id="nc_genderNeutral" onclick="selectNewChildGender('neutral')">Ерөнхий</button>
  </div>
  <br><button class="primary" onclick="submitNewChild()">Хадгалах</button>`;
 openModal();
}

function selectNewChildGender(val){
 pendingChildGender = val;
 ['Boy','Girl','Neutral'].forEach(g=>{
  const btn = document.getElementById('nc_gender'+g);
  if(btn) btn.className = 'genderBtn' + (g.toLowerCase()===val ? ' sel-'+val : '');
 });
}

function submitNewChild(){
 const name = document.getElementById('nc_name').value.trim();
 if(!name){alert("Нэр оруулна уу.");return}
 let age = +document.getElementById('nc_age').value || 7;
 const newChild = {id:'c_'+Date.now(), name, age, gender:pendingChildGender, focusAreas:[0,1,2,3]};
 children.push(newChild);
 saveAllChildren();
 switchChild(newChild.id);
 closeModal();
 render();
}

function addGoal(){
 const text = document.getElementById("goalText").value.trim();
 if(!text) return;
 goals.push({id:Date.now(), text, cat:+document.getElementById("goalCat").value, freq:document.getElementById("goalFreq").value, done:false, cycle:getWeekKey()});
 saveChildData();
 document.getElementById("goalText").value = "";
 renderGoals(); renderGrowth();
 toast("Зорилго нэмэгдлээ!");
}

function toggleGoal(id){
 const g = goals.find(x => x.id === id);
 if(!g) return;
 g.done = !g.done;
 saveChildData();
 if(g.done) chime("goal");
 renderGoals(); renderGrowth();
}

function addAchievement(){
 const text = document.getElementById("achievementText").value.trim();
 if(!text) return;
 achievements.unshift({id:Date.now(), text, cat:+document.getElementById("achievementCat").value, score:+document.getElementById("achievementScore").value, date:new Date().toLocaleDateString(), cycle:getWeekKey()});
 saveChildData();
 document.getElementById("achievementText").value = "";
 renderAchievements(); renderGrowth();
 toast("Амжилт тэмдэглэгдлээ!");
 chime("achievement");
}

function weeklyPercent(){
 const currentGoals = goals.filter(g => g.cycle === getWeekKey() || !g.cycle);
 const currentAch = achievements.filter(a => a.cycle === getWeekKey() || !a.cycle);
 const gp = currentGoals.length ? currentGoals.filter(g => g.done).length / currentGoals.length : 0;
 const ap = currentAch.length ? currentAch.reduce((s,a) => s + a.score, 0) / (currentAch.length * 5) : 0;
 return Math.min(100, Math.round((gp * 0.6 + ap * 0.4) * 100));
}

function renderGrowth(){
 const p = weeklyPercent();
 document.getElementById("homePercent").textContent = p + "%";
 document.getElementById("homeBar").style.width = p + "%";
}

function renderGoals(){
 document.getElementById("goalList").innerHTML = goals.length ? goals.map(g => `
  <div class="goalRow">
   <div style="display:flex;gap:12px;align-items:center">
    <input class="check" type="checkbox" ${g.done ? "checked" : ""} onchange="toggleGoal(${g.id})">
    <div><b>${g.text}</b><br><span class="small muted">${categories[g.cat].icon} ${categories[g.cat].name} • ${g.freq}</span></div>
   </div>
   <span class="badge">${g.done ? "Биелсэн" : "Хийгдэж байгаа"}</span>
  </div>`).join("") : "<p class='muted'>Зорилго байхгүй байна.</p>";
}

function renderAchievements(){
 document.getElementById("achievementList").innerHTML = achievements.length ? achievements.map(a => `
  <div class="achievementRow">
   <div><b>${a.text}</b><br><span class="small muted">${categories[a.cat].icon} ${categories[a.cat].name} • ${a.date}</span></div>
  </div>`).join("") : "<p class='muted'>Амжилт байхгүй байна.</p>";
}

function renderCategories(){
 document.getElementById("categories").innerHTML = categories.map(c => `
  <div class="card category" style="margin:0;padding:15px;">
   <div class="catIcon">${c.icon}</div>
   <div><div class="catTitle">${c.name}</div><div class="small muted">Хөгжлийн түлхүүр чиглэл</div></div>
  </div>`).join("");
}

function renderRecommendations() {
  const container = document.getElementById('recommendations');
  if (!container) return;
  
  if (!child) {
    container.innerHTML = "<p class='muted'>Хүүхдийн профайл сонгогдоогүй байна.</p>";
    return;
  }

  let recs = [];
  if (child.age <= 5) {
    recs = [
      {icon: "💬", title: "Хэл яриаг хөгжүүлэх", text: "Өдөр бүр үлгэр ярьж өгч, шинэ үгсийн утгыг тайлбарлан ярилцах."},
      {icon: "🧩", title: "Мэдрэхүй ба хөдөлгөөн", text: "Ялгаатай хэлбэр дүрс, өнгийг таних энгийн тоглоом тоглох."}
    ];
  } else if (child.age <= 10) {
    recs = [
      {icon: "📚", title: "Бие даан унших чадвар", text: "Өдөрт 15-20 минут дуртай номоо өөрөө уншиж, агуулгыг ярилцах."},
      {icon: "🔢", title: "Логик сэтгэлгээ", text: "Энгийн тооцоолол болон оньсого таавар хамтдаа бодох."}
    ];
  } else {
    recs = [
      {icon: "🛡️", title: "Тэсвэр хатуужил", text: "Өөртөө зорилго тавьж, түүнийгээ тууштай хэрэгжүүлэхэд дэмжлэг үзүүлэх."},
      {icon: "💻", title: "Дижитал зөв боловсрол", text: "Цахим орчныг зөв зохистой ашиглах, цагийн менежмент хийх."}
    ];
  }

  container.innerHTML = recs.map(r => `
    <div class="recommend" style="display:flex; gap:12px; align-items:center; margin-bottom:10px; padding:10px; background:rgba(0,0,0,0.02); border-radius:8px;">
      <span style="font-size:24px;">${r.icon}</span>
      <div><b>${r.title}:</b> <span class="muted">${r.text}</span></div>
    </div>
  `).join("");
}

function renderDashboard(){
 const p = weeklyPercent();
 document.getElementById("dashboardContent").innerHTML = `
  <div class="weekBanner">
   <div class="weekTop"><b>Энэ долоо хоногийн гүйцэтгэл</b><b class="percent">${p}%</b></div>
   <div class="progress"><i style="width:${p}%"></i></div>
  </div>
  <p class="muted">Нийт бүртгэгдсэн зорилго: ${goals.length}, Амжилт: ${achievements.length}</p>`;
}

function renderProfileForm(){
 if(!child) return;
 document.getElementById("profileName").value = child.name;
 document.getElementById("profileAge").value = child.age;
 setProfileGender(child.gender || 'neutral');
}

function setProfileGender(val){
 document.getElementById("profileGender").value = val;
 ['boy','girl','neutral'].forEach(g => {
  const btn = document.getElementById('profileGender'+g.charAt(0).toUpperCase()+g.slice(1));
  if(btn) btn.className = 'genderBtn' + (g === val ? ' sel-'+val : '');
 });
}

function saveProfileChanges(){
 if(!child) return;
 child.name = document.getElementById("profileName").value.trim() || child.name;
 child.age = +document.getElementById("profileAge").value || child.age;
 child.gender = document.getElementById("profileGender").value;
 saveAllChildren();
 updateChildSelector();
 render();
 toast("Профайл амжилттай шинэчлэгдлээ!");
}

function render(){
 if(!child) return;
 updateChildSelector();
 document.getElementById("welcome").textContent = `${child.name}-ийн Хөгжлийн Хянагч`;
 document.getElementById("ageBadge").textContent = `${child.age} НАСТАЙ`;
 renderGoals(); renderAchievements(); renderCategories(); renderRecommendations(); renderDashboard(); renderGrowth(); renderProfileForm();
}

function saveAllChildren(){
 storage.setItem(`ltChildren_${currentUserPhone}`, JSON.stringify(children));
 storage.setItem(`ltActiveChildId_${currentUserPhone}`, activeChildId);
}

function saveChildData(){
 storage.setItem(`ltGoals_${currentUserPhone}_${child.id}`, JSON.stringify(goals));
 storage.setItem(`ltAchievements_${currentUserPhone}_${child.id}`, JSON.stringify(achievements));
}

function show(id, btn){
 document.querySelectorAll("section").forEach(s => s.classList.add("hidden"));
 document.getElementById(id).classList.remove("hidden");
 document.querySelectorAll(".nav button").forEach(b => b.classList.remove("active"));
 if(btn) btn.classList.add("active");
 if(id === 'profile') renderProfileForm();
}
