import Router from "express"
import { ProductoService } from "../services/producto.service"
import { ProductoController } from "../controllers/producto.controller";


const router=Router()

router.post("/registrar-producto",ProductoController.registrarProducto);
router.get("/",ProductoController.listar)

export {router as productoRoutes}