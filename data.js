const memoryStore={};
const storage={
 getItem(key){try{return localStorage.getItem(key)}catch(e){return memoryStore[key]||null}},
 setItem(key,val){try{localStorage.setItem(key,val)}catch(e){memoryStore[key]=val}},
 removeItem(key){try{localStorage.removeItem(key)}catch(e){delete memoryStore[key]}}
};

const categories=[
 {name:"Хэл яриа ба харилцаа",icon:"💬"},{name:"Унших ба бичиг үсэг",icon:"📚"},
 {name:"Математик",icon:"🔢"},{name:"Шинжлэх ухаан ба сэтгэлгээ",icon:"🔬"},
 {name:"Бие бялдрын хөгжил",icon:"⚽"},{name:"Нийгэм ба сэтгэл хөдлөл",icon:"❤️"},
 {name:"Бүтээлч байдал",icon:"🎨"},{name:"Амьдрах ухаан ба бие даадал",icon:"🌟"}
];

const focusAreas=[
 {name:"Тэсвэр хатуужил",cats:[5]}, {name:"Сурлага",cats:[1,2,3]},
 {name:"Бүтээлч байдал",cats:[6]}, {name:"Нийгэмшихүй",cats:[5]},
 {name:"Бие даадал",cats:[7]}, {name:"Харилцаа холбоо",cats:[0]},
 {name:"Биеийн эрүүл мэнд",cats:[4]}, {name:"Сониуч зан",cats:[3]},
 {name:"Өөртөө итгэх итгэл",cats:[5]}
];
const MAX_FREE_CHILDREN=3;
const MAX_FOCUS_AREAS=4;
