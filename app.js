<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sistema de Caixa + Calculadora</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      background: #f4f4f4;
    }

    h2 {
      margin-top: 30px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }

    table, th, td {
      border: 1px solid #ccc;
    }

    th, td {
      padding: 8px;
      text-align: center;
    }

    input, select, button {
      padding: 6px;
      margin: 4px 0;
    }

    button {
      cursor: pointer;
    }

    .calculadora {
      width: 220px;
      background: #fff;
      padding: 15px;
      border-radius: 10px;
      border: 1px solid #ccc;
      box-shadow: 2px 2px 6px rgba(0,0,0,0.2);
      margin-top: 20px;
    }

    .calculadora input {
      width: 100%;
      height: 40px;
      text-align: right;
      font-size: 18px;
      margin-bottom: 10px;
      border: 1px solid #ccc;
      border-radius: 5px;
      padding-right: 10px;
    }

    .calculadora .botoes {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 5px;
    }

    .calculadora button {
      height: 40px;
      font-size: 16px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      background: #eee;
      transition: background 0.2s;
    }

    .calculadora button:hover {
      background: #ddd;
    }

    .calculadora button.operador {
      background: #f9c74f;
    }

    .calculadora button.igual {
      background: #90be6d;
      grid-column: span 2;
    }

    .calculadora button.zero {
      grid-column: span 2;
    }
  </style>
</head>
<body>

  <h2>📌 Controle de Caixa</h2>
  <form id="formCaixa">
    <label>Descrição: <input type="text" id="descricaoCaixa" required></label>
    <label>Valor: <input type="number" step="0.01" id="valorCaixa" required></label>
    <label>Tipo:
      <select id="tipoCaixa">
        <option value="entrada">Entrada</option>
        <option value="saida">Saída</option>
      </select>
    </label>
    <button type="submit">Adicionar</button>
  </form>

  <table>
    <thead>
      <tr>
        <th>Descrição</th>
        <th>Valor</th>
        <th>Tipo</th>
        <th>Ações</th>
      </tr>
    </thead>
    <tbody id="tbodyCaixa"></tbody>
  </table>
  <p><b>Total em Caixa:</b> R$ <span id="totalCaixa">0,00</span></p>

  <h2>📌 Saída de OS</h2>
  <form id="formOS">
    <label>Número OS: <input type="text" id="numeroOS" required></label>
    <label>Liberado por: <input type="text" id="liberadoPor" required></label>
    <label>Retirado por: <input type="text" id="retiradoPor" required></label>
    <button type="submit">Adicionar</button>
  </form>

  <table>
    <thead>
      <tr>
        <th>Número OS</th>
        <th>Liberado por</th>
        <th>Retirado por</th>
        <th>Ações</th>
      </tr>
    </thead>
    <tbody id="tbodyOS"></tbody>
  </table>

  <!-- Calculadora -->
  <div class="calculadora">
    <input type="text" id="display" disabled>
    <div class="botoes">
      <button onclick="limpar()">C</button>
      <button onclick="digitar('/')">/</button>
      <button onclick="digitar('*')">*</button>
      <button onclick="apagar()">←</button>

      <button onclick="digitar('7')">7</button>
      <button onclick="digitar('8')">8</button>
      <button onclick="digitar('9')">9</button>
      <button onclick="digitar('-')">-</button>

      <button onclick="digitar('4')">4</button>
      <button onclick="digitar('5')">5</button>
      <button onclick="digitar('6')">6</button>
      <button onclick="digitar('+')">+</button>

      <button onclick="digitar('1')">1</button>
      <button onclick="digitar('2')">2</button>
      <button onclick="digitar('3')">3</button>
      <button class="igual" onclick="calcular()">=</button>

      <button class="zero" onclick="digitar('0')">0</button>
      <button onclick="digitar('.')">.</button>
    </div>
  </div>

  <script>
    const $ = id => document.getElementById(id);
    const money = v => Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});

    // -------------------------
    // CAIXA
    // -------------------------
    let caixa = JSON.parse(localStorage.getItem("caixa")) || [];

    function salvarCaixa() {
      localStorage.setItem("caixa", JSON.stringify(caixa));
    }

    function renderCaixa() {
      $("tbodyCaixa").innerHTML = "";
      let total = 0;
      caixa.forEach((item, i) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${item.descricao}</td>
          <td>R$ ${money(item.valor)}</td>
          <td>${item.tipo}</td>
          <td><button onclick="removerCaixa(${i})">🗑</button></td>
        `;
        $("tbodyCaixa").appendChild(tr);
        total += item.tipo === "entrada" ? item.valor : -item.valor;
      });
      $("totalCaixa").textContent = money(total);
    }

    $("formCaixa").addEventListener("submit", e => {
      e.preventDefault();
      const descricao = $("descricaoCaixa").value;
      const valor = parseFloat($("valorCaixa").value);
      const tipo = $("tipoCaixa").value;
      caixa.push({descricao, valor, tipo});
      salvarCaixa();
      renderCaixa();
      e.target.reset();
    });

    function removerCaixa(i) {
      caixa.splice(i,1);
      salvarCaixa();
      renderCaixa();
    }

    // -------------------------
    // OS
    // -------------------------
    let os = JSON.parse(localStorage.getItem("os")) || [];

    function salvarOS() {
      localStorage.setItem("os", JSON.stringify(os));
    }

    function renderOS() {
      $("tbodyOS").innerHTML = "";
      os.forEach((item, i) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${item.numero}</td>
          <td>${item.liberado}</td>
          <td>${item.retirado}</td>
          <td><button onclick="removerOS(${i})">🗑</button></td>
        `;
        $("tbodyOS").appendChild(tr);
      });
    }

    $("formOS").addEventListener("submit", e => {
      e.preventDefault();
      const numero = $("numeroOS").value;
      const liberado = $("liberadoPor").value;
      const retirado = $("retiradoPor").value;
      os.push({numero, liberado, retirado});
      salvarOS();
      renderOS();
      e.target.reset();
    });

    function removerOS(i) {
      os.splice(i,1);
      salvarOS();
      renderOS();
    }

    // -------------------------
    // CALCULADORA
    // -------------------------
    const display = document.getElementById("display");

    function digitar(valor) {
      display.value += valor;
    }

    function limpar() {
      display.value = "";
    }

    function apagar() {
      display.value = display.value.slice(0, -1);
    }

    function calcular() {
      try {
        display.value = eval(display.value);
      } catch {
        display.value = "Erro";
      }
    }

    // Inicializa
    renderCaixa();
    renderOS();
  </script>

</body>
</html>
