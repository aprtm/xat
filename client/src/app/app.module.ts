import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { HttpModule } from '@angular/http'

import { AppComponent } from './app.component';
import { MsgWindowComponent } from './components/msg-window/msg-window.component';
import { LoginComponent } from './components/login/login.component';

import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { SignupComponent } from './components/signup/signup.component';
import { AsIterablePipe } from './pipes/asIterable.pipe';

import { UsersService } from './services/users.service';
import { SessionService } from './services/session.service';
import { SocketService } from './services/socket.service';

import { SessionGuard } from './guards/session.guard';
import { UserPanelComponent } from './components/user-panel/user-panel.component'

const appRoutes:Routes = [
  { path:'', component:HomeComponent, canActivate:[SessionGuard] },
  { path:'home', component:HomeComponent },
  { path:'login', component:LoginComponent },
  { path:'signup', component:SignupComponent},
  { path:'chat', 
    component:MsgWindowComponent, 
    data:{title:'x@'} 
  },
  { path:'**', redirectTo:'/login', pathMatch:'full'}
];

@NgModule({
  declarations: [
    AppComponent,
    MsgWindowComponent,
    LoginComponent,
    HomeComponent,
    SignupComponent,
    AsIterablePipe,
    UserPanelComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule, 
    RouterModule.forRoot(appRoutes, {enableTracing:true})
  ],
  providers: [ UsersService, SessionService, SocketService, SessionGuard ],
  bootstrap: [AppComponent]
})
export class AppModule { }
