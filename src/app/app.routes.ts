import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guards';
import { roleGuard } from './guards/role.guards';
import { loginGuard } from './guards/login.guards';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./shared/components/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Superadmin', 'Vendedor'] },
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./business/usuarios/usuarios.component').then(m => m.UsuariosComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Superadmin'] }
      },
      {
        path: 'roles',
        loadComponent: () => import('./business/roles/roles.component').then(m => m.RolesComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Superadmin', 'Vendedor'] }
      },
      {
        path: 'bitacoras',
        loadComponent: () => import('./business/bitacora/bitacora.component').then(m => m.BitacoraComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Superadmin', 'Vendedor'] }
      },
      {
        path: 'categorias',
        loadComponent: () => import('./business/categorias/categorias.component').then(m => m.CategoriasComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Superadmin', 'Vendedor'] }
      },
      {
        path: 'subcategorias',
        loadComponent: () => import('./business/subcategorias/subcategorias.component').then(m => m.SubcategoriasComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Superadmin', 'Vendedor'] }
      },
      {
        path: 'marcas',
        loadComponent: () => import('./business/marcas/marcas.component').then(m => m.MarcasComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Superadmin', 'Vendedor'] }
      },
      {
        path: 'campanas',
        loadComponent: () => import('./business/campanas/campanas.component').then(m => m.CampanasComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Superadmin', 'Vendedor'] }
      },
      {
        path: 'descuentos',
        loadComponent: () => import('./business/descuentos/descuentos.component').then(m => m.DescuentosComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Superadmin', 'Vendedor'] }
      },
      {
        path: 'carrito',
        loadComponent: () => import('./business/carrito/carrito.component').then(m => m.CarritoComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Superadmin', 'Vendedor'] }
      },
      {
        path: 'ventas',
        loadComponent: () => import('./business/ventas/ventas.component').then(m => m.VentasComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Superadmin', 'Vendedor'] }
      },
      {
        path: 'facturas',
        loadComponent: () => import('./business/facturas/facturas.component').then(m => m.FacturasComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Superadmin', 'Vendedor'] }
      },
      {
        path: 'tipos-pago',
        loadComponent: () => import('./business/tipos-pago/tipos-pago.component').then(m => m.TiposPagoComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Superadmin', 'Vendedor'] }
      },
      {
        path: 'productos',
        loadComponent: () => import('./business/productos/productos.component').then(m => m.ProductoComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Superadmin', 'Vendedor'] }
      },
      {
        path: 'stock',
        loadComponent: () => import('./business/stock/stock.component').then(m => m.StockComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Superadmin', 'Vendedor'] }
      },
      {
        path: 'movimientos',
        loadComponent: () => import('./business/movimientos-inventario/movimientos-inventario.component').then(m => m.MovimientoInventarioComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Superadmin', 'Vendedor'] }
      },
      {
        path: 'tipos-pago',
        loadComponent: () => import('./business/tipos-pago/tipos-pago.component').then(m => m.TiposPagoComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Superadmin', 'Vendedor'] }
      },
      {
        path: 'reportes/ventas',
        loadComponent: () => import('./business/reportes-ventas/reportes-ventas.component').then(m => m.ReportesVentasComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Superadmin', 'Vendedor'] }
      },

      {
        path: 'reportes/mas-vendidos',
        loadComponent: () => import('./business/reportes-mas-vendidos/reportes-mas-vendidos.component').then(m => m.ReportesMasVendidosComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Superadmin', 'Vendedor'] }
      },
      {
        path: 'reportes/inventario',
        loadComponent: () => import('./business/reportes-inventario/reportes-inventario.component').then(m => m.ReportesInventarioComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Superadmin', 'Vendedor'] }
      },

    ]
  },
  {
    path: 'login',
    loadComponent: () => import('./shared/components/login/login.component').then(m => m.LoginComponent),
    canActivate: [loginGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
