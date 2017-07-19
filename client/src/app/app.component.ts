import { Component } from '@angular/core';
import { UsersService } from './services/users.service';
import { SessionService } from './services/session.service';
import { SocketService } from './services/socket.service';

import { Router } from '@angular/router'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title:string = 'app';

  constructor(  private usersService:UsersService,
                private sessionService:SessionService,
                private socketService:SocketService,
                private router:Router
              ) { }
  
  logout(){
    this.sessionService.endSession();
    this.socketService.disconnect( this.sessionService.getSession().user.username )
    this.router.navigateByUrl('/login');
  }

}
