"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const votoControllers_1 = require("../controllers/votoControllers");
const votosRoutes = (0, express_1.Router)();
votosRoutes.post('/', votoControllers_1.salvarVoto);
exports.default = votosRoutes;
