function getParams() {
    const params = new URLSearchParams(window.location.search);
    const respostas = []

    for (const [key, value] of params.entries()) {
        if (key === 'resposta') respostas.push(value);
    }

    return {
        pergunta: params.get('pergunta'),
        descricao: params.get('descricao'),
        opcoesVotacao: params.getAll('opcoesVotacao'),
        permitirMultiplosVotos: params.get('quantidadeVotos') !== null,
        detalhesEleitor: params.getAll('detalhesEleitor'),
        prazoVotacao: params.get('prazoVotacao'),
        limiteVotos: params.get('limiteVotos'),
        respostas
    };
}

function montarEnquete() {
    const data = getParams();

    document.getElementById('tituloPergunta').textContent = data.pergunta;
    document.getElementById('descricaoPergunta').textContent = data.descricao || '';


    const containerRespostas = document.getElementById('opcoesVotacao');
    data.opcoesVotacao.forEach((resposta, index) => {
        const input =document.createElement('input');
        input.type =   'checkbox';
        input.name = 'opcoesVotacao';
        input.id = `opcoesVotacao_${index}`;
        input.classList.add('form-check-input', 'mb-2', 'd-block');
        input.role = 'switch';
        input.value = resposta;

        const label = document.createElement('label');
        label.htmlFor = input.id;
        label.textContent = resposta;

        containerRespostas.appendChild(input);
        containerRespostas.appendChild(label);

    });

    const extras = document.getElementById('extras');
  
    if (data.detalhesEleitor && data.detalhesEleitor.length > 0) {
        if (data.detalhesEleitor.includes('nome')) {
          const label = document.createElement('label');
          label.textContent = "Digite seu nome: ";
          const input = document.createElement('input');
          input.type = 'text';
          input.name = 'nomeEleitor';
          input.required = true;
          extras.appendChild(label);
          extras.appendChild(input);
          extras.appendChild(document.createElement('br'));
        }
      
        if (data.detalhesEleitor.includes('email')) {
          const label = document.createElement('label');
          label.textContent = "Digite seu email: ";
          const input = document.createElement('input');
          input.type = 'email';
          input.name = 'emailEleitor';
          input.required = true;
          extras.appendChild(label);
          extras.appendChild(input);
          extras.appendChild(document.createElement('br'));
        }
    }

    if (data.prazoVotacao) {
        const hoje = new Date().toISOString().split('T')[0];
        if (data.prazoVotacao < hoje) {
            extras.innerHTML += "<p style='color:red'><strong> Votação encerrada</strong></p>";
            document.querySelector('button[type="submit"]').disabled = true;
        } else {
            extras.innerHTML += `<p>Prazo para votar: <strong>${data.prazoVotacao}</strong></p>`;
        }

    }

    if (data.permitirMultiplosVotos && data.limiteVotos) {
        extras.innerHTML += `<p><strong> Você pode votar até ${data.limiteVotos} vezes`;
    }

    document.getElementById('votarBTN').addEventListener('click', () => {
        //.preventDefault(); //impede o comportamento padrão de submit

        const nomeInput = document.querySelector('input[name="nomeEleitor"]');
        const nome = nomeInput ? nomeInput.value.trim() : '';
    
        const opcoes = document.querySelectorAll('input[name="opcoesVotacao"]');
        const selecionadas = Array.from(opcoes).filter(op => op.checked);
    
    
        //o nome é obrigatório
        if (nome === '') {
            alert('O nome é obrigatório para votar.');
            return;
        }
    
    
        //validação: pelo meonos uma opção selecionada
        if (selecionadas.length === 0) {
            alert('Selecione pelo menos uma opção para votar.');
            return;
        }
    
    
        //validação: limite de votos
        const limite = parseInt(new URLSearchParams(window.location.search).get('limiteVotos') || '1');
        if (selecionadas.length > limite) {
            alert(`Você só pode votar em até ${limite} opção(ões).`);
            return;
        }
    
        
        //salva o voto
        const votos = [];
        const respostasVotadas = selecionadas.map(el => el.value);
        votos.push({nome, respostas: respostasVotadas});
    
        //atualiza resultados
        const resultados = document.getElementById('resultadosParciais');
        resultados.innerHTML = '';
        votos.forEach(voto => {
            const li = document.createElement('li');
            li.textContent = `${voto.nome} votou em: ${voto.respostas.join(', ')}`;
            resultados.appendChild(li);
        });
    
        //reseta formulário
        nomeInput.value = '';
        opcoes.forEach(op => (op.checked = false));
    
    });
    
      

}

montarEnquete()




