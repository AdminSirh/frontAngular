// Angular imports
import { Component, Input, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

// Project imports
import { NavigationService } from '../../../layout/admin/navigation/navigation';

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent implements OnInit {
  @Input() type: string;

  navigation: any[] = [];
  breadcrumbList: Array<any> = [];
  navigationList: any;

  constructor(
    private _router: Router,
    public nav: NavigationService,
    private titleService: Title
  ) {}

  ngOnInit() {
    this.nav.get().subscribe({
      next: (items) => {
        this.navigation = items;
        this.setBreadcrumb();
      },
      error: (err) => {
        console.error('Error al obtener los ítems de navegación', err);
        // Manejo de errores, como mostrar un mensaje o establecer valores predeterminados
        this.navigation = [];
        this.setBreadcrumb();
      }
    });
  }

  setBreadcrumb() {
    let routerUrl: string;
    this._router.events.subscribe((router: any) => {
      routerUrl = router.urlAfterRedirects;
      if (routerUrl && typeof routerUrl === 'string') {
        this.breadcrumbList.length = 0;
        const activeLink = routerUrl; 
        this.filterNavigation(activeLink);
      }
    });
  }

  filterNavigation(activeLink: string) {
    let result: any;
    let title = 'Welcome';

    if (this.navigation && Array.isArray(this.navigation)) {
      this.navigation.forEach((a) => {
        if (a.type === 'item' && 'url' in a && a.url === activeLink) {
          result = [
            {
              url: 'url' in a ? a.url : false,
              title: a.title,
              breadcrumbs: 'breadcrumbs' in a ? a.breadcrumbs : true,
              type: a.type
            }
          ];
          title = a.title;
        } else {
          if (a.type === 'group' && 'children' in a) {
            a.children.forEach((b) => {
              if (b.type === 'item' && 'url' in b && b.url === activeLink) {
                result = [
                  {
                    url: 'url' in b ? b.url : false,
                    title: b.title,
                    breadcrumbs: 'breadcrumbs' in b ? b.breadcrumbs : true,
                    type: b.type
                  }
                ];
                title = b.title;
              } else {
                if (b.type === 'collapse' && 'children' in b) {
                  b.children.forEach((c) => {
                    if (c.type === 'item' && 'url' in c && c.url === activeLink) {
                      result = [
                        {
                          url: 'url' in b ? b.url : false,
                          title: b.title,
                          breadcrumbs: 'breadcrumbs' in b ? b.breadcrumbs : true,
                          type: b.type
                        },
                        {
                          url: 'url' in c ? c.url : false,
                          title: c.title,
                          breadcrumbs: 'breadcrumbs' in c ? c.breadcrumbs : true,
                          type: c.type
                        }
                      ];
                      title = c.title;
                    }
                  });
                }
              }
            });
          }
        }
      });
    } else {
      console.warn('No hay datos de navegación disponibles');
      result = [];
    }

    this.navigationList = result;
    this.titleService.setTitle(title + ' | Proyecto Prueba');
  }
}
