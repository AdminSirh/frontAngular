// angular import
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';

// project import
import { AppComponent } from './app.component';
import { SharedModule } from './theme/shared/shared.module';
import { GuestComponent } from './theme/layout/guest/guest.component';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { ConfigurationComponent } from './theme/layout/admin/configuration/configuration.component';
import { NavBarComponent } from './theme/layout/admin/nav-bar/nav-bar.component';
import { NavigationComponent } from './theme/layout/admin/navigation/navigation.component';
import { NavLeftComponent } from './theme/layout/admin/nav-bar/nav-left/nav-left.component';
import { NavRightComponent } from './theme/layout/admin/nav-bar/nav-right/nav-right.component';
import { NavContentComponent } from './theme/layout/admin/navigation/nav-content/nav-content.component';
import { NavLogoComponent } from './theme/layout/admin/navigation/nav-logo/nav-logo.component';
import { NavCollapseComponent } from './theme/layout/admin/navigation/nav-content/nav-collapse/nav-collapse.component';
import { NavGroupComponent } from './theme/layout/admin/navigation/nav-content/nav-group/nav-group.component';
import { NavItemComponent } from './theme/layout/admin/navigation/nav-content/nav-item/nav-item.component';
import { NavSearchComponent } from './theme/layout/admin/nav-bar/nav-left/nav-search/nav-search.component';
import { NavigationService } from './theme/layout/admin/navigation/navigation';
import { ToggleFullScreenDirective } from './theme/shared/components/full-screen/toggle-full-screen';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';
import { UserActivityService } from 'src/services/user-activity.service';
import { DataTablesModule } from 'angular-datatables';
//Interceptor para las peticiones con bearer token
import { authInterceptorProviders } from '../services/auth.interceptor';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    GuestComponent,
    AdminComponent,
    ConfigurationComponent,
    NavBarComponent,
    NavigationComponent,
    NavLeftComponent,
    NavRightComponent,
    NavContentComponent,
    NavLogoComponent,
    NavCollapseComponent,
    NavGroupComponent,
    NavItemComponent,
    NavSearchComponent,
    ToggleFullScreenDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ToastModule,
    ButtonModule,
    RippleModule,
    DataTablesModule
  ],
  providers: [
    NavigationService,
    authInterceptorProviders,
    MessageService,
    UserActivityService,
    //Se colocan providers para no tener problema de enrutamiento en el servidor
    { provide: LocationStrategy, useClass: HashLocationStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
