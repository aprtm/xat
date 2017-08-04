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
  private unfriendables:string[] = [];

  private currentUser;

  constructor(  private usersService:UsersService,
                private sessionService:SessionService,
                private socketService:SocketService ) { }

  ngOnInit() {
    this.startFriendList();
    this.unfriendables.push( this.sessionService.getSession().user.username );
    this.unfriendables.push( this.sessionService.getSession().user.email );

    this.currentUser = this.sessionService.getUserAsContact();
  }

  startFriendList(){

      this.socketService.messageObservable.subscribe(
        ( msg:Message )=>{

          for( let f = 0; f<this.friends.length; f++){
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
