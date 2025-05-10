import {Router} from 'express';
import { UsuarioController } from '../controllers/persona.controllers';
import { authenticateToken } from '../middlewares/authenticateToken';

const router = Router();

router.post('/register',UsuarioController.registerUsuario);
router.put('/update/:id',authenticateToken, UsuarioController.actualizarUsuario)
router.get("/usuario/:id",authenticateToken,UsuarioController.obtenerUsuario)


export {router as usuarioRouter};       