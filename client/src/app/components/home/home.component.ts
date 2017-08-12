import { Component, OnInit } from '@angular/core';
import { Contact } from '../../interfaces/Users'
import { Conversation, Message, Chat} from '../../interfaces/Conversations'

@Component({
  selector: 'chat-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private newFriend:Contact|null = null;
  private newChat:Chat|null = null;

  constructor(  ) {

  }

  ngOnInit(){
  }

  setNewFriend( friend:Contact ){
    console.log('New friend detected');
    this.newFriend = friend;
  }

  setNewChat( chat:Chat ){
    console.log('New chat detected');
    this.newChat = chat;
  }

}
