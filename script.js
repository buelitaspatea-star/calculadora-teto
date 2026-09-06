
(function () {
  const display = document.getElementById('display');
  const history = document.getElementById('history');

  let expression = '';
  let justEvaluated = false;

const audioFiles = {
  '0': './Audio/Cero.mpeg',
  '1': './Audio/Uno.mpeg',
  '2': './Audio/Dos.mpeg',
  '3': './Audio/Tres.mpeg',
  '4': './Audio/Cuatro.mpeg',
  '5': './Audio/Cinco.mpeg',
  '6': './Audio/Seis.mpeg',
  '7': './Audio/Siete.mpeg',
  '8': './Audio/ocho.mpeg',
  '9': './Audio/Nueve.mpeg',

  '+': './Audio/Mas.mpeg',
  '-': './Audio/Menos.mpeg',
  '*': './Audio/Por.mpeg',
  '/': './Audio/entre.mpeg',

  '.': './Audio/Punto.mpeg',
  'delete': './Audio/Borrar.mpeg',
  '=': './Audio/Tu respuesta.mpeg',
  'C': './Audio/Salchipapa.mpeg'
};

  function playAudio(file) {
    if (!file) return;

    const audio = new Audio(file);

    audio.play().catch(error => {
      console.log('No se pudo reproducir el audio:', error);
    });
  }

  function formatResult(value) {
    if (!Number.isFinite(value)) {
      return 'Error';
    }

    const rounded = Number(value.toFixed(10));
    return String(rounded);
  }

  function calculateExpression(input) {
    const sanitized = String(input)
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/\s+/g, '')
      .replace(/%/g, '/100');

    if (!sanitized || !/^[0-9+\-*/.()]+$/.test(sanitized)) {
      throw new Error('Entrada inválida');
    }

    return Function('"use strict"; return (' + sanitized + ');')();
  }

  function updateDisplay() {
    display.textContent = expression || '0';
    history.textContent = expression ? expression : '0';
  }

  function appendNumber(value) {
    playAudio(audioFiles[value]);

    if (justEvaluated) {
      expression = '';
      justEvaluated = false;
    }

    if (expression === '0' && value !== '.') {
      expression = value;
    } else {
      expression += value;
    }

    updateDisplay();
  }

  function appendOperator(operator) {
    playAudio(audioFiles[operator]);

    if (justEvaluated) {
      expression = '';
      justEvaluated = false;
    }

    if (!expression) {
      if (operator === '-') {
        expression = '-';
      }

      updateDisplay();
      return;
    }

    const lastCharacter = expression.slice(-1);
    const operators = ['+', '-', '*', '/'];

    if (operators.includes(lastCharacter)) {
      expression = expression.slice(0, -1) + operator;
    } else {
      expression += operator;
    }

    updateDisplay();
  }

  function appendDecimal() {
    playAudio(audioFiles['.']);

    if (justEvaluated) {
      expression = '';
      justEvaluated = false;
    }

    const lastNumber = expression.split(/[+\-*/]/).pop();

    if (lastNumber && lastNumber.includes('.')) {
      return;
    }

    if (!expression || /[+\-*/]$/.test(expression)) {
      expression += '0.';
    } else {
      expression += '.';
    }

    updateDisplay();
  }

function clearExpression() {
  playAudio(audioFiles['C']);

  expression = '';
  justEvaluated = false;
  updateDisplay();
}


  function deleteLast() {
    playAudio(audioFiles.delete);

    if (justEvaluated) {
      clearExpression();
      return;
    }

    expression = expression.slice(0, -1);

    if (!expression) {
      expression = '0';
    }

    updateDisplay();
  }

  function setPercent() {
    if (!expression) {
      return;
    }

    expression += '%';
    updateDisplay();
  }

  function evaluate() {
    if (!expression || /[+\-*/]$/.test(expression)) {
      return;
    }

    playAudio(audioFiles['=']);

    try {
      const result = calculateExpression(expression);
      const textResult = formatResult(result);

      history.textContent = expression;
      display.textContent = textResult;
      expression = textResult;
      justEvaluated = true;
    } catch (error) {
      history.textContent = expression;
      display.textContent = 'Error';
      expression = '';
      justEvaluated = false;
    }
  }

  document.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      const value = button.dataset.value;

      switch (action) {
        case 'number':
          appendNumber(value);
          break;

        case 'operator':
          appendOperator(value);
          break;

        case 'decimal':
          appendDecimal();
          break;

        case 'clear':
          clearExpression();
          break;

        case 'delete':
          deleteLast();
          break;

        case 'percent':
          setPercent();
          break;

        case 'equals':
          evaluate();
          break;

        default:
          break;
      }
    });
  });

  updateDisplay();

  if (typeof module !== 'undefined') {
    module.exports = {
      calculateExpression,
      formatResult,
    };
  }
})();
