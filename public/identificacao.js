document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ Carregando página de identificação...');
  
  const container = document.getElementById('dadosEnquete');
  
  // Mostrar loading
  container.innerHTML = `
    <div class="text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
      <p>Carregando enquete...</p>
    </div>
  `;

  // Buscar enquete atual do banco de dados
  fetch('http://localhost:3000/api/enquetes/atual')
    .then(res => {
      if (!res.ok) {
        throw new Error('Erro ao carregar enquete');
      }
      return res.json();
    })
    .then(dados => {
      console.log('📊 Enquete carregada do banco:', dados);
      carregarEnquete(dados);
    })
    .catch(erro => {
      console.error('❌ Erro ao carregar enquete:', erro);
      container.innerHTML = `
        <div class="alert alert-danger">
          <h5>Erro ao carregar enquete</h5>
          <p>Não foi possível carregar a enquete. Tente novamente.</p>
          <button class="btn btn-primary" onclick="location.reload()">Tentar novamente</button>
        </div>
      `;
    });

  function carregarEnquete(dados) {
    const { id, pergunta, descricao, prazoVotacao, maxVotos, opcoes } = dados;
    const votosSelecionados = [];

    container.innerHTML = `
      <h5 class="text-center">Identifique-se</h5>
      <div class="mb-3 d-flex">
        <input type="text" id="inputNome" class="form-control" placeholder="Digite seu nome" required>
      </div>
      <div class="mb-3 d-flex">
        <input type="tel" id="inputTelefone" class="form-control" placeholder="Telefone: (XX)XXXXX-XXXX" required>
      </div>
      
      <hr>
      
      <h2 class="mb-3">📋 ${pergunta}</h2>
      ${descricao ? `<p class="text-muted">📝 ${descricao}</p>` : ''}
      <p><strong>⏰ Prazo:</strong> ${prazoVotacao || 'Não definido'}</p>
      <p><strong>🗳️ Máximo de votos:</strong> ${maxVotos}</p>

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

    // Buscar elementos após criar o HTML
    const inputNome = document.getElementById('inputNome');
    const inputTelefone = document.getElementById('inputTelefone');
    const botoes = document.querySelectorAll('.opcao-voto');
    const botaoEnviar = document.getElementById('enviarVoto');

    // Validação e máscara para nome
    inputNome.addEventListener('input', () => {
      inputNome.value = inputNome.value
        .replace(/[^a-zA-ZÀ-ÿ\s]/g, '')
        .slice(0, 30);
    });

    // Máscara para telefone
    inputTelefone.addEventListener('input', () => {
      let valor = inputTelefone.value.replace(/\D/g, '');
      if (valor.length > 11) valor = valor.slice(0, 11);

      let formatado = valor;
      if (valor.length >= 2) formatado = `(${valor.slice(0, 2)}`;
      if (valor.length >= 7) formatado += `)${valor.slice(2, 7)}-${valor.slice(7)}`;
      else if (valor.length > 2) formatado += `)${valor.slice(2)}`;

      inputTelefone.value = formatado;
    });

    // Controle de seleção de votos
    botoes.forEach(btn => {
      btn.addEventListener('click', () => {
        const valor = btn.getAttribute('data-opcao');
        const index = votosSelecionados.indexOf(valor);
        
        if (index !== -1) {
          votosSelecionados.splice(index, 1);
          btn.classList.remove('active');
          btn.classList.remove('btn-warning');
          btn.classList.add('btn-outline-warning');
        } else if (votosSelecionados.length < Number(maxVotos)) {
          votosSelecionados.push(valor);
          btn.classList.add('active');
          btn.classList.remove('btn-outline-warning');
          btn.classList.add('btn-warning');
        } else {
          alert(`Você pode selecionar no máximo ${maxVotos} opção(ões).`);
        }

        botaoEnviar.disabled = votosSelecionados.length === 0;
        console.log('🗳️ Votos selecionados:', votosSelecionados);
      });
    });

    // Enviar voto
    botaoEnviar.addEventListener('click', () => {
      const nome = inputNome.value.trim();
      const telefone = inputTelefone.value.trim();

      if (!nome) {
        alert('Por favor, preencha seu nome.');
        inputNome.focus();
        return;
      }
      
      if (!telefone || telefone.length < 14) {
        alert('Por favor, preencha seu telefone corretamente.');
        inputTelefone.focus();
        return;
      }

      if (votosSelecionados.length === 0) {
        alert('Por favor, selecione ao menos uma opção.');
        return;
      }

      // Desabilitar botão para evitar duplo clique
      botaoEnviar.disabled = true;
      botaoEnviar.innerHTML = 'Enviando...';

      console.log('📤 Enviando voto para API...');

      fetch('http://localhost:3000/api/votos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          enqueteId: id, // Incluir ID da enquete
          nome,
          telefone,
          votos: votosSelecionados
        })
      })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao enviar o voto');
        return res.json();
      })
      .then(data => {
        console.log('✅ Voto enviado com sucesso:', data);
        alert(`Obrigado, ${nome}! Seu voto foi registrado com sucesso!`);
        
        window.location.href = 'votoFinalizado.html';
      })
      .catch(err => {
        console.error('❌ Erro ao enviar voto:', err);
        alert('Erro ao enviar seu voto. Tente novamente.');
        
        // Reabilitar botão
        botaoEnviar.disabled = false;
        botaoEnviar.innerHTML = 'Enviar Voto';
      });
    });
  }
});