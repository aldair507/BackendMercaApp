import { NotificacionController } from '../controllers/notificacion.controllers';
import {Router} from 'express';
import { authenticateToken } from '../middlewares/authenticateToken';
import { authenticateAdmin } from '../middlewares/authenticateAdmin';

const router = Router();

// Rutas para todos los usuarios autenticados
router.get('/mis-notificaciones', 
  authenticateToken, 
  NotificacionController.obtenerMisNotificaciones
);

router.put('/marcar-leida/:notificacionId', 
  authenticateToken, 
  NotificacionController.marcarComoLeida
);

router.put('/marcar-todas-leidas', 
  authenticateToken, 
  NotificacionController.marcarTodasComoLeidas
);

router.get('/contar-no-leidas', 
  authenticateToken, 
  NotificacionController.contarNoLeidas
);

// Rutas para administradores
router.post('/admin/crear-notificacion', 
  authenticateToken, authenticateAdmin,
  NotificacionController.crearNotificacionGeneral
);

export { router as notificacionRoutes };