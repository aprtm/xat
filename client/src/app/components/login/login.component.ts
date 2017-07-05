import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'

@Component({
  selector: 'chat-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor( private router:Router) { }
  ngOnInit() {

  }

  onSubmit( form ){
    
    this.router.navigateByUrl('/chat');
  }

}
