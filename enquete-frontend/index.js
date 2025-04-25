function adicionarResposta() {
    const divOpcoesVotacao = document.getElementById('opcoesVotacao');
    const input = document.createElement('input');
    input.type = 'text';
    input.name = 'opcoesVotacao';
    input.required = true;
    input.classList.add('opcoesVotacao');
    divOpcoesVotacao.appendChild(input);
    divOpcoesVotacao.appendChild(document.createElement('br'));

    }

function toggleQuantidadeVotos() {
    const checkbox = document.getElementById('quantidadeVotos');
    const campo = document.getElementById('campoQuantidadeVotos');
    campo.style.display = checkbox.checked ? 'inline-block' : 'none';
}

function toggleCampoDetalhes() {

}

