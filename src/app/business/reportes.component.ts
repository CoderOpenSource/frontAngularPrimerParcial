import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

interface Reporte {
  id: number;
  titulo: string;
  tipo: string;
  fechaGeneracion: string;
  archivoUrl: string;
}

interface Paciente {
  id: number;
  carnet: string;
  usuario: {
    nombre: string;
    apellido: string;
  };
}

interface Medico {
  id: number;
  nombre: string;
  apellido: string;
}

interface Especialidad {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {
  reportes: Reporte[] = [];
  pacientes: Paciente[] = [];
  medicos: Medico[] = [];
  especialidades: Especialidad[] = [];
  isLoading: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarReportes();
    this.cargarDatosIniciales();
  }

  cargarReportes() {
    this.isLoading = true;
    this.http.get<Reporte[]>('http://143.198.147.110/api/reportes').subscribe({
      next: (data) => {
        this.reportes = data;
        this.isLoading = false;
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar los reportes.', 'error');
        this.isLoading = false;
      },
    });
  }

  cargarDatosIniciales() {
    // Obtener pacientes
    this.http.get<Paciente[]>('http://143.198.147.110/api/pacientes').subscribe({
      next: (data) => {
        this.pacientes = data;
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar los pacientes.', 'error');
      },
    });

    // Obtener médicos
    this.http.get<Medico[]>('http://143.198.147.110/api/medicos').subscribe({
      next: (data) => {
        this.medicos = data;
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar los médicos.', 'error');
      },
    });

    // Obtener especialidades
    this.http.get<Especialidad[]>('http://143.198.147.110/api/especialidades').subscribe({
      next: (data) => {
        this.especialidades = data;
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar las especialidades.', 'error');
      },
    });
  }

  eliminarReporte(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`http://143.198.147.110/api/reportes/${id}`).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El reporte ha sido eliminado.', 'success');
            this.cargarReportes();
          },
          error: () => {
            Swal.fire('Eliminado', 'El reporte ha sido eliminado.', 'success');
            this.cargarReportes();
          },
        });
      }
    });
  }

  descargarReporte(reporte: Reporte) {
    window.open(reporte.archivoUrl, '_blank');
  }

  generarReporte() {
    Swal.fire({
      title: 'Generar Reporte',
      html: `
      <select id="tipo" class="swal2-select">
        <option value="consultas">Consultas</option>
        <option value="procedimientos">Procedimientos</option>
        <option value="analisis">Análisis</option>
      </select>
      <select id="formato" class="swal2-select">
        <option value="pdf">PDF</option>
        <option value="excel">Excel</option>
      </select>
      <select id="pacienteId" class="swal2-select">
        <option value="">Seleccione un paciente</option>
        ${this.pacientes.map(
        (paciente) =>
          `<option value="${paciente.id}">${paciente.usuario.nombre} ${paciente.usuario.apellido} (${paciente.carnet})</option>`
      )}
      </select>
      <select id="medicoId" class="swal2-select">
        <option value="">Seleccione un médico</option>
        ${this.medicos.map(
        (medico) =>
          `<option value="${medico.id}">${medico.nombre} ${medico.apellido}</option>`
      )}
      </select>
      <select id="especialidadId" class="swal2-select">
        <option value="">Seleccione una especialidad</option>
        ${this.especialidades.map(
        (especialidad) =>
          `<option value="${especialidad.id}">${especialidad.nombre}</option>`
      )}
      </select>
      <input id="fechaInicio" type="date" class="swal2-input" placeholder="Fecha Inicio">
      <input id="fechaFin" type="date" class="swal2-input" placeholder="Fecha Fin">
    `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const tipo = (document.getElementById('tipo') as HTMLSelectElement).value;
        const formato = (document.getElementById('formato') as HTMLSelectElement).value;
        const pacienteId = (document.getElementById('pacienteId') as HTMLSelectElement).value || null;
        const medicoId = (document.getElementById('medicoId') as HTMLSelectElement).value || null;
        const especialidadId = (document.getElementById('especialidadId') as HTMLSelectElement).value || null;
        const fechaInicio = (document.getElementById('fechaInicio') as HTMLInputElement).value || null;
        const fechaFin = (document.getElementById('fechaFin') as HTMLInputElement).value || null;

        if (!tipo || !formato) {
          Swal.showValidationMessage('Por favor, complete todos los campos obligatorios.');
          return null;
        }

        return {
          tipo,
          formato,
          parametros: {
            pacienteId: pacienteId ? Number(pacienteId) : null,
            medicoId: medicoId ? Number(medicoId) : null,
            especialidadId: especialidadId ? Number(especialidadId) : null,
            fechaInicio,
            fechaFin,
          },
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const { tipo, formato, parametros } = result.value!;
        this.isLoading = true;

        this.http.post(`http://143.198.147.110/api/reportes`, {
          tipo,
          formato,
          parametros,
        }).subscribe({
          next: () => {
            this.isLoading = false;
            Swal.fire('Reporte Generado', 'El reporte fue creado exitosamente.', 'success');
            this.cargarReportes();
          },
          error: () => {
            this.isLoading = false;
            Swal.fire('Error', 'No se pudo generar el reporte.', 'error');
          },
        });
      }
    });
  }

}
