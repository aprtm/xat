import { Injectable } from '@angular/core';
import { UsersService } from './users.service'

import { User, Contact } from "../interfaces/Users";

@Injectable()
export class SessionService {
  
  //should transform into an observable in order to emit changes in current session
  private session:{user:User|null, active:boolean} = {user:null, active:false};
  
  private mockSession:User = {
    _id:'1a1a1a1a1a1a1a1a',
    username:'MrMock',
    email:'mock@mockery.mk',
    pictureUrl:"http://lorempixel.com/45/45/people/",
    friends:[
      {
        id:"f1f1f1f1f1f1",
        name:"friend1",
        pictureUrl:"http://lorempixel.com/45/45/people/"
      },
      {
        id:"f2f2f2f2f2f2f2",
        name:"FRIEND2",
        pictureUrl:"http://lorempixel.com/45/45/people/"
      },
      {
        id:"f3f3f3f3f3f3f3",
        name:"FriEnD ",
        pictureUrl:"http://lorempixel.com/45/45/people/"
      }
    ],
    conversations:[
      {
        id:"c1c1c1c1c1c1",
        name:"CONVO1",
        pictureUrl:"http://lorempixel.com/45/45/abstract/"
      },
      {
        id:"c2c2c2c2c2c2",
        name:"conv2",
        pictureUrl:"http://lorempixel.com/45/45/abstract/"
      }
    ],
    requests:[],
    locale:'en'
  }

  constructor( private usersService:UsersService ) {this.session.user = this.mockSession;}

  connectUser( user:User ){
    this.session.user = user;
    this.session.user._id = user._id['$oid'];
    this.session.active = true;
    console.log( 'User in session: ', this.session.user );
  }

  updateSession( onComplete?:()=>any ){

    this.usersService.getUser( this.session.user._id ).subscribe(
      ( resp ) => {
        this.session.user = resp.json();
        this.session.user._id = resp.json()._id['$oid'];
        onComplete && onComplete();
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
