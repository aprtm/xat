import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';

import { SessionService } from '../../services/session.service';
import { UsersService } from '../../services/users.service';
import { SocketService } from '../../services/socket.service';

import { User, Contact } from '../../interfaces/Users';

@Component({
  selector: 'chat-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent implements OnInit {
  @Input() friends:Contact[];
  @Output() onSelected = new EventEmitter<Contact>();

  private selectedContact:Contact|null = null;


  constructor(  private usersService:UsersService,
                private sessionService:SessionService,
                private socketService:SocketService ) { }

  ngOnInit() {
    this.completeFriendsData();
  }

  completeFriendsData(){

    this.friends.forEach( friend => {
      this.usersService.getUser( friend.id ).subscribe(
        ( user ) => {
          friend.pictureUrl = ( <Contact>user.json() ).pictureUrl || 'http://lorempixel.com/45/45/people/';
        },
        ( err ) => err
      );
    });

  }

  onFormSubmit( form ){
    console.log( 'Sending friend request to:', form.value.friend );
    this.usersService.sendFriendRequest( form.value.friend );
  }

  openChat( i ){
    console.log('Open chat:', this.friends[i].name);
    this.onSelected.emit( this.friends[i] );
  }

}
