import { Request, Response } from "express";
import { db } from '../database/connection';
import { ResultSetHeader } from 'mysql2'; // ✅ Tipagem para resultado de INSERT

export const salvarVoto = async (req: Request, res: Response): Promise<void> => {
    console.log("Endpoint /votos foi chamado!");
    const { nome, respostas } = req.body;

    if (!nome || !respostas || !Array.isArray(respostas)) {
        return;
    }

    try {
        // ✅ Tipagem explícita para retorno de INSERT
        const [result] = await db.query<ResultSetHeader>(
            'INSERT INTO votos (nome) VALUES (?)',
            [nome]
        );

        const votoId = result.insertId;

        for (const resposta of respostas) {
            await db.query(
                'INSERT INTO respostas (voto_id, resposta) VALUES (?, ?)',
                [votoId, resposta]
            );
        }

        return;
    } catch (error) {
        console.error(error);
        return;
    }
};

export const listarVotos = async (req: Request, res: Response): Promise<void> => {
    console.log('Aqui o GET foi chamado')
    try {
        const [votos] = await db.query('SELECT * FROM votos');

        const votosComRespostas = await Promise.all(
            (votos as any[]).map(async (voto) => {
                const [respostas] = await db.query(
                    'SELECT resposta FROM respostas WHERE voto_id = ?',
                    [voto.id]
                );
                return {
                    ...voto,
                    respostas: (respostas as any[]).map(r => r.resposta)
                };
            })
        );

        return;
    } catch (error) {
        console.error(error);
        return;
    }
};

