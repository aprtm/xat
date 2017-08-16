import { Component, OnInit } from '@angular/core';
import { SessionService } from './services/session.service';
import { SocketService } from './services/socket.service';

import { TranslationService } from './services/translation.service';

import { Router } from '@angular/router'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title:string = 'app'
  private t10s = {};

  constructor(  private sessionService:SessionService,
                private socketService:SocketService,
                private router:Router,
                private translationService:TranslationService ) {
                }
  
  logout(){
    let username = this.sessionService.getSession().user.username;
    this.socketService.disconnect( username );
    this.sessionService.endSession();
    this.router.navigateByUrl('/login');
  }

  ngOnInit(){

    this.translationService.I18N.subscribe( 
      ( translation )=>{
        this.t10s = translation.appComponent;
      },
      err=>console.error
    )

  }

  changeLanguage( lang:string ){
    this.translationService.changeLanguage(lang);
  }


}
