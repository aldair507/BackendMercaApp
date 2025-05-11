"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePasswords = comparePasswords;
const bcrypt_1 = __importDefault(require("bcrypt"));
async function hashPassword(password) {
    const saltRounds = 10;
    const salt = await bcrypt_1.default.genSalt(saltRounds);
    return await bcrypt_1.default.hash(password, salt);
}
async function comparePasswords(password, hashedPassword) {
    return await bcrypt_1.default.compare(password, hashedPassword);
}
