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
  //get socket connection to the server.

  private sender:Contact = this.sessionService.getUserAsContact();
  private receivers:Contact[] = [];

  msgArr:Message[]
  
  constructor(  private sessionService:SessionService,
                private socketService:SocketService,
                private conversationsService:ConversationsService, ) {}

  onSubmit(form:NgForm){
    this.conversationsService.sendMessage(this.selectedConversation._id, form.value.currentMessage).subscribe(
      ( resp )=>{
        this.socketService.sendMessage( resp.json(), this.receivers );
        this.msgArr.push( resp.json() );
      },
      err => err
    );

    form.controls.currentMessage.reset();
  }

  ngOnInit() {
    //List receivers of this user's messages
    this.selectedConversation.participants.forEach((contact)=>{
      this.receivers.push(contact);
    });

    this.socketService.messageObservable.subscribe(
      ( msg:Message )=>{
        if( this.selectedConversation._id === msg.conversation_id ){
          this.msgArr.push(msg);
        }
      }
    );

  }

  ngOnChanges(changes){
    this.msgArr = this.selectedConversation.messages;
  }

}
