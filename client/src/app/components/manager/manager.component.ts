import { Component, OnInit, Input, OnChanges } from '@angular/core';

import { SessionService } from '../../services/session.service';
import { UsersService } from '../../services/users.service';
import { ConversationsService } from '../../services/conversations.service';
import { SocketService } from '../../services/socket.service';
import { TranslationService } from '../../services/translation.service';

import { User, Contact } from '../../interfaces/Users';
import { Conversation, Message, Chat, Room } from '../../interfaces/Conversations';

let _ComponentName = 'managerComponent';

@Component({
  selector: 'chat-manager',
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.css']
})
export class ManagerComponent implements OnInit {
  @Input() newFriend:Contact
  @Input() newChat:Chat

  lists = []
  user = { human:'' }
  t10s

  private listItems:Contact[]|Conversation[] = []
  private currentList = 0

  private selectedConversation:Conversation|null
  private currentMessages:Message[]=[]

  constructor(  private sessionService:SessionService,
                private usersService:UsersService,
                private conversationsService:ConversationsService,
                private socketService:SocketService,
                private translationService:TranslationService ) {
                  
                  this.t10s = this.translationService.currentTranslation[_ComponentName];
                  this.user.human = this.sessionService.getUserAsContact().name;

                  if( this.sessionService.isActive() && !this.socketService.socketExists() ){
                    // No logout reconnect. A session is active but no socket exists
                    console.log('Session but not socket', this.sessionService.getSession().user);
                    this.socketService.connect( this.sessionService.getSession().user );
                  }

                }

  ngOnInit() {

    this.translationService.I18N.subscribe( 
      ( translation )=>{
        this.t10s = translation[_ComponentName];
      },
      err=>console.error
    );

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
    if( this.currentList !== index){
      this.currentList = index;
      this.updateListItems();
      console.log( 'Viewing list', this.currentList );
    }
    // if( this.currentList.name !== this.lists[index].name ){
    //   this.currentList = this.lists[index];
    //   this.updateListItems();
    //   console.log( 'Viewing', this.currentList.name );
    // }
    else{ console.log('List already selected') }
    
  }

  updateListItems(){
    let lists = ['conversations','friends'];
    this.listItems = this.sessionService.getSession().user[ lists[this.currentList] ];
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

  setNewFriend( friend:Contact ){
    console.log('New friend detected');
    this.newFriend = friend;
  }

  setNewChat( chat:Chat ){
    console.log('New chat detected');
    this.newChat = chat;
  }

}