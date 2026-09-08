// Authentication & 6/12-month tier logic matching 8-digit phone numbers and unique codes
function handleLogin() {
 const phone = document.getElementById('loginPhone').value.trim();
 const code = document.getElementById('loginCode').value.trim();
 
 if(phone.length !== 8) {
  alert("Утасны дугаар 8 оронтой байх шаардлагатай.");
  return;
 }
 if(code.length !== 4 && code.length !== 5) {
  alert("Нэвтрэх код 4 эсвэл 5 оронтой байх ёстой.");
  return;
 }

 // Determine package duration based on code length (4 digits = 6 months, 5 digits = 12 months unlocked)
 const tierMonths = code.length === 5 ? 12 : 6;
 storage.setItem("ltUserPhone", phone);
 storage.setItem("ltUserTierMonths", tierMonths);
 
 document.getElementById('authScreen').classList.add('hidden');
 document.getElementById('app').classList.remove('hidden');
 initAppAfterAuth();
}
