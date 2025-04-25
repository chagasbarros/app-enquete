import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import votosRoutes from './routes/votos';

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.use('/votos', votosRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;