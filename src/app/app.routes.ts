import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

import { AppMainComponent } from './app.main.component';
import { AppComponent } from './app.component';
import { AppNotfoundComponent } from './pages/app.notfound.component';


import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';




import { LogoutComponent } from './logout.component';
import { NotificacionesComponent } from './pages/notificaciones/notificaciones.component';
import { ValidarComponent } from './pages/validar/validar.component';
import { AsignacionComponent } from './pages/asignacion/asignacion/asignacion.component';
import { ReasignacionComponent } from './pages/asignacion/reasignacion/reasignacion.component';
import { TraspasoComponent } from './pages/asignacion/traspaso/traspaso.component';

/********* */


const routes: Routes = [
  {
    // path: 'admin', component: AppComponent,
    path: 'admin', component: AppMainComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: HomeComponent },
      { path: 'noti', component: NotificacionesComponent},
      { path: 'validar', component: ValidarComponent },
      { path: 'asignacion', component: AsignacionComponent},
      { path: 'reasignacion', component: ReasignacionComponent },
      { path: 'reasignacion', component: ReasignacionComponent },
      { path: 'traspaso', component: TraspasoComponent },
      { path: 'home', component: HomeComponent },
    ]
  },
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'notfound', component: AppNotfoundComponent },
  { path: '**', redirectTo: '/notfound' },

];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
    // imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
