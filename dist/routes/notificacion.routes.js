"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificacionRoutes = void 0;
const notificacion_controllers_1 = require("../controllers/notificacion.controllers");
const express_1 = require("express");
const authenticateToken_1 = require("../middlewares/authenticateToken");
const authenticateAdmin_1 = require("../middlewares/authenticateAdmin");
const router = (0, express_1.Router)();
exports.notificacionRoutes = router;
// Rutas para todos los usuarios autenticados
router.get('/mis-notificaciones', authenticateToken_1.authenticateToken, notificacion_controllers_1.NotificacionController.obtenerMisNotificaciones);
router.put('/marcar-leida/:notificacionId', authenticateToken_1.authenticateToken, notificacion_controllers_1.NotificacionController.marcarComoLeida);
router.put('/marcar-todas-leidas', authenticateToken_1.authenticateToken, notificacion_controllers_1.NotificacionController.marcarTodasComoLeidas);
router.get('/contar-no-leidas', authenticateToken_1.authenticateToken, notificacion_controllers_1.NotificacionController.contarNoLeidas);
// Rutas para administradores
router.post('/admin/crear-notificacion', authenticateToken_1.authenticateToken, authenticateAdmin_1.authenticateAdmin, notificacion_controllers_1.NotificacionController.crearNotificacionGeneral);
