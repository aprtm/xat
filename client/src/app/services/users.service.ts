import { Http, Headers } from '@angular/http'
import { Observable } from 'rxjs/Observable'
import { Injectable } from '@angular/core';

import { SocketService } from './socket.service'
import { ConversationsService } from './conversations.service'

import { Contact } from '../interfaces/Users'
import { Room } from '../interfaces/Conversations'

interface Candidate{
  username:string
  password:string
  email:string
}

@Injectable()
export class UsersService {
  private header:Headers = new Headers( {'Content-Type':'application/json'} )
  
  constructor( public http:Http, private socketService:SocketService, private conversationsService:ConversationsService ) { 
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

  removeRequest( contact:Contact ){
    console.log('User service - DELETE request from', contact.id)
    return this.http.delete('/api/users/friendRequest/'+contact.id)
  }

  acceptFriendRequest( friend:Contact ){
    console.log('user service->accept', friend );
    return this.http.put('/api/users/friends',friend,{headers:this.header} );
  }
  
  sendChatInvitation( chat:Room, host:Contact ,friend:Contact ){
    console.log('users Service->',host.name, 'invites to', chat.name);
    return this.http.post('/api/users/chatInvitation', {chat, host, friend}, {headers:this.header})
  }

  acceptChatInvitation( contact:Contact ){
    console.log('user service->accept chat', contact.conversation_id, 'from', contact.name );
    return this.conversationsService.addParticipant(contact.conversation_id, contact);
  }

  leaveConversation( chatId:string ){
    console.log('user service-> leaving', chatId);
    return this.http.delete('/api/users/'+chatId);
  }

}
