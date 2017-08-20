import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms'

import { SessionService } from '../../services/session.service';
import { UsersService } from '../../services/users.service';
import { SocketService } from '../../services/socket.service';
import { TranslationService } from '../../services/translation.service';

import { User, Contact } from '../../interfaces/Users';
import { Message } from '../../interfaces/Conversations';

interface Friend extends Contact{
  hasNewMessage?:boolean
}

let _ComponentName = 'friendsComponent';

@Component({
  selector: 'chat-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent implements OnInit {
  @Input() friends:Friend[];
  @Output() friendSelected = new EventEmitter<Contact>();

  t10s

  private selectedFriend:Friend|null = null;
  private unfriendables:string[];

  private currentUser;

  constructor(  private usersService:UsersService,
                private sessionService:SessionService,
                private socketService:SocketService,
                private translationService:TranslationService ) {
                  this.t10s = this.translationService.currentTranslation[_ComponentName];
                }

  ngOnInit() {
    // this.startFriendList();
    this.unfriendables = [
      this.sessionService.getSession().user.username,
      this.sessionService.getSession().user.email
    ];

    this.currentUser = this.sessionService.getUserAsContact();

    this.translationService.I18N.subscribe(
      ( translation )=>{
        this.t10s = translation[_ComponentName];
      },
      err=>console.error
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
        this.friendSelected.emit( this.friends[i] );
    }  
  }

  removeFriend( friend ){
    console.log('Removing friend', friend);
    // remove friend from user document
    // remove participant from conversation document and check if conversation empty
    // remove conversation if no participants
    // notify participants if any
    // update views
  }

}