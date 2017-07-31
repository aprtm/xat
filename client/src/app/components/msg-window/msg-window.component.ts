import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms'

import { SessionService } from '../../services/session.service';
import { SocketService } from '../../services/socket.service';
import { ConversationsService } from '../../services/conversations.service';

import { Conversation, Message } from '../../interfaces/Conversations';
import { Contact } from '../../interfaces/Users';

import * as io from 'socket.io-client';

@Component({
  selector: 'chat-msg-window',
  templateUrl: './msg-window.component.html',
  styleUrls: ['./msg-window.component.css']
})
export class MsgWindowComponent implements OnInit, OnChanges {
  @Input() selectedConversation:Conversation;
  @Input() msgArr:Message[]
  //get socket connection to the server.

  private sender:Contact = this.sessionService.getUserAsContact();
  private receivers:Contact[] = [];
  
  constructor(  private sessionService:SessionService,
                private socketService:SocketService,
                private conversationsService:ConversationsService, ) {}

  onSubmit(form:NgForm){

    let messageTemplate:Message = {
      _id:'',
      author_id:this.sessionService.getUserAsContact().id,
      author_name:this.sessionService.getUserAsContact().name,
      conversation_id:this.selectedConversation._id,
      date:Date.now(),
      content:form.value.currentMessage,
      receivers: this.receivers
    };

    let messageIndex = this.msgArr.push( messageTemplate )-1;

    //Send message to the server and then broadcast it to receivers
    this.conversationsService.sendMessage(this.selectedConversation._id, form.value.currentMessage, this.receivers).subscribe(
      ( resp )=>{
        this.msgArr[messageIndex]._id = ( resp.text() );
        this.socketService.sendMessage( messageTemplate );
      },
      err => err
    );

    form.controls.currentMessage.reset();
  
  
  }

  ngOnInit() {

    //List receivers of this user's messages
    this.selectedConversation.participants.forEach((contact)=>{

      if( contact.id !== this.sessionService.getUserAsContact().id ){
        this.receivers.push(contact);
      }
      
    });

    //A message arrives
    this.socketService.messageObservable.subscribe(

      ( msg:Message )=>{
          this.onNewMessageArrived( msg )
      },
      msgErr=>console.log('Message arrival Error.',msgErr)

    );

  }

  ngOnChanges(changes){
    
  }

  onNewMessageArrived( msg:Message ){
    if( this.selectedConversation._id === msg.conversation_id ){

      this.conversationsService.confirmMessageReceived(msg._id, this.sessionService.getUserAsContact().id).subscribe(
        (  )=>{
          this.socketService.confirmMessageReceived( msg, this.sessionService.getUserAsContact().id );
        },
        confirmErr=>console.log('Message confirmation Error.',confirmErr)
      );

      this.msgArr.push(msg);
    
    }
  }


}
