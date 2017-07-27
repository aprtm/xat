import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';


import { User, Contact } from '../interfaces/Users';
import { Message } from '../interfaces/Conversations';


import * as io from 'socket.io-client';

@Injectable()
export class SocketService {

  private _friendObservable:Observable<Contact>
  private _messageObservable:Observable<Message>
  private _friendRequestObservable:Observable<Message>

  private socket:SocketIOClient.Socket;
  //should transform to use getters and setters

  constructor() {

    this._friendObservable = new Observable( (observer)=>{

      this.socket.on('friendConnected', ( friend )=>{
          console.log(friend.name, 'connected!');
          observer.next( friend );
      } );

    } );

    this._messageObservable = new Observable( (observer)=>{

      this.socket.on('chatMessage', ( message )=>{
        observer.next( message );
      } );

    } );
    
    this._friendRequestObservable = new Observable( (observer)=> {
      this.socket.on('friendRequest', ( contact )=>{
        console.log(contact.name, 'wants to chat!');
        observer.next( contact );
      } );
    } );

  }

  get friendObservable(){
    return this._friendObservable;
  }

  get messageObservable(){
    return this._messageObservable;
  }

  get friendRequestObservable(){
    return this._friendRequestObservable;
  }

  connect( user:User ){
    if( !this.socket ){
      this.socket = io('http://localhost:3000/users');
    }

    this.socket.emit('userConnected', user);

    return this.socket;
  }

  disconnect( username='anon' ){
    if( this.socket ){
      this.socket.emit('userDisconnected', username);
      this.socket = this.socket.disconnect();
      // this.socket = null;
    }
    return this.socket;
  }

  sendMessage( message:string, toContacts:Contact[] ){
    if( this.socket ){
      this.socket.emit('chatMessage', message, toContacts );
    }else{
      return null;
    }
  }
  // friendRequest( usrId:string, friendId:string ){
    
  // }

}
