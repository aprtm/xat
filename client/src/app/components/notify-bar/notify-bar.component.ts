import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { SessionService } from '../../services/session.service';
import { SocketService } from '../../services/socket.service';
import { UsersService } from '../../services/users.service';
// import { ConversationsService } from '../../services/conversations.service';

// import { Conversation, Message } from '../../interfaces/Conversations';
import { Contact } from '../../interfaces/Users';

class FriendRequest{
  contact:Contact
  text:string
  constructor(contact, text){
    this.contact = contact;
    this.text = text;
  }
}

@Component({
  selector: 'chat-notify-bar',
  templateUrl: './notify-bar.component.html',
  styleUrls: ['./notify-bar.component.css']
})
export class NotifyBarComponent implements OnInit {
  // @Output() newFriend = new EventEmitter<Contact>();

  private notifications:FriendRequest[] = [];
  private viewNotifications:boolean = false;

  constructor(  private socketService:SocketService,
                private usersService:UsersService,
                private sessionService:SessionService) { }

  ngOnInit() {
    // console.log( this.sessionService.getSession().user )
    let usrRequests = this.sessionService.getSession().user.requests;

    if( usrRequests.length ){
      usrRequests.forEach( ( contact )=>{
        this.notifications.push( new FriendRequest( contact, contact.name+' wants to chat!' ) )
      } );
    }

    this.socketService.friendRequestObservable.subscribe(
      ( requester:Contact )=>{
        this.notifications.push( new FriendRequest( requester, requester.name+' wants to chat!' ) )
      },
      err => err
    );

  }

  toggleNotifications(){
    this.viewNotifications = !this.viewNotifications;
  }

  acceptRequest( notificationIndex:number ){
    console.log('Index:',notificationIndex);
    console.log('Array', this.notifications);
    let contact = this.notifications[notificationIndex].contact
    this.usersService.acceptFriendRequest( contact ).subscribe(
      ( res )=>{
        console.log( 'Request arrived to the server');
        this.notifications.splice(notificationIndex, 1);
        // this.newFriend.emit( contact );
      },
      err=>err
    );
  }

  discardRequest( notificationIndex:number ){
    let contact = this.notifications[notificationIndex].contact
    this.usersService.rejectFriendRequest( contact ).subscribe(
      ()=>{
        console.log('Successfully removed request.');
        this.notifications.splice(notificationIndex, 1);
      },
      err => err
    );
  }

}
