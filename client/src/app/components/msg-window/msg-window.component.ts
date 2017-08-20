import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms'

import { SessionService } from '../../services/session.service';
import { SocketService } from '../../services/socket.service';
import { ConversationsService } from '../../services/conversations.service';
import { TranslationService } from '../../services/translation.service';

import { Conversation, Message } from '../../interfaces/Conversations';
import { Contact } from '../../interfaces/Users';

import * as io from 'socket.io-client';

let _ComponentName = 'msgWindowComponent';

@Component({
  selector: 'chat-msg-window',
  templateUrl: './msg-window.component.html',
  styleUrls: ['./msg-window.component.css']
})
export class MsgWindowComponent implements OnInit, OnChanges {
  @Input() selectedConversation:Conversation;
  @Input() msgArr:Message[]
  currentUser = this.sessionService.getUserAsContact();
  //get socket connection to the server.
  t10s

  private sender:Contact = this.currentUser;
  private receivers:Contact[] = [];
  
  constructor(  private sessionService:SessionService,
                private socketService:SocketService,
                private conversationsService:ConversationsService,
                private translationService:TranslationService ) {
                  this.t10s = this.translationService.currentTranslation[_ComponentName];
                }

  ngOnInit() {

    this.translationService.I18N.subscribe(
      ( translation )=>{
        this.t10s = translation[_ComponentName];
      },
      err=>console.error
    );

    //List receivers of this user's messages
    this.selectedConversation.participants.forEach((contact)=>{

      if( contact.id !== this.currentUser.id ){
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

  onSubmit(form:NgForm){

    let messageTemplate:Message = {
      _id:'',
      author_id:this.currentUser.id,
      author_name:this.currentUser.name,
      conversation_id:this.selectedConversation._id,
      date:Date.now(),
      content:form.value.currentMessage,
      receivers: this.receivers
    };

    let messageIndex = this.msgArr.push( messageTemplate )-1;

    //Send message to the server and then broadcast it to receivers
    console.log('Sending message to', this.receivers.length,'friends');
    this.conversationsService.sendMessage(this.selectedConversation._id, form.value.currentMessage, this.receivers).subscribe(
      ( resp )=>{
        this.msgArr[messageIndex]._id = ( resp.text() );
        this.socketService.sendMessage( messageTemplate );
      },
      err => err
    );

    form.controls.currentMessage.reset();

  }

  onNewMessageArrived( msg:Message ){

    if( this.selectedConversation._id === msg.conversation_id ){
      
      this.conversationsService.confirmMessageReceived(msg._id, this.currentUser.id).subscribe(
        (  )=>{
          this.socketService.confirmMessageReceived( msg, this.currentUser.id );
        },
        confirmErr=>console.log('Message confirmation Error.',confirmErr)
      );

      this.msgArr.push(msg);
    
    }

  }
}