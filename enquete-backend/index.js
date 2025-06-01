const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Config MySQL
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'chBD8332',
  database: 'enquete_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Teste de conexão com o banco
async function testarConexao() {
  try {
    const conn = await db.getConnection();
    console.log('✅ Conexão com MySQL estabelecida com sucesso');
    conn.release();
  } catch (erro) {
    console.error('❌ Erro ao conectar com MySQL:', erro);
  }
}

// Rota para salvar enquete
app.post('/api/enquetes', async (req, res) => {

  const { pergunta, descricao, prazoVotacao, maxVotos, opcoes } = req.body;

  console.log('Requisição recebida:', req.body);


  if (!pergunta || !maxVotos || !Array.isArray(opcoes) || opcoes.length === 0) {
    return res.status(400).json({ 
      mensagem: 'Dados inválidos',
      detalhes: {
        pergunta: !pergunta ? 'Pergunta é obrigatória' : 'OK',
        maxVotos: !maxVotos ? 'Máximo de votos é obrigatório' : 'OK',
        opcoes: !Array.isArray(opcoes) || opcoes.length === 0 ? 'Pelo menos uma opção é obrigatória' : 'OK'
      }
    });
  }

  if (opcoes.length < 2) {
    return res.status(400).json({ 
      mensagem: 'São necessárias pelo menos 2 opções para a enquete' 
    });
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // Inserir enquete (usando os nomes corretos das colunas do seu banco)
    const [enqueteResult] = await conn.query(
      'INSERT INTO enquetes (pergunta, descricao, prazo_votacao, max_votos) VALUES (?, ?, ?, ?)',
      [pergunta, descricao || null, prazoVotacao || null, maxVotos]
    );

    const enqueteId = enqueteResult.insertId;

    // Inserir opções na tabela separada também (para manter consistência)
   const opcoesData = opcoes.map((texto) => [texto, enqueteId]);

// Cria os placeholders dinamicamente: "(?, ?), (?, ?), (?, ?)"
const placeholders = opcoesData.map(() => '(?, ?)').join(', ');

// Achata a matriz para um array plano: ['Sim', 1, 'Não', 1, 'Talvez', 1]
const flatValues = opcoesData.flat();

await conn.query(
  `INSERT INTO opcoes (texto, enquete_id) VALUES ${placeholders}`,
  flatValues
);


    await conn.commit();

    console.log(`✅ Enquete criada com sucesso - ID: ${enqueteId}`);

    res.status(201).json({ 
      mensagem: 'Enquete criada com sucesso', 
      enqueteId,
      dados: {
        pergunta,
        descricao,
        prazoVotacao,
        maxVotos,
        totalOpcoes: opcoes.length
      }
    });

  } catch (erro) {
    await conn.rollback();
    console.error('❌ Erro ao inserir enquete:', erro);
    res.status(500).json({ 
      mensagem: 'Erro ao salvar a enquete',
      erro: erro.message 
    });
  } finally {
    if (conn) conn.release();
  }
});

// Rota para salvar voto - CORRIGIDA com estrutura real do banco
app.post('/api/votos', async (req, res) => {
  const { enqueteId, nome, telefone, votos } = req.body;
  
  if (!enqueteId || !nome || !telefone || !Array.isArray(votos) || votos.length === 0) {
    return res.status(400).json({ mensagem: 'Dados inválidos' });
  }

  const conn = await db.getConnection();
  try {
    // Verificar se a enquete existe
    const [enqueteExiste] = await conn.query('SELECT id FROM enquetes WHERE id = ?', [enqueteId]);
    if (enqueteExiste.length === 0) {
      return res.status(404).json({ mensagem: 'Enquete não encontrada' });
    }

    // Inserir voto usando os nomes corretos das colunas
    const [votoResult] = await conn.query(
      'INSERT INTO votos (enqueteId, nome, telefone, votos) VALUES (?, ?, ?, ?)',
      [enqueteId, nome, telefone, JSON.stringify(votos)]
    );

    const votoId = votoResult.insertId;

    console.log(`✅ Voto registrado - ID: ${votoId}, Enquete: ${enqueteId}`);

    res.status(201).json({ 
      mensagem: 'Voto registrado com sucesso',
      votoId: votoId
    });

  } catch (erro) {
    console.error('❌ Erro ao registrar voto:', erro);
    res.status(500).json({ mensagem: 'Erro ao registrar voto', erro: erro.message });
  } finally {
    if (conn) conn.release();
  }
});

