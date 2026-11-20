const SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycbw6DvHWbGAOQEbmC9zDuUy16rBpaw1PfEqcjIKCIK2apam7ZeeZyFXI8KSAa5z6hqA00w/exec';
const GHL_WEBHOOK = 'https://services.leadconnectorhq.com/hooks/3PX64HuGchlu0IkZet5Z/webhook-trigger/YXnc32VOmV3WvZmpuQfs';
const THANKS_URL = '/obrigado.html';

const MQL_REVENUES = [
  'De 101 mil à 400 mil',
  'De 400 mil à 1 milhão',
  'Mais de 1 milhão'
];

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
  },
  {
    key: 'email',
    eyebrow: 'Contato',
    title: 'Qual o seu melhor e-mail?',
    help: 'Usaremos para enviar o resumo do diagnóstico.',
    label: 'Melhor e-mail',
    placeholder: 'voce@empresa.com.br',
    type: 'email',
    autocomplete: 'email',
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
      ? ''
      : 'Digite um e-mail válido.'
  },
  {
    key: 'cargo',
    eyebrow: 'Sobre você',
    title: 'Qual opção descreve melhor o seu cargo?',
    help: 'Escolha a opção que mais se aproxima da sua função.',
    label: 'Cargo',
    type: 'choice',
    options: [
      { letter: 'A', label: 'Dono/CEO' },
      { letter: 'B', label: 'Diretor' },
      { letter: 'C', label: 'Gerente' },
      { letter: 'D', label: 'Supervisor' },
      { letter: 'E', label: 'Colaborador' }
    ],
    validate: (value) => value ? '' : 'Selecione uma opção.'
  },
  {
    key: 'empresa',
    eyebrow: 'Sua empresa',
    title: 'Qual o nome da sua empresa?',
    help: 'Como sua empresa é conhecida no mercado.',
    label: 'Nome da empresa',
    placeholder: 'Nome da empresa',
    type: 'text',
    autocomplete: 'organization',
    validate: (value) => value.trim() ? '' : 'Digite o nome da empresa.'
  },
  {
    key: 'instagram',
    eyebrow: 'Sua empresa',
    title: 'Qual o @ do Instagram da sua empresa?',
    help: 'Se não tiver, pode digitar o nome de usuário mesmo assim.',
    label: 'Instagram da empresa',
    placeholder: '@suaempresa',
    type: 'text',
    autocomplete: 'off',
    normalize: (value) => {
      const handle = value.trim().replace(/\s/g, '').replace(/^@+/, '');
      return handle ? '@' + handle : '';
    },
    validate: (value) => value.replace(/^@+/, '').trim()
      ? ''
      : 'Digite o @ do Instagram.'
  },
  {
    key: 'faturamento',
    eyebrow: 'Última pergunta',
    title: 'Qual o faturamento mensal da sua empresa?',
    help: 'Isso nos ajuda a preparar o diagnóstico certo para o seu momento.',
    label: 'Faturamento mensal',
    type: 'choice',
    options: [
      { letter: 'A', label: 'Até 50 mil' },
      { letter: 'B', label: 'De 51 mil à 100 mil' },
      { letter: 'C', label: 'De 101 mil à 400 mil' },
      { letter: 'D', label: 'De 400 mil à 1 milhão' },
      { letter: 'E', label: 'Mais de 1 milhão' }
    ],
    validate: (value) => value ? '' : 'Selecione uma opção.'
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
const optionsList = document.querySelector('#optionsList');

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function renderOptions(step, savedValue) {
  optionsList.innerHTML = '';

  step.options.forEach((option) => {
    const item = document.createElement('li');
    item.setAttribute('role', 'presentation');
    const optionButton = document.createElement('button');
    const key = document.createElement('span');
    const optionLabel = document.createElement('span');

    optionButton.type = 'button';
    optionButton.className = 'option';
    optionButton.dataset.value = option.label;
    optionButton.setAttribute('role', 'option');
    optionButton.setAttribute('aria-selected', String(savedValue === option.label));

    key.className = 'option__key';
    key.textContent = option.letter;
    optionLabel.className = 'option__label';
    optionLabel.textContent = option.label;

    optionButton.append(key, optionLabel);
    optionButton.addEventListener('click', () => selectOption(step, option.label));
    item.appendChild(optionButton);
    optionsList.appendChild(item);
  });

  optionsList.hidden = false;
  optionsList.classList.remove('options--error');
}

function selectOption(step, value) {
  state.answers[step.key] = value;
  error.textContent = '';
  optionsList.classList.remove('options--error');
  optionsList.querySelectorAll('.option').forEach((optionButton) => {
    optionButton.setAttribute('aria-selected', String(optionButton.dataset.value === value));
  });
  button.focus({ preventScroll: true });
}

function renderStep(direction = 'forward') {
  const step = steps[state.current];
  const savedValue = state.answers[step.key] || '';
  const isChoice = step.type === 'choice';

  card.classList.remove('is-active');
  card.classList.add(direction === 'forward' ? 'is-leaving' : 'is-entering');

  window.setTimeout(() => {
    eyebrow.textContent = step.eyebrow;
    title.textContent = step.title;
    help.textContent = step.help;
    label.textContent = step.label;
    error.textContent = '';
    counter.textContent = `${state.current + 1} → ${steps.length}`;
    progressBar.style.width = `${((state.current + 1) / steps.length) * 100}%`;
    buttonText.textContent = state.current === steps.length - 1 ? 'Enviar' : 'OK';

    if (isChoice) {
      input.hidden = true;
      label.hidden = true;
      renderOptions(step, savedValue);
      const firstOption = optionsList.querySelector('.option');
      if (firstOption) firstOption.focus({ preventScroll: true });
    } else {
      optionsList.hidden = true;
      optionsList.innerHTML = '';
      input.hidden = false;
      label.hidden = false;
      input.type = step.type;
      input.autocomplete = step.autocomplete;
      input.placeholder = step.placeholder;
      input.value = step.key === 'whatsapp' ? formatPhone(savedValue) : savedValue;
      input.inputMode = step.type === 'tel' ? 'tel' : 'text';
      input.classList.remove('input-error');
      input.focus({ preventScroll: true });
    }

    card.classList.remove('is-leaving', 'is-entering');
    card.classList.add('is-active');
  }, 290);
}

function postSheet(lead) {
  return fetch(SHEET_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(lead)
  })
    .then((response) => response.json().catch(() => ({})))
    .then((result) => {
      if (result.result !== 'success') throw new Error('Falha ao salvar');
    });
}

