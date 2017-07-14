import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'

import { UsersService } from '../../services/users.service';

@Component({
  selector: 'chat-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private authError:string|null = null;

  constructor( private router:Router, private usersService:UsersService) { }
  ngOnInit() {

  }

  onSubmit( form ){
    console.log('Logging in... ');

    this.usersService.getUser( {username: form.value.username, password:form.value.password} )
      .subscribe((resp)=>{
        if( resp.status == 200){
          // console.log( resp.json().username );
          this.authError = null;
          this.router.navigateByUrl('/');
        }
      }, (err)=>{
        if( err.status === 401){
          this.authError = err._body;
        }else{
          this.authError = 'Unable to login. Try again in a minute.'
        }
      });
  }

}
