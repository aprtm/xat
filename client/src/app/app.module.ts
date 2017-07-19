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

import { UsersService } from './services/users.service'
import { SessionService } from './services/session.service'

const appRoutes:Routes = [
  {
    path:'home', component:HomeComponent },
  { path:'login', component:LoginComponent },
  { path:'signup', component:SignupComponent},
  { path:'chat', 
    component:MsgWindowComponent, 
    data:{title:'x@'} 
  },
  { path:'', redirectTo:'/login', pathMatch:'full'},
  { path:'**', redirectTo:'/login', pathMatch:'full'}
];

@NgModule({
  declarations: [
    AppComponent,
    MsgWindowComponent,
    LoginComponent,
    HomeComponent,
    SignupComponent,
    AsIterablePipe
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule, 
    RouterModule.forRoot(appRoutes, {enableTracing:true})
  ],
  providers: [ UsersService, SessionService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
