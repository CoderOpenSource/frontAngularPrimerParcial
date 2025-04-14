import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

interface Categoria {
  id: number;
  nombre: string;
}

interface Subcategoria {
  id: number;
  nombre: string;
  categoria: number;
}

interface ImagenProducto {
  id?: number;
  imagen?: File;
  previewUrl?: string | ArrayBuffer | null;
  descripcion?: string;
  orden?: number;
  file_key?: string;
}

interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  codigo_barra: string;
  precio_unitario: number;
  unidad_medida: string;
  subcategoria: number | null;
  estado: boolean;
  imagenes?: ImagenProducto[];
}

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductoComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  isLoading = false;
  isSaving = false;

  categorias: Categoria[] = [];
  subcategorias: Subcategoria[] = [];

  productos: Producto[] = [];
  filteredProductos: Producto[] = [];

  selectedProducto: Producto = this.getEmptyProducto();
  imagenes: ImagenProducto[] = [];
  imagenesAEliminar: number[] = [];

  imagenesProductoModal: ImagenProducto[] = [];
  showModal = false;
  showImagenesModal = false;
  isEditMode = false;

  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 5;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCategorias();
    this.loadSubcategorias();
    this.loadProductos();
  }

  getEmptyProducto(): Producto {
    return {
      id: 0,
      nombre: '',
      descripcion: null,
      codigo_barra: '',
      precio_unitario: 0,
      unidad_medida: '',
      subcategoria: null,
      estado: false,
      imagenes: []
    };
  }

  abrirImagenesModal(producto: Producto) {
    this.imagenesProductoModal = producto.imagenes?.map(img => ({
      ...img,
      previewUrl: (img as any).imagen_url || (typeof img.imagen === 'string' ? img.imagen : '')
    })) || [];
    this.showImagenesModal = true;
  }

  cerrarImagenesModal() {
    this.imagenesProductoModal = [];
    this.showImagenesModal = false;
  }

  loadCategorias() {
    this.http.get<Categoria[]>('http://127.0.0.1:8000/api/categorias/').subscribe(data => this.categorias = data);
  }

  loadSubcategorias() {
    this.http.get<Subcategoria[]>('http://127.0.0.1:8000/api/subcategorias/').subscribe(data => this.subcategorias = data);
  }

  loadProductos() {
    this.isLoading = true;
    this.http.get<Producto[]>('http://127.0.0.1:8000/api/productos/').subscribe({
      next: data => {
        this.productos = data;
        this.filteredProductos = data;
        this.isLoading = false;
      },
      error: error => {
        this.isLoading = false;
        this.handleHttpError(error);
      }
    });
  }

  filterProductos() {
    const term = this.searchTerm.toLowerCase();
    this.filteredProductos = this.productos.filter(p => p.nombre.toLowerCase().includes(term));
    this.currentPage = 1;
  }

  paginatedProductos(): Producto[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProductos.slice(start, start + this.itemsPerPage);
  }

  totalPages(): number {
    return Math.ceil(this.filteredProductos.length / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  addProducto() {
    this.selectedProducto = this.getEmptyProducto();
    this.imagenes = [];
    this.imagenesAEliminar = [];
    this.showModal = true;
    this.isEditMode = false;
  }

  editProducto(producto: Producto) {
    this.selectedProducto = { ...producto };
    this.imagenes = producto.imagenes?.map((img, index) => ({
      id: img.id,
      previewUrl: (img as any).imagen_url || (typeof img.imagen === 'string' ? img.imagen : ''),
      descripcion: img.descripcion || '',
      orden: img.orden ?? index
    })) || [];
    this.imagenesAEliminar = [];
    this.isEditMode = true;
    this.showModal = true;
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    Array.from(files).forEach((file, i) => {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenes.push({
          imagen: file,
          previewUrl: reader.result,
          orden: this.imagenes.length,
          file_key: `imagen_${this.imagenes.length}`
        });
      };
      reader.readAsDataURL(file);
    });
    this.fileInput.nativeElement.value = '';
  }

  marcarImagenParaEliminar(img: ImagenProducto) {
    if (img.id) {
      this.imagenesAEliminar.push(img.id);
      this.imagenes = this.imagenes.filter(i => i !== img);
    }
  }

  removeNewImage(img: ImagenProducto) {
    this.imagenes = this.imagenes.filter(i => i !== img);
  }

  saveProducto() {
    const formData = new FormData();

    formData.append('nombre', this.selectedProducto.nombre);
    formData.append('descripcion', this.selectedProducto.descripcion || '');
    formData.append('codigo_barra', this.selectedProducto.codigo_barra);
    formData.append('precio_unitario', this.selectedProducto.precio_unitario.toString());
    formData.append('unidad_medida', this.selectedProducto.unidad_medida);
    formData.append('subcategoria', String(this.selectedProducto.subcategoria));
    formData.append('estado', String(this.selectedProducto.estado));

    const imagenesMeta: { descripcion: string; orden: number; file_key: string }[] = [];

    this.imagenes.forEach((img, index) => {
      if (img.imagen instanceof File) {
        const fileKey = `imagen_${index}`;
        formData.append(fileKey, img.imagen);
        imagenesMeta.push({
          descripcion: img.descripcion || '',
          orden: img.orden ?? index,
          file_key: fileKey
        });
      }
    });

    formData.append('imagenes_meta', JSON.stringify(imagenesMeta));

    if (this.imagenesAEliminar.length > 0) {
      formData.append('imagenes_eliminadas', JSON.stringify(this.imagenesAEliminar));
    }

    const url = this.isEditMode
      ? `http://127.0.0.1:8000/api/productos/${this.selectedProducto.id}/`
      : 'http://127.0.0.1:8000/api/productos/';

    const request = this.isEditMode
      ? this.http.patch(url, formData)
      : this.http.post(url, formData);

    this.isSaving = true;

    request.subscribe({
      next: () => {
        Swal.fire('Guardado', `Producto ${this.isEditMode ? 'actualizado' : 'creado'} correctamente.`, 'success');
        this.loadProductos();
        this.closeModal();
        this.isSaving = false;
      },
      error: error => {
        this.isSaving = false;
        const errores = this.formatErrors(error?.error);
        Swal.fire('Error al guardar', errores, 'error');
      }
    });
  }

  deleteProducto(id: number) {
    Swal.fire({
      title: '¿Eliminar producto?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(result => {
      if (result.isConfirmed) {
        this.http.delete(`http://127.0.0.1:8000/api/productos/${id}/`).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El producto fue eliminado.', 'success');
            this.loadProductos();
          },
          error: err => this.handleHttpError(err)
        });
      }
    });
  }

  closeModal() {
    this.showModal = false;
    this.selectedProducto = this.getEmptyProducto();
    this.imagenes = [];
    this.imagenesAEliminar = [];
  }

  getSubcategoriaNombre(id: number | null): string {
    const sub = this.subcategorias.find(s => s.id === id);
    return sub ? sub.nombre : 'Sin subcategoría';
  }

  private handleHttpError(error: any) {
    console.error('HTTP Error:', error);
    const errores = this.formatErrors(error?.error);
    Swal.fire('Error', errores, 'error');
  }

  private formatErrors(error: any): string {
    if (!error || typeof error !== 'object') return 'Error desconocido';
    return Object.entries(error).map(([campo, detalles]) => {
      if (Array.isArray(detalles)) {
        return `<strong>${campo}:</strong> ${detalles.join(', ')}`;
      } else if (detalles && typeof detalles === 'object') {
        return `<strong>${campo}:</strong><br>` +
          Object.entries(detalles)
            .map(([subcampo, valor]) => `&nbsp;&nbsp;→ ${subcampo}: ${valor}`)
            .join('<br>');
      }
      return `<strong>${campo}:</strong> ${JSON.stringify(detalles)}`;
    }).join('<br>');
  }
}
