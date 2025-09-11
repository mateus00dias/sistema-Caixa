// Função auxiliar para obter elementos do DOM (apenas no navegador)
const $ = id => typeof document !== 'undefined' ? document.getElementById(id) : null;
const money = v => Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});

// Detecta se está rodando local ou produção
const API_BASE = typeof window !== 'undefined' && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ? "http://localhost:3000"
  : "https://sistema-caixa-omega.vercel.app";


// Função auxiliar para exibir alertas em diferentes ambientes
function showAlert(message) {
  if (typeof window !== 'undefined' && typeof alert !== 'undefined') {
    alert(message);
  } else {
    console.error(message);
  }
}

// Verifica se a API está disponível
async function checkApiConnection() {
  try {
    const response = await fetch(`${API_BASE}/caixa`, { method: 'GET' });
    const data = await response.json();
    if (!response.ok) {
      showAlert('Erro de conexão com o servidor. Verifique se o servidor da API está disponível.');
    }
  } catch (error) {
    showAlert('Não foi possível conectar ao servidor da API. Verifique sua conexão com a internet.');
  }
}

// Variáveis globais
let caixaEntries = [];
let osEntries = [];

// Configuração do fuso horário para America/Sao_Paulo
const TIMEZONE = 'America/Sao_Paulo';

// Função para normalizar datas recebidas da API
function normalizarData(dataString) {
  if (!dataString) return new Date();
  
  console.log('Normalizando data:', dataString);
  
  // Se for uma string no formato YYYY-MM-DD, adicionar horário meio-dia
  if (typeof dataString === 'string' && dataString.length === 10) {
    // Criar data com horário meio-dia para evitar problemas de fuso
    const [ano, mes, dia] = dataString.split('-').map(Number);
    // Criar data explicitamente com o ano, mês e dia (mês é 0-indexed em JS)
    const dataObj = new Date(Date.UTC(ano, mes - 1, dia, 12, 0, 0));
    console.log('Data normalizada a partir de YYYY-MM-DD:', dataObj);
    return dataObj;
  }
  
  // Se for um objeto Date ou outro formato de string
  const dataObj = new Date(dataString);
  // Ajustar para meio-dia UTC
  dataObj.setUTCHours(12, 0, 0, 0);
  console.log('Data normalizada:', dataObj);
  
  return dataObj;
}

// Corrigindo o problema da data com um dia a menos
// Função para formatar a data no formato YYYY-MM-DD considerando o fuso horário local
function formatarDataLocal(data) {
  console.log('Data de entrada formatarDataLocal:', data);
  
  // Normalizar a data primeiro
  const dataObj = normalizarData(data);
  
  // Extrair ano, mês e dia no fuso UTC
  const ano = dataObj.getUTCFullYear();
  const mes = String(dataObj.getUTCMonth() + 1).padStart(2, '0');
  const dia = String(dataObj.getUTCDate()).padStart(2, '0');
  
  // Formar a string YYYY-MM-DD
  const dataISO = `${ano}-${mes}-${dia}`;
  
  console.log('Data formatada (YYYY-MM-DD):', dataISO);
  
  return dataISO;
}

const dataHoje = formatarDataLocal(new Date());

// Verifica se estamos em ambiente de navegador antes de manipular o DOM
if (typeof document !== 'undefined') {
  const caixaDataElement = $('caixaData');
  if (caixaDataElement) {
    caixaDataElement.value = dataHoje;
  }
}