async function submitLead() {
  const answers = state.answers;
  const mql = MQL_REVENUES.includes(answers.faturamento);

  try {
    await postSheet({
      name: answers.name,
      email: answers.email,
      phone: answers.whatsapp,
      cargo: answers.cargo,
      companyName: answers.empresa,
      instagram: answers.instagram,
      faturamentoMensal: answers.faturamento
    });
  } catch (caught) {
    button.disabled = false;
    error.textContent = 'Não foi possível enviar agora. Tente novamente.';
    return;
  }

  fetch(GHL_WEBHOOK, {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: answers.name,
      email: answers.email,
      phone: answers.whatsapp,
      position: answers.cargo,
      company_name: answers.empresa,
      instagram: answers.instagram,
      revenue: answers.faturamento,
      mql: mql ? 'sim' : 'nao',
      source: 'Formulário Genesis',
      timestamp: new Date().toISOString()
    })
  }).catch(() => {});

  const query = new URLSearchParams({
    nome: answers.name,
    email: answers.email,
    whatsapp: answers.whatsapp,
    cargo: answers.cargo,
    empresa: answers.empresa,
    instagram: answers.instagram,
    faturamento: answers.faturamento,
    mql: mql ? '1' : '0'
  });

  window.location.assign(`${THANKS_URL}?${query.toString()}`);
}

input.addEventListener('input', () => {
  const step = steps[state.current];
  if (step.type === 'choice') return;
  if (step.key === 'whatsapp') input.value = formatPhone(input.value);
  error.textContent = '';
  input.classList.remove('input-error');
});

document.addEventListener('keydown', (event) => {
  const step = steps[state.current];
  if (step.type !== 'choice') return;
  if (event.ctrlKey || event.altKey || event.metaKey) return;

  const option = step.options.find(
    (item) => item.letter === event.key.toUpperCase()
  );
  if (!option) return;

  event.preventDefault();
  selectOption(step, option.label);
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const step = steps[state.current];
  const isChoice = step.type === 'choice';
  let rawValue = isChoice ? state.answers[step.key] || '' : input.value.trim();

  if (!isChoice && step.normalize) rawValue = step.normalize(rawValue);

  const validationMessage = step.validate(rawValue);

  if (validationMessage) {
    error.textContent = validationMessage;
    if (isChoice) {
      optionsList.classList.add('options--error');
    } else {
      input.classList.add('input-error');
      input.focus();
    }
    return;
  }

  state.answers[step.key] = rawValue;
  if (!isChoice) input.value = rawValue;
  button.disabled = true;

  window.setTimeout(() => {
    if (state.current < steps.length - 1) {
      button.disabled = false;
      state.current += 1;
      renderStep('forward');
      return;
    }

    submitLead();
  }, 230);
});

renderStep('forward');
