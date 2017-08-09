import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms'

import { SessionService } from '../../services/session.service';
import { UsersService } from '../../services/users.service';
import { SocketService } from '../../services/socket.service';
import { ConversationsService } from '../../services/conversations.service';

import { User, Contact } from '../../interfaces/Users';
import { Conversation, Participant, Room } from '../../interfaces/Conversations'
import { Message } from '../../interfaces/Conversations';

interface Chat extends Room{
  hasNewMessage:boolean
}
interface Invitation{
  friend:Contact,

}

@Component({
  selector: 'chat-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.css']
})
export class ChatsComponent implements OnInit {
  @Input() chats:Chat[];
  @Output() onSelected = new EventEmitter<Chat>();

  private selectedChat:Chat|null = null;
  private uninvitables:string[] = [];

  private friendInvitations:Participant[] = [];

  constructor(  private usersService:UsersService,
                private sessionService:SessionService,
                private socketService:SocketService,
                private conversationService: ConversationsService ) { }

  ngOnInit() {
    this.startChatList();
    this.uninvitables.push( this.sessionService.getSession().user.email )
    this.uninvitables.push( this.sessionService.getSession().user.username )
    
  }

startChatList(){

  this.socketService.chatInviteObservable.subscribe( (invitation)=>{
    console.log(invitation);
  } );

  // this.socketService.messageObservable.subscribe(
  //   ( msg:Message )=>{

  //     for( let f = 0; f<this.chat.length; f++){
  //       if( this.selectedChat && this.selectedChat.id == msg.author_id ){
  //         this.friends[f].hasNewMessage = false;
  //         return;
  //       }
  //       if( this.friends[f].id == msg.author_id ){
  //         this.friends[f].hasNewMessage = true;
  //       }
  //     }
  //   },
  //   err => err
  // );

  }

  onFormSubmit( form:NgForm ){
    console.log( 'Sending chat invite to:', form.value.friendToJoin );
    // this.usersService.sendChatInvite(  )
    //   .subscribe(
    //     ( resp )=> {
    //       if( resp.json() ){
    //         console.log('Friend request processed. Notifying contact.' );
    //         this.socketService.sendFriendRequest(resp.json(), this.sessionService.getUserAsContact())
    //         form.controls.friendToBe.reset();
    //       }else{
    //         form.controls.friendToBe.reset();
    //       }
    //     } ,
    //     ( err )=> err 
    //   );
  }

  openChat( i ){
    if( this.selectedChat && (this.selectedChat.id === this.chats[i].id) ){

    }else{
        console.log('Open chat:', this.chats[i].name);
        this.chats[i].hasNewMessage = false;
        this.selectedChat = this.chats[i];
        this.onSelected.emit( this.chats[i] );
    }  

  }

  createNewChat( ){
    console.log( 'Creating new chat with', this.friendInvitations );    
    this.conversationService.createConversation( this.sessionService.getUserAsContact() ).subscribe(
      ( convoResp )=>{
        let newConvo:Conversation = convoResp.json();
        newConvo._id = newConvo._id['$oid'];
        console.log( 'Created conversation', (newConvo) );

        let newChat:Room = {
          id: newConvo._id,
          name: newConvo.name,
          pictureUrl: newConvo.pictureUrl
        };
        
        this.friendInvitations.forEach( friend =>{
          this.usersService.sendChatInvitation( newChat, this.sessionService.getUserAsContact(), friend )
            .subscribe(
              ( inviteResp )=>{
                console.log('Notifying',friend.name);;
                this.socketService.sendChatInvitation( newChat, this.sessionService.getUserAsContact(), friend  );
              },
              err=>err
            );
        } );

      },
      err=>err
    );
  }

  inviteToChat( invitedFriends ){
    console.log( 'Inviting',invitedFriends,' to current chat',this.selectedChat );
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

// ====================================================

/*

import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms'

import { SessionService } from '../../services/session.service';
import { UsersService } from '../../services/users.service';
import { SocketService } from '../../services/socket.service';

import { User, Contact } from '../../interfaces/Users';
import { Message } from '../../interfaces/Conversations';

interface Friend extends Contact{
  hasNewMessage:boolean
}

@Component({
  selector: 'chat-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent implements OnInit {
  @Input() friends:Friend[];
  @Output() onSelected = new EventEmitter<Contact>();

  private selectedFriend:Friend|null = null;
  private unfriendables:string[];

  private currentUser;

  constructor(  private usersService:UsersService,
                private sessionService:SessionService,
                private socketService:SocketService ) { }

  ngOnInit() {
    this.startFriendList();
    this.unfriendables = [
      this.sessionService.getSession().user.username,
      this.sessionService.getSession().user.email
    ];

    this.currentUser = this.sessionService.getUserAsContact();
  }

  startFriendList(){

      this.socketService.messageObservable.subscribe(
        ( msg:Message )=>{

          for( let f = 0; f<this.friends.length; f++){
            if( this.selectedFriend && this.selectedFriend.id == msg.author_id ){
              this.friends[f].hasNewMessage = false;
              return;
            }
            if( this.friends[f].id == msg.author_id ){
              this.friends[f].hasNewMessage = true;
            }
          }
        },
        err => err
      );

  }

  onFormSubmit( form:NgForm ){
    console.log( 'Sending friend request to:', form.value.friendToBe );
    this.usersService.sendFriendRequest( form.value.friendToBe, this.sessionService.getUserAsContact() )
      .subscribe(
        ( resp )=> {
          if( resp.json() ){
            console.log('Friend request processed. Notifying contact.' );
            this.socketService.sendFriendRequest(resp.json(), this.sessionService.getUserAsContact())
            form.controls.friendToBe.reset();
          }else{
            form.controls.friendToBe.reset();
          }
        } ,
        ( err )=> err 
      );
  }

  openChat( i ){
    if( this.selectedFriend && (this.selectedFriend.id === this.friends[i].id) ){

    }else{
        console.log('Open chat with:', this.friends[i].name);
        this.friends[i].hasNewMessage = false;
        this.selectedFriend = this.friends[i];
        this.onSelected.emit( this.friends[i] );
    }  
  }

}

=============================================

*/