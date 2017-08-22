import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';

import { SessionService } from '../services/session.service';
import { UsersService } from '../services/users.service'

@Injectable()
export class SessionGuard implements CanActivate {

  constructor(  private usersService:UsersService,
                private sessionService:SessionService,
                private router:Router ){}

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    if( this.sessionService.isActive() ){
      console.log('A session already exists');
      return true;
    }else{
      console.log('Confirming if a session exists')
      return this.usersService.getOwnSession().switchMap( ( sessionResp )=>{
        let sessionActive = sessionResp.json().active;
        return new Observable((observer)=>{
          if( !sessionActive ){
            console.log('No session exists. Redirect to login.');
            this.router.navigateByUrl('/login');
            observer.next(false);
          }else{
            this.sessionService.updateSession(
              ()=>{
                console.log('Session updated!')
                observer.next(true);
              }
            );
          }
        });
      });
    }

    // this.sessionService.updateSession(
    //   ()=>{
    //     return this.sessionService.isActive();
    //   }
    // );

  //   if( this.sessionService.isActive() ){
  //     return true;
  //   }

  //   this.router.navigateByUrl('/login');
  //   return true;
  }
}
