const memoryStore={};
const storage={
 getItem(key){try{return localStorage.getItem(key)}catch(e){return memoryStore[key]||null}},
 setItem(key,val){try{localStorage.setItem(key,val)}catch(e){memoryStore[key]=val}},
 removeItem(key){try{localStorage.removeItem(key)}catch(e){delete memoryStore[key]}}
};

const categories=[
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
