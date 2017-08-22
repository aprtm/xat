import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';


import { User, Contact } from '../interfaces/Users';
import { Message, Room, Participant, Conversation } from '../interfaces/Conversations';


import * as io from 'socket.io-client';

@Injectable()
export class SocketService {

  private _friendObservable:Observable<Contact>
  private _messageObservable:Observable<Message>
  private _friendRequestObservable:Observable<Contact>
  private _newFriendObservable:Observable<Contact>
  private _chatInviteObservable:Observable<Contact>
  private _newChatUserObservable:Observable<{newPart:Participant,conversation:Conversation}>

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

    this._chatInviteObservable = new Observable( (observer)=>{
      this.socket.on('chatInvitation', ( chatInvitation:Contact )=>{
        console.log('Chat',chatInvitation.conversation_id,'invitation from', chatInvitation.name);
        observer.next( chatInvitation );
      });
    })

    this._newChatUserObservable = new Observable( (observer)=>{
      this.socket.on('friendJoinedChat', ( {newPart, conversation} )=>{
        console.log('newPartObs',newPart.name,'joined',conversation.name);
        observer.next({newPart, conversation})
      });
    } )
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

  get chatInviteObservable(){
    return this._chatInviteObservable;
  }

  get newChatUserObservable(){
    return this._newChatUserObservable;
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
      this.socket.emit( 'friendRequestAccepted', {requester, requestee} );
      console.log( requester.name, 'and', requestee.name, 'can chat now.' );
    }else{
      console.log('Socket not available to confirm new friend.');
      return null;
    }
  }

  sendChatInvitation(chat:Room, fromContact:Participant, toContact:Participant){
    if( this.socket ){
      let chatRequest = {
          id: fromContact.id,
          name: fromContact.name,
          pictureUrl: fromContact.pictureUrl,
          conversation_id: chat.id
      }
      this.socket.emit( 'chatInvitation', {chatRequest, toContact} );
      console.log(fromContact.name, 'sent chat', chat.name, 'invitation to', toContact.name);
    }else{
      console.log('Socket not available to notify chat invitation.');
      return null;
    }
  }

  confirmChatAccepted( newPart:Participant, conversation:Conversation ){

    if( this.socket ){
      console.log( 'Joined to chat',conversation.name,'Notifying',conversation.participants );
      this.socket.emit('chatAccepted', {newPart, conversation} )
    }else{
      console.log('Socket not available to notify chat invitation.');
      return null;
    }
  }

  socketExists(){
    return this.socket ? true:false;
  }

}