// --- Funções ---
async function renderCaixa(filter=null) {
  try {
    // Se tiver filtro, normalizar a data para garantir consistência
    if (filter) {
      const dataObj = normalizarData(filter);
      filter = formatarDataLocal(dataObj);
      console.log('Filtro de data normalizado:', filter);
    }
    
    const url = filter ? `${API_BASE}/caixa?date=${filter}` : `${API_BASE}/caixa`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Erro ao buscar dados: ${res.status}`);
    }
    const data = await res.json();
    caixaEntries = data;
    const tbody = $('tbodyCaixa'); tbody.innerHTML = '';
    let totalDia = 0;

    data.forEach(e => {
    const tr = document.createElement('tr');
    totalDia += parseFloat(e.credit) - parseFloat(e.debit);
    
    // Usando a data_br já formatada pelo servidor para evitar problemas de fuso horário
    tr.innerHTML = `
      <td>${e.date_br}</td>
      <td>${e.os}</td>
      <td class="monetary">${money(e.credit)}</td>
      <td class="monetary">${money(e.debit)}</td>
      <td class="monetary fw-semibold">${money(e.credit - e.debit)}</td>
      <td>${e.obs_debito || ''}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary" onclick="editCaixa(${e.id})">Editar</button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteCaixa(${e.id})">Excluir</button>
      </td>`;
    tbody.appendChild(tr);
  });

    $('totalAcumulado').textContent = 'R$ ' + money(totalDia);
  } catch (error) {
    showAlert('Erro ao carregar dados do caixa. Verifique sua conexão com a internet ou se o servidor da API está disponível.');
  }
}

async function renderOS(filter=null) {
  try {
    // Se tiver filtro, normalizar a data para garantir consistência
    if (filter) {
      const dataObj = normalizarData(filter);
      filter = formatarDataLocal(dataObj);
      console.log('Filtro de data normalizado para OS:', filter);
    }
    
    const url = filter ? `${API_BASE}/os?date=${filter}` : `${API_BASE}/os`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Erro ao buscar dados: ${res.status}`);
    }
    const data = await res.json();
    osEntries = data;
    const tbody = $('tbodyOS'); tbody.innerHTML='';
    data.forEach(e => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${formatDataBR(e.date)}</td>
      <td>${e.numero_os}</td>
      <td>${e.liberou||''}</td>
      <td>${e.levou||''}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary" onclick="editOS(${e.id})">Editar</button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteOS(${e.id})">Excluir</button>
      </td>`;
    tbody.appendChild(tr);
    });
  } catch (error) {
    showAlert('Erro ao carregar dados de OS. Verifique sua conexão com a internet ou se o servidor da API está disponível.');
  }
}

// --- CRUD Caixa ---
async function addOrUpdateCaixa() {
  try {
    const id = $('caixaId').value;
    const dateInput = $('caixaData').value;
    const os = $('caixaOS').value;
    const credit = Number($('caixaCredito').value||0);
    const debit = Number($('caixaDebito').value||0);
    const obsDebito = $('caixaObsDebito').value||'';
    
    console.log('Data original do input:', dateInput);
    
    // Normalizar e formatar a data para garantir consistência
    const dataObj = normalizarData(dateInput);
    const date = formatarDataLocal(dataObj);
    
    console.log('Data normalizada:', dataObj);
    console.log('Data formatada para salvar:', date);

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE}/caixa/${id}` : `${API_BASE}/caixa`;

    const response = await fetch(url,{
      method,
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({date, os, credit, debit, obs_debito:obsDebito})
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao salvar: ${response.status}`);
    }

    $('formCaixa').reset();
    $('caixaData').value = dataHoje;
    renderCaixa($('filterDate').value || null);
  } catch (error) {
    showAlert('Erro ao salvar registro. Verifique sua conexão com a internet ou se o servidor da API está disponível.');
  }
}

async function editCaixa(id) {
  const e = caixaEntries.find(x=>x.id==id);
  if(!e) return;
  $('caixaId').value = e.id;
  $('caixaData').value = e.date.slice(0,10);
  $('caixaOS').value = e.os;
  $('caixaCredito').value = e.credit;
  $('caixaDebito').value = e.debit;
  $('caixaObsDebito').value = e.obs_debito || '';
}

async function deleteCaixa(id) {
  if(!confirm("Deseja realmente excluir este registro?")) return;
  try {
    const response = await fetch(`${API_BASE}/caixa/${id}`,{method:'DELETE'});
    if (!response.ok) {
      throw new Error(`Erro ao excluir: ${response.status}`);
    }
    renderCaixa($('filterDate').value || null);
  } catch (error) {
    showAlert('Erro ao excluir registro. Verifique sua conexão com a internet ou se o servidor da API está disponível.');
  }
}

// --- CRUD OS ---
async function addOrUpdateOS() {
  try {
    const id = $('osId').value;
    const dateInput = $('osData').value || dataHoje;
    
    console.log('Data original do input OS:', dateInput);
    
    // Normalizar e formatar a data para garantir consistência entre ambientes
    const dataObj = normalizarData(dateInput);
    const date = formatarDataLocal(dataObj);
    
    console.log('Data normalizada OS:', dataObj);
    console.log('Data formatada para salvar OS:', date);
    
    const numero_os = $('osNumero').value;
    const liberou = $('osLiberou').value;
    const levou = $('osLevou').value;

    // Validação básica
    if (!numero_os) {
      showAlert('Preencha o número da OS');
      return;
    }

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE}/os/${id}` : `${API_BASE}/os`;

    const response = await fetch(url,{
      method,
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({date, numero_os, liberou, levou})
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao salvar: ${response.status}`);
    }

    $('formOS').reset();
    renderOS($('filterDate').value || null);
  } catch (error) {
    showAlert('Erro ao salvar registro. Verifique sua conexão com a internet ou se o servidor da API está disponível.');
  }
}

async function editOS(id) {
  const e = osEntries.find(x=>x.id==id);
  if(!e) return;
  $('osId').value = e.id;
  $('osData').value = e.date.slice(0,10); // Formato YYYY-MM-DD
  $('osNumero').value = e.numero_os;
  $('osLiberou').value = e.liberou;
  $('osLevou').value = e.levou;
}

async function deleteOS(id) {
  if(!confirm("Deseja realmente excluir este registro?")) return;
  try {
    const response = await fetch(`${API_BASE}/os/${id}`,{method:'DELETE'});
    if (!response.ok) {
      throw new Error(`Erro ao excluir: ${response.status}`);
    }
    renderOS($('filterDate').value || null);
  } catch (error) {
    showAlert('Erro ao excluir registro. Verifique sua conexão com a internet ou se o servidor da API está disponível.');
  }
}

// --- Eventos ---
// Verifica se estamos em ambiente de navegador antes de adicionar event listeners
if (typeof document !== 'undefined') {
  const formCaixa = $('formCaixa');
  if (formCaixa) {
    formCaixa.addEventListener('submit', e=>{
      e.preventDefault();
      addOrUpdateCaixa();
    });
  }
}

// Verifica se estamos em ambiente de navegador antes de adicionar event listeners
if (typeof document !== 'undefined') {
  const formOS = $('formOS');
  if (formOS) {
    formOS.addEventListener('submit', e=>{
      e.preventDefault();
      addOrUpdateOS();
    });
  }
}

// Verifica se estamos em ambiente de navegador antes de adicionar event listeners
if (typeof document !== 'undefined') {
  const btnLimparCaixa = $('btnLimparCaixa');
  if (btnLimparCaixa) {
    btnLimparCaixa.addEventListener('click', ()=>{
      const formCaixa = $('formCaixa');
      if (formCaixa) formCaixa.reset();
      
      const caixaData = $('caixaData');
      if (caixaData) caixaData.value = dataHoje;
    });
  }
}

// Verifica se estamos em ambiente de navegador antes de adicionar event listeners
if (typeof document !== 'undefined') {
  const btnLimparOS = $('btnLimparOS');
  if (btnLimparOS) {
    btnLimparOS.addEventListener('click', ()=>{
      const formOS = $('formOS');
      if (formOS) formOS.reset();
      
      const osData = $('osData');
      if (osData) osData.value = dataHoje;
    });
  }

  const filterDate = $('filterDate');
  if (filterDate) {
    filterDate.addEventListener('change', ()=> {
      const f = filterDate.value || null;
      renderCaixa(f);
      renderOS(f);
    });
  }
}

// --- Impressão do dia ---
// Função para imprimir o relatório do dia atual ou filtrado
function imprimirDia() {
  console.log('Iniciando função imprimirDia');
  // Perguntar ao usuário se deseja usar a data do filtro ou selecionar outra data
  let dataFiltro = $('filterDate').value || dataHoje;
  console.log('Data do filtro original em imprimirDia:', dataFiltro);
  
  // Normalizar a data para garantir o formato correto
  const dataFiltroObj = normalizarData(dataFiltro);
  dataFiltro = formatarDataLocal(dataFiltroObj); // Garantir formato YYYY-MM-DD
  console.log('Data do filtro normalizada em imprimirDia:', dataFiltro);
  
  // Garantir que a data exibida seja a mesma que foi selecionada
  const dataFormatada = formatDataBR(dataFiltro);
  console.log('Data formatada para exibição em imprimirDia:', dataFormatada);
  console.log('Ambiente:', typeof window !== 'undefined' ? 'Browser' : 'Node.js');
  console.log('Fuso horário configurado:', TIMEZONE);
  
  const usarDataFiltro = confirm('Deseja gerar o relatório para a data atualmente filtrada (' + dataFormatada + ')? Clique em OK para confirmar ou CANCELAR para selecionar outra data.');
  
  if (!usarDataFiltro) {
    // Criar um elemento de input de data temporário
    const tempInput = document.createElement('input');
    tempInput.type = 'date';
    tempInput.value = dataFiltro;
    tempInput.style.position = 'fixed';
    tempInput.style.left = '-100px';
    document.body.appendChild(tempInput);
    
    // Simular um clique para abrir o seletor de data
    tempInput.focus();
    tempInput.click();
    
    // Aguardar a seleção da data
    const novaDataPromise = new Promise((resolve) => {
      tempInput.addEventListener('change', () => {
        const novaData = tempInput.value;
        document.body.removeChild(tempInput);
        resolve(novaData);
      });
      
      // Se o usuário clicar fora, usar a data atual
      document.addEventListener('click', function clickHandler(e) {
        if (e.target !== tempInput) {
          document.removeEventListener('click', clickHandler);
          document.body.removeChild(tempInput);
          resolve(dataFiltro); // Manter a data original
        }
      });
    });
    
    // Aguardar a seleção da data antes de continuar
    novaDataPromise.then((novaData) => {
      if (novaData) {
        dataFiltro = novaData;
        console.log('Nova data selecionada:', dataFiltro);
        console.log('Data formatada para relatório:', formatDataBR(dataFiltro));
        gerarRelatorio(dataFiltro);
      }
    });
    
    return; // Retornar aqui para evitar a execução imediata
  }
  
  // Se o usuário escolheu usar a data do filtro, gerar o relatório imediatamente
  gerarRelatorio(dataFiltro);
}

// Função auxiliar para gerar o relatório com a data selecionada
function gerarRelatorio(dataFiltro) {
  console.log('Gerando relatório para a data original:', dataFiltro);
  
  // Normalizar a data do filtro para garantir o formato correto (YYYY-MM-DD)
  const dataObj = normalizarData(dataFiltro);
  const dataFiltroNormalizada = formatarDataLocal(dataObj);
  console.log('Data do filtro normalizada para relatório:', dataFiltroNormalizada);
  
  // Verificar o formato das datas para depuração
  console.log('Exemplo de data em caixaEntries:', caixaEntries.length > 0 ? caixaEntries[0].date : 'Nenhum registro');
  console.log('Exemplo de data em osEntries:', osEntries.length > 0 ? osEntries[0].date : 'Nenhum registro');
  
  // Filtrar os registros pela data selecionada
  const caixaDia = caixaEntries.filter(e => {
    // Garantir que estamos comparando apenas a parte da data (YYYY-MM-DD)
    const dataRegistro = e.date ? e.date.slice(0, 10) : '';
    console.log(`Comparando: ${dataRegistro} === ${dataFiltroNormalizada}`);
    return dataRegistro === dataFiltroNormalizada;
  });
  
  const osDia = osEntries.filter(e => {
    // Garantir que estamos comparando apenas a parte da data (YYYY-MM-DD)
    const dataRegistro = e.date ? e.date.slice(0, 10) : '';
    console.log(`Comparando OS: ${dataRegistro} === ${dataFiltroNormalizada}`);
    return dataRegistro === dataFiltroNormalizada;
  });
  
  console.log(`Encontrados ${caixaDia.length} registros de caixa e ${osDia.length} registros de OS para a data ${dataFiltroNormalizada}`);
  const dataAtual = new Date();
  // Garantir que a hora atual use o fuso horário correto
  const horaAtual = dataAtual.toLocaleTimeString('pt-BR', {timeZone: TIMEZONE});
  console.log('Hora atual formatada para o relatório:', horaAtual);
  
  // Estilos CSS para o relatório
  const estilos = `
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 20px;
        color: #333;
      }
      .cabecalho {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        border-bottom: 2px solid #0056b3;
        padding-bottom: 10px;
      }
      .logo-container {
        display: flex;
        align-items: center;
      }
      .logo {
        max-height: 60px;
        margin-right: 15px;
      }
      .info-empresa {
        flex-grow: 1;
      }
      .data-relatorio {
        text-align: right;
        font-size: 14px;
      }
      h1, h2, h3 {
        color: #0056b3;
        margin-top: 0;
      }
      h1 {
        font-size: 24px;
        margin-bottom: 5px;
      }
      h2 {
        font-size: 20px;
        margin-bottom: 15px;
        text-align: center;
        padding: 10px;
        background-color: #f8f9fa;
        border-radius: 5px;
      }
      h3 {
        font-size: 18px;
        margin-top: 20px;
        margin-bottom: 10px;
        padding-left: 5px;
        border-left: 4px solid #0056b3;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
        box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
      }
      th {
        background-color: #0056b3;
        color: white;
        text-align: left;
        padding: 10px;
      }
      td {
        padding: 8px 10px;
        border-bottom: 1px solid #ddd;
      }
      tr:nth-child(even) {
        background-color: #f8f9fa;
      }
      tr:hover {
        background-color: #f1f1f1;
      }
      .total-row {
        font-weight: bold;
        background-color: #e9ecef;
      }
      .valor-positivo {
        color: #28a745;
      }
      .valor-negativo {
        color: #dc3545;
      }
      .rodape {
        margin-top: 30px;
        font-size: 12px;
        text-align: center;
        color: #6c757d;
        border-top: 1px solid #ddd;
        padding-top: 10px;
      }
      @media print {
        body {
          padding: 0;
          font-size: 12px;
        }
        .no-print {
          display: none;
        }
        table {
          page-break-inside: avoid;
        }
      }
    </style>
  `;

  // Construção do HTML em partes para evitar problemas com caracteres especiais
  let html = "<!DOCTYPE html>\n";
  html += "<html lang=\"pt-BR\">\n";
  html += "<head>\n";
  html += "  <meta charset=\"UTF-8\">\n";
  html += "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n";
  html += "  <title>Relatório do Dia: " + formatDataBR(dataFiltro) + "</title>\n";
  html += estilos;
  html += "</head>\n";
  html += "<body>\n";
  
  // Cabeçalho
  html += "  <div class=\"cabecalho\">\n";
  html += "    <div class=\"logo-container\">\n";
  // Verificar se estamos no GitHub Pages e ajustar o caminho da logo
  let caminhoLogo = "/logo.png";
  if (window.location.hostname.includes("github.io")) {
    // No GitHub Pages, precisamos incluir o nome do repositório no caminho
    caminhoLogo = "/sistema-Caixa/logo.png";
  }
  const caminhoAbsoluto = window.location.origin + caminhoLogo;
  console.log('Caminho da logo:', caminhoAbsoluto);
  html += "      <img src=\"" + caminhoAbsoluto + "\" alt=\"Logo da Empresa\" class=\"logo\">\n";
  html += "      <div class=\"info-empresa\">\n";
  html += "        <h1>Sistema de Caixa</h1>\n";
  html += "        <p>Controle de Fluxo Financeiro e Ordens de Serviço</p>\n";
  html += "      </div>\n";
  html += "    </div>\n";
  html += "    <div class=\"data-relatorio\">\n";
  html += "      <p><strong>Data do Relatório:</strong> " + formatDataBR(dataFiltro) + "</p>\n";
  html += "      <p><strong>Gerado em:</strong> " + horaAtual + "</p>\n";
  html += "    </div>\n";
  html += "  </div>\n";
  
  // Título do relatório
  html += "  <h2>Relatório do Dia: " + formatDataBR(dataFiltro) + "</h2>\n";
  
  // Seção de Movimentação de Caixa
  html += "  <h3>Movimentação de Caixa</h3>\n";
  html += "  <table>\n";
  html += "    <thead>\n";
  html += "      <tr>\n";
  html += "        <th>OS</th>\n";
  html += "        <th>Horário</th>\n";
  html += "        <th>Crédito</th>\n";
  html += "        <th>Débito</th>\n";
  html += "        <th>Total</th>\n";
  html += "        <th>Observações</th>\n";
  html += "      </tr>\n";
  html += "    </thead>\n";
  html += "    <tbody>\n";
  
  // Processamento das entradas de caixa
  let totalDia = 0;
  caixaDia.forEach(e => {
    const valor = e.credit - e.debit;
    totalDia += valor;
    const valorClass = valor >= 0 ? 'valor-positivo' : 'valor-negativo';
    
    html += "      <tr>\n";
    html += "        <td>" + (e.os || '-') + "</td>\n";
    html += "        <td>" + (e.created_at_formatted || '-') + "</td>\n";
    html += "        <td>R$ " + money(e.credit) + "</td>\n";
    html += "        <td>R$ " + money(e.debit) + "</td>\n";
    html += "        <td class=\"" + valorClass + "\">R$ " + money(valor) + "</td>\n";
    html += "        <td>" + (e.obs_debito || '-') + "</td>\n";
    html += "      </tr>\n";
  });
  
  // Total do dia
  const totalClass = totalDia >= 0 ? 'valor-positivo' : 'valor-negativo';
  html += "      <tr class=\"total-row\">\n";
  html += "        <td colspan=\"4\">Total do dia:</td>\n";
  html += "        <td class=\"" + totalClass + "\">R$ " + money(totalDia) + "</td>\n";
  html += "        <td></td>\n";
  html += "      </tr>\n";
  html += "    </tbody>\n";
  html += "  </table>\n";
  
  // Seção de Saída de OS
  html += "  <h3>Saída de Ordens de Serviço</h3>\n";
  html += "  <table>\n";
  html += "    <thead>\n";
  html += "      <tr>\n";
  html += "        <th>Número OS</th>\n";
  html += "        <th>Horário</th>\n";
  html += "        <th>Liberado por</th>\n";
  html += "        <th>Retirado por</th>\n";
  html += "      </tr>\n";
  html += "    </thead>\n";
  html += "    <tbody>\n";
  
  // Processamento das saídas de OS
  if (osDia.length > 0) {
    osDia.forEach(e => {
      html += "      <tr>\n";
      html += "        <td>" + (e.numero_os || '-') + "</td>\n";
      html += "        <td>" + (e.created_at_formatted || '-') + "</td>\n";
      html += "        <td>" + (e.liberou || '-') + "</td>\n";
      html += "        <td>" + (e.levou || '-') + "</td>\n";
      html += "      </tr>\n";
    });
  } else {
    html += "      <tr><td colspan=\"4\" style=\"text-align: center;\">Nenhuma OS registrada nesta data</td></tr>\n";
  }
  
  html += "    </tbody>\n";
  html += "  </table>\n";
  
  // Rodapé
  html += "  <div class=\"rodape\">\n";
  html += "    <p>Este relatório foi gerado automaticamente pelo Sistema de Caixa em " + formatDataBR(dataAtual) + " às " + horaAtual + "</p>\n";
  html += "    <p>© " + dataAtual.getFullYear() + " - Todos os direitos reservados</p>\n";
  html += "  </div>\n";
  html += "</body>\n";
  html += "</html>";
  
  // Abre janela de impressão
  const printWindow = window.open('', '', 'height=600,width=800');
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
}

// --- Função auxiliar ---
// Função auxiliar para formatar data no padrão brasileiro
function formatDataBR(dataISO) {
  // Verificar o formato da data de entrada para depuração
  console.log('Data de entrada formatDataBR:', dataISO);
  
  // Normalizar a data usando a função de normalização
  const dataObj = normalizarData(dataISO);
  console.log('Data normalizada em formatDataBR:', dataObj);
  
  // Usar o método toLocaleDateString com o fuso horário explícito para formatar no padrão brasileiro (DD/MM/YYYY)
  const options = { timeZone: TIMEZONE, day: '2-digit', month: '2-digit', year: 'numeric' };
  const dataFormatada = dataObj.toLocaleDateString('pt-BR', options);
  console.log('Data formatada em formatDataBR:', dataFormatada);
  
  return dataFormatada;
}

// --- Inicial ---
// Verificar se estamos em ambiente de navegador antes de inicializar
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando aplicação...');
    
    // Definir a data atual nos campos de data
    const hoje = new Date();
    console.log('Data atual (objeto Date):', hoje);
    
    // Normalizar e formatar a data atual
    const hojeNormalizado = normalizarData(hoje);
    console.log('Data atual normalizada:', hojeNormalizado);
    
    // Inicializar campos de data com a data atual
    const osData = $('osData');
    if (osData) {
      osData.value = dataHoje;
      console.log('Campo osData definido com data:', dataHoje);
    }
    
    // Verificar conexão com a API
    checkApiConnection();
    
    try {
      // Carregar dados iniciais
      renderCaixa();
      renderOS();
      console.log('Dados iniciais carregados com sucesso!');
      
      // Inicializar o calendário se estiver disponível
      if (typeof FullCalendar !== 'undefined' && document.getElementById('calendar')) {
        initCalendar();
        console.log('Calendário inicializado!');
      }
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    }
    
    console.log('Aplicação inicializada com sucesso!');
  });
} else {
  // Em ambiente não-navegador (como SSR)
  checkApiConnection();
}