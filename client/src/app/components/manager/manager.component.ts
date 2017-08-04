import { Component, OnInit, Input, OnChanges } from '@angular/core';

import { SessionService } from '../../services/session.service';
import { UsersService } from '../../services/users.service';
import { ConversationsService } from '../../services/conversations.service';
import { SocketService } from '../../services/socket.service';

import { User, Contact } from '../../interfaces/Users';
import { Conversation, Participant, Message } from '../../interfaces/Conversations';


@Component({
  selector: 'chat-manager',
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.css']
})
export class ManagerComponent implements OnInit {
  @Input() newFriend:Contact;

  private lists = [
    {name:'Friends', userKey:'friends'},
    {name:'Chats', userKey:'conversations'}
  ]

  private listItems:Contact[]|Conversation[] = [];
  private currentList = this.lists[0];

  private selectedConversation:Conversation|null;
  private currentMessages:Message[]=[];

  constructor(  private sessionService:SessionService,
                private usersService:UsersService,
                private conversationsService:ConversationsService,
                private socketService:SocketService ) { }

  ngOnInit() {
    this.currentList = this.lists[0];
    this.updateListItems();

    this.socketService.newFriendObservable.subscribe(
      ( newFriend )=>{
        this.sessionService.updateSession( ()=>{
          console.log( 'Updated friend list to include', newFriend )
          this.updateListItems();
        } );
      },
      err=>err
    );

  }

  ngOnChanges( changes ){
    if( changes['newFriend'] ){
      this.sessionService.updateSession(()=>{
        this.updateListItems();
      });
    }
  }

  switchList( index:number ){
    this.currentList = this.lists[index];
    this.updateListItems();
    console.log( 'Viewing', this.currentList.name );
  }

  updateListItems(){
    this.listItems = this.sessionService.getSession().user[this.currentList.userKey];
  }

  onFriendSelected( friend ){
    console.log('Retrieve conversation',friend.conversation_id,'with',friend.name)
      this.conversationsService.getConversation(friend.conversation_id).subscribe(
        ( convo )=>{ 
          this.selectedConversation = convo.json().conversation;
          this.currentMessages = convo.json().messages;
          this.selectedConversation._id = convo.json().conversation._id['$oid'];
        },
        ( err ) => err
      )
  }

}