import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';


import { User, Contact } from '../interfaces/Users';
import { Message } from '../interfaces/Conversations';


import * as io from 'socket.io-client';

@Injectable()
export class SocketService {

  private _friendObservable:Observable<Contact>
  private _messageObservable:Observable<Message>
  private _friendRequestObservable:Observable<Contact>
  private _newFriendObservable:Observable<Contact>

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

      this.socket.on('chatMessage', ( message:Message )=>{
        observer.next( message );
      } );

    } );
    
    this._friendRequestObservable = new Observable( (observer)=> {
      this.socket.on('friendRequest', ( contact )=>{
        console.log(contact.name, 'wants to chat!');
        observer.next( contact );
      } );
    } );

    this._newFriendObservable = new Observable( (observer)=>{
      this.socket.on('friendRequestAccepted', ( friend )=>{
        console.log(friend.name, 'accepted your request!');
        observer.next( friend );
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

  get newFriendObservable(){
    return this._newFriendObservable;
  }

  connect( user:User ){
    this.socket = io('http://localhost:3000/users' );

    this.socket.emit('userConnected', user);

    return this.socket;
  }

  disconnect( username ){
    if( this.socket ){
      this.socket.emit('userDisconnected', username);
      this.socket = this.socket.disconnect();
      
      // this.socket = null;
    }
    return this.socket;
  }

  sendMessage( message:Message ){
    if( this.socket ){
      console.log('Socket sending message to all participants');
      this.socket.emit('chatMessage', message );
    }else{
      console.log('Socket not available to send message');
      return null;
    }
  }

  confirmMessageReceived( message:Message, receiverId:string ){
    if( this.socket ){
      console.log('Received', message._id.toString(),'sending confirmation...');
      this.socket.emit('messageReceived', {msg:message, receiverId} );
    }else{
      console.log('Socket not available to confirm message');
      return null;
    }
  }

  sendFriendRequest( toContact:Contact, fromContact:Contact ){
    if( this.socket ){
      this.socket.emit('friendRequest', {toContact, fromContact} );
      console.log(toContact.name, 'got the friend request.');
    }else{
      console.log('Socket not available to notify friend request.');
      return null;
    }
  }

  confirmNewFriend( requester:Contact, requestee:Contact ){
    if( this.socket ){
      this.socket.emit('friendRequestAccepted', {requester, requestee} );
      console.log( requester.name, 'and', requestee.name, 'can chat now.' );
    }else{
      console.log('Socket not available to confirm new friend.');
      return null;
    }
  }

}
