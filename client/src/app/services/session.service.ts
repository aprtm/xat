import { Injectable } from '@angular/core';
import { UsersService } from './users.service'

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';

import { User, Contact } from "../interfaces/Users";

@Injectable()
export class SessionService {
  
  //should transform into an observable in order to emit changes in current session
  private session:{user:User|null, active:boolean} = {user:null, active:false};

  constructor( private usersService:UsersService ) {
    
  }

  connectUser( user:User ){
    console.log('Connecting user',user)
    this.session.user = user;
    this.session.user._id = user._id['$oid'];
    this.session.active = true;
    console.log( 'User in session: ', this.session.user );
  }

  updateSession( onComplete?:()=>any ){
    console.log('Updating session...');
    this.usersService.getOwnSession( ).subscribe(
      ( resp ) => {
        console.log( 'Got session:', resp.json() )
        this.session = resp.json();
        this.session.user._id = resp.json().user._id['$oid'];
        onComplete && onComplete(); //if onComplete, onComplete()
        return this.session;
      },
      ( err ) => {
        console.log('Error while updating session. Terminate.');
        this.endSession()
      }
    );

  }

  endSession(){
    console.log('Logging out...');
    let sessionScope = this;
    this.usersService.logoutUser().subscribe(
      function onNext(resp){
        let lastUser = sessionScope.session.user.username;
        sessionScope.session.active = false;
        sessionScope.session.user = null;
        console.log(lastUser,'successfully logged out -->', sessionScope.session.user );
      
      }, function onError( err ){
        console.log('Error while logging out:', err);
      }
    
    );

  }

  getSession(){
    //this should be transformed into an observable
    return this.session;
  }

  getUserAsContact(){
    return <Contact>{
      id: this.session.user._id,
      name: this.session.user.username,
      pictureUrl: this.session.user.pictureUrl
    }
  }

  isActive(){
    return this.session.active;
  }

}
