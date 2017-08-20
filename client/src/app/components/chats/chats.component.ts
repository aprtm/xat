import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms'

import { SessionService } from '../../services/session.service';
import { UsersService } from '../../services/users.service';
import { SocketService } from '../../services/socket.service';
import { ConversationsService } from '../../services/conversations.service';
import { TranslationService } from '../../services/translation.service';

import { User, Contact } from '../../interfaces/Users';
import { Conversation, Participant, Room, Chat} from '../../interfaces/Conversations'
import { Message } from '../../interfaces/Conversations';

interface ChatRoom extends Room{
  hasNewMessage?:boolean
}

let _ComponentName = 'chatsComponent';

@Component({
  selector: 'chat-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.css']
})
export class ChatsComponent implements OnInit {
  @Input() chats:ChatRoom[];
  @Output() chatSelected = new EventEmitter<Room>();
  @Output() chatListChanged = new EventEmitter<boolean>();

  private selectedChat:ChatRoom|null = null;
  private uninvitables:string[] = [];

  private friendInvitations:Participant[] = [];

  t10s

  constructor(  private usersService:UsersService,
                private sessionService:SessionService,
                private socketService:SocketService,
                private conversationService:ConversationsService,
                private translationService:TranslationService ) {
                  
                  this.t10s = this.translationService.currentTranslation[_ComponentName];

                }

  ngOnInit() {
    this.startChatList();
    this.uninvitables.push( this.sessionService.getSession().user.email )
    this.uninvitables.push( this.sessionService.getSession().user.username )
    
    this.translationService.I18N.subscribe(
      ( translation )=>{
        this.t10s = translation[_ComponentName];
      },
      err=>console.error
    );
    
  }

  startChatList(){

    this.socketService.messageObservable.subscribe(
      ( msg:Message )=>{

        for( let f = 0; f<this.chats.length; f++){
          if( this.selectedChat && this.selectedChat.id == msg.conversation_id ){
            this.chats[f].hasNewMessage = false;
            return;
          }
          if( this.chats[f].id == msg.conversation_id ){
            this.chats[f].hasNewMessage = true;
          }
        }
      },
      err => err
    );

  }

  openChat( i ){
    if( this.selectedChat && (this.selectedChat.id === this.chats[i].id) ){

    }else{
        console.log('Open chat:', this.chats[i].name);
        this.chats[i].hasNewMessage = false;
        this.selectedChat = this.chats[i];
        this.chatSelected.emit( this.chats[i] );
    }  

  }

  leaveChat( i ){
    // delete conversation from user document
    // delete participant from conversation document,
    this.usersService.leaveConversation( this.chats[i].id ).subscribe(
      (resp)=>{ 
        console.log('Deleted empty conversation?',resp.json().conversationDeleted)
        // if conversation was not deleted..notify all other uses
        // this.socketService.leaveConversation();
        // remove conversation from the current list and update view
        console.log('Discard chat:', this.chats[i].name);
        this.chatListChanged.emit(true);
        this.selectedChat = null;
        this.chatSelected.emit(null);
      },
      err=>err
    );

    // update leaveing user's chat view
    
    // if( this.selectedChat && (this.selectedChat.id === this.chats[i].id) ){
    // }

  }

  createNewChat( name?:string ){
    console.log( 'Creating new chat with', this.friendInvitations );   

    this.conversationService.createConversation( this.sessionService.getUserAsContact(), name ).subscribe(
      ( convoResp )=>{
        let newConvo:Conversation = convoResp.json();
        newConvo._id = newConvo._id['$oid'];
        console.log( 'Created conversation', (newConvo) );

        let newRoom:Room = {
          id: newConvo._id,
          name: newConvo.name,
          pictureUrl: newConvo.pictureUrl
        };

        this.selectedChat = newRoom;
        this.chatListChanged.emit( true );
        this.chatSelected.emit( newRoom );

        this.friendInvitations.forEach( friend =>{

          this.usersService.sendChatInvitation( newRoom, this.sessionService.getUserAsContact(), friend )
            
          .subscribe(
              ( inviteResp )=>{
                console.log('Notifying',friend.name);;
                this.socketService.sendChatInvitation( newRoom, this.sessionService.getUserAsContact(), friend  );
              },
              err=>err
            );

        } );
        
        this.friendInvitations = [];
      },

      err=>err

    );
  }

  inviteToChat( invitedFriends ){

    if( this.selectedChat ){

      this.friendInvitations.forEach( friend =>{
        
      this.usersService.sendChatInvitation( this.selectedChat, this.sessionService.getUserAsContact(), friend )
        
        .subscribe(
          ( inviteResp )=>{
            console.log('Notifying',friend.name);;
            this.socketService.sendChatInvitation( this.selectedChat, this.sessionService.getUserAsContact(), friend  );
          },
          err=>err
        );

      } );
      
      this.friendInvitations = [];

    }
  }

  addToInvitations( chatsForm:NgForm ){

    let invited:Contact = this.sessionService.getSession().user.friends.find( (friend:Contact) =>{
      return friend.name === chatsForm.value.friendToJoin ;
    } );

    let friend:Participant = {
      id: invited.id,
      name: invited.name
    }

    this.friendInvitations.push( friend );

    chatsForm.controls.friendToJoin.reset();
    
  }

  removeFromInvitations( friendIndex ){
    this.friendInvitations.splice(friendIndex,1);
  }

}