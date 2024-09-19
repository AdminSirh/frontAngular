import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class QueryParamsService {
  private queryParams: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.queryParams.subscribe((params) => {
      this.queryParams = params;
    });
  }

  getParam(key: string): any {
    return this.queryParams[key];
  }

  setParam(key: string, value: any): void {
    this.queryParams[key] = value;
    this.router.navigate([], {
      queryParams: this.queryParams,
      queryParamsHandling: 'merge'
    });
  }
}
