"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const server_config_1 = require("../config/server.config");
function generateToken(userId, rol) {
    return jsonwebtoken_1.default.sign({ id: userId, rol }, server_config_1.JWT_SECRET, { expiresIn: "1h" } // Token expira en 1 día
    );
}
