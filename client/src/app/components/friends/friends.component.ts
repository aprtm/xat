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


  constructor(  private usersService:UsersService,
                private sessionService:SessionService,
                private socketService:SocketService ) { }

  ngOnInit() {
    this.startFriendList();
    
  }

  startFriendList(){

    this.friends.forEach( friend => {

      console.log( 'Updating data for', friend.name );
      this.usersService.getUser( friend.id ).subscribe(
        ( user ) => {
          friend.pictureUrl =
            (<Friend>user.json()).pictureUrl
              || 'http://lorempixel.com/45/45/people/';
          console.log( friend.name,'updated.' );
        },
        ( err ) => err
      );

      console.log( 'Subscribe to message notifications from', friend.name );
      this.socketService.messageObservable.subscribe(
        ( msg:Message )=>{

          if( this.selectedFriend && this.selectedFriend.id == msg.author_id ){
              console.log('Class off!');
              friend.hasNewMessage = false;
          }else if( msg.author_id == friend.id ){
              console.log('Class on!');
              friend.hasNewMessage = true;
          }
        },
        err => err
      );

    });

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
