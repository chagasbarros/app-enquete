document.addEventListener('DOMContentLoaded', () => {
  const dados = JSON.parse(localStorage.getItem('dadosEnquete'));
  const container = document.getElementById('dadosEnquete');

  if (!dados) {
    container.innerHTML = `<div class="alert alert-warning">Nenhuma enquete foi encontrada.</div>`;
    return;
  }

  const { pergunta, descricao, prazo, maxVotos, opcoes } = dados;
  const votosSelecionados = [];

  // Renderiza enquete e inputs nome/telefone antes dos botões de voto
  container.innerHTML = `
    <h2 class="mb-3">Título: ${pergunta}</h2>
    ${descricao ? `<p class="text-muted">Descrição: ${descricao}</p>` : ''}
    <p><strong>Prazo para votar:</strong> ${prazo || 'Não definido'}</p>
    <p><strong>Máximo de votos permitidos:</strong> ${maxVotos}</p>

    <div id="opcoesContainer" class="d-flex flex-column gap-2 my-3">
      ${opcoes.map((opcao, i) => `
        <button class="btn btn-outline-warning opcao-voto" data-opcao="${opcao}" id="opcao-${i}">
          ${opcao}
        </button>
      `).join('')}
    </div>

    <div class="mb-3">
      <button id="enviarVoto" class="btn btn-success" disabled>Enviar Voto</button>
    </div>
  `;

  const inputNome = document.getElementById('inputNome');
  const inputTelefone = document.getElementById('inputTelefone');
  const botoes = document.querySelectorAll('.opcao-voto');
  const botaoEnviar = document.getElementById('enviarVoto');

  // Validação e máscara em tempo real
  inputNome.addEventListener('input', () => {
    inputNome.value = inputNome.value
      .replace(/[^a-zA-ZÀ-ÿ\s]/g, '') // só letras e espaço
      .slice(0, 30);
  });

  inputTelefone.addEventListener('input', () => {
    let valor = inputTelefone.value.replace(/\D/g, '');
    if (valor.length > 11) valor = valor.slice(0, 11);

    let formatado = valor;
    if (valor.length >= 2) formatado = `(${valor.slice(0, 2)}`;
    if (valor.length >= 7) formatado += `)${valor.slice(2, 7)}-${valor.slice(7)}`;
    else if (valor.length > 2) formatado += `)${valor.slice(2)}`;

    inputTelefone.value = formatado;
  });

  // Controle seleção votos
  botoes.forEach(btn => {
    btn.addEventListener('click', () => {
      const valor = btn.getAttribute('data-opcao');

      const index = votosSelecionados.indexOf(valor);
      if (index !== -1) {
        votosSelecionados.splice(index, 1);
        btn.classList.remove('active');
      } else if (votosSelecionados.length < Number(maxVotos)) {
        votosSelecionados.push(valor);
        btn.classList.add('active');
      }

      botaoEnviar.disabled = votosSelecionados.length === 0;
    });
  });

  // Botão votar
  botaoEnviar.addEventListener('click', () => {
    const nome = inputNome.value.trim();
    const telefone = inputTelefone.value.trim();

    if (!nome) {
      alert('Por favor, preencha seu nome.');
      inputNome.focus();
      return;
    }
    if (!telefone || telefone.length < 14) { // (XX)XXXXX-XXXX tem 14 caracteres
      alert('Por favor, preencha seu telefone corretamente.');
      inputTelefone.focus();
      return;
    }

    localStorage.setItem('dadosUsuario', JSON.stringify({ nome, telefone }));
    localStorage.setItem('votosUsuario', JSON.stringify(votosSelecionados));

    alert(`Obrigado, ${nome}. Você votou em: ${votosSelecionados.join(', ')}`);

    // Aqui pode fazer redirecionamento ou envio para backend
  });
});
