const steps = [
  {
    key: 'name',
    eyebrow: 'Vamos começar',
    title: 'Qual o seu nome e sobrenome?',
    help: 'Digite seu nome completo para continuarmos.',
    label: 'Nome e sobrenome',
    placeholder: 'Digite seu nome aqui...',
    type: 'text',
    autocomplete: 'name',
    validate: (value) => value.trim().split(/\s+/).length >= 2
      ? ''
      : 'Digite seu nome e sobrenome.'
  },
  {
    key: 'whatsapp',
    eyebrow: 'Quase lá',
    title: 'Qual o seu WhatsApp?',
    help: 'Informe um número com DDD para entrarmos em contato.',
    label: 'WhatsApp',
    placeholder: '(11) 99999-9999',
    type: 'tel',
    autocomplete: 'tel',
    validate: (value) => value.replace(/\D/g, '').length >= 10
      ? ''
      : 'Digite um WhatsApp válido com DDD.'
  }
];

const state = { current: 0, answers: {} };
const card = document.querySelector('#questionCard');
const form = document.querySelector('#stepForm');
const input = document.querySelector('#answerInput');
const title = document.querySelector('#questionTitle');
const help = document.querySelector('#questionHelp');
const eyebrow = document.querySelector('#eyebrow');
const label = document.querySelector('#fieldLabel');
const counter = document.querySelector('#stepCounter');
const progressBar = document.querySelector('#progressBar');
const error = document.querySelector('#errorMessage');
const button = document.querySelector('#continueButton');
const buttonText = document.querySelector('#buttonText');

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function renderStep(direction = 'forward') {
  const step = steps[state.current];
  const savedValue = state.answers[step.key] || '';

  card.classList.remove('is-active');
  card.classList.add(direction === 'forward' ? 'is-leaving' : 'is-entering');

  window.setTimeout(() => {
    eyebrow.textContent = step.eyebrow;
    title.textContent = step.title;
    help.textContent = step.help;
    label.textContent = step.label;
    input.type = step.type;
    input.autocomplete = step.autocomplete;
    input.placeholder = step.placeholder;
    input.value = step.key === 'whatsapp' ? formatPhone(savedValue) : savedValue;
    input.inputMode = step.type === 'tel' ? 'tel' : 'text';
    error.textContent = '';
    input.classList.remove('input-error');
    counter.textContent = `${state.current + 1} → ${steps.length}`;
    progressBar.style.width = `${((state.current + 1) / steps.length) * 100}%`;
    buttonText.textContent = state.current === steps.length - 1 ? 'Enviar' : 'OK';
    card.classList.remove('is-leaving', 'is-entering');
    card.classList.add('is-active');
    input.focus({ preventScroll: true });
  }, 290);
}

function showSuccess() {
  progressBar.style.width = '100%';
  counter.textContent = 'Concluído ✓';
  card.innerHTML = `
    <div class="success">
      <div class="success__icon" aria-hidden="true">✓</div>
      <p class="eyebrow">Tudo certo</p>
      <h1>Obrigado, ${escapeHtml(state.answers.name.split(/\s+/)[0])}.</h1>
      <p>Recebemos seus dados. Em breve entraremos em contato pelo WhatsApp informado.</p>
    </div>
  `;
}

const SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycbw6DvHWbGAOQEbmC9zDuUy16rBpaw1PfEqcjIKCIK2apam7ZeeZyFXI8KSAa5z6hqA00w/exec';

async function sendToSheet() {
  const response = await fetch(SHEET_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ name: state.answers.name, phone: state.answers.whatsapp })
  });
  const result = await response.json().catch(() => ({}));
  if (result.result !== 'success') throw new Error('Falha ao salvar');
}

function escapeHtml(text) {
  return text.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
}

input.addEventListener('input', () => {
  const step = steps[state.current];
  if (step.key === 'whatsapp') input.value = formatPhone(input.value);
  error.textContent = '';
  input.classList.remove('input-error');
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const step = steps[state.current];
  const rawValue = input.value.trim();
  const validationMessage = step.validate(rawValue);

  if (validationMessage) {
    error.textContent = validationMessage;
    input.classList.add('input-error');
    input.focus();
    return;
  }

  state.answers[step.key] = rawValue;
  button.disabled = true;

  window.setTimeout(() => {
    if (state.current < steps.length - 1) {
      button.disabled = false;
      state.current += 1;
      renderStep('forward');
      return;
    }

    sendToSheet()
      .then(showSuccess)
      .catch(() => {
        button.disabled = false;
        error.textContent = 'Não foi possível enviar agora. Tente novamente.';
        input.classList.add('input-error');
        input.focus();
      });
  }, 230);
});

renderStep('forward');
