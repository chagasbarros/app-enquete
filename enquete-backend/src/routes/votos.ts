import { Router } from "express";
import { listarVotos, salvarVoto } from "../controllers/votoControllers";

const votosRoutes = Router();

votosRoutes.post('/', salvarVoto); 
votosRoutes.get('/', listarVotos);

export default votosRoutes;