// Rota para listar votos - CORRIGIDA com estrutura real do banco
app.get('/api/votos', async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT id, nome, telefone, votos, timestamp, enqueteId
      FROM votos 
      ORDER BY timestamp DESC
    `);

    const votosFormatados = results.map(row => ({
      id: row.id,
      nome: row.nome,
      telefone: row.telefone,
      enqueteId: row.enqueteId,
      votosSelecionados: JSON.parse(row.votos || '[]'),
      timestamp: row.timestamp,
    }));

    res.json(votosFormatados);

  } catch (erro) {
    console.error('Erro ao buscar votos:', erro);
    res.status(500).json({ error: 'Erro ao buscar votos' });
  }
});

// Rota para buscar enquete atual - CORRIGIDA com estrutura real do banco
app.get('/api/enquetes/atual', async (req, res) => {
  const conn = await db.getConnection();
  try {
    // Buscar a enquete mais recente
    const [enquetes] = await conn.query(`
      SELECT id, pergunta, descricao, prazo_votacao, max_votos 
      FROM enquetes 
      ORDER BY id DESC 
      LIMIT 1
    `);

    if (enquetes.length === 0) {
      return res.status(404).json({ mensagem: 'Nenhuma enquete encontrada' });
    }

    const enquete = enquetes[0];

    // Buscar opções da enquete
    const [opcoes] = await conn.query(
      'SELECT texto FROM opcoes WHERE enquete_id = ?',
      [enquete.id]
    );

    const opcoesTexto = opcoes.map(o => o.texto);

    // Montar resposta (pode usar tanto o JSON da coluna opcoes quanto buscar da tabela opcoes)
    const resposta = {
      id: enquete.id,
      pergunta: enquete.pergunta,
      descricao: enquete.descricao,
      prazoVotacao: enquete.prazo_votacao,
      maxVotos: enquete.max_votos,
      opcoes: opcoesTexto
    };

    res.json(resposta);

  } catch (erro) {
    console.error('Erro ao buscar enquete:', erro);
    res.status(500).json({ mensagem: 'Erro ao buscar enquete' });
  } finally {
    if (conn) conn.release();
  }
});

// Rota para listar todas as enquetes - CORRIGIDA
app.get('/api/enquetes', async (req, res) => {
  try {
    const [enquetes] = await db.query(`
      SELECT e.id, e.pergunta, e.descricao, e.opcoes, e.prazo_votacao, e.max_votos, e.ativa,
             COUNT(v.id) as total_votos
      FROM enquetes e
      LEFT JOIN votos v ON e.id = v.enqueteId
      GROUP BY e.id
      ORDER BY e.id DESC
    `);

    // Formatar resposta convertendo opcoes de JSON para array
    const enquetesFormatadas = enquetes.map(enquete => ({
      id: enquete.id,
      pergunta: enquete.pergunta,
      descricao: enquete.descricao,
      opcoes: JSON.parse(enquete.opcoes || '[]'),
      prazoVotacao: enquete.prazo_votacao,
      maxVotos: enquete.max_votos,
      ativa: enquete.ativa,
      totalVotos: enquete.total_votos
    }));

    res.json(enquetesFormatadas);

  } catch (erro) {
    console.error('Erro ao buscar enquetes:', erro);
    res.status(500).json({ mensagem: 'Erro ao buscar enquetes' });
  }
});

// Middleware para tratar rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ 
    mensagem: 'Rota não encontrada',
    rota: req.originalUrl,
    metodo: req.method
  });
});

// Inicializar servidor
app.listen(port, async () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
  console.log(`📍 Acesse: http://localhost:${port}`);
  await testarConexao();
});