import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

interface Usuario {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  ci: string;
  celular: string | null;
  direccion: string | null;
  fecha_ingreso: string | null;
  activo: boolean;
  groups: string[] | null;
  foto_perfil: string | null;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  isLoading = false;
  isSaving: boolean = false;
  usuarios: Usuario[] = [];
  filteredUsuarios: Usuario[] = [];
  selectedUsuario: Usuario = {
    id: 0,
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    ci: '',
    celular: null,
    direccion: null,
    fecha_ingreso: null,
    activo: true,
    groups: null,
    foto_perfil: null
  };
  rolSeleccionado: string | null = null;

  showModal = false;
  isEditMode = false;

  password: string = '';
  selectedFile: File | null = null;
  previewImage: string | ArrayBuffer | null = null;

  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsuarios();
  }

  loadUsuarios() {
    this.isLoading = true;
    this.http.get<Usuario[]>('http://127.0.0.1:8000/api/usuarios/').subscribe(
      data => {
        this.usuarios = data;
        this.filteredUsuarios = data;
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        this.handleHttpError(error);
      }
    );
  }

  filterUsuarios() {
    this.currentPage = 1;
    const term = this.searchTerm.toLowerCase();
    this.filteredUsuarios = this.usuarios.filter(usuario =>
      usuario.username.toLowerCase().includes(term) ||
      usuario.email.toLowerCase().includes(term)
    );
  }

  paginatedUsuarios(): Usuario[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredUsuarios.slice(start, end);
  }

  totalPages(): number {
    return Math.ceil(this.filteredUsuarios.length / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  addUsuario() {
    this.selectedUsuario = {
      id: 0,
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      ci: '',
      celular: null,
      direccion: null,
      fecha_ingreso: null,
      activo: true,
      groups: null,
      foto_perfil: null
    };
    this.password = '';
    this.rolSeleccionado = null;
    this.selectedFile = null;
    this.previewImage = null;
    this.isEditMode = false;
    this.showModal = true;
  }

  editUsuario(usuario: Usuario) {
    this.selectedUsuario = { ...usuario };
    this.rolSeleccionado = usuario.groups?.[0] || null;
    this.password = '';
    this.previewImage = usuario.foto_perfil ?? null;
    this.selectedFile = null;
    this.isEditMode = true;
    this.showModal = true;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = e => this.previewImage = reader.result;
      reader.readAsDataURL(file);
    }
  }

  isSuperadmin(): boolean {
    return localStorage.getItem('userRole') === 'Superadmin';
  }

  isAdmin(): boolean {
    return localStorage.getItem('userRole') === 'Administrador';
  }

  getValor(valor: any): string {
    return valor !== null && valor !== '' ? valor : 'No disponible';
  }

  saveUsuario() {
    if (!this.rolSeleccionado) {
      Swal.fire('Rol requerido', 'Debes seleccionar un rol para el usuario.', 'warning');
      return;
    }

    this.selectedUsuario.groups = [this.rolSeleccionado];
    const formData = new FormData();

    for (const key in this.selectedUsuario) {
      if (!this.isEditMode && (key === 'activo' || key === 'fecha_ingreso')) continue;
      const value = (this.selectedUsuario as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => formData.append(key, v));
        } else {
          formData.append(key, value);
        }
      }
    }

    if (!this.isEditMode && this.password) {
      formData.append('password', this.password);
    }

    if (this.selectedFile) {
      formData.append('foto_perfil', this.selectedFile);
    }

    const url = this.isEditMode
      ? `http://127.0.0.1:8000/api/usuarios/${this.selectedUsuario.id}/`
      : 'http://127.0.0.1:8000/api/usuarios/';

    const request = this.isEditMode
      ? this.http.patch(url, formData)
      : this.http.post(url, formData);

    this.isSaving = true; // ⏳ INICIA SPINNER

    request.subscribe(
      () => {
        Swal.fire('Guardado', `Usuario ${this.isEditMode ? 'actualizado' : 'creado'} correctamente.`, 'success');
        this.loadUsuarios();
        this.showModal = false;
        this.isSaving = false; // ✅ DETIENE SPINNER
      },
      error => {
        this.isSaving = false;
        this.handleHttpError(error);
      }
    );
  }


  deleteUsuario(usuarioId: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(result => {
      if (result.isConfirmed) {
        this.http.delete(`http://127.0.0.1:8000/api/usuarios/${usuarioId}/`).subscribe(
          () => {
            Swal.fire('Eliminado', 'El usuario ha sido eliminado correctamente.', 'success');
            this.loadUsuarios();
          },
          error => this.handleHttpError(error)
        );
      }
    });
  }

  closeModal() {
    this.showModal = false;
    this.selectedFile = null;
    this.previewImage = null;
    this.password = '';
    this.rolSeleccionado = null;
  }

  private handleHttpError(error: any): void {
    Swal.fire('Error', 'Ha ocurrido un error. Inténtalo nuevamente.', 'error');
    console.error('HTTP Error:', error);
  }
}
