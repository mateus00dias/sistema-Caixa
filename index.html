const $ = id => document.getElementById(id);
const money = v => Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});

const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:3000"
  : "https://sistema-caixa-omega.vercel.app";

let caixaEntries = [];
let osEntries = [];

function showAlert(message) { alert(message); }

function formatarDataLocal(data) {
  const dataLocal = new Date(data.getFullYear(), data.getMonth(), data.getDate());
  const ano = dataLocal.getFullYear();
  const mes = String(dataLocal.getMonth() + 1).padStart(2,'0');
  const dia = String(dataLocal.getDate()).padStart(2,'0');
  return `${ano}-${mes}-${dia}`;
}
const dataHoje = formatarDataLocal(new Date());
$('caixaData').value = dataHoje;

// --- Render ---
async function renderCaixa(filter=null) {
  const url = filter ? `${API_BASE}/caixa?date=${filter}` : `${API_BASE}/caixa`;
  const res = await fetch(url);
  const data = await res.json();
  caixaEntries = data;
  const tbody = $('tbodyCaixa'); tbody.innerHTML = '';
  let totalDia = 0;
  data.forEach(e => {
    const tr = document.createElement('tr');
    const valor = parseFloat(e.credit)-parseFloat(e.debit);
    totalDia += valor;
    tr.innerHTML = `
      <td>${e.date_br}</td>
      <td>${e.hora||'--:--'}</td>
      <td>${e.os}</td>
      <td>${money(e.credit)}</td>
      <td>${money(e.debit)}</td>
      <td class="fw-semibold">${money(valor)}</td>
      <td>${e.obs_debito||''}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary" onclick="editCaixa(${e.id})">Editar</button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteCaixa(${e.id})">Excluir</button>
      </td>`;
    tbody.appendChild(tr);
  });
  $('totalAcumulado').textContent = 'R$ ' + money(totalDia);
}

async function renderOS(filter=null) {
  const url = filter ? `${API_BASE}/os?date=${filter}` : `${API_BASE}/os`;
  const res = await fetch(url);
  const data = await res.json();
  osEntries = data;
  const tbody = $('tbodyOS'); tbody.innerHTML = '';
  data.forEach(e => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${e.numero_os}</td>
      <td>${e.liberou||''}</td>
      <td>${e.levou||''}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary" onclick="editOS(${e.id})">Editar</button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteOS(${e.id})">Excluir</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

// --- CRUD Caixa ---
async function addOrUpdateCaixa() {
  const id = $('caixaId').value;
  const date = $('caixaData').value;
  const os = $('caixaOS').value;
  const credit = Number($('caixaCredito').value||0);
  const debit = Number($('caixaDebito').value||0);
  const obsDebito = $('caixaObsDebito').value||'';
  const horaAtual = new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_BASE}/caixa/${id}` : `${API_BASE}/caixa`;
  await fetch(url,{method, headers:{"Content-Type":"application/json"}, body:JSON.stringify({date,hora:horaAtual,os,credit,debit,obs_debito:obsDebito})});
  $('formCaixa').reset(); $('caixaData').value = dataHoje;
  renderCaixa($('filterDate').value || null);
}

async function editCaixa(id){
  const e = caixaEntries.find(x=>x.id==id);
  if(!e) return;
  $('caixaId').value=e.id;
  $('caixaData').value=e.date.slice(0,10);
  $('caixaOS').value=e.os;
  $('caixaCredito').value=e.credit;
  $('caixaDebito').value=e.debit;
  $('caixaObsDebito').value=e.obs_debito||'';
}

async function deleteCaixa(id){
  if(!confirm("Deseja realmente excluir este registro?")) return;
  await fetch(`${API_BASE}/caixa/${id}`,{method:'DELETE'});
  renderCaixa($('filterDate').value || null);
}

// --- CRUD OS ---
async function addOrUpdateOS() {
  const id = $('osId').value;
  const numero_os = $('osNumero').value;
  const liberou = $('osLiberou').value;
  const levou = $('osLevou').value;
  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_BASE}/os/${id}` : `${API_BASE}/os`;
  await fetch(url,{method,headers:{"Content-Type":"application/json"},body:JSON.stringify({numero_os,liberou,levou})});
  $('formOS').reset(); renderOS($('filterDate').value || null);
}

async function editOS(id){
  const e = osEntries.find(x=>x.id==id);
  if(!e) return;
  $('osId').value=e.id;
  $('osNumero').value=e.numero_os;
  $('osLiberou').value=e.liberou||'';
  $('osLevou').value=e.levou||'';
}

async function deleteOS(id){
  if(!confirm("Deseja realmente excluir esta OS?")) return;
  await fetch(`${API_BASE}/os/${id}`,{method:'DELETE'});
  renderOS($('filterDate').value || null);
}

// --- Imprimir ---
function imprimirDia(){
  const dataFiltro = $('filterDate').value || dataHoje;
  const caixasDia = caixaEntries.filter(e=>e.date===dataFiltro);
  const osDia = osEntries.filter(e=>e.date===dataFiltro);
  let html = `<h3>Relatório do Dia: ${dataFiltro}</h3>`;
  html += `<h4>Caixa</h4><table border="1" cellspacing="0" cellpadding="5">
    <tr><th>Data</th><th>Hora</th><th>OS</th><th>Crédito</th><th>Débito</th><th>Total</th><th>Obs Débito</th></tr>`;
  let total = 0;
  caixasDia.forEach(c=>{
    const val = parseFloat(c.credit)-parseFloat(c.debit);
    total+=val;
    html += `<tr>
      <td>${c.date_br}</td>
      <td>${c.hora}</td>
      <td>${c.os}</td>
      <td>${money(c.credit)}</td>
      <td>${money(c.debit)}</td>
      <td>${money(val)}</td>
      <td>${c.obs_debito||''}</td>
    </tr>`;
  });
  html += `<tr><td colspan="5">Total do Dia</td><td>${money(total)}</td><td></td></tr></table>`;
  
  html += `<h4>Saída de OS</h4><table border="1" cellspacing="0" cellpadding="5">
    <tr><th>OS</th><th>Funcionário</th><th>Quem levou</th></tr>`;
  osDia.forEach(o=>{
    html += `<tr><td>${o.numero_os}</td><td>${o.liberou||''}</td><td>${o.levou||''}</td></tr>`;
  });
  html += `</table>`;
  const win = window.open('','_blank');
  win.document.write(html);
  win.document.close();
  win.print();
}

// --- Eventos ---
$('formCaixa').addEventListener('submit', e=>{e.preventDefault(); addOrUpdateCaixa();});
$('formOS').addEventListener('submit', e=>{e.preventDefault(); addOrUpdateOS();});
$('btnLimparCaixa').addEventListener('click', ()=>{$('formCaixa').reset(); $('caixaData').value=dataHoje;});
$('btnLimparOS').addEventListener('click', ()=>$('formOS').reset());
$('filterDate').addEventListener('change', ()=>{renderCaixa($('filterDate').value); renderOS($('filterDate').value);});

// --- Inicial ---
renderCaixa();
renderOS();
