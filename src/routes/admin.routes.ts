import { Router } from "express";
import { AdminController } from "../controllers/Admin.controllers";
import { authenticateToken } from "../middlewares/authenticateToken";
import { authenticateAdmin } from "../middlewares/authenticateAdmin";
import { UsuarioController } from "../controllers/persona.controllers";

const router=Router();

router.post("/register",authenticateToken,authenticateAdmin,AdminController.registroUsarioConRol)
router.put("/update/:id",authenticateToken,authenticateAdmin,UsuarioController.actualizarUsuario)
router.get("/usuarios",authenticateToken,UsuarioController.getUsuarios)


export {router as adminRoutes};