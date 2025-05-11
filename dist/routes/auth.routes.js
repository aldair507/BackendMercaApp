"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_controllers_1 = require("../controllers/auth.controllers");
const router = (0, express_1.Router)();
exports.authRouter = router;
router.post('/login', auth_controllers_1.AuthController.login);
router.post('/logout', auth_controllers_1.AuthController.logout);
