// ===== Utilitários =====
const $ = id => document.getElementById(id);
const money = v => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatarDataHora = v => new Date(v).toLocaleString('pt-BR');

// Junta data escolhida + hora atual
function juntarDataHora(dataInput) {
  const agora = new Date();
  const [ano, mes, dia] = dataInput.split("-");
  return new Date(ano, mes - 1, dia, agora.getHours(), agora.getMinutes(), agora.getSeconds());
}

// ===== Banco em memória =====
let caixaEntries = [];
let osEntries = [];

// ===== Caixa =====
$("formCaixa").addEventListener("submit", e => {
  e.preventDefault();

  const id = $("caixaId").value;
  const dataInput = $("caixaData").value || new Date().toISOString().slice(0,10);
  const date = juntarDataHora(dataInput);

  const os = $("caixaOS").value;
  const credito = parseFloat($("caixaCredito").value) || 0;
  const debito = parseFloat($("caixaDebito").value) || 0;
  const obsDebito = $("caixaObsDebito").value;

  if (id) {
    const idx = caixaEntries.findIndex(x => x.id == id);
    caixaEntries[idx] = { id, date, os, credito, debito, obsDebito };
  } else {
    caixaEntries.push({ id: Date.now(), date, os, credito, debito, obsDebito });
  }

  renderCaixa();
  $("formCaixa").reset();
  $("caixaId").value = "";
});

function renderCaixa() {
  const tbody = $("tbodyCaixa");
  tbody.innerHTML = "";
  let total = 0;

  caixaEntries.forEach(e => {
    total += e.credito - e.debito;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${formatarDataHora(e.date)}</td>
      <td>${e.os || ""}</td>
      <td>${money(e.credito)}</td>
      <td>${money(e.debito)}</td>
      <td>${money(e.credito - e.debito)}</td>
      <td>${e.obsDebito || ""}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="editCaixa(${e.id})">Editar</button>
        <button class="btn btn-sm btn-danger" onclick="deleteCaixa(${e.id})">Excluir</button>
      </td>`;
    tbody.appendChild(tr);
  });

  $("totalAcumulado").textContent = money(total);
}

function editCaixa(id) {
  const e = caixaEntries.find(x => x.id == id);
  $("caixaId").value = e.id;
  $("caixaData").value = new Date(e.date).toISOString().slice(0,10); // só a data
  $("caixaOS").value = e.os;
  $("caixaCredito").value = e.credito;
  $("caixaDebito").value = e.debito;
  $("caixaObsDebito").value = e.obsDebito;
}

function deleteCaixa(id) {
  caixaEntries = caixaEntries.filter(x => x.id != id);
  renderCaixa();
}

$("btnLimparCaixa").addEventListener("click", () => {
  $("formCaixa").reset();
  $("caixaId").value = "";
});

// ===== OS =====
$("formOS").addEventListener("submit", e => {
  e.preventDefault();

  const id = $("osId").value;
  const dataInput = $("osData").value || new Date().toISOString().slice(0,10);
  const date = juntarDataHora(dataInput);

  const numero = $("osNumero").value;
  const liberou = $("osLiberou").value;
  const levou = $("osLevou").value;

  if (id) {
    const idx = osEntries.findIndex(x => x.id == id);
    osEntries[idx] = { id, numero, liberou, levou, date };
  } else {
    osEntries.push({ id: Date.now(), numero, liberou, levou, date });
  }

  renderOS();
  $("formOS").reset();
  $("osId").value = "";
});

function renderOS() {
  const tbody = $("tbodyOS");
  tbody.innerHTML = "";

  osEntries.forEach(e => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${e.numero}</td>
      <td>${e.liberou}</td>
      <td>${e.levou}</td>
      <td>${formatarDataHora(e.date)}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="editOS(${e.id})">Editar</button>
        <button class="btn btn-sm btn-danger" onclick="deleteOS(${e.id})">Excluir</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

function editOS(id) {
  const e = osEntries.find(x => x.id == id);
  $("osId").value = e.id;
  $("osNumero").value = e.numero;
  $("osLiberou").value = e.liberou;
  $("osLevou").value = e.levou;
  $("osData").value = new Date(e.date).toISOString().slice(0,10); // só a data
}

function deleteOS(id) {
  osEntries = osEntries.filter(x => x.id != id);
  renderOS();
}

$("btnLimparOS").addEventListener("click", () => {
  $("formOS").reset();
  $("osId").value = "";
});

// ===== Relatório =====
function imprimirDia() {
  const dataFiltro = $("filterDate").value;
  if (!dataFiltro) {
    alert("Selecione uma data para imprimir.");
    return;
  }

  const inicio = new Date(dataFiltro + "T00:00:00");
  const fim = new Date(dataFiltro + "T23:59:59");

  const caixaDia = caixaEntries.filter(e => {
    const d = new Date(e.date);
    return d >= inicio && d <= fim;
  });

  const osDia = osEntries.filter(e => {
    const d = new Date(e.date);
    return d >= inicio && d <= fim;
  });

  let html = `<h3>Relatório do Dia ${new Date(dataFiltro).toLocaleDateString("pt-BR")}</h3>`;

  html += `<h4>Movimentação de Caixa</h4>
  <table border="1" cellspacing="0" cellpadding="5">
    <tr>
      <th>Data/Hora</th><th>OS</th><th>Crédito</th><th>Débito</th><th>Total</th><th>Obs</th>
    </tr>`;
  caixaDia.forEach(e => {
    html += `<tr>
      <td>${formatarDataHora(e.date)}</td>
      <td>${e.os || ""}</td>
      <td>${money(e.credito)}</td>
      <td>${money(e.debito)}</td>
      <td>${money(e.credito - e.debito)}</td>
      <td>${e.obsDebito || ""}</td>
    </tr>`;
  });
  html += `</table>`;

  html += `<h4>Saídas de OS</h4>
  <table border="1" cellspacing="0" cellpadding="5">
    <tr>
      <th>OS</th><th>Funcionário</th><th>Quem Levou</th><th>Data/Hora</th>
    </tr>`;
  osDia.forEach(e => {
    html += `<tr>
      <td>${e.numero}</td>
      <td>${e.liberou}</td>
      <td>${e.levou}</td>
      <td>${formatarDataHora(e.date)}</td>
    </tr>`;
  });
  html += `</table>`;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.print();
}
