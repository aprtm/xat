import { Component, OnInit } from '@angular/core';

import { SessionService } from '../../services/session.service';
import { UsersService } from '../../services/users.service'

import { User, Contact } from '../../interfaces/Users';
import { Conversation } from '../../interfaces/Conversations';


@Component({
  selector: 'chat-manager',
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.css']
})
export class ManagerComponent implements OnInit {

  // private currentFriends:User[] = [];
  // private currentUser:User = null;

  private currentList:User[]|Conversation[] = []
  private otherList:User[]|Conversation[] = [];
  private visibleList:string;
  private hiddenList:string;

  constructor( private sessionService:SessionService, private usersService:UsersService ) {
    
    if( sessionService.isActive() ){
      this.visibleList = 'Friends';
      this.hiddenList = 'Chats';
      this.currentList = this.sessionService.getSession().user.friends;
      this.otherList = this.sessionService.getSession().user.conversations;
    }

  }

  switchList(){
      let swapName = this.visibleList;
      this.visibleList = this.hiddenList;
      this.hiddenList = swapName;

      let swapList = this.currentList;
      this.currentList = this.otherList;
      this.otherList = swapList;
  }

  ngOnInit() {
  }

}
