// --- Splash ---
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('splash').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    // restore last tool
    const last = localStorage.getItem('lastTool') || 'qr';
    activateTool(last);
  }, 2500);
});

// tool switching
const navButtons = document.querySelectorAll('.nav-item');
const bnButtons = document.querySelectorAll('.bn-item');
const panels = document.querySelectorAll('.tool-panel');
const toolTitle = document.getElementById('tool-title');

function activateTool(name){
  // set active on sidebar
  navButtons.forEach(b=>{
    b.classList.toggle('active', b.dataset.tool === name);
  });
  // bottom nav
  bnButtons.forEach(b=> b.classList.toggle('active', b.dataset.tool === name));
  // show/hide panels
  panels.forEach(p=>{
    p.classList.toggle('hidden', p.dataset.toolPanel !== name);
  });
  // set title
  const titleMap = { qr: 'QR Generator', case: 'Text Case Converter', count: 'Word & Character Counter', age: 'Age Calculator', pdf: 'Text → PDF' };
  toolTitle.textContent = titleMap[name] || 'Tool';
  localStorage.setItem('lastTool', name);
}

// attach sidebar clicks
navButtons.forEach(b=>{
  b.addEventListener('click', ()=> activateTool(b.dataset.tool));
});
// attach bottom nav clicks
bnButtons.forEach(b=>{
  b.addEventListener('click', ()=> activateTool(b.dataset.tool));
});

// refresh button (reload active panel)
document.getElementById('btn-refresh').addEventListener('click', ()=>{
  const active = localStorage.getItem('lastTool') || 'qr';
  activateTool(active);
});

// ---------------- QR Generator (qrcodejs)
let qrObj = null;
document.getElementById('generateQR').addEventListener('click', ()=>{
  const txt = document.getElementById('qrText').value.trim();
  const box = document.getElementById('qrcode');
  box.innerHTML = '';
  if(!txt){
    box.innerHTML = '<p style="color:#ef4444">Please enter text or URL</p>';
    return;
  }
  qrObj = new QRCode(box, { text: txt, width: 200, height: 200 });
});

// download QR (creates PNG from canvas/svg)
document.getElementById('downloadQR').addEventListener('click', ()=>{
  const box = document.getElementById('qrcode');
  if(!box.querySelector('img') && !box.querySelector('canvas')){
    alert('Generate QR first');
    return;
  }
  // if img present
  const img = box.querySelector('img');
  if(img){
    const url = img.src;
    const a = document.createElement('a');
    a.href = url; a.download = 'qr.png'; a.click();
    return;
  }
  // if canvas present, convert to dataURL
  const canvas = box.querySelector('canvas');
  if(canvas){
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url; a.download = 'qr.png'; a.click();
  }
});
document.getElementById('clearQR').addEventListener('click', ()=>{
  document.getElementById('qrText').value = '';
  document.getElementById('qrcode').innerHTML = '';
});

// --------------- Text Case Converter
const caseArea = document.getElementById('caseText');
document.getElementById('upperBtn').addEventListener('click', ()=> caseArea.value = caseArea.value.toUpperCase());
document.getElementById('lowerBtn').addEventListener('click', ()=> caseArea.value = caseArea.value.toLowerCase());
document.getElementById('titleBtn').addEventListener('click', ()=> {
  caseArea.value = caseArea.value.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
});
document.getElementById('sentenceBtn').addEventListener('click', ()=> {
  let s = caseArea.value.trim();
  if(!s){ caseArea.value = ''; return; }
  caseArea.value = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
});
document.getElementById('copyCase').addEventListener('click', async ()=> {
  try{
    await navigator.clipboard.writeText(caseArea.value);
    alert('Copied to clipboard');
  }catch(e){ alert('Copy failed'); }
});
document.getElementById('clearCase').addEventListener('click', ()=> caseArea.value = '');

// --------------- Word Counter
const countArea = document.getElementById('countText');
function computeCounts(){
  const s = countArea.value.trim();
  const words = s ? s.split(/\s+/).filter(Boolean).length : 0;
  const chars = s.length;
  const read = Math.max(0, Math.round(words / 200));
  document.getElementById('countResult').textContent = `Words: ${words} | Characters: ${chars} | Reading: ${read} min`;
}
document.getElementById('countBtn').addEventListener('click', computeCounts);
countArea.addEventListener('input', computeCounts);
document.getElementById('clearCount').addEventListener('click', ()=> { countArea.value=''; computeCounts(); });

// --------------- Age Calculator
document.getElementById('calcAge').addEventListener('click', ()=>{
  const dob = document.getElementById('dob').value;
  if(!dob){ alert('Select date of birth'); return; }
  const birth = new Date(dob);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let m = now.getMonth() - birth.getMonth();
  if(m < 0 || (m === 0 && now.getDate() < birth.getDate())) years--;
  document.getElementById('ageResult').textContent = `You are ${years} years old.`;
});
document.getElementById('clearAge').addEventListener('click', ()=> { document.getElementById('dob').value=''; document.getElementById('ageResult').textContent=''; });

// --------------- Text to PDF (client-side, simple)
document.getElementById('makePdf').addEventListener('click', ()=>{
  const text = document.getElementById('pdfText').value.trim();
  if(!text){ alert('Enter text to convert'); return; }

  // simple PDF creation using browser print to PDF approach
  // Create an iframe with the content and call print
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed'; iframe.style.right = '0'; iframe.style.bottom = '0'; iframe.style.width='0'; iframe.style.height='0'; iframe.style.border='0';
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`<pre style="white-space:pre-wrap;font-family:Arial;font-size:12px;">${escapeHtml(text)}</pre>`);
  doc.close();
  iframe.contentWindow.focus();
  iframe.contentWindow.print();
  setTimeout(()=> document.body.removeChild(iframe), 1500);
});
document.getElementById('clearPdf').addEventListener('click', ()=> document.getElementById('pdfText').value='');

function escapeHtml(s){
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
