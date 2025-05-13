export interface iProducto {
  idProducto: string;
  nombre: string;
  cantidad: number;
  categoria: string;
  precio: number;
  mostrarInformacion(): void;
  actualizarStock(cantidad: number): void;
}

