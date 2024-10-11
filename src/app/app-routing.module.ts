import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';
import { authGuard } from 'src/services/auth.guard';
import { MainComponent } from './pages/main/main.component';
import { MenuAdminComponent } from './pages/menu-admin/menu-admin.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { SubMenuAdminComponent } from './pages/sub-menu-admin/sub-menu-admin.component';
import { LogUsuariosComponent } from './pages/log-usuarios/log-usuarios.component';
import { CatalogosAdminComponent } from './pages/catalogos-admin/catalogos-admin.component';
import { ListaCatalogosComponent } from './pages/lista-catalogos/lista-catalogos.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        redirectTo: '/auth/signin',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./demo/dashboard/dashboard.component'),
        canActivate: [authGuard]
      },
      {
        path: 'basic',
        loadChildren: () => import('./demo/ui-elements/ui-basic/ui-basic.module').then((m) => m.UiBasicModule),
        canActivate: [authGuard]
      },
      {
        path: 'forms',
        loadChildren: () => import('./demo/pages/form-elements/form-elements.module').then((m) => m.FormElementsModule),
        canActivate: [authGuard]
      },
      {
        path: 'tables',
        loadChildren: () => import('./demo/pages/tables/tables.module').then((m) => m.TablesModule),
        canActivate: [authGuard]
      },
      {
        path: 'apexchart',
        loadComponent: () => import('./demo/chart/apex-chart/apex-chart.component'),
        canActivate: [authGuard]
      },
      {
        path: 'sample-page',
        loadComponent: () => import('./demo/extra/sample-page/sample-page.component'),
        canActivate: [authGuard]
      },
      //Agregados para el proyecto
      {
        path: 'menuAdmin',
        component: MenuAdminComponent,
        canActivate: [authGuard]
      },
      {
        path: 'usuariosAdmin',
        component: UsuariosComponent,
        canActivate: [authGuard]
      },
      {
        path: 'home',
        component: MainComponent,
        canActivate: [authGuard]
      },
      {
        path: 'subMenuAdmin',
        component: SubMenuAdminComponent,
        canActivate: [authGuard]
      },
      {
        path: 'movimientosUsuario',
        component: LogUsuariosComponent,
        canActivate: [authGuard]
      },
      {
        path: 'catalogosAdmin',
        component: ListaCatalogosComponent,
        canActivate: [authGuard]
      },
      {
        path: 'administraCatalogo',
        component: CatalogosAdminComponent,
        canActivate: [authGuard]
      },
      // Redirigir cualquier ruta no encontrada a PageNotFoundComponent
      {
        path: '**',
        component: PageNotFoundComponent,
        canActivate: [authGuard]
      }
    ]
  },
  {
    path: '',
    component: GuestComponent,
    children: [
      {
        path: 'auth',
        loadChildren: () => import('./demo/pages/authentication/authentication.module').then((m) => m.AuthenticationModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
