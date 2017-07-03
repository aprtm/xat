import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'

import { AppComponent } from './app.component';
import { MsgWindowComponent } from './components/msg-window/msg-window.component';
import { LoginComponent } from './components/login/login.component';

import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
const appRoutes:Routes = [
  {
    path:'home', component:HomeComponent },
  { path:'login', component:LoginComponent },
  { path:'chat', 
    component:MsgWindowComponent, 
    data:{title:'x@'} 
  },
  { path:'', redirectTo:'/home', pathMatch:'full'},
  { path:'**', redirectTo:'/home', pathMatch:'full'}
];

@NgModule({
  declarations: [
    AppComponent,
    MsgWindowComponent,
    LoginComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule, 
    RouterModule.forRoot(appRoutes, {enableTracing:true})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
