import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import 'rxjs/add/operator/switchMap';

import { SessionService } from '../../services/session.service';
import { SocketService } from '../../services/socket.service';
import { UsersService } from '../../services/users.service';
import { ConversationsService } from '../../services/conversations.service';

import { Conversation, Participant } from '../../interfaces/Conversations';
import { Contact } from '../../interfaces/Users';

class Notification{
  userRequest:Contact
  text:string
  constructor(usrRequest, text){
    this.userRequest = usrRequest;
    this.text = text;
  }
}

@Component({
  selector: 'chat-notify-bar',
  templateUrl: './notify-bar.component.html',
  styleUrls: ['./notify-bar.component.css']
})
export class NotifyBarComponent implements OnInit {
  @Output() newFriendAdded = new EventEmitter<Contact>();

  private notifications:Notification[] = [];
  private viewNotifications:boolean = false;

  constructor(  private socketService:SocketService,
                private usersService:UsersService,
                private conversationsService:ConversationsService,
                private sessionService:SessionService) { }

  ngOnInit() {
    // console.log( this.sessionService.getSession().user )
    let usrRequests = this.sessionService.getSession().user.requests;

    if( usrRequests.length ){
      usrRequests.forEach( ( userRequest )=>{
        if( userRequest.conversation_id ){
          this.notifications.push( new Notification( userRequest,'Group invitation by '+userRequest.name) );  
        }else{
          this.notifications.push( new Notification( userRequest, userRequest.name+' wants to chat!' ) )
        }
        
      } );
    }

    this.socketService.friendRequestObservable.subscribe(
      ( requester:Contact )=>{
        this.notifications.push( new Notification( requester, requester.name+' wants to chat!' ) )
      },
      err => err
    );

    this.socketService.chatInviteObservable.subscribe(
      ( chatRequest )=>{
        this.notifications.push( new Notification( chatRequest,'Group invitation by '+chatRequest.name) );
      },
      err=>err
    );

  }

  toggleNotifications(){
    this.viewNotifications = !this.viewNotifications;
  }

  acceptRequest( notificationIndex:number ){

    let contact = this.notifications[notificationIndex].userRequest

    if( contact.conversation_id ){

      console.log( 'Accept chat invitation' );
      this.usersService.acceptChatInvitation( contact )
      
      .switchMap( ( resp )=>{
          console.log( 'Invitation accepted to join', resp.text() );
          return this.conversationsService.getConversationAndMessages( resp.text() )
        })
      
        .subscribe(
          convResp => {

            let participants = convResp.json().conversation.participants;
            let currentParticipant:Participant;
            console.log( 'participants', participants );

            for( let p =0; p<participants.length; p++ ){
              if( participants[p].id === this.sessionService.getUserAsContact().id ){
                currentParticipant = participants[p];
              }
            }

            this.socketService.confirmChatAccepted( currentParticipant , convResp.json().conversation )
            // this.newFriendAdded.emit( contact );
          },
          err => err
        );

        // !!!!!!!!!!!!!!!!!!close notification window if notifications length is 0
    }else{
      this.usersService.acceptFriendRequest( contact ).subscribe(
        ( res )=>{
          console.log( 'Accepted friend request');
          this.socketService.confirmNewFriend( contact, this.sessionService.getUserAsContact() );
          this.notifications.splice(notificationIndex, 1);
          this.newFriendAdded.emit( contact );
          //close notification window if notifications length is 0
        },
        err=>err
      );
    }
  }

  discardRequest( notificationIndex:number ){
    let contact = this.notifications[notificationIndex].userRequest
    this.usersService.rejectFriendRequest( contact ).subscribe(
      ()=>{
        console.log('Successfully removed request.');
        this.notifications.splice(notificationIndex, 1);
        //close notification window length is 0
      },
      err => err
    );
  }

}
