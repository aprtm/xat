import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { AppComponent } from './app.component';
import { MsgWindowComponent } from './components/msg-window/msg-window.component';
import { LoginComponent } from './components/login/login.component';

import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { SignupComponent } from './components/signup/signup.component';
import { AsIterablePipe } from './pipes/asIterable.pipe';

const appRoutes:Routes = [
  {
    path:'home', component:HomeComponent },
  { path:'login', component:LoginComponent },
  { path:'signup', component:SignupComponent},
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
    HomeComponent,
    SignupComponent,
    AsIterablePipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule, 
    RouterModule.forRoot(appRoutes, {enableTracing:true})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
