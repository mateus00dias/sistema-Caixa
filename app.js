<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sistema com Calculadora</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      background: #f4f4f4;
    }

    #saida {
      padding: 10px;
      background: #fff;
      border: 1px solid #ccc;
      margin-bottom: 20px;
    }

    .calculadora {
      width: 220px;
      background: #fff;
      padding: 15px;
      border-radius: 10px;
      border: 1px solid #ccc;
      box-shadow: 2px 2px 6px rgba(0,0,0,0.2);
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

  <div id="saida">
    <h3>Saída de OS</h3>
    <p>Aqui vai o conteúdo da saída da ordem de serviço...</p>
  </div>

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
  </script>

</body>
</html>
