import { Router } from "express";
import { UsuarioController } from "../controllers/persona.controllers";
import { authenticateToken } from "../middlewares/authenticateToken";

const router = Router();

router.post("/registro", UsuarioController.registerUsuario);
router.put(
  "/actualizar/:id",
  authenticateToken,
  UsuarioController.actualizarUsuario
);
router.get("/usuario/:id", authenticateToken, UsuarioController.obtenerUsuario);
router.post(
  "/cambiar-contrasena/:id",
  authenticateToken,
  UsuarioController.cambiarContrasena
);
router.get("/listar-usuarios",authenticateToken, UsuarioController.getUsuarios);

export { router as usuarioRouter };
