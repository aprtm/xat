import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { Contact } from '../interfaces/users'
import { Conversation, Participant, Message } from '../interfaces/conversations'

@Injectable()
export class ConversationsService {

  private header:Headers = new Headers( {'Content-Type':'application/json'} );

  constructor( private http:Http ) { }
  
  createConversation( creator:Participant, conversationName?:string ){
    console.log('Conv. Service - New chat', conversationName ,' with',creator);
    return this.http.post( '/api/conversations', {creator, conversationName}, {headers:this.header} );
  }

  getConversationAndMessages( cId:string ){
    return this.http.get( '/api/conversations/'+cId );
  }

  sendMessage( cId:string, message:string, toUsers:Contact[] ){
    return this.http.put( '/api/conversations/'+cId+'/messages', {message,toUsers}, {headers:this.header} );
  }

  addParticipant( cId:string, participant:Participant ){
    return this.http.post( 'api/conversations/'+cId+'/participants', participant, {headers:this.header} );
  }

  changeName( cId:string, name:string ){
    return this.http.put( 'api/conversations/'+cId+'name', name, {headers:this.header} );
  }

  confirmMessageReceived( msgId:string, receiver_id:string ){
    console.log(receiver_id,'convo service confirm reception',msgId)
    return this.http.post( 'api/conversations/messages/'+msgId+'/pending-receivers', {receiver_id} );
  }

}
