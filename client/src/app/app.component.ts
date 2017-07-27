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
    this.sessionService.endSession();
    this.socketService.disconnect( this.sessionService.getSession().user.username )
    this.router.navigateByUrl('/login');
  }

  ngOnInit(){
  
  }

}
