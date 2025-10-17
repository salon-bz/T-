// js/admin.js
import { db } from './firebase.js';
import {
  collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const adminData = JSON.parse(localStorage.getItem('zmlx_admin')||'null');
if(!adminData){ alert('No autenticado.'); window.location.href='./login.html'; }

const tabGratis = document.getElementById('tabGratis');
const tabVip = document.getElementById('tabVip');
const formArea = document.getElementById('formArea');
const listArea = document.getElementById('listArea');
const logout = document.getElementById('logout');

let currentTab = 'gratis';
let editing = null; // {collection,id}

logout.addEventListener('click', ()=>{ localStorage.removeItem('zmlx_admin'); window.location.href='./login.html' });

tabGratis.addEventListener('click', ()=> loadForm('gratis'));
tabVip.addEventListener('click', ()=> loadForm('vip'));

function createGratisForm(data){
  const title = data?.title||'';
  const desc = data?.description||'';
  const imageURL = data?.imageURL||'';
  const downloadLink = data?.downloadLink||'';
  const tutorialLink = data?.tutorialLink||'';
  return `
    <div>
      <h3>${editing ? 'Editar gratuito' : 'Crear gratuito'}</h3>
      <div class="form-row"><label class="label">Titulo</label><input id="f_title" class="input" value="${escapeHtml(title)}"/></div>
      <div class="form-row"><label class="label">Descripcion</label><textarea id="f_desc" class="input">${escapeHtml(desc)}</textarea></div>
      <div class="form-row"><label class="label">URL Imagen</label><input id="f_image" class="input" value="${escapeHtml(imageURL)}" /></div>
      <div class="form-row"><label class="label">Link descarga</label><input id="f_download" class="input" value="${escapeHtml(downloadLink)}" /></div>
      <div class="form-row"><label class="label">Link tutorial</label><input id="f_tutorial" class="input" value="${escapeHtml(tutorialLink)}" /></div>
      <div style="margin-top:10px">
        <button id="saveBtn" class="btn btn-primary floating">${editing? 'Actualizar' : 'Publicar'}</button>
        ${editing? '<button id="cancelEdit" class="btn floating">Cancelar</button>':''}
      </div>
    </div>
  `;
}

function createVipForm(data){
  const title = data?.title||'';
  const desc = data?.description||'';
  const imageURL = data?.imageURL||'';
  const youtubeURL = data?.youtubeURL||'';
  const prices = Array.isArray(data?.prices) ? data.prices.join('|') : (data?.prices || '');
  const adminPhone = data?.adminPhone || '+573142369516';
  return `
    <div>
      <h3>${editing ? 'Editar VIP' : 'Crear VIP'}</h3>
      <div class="form-row"><label class="label">Titulo</label><input id="f_title" class="input" value="${escapeHtml(title)}"/></div>
      <div class="form-row"><label class="label">Descripcion</label><textarea id="f_desc" class="input">${escapeHtml(desc)}</textarea></div>
      <div class="form-row"><label class="label">URL Imagen</label><input id="f_image" class="input" value="${escapeHtml(imageURL)}" /></div>
      <div class="form-row"><label class="label">URL Youtube</label><input id="f_youtube" class="input" value="${escapeHtml(youtubeURL)}" /></div>
      <div class="form-row"><label class="label">Precios (separados por | )</label><input id="f_prices" class="input" value="${escapeHtml(prices)}" /></div>
      <div class="form-row"><label class="label">Numero WhatsApp (para redirigir)</label><input id="f_phone" class="input" value="${escapeHtml(adminPhone)}" /></div>
      <div style="margin-top:10px">
        <button id="saveBtn" class="btn btn-accent floating">${editing? 'Actualizar' : 'Publicar'}</button>
        ${editing? '<button id="cancelEdit" class="btn floating">Cancelar</button>':''}
      </div>
    </div>
  `;
}

function escapeHtml(s=''){return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]))}

async function loadForm(tab, data=null){
  currentTab = tab;
  editing = data ? { collection: tab, id: data.id } : null;
  if(tab === 'gratis') formArea.innerHTML = createGratisForm(data);
  else formArea.innerHTML = createVipForm(data);

  document.getElementById('saveBtn').addEventListener('click', async ()=>{
    if(currentTab === 'gratis') await saveGratis();
    else await saveVip();
    await loadList();
    editing = null;
    loadForm(currentTab);
  });
  const cancel = document.getElementById('cancelEdit');
  if(cancel) cancel.addEventListener('click', ()=>{ editing=null; loadForm(currentTab); });
}

