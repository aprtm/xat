import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';

import { SessionService } from '../services/session.service'

@Injectable()
export class SessionGuard implements CanActivate {

  constructor( private sessionService:SessionService, private router:Router ){}

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    if( this.sessionService.isActive() ){
      return true;
    }

    this.router.navigateByUrl('/login');
    return true;
  }
}
