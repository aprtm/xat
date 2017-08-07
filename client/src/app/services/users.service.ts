import { Http, Headers } from '@angular/http'
import { Observable } from 'rxjs/Observable'
import { Injectable } from '@angular/core';

import { SocketService } from './socket.service'

import { Contact } from '../interfaces/Users'

interface Candidate{
  username:string
  password:string
  email:string
}

@Injectable()
export class UsersService {
  private header:Headers = new Headers( {'Content-Type':'application/json'} )
  
  constructor( public http:Http, private socketService:SocketService ) { 
    this.valueExists = this.valueExists.bind(this);
  }

  addUser(user:Candidate){
    //return an observable with the post add user response
    console.log('Posting new user data...');
    return this.http.post( '/api/signup', user, {headers:this.header} )
  }

  valueExists( field:string, value:string){
    const endpoint = {
      username: '/api/signup/username/',
      email: '/api/signup/email/'
    };

    //return an observable with the get value response
    // console.log('Checking if ' + field + ' is available...');
    return this.http.get( endpoint[field] + value);
  }

  getUser( id:string ){
    
    return this.http.get('/api/users/'+id);
  }

  loginUser( credentials:{username:string, password:string} ){
    //return an observable with the post login response
    console.log('Posting user credentials...');
    return this.http.post( '/api/login/', credentials, {headers:this.header})
  }

  logoutUser(){
    //check if user is actually logged in
    return this.http.post('/api/logout', {});
  }

  sendFriendRequest( contactNameOrEmail:string, fromContact:Contact ){
    return this.http.post('/api/users/friendRequest', {contactNameOrEmail, fromContact}, {headers:this.header} )
  }

  rejectFriendRequest( contact:Contact ){
    console.log('User service - DELETE request from', contact.id)
    return this.http.delete('/api/users/friendRequest/'+contact.id)
  }

  acceptFriendRequest( friend:Contact ){
    console.log('user service accept', friend );
    return this.http.put('/api/users/friends',friend,{headers:this.header} );
  }
  // getFriendRequests(){
  //   return this.http.get('/api/users/friendRequest');
  // }

}
