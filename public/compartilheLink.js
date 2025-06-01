async function gerarLinkComUltimaEnquete() {
  try {
    const resposta = await fetch('http://localhost:3000/api/enquetes/atual');
    const enquete = await resposta.json();
    const id = enquete.id;

    const mensagem = `Participe da enquete! Clique aqui para votar: http://127.0.0.1:5500/enquete-frontend/identificacao.html?id=${id}`;
    const linkWhatsApp = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;

    // Abre o WhatsApp ao clicar no botão
    document.getElementById('link').addEventListener('click', () => {
      window.open(linkWhatsApp, '_blank');
    });
  } catch (erro) {
    console.error('Erro ao buscar a última enquete:', erro);
  }
}

gerarLinkComUltimaEnquete();



