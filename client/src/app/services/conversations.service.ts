import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { Contact } from '../interfaces/users'
import { Conversation, Participant, Message } from '../interfaces/conversations'

@Injectable()
export class ConversationsService {

  private header:Headers = new Headers( {'Content-Type':'application/json'} );

  constructor( private http:Http ) { }

  createConversation( participants:Contact[] ){
    let newConversation = {
      date: Date.now(),
      participants: participants
    }
    return this.http.post( '/api/conversations', newConversation, {headers:this.header} );
  }

  getConversation( cId:string ){
    return this.http.get( '/api/conversations/'+cId );
  }

  sendMessage( cId:string, message:string ){
    console.log('Sending',message,'to',cId);
    return this.http.put( '/api/conversations/'+cId+'/messages', {message}, {headers:this.header} );
  }

  addParticipant( cId:string, participant:Participant ){
    return this.http.put( 'api/conversations/'+cId+'/participants', participant, {headers:this.header} );
  }

  changeName( cId:string, name:string ){
    return this.http.put( 'api/conversations/'+cId+'name', name, {headers:this.header} );
  }

}
