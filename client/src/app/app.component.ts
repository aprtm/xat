import { Component } from '@angular/core';
import { UsersService } from './services/users.service';
import { SessionService } from './services/session.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  constructor( private usersService:UsersService, private sessionService:SessionService ){}
  
  logout(){
    this.sessionService.endSession();
  }

}
