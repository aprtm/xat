import { Component, OnInit, Input, OnChanges } from '@angular/core';

import { SessionService } from '../../services/session.service';
import { UsersService } from '../../services/users.service';
import { ConversationsService } from '../../services/conversations.service';
import { SocketService } from '../../services/socket.service';

import { User, Contact } from '../../interfaces/Users';
import { Conversation, Message, Chat, Room } from '../../interfaces/Conversations';


@Component({
  selector: 'chat-manager',
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.css']
})
export class ManagerComponent implements OnInit {
  @Input() newFriend:Contact;
  @Input() newChat:Chat;

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
    this.currentList = this.lists[1];
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

    this.socketService.newChatUserObservable.subscribe(
      ( {newPart, conversation} )=>{
        console.log(newPart.name, 'just joined', conversation.name,'!');
        this.updateListItems();
      },
      err=>err
    )

  }

  ngOnChanges( changes ){
    if( changes['newFriend'] ){
      this.sessionService.updateSession(()=>{
        console.log('newFriend changed. UpdateListItems');
        this.updateListItems();
      });
    }
    if( changes['newChat'] ){
      this.sessionService.updateSession(()=>{
        console.log('newChat changed. UpdateListItems');
        this.updateListItems();
      });
    }
  }

  switchList( index:number ){
    if( this.currentList.name !== this.lists[index].name ){
      this.currentList = this.lists[index];
      this.updateListItems();
      console.log( 'Viewing', this.currentList.name );
    }
    else{ console.log('List already selected'); }
    
  }

  updateListItems(){
    this.listItems = this.sessionService.getSession().user[this.currentList.userKey];
  }

  onElementSelected( element? ){
    if( !element ){
      console.log('Unselect chat.');  
      this.selectedConversation = null;
      this.currentMessages = [];
    }else{
      console.log('Selected chat',element.name);
      let convoId = element.conversation_id ? element.conversation_id:element.id;
      this.conversationsService.getConversationAndMessages( convoId ).subscribe(
        ( convo )=>{ 
          this.selectedConversation = convo.json().conversation;
          this.currentMessages = convo.json().messages;
          this.selectedConversation._id = convo.json().conversation._id['$oid'];
        },
        ( err ) => err
      )
    }
  }

  chatListChanged( ){
    this.sessionService.updateSession(()=>{
      this.updateListItems();
    });
  }


}