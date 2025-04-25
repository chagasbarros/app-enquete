"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.salvarVoto = void 0;
const connection_1 = require("../database/connection");
const salvarVoto = async (req, res) => {
    console.log("Endpoint /votos foi chamado!");
    const { nome, respostas } = req.body;
    if (!nome || !respostas || !Array.isArray(respostas)) {
        return;
    }
    try {
        // ✅ Tipagem explícita para retorno de INSERT
        const [result] = await connection_1.db.query('INSERT INTO votos (nome) VALUES (?)', [nome]);
        const votoId = result.insertId;
        for (const resposta of respostas) {
            await connection_1.db.query('INSERT INTO respostas (voto_id, resposta) VALUES (?, ?)', [votoId, resposta]);
        }
        return;
    }
    catch (error) {
        console.error(error);
        return;
    }
};
exports.salvarVoto = salvarVoto;
