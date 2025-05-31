function adicionarResposta() {
  const divOpcoesVotacao = document.getElementById("opcoesVotacao");

  const wrappers = divOpcoesVotacao.querySelectorAll("div");
  const ultimoWrapper = wrappers[wrappers.length - 1];

  // Verifica se há um input anterior
  if (ultimoWrapper) {
    const ultimoInput = ultimoWrapper.querySelector(
      'input[name="opcoesVotacao"]'
    );

    // Se estiver vazio, não permite adicionar
    if (ultimoInput.value.trim() === "") {
      alert("Digite algo antes de adicionar outra opção.");
      return;
    }

    // Se ainda não tem botões, adiciona os botões "Editar" e "Excluir"
    const jaTemEditar = ultimoWrapper.querySelector("button.edit-btn");
    const jaTemExcluir = ultimoWrapper.querySelector("button.delete-btn");

    if (!jaTemEditar && !jaTemExcluir) {
      // Botão Editar
      const botaoEditar = document.createElement("button");
      botaoEditar.type = "button";
      botaoEditar.classList.add(
        "btn",
        "btn-outline-primary",
        "btn-md",
        "edit-btn"
      );
      botaoEditar.textContent = "Editar";

      botaoEditar.onclick = () => {
        if (ultimoInput.disabled) {
          // Modo edição
          ultimoInput.disabled = false;
          botaoEditar.textContent = "Salvar";
        } else {
          // Tentando salvar
          if (ultimoInput.value.trim() === "") {
            alert("O campo não pode ficar vazio.");
            ultimoInput.focus();
            return;
          }
          // Modo leitura
          ultimoInput.disabled = true;
          botaoEditar.textContent = "Editar";
        }
      };

      // Botão Excluir
      const botaoRemover = document.createElement("button");
      botaoRemover.type = "button";
      botaoRemover.classList.add(
        "btn",
        "btn-outline-danger",
        "btn-md",
        "delete-btn"
      );
      botaoRemover.innerHTML = '<i class="bi bi-trash"></i>';
      botaoRemover.onclick = () => ultimoWrapper.remove();

      // Adiciona os botões ao wrapper anterior
      ultimoWrapper.appendChild(botaoEditar);
      ultimoWrapper.appendChild(botaoRemover);

      // Desativa o campo após confirmação
      ultimoInput.disabled = true;
    }
  }

  // Agora adiciona o novo campo
  const wrapper = document.createElement("div");
  wrapper.classList.add("mb-2", "d-flex", "gap-2", "align-items-start");

  const input = document.createElement("input");
  input.type = "text";
  input.name = "opcoesVotacao";
  input.required = true;
  input.classList.add("opcoesVotacao", "form-control");

  wrapper.appendChild(input);
  divOpcoesVotacao.appendChild(wrapper);
}

function salvarEnquete() {
  const pergunta = document.getElementById('pergunta').value.trim();
  const descricao = document.getElementById('descricao').value.trim();
  const prazo = document.getElementById('prazoVotacao').value;

  const opcoes = Array.from(document.querySelectorAll('input[name="opcoesVotacao"]'))
    .map(input => input.value.trim())
    .filter(valor => valor !== '');

  const select = document.querySelector('select');
  const maxVotos = select.value; // 👈 pega o valor selecionado

  // Validação extra (opcional)
  if (!pergunta || opcoes.length === 0) {
    alert('Preencha a pergunta e pelo menos uma opção de resposta.');
    return false; // Cancela envio
  }

  // Cria um objeto com os dados
  const enquete = {
    pergunta,
    descricao,
    prazo,
    maxVotos, // 👈 inclui o valor do select
    opcoes
  };

  // Salva no localStorage como string JSON
  localStorage.setItem('dadosEnquete', JSON.stringify(enquete));

  return true; // Permite o envio para outra página
}


function acompanharEnquete() {
    alert('Sem enquete')
}