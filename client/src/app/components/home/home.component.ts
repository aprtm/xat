import { Component, OnInit } from '@angular/core';
import { Contact } from '../../interfaces/Users';
import { Conversation, Message, Chat } from '../../interfaces/Conversations';

import { SessionService } from '../../services/session.service';
import { TranslationService } from '../../services/translation.service';

let _ComponentName = 'homeComponent';

@Component({
  selector: 'chat-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private newFriend:Contact|null = null;
  private newChat:Chat|null = null;
  t10s;

  constructor(  private sessionService:SessionService,
                private translationService:TranslationService ) {

    this.t10s = this.translationService.currentTranslation[_ComponentName];

  }

  ngOnInit(){

    this.translationService.I18N.subscribe( 
      ( translation )=>{
        this.t10s = translation[_ComponentName];
      },
      err=>console.error
    );

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
