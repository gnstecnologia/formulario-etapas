# Formulário conversacional em etapas

Versão independente inspirada no padrão do formulário enviado: uma pergunta por vez, fundo escuro, barra de progresso, botão `OK`, tecla Enter, validação e transições suaves.

## Como executar

1. Baixe a pasta `formulario-etapas`.
2. Abra o arquivo `index.html` no navegador.
3. Preencha o nome e o WhatsApp.
4. Para publicar, envie os três arquivos para qualquer hospedagem estática, como Netlify, Vercel ou GitHub Pages.

Não é necessário instalar dependências ou usar framework.

## Arquivos

- `index.html`: estrutura semântica da página.
- `style.css`: cores, layout, responsividade e animações.
- `script.js`: etapas, validação, máscara de telefone e tela final.

## Como alterar as perguntas

Edite o array `steps` no início de `script.js`. Cada etapa possui:

- `title`: pergunta exibida;
- `help`: texto auxiliar;
- `label`: acessibilidade do campo;
- `placeholder`: texto dentro do campo;
- `type`: tipo do input;
- `validate`: regra de validação.

## Como receber os dados

A versão atual demonstra a experiência visual e mantém os dados no navegador durante o preenchimento. Para salvar os dados, substitua o trecho `showSuccess()` por uma chamada `fetch()` para sua API, formulário do Formspree, endpoint próprio ou automação.

Exemplo de envio:

```js
await fetch('https://seu-endpoint.com/leads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(state.answers)
});
```

Nunca coloque tokens secretos diretamente no JavaScript do navegador.
