import { Component, OnInit } from '@angular/core';
import { SessionService } from './services/session.service';
import { SocketService } from './services/socket.service';

import { Router } from '@angular/router'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title:string = 'app';

  constructor(  private sessionService:SessionService,
                private socketService:SocketService,
                private router:Router ) {
  }
  
  logout(){
    let username = this.sessionService.getSession().user.username;
    this.socketService.disconnect( username );
    this.sessionService.endSession();
    this.router.navigateByUrl('/login');
  }

  ngOnInit(){
  
  }

}