async function saveGratis(){
  const title = document.getElementById('f_title').value.trim();
  const description = document.getElementById('f_desc').value.trim();
  const imageURL = document.getElementById('f_image').value.trim();
  const downloadLink = document.getElementById('f_download').value.trim();
  const tutorialLink = document.getElementById('f_tutorial').value.trim();
  if(!title){ alert('El titulo es requerido'); return; }
  if(editing){
    const dref = doc(db, 'gratis', editing.id);
    await updateDoc(dref, { title, description, imageURL, downloadLink, tutorialLink });
    alert('Actualizado');
  }else{
    await addDoc(collection(db, 'gratis'), { title, description, imageURL, downloadLink, tutorialLink, createdAt: serverTimestamp() });
    alert('Publicado');
  }
}

async function saveVip(){
  const title = document.getElementById('f_title').value.trim();
  const description = document.getElementById('f_desc').value.trim();
  const imageURL = document.getElementById('f_image').value.trim();
  const youtubeURL = document.getElementById('f_youtube').value.trim();
  const pricesRaw = document.getElementById('f_prices').value.trim();
  const adminPhone = document.getElementById('f_phone').value.trim() || '+573142369516';
  const prices = pricesRaw ? pricesRaw.split('|').map(s=>s.trim()).filter(Boolean) : [];
  if(!title){ alert('El titulo es requerido'); return; }
  if(editing){
    const dref = doc(db, 'vip', editing.id);
    await updateDoc(dref, { title, description, imageURL, youtubeURL, prices, adminPhone });
    alert('Actualizado');
  }else{
    await addDoc(collection(db, 'vip'), { title, description, imageURL, youtubeURL, prices, adminPhone, createdAt: serverTimestamp() });
    alert('Publicado');
  }
}

async function loadList(){
  listArea.innerHTML = 'Cargando...';
  const q1 = query(collection(db,'gratis'), orderBy('createdAt','desc'));
  const q2 = query(collection(db,'vip'), orderBy('createdAt','desc'));
  const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
  listArea.innerHTML = '';
  snap1.forEach(d=>{
    const p = d.data();
    const el = document.createElement('div');
    el.className = 'admin-item';
    el.innerHTML = `<div>
      <div class="meta"><strong>${escapeHtml(p.title)}</strong> <small class="small-muted">(gratis)</small></div>
      <div class="small-muted">${escapeHtml(p.description||'')}</div>
    </div>
    <div>
      <button class="btn floating" data-id="${d.id}" data-type="gratis" data-action="edit">Editar</button>
      <button class="btn btn-danger" data-id="${d.id}" data-type="gratis" data-action="del">Eliminar</button>
    </div>`;
    listArea.appendChild(el);
  });
  snap2.forEach(d=>{
    const p = d.data();
    const el = document.createElement('div');
    el.className = 'admin-item';
    el.innerHTML = `<div>
      <div class="meta"><strong>${escapeHtml(p.title)}</strong> <small class="small-muted">(VIP)</small></div>
      <div class="small-muted">${escapeHtml(p.description||'')}</div>
    </div>
    <div>
      <button class="btn floating" data-id="${d.id}" data-type="vip" data-action="edit">Editar</button>
      <button class="btn btn-danger" data-id="${d.id}" data-type="vip" data-action="del">Eliminar</button>
    </div>`;
    listArea.appendChild(el);
  });

  // attach handlers
  listArea.querySelectorAll('button[data-action]').forEach(b=>{
    b.addEventListener('click', async ()=>{
      const id = b.getAttribute('data-id');
      const type = b.getAttribute('data-type');
      const act = b.getAttribute('data-action');
      if(act === 'del'){
        if(!confirm('Eliminar publicacion?')) return;
        await deleteDoc(doc(db, type, id));
        await loadList();
        loadForm(currentTab);
      }else if(act === 'edit'){
        // fetch doc and open form
        const sd = await getDocRef(type, id);
        const data = sd.exists() ? { id: sd.id, ...sd.data() } : null;
        editing = { collection: type, id: id };
        loadForm(type, data);
      }
    });
  });
}

async function getDocRef(collectionName, id){
  return await (await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js")).getDoc((await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js")).doc(db, collectionName, id));
}

// init
loadForm('gratis');
loadList();
