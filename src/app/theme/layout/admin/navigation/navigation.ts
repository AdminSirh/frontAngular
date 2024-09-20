import { Injectable } from '@angular/core';
import { Observable, of, catchError, map } from 'rxjs';
import { CrudService } from 'src/services/crud.service';
import { LoginService } from 'src/services/login.service';

export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  function?: any;
  children?: NavigationItem[];
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private readonly endpoint = 'menu';
  private isLoggedIn: boolean = false;
  private user: any = null;

  constructor(
    private crudService: CrudService,
    private loginService: LoginService
  ) {
    // Inicializar el estado de autenticación y los ítems de navegación
    this.updateLoginStatus();
    if (this.isLoggedIn) {
      this.loadNavigationItems().subscribe();
    }

    // Suscribirse a los cambios en el estado de autenticación
    this.loginService.loginStatusSubjec.subscribe(() => {
      this.updateLoginStatus();
      console.log(this.isLoggedIn);
      if (this.isLoggedIn) {
        this.loadNavigationItems().subscribe();
      }
    });
  }

  private updateLoginStatus(): void {
    this.isLoggedIn = this.loginService.isLoggedIn();
    this.user = this.isLoggedIn ? this.loginService.getUser() : null;
  }

  private loadNavigationItems(): Observable<NavigationItem[]> {
    return this.crudService.getGenerico(this.endpoint).pipe(
      map((backendData: any[]) => {
        // Asegúrate de que backendData es un array
        if (!Array.isArray(backendData)) {
          throw new Error('Datos del backend no son un array');
        }

        const menuMap: { [key: number]: NavigationItem } = {};

        backendData.forEach((item: any) => {
          const menuId = item?.submenu?.menu?.id;
          const submenuId = item?.submenu?.id;

          if (!menuId || !submenuId) {
            console.warn('Datos de menú incompletos', item);
            return;
          }

          if (!menuMap[menuId]) {
            menuMap[menuId] = {
              id: menuId.toString(),
              title: item.submenu.menu.menuNombre,
              type: 'collapse',
              icon: item.submenu.menu.icono,
              children: []
            };
          }

          menuMap[menuId].children!.push({
            id: submenuId.toString(),
            title: item.submenu.submenuNombre,
            type: 'item',
            url: item.submenu.descripcion,
            icon: 'feather icon-chevrons-right'
          });
        });

        // Convertir el objeto menuMap en una lista y ordenar los ítems de menú por `orden`
        const sortedMenuItems = Object.values(menuMap).sort((a, b) => {
          const menuAOrden = backendData.find((item: any) => item.submenu.menu.id === Number(a.id))?.submenu.menu.orden || 0;
          const menuBOrden = backendData.find((item: any) => item.submenu.menu.id === Number(b.id))?.submenu.menu.orden || 0;
          return menuAOrden - menuBOrden;
        });

        // Ordenar los hijos (submenús) de cada ítem de menú por `orden`
        sortedMenuItems.forEach((menuItem) => {
          menuItem.children = menuItem.children!.sort((a, b) => {
            const submenuAOrden = backendData.find((item: any) => item.submenu.id === Number(a.id))?.submenu.orden || 0;
            const submenuBOrden = backendData.find((item: any) => item.submenu.id === Number(b.id))?.submenu.orden || 0;
            return submenuAOrden - submenuBOrden;
          });
        });

        return sortedMenuItems;
      }),
      catchError((error) => {
        console.error('Error cargando los ítems de navegación', error);
        return of([]); // Retorna un Observable vacío en caso de error
      })
    );
  }

  get(): Observable<NavigationItem[]> {
    if (!this.isLoggedIn) {
      return of([]); // Retorna un Observable vacío si no está logueado
    }
    return this.loadNavigationItems();
  }
}
