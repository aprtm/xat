import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'

import { UsersService } from '../../services/users.service';
import { SessionService } from '../../services/session.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'chat-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private authError:string|null = null;

  constructor(  private router:Router,
                private usersService:UsersService,
                private sessionService:SessionService,
                private socketService:SocketService ) { }

  ngOnInit() {

  }

  onSubmit( form ){
    console.log('Logging in... ');

    this.usersService.loginUser( {username: form.value.username, password:form.value.password} )
      .subscribe( ( user ) => {
        let userId = user.json()._id['$oid'];
        this.sessionService.connectUser( user.json() );
        console.log( 'User session active: ', this.sessionService.getSession().user.username );

        console.log( 'Connecting to room', userId );
        this.socketService.connect( this.sessionService.getSession().user );

        this.router.navigateByUrl('/');

      }, (err)=>{
        if( err.status === 401){
          this.authError = err._body;
        }else{
          this.authError = 'Unable to login. Try again in a minute.'
        }
      });
  }

}
