import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Bitacora {
  id: number;
  username: string;
  usuario_nombre: string;
  accion: string;
  fecha: string; // viene como string tipo ISO
  modulo: string | null;
  detalle: string | null;
  referencia_id: string | null;
  objeto_afectado: string | null;
  ip_origen: string | null;
  dispositivo: string | null;
}

@Component({
  selector: 'app-bitacora',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bitacora.component.html',
  styleUrls: ['./bitacora.component.css']
})
export class BitacoraComponent implements OnInit {
  bitacoras: Bitacora[] = [];
  bitacorasFiltradas: Bitacora[] = [];
  isLoading = false;
  currentPage = 1;
  itemsPerPage = 10;

  // Filtros
  fechaInicio: string = '';
  fechaFin: string = '';
  username: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadBitacoras();
  }

  loadBitacoras() {
    this.isLoading = true;

    this.http.get<Bitacora[]>('http://127.0.0.1:8000/api/bitacora/').subscribe({
      next: data => {
        this.bitacoras = data;
        this.aplicarFiltros(); // aplicamos filtros después de cargar
        this.isLoading = false;
      },
      error: err => {
        this.isLoading = false;
        Swal.fire('Error', 'No se pudieron cargar las bitácoras', 'error');
        console.error(err);
      }
    });
  }

  aplicarFiltros() {
    const inicio = this.fechaInicio ? new Date(this.fechaInicio) : null;
    const fin = this.fechaFin ? new Date(this.fechaFin) : null;
    const usernameTerm = this.username.toLowerCase();

    this.bitacorasFiltradas = this.bitacoras.filter(b => {
      const fechaBitacora = new Date(b.fecha);
      const coincideUsuario = !usernameTerm || b.username.toLowerCase().includes(usernameTerm);
      const enRango =
        (!inicio || fechaBitacora >= inicio) &&
        (!fin || fechaBitacora <= fin);

      return coincideUsuario && enRango;
    });

    this.currentPage = 1; // reiniciar paginación
  }

  limpiarFiltros() {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.username = '';
    this.bitacorasFiltradas = [...this.bitacoras];
    this.currentPage = 1;
  }

  paginatedBitacoras(): Bitacora[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.bitacorasFiltradas.slice(start, start + this.itemsPerPage);
  }

  totalPages(): number {
    return Math.ceil(this.bitacorasFiltradas.length / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }
}
