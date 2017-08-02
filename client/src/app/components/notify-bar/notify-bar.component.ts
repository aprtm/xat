import { Component, OnInit } from '@angular/core';

import { SessionService } from '../../services/session.service';
import { SocketService } from '../../services/socket.service';
import { UsersService } from '../../services/users.service';
// import { ConversationsService } from '../../services/conversations.service';

// import { Conversation, Message } from '../../interfaces/Conversations';
import { Contact } from '../../interfaces/Users';

interface FriendRequest{
  contact:Contact
  text:string
}

@Component({
  selector: 'chat-notify-bar',
  templateUrl: './notify-bar.component.html',
  styleUrls: ['./notify-bar.component.css']
})
export class NotifyBarComponent implements OnInit {

  private notifications:FriendRequest[] = [];
  private viewNotifications:boolean = false;

  constructor( private socketService:SocketService, private usersService:UsersService) { }

  ngOnInit() {

    this.socketService.friendRequestObservable.subscribe(
      ( requester:Contact )=>{
        this.notifications.push({
          contact: requester,
          text:requester.name+' wants to chat!'
        });
      },
      err => err
    );

  }

  toggleNotifications(){
    this.viewNotifications = !this.viewNotifications;
  }

  acceptRequest( contact:Contact ){

  }

  discardRequest( contactId:string, notificationIndex:number ){
    this.usersService.rejectFriendRequest(contactId).subscribe(
      ()=>{
        console.log('Successfully removed request.');
        this.notifications.splice(notificationIndex, 1);
      },
      err => err
    );
  }

}
