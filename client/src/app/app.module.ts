import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { HttpModule } from '@angular/http'
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { MsgWindowComponent } from './components/msg-window/msg-window.component';
import { LoginComponent } from './components/login/login.component';
import { ManagerComponent } from './components/manager/manager.component';
import { HomeComponent } from './components/home/home.component';
import { SignupComponent } from './components/signup/signup.component';

import { UsersService } from './services/users.service';
import { SessionService } from './services/session.service';
import { SocketService } from './services/socket.service';
import { ConversationsService } from './services/conversations.service'
import { NotificationService } from './services/notification.service'

import { AsIterablePipe } from './pipes/asIterable.pipe';
import { SessionGuard } from './guards/session.guard';
import { FriendsComponent } from './components/friends/friends.component';
import { ChatsComponent } from './components/chats/chats.component';
import { NotifyBarComponent } from './components/notify-bar/notify-bar.component';
import { TextEqualValidatorDirective } from './directives/text-equal-validator.directive';

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
    ManagerComponent,
    FriendsComponent,
    ChatsComponent,
    NotifyBarComponent,
    TextEqualValidatorDirective
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule, 
    RouterModule.forRoot(appRoutes, {enableTracing:true})
  ],
  providers: [  UsersService,
                SessionService,
                SocketService,
                ConversationsService,
                NotificationService,
                SessionGuard ],
  bootstrap: [AppComponent]
})
export class AppModule { }
