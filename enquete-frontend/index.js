function adicionarResposta() {
    const divOpcoesVotacao = document.getElementById('opcoesVotacao');


    const wrapper = document.createElement('div');
    wrapper.classList.add('mb-2', 'd-flex', 'gap-2', 'align-items-start')


    const input = document.createElement('input');
    input.type = 'text';
    input.name = 'opcoesVotacao';
    input.required = true;
    input.classList.add('opcoesVotacao', 'form-control', );


    const botaoRemover = document.createElement('button');
    botaoRemover.type = 'button';
    botaoRemover.classList.add('btn', 'btn-outline-danger', 'btn-md');
    botaoRemover.innerHTML = '<i class="bi bi-trash"></i>';
    botaoRemover.onclick = () => wrapper.remove();


    wrapper.appendChild(input);
    wrapper.appendChild(botaoRemover);


    divOpcoesVotacao.appendChild(wrapper);




    }

function toggleQuantidadeVotos() {
    const checkbox = document.getElementById('quantidadeVotos');
    const campo = document.getElementById('campoQuantidadeVotos');
    campo.style.display = checkbox.checked ? 'inline-block' : 'none';
}

function toggleCampoDetalhes() {

}

